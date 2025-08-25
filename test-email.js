require('dotenv').config();
const { sendDemoRequestEmail } = require('./utils/emailUtils');

async function testEmail() {
  console.log('Testing email functionality...');
  console.log('Environment variables:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '(set)' : '(not set)');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '(set)' : '(not set)');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('DEMO_EMAIL_TO:', process.env.DEMO_EMAIL_TO || 'info@gstsa1.org (default)');
  
  try {
    const result = await sendDemoRequestEmail({
      email: 'test@example.com',
      phoneNumber: '+1234567890',
      companyName: 'Test Company',
      message: 'This is a test message to verify email functionality.'
    });
    
    console.log('Email test result:', result);
    
    if (result.error) {
      console.log('Email sending failed. Please check your email configuration.');
    } else {
      console.log('Email sent successfully!');
    }
  } catch (error) {
    console.error('Unexpected error during email test:', error);
  }
}

testEmail().then(() => {
  console.log('Test completed.');
});
