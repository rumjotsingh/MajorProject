# NSQF Credit-Based Micro-Credential System

## Overview

This system implements an automatic NSQF (National Skills Qualifications Framework) level calculation based on accumulated credits. The NSQF level is **NEVER** taken from user input - it is always calculated by the backend based on total accumulated credits.

## Key Features

1. **Mandatory Credits Field**: Every credential must have a credits value (1-40)
2. **Automatic NSQF Calculation**: NSQF level is calculated based on total accumulated credits
3. **Backend-Controlled**: Credits and levels cannot be manipulated from frontend
4. **Real-time Updates**: Profile updates immediately after each credential upload
5. **Comprehensive Validation**: All inputs are validated on both frontend and backend

## NSQF Level Mapping

| Level | Description | Min Credits | Max Credits |
|-------|-------------|-------------|-------------|
| 1 | Basic/Foundation | 0 | 40 |
| 2 | Semi-skilled | 41 | 80 |
| 3 | Skilled | 81 | 120 |
| 4 | Supervisor/Assistant | 121 | 160 |
| 5 | Technician/Diploma | 161 | 200 |
| 6 | Graduate | 201 | 240 |
| 7 | Post-Graduate | 241 | 280 |
| 8 | Master | 281 | 320 |
| 9 | Doctoral | 321 | 360 |
| 10 | Post-Doctoral | 361+ | Unlimited |

## API Endpoints

### 1. Upload Credential (Learner)

**POST** `/api/credentials/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
- `file`: Certificate file (required)
- `metadata`: JSON string containing:
  ```json
  {
    "title": "Web Development Certificate",
    "issuer": "Tech Academy",
    "issueDate": "2024-03-19",
    "skills": ["JavaScript", "React", "Node.js"],
    "credits": 25
  }
  ```

**Response:**
```json
{
  "credentialId": "65f9a1b2c3d4e5f6g7h8i9j0",
  "verificationStatus": "pending",
  "creditsEarned": 25,
  "totalCredits": 125,
  "nsqfLevel": 4,
  "levelName": "Supervisor/Assistant",
  "levelDescription": "Supervisor/Assistant",
  "message": "Credential uploaded successfully! You earned 25 credits and are now at NSQF Level 4 (Supervisor/Assistant)"
}
```

**Validation Rules:**
- `credits` is **required**
- `credits` must be an integer between 1 and 40
- `nsqfLevel` is **NOT accepted** from user input
- File is required
- Title, issuer, and issueDate are required

### 2. Issue Credential (Issuer)

**POST** `/api/issuer/credentials`

**Headers:**
```
Authorization: Bearer <token>
X-API-Key: <issuer-api-key>
```

**Body:**
```json
{
  "userEmail": "learner@example.com",
  "title": "Data Science Certificate",
  "skills": ["Python", "Machine Learning", "Data Analysis"],
  "credits": 30,
  "issueDate": "2024-03-19",
  "certificateUrl": "https://example.com/cert.pdf"
}
```

**Response:**
```json
{
  "credentialId": "65f9a1b2c3d4e5f6g7h8i9j0",
  "status": "pending",
  "creditsEarned": 30,
  "totalCredits": 155,
  "nsqfLevel": 4,
  "levelName": "Supervisor/Assistant",
  "message": "Credential issued successfully! Learner earned 30 credits and is now at NSQF Level 4 (Supervisor/Assistant)"
}
```

### 3. Get My NSQF Level

**GET** `/api/nsqf/my-level`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalCredits": 125,
  "currentLevel": 4,
  "levelName": "Supervisor/Assistant",
  "levelDescription": "Supervisor/Assistant",
  "minCredits": 121,
  "maxCredits": 160,
  "progress": {
    "currentLevel": 4,
    "currentLevelName": "Supervisor/Assistant",
    "nextLevel": 5,
    "nextLevelName": "Technician/Diploma",
    "creditsNeeded": 36
  }
}
```

### 4. Get All NSQF Levels

**GET** `/api/nsqf/levels`

**Response:**
```json
{
  "levels": [
    {
      "level": 1,
      "description": "Basic/Foundation",
      "minCredits": 0,
      "maxCredits": 40
    },
    {
      "level": 2,
      "description": "Semi-skilled",
      "minCredits": 41,
      "maxCredits": 80
    },
    ...
  ]
}
```

### 5. Calculate NSQF Level (Utility)

**GET** `/api/nsqf/calculate?credits=150`

**Response:**
```json
{
  "totalCredits": 150,
  "level": 4,
  "levelName": "Supervisor/Assistant",
  "description": "Supervisor/Assistant",
  "minCredits": 121,
  "maxCredits": 160,
  "progress": {
    "currentLevel": 4,
    "currentLevelName": "Supervisor/Assistant",
    "nextLevel": 5,
    "nextLevelName": "Technician/Diploma",
    "creditsNeeded": 11
  }
}
```

