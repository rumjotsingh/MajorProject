# Career Paths Seeder

This script populates the database with comprehensive career path data including skills, salary ranges, demand levels, and career progression information.

## Usage

```bash
cd backend
node scripts/seed-career-paths.js
```

## What it does

- Clears existing career paths from the database
- Seeds 8 comprehensive career paths with:
  - Required skills and tools
  - Salary ranges and growth rates
  - Demand levels and job openings
  - Education and certification requirements
  - Career progression paths
  - Key responsibilities
  - Related roles

## Career Paths Included

1. **Full Stack Developer** - Web application development
2. **Data Scientist** - Machine learning and data analysis
3. **UI/UX Designer** - User interface and experience design
4. **DevOps Engineer** - Infrastructure automation and deployment
5. **Mobile App Developer** - iOS and Android development
6. **Cybersecurity Analyst** - Security monitoring and incident response
7. **Cloud Architect** - Cloud infrastructure design
8. **Product Manager** - Product strategy and management

## Enhanced Fields

The new career path model includes:

- `demand`: Market demand level (Low, Medium, High, Very High)
- `jobOpenings`: Number of available positions
- `educationRequired`: Educational requirements
- `certifications`: Recommended certifications
- `careerProgression`: Career advancement path
- `workEnvironment`: Work culture and environment
- `keyResponsibilities`: Main job duties
- `tools`: Required tools and software
- `relatedRoles`: Similar career options
- `color`: UI color theme

## Notes

- Run this after setting up your MongoDB connection
- Existing career paths will be deleted
- Safe to run multiple times
