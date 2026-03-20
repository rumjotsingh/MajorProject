import mongoose from 'mongoose';
import LearnerProfile from '../models/LearnerProfile.model.js';
import dotenv from 'dotenv';

dotenv.config();

const fixProfileArrays = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all profiles
    const profiles = await LearnerProfile.find({});

    console.log(`Found ${profiles.length} profiles to check`);

    let fixedCount = 0;

    for (const profile of profiles) {
      const updates = {};

      // Fix education field - check if it's not an array, is empty, or contains strings
      if (!Array.isArray(profile.education)) {
        updates.education = [];
        console.log(`Fixing education (not array) for profile ${profile._id}`);
        fixedCount++;
      } else if (profile.education.length > 0) {
        // Check if array contains strings instead of objects
        const hasStrings = profile.education.some(item => typeof item === 'string');
        if (hasStrings) {
          updates.education = [];
          console.log(`Fixing education (contains strings) for profile ${profile._id}`);
          fixedCount++;
        }
      }

      // Fix experience field - check if it's not an array, is empty, or contains strings
      if (!Array.isArray(profile.experience)) {
        updates.experience = [];
        console.log(`Fixing experience (not array) for profile ${profile._id}`);
        fixedCount++;
      } else if (profile.experience.length > 0) {
        // Check if array contains strings instead of objects
        const hasStrings = profile.experience.some(item => typeof item === 'string');
        if (hasStrings) {
          updates.experience = [];
          console.log(`Fixing experience (contains strings) for profile ${profile._id}`);
          fixedCount++;
        }
      }

      if (Object.keys(updates).length > 0) {
        await LearnerProfile.updateOne({ _id: profile._id }, { $set: updates });
      }
    }

    console.log(`✅ Fixed ${fixedCount} profile fields successfully`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing profiles:', error);
    process.exit(1);
  }
};

fixProfileArrays();
