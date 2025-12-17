# Google Drive Backup Setup

This document explains how to set up Google Drive integration for automatic database backup uploads.

## Overview

The backup system can automatically upload database backup files to Google Drive using a service account. This allows you to have off-site backups of your database without manual intervention.

## Prerequisites

- A Google Cloud Platform (GCP) account
- A Google Cloud project with the Drive API enabled
- A service account with Drive API access

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Database Backups")
5. Click "Create"

### 2. Enable Google Drive API

1. In your Google Cloud project, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on "Google Drive API" and click **Enable**

### 3. Create a Service Account

Follow these detailed steps to create a service account:

**Step 3.1: Navigate to Credentials**
1. In your Google Cloud Console, look at the left sidebar menu
2. Click on **APIs & Services** (you might see an icon with three horizontal lines ☰ if the menu is collapsed)
3. In the submenu that appears, click on **Credentials**
4. You should now see a page titled "Credentials" with options to create credentials

**Step 3.2: Start Creating Service Account**
1. At the top of the Credentials page, you'll see a blue button that says **+ CREATE CREDENTIALS**
2. Click on **+ CREATE CREDENTIALS**
3. A dropdown menu will appear with options like:
   - API key
   - OAuth client ID
   - Service account
   - etc.
4. Click on **Service account** from the dropdown

**Step 3.3: Fill in Service Account Details**
1. You'll be taken to a page titled "Create service account"
2. In the **Service account name** field, enter a descriptive name like:
   - `backup-uploader`
   - `database-backup-service`
   - `fatsai-backup-service`
   - (Use any name that helps you identify this service account)
3. The **Service account ID** will auto-populate based on the name (you can leave it as is)
4. The **Service account description** is optional - you can add something like "Service account for uploading database backups to Google Drive"

**Step 3.4: Complete Service Account Creation**
1. Click the blue **CREATE AND CONTINUE** button at the bottom
2. You'll see a page titled "Grant this service account access to project" (Step 2 of 3)
3. For this use case, you can **skip this step** - click **CONTINUE** at the bottom (or click **SKIP** if available)
4. You'll see a page titled "Grant users access to this service account" (Step 3 of 3)
5. You can also **skip this step** - click **DONE** at the bottom
6. You'll be redirected back to the Credentials page, and you should see a success message like "Service account created successfully"

**What you should see:**
- Your new service account will appear in the list on the Credentials page
- It will show the service account name, email (which looks like `your-name@your-project.iam.gserviceaccount.com`), and type as "Service account"
- **Important:** Note down or remember the service account email address - you'll need it later!

### 4. Create and Download Service Account Key

Now you need to create a key (credentials file) for your service account:

