# Email Configuration Setup

This document explains how to set up the email functionality for the demo request feature.

## Environment Variables

Add the following environment variables to your `.env` file:

```
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
DEMO_EMAIL_TO=info@gstsa1.org
```

## Setting Up with Gmail

If you're using Gmail as your email service provider, follow these steps:

1. **Create an App Password**:
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification if not already enabled
   - Create an App Password (select "Mail" and your device)
   - Use the generated 16-character password as your `EMAIL_PASSWORD`

2. **Configure Environment Variables**:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASSWORD`: The app password generated above
   - `EMAIL_FROM`: Your Gmail address or a custom name like `"Demo Requests" <your_email@gmail.com>`
   - `DEMO_EMAIL_TO`: The recipient email (default: info@gstsa1.org)

## Setting Up with Other Email Providers

For other email providers:

1. **Get SMTP Details**:
   - Obtain the SMTP server host, port, and authentication details from your email provider
   - Update the environment variables accordingly:
     - `EMAIL_HOST`: SMTP server hostname
     - `EMAIL_PORT`: SMTP server port (typically 587 for TLS or 465 for SSL)
     - `EMAIL_SECURE`: Set to "true" if using port 465, otherwise "false"

2. **Configure Authentication**:
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASSWORD`: Your email password or API key

## Testing the Email Configuration

After setting up the environment variables, you can test the email functionality by submitting a demo request through the API:

```
POST /api/demo-requests
{
  "email": "test@example.com",
  "phoneNumber": "+1234567890",
  "companyName": "Test Company",
  "message": "This is a test message"
}
```

If the email configuration is correct, an email notification will be sent to the address specified in `DEMO_EMAIL_TO`.

## Troubleshooting

If emails are not being sent:

1. Check the server logs for any error messages related to email sending
2. Verify that all environment variables are correctly set
3. Ensure your email provider allows SMTP access from your server's IP address
4. If using Gmail, ensure the app password is correct and that less secure app access is enabled if required
5. Check if your server's IP is not blacklisted by email providers
