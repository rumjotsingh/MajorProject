import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CareerPath from '../models/CareerPath.model.js';

dotenv.config();

const careerPaths = [
  {
    title: "Full Stack Developer",
    description: "Build complete web applications from frontend to backend, working with modern frameworks and databases.",
    requiredSkills: ["JavaScript", "React", "Node.js", "MongoDB", "REST APIs", "Git"],
    nsqfLevelRange: { min: 5, max: 8 },
    averageSalary: "₹6-15 LPA",
    growthRate: "22% annually",
    industry: "Technology",
    experienceLevel: "Mid",
    demand: "Very High",
    jobOpenings: 15000,
    educationRequired: "Bachelor's in Computer Science or equivalent",
    certifications: ["AWS Certified Developer", "MongoDB Certified Developer"],
    careerProgression: ["Junior Developer", "Full Stack Developer", "Senior Developer", "Tech Lead", "Engineering Manager"],
    workEnvironment: "Remote-friendly, collaborative teams, agile methodology",
    keyResponsibilities: [
      "Design and develop web applications",
      "Write clean, maintainable code",
      "Collaborate with designers and product managers",
      "Debug and optimize application performance"
    ],
    tools: ["VS Code", "Git", "Docker", "Postman", "Jira"],
    relatedRoles: ["Frontend Developer", "Backend Developer", "DevOps Engineer"],
    color: "blue"
  },
  {
    title: "Data Scientist",
    description: "Analyze complex data sets to extract insights and build predictive models using machine learning.",
    requiredSkills: ["Python", "Machine Learning", "Statistics", "SQL", "Data Visualization", "Pandas"],
    nsqfLevelRange: { min: 6, max: 9 },
    averageSalary: "₹8-20 LPA",
    growthRate: "28% annually",
    industry: "Technology",
    experienceLevel: "Mid",
    demand: "Very High",
    jobOpenings: 12000,
    educationRequired: "Master's in Data Science, Statistics, or related field",
    certifications: ["Google Data Analytics", "AWS Machine Learning Specialty"],
    careerProgression: ["Data Analyst", "Data Scientist", "Senior Data Scientist", "Lead Data Scientist", "Chief Data Officer"],
    workEnvironment: "Hybrid, research-oriented, cross-functional collaboration",
    keyResponsibilities: [
      "Build and deploy machine learning models",
      "Analyze large datasets for business insights",
      "Create data visualizations and reports",
      "Collaborate with stakeholders on data strategy"
    ],
    tools: ["Jupyter", "TensorFlow", "Tableau", "Apache Spark", "Git"],
    relatedRoles: ["Machine Learning Engineer", "Data Analyst", "AI Researcher"],
    color: "indigo"
  },
  {
    title: "UI/UX Designer",
    description: "Create intuitive and beautiful user interfaces that enhance user experience across digital products.",
    requiredSkills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems", "HTML/CSS"],
    nsqfLevelRange: { min: 4, max: 7 },
    averageSalary: "₹5-12 LPA",
    growthRate: "18% annually",
    industry: "Design",
    experienceLevel: "Mid",
    demand: "High",
    jobOpenings: 8000,
    educationRequired: "Bachelor's in Design, HCI, or related field",
    certifications: ["Google UX Design Certificate", "Nielsen Norman Group UX Certification"],
    careerProgression: ["Junior Designer", "UI/UX Designer", "Senior Designer", "Lead Designer", "Design Director"],
    workEnvironment: "Creative studios, remote-friendly, collaborative",
    keyResponsibilities: [
      "Conduct user research and usability testing",
      "Create wireframes and high-fidelity mockups",
      "Design and maintain design systems",
      "Collaborate with developers and product teams"
    ],
    tools: ["Figma", "Adobe XD", "Sketch", "InVision", "Miro"],
    relatedRoles: ["Product Designer", "Visual Designer", "Interaction Designer"],
    color: "pink"
  },
  {
    title: "DevOps Engineer",
    description: "Automate and streamline software development and deployment processes using modern DevOps practices.",
    requiredSkills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform"],
    nsqfLevelRange: { min: 6, max: 9 },
    averageSalary: "₹7-18 LPA",
    growthRate: "25% annually",
    industry: "Technology",
    experienceLevel: "Senior",
    demand: "Very High",
    jobOpenings: 10000,
    educationRequired: "Bachelor's in Computer Science or equivalent",
    certifications: ["AWS Certified DevOps Engineer", "Kubernetes Administrator (CKA)"],
    careerProgression: ["System Administrator", "DevOps Engineer", "Senior DevOps Engineer", "DevOps Architect", "VP of Engineering"],
    workEnvironment: "Fast-paced, on-call rotations, remote-friendly",
    keyResponsibilities: [
      "Build and maintain CI/CD pipelines",
      "Manage cloud infrastructure",
      "Monitor system performance and reliability",
      "Automate deployment processes"
    ],
    tools: ["Jenkins", "Docker", "Kubernetes", "Terraform", "Prometheus"],
    relatedRoles: ["Site Reliability Engineer", "Cloud Engineer", "Platform Engineer"],
    color: "green"
  },
  {
    title: "Mobile App Developer",
    description: "Develop native and cross-platform mobile applications for iOS and Android devices.",
    requiredSkills: ["React Native", "Flutter", "Swift", "Kotlin", "Mobile UI", "REST APIs"],
    nsqfLevelRange: { min: 5, max: 8 },
    averageSalary: "₹6-14 LPA",
    growthRate: "20% annually",
    industry: "Technology",
    experienceLevel: "Mid",
    demand: "High",
    jobOpenings: 9000,
    educationRequired: "Bachelor's in Computer Science or equivalent",
    certifications: ["Google Associate Android Developer", "Apple iOS Developer"],
    careerProgression: ["Junior Mobile Developer", "Mobile Developer", "Senior Mobile Developer", "Mobile Architect", "Engineering Manager"],
    workEnvironment: "Agile teams, remote-friendly, product-focused",
    keyResponsibilities: [
      "Develop mobile applications for iOS and Android",
      "Optimize app performance and user experience",
      "Integrate with backend APIs",
      "Publish and maintain apps on app stores"
    ],
    tools: ["Xcode", "Android Studio", "VS Code", "Firebase", "Git"],
    relatedRoles: ["iOS Developer", "Android Developer", "Cross-Platform Developer"],
    color: "violet"
  },
  {
    title: "Cybersecurity Analyst",
    description: "Protect organizations from cyber threats by monitoring, detecting, and responding to security incidents.",
    requiredSkills: ["Network Security", "Penetration Testing", "SIEM", "Incident Response", "Cryptography", "Linux"],
    nsqfLevelRange: { min: 6, max: 9 },
    averageSalary: "₹7-16 LPA",
    growthRate: "31% annually",
    industry: "Security",
    experienceLevel: "Mid",
    demand: "Very High",
    jobOpenings: 7000,
    educationRequired: "Bachelor's in Cybersecurity, Computer Science, or related field",
    certifications: ["CISSP", "CEH", "CompTIA Security+"],
    careerProgression: ["Security Analyst", "Senior Security Analyst", "Security Engineer", "Security Architect", "CISO"],
    workEnvironment: "24/7 operations, SOC environment, hybrid",
    keyResponsibilities: [
      "Monitor security alerts and incidents",
      "Conduct vulnerability assessments",
      "Implement security controls",
      "Respond to security breaches"
    ],
    tools: ["Splunk", "Wireshark", "Metasploit", "Nessus", "Burp Suite"],
    relatedRoles: ["Penetration Tester", "Security Engineer", "SOC Analyst"],
    color: "red"
  },
  {
    title: "Cloud Architect",
    description: "Design and implement scalable cloud infrastructure solutions using AWS, Azure, or Google Cloud.",
    requiredSkills: ["AWS", "Azure", "Cloud Architecture", "Microservices", "Networking", "Security"],
    nsqfLevelRange: { min: 7, max: 10 },
    averageSalary: "₹12-25 LPA",
    growthRate: "24% annually",
    industry: "Technology",
    experienceLevel: "Senior",
    demand: "Very High",
    jobOpenings: 6000,
    educationRequired: "Bachelor's in Computer Science or equivalent",
    certifications: ["AWS Solutions Architect", "Azure Solutions Architect", "Google Cloud Architect"],
    careerProgression: ["Cloud Engineer", "Senior Cloud Engineer", "Cloud Architect", "Principal Architect", "CTO"],
    workEnvironment: "Strategic planning, remote-friendly, consulting",
    keyResponsibilities: [
      "Design cloud infrastructure solutions",
      "Optimize cloud costs and performance",
      "Ensure security and compliance",
      "Lead cloud migration projects"
    ],
    tools: ["AWS Console", "Terraform", "CloudFormation", "Ansible", "Docker"],
    relatedRoles: ["Solutions Architect", "Infrastructure Architect", "Cloud Engineer"],
    color: "teal"
  },
  {
    title: "Product Manager",
    description: "Define product vision and strategy, working with cross-functional teams to deliver successful products.",
    requiredSkills: ["Product Strategy", "User Research", "Agile", "Data Analysis", "Roadmapping", "Stakeholder Management"],
    nsqfLevelRange: { min: 6, max: 9 },
    averageSalary: "₹10-22 LPA",
    growthRate: "19% annually",
    industry: "Technology",
    experienceLevel: "Senior",
    demand: "High",
    jobOpenings: 5000,
    educationRequired: "Bachelor's in Business, Engineering, or related field; MBA preferred",
    certifications: ["Certified Scrum Product Owner", "Product Management Certificate"],
    careerProgression: ["Associate PM", "Product Manager", "Senior PM", "Group PM", "VP of Product"],
    workEnvironment: "Cross-functional collaboration, strategic planning, hybrid",
    keyResponsibilities: [
      "Define product vision and roadmap",
      "Prioritize features and requirements",
      "Analyze market and user data",
      "Coordinate with engineering and design teams"
    ],
    tools: ["Jira", "Figma", "Google Analytics", "Mixpanel", "Miro"],
    relatedRoles: ["Technical Product Manager", "Product Owner", "Program Manager"],
    color: "orange"
  }
];

async function seedCareerPaths() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing career paths
    await CareerPath.deleteMany({});
    console.log('Cleared existing career paths');

    // Insert new career paths
    const result = await CareerPath.insertMany(careerPaths);
    console.log(`✓ Seeded ${result.length} career paths`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding career paths:', error);
    process.exit(1);
  }
}

seedCareerPaths();