**Step 4.1: Open Your Service Account**
1. On the **Credentials** page, scroll down to find your service account in the list
2. Look for the service account you just created (it will show the name and email)
3. **Click on the service account email address** (it's a clickable link)
   - Example: `backup-uploader@your-project-123456.iam.gserviceaccount.com`
4. This will open the service account details page

**Step 4.2: Navigate to Keys Tab**
1. You'll see several tabs at the top: **Details**, **Permissions**, **Keys**, **IAM**
2. Click on the **Keys** tab
3. You should see a section that says "Keys" with a button to add keys

**Step 4.3: Create a New Key**
1. Click the **ADD KEY** button (usually at the top right of the Keys section)
2. A dropdown menu will appear with two options:
   - **Create new key**
   - **Upload key**
3. Click on **Create new key**

**Step 4.4: Select Key Format and Download**
1. A popup dialog will appear titled "Create private key for [your-service-account]"
2. You'll see two radio button options:
   - **JSON** (recommended) - This is what you want!
   - **P12** (older format)
3. Make sure **JSON** is selected (it should be selected by default)
4. Click the blue **CREATE** button
5. **Important:** A JSON file will immediately download to your computer
   - The file will be named something like: `your-project-123456-abc123def456.json`
   - **Save this file in a secure location** - you'll need it in the next step!
   - **Warning:** This file contains sensitive credentials. Never share it publicly or commit it to version control!

**What to do if the download doesn't start:**
- Check your browser's download folder
- Some browsers may ask for permission to download - click "Allow"
- If using a popup blocker, you may need to allow popups for Google Cloud Console

### 5. Extract Credentials from JSON File

Now you need to extract the credentials from the downloaded JSON file:

**Step 5.1: Open the JSON File**
1. Navigate to your Downloads folder (or wherever your browser saved the file)
2. Find the JSON file you just downloaded (e.g., `your-project-123456-abc123def456.json`)
3. Open it with any text editor:
   - **Windows:** Right-click → Open with → Notepad (or any text editor)
   - You can also use VS Code, Notepad++, or any code editor
   - **Do NOT** try to open it in Excel or Word - use a plain text editor

**Step 5.2: Understand the JSON Structure**
The file will look something like this (with your actual values):

```json
{
  "type": "service_account",
  "project_id": "your-project-123456",
  "private_key_id": "abc123def456ghi789",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n(many more lines)\n-----END PRIVATE KEY-----\n",
  "client_email": "backup-uploader@your-project-123456.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/backup-uploader%40your-project-123456.iam.gserviceaccount.com"
}
```

**Step 5.3: Find the Two Values You Need**
You need to copy two specific values from this file:

1. **`client_email`** - This is your service account email
   - Look for the line: `"client_email": "backup-uploader@your-project-123456.iam.gserviceaccount.com"`
   - Copy the email address (the part in quotes after the colon)
   - Example: `backup-uploader@your-project-123456.iam.gserviceaccount.com`
   - This will be your `GOOGLE_DRIVE_CLIENT_EMAIL`

2. **`private_key`** - This is the private key (it's a long string)
   - Look for the line: `"private_key": "-----BEGIN PRIVATE KEY-----\n..."`
   - The private key is a very long string that spans multiple lines
   - **Important:** You need to copy the ENTIRE private key, including:
     - `-----BEGIN PRIVATE KEY-----`
     - All the characters in between
     - `-----END PRIVATE KEY-----`
   - The `\n` characters in the JSON represent newlines - keep them as `\n` when copying
   - This will be your `GOOGLE_DRIVE_PRIVATE_KEY`

**Step 5.4: Copy the Values Correctly**

**For `client_email`:**
- Simply copy the email address (without quotes)
- Example: `backup-uploader@your-project-123456.iam.gserviceaccount.com`

**For `private_key`:**
- Copy the entire value including the quotes and `\n` characters
- It should look like: `"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"`
- Make sure you get the complete key from `-----BEGIN` to `-----END`

**Tip:** You can use your text editor's search function to find `"client_email"` and `"private_key"` quickly.

### 6. Create a Google Drive Folder (Optional but Recommended)

Creating a dedicated folder helps organize your backups and provides better security by limiting the service account's access.

**Step 6.1: Open Google Drive**
1. Go to [Google Drive](https://drive.google.com/) in your web browser
2. Make sure you're signed in with your Google account
3. You should see your Google Drive home page with your files and folders

**Step 6.2: Create a New Folder**
1. Click the **+ New** button (usually in the top left, or right-click in an empty area)
2. From the dropdown menu, select **Folder**
3. A dialog will appear asking for a folder name
4. Enter a descriptive name, for example:
   - `Database Backups`
   - `FATSAI Database Backups`
   - `SQL Server Backups`
   - `IoT Database Backups`
5. Click **Create**
6. The new folder will appear in your Drive

**Step 6.3: Share the Folder with Your Service Account**
1. **Right-click** on the folder you just created
2. From the context menu, select **Share** (or click the folder, then click the **Share** button at the top)
3. A sharing dialog will appear

**Step 6.4: Add Service Account Email**
1. In the sharing dialog, you'll see a field that says "Add people and groups" or "Add people"
2. **Paste your service account email** here (the `client_email` you copied from step 5)
   - Example: `backup-uploader@your-project-123456.iam.gserviceaccount.com`
   - **Important:** Make sure you paste the complete email address exactly as it appears in the JSON file
3. Click on the permission dropdown next to the email field (it might say "Viewer" by default)

**Step 6.5: Set Permissions**
1. Click the permission dropdown and select **Editor**
   - **Editor** allows the service account to upload, modify, and delete files in the folder
   - This is what you need for backups to work
2. **Optional:** Uncheck the box that says "Notify people" if you don't want to send an email notification
   - (The service account won't receive emails anyway, but unchecking it prevents unnecessary notifications)

**Step 6.6: Complete Sharing**
1. Click the **Send** button (or **Share** button)
2. You should see a confirmation that the folder has been shared
3. The service account email should now appear in the "People with access" list

**Step 6.7: Get the Folder ID**
1. Make sure you're still viewing the folder in Google Drive
2. Look at your browser's address bar - the URL will look like:
   ```
   https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j
   ```
   or
   ```
   https://drive.google.com/drive/u/0/folders/1a2b3c4d5e6f7g8h9i0j
   ```
3. The **Folder ID** is the long string of letters and numbers after `/folders/`
   - Example: If the URL is `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`
   - The Folder ID is: `1a2b3c4d5e6f7g8h9i0j`
   - **IMPORTANT:** Copy ONLY the folder ID, not the entire URL!
4. **Copy this Folder ID** - you'll need it for your `.env` file as `GOOGLE_DRIVE_BACKUP_FOLDER_ID`

**Alternative Method to Get Folder ID:**
- If you can't see the folder ID in the URL, you can:
  1. Right-click the folder → **Get link** (or **Share** → **Copy link**)
  2. The link will look like: `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j?usp=sharing`
  3. Extract ONLY the folder ID part (the string after `/folders/` and before `?` or the end)
   - From `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j?usp=sharing`
   - Extract: `1a2b3c4d5e6f7g8h9i0j` (just the ID, not the URL)

**Important Notes:**
- The folder ID is a long alphanumeric string (usually 33 characters)
- It's case-sensitive, so copy it exactly
- **DO NOT** use the full URL - only use the folder ID itself
- **Correct:** `GOOGLE_DRIVE_BACKUP_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j`
- **Wrong:** `GOOGLE_DRIVE_BACKUP_FOLDER_ID=https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j?usp=sharing`
- You'll use this ID in step 7 when configuring your environment variables

### 7. Configure Environment Variables

Now you'll add the credentials to your `.env` file so your application can use them.

**Step 7.1: Locate Your .env File**
1. Open your project folder in a text editor (VS Code, Notepad++, or any text editor)
2. Find the `.env` file in the root of your project (same folder as `package.json` and `server.js`)
3. Open the `.env` file for editing

**Step 7.2: Add the Environment Variables**
Add the following to your `.env` file (you can add them at the end or in a dedicated section):

```env
# Google Drive service account credentials
GOOGLE_DRIVE_CLIENT_EMAIL=backup-uploader@your-project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_BACKUP_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j
```

**Step 7.3: Fill in Your Actual Values**

Replace the placeholder values with your actual credentials:

1. **GOOGLE_DRIVE_CLIENT_EMAIL**: 
   - Replace `backup-uploader@your-project.iam.gserviceaccount.com` with the `client_email` you copied from step 5
   - Example: `GOOGLE_DRIVE_CLIENT_EMAIL=backup-uploader@fatsai-backups-123456.iam.gserviceaccount.com`
   - **No quotes needed** for this value

2. **GOOGLE_DRIVE_PRIVATE_KEY**:
   - Replace the placeholder with your actual `private_key` from the JSON file
   - **Important:** Keep the double quotes and the `\n` characters
   - The entire private key should be on one line in your `.env` file, with `\n` representing newlines
   - Example format:
     ```
     GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKjMzEfYyjiWA4R4/M2bNtVu3K\n...many more lines...\n-----END PRIVATE KEY-----\n"
     ```

3. **GOOGLE_DRIVE_BACKUP_FOLDER_ID** (Optional):
   - Replace `1a2b3c4d5e6f7g8h9i0j` with the folder ID you copied from step 6
   - **IMPORTANT:** Use ONLY the folder ID, NOT the full URL!
   - **Correct format:** `GOOGLE_DRIVE_BACKUP_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j`
   - **Wrong format:** `GOOGLE_DRIVE_BACKUP_FOLDER_ID=https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j?usp=sharing`
   - If you accidentally paste the full URL, the code will try to extract the ID automatically, but it's better to use just the ID
   - **No quotes needed** for this value
   - If you skip this, backups will go to the service account's Drive root

**Step 7.4: Save the File**
1. Save your `.env` file
2. Make sure there are no syntax errors (no extra quotes, proper line breaks, etc.)

**Important Notes:**

1. **Private Key Format**: 
   - The `GOOGLE_DRIVE_PRIVATE_KEY` must include the entire key with `\n` characters preserved
   - In your `.env` file, you can either:
     - Use double quotes and include `\n` literally: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
     - Or use actual newlines (if your .env parser supports it)
   - The code automatically converts `\n` to actual newlines

2. **Folder ID**:
   - `GOOGLE_DRIVE_BACKUP_FOLDER_ID` is optional
   - If omitted, files will be uploaded to the root of the service account's Drive
   - If provided, files will be uploaded to the specified folder

3. **Security**:
   - Never commit your `.env` file to version control
   - Keep your service account JSON file secure
   - The service account should only have access to the specific backup folder

### 8. Restart Your Server

After adding the environment variables, restart your server for the changes to take effect:

```bash
npm start
# or
npm run dev
```

### 9. Test the Configuration

1. Trigger a manual backup:
   ```bash
   POST /api/admin/backup/run
   ```

2. Check the server logs. You should see:
   ```
   [DB BACKUP] Backup created locally at ...
   [DB BACKUP] Uploaded to Google Drive (id: ..., link: ...)
   ```

3. Verify in Google Drive:
   - Go to your backup folder in Google Drive
   - You should see the backup file (`.bak` file)

## Troubleshooting

### "Google Drive credentials not set; skipping upload"

**Problem**: The environment variables are not set or not loaded.

**Solutions**:
1. Verify the variables are in your `.env` file
2. Make sure there are no typos in variable names
3. Restart your server after adding the variables
4. Check that your `.env` file is in the correct location (project root)

### "Google Drive upload failed: OpenSSL/decoder error"

**Problem**: The private key format is incorrect.

**Solutions**:
1. Ensure the private key includes the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
2. Make sure `\n` characters are preserved in the `.env` file
3. Try copying the private key directly from the JSON file, including all newlines

### "Google Drive upload failed: File not found" or "404 error"

**Problem**: The folder ID is incorrect or the folder is not accessible.

**Solutions**:
1. **Check your folder ID format:**
   - Make sure you're using ONLY the folder ID, not the full URL
   - **Correct:** `GOOGLE_DRIVE_BACKUP_FOLDER_ID=1PkekRd_RIdMLm8yeXjA8rhv_y1U1CYS6`
   - **Wrong:** `GOOGLE_DRIVE_BACKUP_FOLDER_ID=https://drive.google.com/drive/folders/1PkekRd_RIdMLm8yeXjA8rhv_y1U1CYS6?usp=sharing`
   - If you pasted the full URL, extract just the ID part (the string after `/folders/`)

2. **Verify folder sharing:**
   - Go to Google Drive and open your backup folder
   - Click the "Share" button and verify your service account email is listed
   - Make sure the service account has "Editor" permissions (not just "Viewer")

3. **Double-check the folder ID:**
   - Open the folder in Google Drive
   - Look at the URL in your browser's address bar
   - Copy ONLY the part after `/folders/` and before any `?` character
   - Update your `.env` file with just that ID

4. **Test with a new folder:**
   - If the issue persists, try creating a new folder and sharing it with the service account
   - Use the new folder's ID to see if the original folder had any issues

### "Google Drive upload failed: [permission error]"

**Problem**: The service account doesn't have access to the folder.

**Solutions**:
1. Verify you shared the folder with the service account email
2. Make sure the service account has at least "Editor" permissions
3. Check that the `GOOGLE_DRIVE_BACKUP_FOLDER_ID` is correct (just the ID, not the full URL)

### "Backup file is on remote SQL Server, cannot upload to Google Drive"

**Problem**: The backup file is created on the SQL Server machine, not locally accessible.

**Solutions**:
1. Configure `DB_BACKUP_DISK_PATH` to point to a local directory
2. The backup must be accessible from the Node.js application server, not just the SQL Server

### Upload works but files don't appear in expected folder

**Problem**: Folder ID might be incorrect or service account doesn't have access.

**Solutions**:
1. Double-check the folder ID in the Google Drive URL
2. Verify the folder was shared with the service account email
3. Check the server logs for the actual Drive file ID and link

## Security Best Practices

1. **Limit Service Account Permissions**: Only grant access to the specific backup folder, not the entire Drive
2. **Rotate Keys Periodically**: Create new service account keys and update your `.env` file periodically
3. **Monitor Access**: Check Google Cloud Console for any unusual activity
4. **Secure Storage**: Keep your `.env` file secure and never commit it to version control
5. **Backup Verification**: Periodically verify that backups are actually being uploaded and are accessible

## Additional Resources

- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Service Accounts Overview](https://cloud.google.com/iam/docs/service-accounts)
- [Google Cloud Console](https://console.cloud.google.com/)

