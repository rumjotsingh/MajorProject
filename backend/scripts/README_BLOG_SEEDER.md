# Blog Post Seeder

## Overview
This script seeds the database with 6 sample blog posts covering various categories.

## Usage

```bash
cd backend
npm run seed:blog
```

## What it does

1. Connects to MongoDB
2. Finds or creates an admin user
3. Clears existing blog posts
4. Creates 6 sample blog posts with:
   - Full HTML content
   - Categories (Technology, Career, Education, Trends, Business, Inspiration)
   - Random publish dates (within last 30 days)
   - Random view counts (0-1000)
   - Tags
   - Cover images (gradient-1 to gradient-6)

## Sample Posts Created

1. **The Future of Credential Management** (Technology)
   - About blockchain and AI in credential management

2. **Building Your Digital Skill Portfolio** (Career)
   - Guide to creating an effective portfolio

3. **NSQF Levels Explained** (Education)
   - Complete guide to NSQF framework

4. **Micro-Credentials: The New Currency** (Trends)
   - Why micro-credentials are valuable

5. **Employer's Guide to Skill Verification** (Business)
   - How employers can verify credentials

6. **Success Stories: Learners Who Made It** (Inspiration)
   - Real success stories from learners

## Admin User

If no admin user exists, the script creates one with:
- Email: admin@credmatrix.com
- Password: admin123
- Role: Admin

**Note:** Change the password after first login in production!

## Re-running

You can run this script multiple times. It will:
- Clear all existing blog posts
- Create fresh sample posts
- Use the same admin user (or create if missing)

## Customization

To add your own sample posts, edit the `samplePosts` array in `seed-blog-posts.js`.
