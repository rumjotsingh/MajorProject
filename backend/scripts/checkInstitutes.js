import mongoose from 'mongoose';
import Institute from '../models/Institute.model.js';
import Learner from '../models/Learner.model.js';
import dotenv from 'dotenv';

dotenv.config();

const checkInstitutes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Count institutes by status
    const total = await Institute.countDocuments();
    const approved = await Institute.countDocuments({ approvalStatus: 'approved', isActive: true });
    const pending = await Institute.countDocuments({ approvalStatus: 'pending' });
    const rejected = await Institute.countDocuments({ approvalStatus: 'rejected' });
    const inactive = await Institute.countDocuments({ isActive: false });

    console.log('📊 Institute Statistics:');
    console.log(`   Total: ${total}`);
    console.log(`   Approved & Active: ${approved}`);
    console.log(`   Pending: ${pending}`);
    console.log(`   Rejected: ${rejected}`);
    console.log(`   Inactive: ${inactive}\n`);

    // List all approved institutes
    const approvedInstitutes = await Institute.find({
      approvalStatus: 'approved',
      isActive: true,
      isDeleted: { $ne: true }
    }).select('instituteName instituteCode email approvalStatus isActive createdAt');

    if (approvedInstitutes.length > 0) {
      console.log('✅ Approved & Active Institutes:\n');
      approvedInstitutes.forEach((inst, idx) => {
        console.log(`${idx + 1}. ${inst.instituteName}`);
        console.log(`   Code: ${inst.instituteCode}`);
        console.log(`   Email: ${inst.email}`);
        console.log(`   Created: ${inst.createdAt.toLocaleDateString()}\n`);
      });
    } else {
      console.log('⚠️  No approved institutes found!');
      console.log('   Run: node scripts/createTestInstitute.js\n');
    }

    // List pending institutes
    const pendingInstitutes = await Institute.find({
      approvalStatus: 'pending'
    }).select('instituteName email createdBy createdAt');

    if (pendingInstitutes.length > 0) {
      console.log('⏳ Pending Approval:\n');
      pendingInstitutes.forEach((inst, idx) => {
        console.log(`${idx + 1}. ${inst.instituteName}`);
        console.log(`   Email: ${inst.email}`);
        console.log(`   Created: ${inst.createdAt.toLocaleDateString()}\n`);
      });
    }

    // Check if any learners are joined
    const joinedLearners = await Learner.countDocuments({ 
      instituteId: { $ne: null } 
    });
    console.log(`👥 Learners Joined to Institutes: ${joinedLearners}\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkInstitutes();
