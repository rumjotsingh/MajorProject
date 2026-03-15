import mongoose from 'mongoose';
import Pathway from '../models/Pathway.model.js';
import { nsqfPathwayData } from '../data/nsqfData.js';
import dotenv from 'dotenv';

dotenv.config();

const additionalPathways = [
  {
    name: "Information Technology Pathway",
    description: "Comprehensive IT skills progression from basic computer literacy to advanced software engineering and system architecture.",
    category: "Technology",
    isGlobal: true,
    isActive: true,
    icon: "💻",
    totalLevels: 10,
    levels: [
      {
        level: 1,
        requiredCredits: 10,
        title: "Digital Literacy",
        description: "Basic computer operations, internet usage, and digital communication. Skills: Computer Basics, Internet Browsing, Email, MS Office"
      },
      {
        level: 2,
        requiredCredits: 25,
        title: "IT Fundamentals",
        description: "Understanding of IT concepts, basic programming, and web technologies. Skills: HTML/CSS, Basic Programming, Database Basics, Networking Fundamentals"
      },
      {
        level: 3,
        requiredCredits: 45,
        title: "Junior Developer",
        description: "Frontend and backend development with modern frameworks. Skills: JavaScript, React/Angular, Node.js, SQL, Git"
      },
      {
        level: 4,
        requiredCredits: 70,
        title: "Software Developer",
        description: "Full-stack development with cloud and DevOps knowledge. Skills: Full Stack Development, Cloud Services, Docker, CI/CD, API Design"
      },
      {
        level: 5,
        requiredCredits: 100,
        title: "Senior Developer",
        description: "Advanced development with architecture and team leadership. Skills: System Design, Microservices, Kubernetes, Security, Team Leadership"
      },
      {
        level: 6,
        requiredCredits: 130,
        title: "Tech Lead",
        description: "Technical leadership with project management and mentoring. Skills: Architecture Design, Project Management, Mentoring, Code Review, Agile"
      },
      {
        level: 7,
        requiredCredits: 160,
        title: "Engineering Manager",
        description: "Engineering management with strategic planning. Skills: Team Management, Strategic Planning, Budgeting, Stakeholder Management"
      },
      {
        level: 8,
        requiredCredits: 190,
        title: "Principal Engineer",
        description: "Technical excellence with organization-wide impact. Skills: Technical Strategy, Innovation, Cross-team Leadership, Industry Expertise"
      },
      {
        level: 9,
        requiredCredits: 220,
        title: "VP Engineering",
        description: "Executive leadership in engineering and technology. Skills: Executive Leadership, Business Strategy, Organizational Design, Vision Setting"
      },
      {
        level: 10,
        requiredCredits: 250,
        title: "CTO / Technology Expert",
        description: "Chief technology officer or recognized industry expert. Skills: Technology Vision, Industry Leadership, Innovation Strategy, Board Advisory"
      }
    ]
  },
  {
    name: "Healthcare Professional Pathway",
    description: "Medical and healthcare career progression from basic health worker to specialized medical professional.",
    category: "Healthcare",
    isGlobal: true,
    isActive: true,
    icon: "🏥",
    totalLevels: 10,
    levels: [
      {
        level: 1,
        requiredCredits: 10,
        title: "Health Worker",
        description: "Basic health awareness and first aid. Skills: First Aid, Basic Hygiene, Health Awareness, Patient Care Basics"
      },
      {
        level: 2,
        requiredCredits: 25,
        title: "Nursing Assistant",
        description: "Patient care and basic medical procedures. Skills: Patient Care, Vital Signs, Medical Terminology, Infection Control"
      },
      {
        level: 3,
        requiredCredits: 45,
        title: "Staff Nurse",
        description: "Registered nursing with clinical skills. Skills: Clinical Nursing, Medication Administration, Patient Assessment, Documentation"
      },
      {
        level: 4,
        requiredCredits: 70,
        title: "Senior Nurse",
        description: "Advanced nursing with specialization. Skills: Specialized Care, Emergency Response, Team Coordination, Patient Education"
      },
      {
        level: 5,
        requiredCredits: 100,
        title: "Nurse Practitioner",
        description: "Advanced practice nursing with diagnostic authority. Skills: Diagnosis, Treatment Planning, Prescribing, Advanced Assessment"
      },
      {
        level: 6,
        requiredCredits: 130,
        title: "Medical Officer",
        description: "General medical practice and patient management. Skills: General Medicine, Surgery Basics, Patient Management, Medical Ethics"
      },
      {
        level: 7,
        requiredCredits: 160,
        title: "Specialist Doctor",
        description: "Specialized medical practice in chosen field. Skills: Specialized Medicine, Advanced Procedures, Research, Teaching"
      },
      {
        level: 8,
        requiredCredits: 190,
        title: "Senior Consultant",
        description: "Expert medical consultation and complex case management. Skills: Expert Consultation, Complex Cases, Medical Leadership, Protocol Development"
      },
      {
        level: 9,
        requiredCredits: 220,
        title: "Head of Department",
        description: "Department leadership and medical administration. Skills: Department Management, Policy Making, Quality Assurance, Academic Leadership"
      },
      {
        level: 10,
        requiredCredits: 250,
        title: "Medical Director / Expert",
        description: "Healthcare leadership and medical expertise at highest level. Skills: Healthcare Strategy, Medical Innovation, National Guidelines, Expert Advisory"
      }
    ]
  },
  {
    name: "Business Management Pathway",
    description: "Business and management career progression from entry-level to executive leadership.",
    category: "Business",
    isGlobal: true,
    isActive: true,
    icon: "💼",
    totalLevels: 10,
    levels: [
      {
        level: 1,
        requiredCredits: 10,
        title: "Business Basics",
        description: "Fundamental business concepts and office skills. Skills: Office Skills, Communication, Time Management, Business Etiquette"
      },
      {
        level: 2,
        requiredCredits: 25,
        title: "Junior Executive",
        description: "Entry-level business operations and coordination. Skills: Business Operations, Data Entry, Customer Service, Report Writing"
      },
      {
        level: 3,
        requiredCredits: 45,
        title: "Executive",
        description: "Business analysis and project coordination. Skills: Business Analysis, Project Coordination, Stakeholder Management, Excel Advanced"
      },
      {
        level: 4,
        requiredCredits: 70,
        title: "Senior Executive",
        description: "Team leadership and strategic planning. Skills: Team Leadership, Strategic Planning, Budget Management, Performance Analysis"
      },
      {
        level: 5,
        requiredCredits: 100,
        title: "Manager",
        description: "Department management and business strategy. Skills: Department Management, Business Strategy, P&L Management, Change Management"
      },
      {
        level: 6,
        requiredCredits: 130,
        title: "Senior Manager",
        description: "Multi-team leadership and strategic initiatives. Skills: Multi-team Leadership, Strategic Initiatives, Cross-functional Collaboration, Vendor Management"
      },
      {
        level: 7,
        requiredCredits: 160,
        title: "General Manager",
        description: "Business unit leadership and operational excellence. Skills: Business Unit Leadership, Operational Excellence, Market Strategy, Talent Development"
      },
      {
        level: 8,
        requiredCredits: 190,
        title: "Director",
        description: "Directorial leadership with strategic business impact. Skills: Strategic Leadership, Business Development, Board Reporting, Organizational Design"
      },
      {
        level: 9,
        requiredCredits: 220,
        title: "Vice President",
        description: "Executive leadership with company-wide impact. Skills: Executive Leadership, Corporate Strategy, M&A, Investor Relations"
      },
      {
        level: 10,
        requiredCredits: 250,
        title: "C-Suite Executive",
        description: "CEO, COO, CFO or equivalent executive leadership. Skills: Corporate Vision, Board Governance, Industry Leadership, Global Strategy"
      }
    ]
  },
  {
    name: "Digital Marketing Pathway",
    description: "Digital marketing career progression from basics to strategic marketing leadership.",
    category: "Business",
    isGlobal: true,
    isActive: true,
    icon: "📱",
    totalLevels: 8,
    levels: [
      {
        level: 1,
        requiredCredits: 10,
        title: "Marketing Basics",
        description: "Fundamental marketing concepts and social media. Skills: Marketing Fundamentals, Social Media Basics, Content Writing, Canva Design"
      },
      {
        level: 2,
        requiredCredits: 30,
        title: "Digital Marketing Associate",
        description: "Social media management and content creation. Skills: Social Media Management, Content Creation, Basic SEO, Email Marketing"
      },
      {
        level: 3,
        requiredCredits: 55,
        title: "Digital Marketing Executive",
        description: "Campaign management and analytics. Skills: Campaign Management, Google Analytics, Facebook Ads, SEO/SEM, A/B Testing"
      },
      {
        level: 4,
        requiredCredits: 85,
        title: "Senior Digital Marketer",
        description: "Multi-channel marketing and strategy. Skills: Multi-channel Marketing, Marketing Automation, Conversion Optimization, Budget Management"
      },
      {
        level: 5,
        requiredCredits: 120,
        title: "Marketing Manager",
        description: "Team leadership and marketing strategy. Skills: Team Leadership, Marketing Strategy, Brand Management, ROI Analysis"
      },
      {
        level: 6,
        requiredCredits: 160,
        title: "Senior Marketing Manager",
        description: "Strategic marketing with business impact. Skills: Strategic Marketing, Growth Hacking, Marketing Technology, Cross-functional Leadership"
      },
      {
        level: 7,
        requiredCredits: 200,
        title: "Head of Marketing",
        description: "Marketing leadership and business strategy. Skills: Marketing Leadership, Business Strategy, P&L Ownership, Stakeholder Management"
      },
      {
        level: 8,
        requiredCredits: 240,
        title: "CMO / Marketing Director",
        description: "Chief marketing officer or director-level leadership. Skills: Executive Leadership, Corporate Branding, Market Positioning, Innovation Strategy"
      }
    ]
  }
];

