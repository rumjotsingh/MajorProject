import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NSQFMapping from '../models/NSQFMapping.model.js';
import logger from '../utils/logger.js';

dotenv.config();

const sampleMappings = [
  {
    skill: 'Certificate in Web Development',
    nsqfLevel: 4,
    description: 'Basic web development skills including HTML, CSS, and JavaScript',
  },
  {
    skill: 'Diploma in Full Stack Development',
    nsqfLevel: 5,
    description: 'Comprehensive full-stack development with frontend and backend technologies',
  },
  {
    skill: 'Certificate in Data Analytics',
    nsqfLevel: 4,
    description: 'Foundational data analysis skills with Excel, SQL, and basic statistics',
  },
  {
    skill: 'Diploma in Data Science',
    nsqfLevel: 6,
    description: 'Advanced data science including machine learning and data visualization',
  },
  {
    skill: 'Certificate in Digital Marketing',
    nsqfLevel: 3,
    description: 'Basic digital marketing concepts including SEO, social media, and content marketing',
  },
  {
    skill: 'Diploma in Digital Marketing',
    nsqfLevel: 5,
    description: 'Advanced digital marketing strategies and analytics',
  },
  {
    skill: 'Certificate in Graphic Design',
    nsqfLevel: 4,
    description: 'Fundamental graphic design principles and tools',
  },
  {
    skill: 'Diploma in UI/UX Design',
    nsqfLevel: 5,
    description: 'User interface and user experience design with prototyping',
  },
  {
    skill: 'Certificate in Cloud Computing',
    nsqfLevel: 5,
    description: 'Cloud infrastructure and services (AWS, Azure, GCP)',
  },
  {
    skill: 'Diploma in Cybersecurity',
    nsqfLevel: 6,
    description: 'Network security, ethical hacking, and security operations',
  },
  {
    skill: 'Certificate in Mobile App Development',
    nsqfLevel: 4,
    description: 'Mobile application development for iOS and Android',
  },
  {
    skill: 'Diploma in Artificial Intelligence',
    nsqfLevel: 7,
    description: 'AI and machine learning algorithms and applications',
  },
  {
    skill: 'Certificate in Project Management',
    nsqfLevel: 5,
    description: 'Project management fundamentals and methodologies',
  },
  {
    skill: 'Certificate in Business Analytics',
    nsqfLevel: 5,
    description: 'Business intelligence and analytics tools',
  },
  {
    skill: 'Diploma in Software Engineering',
    nsqfLevel: 6,
    description: 'Software development lifecycle and engineering practices',
  },
];

async function seedNSQFMappings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear existing mappings (optional - comment out if you want to keep existing data)
    // await NSQFMapping.deleteMany({});
    // logger.info('Cleared existing NSQF mappings');

    // Check if mappings already exist
    const existingCount = await NSQFMapping.countDocuments();
    if (existingCount > 0) {
      logger.info(`Found ${existingCount} existing NSQF mappings. Skipping seed.`);
      logger.info('To reseed, delete existing mappings first or uncomment the deleteMany line.');
      process.exit(0);
    }

    // Insert sample mappings
    const result = await NSQFMapping.insertMany(sampleMappings);
    logger.info(`Successfully seeded ${result.length} NSQF mappings`);

    // Display summary
    const levelCounts = await NSQFMapping.aggregate([
      {
        $group: {
          _id: '$nsqfLevel',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    logger.info('Mappings by NSQF Level:');
    levelCounts.forEach(level => {
      logger.info(`  Level ${level._id}: ${level.count} mappings`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding NSQF mappings:', error);
    process.exit(1);
  }
}

// Run the seed function
seedNSQFMappings();
