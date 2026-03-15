import nodemailer from 'nodemailer';
import dns from 'dns';
import { shouldSkipEmail, logOTPToConsole } from '../config/devMode.js';

// Force IPv4 resolution for Windows
dns.setDefaultResultOrder('ipv4first');

const createTransporter = () => {
  const port = parseInt(process.env.EMAIL_PORT);
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    // Force IPv4 to avoid IPv6 connection issues
    family: 4,
    // Connection timeout
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
};

const sendEmail = async (to, subject, html) => {
  // In dev mode, skip email and log to console
  if (shouldSkipEmail()) {
    console.log('\n🔧 DEV MODE: Email skipped (logged to console)');
    console.log('To:', to);
    console.log('Subject:', subject);
    return true;
  }
  
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    
    // In development, still return true to allow testing
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Email failed but continuing in development mode');
      return true;
    }
    
    return false;
  }
};

const sendOTPEmail = async (email, otp, purpose) => {
  // Log OTP to console in dev mode
  logOTPToConsole(email, otp, purpose);
  
  const subjects = {
    email_verification: 'Verify Your Email - Micro-Credential Platform',
    password_reset: 'Password Reset Request - Micro-Credential Platform',
    account_claim: 'Account Claim Verification - Micro-Credential Platform'
  };
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verification Code</h2>
      <p>Your OTP code is:</p>
      <h1 style="background: #f4f4f4; padding: 20px; text-align: center; letter-spacing: 5px;">
        ${otp}
      </h1>
      <p>This code will expire in ${process.env.OTP_EXPIRE_MINUTES} minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Micro-Credential Aggregator Platform
      </p>
    </div>
  `;
  
  return await sendEmail(email, subjects[purpose], html);
};

const sendApprovalEmail = async (email, instituteName, status, reason = '') => {
  const subject = `Institute ${status === 'approved' ? 'Approval' : 'Rejection'} - Micro-Credential Platform`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Institute ${status === 'approved' ? 'Approved' : 'Rejected'}</h2>
      <p>Dear ${instituteName},</p>
      ${status === 'approved' 
        ? '<p>Your institute has been approved. You can now start issuing credentials.</p>'
        : `<p>Your institute application has been rejected.</p><p><strong>Reason:</strong> ${reason}</p>`
      }
      <hr>
      <p style="color: #666; font-size: 12px;">
        Micro-Credential Aggregator Platform
      </p>
    </div>
  `;
  
  return await sendEmail(email, subject, html);
};

export {
  sendEmail,
  sendOTPEmail,
  sendApprovalEmail
};
