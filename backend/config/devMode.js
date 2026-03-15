// Development Mode Configuration
// When email is not working, enable dev mode to bypass email verification

const isDevelopment = process.env.NODE_ENV === 'development';
const DEV_MODE_ENABLED = process.env.DEV_MODE === 'true';

// In dev mode, use this fixed OTP for testing
const DEV_OTP = '123456';

// Skip email sending in dev mode
const shouldSkipEmail = () => {
  return isDevelopment && DEV_MODE_ENABLED;
};

// Get OTP for dev mode
const getDevOTP = () => {
  return DEV_OTP;
};

// Log OTP to console in dev mode
const logOTPToConsole = (email, otp, purpose) => {
  if (shouldSkipEmail()) {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 DEV MODE - OTP Generated');
    console.log('='.repeat(60));
    console.log('Email:', email);
    console.log('OTP:', otp);
    console.log('Purpose:', purpose);
    console.log('Expires in:', process.env.OTP_EXPIRE_MINUTES, 'minutes');
    console.log('='.repeat(60) + '\n');
  }
};

export {
  isDevelopment,
  DEV_MODE_ENABLED,
  DEV_OTP,
  shouldSkipEmail,
  getDevOTP,
  logOTPToConsole
};
