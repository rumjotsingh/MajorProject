import mongoose from 'mongoose';
import User from '../models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: 'admin@credmatrix.com',
      role: 'admin'
    });

    if (existingAdmin) {
      console.log('✅ Admin User Already Exists:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      console.log('   Is Active:', existingAdmin.isActive);
      console.log('   Is Approved:', existingAdmin.isApproved);
      
      console.log('\n📋 Login Credentials:');
      console.log('   Email: admin@credmatrix.com');
      console.log('   Password: Admin@123456');
      
      process.exit(0);
    }

    // Create new admin user
    const admin = await User.create({
      email: 'admin@credmatrix.com',
      password: 'Admin@123456',
      role: 'admin',
      isActive: true,
      isApproved: true
    });

    console.log('✅ Admin User Created Successfully!\n');
    console.log('📋 Admin Details:');
    console.log('   ID:', admin._id);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Is Active:', admin.isActive);
    console.log('   Is Approved:', admin.isApproved);
    
    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@credmatrix.com');
    console.log('   Password: Admin@123456');
    
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n✅ You can now login at: http://localhost:3000/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();
