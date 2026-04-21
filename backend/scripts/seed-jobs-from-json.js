import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Job from '../models/Job.model.js';
import Employer from '../models/Employer.model.js';
import logger from '../utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REQUIRED_FIELDS = [
  'employerId',
  'title',
  'description',
  'requiredSkills',
  'nsqfLevel',
  'location',
  'status',
];

async function loadJobsFromJson() {
  const jsonPath = join(__dirname, 'jobs50.json');
  const jsonData = await readFile(jsonPath, 'utf-8');
  const jobs = JSON.parse(jsonData);

  if (!Array.isArray(jobs)) {
    throw new Error('jobs50.json must contain an array of jobs');
  }

  jobs.forEach((job, index) => {
    REQUIRED_FIELDS.forEach((field) => {
      if (job[field] === undefined || job[field] === null || job[field] === '') {
        throw new Error(`Job at index ${index} is missing required field: ${field}`);
      }
    });
  });

  return jobs;
}

async function seedJobs() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    const jobs = await loadJobsFromJson();

    const employerIds = [...new Set(jobs.map((job) => job.employerId))];
    const existingEmployers = await Employer.find({ _id: { $in: employerIds } })
      .select('_id')
      .lean();

    const existingEmployerIds = new Set(existingEmployers.map((emp) => emp._id.toString()));
    const missingEmployers = employerIds.filter((id) => !existingEmployerIds.has(id));

    if (missingEmployers.length > 0) {
      throw new Error(`Employer IDs not found: ${missingEmployers.join(', ')}`);
    }

    const result = await Job.insertMany(jobs, { ordered: true });
    logger.info(`Successfully inserted ${result.length} jobs from jobs50.json`);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding jobs from JSON:', error.message || error);
    process.exit(1);
  }
}

seedJobs();
