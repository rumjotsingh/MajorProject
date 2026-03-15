import mongoose from 'mongoose';
import Institute from '../models/Institute.model.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestInstitute = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if test institute already exists
    const existing = await Institute.findOne({ 
      email: 'test.institute@credmatrix.com' 
    });

    if (existing) {
      console.log('\n✅ Test Institute Already Exists:');
      console.log('   Email:', existing.email);
      console.log('   Institute Name:', existing.instituteName);
      console.log('   Institute Code:', existing.instituteCode);
      console.log('   Approval Status:', existing.approvalStatus);
      console.log('   Is Active:', existing.isActive);
      
      if (existing.approvalStatus !== 'approved') {
        existing.approvalStatus = 'approved';
        existing.approvedAt = new Date();
        existing.isActive = true;
        await existing.save();
        console.log('\n✅ Updated to APPROVED status');
      }
      
      console.log('\n📋 Use this code to join:');
      console.log('   ', existing.instituteCode);
      process.exit(0);
    }

    // Create new test institute - don't set instituteStatus (it's for learners only)
    const testInstitute = await Institute.create({
      email: 'test.institute@credmatrix.com',
      password: 'Test@123456',
      instituteName: 'Test Institute of Technology',
      registrationNumber: 'TEST-REG-2024',
      website: 'https://test-institute.edu',
      contactPerson: {
        name: 'Test Admin',
        phone: '+91 9876543210'
      },
      address: {
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India'
      },
      approvalStatus: 'approved', // Pre-approved for testing
      approvedAt: new Date(),
      isActive: true
    });

    console.log('\n✅ Test Institute Created Successfully!');
    console.log('\n📋 Institute Details:');
    console.log('   Email:', testInstitute.email);
    console.log('   Password: Test@123456');
    console.log('   Institute Name:', testInstitute.instituteName);
    console.log('   Institute Code:', testInstitute.instituteCode);
    console.log('   Approval Status:', testInstitute.approvalStatus);
    console.log('   Is Active:', testInstitute.isActive);
    
    console.log('\n📋 Use this code to join:');
    console.log('   ', testInstitute.instituteCode);
    
    console.log('\n📋 Login Credentials:');
    console.log('   Email: test.institute@credmatrix.com');
    console.log('   Password: Test@123456');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestInstitute();
