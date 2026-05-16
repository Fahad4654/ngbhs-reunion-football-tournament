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
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail] OTP sent successfully to ${email}. MessageId: ${info.messageId}`);
  } catch (error) {
    console.error(`[Mail Error] Failed to send OTP email to ${email}:`, error);
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
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail] Password reset email sent successfully to ${email}. MessageId: ${info.messageId}`);
  } catch (error) {
    console.error(`[Mail Error] Failed to send password reset email to ${email}:`, error);
    throw new Error('Failed to send password reset email.');
  }
}

export async function sendTournamentAnnouncementEmail(emails: string[], tournamentName: string) {
  if (process.env.MAIL_SEND !== 'true') {
    console.log(`Email sending is disabled. Announcement for ${tournamentName} to ${emails.length} users.`);
    return;
  }

  const mailOptions = {
    from: `"NGBHS Reunion" <${process.env.SMTP_USER}>`,
    bcc: emails,
    subject: `New Tournament Announced: ${tournamentName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">New Tournament!</h2>
        <p>Hello,</p>
        <p>A new tournament, <strong>${tournamentName}</strong>, has just been created for the NGBHS Reunion Football Championship!</p>
        <p>Check the website for upcoming matches, standings, and more information.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://ngbhs.com'}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit Website</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">
          &copy; ${new Date().getFullYear()} NGBHS Reunion. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail] Tournament announcement sent successfully. MessageId: ${info.messageId}`);
  } catch (error) {
    console.error(`[Mail Error] Failed to send tournament announcement:`, error);
  }
}

export async function sendMatchAnnouncementEmail(emails: string[], homeTeamName: string, awayTeamName: string, date: string, isUpdate: boolean = false) {
  if (process.env.MAIL_SEND !== 'true') {
    console.log(`Email sending disabled. Match ${isUpdate ? 'Update' : 'Announcement'}: ${homeTeamName} vs ${awayTeamName} sent to ${emails.length} users.`);
    return;
  }

  const subject = isUpdate ? `Match Update: ${homeTeamName} vs ${awayTeamName}` : `Upcoming Match: ${homeTeamName} vs ${awayTeamName}`;
  const heading = isUpdate ? 'Match Details Updated!' : 'New Match Scheduled!';
  const messageStr = isUpdate 
    ? 'Details for an upcoming match for your batch have been updated.' 
    : 'Your batch has a new match scheduled in the NGBHS Reunion Football Championship!';

  const mailOptions = {
    from: `"NGBHS Reunion" <${process.env.SMTP_USER}>`,
    bcc: emails,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">${heading}</h2>
        <p>Hello,</p>
        <p>${messageStr}</p>
        <h3 style="text-align: center; color: #007bff; margin: 20px 0;">
          ${homeTeamName} vs ${awayTeamName}
        </h3>
        <p style="text-align: center; font-weight: bold;">Date: ${new Date(date).toLocaleString()}</p>
        <p>Log in to the website to see more details, check standings, and follow the action.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://ngbhs.com'}/matches" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Match Details</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">
          &copy; ${new Date().getFullYear()} NGBHS Reunion. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail] Match announcement sent successfully. MessageId: ${info.messageId}`);
  } catch (error) {
    console.error(`[Mail Error] Failed to send match announcement:`, error);
  }
}
