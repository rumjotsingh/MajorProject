import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

async function checkAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all admin users
    const adminUsers = await User.find({ role: 'Admin' });
    console.log('\n=== Admin Users ===');
    console.log(`Found ${adminUsers.length} admin users:`);
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });

    // Check for users with similar roles (case issues)
    const similarRoles = await User.find({ 
      role: { $regex: /admin/i, $ne: 'Admin' } 
    });
    
    if (similarRoles.length > 0) {
      console.log('=== Users with similar roles (potential case issues) ===');
      similarRoles.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}, Email: ${user.email}, Role: "${user.role}"`);
      });
    }

    // Prompt for email to check specific user
    if (process.argv[2]) {
      const email = process.argv[2];
      console.log(`\n=== Checking user: ${email} ===`);
      
      const user = await User.findOne({ email });
      if (user) {
        console.log('User found:');
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: "${user.role}"`);
        console.log(`Active: ${user.isActive}`);
        console.log(`Created: ${user.createdAt}`);
        
        if (user.role !== 'Admin') {
          console.log('\n⚠️  User is not an Admin!');
          console.log('To make this user an admin, run:');
          console.log(`node check-admin-user.js ${email} promote`);
        } else {
          console.log('\n✅ User has Admin role');
        }
      } else {
        console.log('❌ User not found');
      }
    }

    // Promote user to admin if requested
    if (process.argv[2] && process.argv[3] === 'promote') {
      const email = process.argv[2];
      const user = await User.findOne({ email });
      
      if (user) {
        user.role = 'Admin';
        user.isActive = true;
        await user.save();
        console.log(`\n✅ User ${email} promoted to Admin`);
      } else {
        console.log(`\n❌ User ${email} not found`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Usage examples:
console.log('Usage:');
console.log('  node check-admin-user.js                    # List all admin users');
console.log('  node check-admin-user.js user@example.com   # Check specific user');
console.log('  node check-admin-user.js user@example.com promote # Promote user to admin');
console.log('');

checkAdminUser();