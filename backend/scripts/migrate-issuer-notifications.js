import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Credential from '../models/Credential.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import Issuer from '../models/Issuer.model.js';
import logger from '../utils/logger.js';

dotenv.config();

/**
 * Migration script to create notifications for issuers for existing credentials
 * This ensures issuers can see historical credential activities
 */
async function migrateIssuerNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Get all credentials
    const credentials = await Credential.find({})
      .populate('userId', 'name email')
      .populate('issuerId', 'name contactEmail')
      .sort({ createdAt: 1 });

    logger.info(`Found ${credentials.length} credentials to process`);

    let notificationsCreated = 0;
    let notificationsSkipped = 0;

    for (const credential of credentials) {
      try {
        // Find issuer user account
        const issuerUser = await User.findOne({
          email: credential.issuerId?.contactEmail,
          role: 'Issuer'
        });

        if (!issuerUser) {
          logger.warn(`No issuer user found for credential ${credential._id}`);
          notificationsSkipped++;
          continue;
        }

        // Check if notification already exists
        const existingNotification = await Notification.findOne({
          userId: issuerUser._id,
          'metadata.credentialId': credential._id
        });

        if (existingNotification) {
          notificationsSkipped++;
          continue;
        }

        // Create notification based on credential status
        let message = '';
        let type = 'System';

        if (credential.verificationStatus === 'verified') {
          message = `Credential "${credential.title}" has been verified for ${credential.userId?.name || 'learner'}`;
          type = 'CredentialVerified';
        } else if (credential.verificationStatus === 'pending') {
          message = `New credential "${credential.title}" uploaded by ${credential.userId?.name || 'learner'} and requires verification`;
          type = 'System';
        } else if (credential.verificationStatus === 'rejected' || credential.verificationStatus === 'failed') {
          message = `Credential "${credential.title}" verification failed for ${credential.userId?.name || 'learner'}`;
          type = 'System';
        } else {
          message = `Credential "${credential.title}" issued to ${credential.userId?.name || 'learner'}`;
          type = 'System';
        }

        // Create notification with original credential creation date
        await Notification.create({
          userId: issuerUser._id,
          type,
          message,
          read: false,
          metadata: {
            credentialId: credential._id,
            learnerId: credential.userId?._id
          },
          createdAt: credential.createdAt,
          updatedAt: credential.updatedAt
        });

        notificationsCreated++;
        
        if (notificationsCreated % 10 === 0) {
          logger.info(`Progress: ${notificationsCreated} notifications created`);
        }
      } catch (error) {
        logger.error(`Error processing credential ${credential._id}:`, error.message);
        notificationsSkipped++;
      }
    }

    logger.info('Migration completed!');
    logger.info(`Notifications created: ${notificationsCreated}`);
    logger.info(`Notifications skipped: ${notificationsSkipped}`);

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateIssuerNotifications();
