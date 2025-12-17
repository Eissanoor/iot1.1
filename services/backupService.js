const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { google } = require('googleapis');
const prisma = require('../prisma/client');

const BACKUP_ENABLED = process.env.DB_BACKUP_ENABLED !== 'false';
const CRON_EXPRESSION = process.env.DB_BACKUP_CRON || '0 3 * * 1'; // Default: every Monday at 03:00 UTC
const TIMEZONE = process.env.DB_BACKUP_TZ || 'UTC';
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
// Clean and trim the custom backup path (remove quotes, whitespace, and line breaks)
const cleanBackupPath = (rawPath) => {
  if (!rawPath) return undefined;
  
  // Remove leading/trailing quotes
  let cleaned = rawPath.trim().replace(/^["']|["']$/g, '').trim();
  
  // Remove line breaks and carriage returns - take only the first line
  cleaned = cleaned.split(/[\r\n]+/)[0].trim();
  
  // Remove any trailing text that looks like error messages or comments
  // Stop at patterns like "ALTERNATIVE", "SOLUTIONS", "RECOMMENDED", etc.
  const stopPatterns = [
    /\s+ALTERNATIVE\s+/i,
    /\s+SOLUTIONS?\s*:?/i,
    /\s+RECOMMENDED\s+/i,
    /\s+GOOGLE_SERVICE_ACCOUNT/i,
    /\s+1\.\s+/,
    /\s+2\.\s+/,
    /\s+3\.\s+/,
  ];
  
  for (const pattern of stopPatterns) {
    const match = cleaned.search(pattern);
    if (match > 0) {
      cleaned = cleaned.substring(0, match).trim();
      break;
    }
  }
  
  return cleaned || undefined;
};

const CUSTOM_BACKUP_PATH = cleanBackupPath(process.env.DB_BACKUP_DISK_PATH);

// Debug: Log the parsed backup path (first 100 chars to avoid logging sensitive data)
if (CUSTOM_BACKUP_PATH) {
  console.log(`[DB BACKUP] Parsed backup path: "${CUSTOM_BACKUP_PATH.substring(0, 100)}${CUSTOM_BACKUP_PATH.length > 100 ? '...' : ''}"`);
  console.log(`[DB BACKUP] Path length: ${CUSTOM_BACKUP_PATH.length} characters`);
}

const ensureBackupDir = async () => {
  await fs.promises.mkdir(BACKUP_DIR, { recursive: true });
};

const ensureCustomBackupDir = async (customPath) => {
  if (customPath) {
    // Validate path format - check for common issues
    if (customPath.includes('\n') || customPath.includes('\r')) {
      throw new Error(`Invalid backup path: contains line breaks. Please check your .env file. Path value: "${customPath.substring(0, 100)}..."`);
    }
    
    // Check if path looks malformed (contains quotes in the middle or other env vars)
    if (customPath.match(/["'][^"']*["']/g) && customPath.match(/["'][^"']*["']/g).length > 1) {
      throw new Error(`Invalid backup path: contains multiple quoted sections. Please check your .env file. Path value: "${customPath.substring(0, 100)}..."`);
    }
    
    // Skip local file system checks for UNC paths (\\server\share)
    // UNC paths can only be verified from SQL Server's perspective
    if (customPath.startsWith('\\\\')) {
      console.log(`[DB BACKUP] Using UNC path: ${customPath}`);
      console.log(`[DB BACKUP] Note: UNC paths will be verified by SQL Server directly.`);
      return; // Skip local checks for UNC paths
    }
    
    // For Windows absolute paths, ensure they start with a drive letter
    if (/^[A-Za-z]:/.test(customPath)) {
      // This is a Windows absolute path - SQL Server needs to access it, not Node.js
      // So we skip local file system checks for remote SQL Server
      console.log(`[DB BACKUP] Using Windows absolute path: ${customPath}`);
      console.log(`[DB BACKUP] Note: This path must exist on the SQL Server machine (${process.env.DB_SERVER || 'SQL Server'}), not the Node.js app machine.`);
      return; // Skip local checks - SQL Server will handle the path validation
    }
    
    try {
      // Check if directory exists (only for local relative paths)
      try {
        const stats = await fs.promises.stat(customPath);
        if (!stats.isDirectory()) {
          throw new Error(`${customPath} exists but is not a directory`);
        }
        console.log(`[DB BACKUP] Custom backup directory exists: ${customPath}`);
      } catch (statError) {
        // Directory doesn't exist, try to create it
        if (statError.code === 'ENOENT') {
          await fs.promises.mkdir(customPath, { recursive: true });
          console.log(`[DB BACKUP] Created custom backup directory: ${customPath}`);
        } else {
          throw statError;
        }
      }
      
      // Verify write permissions by attempting to create a test file
      const testFile = path.join(customPath, '.backup-test');
      try {
        await fs.promises.writeFile(testFile, 'test', { flag: 'w' });
        await fs.promises.unlink(testFile);
        console.log(`[DB BACKUP] Verified write permissions for: ${customPath}`);
      } catch (writeError) {
        console.warn(`[DB BACKUP] Warning: Cannot write to ${customPath}:`, writeError.message);
        console.warn(`[DB BACKUP] SQL Server may not have write permissions to this directory.`);
        console.warn(`[DB BACKUP] Please ensure the SQL Server service account has full control over this directory.`);
      }
    } catch (error) {
      console.warn(`[DB BACKUP] Warning: Issue with custom backup directory ${customPath}:`, error.message);
      console.warn(`[DB BACKUP] Note: SQL Server needs to access this path on the SQL Server machine, not the Node.js app machine.`);
      console.warn(`[DB BACKUP] If SQL Server is remote, ensure the path exists on the SQL Server machine.`);
      // Don't throw here - let SQL Server handle the error with a clearer message
    }
  }
};

const getDriveClient = () => {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY
    ? process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!clientEmail || !privateKey) {
    const missing = [];
    if (!clientEmail) missing.push('GOOGLE_DRIVE_CLIENT_EMAIL');
    if (!privateKey) missing.push('GOOGLE_DRIVE_PRIVATE_KEY');
    console.warn(`[DB BACKUP] Google Drive credentials not set; skipping upload.`);
    console.warn(`[DB BACKUP] Missing environment variables: ${missing.join(', ')}`);
    console.warn(`[DB BACKUP] See docs/google-drive-setup.md for setup instructions.`);
    return null;
  }

  const scopes = ['https://www.googleapis.com/auth/drive.file'];
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes,
  });

  return google.drive({ version: 'v3', auth });
};

