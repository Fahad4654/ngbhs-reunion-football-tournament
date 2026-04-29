import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string) {
  if (process.env.MAIL_SEND !== 'true') {
    console.log(`Email sending is disabled. OTP for ${email} is ${otp}`);
    return;
  }

  const mailOptions = {
    from: `"NGBHS Reunion" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Verification Code - NGBHS Reunion',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <p>Hello,</p>
        <p>Thank you for registering for the NGBHS Reunion Football Tournament. Please use the following One-Time Password (OTP) to verify your email address:</p>
        <div style="font-size: 24px; font-weight: bold; color: #007bff; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">
          &copy; ${new Date().getFullYear()} NGBHS Reunion. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email.');
  }
}

export async function sendPasswordResetEmail(email: string, otp: string) {
  if (process.env.MAIL_SEND !== 'true') {
    console.log(`Email sending is disabled. Password reset OTP for ${email} is ${otp}`);
    return;
  }

  const mailOptions = {
    from: `"NGBHS Reunion" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Password Reset Code - NGBHS Reunion',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Password Reset</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your NGBHS Reunion account. Please use the following One-Time Password (OTP) to proceed:</p>
        <div style="font-size: 24px; font-weight: bold; color: #dc3545; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">
          &copy; ${new Date().getFullYear()} NGBHS Reunion. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email.');
  }
}