const seedNSQFPathways = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Insert NSQF Official Pathway
    const existingNSQF = await Pathway.findOne({ name: nsqfPathwayData.name });
    
    if (existingNSQF) {
      console.log('✅ NSQF Pathway already exists');
      console.log(`   ID: ${existingNSQF._id}`);
      console.log(`   Name: ${existingNSQF.name}`);
      console.log(`   Levels: ${existingNSQF.levels.length}\n`);
    } else {
      const nsqfPathway = await Pathway.create({
        name: nsqfPathwayData.name,
        description: nsqfPathwayData.description,
        category: nsqfPathwayData.category,
        isGlobal: true,
        isActive: true,
        totalLevels: nsqfPathwayData.totalLevels,
        icon: nsqfPathwayData.icon,
        levels: nsqfPathwayData.levels.map(level => ({
          level: level.level,
          requiredCredits: level.requiredCredits,
          title: level.title,
          description: `${level.description} | Education: ${level.equivalentEducation} | Type: ${level.skillType} | Autonomy: ${level.autonomy}`
        }))
      });

      console.log('✅ NSQF Pathway Created Successfully!');
      console.log(`   ID: ${nsqfPathway._id}`);
      console.log(`   Name: ${nsqfPathway.name}`);
      console.log(`   Levels: ${nsqfPathway.levels.length}\n`);
    }

    // Insert Additional Pathways
    console.log('📚 Creating Additional Pathways...\n');
    
    for (const pathwayData of additionalPathways) {
      const existing = await Pathway.findOne({ name: pathwayData.name });
      
      if (existing) {
        console.log(`⏭️  Skipping "${pathwayData.name}" - already exists`);
      } else {
        const pathway = await Pathway.create(pathwayData);
        console.log(`✅ Created "${pathway.name}"`);
        console.log(`   Category: ${pathway.category}`);
        console.log(`   Levels: ${pathway.levels.length}`);
        console.log(`   ID: ${pathway._id}\n`);
      }
    }

    // Summary
    const totalPathways = await Pathway.countDocuments({ isGlobal: true, isActive: true });
    console.log('\n📊 Summary:');
    console.log(`   Total Active Global Pathways: ${totalPathways}`);
    
    const pathways = await Pathway.find({ isGlobal: true, isActive: true })
      .select('name category totalLevels');
    
    console.log('\n📋 Available Pathways:');
    pathways.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.name} (${p.category}) - ${p.totalLevels} levels`);
    });

    console.log('\n✅ Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedNSQFPathways();