### 6. Update Credential

**PUT** `/api/credentials/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Updated Title",
  "skills": ["New Skill 1", "New Skill 2"],
  "credits": 35
}
```

**Notes:**
- Only unverified credentials can be edited (unless admin)
- If credits are changed, total credits and NSQF level are recalculated automatically
- `nsqfLevel` field is ignored if provided - always calculated by backend

### 7. Delete Credential

**DELETE** `/api/credentials/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** 204 No Content

**Notes:**
- When a credential is deleted, its credits are subtracted from total
- NSQF level is recalculated automatically

## Database Schema Updates

### Credential Model
```javascript
{
  userId: ObjectId,
  issuerId: ObjectId,
  title: String,
  skills: [String],
  credits: Number (required, 1-40, integer),
  nsqfLevel: Number (1-10, calculated),
  issueDate: Date,
  certificateUrl: String,
  certificateHash: String,
  verificationStatus: String,
  // ... other fields
}
```

### LearnerProfile Model
```javascript
{
  userId: ObjectId,
  bio: String,
  skills: [String],
  totalCredits: Number (default: 0),
  nsqfLevel: Number (default: 1),
  levelName: String (default: 'Basic/Foundation'),
  education: [Object],
  experience: [Object],
  // ... other fields
}
```

## Security Features

1. **Backend Validation**: All credit values validated on backend
2. **No Frontend Manipulation**: NSQF level cannot be set from frontend
3. **Automatic Calculation**: Level always calculated based on total credits
4. **Integrity Checks**: Credits cannot be negative or exceed limits
5. **Audit Trail**: All changes logged with timestamps

## Error Handling

### Invalid Credits
```json
{
  "error": "Invalid credits value. Must be an integer between 1 and 40"
}
```

### Missing Credits
```json
{
  "error": "Credits field is required"
}
```

### Cannot Edit Verified Credential
```json
{
  "error": "Cannot edit verified credentials"
}
```

## Usage Examples

### Example 1: New Learner Journey

1. **Initial State**: 0 credits, Level 1
2. **Upload Credential 1**: 20 credits → Total: 20, Level 1
3. **Upload Credential 2**: 25 credits → Total: 45, Level 2 ✨
4. **Upload Credential 3**: 40 credits → Total: 85, Level 3 ✨
5. **Upload Credential 4**: 40 credits → Total: 125, Level 4 ✨

### Example 2: Credit Accumulation

```javascript
// Starting point
totalCredits: 0
nsqfLevel: 1 (Basic/Foundation)

// After earning 150 credits
totalCredits: 150
nsqfLevel: 4 (Supervisor/Assistant)
creditsToNextLevel: 11 (need 161 for Level 5)

// After earning 50 more credits
totalCredits: 200
nsqfLevel: 5 (Technician/Diploma)
creditsToNextLevel: 1 (need 201 for Level 6)
```

## Testing

Run the test suite:
```bash
npm test backend/tests/nsqf.test.js
```

Tests cover:
- Credit validation (valid/invalid ranges)
- NSQF level calculation for all levels
- Edge cases (boundaries, maximum level)
- Progress calculation
- Error handling

## Migration Guide

If you have existing credentials without credits:

1. Add default credits (e.g., 20) to existing credentials
2. Recalculate total credits for each user
3. Update NSQF levels based on new totals

```javascript
// Migration script example
const credentials = await Credential.find({});
for (const cred of credentials) {
  if (!cred.credits) {
    cred.credits = 20; // default value
    await cred.save();
  }
}

// Recalculate user levels
const users = await User.find({ role: 'Learner' });
for (const user of users) {
  const totalCredits = await Credential.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: null, total: { $sum: '$credits' } } }
  ]);
  
  const nsqfInfo = calculateNSQFLevel(totalCredits[0]?.total || 0);
  await LearnerProfile.updateOne(
    { userId: user._id },
    { 
      totalCredits: totalCredits[0]?.total || 0,
      nsqfLevel: nsqfInfo.level,
      levelName: nsqfInfo.levelName
    }
  );
}
```

## Best Practices

1. **Always validate credits on backend** - Never trust frontend input
2. **Use transactions** when updating credits to maintain consistency
3. **Log all credit changes** for audit purposes
4. **Recalculate on every change** - Don't cache NSQF levels
5. **Handle edge cases** - Deletions, updates, bulk operations
6. **Test thoroughly** - Especially boundary conditions

## Support

For questions or issues, contact the development team or refer to the main API documentation.
