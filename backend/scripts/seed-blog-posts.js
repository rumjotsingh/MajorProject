import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BlogPost from '../models/BlogPost.model.js';
import User from '../models/User.model.js';

dotenv.config();

const samplePosts = [
  {
    title: "The Future of Credential Management",
    excerpt: "Exploring how blockchain and AI are transforming the way we verify and share educational achievements in the digital age.",
    content: `
      <h2>Introduction</h2>
      <p>The landscape of credential management is undergoing a revolutionary transformation. With the advent of blockchain technology and artificial intelligence, we're witnessing a paradigm shift in how educational achievements are verified, stored, and shared.</p>
      
      <h2>Blockchain: The Trust Layer</h2>
      <p>Blockchain technology provides an immutable, decentralized ledger that ensures the authenticity of credentials. Once a credential is recorded on the blockchain, it cannot be altered or forged, providing unprecedented security and trust.</p>
      
      <h3>Key Benefits:</h3>
      <ul>
        <li>Immutable record keeping</li>
        <li>Decentralized verification</li>
        <li>Reduced fraud</li>
        <li>Instant verification</li>
      </ul>
      
      <h2>AI-Powered Verification</h2>
      <p>Artificial Intelligence is streamlining the verification process, making it faster and more accurate. AI algorithms can detect anomalies, verify authenticity, and even predict skill gaps based on credential data.</p>
      
      <h2>The Road Ahead</h2>
      <p>As we move forward, the integration of these technologies will make credential management more accessible, secure, and efficient for everyone involved - from learners to employers.</p>
    `,
    category: "Technology",
    author: "Sarah Johnson",
    coverImage: "gradient-1",
    tags: ["blockchain", "AI", "credentials", "technology"],
    published: true,
  },
  {
    title: "Building Your Digital Skill Portfolio",
    excerpt: "A comprehensive guide to creating a portfolio that stands out to employers and showcases your continuous learning journey.",
    content: `
      <h2>Why a Digital Portfolio Matters</h2>
      <p>In today's competitive job market, having a well-organized digital skill portfolio is no longer optional—it's essential. Your portfolio is your professional story, told through your achievements and credentials.</p>
      
      <h2>Essential Components</h2>
      <h3>1. Credentials and Certifications</h3>
      <p>Organize your credentials by relevance and recency. Highlight certifications that align with your career goals.</p>
      
      <h3>2. Project Showcase</h3>
      <p>Include real-world projects that demonstrate your skills in action. Provide context, challenges faced, and outcomes achieved.</p>
      
      <h3>3. Skills Matrix</h3>
      <p>Create a visual representation of your skills, showing proficiency levels and areas of expertise.</p>
      
      <h2>Best Practices</h2>
      <ul>
        <li>Keep it updated regularly</li>
        <li>Use clear, concise descriptions</li>
        <li>Include measurable achievements</li>
        <li>Make it easy to navigate</li>
        <li>Ensure mobile responsiveness</li>
      </ul>
      
      <h2>Standing Out</h2>
      <p>Your portfolio should tell a story of growth and continuous learning. Show progression, highlight unique skills, and demonstrate how you've applied your knowledge in real-world scenarios.</p>
    `,
    category: "Career",
    author: "Michael Chen",
    coverImage: "gradient-2",
    tags: ["portfolio", "career", "skills", "job search"],
    published: true,
  },
  {
    title: "NSQF Levels Explained: Your Complete Guide",
    excerpt: "Understanding the National Skills Qualifications Framework and how it maps to your credentials and career progression.",
    content: `
      <h2>What is NSQF?</h2>
      <p>The National Skills Qualifications Framework (NSQF) is a competency-based framework that organizes qualifications according to a series of levels of knowledge, skills, and aptitude.</p>
      
      <h2>The 10 Levels</h2>
      <p>NSQF consists of 10 levels, each representing increasing complexity and autonomy:</p>
      
      <h3>Levels 1-2: Foundation</h3>
      <p>Basic skills and knowledge for routine tasks under supervision.</p>
      
      <h3>Levels 3-5: Intermediate</h3>
      <p>Specialized skills with some autonomy and problem-solving abilities.</p>
      
      <h3>Levels 6-8: Advanced</h3>
      <p>Professional expertise with significant autonomy and leadership capabilities.</p>
      
      <h3>Levels 9-10: Expert</h3>
      <p>Mastery level with innovation, research, and strategic thinking abilities.</p>
      
      <h2>How Credits Work</h2>
      <p>Each credential you earn contributes credits toward your NSQF level. Accumulating credits helps you progress through the levels:</p>
      <ul>
        <li>Level 1: 0-40 credits</li>
        <li>Level 2: 41-80 credits</li>
        <li>Level 3: 81-120 credits</li>
        <li>And so on...</li>
      </ul>
      
      <h2>Career Implications</h2>
      <p>Your NSQF level directly impacts your career opportunities. Higher levels open doors to more advanced positions and better compensation.</p>
    `,
    category: "Education",
    author: "Priya Sharma",
    coverImage: "gradient-3",
    tags: ["NSQF", "education", "qualifications", "framework"],
    published: true,
  },
  {
    title: "Micro-Credentials: The New Currency of Learning",
    excerpt: "Why micro-credentials are becoming increasingly valuable in today's job market and how to leverage them for career growth.",
    content: `
      <h2>The Rise of Micro-Credentials</h2>
      <p>Traditional degrees are no longer the only path to career success. Micro-credentials—focused, skill-specific certifications—are revolutionizing how we learn and demonstrate competence.</p>
      
      <h2>What Makes Them Valuable?</h2>
      <h3>Flexibility</h3>
      <p>Learn at your own pace, on your own schedule. Micro-credentials fit into busy lives.</p>
      
      <h3>Relevance</h3>
      <p>Focus on current, in-demand skills that employers actually need right now.</p>
      
      <h3>Affordability</h3>
      <p>Cost-effective compared to traditional degree programs, making education more accessible.</p>
      
      <h3>Stackability</h3>
      <p>Combine multiple micro-credentials to build comprehensive skill sets.</p>
      
      <h2>Employer Perspective</h2>
      <p>Employers increasingly value micro-credentials because they:</p>
      <ul>
        <li>Demonstrate specific, job-ready skills</li>
        <li>Show commitment to continuous learning</li>
        <li>Provide verifiable proof of competence</li>
        <li>Indicate adaptability and initiative</li>
      </ul>
      
      <h2>Strategic Approach</h2>
      <p>To maximize the value of micro-credentials:</p>
      <ol>
        <li>Align them with your career goals</li>
        <li>Choose reputable providers</li>
        <li>Build complementary skill sets</li>
        <li>Showcase them effectively in your portfolio</li>
      </ol>
    `,
    category: "Trends",
    author: "David Williams",
    coverImage: "gradient-4",
    tags: ["micro-credentials", "learning", "career", "skills"],
    published: true,
  },
  {
    title: "Employer's Guide to Skill Verification",
    excerpt: "How employers can use modern credential platforms to verify candidate credentials and find the right talent faster.",
    content: `
      <h2>The Hiring Challenge</h2>
      <p>In today's competitive talent market, employers face a critical challenge: how to quickly and accurately verify candidate credentials while identifying the best fit for their organization.</p>
      
      <h2>Traditional vs. Modern Verification</h2>
      <h3>Traditional Methods:</h3>
      <ul>
        <li>Manual verification calls</li>
        <li>Weeks of waiting</li>
        <li>High risk of fraud</li>
        <li>Expensive process</li>
      </ul>
      
      <h3>Modern Platforms:</h3>
      <ul>
        <li>Instant verification</li>
        <li>Blockchain-backed authenticity</li>
        <li>Comprehensive skill profiles</li>
        <li>Cost-effective solution</li>
      </ul>
      
      <h2>Key Features to Look For</h2>
      <h3>1. Instant Verification</h3>
      <p>Real-time credential verification saves time and reduces hiring delays.</p>
      
      <h3>2. Skill Mapping</h3>
      <p>See how candidate skills align with job requirements at a glance.</p>
      
      <h3>3. NSQF Integration</h3>
      <p>Understand candidate qualification levels using standardized frameworks.</p>
      
      <h3>4. Comprehensive Profiles</h3>
      <p>Access complete learning histories and skill progressions.</p>
      
      <h2>Best Practices</h2>
      <ol>
        <li>Define clear skill requirements</li>
        <li>Use standardized frameworks (like NSQF)</li>
        <li>Verify credentials early in the process</li>
        <li>Look for continuous learning patterns</li>
        <li>Consider skill combinations, not just individual credentials</li>
      </ol>
      
      <h2>ROI of Modern Verification</h2>
      <p>Employers using modern credential platforms report:</p>
      <ul>
        <li>50% reduction in time-to-hire</li>
        <li>80% decrease in verification costs</li>
        <li>95% confidence in credential authenticity</li>
        <li>Better quality of hire</li>
      </ul>
    `,
    category: "Business",
    author: "Emily Rodriguez",
    coverImage: "gradient-5",
    tags: ["hiring", "verification", "employers", "recruitment"],
    published: true,
  },
  {
    title: "Success Stories: Learners Who Made It",
    excerpt: "Inspiring stories from learners who used credential platforms to land their dream jobs and advance their careers.",
    content: `
      <h2>Real People, Real Success</h2>
      <p>Behind every credential is a story of dedication, growth, and achievement. Here are some inspiring journeys from our community.</p>
      
      <h2>Story 1: From Retail to Tech</h2>
      <h3>Raj's Journey</h3>
      <p>Raj worked in retail for 5 years before deciding to transition to tech. Through micro-credentials in web development, he built a portfolio that landed him a junior developer role at a startup.</p>
      
      <blockquote>
        "The credential platform helped me showcase my skills in a way that traditional resumes couldn't. Employers could see exactly what I could do."
      </blockquote>
      
      <p><strong>Key Takeaway:</strong> Strategic credential stacking can open doors to new industries.</p>
      
      <h2>Story 2: Career Advancement</h2>
      <h3>Maria's Promotion</h3>
      <p>Maria was stuck in a mid-level position for years. By earning advanced certifications and reaching NSQF Level 7, she demonstrated her readiness for leadership.</p>
      
      <blockquote>
        "Having my credentials verified and organized in one place made it easy to show my growth during performance reviews."
      </blockquote>
      
      <p><strong>Key Takeaway:</strong> Documented skill progression supports career advancement.</p>
      
      <h2>Story 3: Freelance Success</h2>
      <h3>Ahmed's Business</h3>
      <p>Ahmed built a successful freelance consulting business by showcasing his verified credentials to potential clients.</p>
      
      <blockquote>
        "Clients trust me more because they can verify my credentials instantly. It's been a game-changer for my business."
      </blockquote>
      
      <p><strong>Key Takeaway:</strong> Verified credentials build trust with clients.</p>
      
      <h2>Common Success Factors</h2>
      <ul>
        <li>Continuous learning mindset</li>
        <li>Strategic credential selection</li>
        <li>Effective portfolio presentation</li>
        <li>Networking and visibility</li>
        <li>Persistence and dedication</li>
      </ul>
      
      <h2>Your Turn</h2>
      <p>These success stories show what's possible when you invest in your skills and leverage modern credential platforms. What will your success story be?</p>
    `,
    category: "Inspiration",
    author: "James Anderson",
    coverImage: "gradient-6",
    tags: ["success stories", "career", "inspiration", "motivation"],
    published: true,
  },
];

async function seedBlogPosts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an admin user or create a default one
    let adminUser = await User.findOne({ role: 'Admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Creating default admin...');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@credmatrix.com',
        passwordHash: 'admin123', // Will be hashed by pre-save hook
        role: 'Admin',
      });
      console.log('Admin user created');
    }

    // Clear existing blog posts
    await BlogPost.deleteMany({});
    console.log('Cleared existing blog posts');

    // Create sample posts one by one to trigger pre-save hooks
    const createdPosts = [];
    for (const postData of samplePosts) {
      const post = await BlogPost.create({
        ...postData,
        authorId: adminUser._id,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        views: Math.floor(Math.random() * 1000), // Random views between 0-1000
      });
      createdPosts.push(post);
    }

    console.log(`✅ Successfully created ${createdPosts.length} sample blog posts`);

    // Display created posts
    const allPosts = await BlogPost.find({}).select('title category published');
    console.log('\nCreated posts:');
    allPosts.forEach(post => {
      console.log(`- ${post.title} (${post.category}) - ${post.published ? 'Published' : 'Draft'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding blog posts:', error);
    process.exit(1);
  }
}

seedBlogPosts();
