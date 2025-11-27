const nodemailer = require('nodemailer');
require('dotenv').config();



// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // For debugging
  console.log('Email config:', {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_PORT === '465'
  });
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });
};

// OTP email template
const getOtpEmailTemplate = ({ otp, expiresAt }) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Admin Login Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          padding: 0;
          margin: 0;
        }
        .container {
          max-width: 480px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .header {
          background-color: #1e5799;
          color: #ffffff;
          padding: 18px 24px;
        }
        .content {
          padding: 24px;
          color: #333333;
        }
        .otp {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 6px;
          text-align: center;
          margin: 24px 0;
        }
        .footer {
          font-size: 12px;
          color: #666666;
          text-align: center;
          padding: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Verify Your Login</h2>
        </div>
        <div class="content">
          <p>Use the one-time password (OTP) below to finish signing in:</p>
          <div class="otp">${otp}</div>
          <p>This code expires at ${expiresAt.toLocaleTimeString()}.</p>
          <p>If you did not attempt to sign in, please contact support.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GSTSA. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
};

// Demo request email template
const getDemoRequestEmailTemplate = (data) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Demo Request</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      
      body {
        font-family: 'Roboto', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f9f9f9;
        margin: 0;
        padding: 0;
      }
      
      .email-wrapper {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
      }
      
      .header {
        background: linear-gradient(135deg, #1e5799 0%, #207cca 100%);
        color: white;
        padding: 30px 20px;
        text-align: center;
      }
      
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      
      .header p {
        margin: 10px 0 0;
        font-size: 16px;
        opacity: 0.9;
      }
      
      .content {
        padding: 30px;
        background-color: #ffffff;
      }
      
      .intro {
        font-size: 16px;
        margin-bottom: 25px;
        color: #555;
      }
      
      .details-container {
        background-color: #f5f8ff;
        border-left: 4px solid #4285f4;
        padding: 20px;
        margin-bottom: 25px;
        border-radius: 4px;
      }
      
      .detail-row {
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
      }
      
      .detail-row:last-child {
        margin-bottom: 0;
      }
      
      .detail-label {
        font-weight: 500;
        color: #4285f4;
        margin-bottom: 5px;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .detail-value {
        font-size: 16px;
        color: #333;
        word-break: break-word;
      }
      
      .message-box {
        background-color: #f9f9f9;
        border: 1px solid #eaeaea;
        border-radius: 4px;
        padding: 15px;
        margin-top: 5px;
      }
      
      .timestamp {
        text-align: right;
        font-size: 14px;
        color: #888;
        margin-top: 20px;
        font-style: italic;
      }
      
      .cta-container {
        text-align: center;
        margin: 30px 0;
      }
      
      .cta-button {
        display: inline-block;
        background-color: #4285f4;
        color: white;
        text-decoration: none;
        padding: 12px 25px;
        border-radius: 4px;
        font-weight: 500;
        font-size: 16px;
        text-align: center;
      }
      
      .footer {
        background-color: #f5f5f5;
        padding: 20px;
        text-align: center;
        color: #666;
        font-size: 14px;
        border-top: 1px solid #eaeaea;
      }
      
      .company-info {
        margin-top: 15px;
        font-size: 12px;
      }
      
      @media only screen and (max-width: 600px) {
        .header {
          padding: 20px 15px;
        }
        
        .content {
          padding: 20px 15px;
        }
        
        .header h1 {
          font-size: 24px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="header">
        <h1>New Demo Request</h1>
        <p>A potential client is interested in your services</p>
      </div>
      
      <div class="content">
        <p class="intro">A new demo request has been submitted through your website. Here are the details:</p>
        
        <div class="details-container">
          <div class="detail-row">
            <div class="detail-label">Company</div>
            <div class="detail-value">${data.companyName}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Contact Email</div>
            <div class="detail-value">${data.email}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Phone Number</div>
            <div class="detail-value">${data.phoneNumber}</div>
          </div>
          
          ${data.message ? `
          <div class="detail-row">
            <div class="detail-label">Message</div>
            <div class="detail-value">
              <div class="message-box">${data.message}</div>
            </div>
          </div>
          ` : ''}
        </div>
        
        <div class="cta-container">
          <a href="mailto:${data.email}" class="cta-button">Reply to Request</a>
        </div>
        
        <div class="timestamp">
          Request received on ${new Date().toLocaleString()}
        </div>
      </div>
      
      <div class="footer">
        <p>This is an automated notification from your website's demo request system.</p>
        <div class="company-info">
          © ${new Date().getFullYear()} GSTSA | <a href="https://gstsa1.org" style="color: #4285f4; text-decoration: none;">gstsa1.org</a>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};

// Send demo request email
const sendDemoRequestEmail = async (data) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Demo Request" <noreply@yourdomain.com>',
      to: process.env.DEMO_EMAIL_TO || 'info@gstsa1.org',
      subject: 'New Demo Request from ' + data.companyName,
      html: getDemoRequestEmailTemplate(data)
    };
    
    console.log('Sending email to:', mailOptions.to);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    // Don't throw the error, just log it
    // This way the API can still work even if email sending fails
    return { error: 'Email sending failed', details: error.message };
  }
};

// Send admin login OTP email
const sendOtpEmail = async ({ toEmail, otp, expiresAt }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Admin Login" <noreply@yourdomain.com>',
      to: toEmail,
      subject: 'Your Admin Login OTP',
      html: getOtpEmailTemplate({ otp, expiresAt })
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return { error: 'Email sending failed', details: error.message };
  }
};

