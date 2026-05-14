const nodemailer = require('nodemailer');
require('dotenv').config();

async function testMail() {
  console.log('Testing SMTP with:');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully!');
    
    const info = await transporter.sendMail({
      from: `"NGBHS Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // send to self
      subject: "SMTP Test",
      text: "If you see this, SMTP is working!",
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('SMTP Error:', error);
  }
}

testMail();
