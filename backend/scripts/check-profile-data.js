import mongoose from 'mongoose';
import LearnerProfile from '../models/LearnerProfile.model.js';
import dotenv from 'dotenv';

dotenv.config();

const checkProfileData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const profiles = await LearnerProfile.find({}).limit(5);

    console.log(`\nFound ${profiles.length} profiles:\n`);

    profiles.forEach((profile, index) => {
      console.log(`Profile ${index + 1}:`);
      console.log(`  ID: ${profile._id}`);
      console.log(`  Education type: ${typeof profile.education}, isArray: ${Array.isArray(profile.education)}`);
      console.log(`  Education value:`, JSON.stringify(profile.education));
      console.log(`  Experience type: ${typeof profile.experience}, isArray: ${Array.isArray(profile.experience)}`);
      console.log(`  Experience value:`, JSON.stringify(profile.experience));
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkProfileData();
