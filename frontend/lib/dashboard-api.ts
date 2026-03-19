import api from "./api";

// Dashboard API Types
export interface DashboardStats {
  totalCredentials: number;
  verifiedCredentials: number;
  pendingCredentials: number;
  nsqfLevel: number;
}

export interface Credential {
  _id: string;
  title: string;
  issuerId: {
    _id: string;
    name: string;
  };
  issueDate: string;
  verificationStatus: "verified" | "pending" | "rejected";
  nsqfLevel: number;
  skills: string[];
  certificateUrl: string;
  createdAt: string;
}

export interface LearnerProfile {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  bio?: string;
  skills: string[];
  nsqfLevel: number;
  levelName?: string;
  totalCredits?: number;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    fieldOfStudy: string;
  }>;
  experience?: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
}

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// API Functions
export const dashboardAPI = {
  // Get learner profile
  getProfile: async (): Promise<LearnerProfile> => {
    const response = await api.get("/profile/me");
    return response.data;
  },

  // Get all credentials
  getCredentials: async (): Promise<Credential[]> => {
    const response = await api.get("/credentials");
    // Handle both old array format and new pagination format
    if (response.data.credentials) {
      return response.data.credentials;
    }
    return response.data;
  },

  // Get notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get("/notifications");
    return response.data;
  },

  // Calculate dashboard stats from credentials
  calculateStats: (credentials: Credential[], profile: LearnerProfile): DashboardStats => {
    const totalCredentials = credentials.length;
    const verifiedCredentials = credentials.filter(
      (c) => c.verificationStatus === "verified"
    ).length;
    const pendingCredentials = credentials.filter(
      (c) => c.verificationStatus === "pending"
    ).length;
    const nsqfLevel = profile.nsqfLevel || 1;

    return {
      totalCredentials,
      verifiedCredentials,
      pendingCredentials,
      nsqfLevel,
    };
  },

  // Get skill distribution from profile
  getSkillDistribution: (profile: LearnerProfile, credentials: Credential[]) => {
    const skillCount: Record<string, number> = {};

    // Count skills from credentials
    credentials.forEach((cred) => {
      cred.skills.forEach((skill) => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    const skills = Object.entries(skillCount)
      .map(([name, count]) => ({
        name,
        count,
        level: Math.min(100, (count / credentials.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 skills

    return skills;
  },
};
