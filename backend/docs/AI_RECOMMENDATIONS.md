# AI-Powered Skill Gap Analysis & Recommendations

## Overview

The platform includes an intelligent recommendation system that analyzes user credentials and provides personalized career guidance, skill gap analysis, and learning recommendations.

## Features

### 1. Skill Analysis
- Automatic skill extraction from credentials
- Skill level calculation based on credential frequency and NSQF levels
- Skill proficiency tracking over time

### 2. Career Path Recommendations
- 5 predefined career paths with skill requirements
- Skill gap analysis comparing current vs. required skills
- Proficiency percentage calculation

### 3. Personalized Recommendations
- **Course Recommendations**: Suggested courses to fill skill gaps
- **Project Recommendations**: Hands-on projects to practice skills
- **Career Role Suggestions**: Suitable roles based on skill profile

## AI Integration (Optional)

The system includes AI integration capabilities using Hugging Face models, but currently operates in fallback mode due to the 2026 Hugging Face API migration.

### Current Status

**The system works perfectly without AI!** The fallback recommendation engine provides:
- Comprehensive skill gap analysis
- Curated course recommendations based on skill gaps
- Relevant project suggestions with difficulty levels
- Career progression paths for 5 major tech roles

### AI Setup (For Future Use)

When Hugging Face serverless models become available again:

