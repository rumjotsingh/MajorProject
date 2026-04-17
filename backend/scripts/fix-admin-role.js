import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

async function fixAdminRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find user with lowercase "admin" role
    const user = await User.findOne({ email: "admin@admin.com" });
    
    if (user) {
      console.log('Found user:');
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Current role: "${user.role}"`);
      
      // Update role to proper case
      user.role = 'Admin';
      user.isActive = true;
      await user.save();
      
      console.log('✅ User role updated to "Admin"');
      console.log('✅ User set to active');
      
      // Verify the update
      const updatedUser = await User.findOne({ email: "admin@admin.com" });
      console.log(`New role: "${updatedUser.role}"`);
      
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixAdminRole();