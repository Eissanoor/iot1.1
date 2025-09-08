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

// Send multiple emails utility
const sendMultipleEmails = async (emailData) => {
  try {
    const transporter = createTransporter();
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
    console.error('Failed to send emails:', error);
    throw error;
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

// Convert EJS to PDF utility (placeholder)
const convertEjsToPdf = async (templatePath, data, outputPath) => {
  try {
    // This is a placeholder. In production, you'd use puppeteer or similar
    console.log('PDF generation would happen here');
    console.log('Template:', templatePath);
    console.log('Output:', outputPath);
    return outputPath;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};

module.exports = {
  sendDemoRequestEmail,
  sendMultipleEmails,
  generateQRCode,
  convertEjsToPdf
};
