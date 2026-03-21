# Employer Module Documentation

## Overview
Complete production-ready Employer Module for the Micro-Credential Aggregator Platform.

## Base Route
`/api/employer`

## Authentication
All routes require:
- JWT Authentication (`authenticate` middleware)
- Employer Role (`authorize('Employer')` middleware)

---

## API Endpoints

### 1. EMPLOYER PROFILE

#### Get Profile
```
GET /api/employer/profile
```
**Response:**
```json
{
  "employer": {
    "_id": "...",
    "userId": {...},
    "companyName": "Tech Corp",
    "website": "https://techcorp.com",
    "description": "Leading tech company",
    "location": "Mumbai, India",
    "industry": "Technology",
    "companySize": "51-200",
    "verified": true
  }
}
```

#### Update Profile
```
PUT /api/employer/profile
```
**Body:**
```json
{
  "companyName": "Tech Corp",
  "website": "https://techcorp.com",
  "description": "Leading tech company",
  "location": "Mumbai, India",
  "industry": "Technology",
  "companySize": "51-200",
  "mobile": "+91-9876543210"
}
```

---

### 2. DASHBOARD

#### Get Dashboard Stats
```
GET /api/employer/dashboard/stats
```
**Response:**
```json
{
  "stats": {
    "totalJobs": 15,
    "activeJobs": 8,
    "totalApplications": 245,
    "newApplications": 12,
    "bookmarkCount": 34
  },
  "applicationsByStatus": [
    { "_id": "applied", "count": 120 },
    { "_id": "shortlisted", "count": 45 },
    { "_id": "interviewing", "count": 30 },
    { "_id": "hired", "count": 25 },
    { "_id": "rejected", "count": 25 }
  ]
}
```

---

### 3. SEARCH LEARNERS

#### Search Learners
```
GET /api/employer/search
```
**Query Parameters:**
- `skills` (string, comma-separated): Filter by skills
- `nsqfLevel` (number): Filter by NSQF level
- `location` (string): Filter by location
- `minCredits` (number): Minimum credits
- `search` (string): Text search in name, bio, skills
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20)

**Example:**
```
GET /api/employer/search?skills=JavaScript,React&nsqfLevel=5&page=1&limit=20
```

**Response:**
```json
{
  "learners": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "bio": "Full-stack developer",
      "skills": ["JavaScript", "React", "Node.js"],
      "nsqfLevel": 5,
      "totalCredits