1. Get a free API key from [Hugging Face](https://huggingface.co/settings/tokens)
2. Add to your `.env` file:
   ```
   HF_API_KEY=your_actual_api_key_here
   ```
3. Update `AI_AVAILABLE` flag in `backend/services/ai.service.js` to `true`
4. Verify the model is deployed by checking the model page on HuggingFace

### 2026 API Migration Notes

Hugging Face migrated from `api-inference.huggingface.co` to `router.huggingface.co` in 2026. Many models that were previously available on serverless inference are no longer deployed. The system is configured to use the new router endpoint structure but will gracefully fall back to rule-based recommendations when models are unavailable.

### Fallback Mode

**The system works perfectly without AI!** If `HF_API_KEY` is not configured:
- Uses rule-based skill gap analysis
- Provides curated course recommendations
- Suggests relevant projects based on skill gaps
- Offers career progression paths

## API Endpoints

### 1. Analyze Skills
```http
POST /api/recommendations/analyze
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalCredentials": 5,
  "totalCredits": 125,
  "nsqfLevel": 4,
  "levelName": "Supervisor/Assistant",
  "skills": [
    {
      "name": "javascript",
      "level": 8,
      "frequency": 3,
      "lastUsed": "2024-03-19T00:00:00.000Z"
    }
  ],
  "totalSkills": 12,
  "averageSkillLevel": 6.5,
  "trendingSkills": [...]
}
```

### 2. Calculate Skill Gap
```http
POST /api/recommendations/skill-gap
Authorization: Bearer <token>
Content-Type: application/json

{
  "careerPath": "Full Stack Developer"
}
```

**Response:**
```json
{
  "careerPath": "Full Stack Developer",
  "currentSkills": [...],
  "targetSkills": [
    {
      "name": "JavaScript",
      "level": 8
    },
    {
      "name": "React",
      "level": 7
    }
  ],
  "skillGaps": [
    {
      "name": "TypeScript",
      "required": 7,
      "current": 0,
      "gap": 7
    }
  ],
  "proficiency": 75,
  "roadmap": {
    "immediate": [...],
    "shortTerm": [...],
    "longTerm": [...]
  },
  "gapsCount": 2
}
```

### 3. Generate Recommendations
```http
POST /api/recommendations/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "careerPath": "Full Stack Developer"
}
```

**Response:**
```json
{
  "skillGaps": [...],
  "courses": [
    {
      "id": 1,
      "title": "TypeScript - From Beginner to Advanced",
      "platform": "Coursera / Udemy / edX",
      "targetSkill": "TypeScript",
      "targetLevel": 7,
      "duration": "1-3 months"
    }
  ],
  "projects": [
    {
      "id": 1,
      "title": "Build a TypeScript Application",
      "difficulty": "Intermediate",
      "skills": ["TypeScript"],
      "estimatedTime": "2-4 weeks"
    }
  ],
  "careerRoles": [
    "Junior Full Stack Developer",
    "Senior Full Stack Developer",
    "Full Stack Team Lead"
  ],
  "proficiency": 75,
  "aiEnabled": false,
  "generatedAt": "2024-03-19T00:00:00.000Z"
}
```

### 4. Get Career Paths
```http
GET /api/recommendations/career-paths
Authorization: Bearer <token>
```

**Response:**
```json
{
  "careerPaths": [
    {
      "id": 1,
      "name": "Full Stack Developer",
      "description": "Build complete web applications from frontend to backend",
      "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
      "averageSalary": "$80,000 - $120,000",
      "demand": "High"
    }
  ]
}
```

### 5. Extract Skills from Text
```http
POST /api/recommendations/extract-skills
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Completed a course on React, Node.js, and MongoDB development"
}
```

**Response:**
```json
{
  "extractedSkills": ["React", "Node.js", "MongoDB"],
  "count": 3
}
```

## Available Career Paths

1. **Full Stack Developer**
   - Skills: JavaScript, React, Node.js, MongoDB, REST APIs, Git
   - Salary: $80,000 - $120,000
   - Demand: High

2. **Data Scientist**
   - Skills: Python, Machine Learning, Statistics, SQL, Data Visualization, TensorFlow
   - Salary: $90,000 - $140,000
   - Demand: Very High

3. **DevOps Engineer**
   - Skills: Docker, Kubernetes, CI/CD, AWS, Linux, Terraform
   - Salary: $85,000 - $130,000
   - Demand: High

4. **Mobile Developer**
   - Skills: React Native, Flutter, iOS Development, Android Development, Mobile UI/UX
   - Salary: $75,000 - $115,000
   - Demand: High

5. **Cloud Architect**
   - Skills: AWS, Azure, Cloud Security, Microservices, Serverless, Infrastructure as Code
   - Salary: $100,000 - $160,000
   - Demand: Very High

## Skill Level Calculation

Skills are analyzed based on:
- **Frequency**: How many credentials mention the skill
- **NSQF Level**: The qualification level of credentials containing the skill
- **Recency**: When the skill was last used

Formula:
```javascript
skillLevel = min(
  sum(credential.nsqfLevel for each credential with skill),
  10
)
```

## Skill Gap Analysis

The system compares your current skills with target career requirements:

1. **Immediate** (0-3 months): Skills with gap ≤ 2 levels
2. **Short-term** (3-6 months): Skills with gap 3-4 levels
3. **Long-term** (6-12 months): Skills with gap > 4 levels

## Frontend Integration

### Career Path Page
```typescript
// Select career path and get recommendations
const handleCareerPathSelect = async (pathName: string) => {
  const gapResponse = await api.post("/recommendations/skill-gap", {
    careerPath: pathName,
  });
  
  const recResponse = await api.post("/recommendations/generate", {
    careerPath: pathName,
  });
};
```

### Skill Map Page
```typescript
// Analyze skills and show gaps
const analyzeSkills = async () => {
  const response = await api.post("/recommendations/analyze");
  setSkillAnalysis(response.data);
};
```

## Best Practices

1. **Upload Regular Credentials**: More credentials = better analysis
2. **Keep Skills Updated**: Ensure credential skills are accurate
3. **Review Recommendations**: Use as guidance, not absolute rules
4. **Track Progress**: Monitor skill gap reduction over time
5. **Set Goals**: Choose a career path and work towards it

## Troubleshooting

### AI Not Working
- Check if `HF_API_KEY` is set in `.env`
- Verify API key is valid at [Hugging Face](https://huggingface.co/settings/tokens)
- Check server logs for specific errors
- **Note**: System works fine without AI using fallback recommendations

### No Recommendations
- Ensure you have uploaded at least one credential
- Verify credentials have skills listed
- Check that credentials are verified

### Inaccurate Skill Levels
- Upload more credentials to improve accuracy
- Ensure credential skills are properly tagged
- Higher NSQF level credentials increase skill levels

## Future Enhancements

- [ ] Custom career path creation
- [ ] Integration with job boards
- [ ] Skill endorsements from peers
- [ ] Learning path tracking
- [ ] Certification recommendations
- [ ] Salary insights based on skills
- [ ] Industry trend analysis
- [ ] Mentor matching

## Support

For issues or questions:
1. Check server logs for errors
2. Verify API endpoints are accessible
3. Ensure authentication tokens are valid
4. Review this documentation

## License

Part of the CredMatrix Micro-Credential Platform