const isFileAccessibleLocally = async (filePath) => {
  try {
    // Check if file exists and is accessible
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

const uploadToGoogleDrive = async (filePath, fileName) => {
  const drive = getDriveClient();
  if (!drive) {
    console.log('[DB BACKUP] Google Drive credentials not configured, skipping upload');
    return null;
  }

  // Check if file is accessible locally (not on remote SQL Server)
  const isAccessible = await isFileAccessibleLocally(filePath);
  if (!isAccessible) {
    console.warn(`[DB BACKUP] Backup file is on remote SQL Server (${filePath}), cannot upload to Google Drive`);
    console.warn(`[DB BACKUP] To enable Google Drive upload, use a local backup path or copy the file locally first`);
    return null;
  }

  // Extract folder ID from URL if a full URL was provided
  let folderId = process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID;
  if (folderId) {
    // Check if it's a full URL and extract the folder ID
    const urlMatch = folderId.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (urlMatch) {
      folderId = urlMatch[1];
      console.log(`[DB BACKUP] Extracted folder ID from URL: ${folderId}`);
    }
    // Remove query parameters if present (e.g., ?usp=sharing)
    folderId = folderId.split('?')[0].trim();
  }

  // Verify folder access if folder ID is provided
  if (folderId) {
    try {
      const folderInfo = await drive.files.get({
        fileId: folderId,
        fields: 'id, name, mimeType',
      });
      console.log(`[DB BACKUP] Verified folder access: ${folderInfo.data.name} (${folderId})`);
    } catch (folderError) {
      console.error(`[DB BACKUP] Cannot access folder ${folderId}: ${folderError.message}`);
      console.error('[DB BACKUP] Please verify:');
      console.error('[DB BACKUP] 1. The folder is shared with your service account email');
      console.error('[DB BACKUP] 2. The service account has Editor permissions');
      console.error('[DB BACKUP] 3. The folder ID is correct');
      throw new Error(`Folder access denied: ${folderError.message}`);
    }
  }
  
  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined,
  };

  try {
    const media = {
      mimeType: 'application/octet-stream',
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name, webViewLink',
      supportsAllDrives: true, // Important for shared drives
    });

    return response.data;
  } catch (error) {
    // Handle Google Drive upload errors gracefully
    if (error.code === 'ERR_OSSL_UNSUPPORTED' || error.message?.includes('DECODER routines')) {
      console.error('[DB BACKUP] Google Drive upload failed: OpenSSL/decoder error');
      console.error('[DB BACKUP] This may be due to an incompatible private key format or Node.js version');
      console.error('[DB BACKUP] Please check your GOOGLE_DRIVE_PRIVATE_KEY format');
      console.error('[DB BACKUP] Backup file was created successfully, but upload was skipped');
    } else if (error.message?.includes('File not found') || error.code === 404) {
      console.error(`[DB BACKUP] Google Drive upload failed: ${error.message}`);
      console.error('[DB BACKUP] The specified folder was not found or is not accessible.');
      console.error('[DB BACKUP] Please check:');
      console.error('[DB BACKUP] 1. The GOOGLE_DRIVE_BACKUP_FOLDER_ID is correct (should be just the folder ID, not the full URL)');
      console.error('[DB BACKUP] 2. The folder was shared with your service account email');
      console.error('[DB BACKUP] 3. The service account has Editor permissions on the folder');
      console.error('[DB BACKUP] Example: GOOGLE_DRIVE_BACKUP_FOLDER_ID=1PkekRd_RIdMLm8yeXjA8rhv_y1U1CYS6');
      console.error('[DB BACKUP] (Not the full URL: https://drive.google.com/drive/folders/...)');
      console.error('[DB BACKUP] Backup file was created successfully, but upload failed');
    } else if (error.message?.includes('storage quota') || error.message?.includes('Service Accounts do not have storage')) {
      console.error(`[DB BACKUP] Google Drive upload failed: ${error.message}`);
      console.error('[DB BACKUP] Service accounts cannot have their own storage. The folder must be:');
      console.error('[DB BACKUP] 1. Created in YOUR personal Google Drive (not the service account\'s drive)');
      console.error('[DB BACKUP] 2. Shared with your service account email (Editor permissions)');
      console.error('[DB BACKUP] 3. The folder ID must point to a folder in your personal Drive that is shared with the service account');
      console.error('[DB BACKUP] Steps to fix:');
      console.error('[DB BACKUP] - Go to YOUR Google Drive (your personal account)');
      console.error('[DB BACKUP] - Create or use an existing folder');
      console.error('[DB BACKUP] - Share it with: ' + (process.env.GOOGLE_DRIVE_CLIENT_EMAIL || 'your-service-account@...'));
      console.error('[DB BACKUP] - Give Editor permissions');
      console.error('[DB BACKUP] - Use that folder\'s ID in GOOGLE_DRIVE_BACKUP_FOLDER_ID');
      console.error('[DB BACKUP] Backup file was created successfully, but upload failed');
    } else {
      console.error(`[DB BACKUP] Google Drive upload failed: ${error.message}`);
      console.error('[DB BACKUP] Backup file was created successfully, but upload failed');
    }
    return null; // Don't throw - backup was successful, upload is optional
  }
};

