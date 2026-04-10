import Credential from '../models/Credential.model.js';
import LearnerProfile from '../models/LearnerProfile.model.js';
import { calculateNSQFLevel } from '../utils/nsqf.util.js';

const normalizeSkill = (skill) => (typeof skill === 'string' ? skill.trim() : '');

export const recomputeLearnerProfileFromVerifiedCredentials = async (userId) => {
  const verifiedCredentials = await Credential.find({
    userId,
    verificationStatus: 'verified',
  })
    .select('skills credits')
    .lean();

  const skillMap = new Map();
  let totalCredits = 0;

  verifiedCredentials.forEach((credential) => {
    totalCredits += Number(credential.credits) || 0;

    (credential.skills || []).forEach((rawSkill) => {
      const cleaned = normalizeSkill(rawSkill);
      if (!cleaned) return;

      const key = cleaned.toLowerCase();
      if (!skillMap.has(key)) {
        skillMap.set(key, cleaned);
      }
    });
  });

  const computedSkills = Array.from(skillMap.values());
  const nsqfInfo = calculateNSQFLevel(totalCredits);

  let profile = await LearnerProfile.findOne({ userId });
  if (!profile) {
    profile = new LearnerProfile({ userId });
  }

  profile.skills = computedSkills;
  profile.totalCredits = totalCredits;
  profile.nsqfLevel = nsqfInfo.level;
  profile.levelName = nsqfInfo.levelName;

  await profile.save();

  return profile;
};

export default {
  recomputeLearnerProfileFromVerifiedCredentials,
};