// Send multiple emails utility with retry logic
const sendMultipleEmails = async (emailData) => {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transporter = createTransporter();
      
      // Test connection first
      await transporter.verify();
      console.log('SMTP connection verified successfully');
      
      const results = [];

      for (const email of emailData.emailData) {
        const mailOptions = {
          from: process.env.EMAIL_FROM || '"IoT Solutions" <noreply@iotsolutions.com>',
          to: email.toEmail,
          subject: email.subject,
          html: email.htmlContent,
          attachments: email.attachments || []
        };

        console.log('Sending email to:', mailOptions.to);
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        results.push(info);
      }

      return results;
    } catch (error) {
      console.error(`Email sending attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('All email sending attempts failed. Continuing without email...');
        // Don't throw error - allow user creation to continue
        return { 
          error: 'Email sending failed after all retries', 
          details: error.message,
          emailSkipped: true 
        };
      }
      
      // Wait before retry
      console.log(`Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// Generate QR Code utility
const generateQRCode = async (data) => {
  try {
    // For now, return a placeholder. You can implement actual QR generation later
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    return null;
  }
};

// Convert EJS template to PDF using Puppeteer
const convertEjsToPdf = async (templatePath, data, outputPath) => {
  const ejs = require('ejs');
  const puppeteer = require('puppeteer');
  const fs = require('fs').promises;
  const path = require('path');

  let browser = null;
  let page = null;

  try {
    console.log('PDF generation starting...');
    console.log('Template:', templatePath);
    console.log('Output:', outputPath);

    // Render EJS template to HTML
    const htmlContent = await ejs.renderFile(templatePath, data);

    // Launch browser with minimal options
    const launchOptions = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    try {
      browser = await puppeteer.launch(launchOptions);
    } catch (error) {
      // Fallback to system Chrome
      browser = await puppeteer.launch({
        ...launchOptions,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      });
    }

    // Create new page
    page = await browser.newPage();
    
    // Set content
    await page.setContent(htmlContent);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    console.log('PDF generated successfully:', outputPath);
    return outputPath;

  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  } finally {
    // Cleanup resources
    if (page) {
      try { await page.close(); } catch (e) { /* ignore */ }
    }
    if (browser) {
      try { await browser.close(); } catch (e) { /* ignore */ }
    }
  }
};

module.exports = {
  sendDemoRequestEmail,
  sendMultipleEmails,
  generateQRCode,
  convertEjsToPdf,
  sendOtpEmail
};
