require('dotenv').config();
const prisma = require('./prisma/client');
const os = require('os');

async function checkBackupPath() {
  console.log('Checking SQL Server backup path accessibility...\n');

  try {
    // Get SQL Server information (using CAST to avoid SQL_VARIANT issues)
    const [serverInfo] = await prisma.$queryRawUnsafe(`
      SELECT 
        @@SERVERNAME AS ServerName,
        CAST(SERVERPROPERTY('MachineName') AS NVARCHAR(128)) AS MachineName,
        CAST(SERVERPROPERTY('InstanceName') AS NVARCHAR(128)) AS InstanceName,
        CAST(SERVERPROPERTY('InstanceDefaultBackupPath') AS NVARCHAR(260)) AS DefaultBackupPath,
        CAST(SERVERPROPERTY('InstanceDefaultDataPath') AS NVARCHAR(260)) AS DefaultDataPath,
        CAST(SERVERPROPERTY('InstanceDefaultLogPath') AS NVARCHAR(260)) AS DefaultLogPath
    `);

    console.log('=== SQL Server Information ===');
    console.log(`Server Name: ${serverInfo.ServerName || 'Unknown'}`);
    console.log(`Machine Name: ${serverInfo.MachineName || 'Unknown'}`);
    console.log(`Instance Name: ${serverInfo.InstanceName || 'Default'}`);
    console.log(`Default Backup Path: ${serverInfo.DefaultBackupPath || 'Not set'}`);
    console.log(`Default Data Path: ${serverInfo.DefaultDataPath || 'Not set'}`);
    console.log(`Default Log Path: ${serverInfo.DefaultLogPath || 'Not set'}\n`);

    // Check if custom backup path is configured
    const customPath = process.env.DB_BACKUP_DISK_PATH;
    if (customPath) {
      console.log(`=== Checking Custom Backup Path ===`);
      console.log(`Configured path: ${customPath}\n`);

      // Try to check if SQL Server can see this path
      const dirPath = customPath.replace(/\\$/, ''); // Remove trailing backslash
      const normalizedPath = dirPath.replace(/\\/g, '\\\\');
      
      try {
        const checkQuery = `
          DECLARE @Path NVARCHAR(500) = '${normalizedPath}';
          DECLARE @FileExists INT;
          EXEC master.dbo.xp_fileexist @Path, @FileExists OUTPUT;
          SELECT @FileExists AS PathExists;
        `;
        
        const [result] = await prisma.$queryRawUnsafe(checkQuery);
        
        if (result.PathExists === 1) {
          console.log(`✅ SQL Server CAN access: ${dirPath}`);
        } else {
          console.log(`❌ SQL Server CANNOT access: ${dirPath}`);
          console.log(`\nThis means:`);
          console.log(`- The path does not exist on the SQL Server machine`);
          console.log(`- OR SQL Server service account doesn't have permissions`);
          console.log(`- OR the drive doesn't exist on SQL Server machine\n`);
          
          console.log(`RECOMMENDATIONS:`);
          const localMachineName = os.hostname().toUpperCase();
          const sqlMachineName = (serverInfo.MachineName || '').toUpperCase();
          
          if (serverInfo.MachineName && sqlMachineName !== localMachineName) {
            console.log(`⚠️  SQL Server is on a DIFFERENT machine (${serverInfo.MachineName})`);
            console.log(`   You need to:`);
            console.log(`   1. Create ${dirPath} on the SQL Server machine (${serverInfo.MachineName})`);
            console.log(`   2. OR use a UNC path: \\\\${serverInfo.MachineName}\\sql_backups`);
            console.log(`   3. OR use SQL Server's default: ${serverInfo.DefaultBackupPath || 'Check SQL Server settings'}`);
          } else {
            console.log(`✅ SQL Server is on the SAME machine`);
            console.log(`   You need to:`);
            console.log(`   1. Verify D:\\ drive exists`);
            console.log(`   2. Create the directory: ${dirPath}`);
            console.log(`   3. Grant FULL CONTROL to: NT Service\\MSSQLSERVER`);
          }
        }
      } catch (error) {
        console.log(`⚠️  Could not verify path access: ${error.message}`);
      }
    } else {
      console.log('No custom backup path configured (DB_BACKUP_DISK_PATH not set)');
      console.log(`Backups will use default local path: ./backups`);
      console.log(`SQL Server default backup path: ${serverInfo.DefaultBackupPath || 'Not set'}`);
    }

    console.log('\n=== Recommended Solution ===');
    if (serverInfo.DefaultBackupPath) {
      console.log(`Use SQL Server's default backup path: ${serverInfo.DefaultBackupPath}`);
      console.log(`Set in .env: DB_BACKUP_DISK_PATH=${serverInfo.DefaultBackupPath}`);
    } else {
      console.log('Option 1: Use local backups folder (remove DB_BACKUP_DISK_PATH)');
      console.log('Option 2: Create D:\\sql_backups on SQL Server machine and set permissions');
      console.log('Option 3: Use UNC path if SQL Server is remote');
    }

  } catch (error) {
    console.error('Error checking backup path:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBackupPath();