const checkSqlServerPathAccess = async (targetPath) => {
  try {
    // Ensure we have a directory path (remove filename if present)
    let dirPath = targetPath.replace(/\\[^\\]*$/, ''); // Get directory path without filename
    // Remove trailing backslash for consistency
    dirPath = dirPath.replace(/\\+$/, '');
    
    if (!dirPath) {
      return null;
    }
    
    // Escape single quotes for SQL (replace ' with '')
    const escapedPath = dirPath.replace(/'/g, "''");
    // Normalize backslashes for SQL (double them)
    const normalizedDirPath = escapedPath.replace(/\\/g, '\\\\');
    
    // Try to check if SQL Server can see the directory
    // Using xp_fileexist which returns 1 if path exists, 0 if not
    const checkQuery = `
      DECLARE @Path NVARCHAR(500) = '${normalizedDirPath}';
      DECLARE @FileExists INT;
      EXEC master.dbo.xp_fileexist @Path, @FileExists OUTPUT;
      SELECT @FileExists AS PathExists;
    `;
    
    const result = await prisma.$queryRawUnsafe(checkQuery);
    const pathExists = result[0]?.PathExists === 1;
    
    if (pathExists) {
      console.log(`[DB BACKUP] Path access check: ${dirPath} exists on SQL Server`);
    } else {
      console.warn(`[DB BACKUP] Path access check: ${dirPath} does not exist or is not accessible on SQL Server`);
    }
    
    return pathExists;
  } catch (error) {
    console.warn(`[DB BACKUP] Could not verify SQL Server path access for ${targetPath}:`, error.message);
    return null; // Return null if check fails (we'll still try the backup)
  }
};

const createSqlServerBackup = async () => {
  await ensureBackupDir();
  
  // Ensure custom backup directory exists if one is configured
  if (CUSTOM_BACKUP_PATH) {
    await ensureCustomBackupDir(CUSTOM_BACKUP_PATH);
  }

  const [{ dbName }] = await prisma.$queryRawUnsafe('SELECT DB_NAME() AS dbName');
  if (!dbName) {
    throw new Error('Unable to determine database name for backup');
  }
  
  // Get SQL Server machine info for diagnostics (using CAST to avoid SQL_VARIANT issues)
  let serverInfo = {};
  let defaultBackupPath = null;
  let isExpressEdition = false;
  try {
    const [info] = await prisma.$queryRawUnsafe(`
      SELECT 
        @@SERVERNAME AS ServerName,
        CAST(SERVERPROPERTY('MachineName') AS NVARCHAR(128)) AS MachineName,
        CAST(SERVERPROPERTY('InstanceName') AS NVARCHAR(128)) AS InstanceName,
        CAST(SERVERPROPERTY('InstanceDefaultBackupPath') AS NVARCHAR(260)) AS DefaultBackupPath,
        CAST(SERVERPROPERTY('Edition') AS NVARCHAR(128)) AS Edition
    `);
    serverInfo = info || {};
    defaultBackupPath = info?.DefaultBackupPath || null;
    const edition = info?.Edition || '';
    isExpressEdition = edition.toLowerCase().includes('express');
    console.log(`[DB BACKUP] SQL Server: ${serverInfo.ServerName || 'Unknown'} on ${serverInfo.MachineName || 'Unknown'}`);
    console.log(`[DB BACKUP] SQL Server Edition: ${edition || 'Unknown'}`);
    if (defaultBackupPath) {
      console.log(`[DB BACKUP] SQL Server default backup path: ${defaultBackupPath}`);
    }
    if (isExpressEdition) {
      console.log(`[DB BACKUP] Express Edition detected - compression will be disabled (not supported)`);
    }
  } catch (error) {
    console.warn(`[DB BACKUP] Could not get SQL Server info:`, error.message);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `${dbName || 'database'}-${timestamp}.bak`;
  // Use override path when the SQL Server instance cannot access the app's local filesystem (e.g., remote DB server)
  // Handle UNC paths and regular paths differently
  let backupPath;
  if (CUSTOM_BACKUP_PATH) {
    // Normalize the custom path - ensure it's clean
    let normalizedCustomPath = CUSTOM_BACKUP_PATH.trim();
    
    // Fix UNC path format if needed (ensure double backslashes)
    if (normalizedCustomPath.startsWith('\\') && !normalizedCustomPath.startsWith('\\\\')) {
      normalizedCustomPath = '\\\\' + normalizedCustomPath.substring(1);
    }
    
    // For UNC paths, don't use path.join (it breaks UNC paths)
    if (normalizedCustomPath.startsWith('\\\\')) {
      backupPath = normalizedCustomPath.endsWith('\\') 
        ? `${normalizedCustomPath}${backupFileName}`
        : `${normalizedCustomPath}\\${backupFileName}`;
    } else {
      // For Windows absolute paths (C:\) or relative paths, use path.join
      backupPath = path.join(normalizedCustomPath, backupFileName);
    }
  } else {
    backupPath = path.join(BACKUP_DIR, backupFileName);
  }

  // Check if SQL Server can access the path before attempting backup
  if (CUSTOM_BACKUP_PATH) {
    // Extract directory path (handle both UNC and regular paths)
    let dirPath;
    if (backupPath.startsWith('\\\\')) {
      // UNC path - extract directory manually
      const lastBackslash = backupPath.lastIndexOf('\\');
      dirPath = backupPath.substring(0, lastBackslash);
    } else {
      dirPath = path.dirname(backupPath);
    }
    
    // Check for potential version mismatch (e.g., MSSQL16 vs MSSQL15)
    if (defaultBackupPath && dirPath !== defaultBackupPath) {
      const customVersion = dirPath.match(/MSSQL(\d+)/i);
      const defaultVersion = defaultBackupPath.match(/MSSQL(\d+)/i);
      if (customVersion && defaultVersion && customVersion[1] !== defaultVersion[1]) {
        console.warn(`[DB BACKUP] Version mismatch detected: Custom path uses MSSQL${customVersion[1]}, but SQL Server instance uses MSSQL${defaultVersion[1]}`);
        console.warn(`[DB BACKUP] Consider using the default backup path: ${defaultBackupPath}`);
      }
    }
    
    const canAccess = await checkSqlServerPathAccess(dirPath);
    if (canAccess === false) {
      // Path check failed - check if we should use default path instead
      if (defaultBackupPath && dirPath !== defaultBackupPath) {
        console.warn(`[DB BACKUP] Custom path ${dirPath} is not accessible.`);
        console.warn(`[DB BACKUP] SQL Server instance: ${serverInfo.ServerName || 'Unknown'}`);
        console.warn(`[DB BACKUP] Make sure the SQL Server service account has Full Control permissions on the folder.`);
        console.warn(`[DB BACKUP] For SQLEXPRESS instance, grant permissions to: NT Service\\MSSQL$SQLEXPRESS`);
        console.warn(`[DB BACKUP] For MSSQLSERVER instance, grant permissions to: NT Service\\MSSQLSERVER`);
        console.warn(`[DB BACKUP] Falling back to SQL Server default backup path: ${defaultBackupPath}`);
        
        // Use the default backup path instead
        backupPath = path.join(defaultBackupPath, backupFileName);
        console.log(`[DB BACKUP] Using default backup path: ${backupPath}`);
      } else {
        // No default path available or same as default, show error
        let errorMsg = `SQL Server cannot access the backup directory: ${dirPath}\n`;
        errorMsg += `This path must exist on the SQL Server machine (${serverInfo.MachineName || 'SQL Server machine'}), `;
        errorMsg += `not just on the Node.js application machine.\n\n`;
        errorMsg += `RECOMMENDED SOLUTION:\n`;
        if (defaultBackupPath) {
          errorMsg += `✅ Use SQL Server's default backup path (already configured with proper permissions):\n`;
          errorMsg += `   Update your .env file:\n`;
          errorMsg += `   DB_BACKUP_DISK_PATH=${defaultBackupPath}\n\n`;
        }
        errorMsg += `ALTERNATIVE SOLUTIONS:\n`;
        errorMsg += `1. If using UNC path (\\\\SERVER\\share):\n`;
        errorMsg += `   - Ensure the folder is shared on ${serverInfo.MachineName || 'SQL Server machine'}\n`;
        errorMsg += `   - Grant SQL Server service account access to the share\n`;
        errorMsg += `   - Use correct format: \\\\${serverInfo.MachineName || 'SERVER'}\\sql_backups\n\n`;
        errorMsg += `2. If using local path on SQL Server machine:\n`;
        errorMsg += `   - Create the directory on ${serverInfo.MachineName || 'SQL Server machine'}\n`;
        errorMsg += `   - Grant FULL CONTROL to SQL Server service account\n\n`;
        errorMsg += `3. Remove DB_BACKUP_DISK_PATH from .env to use local backups folder`;
        
        throw new Error(errorMsg);
      }
    } else if (canAccess === true) {
      console.log(`[DB BACKUP] Verified SQL Server can access: ${dirPath}`);
    } else if (canAccess === null) {
      // Check failed (error occurred), but we'll still try the backup
      // SQL Server will provide a clearer error if the path is truly invalid
      console.warn(`[DB BACKUP] Could not verify path access, proceeding with backup attempt. SQL Server will validate the path.`);
    }
  }

  // SQL Server requires paths that are valid on the DB server host. Escape backslashes for T-SQL.
  const normalizedBackupPath = backupPath.replace(/\\/g, '\\\\');
  
  // Express Edition doesn't support compression - conditionally include it
  const compressionOption = isExpressEdition ? '' : ', COMPRESSION';
  const backupQuery = `
    BACKUP DATABASE [${dbName}]
    TO DISK='${normalizedBackupPath}'
    WITH INIT${compressionOption}
  `;

  console.log(`[DB BACKUP] Executing backup${isExpressEdition ? ' without compression' : ' with compression'}...`);
  
  try {
    await prisma.$executeRawUnsafe(backupQuery);
  } catch (error) {
    // If compression fails (e.g., Express Edition or other unsupported scenarios), retry without compression
    if (!isExpressEdition && error.code === 'P2010' && error.meta?.code === '1844') {
      console.warn(`[DB BACKUP] Compression not supported, retrying backup without compression...`);
      const backupQueryNoCompression = `
        BACKUP DATABASE [${dbName}]
        TO DISK='${normalizedBackupPath}'
        WITH INIT
      `;
      await prisma.$executeRawUnsafe(backupQueryNoCompression);
      console.log(`[DB BACKUP] Backup completed without compression`);
    } else {
      throw error;
    }
  }

  return { backupFileName, backupPath };
};

const runDatabaseBackup = async () => {
  if (!BACKUP_ENABLED) {
    console.log('[DB BACKUP] Disabled via DB_BACKUP_ENABLED=false');
    return { skipped: true, reason: 'disabled' };
  }

  console.log(`[DB BACKUP] Starting backup at ${new Date().toISOString()}`);

  try {
    const { backupFileName, backupPath } = await createSqlServerBackup();
    
    // Determine if backup is local or remote
    const isLocalBackup = await isFileAccessibleLocally(backupPath);
    if (isLocalBackup) {
      console.log(`[DB BACKUP] Backup created locally at ${backupPath}`);
    } else {
      console.log(`[DB BACKUP] Backup created on SQL Server at ${backupPath}`);
      console.log(`[DB BACKUP] Note: File is on remote SQL Server, Google Drive upload will be skipped`);
    }

    // Try to upload to Google Drive (will be skipped if file is remote or upload fails)
    let driveFile = null;
    try {
      driveFile = await uploadToGoogleDrive(backupPath, backupFileName);
      if (driveFile) {
        console.log(
          `[DB BACKUP] Uploaded to Google Drive (id: ${driveFile.id}, link: ${driveFile.webViewLink})`
        );
      }
    } catch (uploadError) {
      // Upload errors are non-fatal - backup was successful
      console.warn(`[DB BACKUP] Google Drive upload failed (non-fatal): ${uploadError.message}`);
    }

    return {
      skipped: false,
      backupFileName,
      backupPath,
      driveFile,
      isLocalBackup,
    };
  } catch (error) {
    console.error('[DB BACKUP] Backup failed:', error);
    
    // Provide helpful error messages for common issues
    if (error.code === 'P2010' && error.meta?.code === '3201') {
      const errorMsg = error.meta.message || '';
      if (errorMsg.includes('Cannot open backup device')) {
        console.error('\n[DB BACKUP] TROUBLESHOOTING:');
        console.error('1. Verify the backup directory exists on the SQL Server machine (not just your app machine)');
        console.error('2. Check that SQL Server service account has FULL CONTROL permissions on the directory');
        console.error('3. If SQL Server is remote, the path must be accessible from the SQL Server machine');
        console.error('4. Common SQL Server service accounts:');
        console.error('   - NT Service\\MSSQLSERVER (for default instance)');
        console.error('   - NT Service\\MSSQL$INSTANCENAME (for named instance)');
        console.error('   - NT AUTHORITY\\NETWORK SERVICE');
        console.error('5. Right-click the folder > Properties > Security > Add the SQL Server service account');
        console.error(`\nAttempted path: ${CUSTOM_BACKUP_PATH || BACKUP_DIR}`);
      }
    }
    
    throw error;
  }
};

const scheduleWeeklyBackup = () => {
  if (!BACKUP_ENABLED) {
    console.log('[DB BACKUP] Scheduling skipped; DB_BACKUP_ENABLED=false');
    return;
  }

  cron.schedule(
    CRON_EXPRESSION,
    () => {
      runDatabaseBackup().catch((err) =>
        console.error('[DB BACKUP] Scheduled backup failed:', err)
      );
    },
    { timezone: TIMEZONE }
  );

  console.log(
    `[DB BACKUP] Scheduled weekly backup with cron "${CRON_EXPRESSION}" (${TIMEZONE})`
  );
};

module.exports = {
  runDatabaseBackup,
  scheduleWeeklyBackup,
};

