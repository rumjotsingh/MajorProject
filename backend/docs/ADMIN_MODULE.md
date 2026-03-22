# Admin Module Documentation

## Overview
Production-ready Admin Module for the Micro-Credential Aggregator Platform. Provides comprehensive management capabilities for users, issuers, credentials, blogs, NSQF mappings, and analytics.

## Tech Stack
- Node.js + Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Role-Based Access Control (RBAC)

## Base Route
All admin routes are prefixed with `/api/admin`

## Authentication & Authorization
All routes require:
1. Valid JWT token in `Authorization: Bearer <token>` header
2. User role must be `Admin`

Middleware chain: `authenticate` → `authorize('Admin')` → controller

---

## API Endpoints

### 1. DASHBOARD

#### Get Dashboard Stats
```
GET /api/admin/dashboard/stats
```

**Response:**
```json
{
  "users": {
    "total": 150,
    "learners": 120,
    "employers": 20,
    "issuers": 10
  },
  "credentials": {
    "total": 500,
    "verified": 450,
    "pending": 50
  },
  "blogs": {
    "total": 30,
    "published": 25
  },
  "issuers": {
    "pending": 5,
    "approved": 10
  }
}
```

---

### 2. USER MANAGEMENT

#### List All Users
```
GET /api/admin/users
```

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `role` - Filter by role (Learner, Issuer, Employer, Admin)
- `search` - Search by name or email
- `isActive` - Filter by active status (true/false)

**Response:**
```json
{
  "users": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Learner",
      "isActive": true,
      "currentSubscription": {...},
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 8,
    "limit": 20
  }
}
```

#### Get User by ID
```
GET /api/admin/users/:id
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Learner",
    "currentSubscription": {...}
  },
  "profile": {...},
  "credentials": [...]
}
```

#### Delete User
```
DELETE /api/admin/users/:id
```

**Notes:**
- Cannot delete Admin users
- Automatically deletes associated data (profile, credentials)
- For Issuers, also deletes issuer record

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

### 3. ISSUER MANAGEMENT

#### List All Issuers
```
GET /api/admin/issuers
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` - Filter by status (pending, approved, suspended)
- `search` - Search by name or email

**Response:**
```json
{
  "issuers": [
    {
      "_id": "...",
      "name": "ABC Institute",
      "contactEmail": "contact@abc.com",
      "status": "approved",
      "credentialCount": 50,
      "createdAt": "2026-01-10T10:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

#### Get Issuer by ID
```
GET /api/admin/issuers/:id
```

**Response:**
```json
{
  "issuer": {
    "_id": "...",
    "name": "ABC Institute",
    "contactEmail": "contact@abc.com",
    "status": "approved",
    "apiKey": "..."
  },
  "stats": {
    "credentialCount": 50
  },
  "recentCredentials": [...]
}
```

#### Approve Issuer
```
PATCH /api/admin/issuers/:id/approve
```

**Response:**
```json
{
  "message": "Issuer approved successfully",
  "issuer": {...}
}
```

#### Reject Issuer
```
PATCH /api/admin/issuers/:id/reject
```

**Body:**
```json
{
  "reason": "Invalid documentation"
}
```

**Response:**
```json
{
  "message": "Issuer rejected successfully",
  "issuer": {...}
}
```

#### Delete Issuer
```
DELETE /api/admin/issuers/:id
```

**Notes:**
- Cannot delete issuers with existing credentials
- Returns error with credential count if deletion blocked

**Response:**
```json
{
  "message": "Issuer deleted successfully"
}
```

---

### 4. EMPLOYER MANAGEMENT

#### List All Employers
```
GET /api/admin/employers
```

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `verified` - Filter by verification status (true/false)
- `search` - Search by company name or email

**Response:**
```json
{
  "employers": [
    {
      "_id": "...",
      "companyName": "Tech Corp",
      "contactEmail": "hr@techcorp.com",
      "mobile": "1234567890",
      "verified": true,
      "userId": {
        "_id": "...",
        "name": "Tech Corp",
        "email": "hr@techcorp.com",
        "isActive": true,
        "createdAt": "2026-01-15T10:00:00.000Z"
      },
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 3,
    "limit": 20
  }
}
```

#### Get Employer Stats
```
GET /api/admin/employers/stats
```

**Response:**
```json
{
  "total": 50,
  "verified": 35,
  "active": 45,
  "unverified": 15
}
```

#### Get Employer by ID
```
GET /api/admin/employers/:id
```

**Response:**
```json
{
  "employer": {
    "_id": "...",
    "companyName": "Tech Corp",
    "contactEmail": "hr@techcorp.com",
    "mobile": "1234567890",
    "verified": true,
    "userId": {...}
  }
}
```

#### Create Employer
```
POST /api/admin/employers
```

**Body:**
```json
{
  "companyName": "New Company",
  "contactEmail": "contact@newcompany.com",
  "mobile": "1234567890",
  "password": "securepassword",
  "verified": false
}
```

**Response:**
```json
{
  "message": "Employer created successfully",
  "employer": {...}
}
```

#### Update Employer
```
PUT /api/admin/employers/:id
```

**Body:**
```json
{
  "companyName": "Updated Company Name",
  "contactEmail": "newemail@company.com",
  "mobile": "9876543210",
  "verified": true
}
```

**Response:**
```json
{
  "message": "Employer updated successfully",
  "employer": {...}
}
```

#### Verify Employer
```
PATCH /api/admin/employers/:id/verify
```

**Response:**
```json
{
  "message": "Employer verified successfully",
  "employer": {...}
}
```

#### Unverify Employer
```
PATCH /api/admin/employers/:id/unverify
```

**Response:**
```json
{
  "message": "Employer verification removed successfully",
  "employer": {...}
}
```

#### Delete Employer
```
DELETE /api/admin/employers/:id
```

**Notes:**
- Deletes both employer profile and associated user account
- Requires confirmation

**Response:**
```json
{
  "message": "Employer deleted successfully"
}
```

---

### 5. CREDENTIAL MANAGEMENT

#### List All Credentials
```
GET /api/admin/credentials
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` - Filter by verification status (pending, verified, failed)
- `issuerId` - Filter by issuer
- `userId` - Filter by user
- `search` - Search by title or skills

**Response:**
```json
{
  "credentials": [
    {
      "_id": "...",
      "title": "Java Programming",
      "credits": 20,
      "nsqfLevel": 5,
      "verificationStatus": "verified",
      "userId": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "issuerId": {
        "name": "ABC Institute"
      },
      "createdAt": "2026-02-01T10:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

#### Get Credential by ID
```
GET /api/admin/credentials/:id
```

**Response:**
```json
{
  "credential": {
    "_id": "...",
    "title": "Java Programming",
    "skills": ["Java", "OOP"],
    "credits": 20,
    "certificateUrl": "https://...",
    "verificationStatus": "verified",
    "userId": {...},
    "issuerId": {...}
  }
}
```

#### Approve Credential
```
PATCH /api/admin/credentials/:id/approve
```

**Body (optional):**
```json
{
  "notes": "Verified successfully"
}
```

**Notes:**
- Adds credits to learner profile
- Recalculates NSQF level
- Only adds credits if not already verified

**Response:**
```json
{
  "message": "Credential approved successfully",
  "credential": {...}
}
```

#### Reject Credential
```
PATCH /api/admin/credentials/:id/reject
```

**Body (optional):**
```json
{
  "notes": "Invalid certificate"
}
```

**Notes:**
- Removes credits from learner profile if was previously verified
- Recalculates NSQF level

**Response:**
```json
{
  "message": "Credential rejected successfully",
  "credential": {...}
}
```

#### Delete Credential
```
DELETE /api/admin/credentials/:id
```

**Notes:**
- Removes credits from learner profile if verified
- Recalculates NSQF level

**Response:**
```json
{
  "message": "Credential deleted successfully"
}
```

---

### 5. BLOG MANAGEMENT

#### List All Blogs
```
GET /api/admin/blogs
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `published` - Filter by published status (true/false)
- `category` - Filter by category
- `search` - Search by title or excerpt

**Response:**
```json
{
  "blogs": [
    {
      "_id": "...",
      "title": "Getting Started with Micro-Credentials",
      "slug": "getting-started-with-micro-credentials",
      "category": "Education",
      "published": true,
      "views": 150,
      "authorId": {
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2026-01-20T10:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

#### Delete Blog
```
DELETE /api/admin/blogs/:id
```

**Response:**
```json
{
  "message": "Blog post deleted successfully"
}
```

---

### 6. NSQF MANAGEMENT

#### Get NSQF Levels
```
GET /api/admin/nsqf/levels
```

**Response:**
```json
{
  "levels": [
    {
      "level": 1,
      "creditRange": "1-40",
      "description": "NSQF Level 1"
    },
    {
      "level": 2,
      "creditRange": "41-80",
      "description": "NSQF Level 2"
    },
    ...
  ]
}
```

**Note:** NSQF levels are system-defined and calculated automatically based on credits.

#### Create NSQF Level
```
POST /api/admin/nsqf/levels
```

**Body:**
```json
{
  "level": 5,
  "description": "NSQF Level 5"
}
```

**Note:** This is informational only. Levels are calculated automatically.

#### Update NSQF Level
```
PUT /api/admin/nsqf/levels/:id
```

**Note:** NSQF levels are system-defined and cannot be modified.

#### Delete NSQF Level
```
DELETE /api/admin/nsqf/levels/:id
```

**Note:** NSQF levels cannot be deleted (returns 400 error).

#### Create NSQF Mapping
```
POST /api/admin/nsqf/map
```

**Body:**
```json
{
  "credentialId": "...",
  "skill": "Java Programming",
  "nsqfLevel": 5,
  "stackableNext": ["credential_id_1", "credential_id_2"],
  "recommendedCourses": ["Advanced Java", "Spring Framework"],
  "description": "Java programming at intermediate level"
}
```

**Response:**
```json
{
  "message": "NSQF mapping created successfully",
  "mapping": {...}
}
```

#### Get NSQF Mappings
```
GET /api/admin/nsqf/mappings
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `nsqfLevel` - Filter by NSQF level
- `skill` - Search by skill name

**Response:**
```json
{
  "mappings": [
    {
      "_id": "...",
      "skill": "Java Programming",
      "nsqfLevel": 5,
      "credentialId": {
        "title": "Java Certification"
      },
      "stackableNext": [...],
      "recommendedCourses": [...]
    }
  ],
  "pagination": {...}
}
```

#### Delete NSQF Mapping
```
DELETE /api/admin/nsqf/mappings/:id
```

**Response:**
```json
{
  "message": "NSQF mapping deleted successfully"
}
```

---

### 7. ANALYTICS

#### Get Analytics Overview
```
GET /api/admin/analytics/overview
```

**Response:**
```json
{
  "overview": {
    "totalUsers": 150,
    "totalCredentials": 500,
    "totalIssuers": 10
  },
  "credentialsByMonth": [
    {
      "_id": { "year": 2026, "month": 3 },
      "count": 50
    }
  ],
  "usersByRole": [
    { "_id": "Learner", "count": 120 },
    { "_id": "Employer", "count": 20 }
  ],
  "credentialsByStatus": [
    { "_id": "verified", "count": 450 },
    { "_id": "pending", "count": 50 }
  ]
}
```

#### Get User Analytics
```
GET /api/admin/analytics/users
```

**Response:**
```json
{
  "usersByRole": [...],
  "userGrowth": [
    {
      "_id": { "year": 2026, "month": 3 },
      "count": 20
    }
  ],
  "activeUsers": 145
}
```

#### Get Credential Analytics
```
GET /api/admin/analytics/credentials
```

**Response:**
```json
{
  "credentialsByStatus": [...],
  "credentialsByNSQF": [
    { "_id": 1, "count": 50 },
    { "_id": 2, "count": 80 }
  ],
  "topSkills": [
    { "_id": "JavaScript", "count": 150 },
    { "_id": "Python", "count": 120 }
  ],
  "credentialGrowth": [...]
}
```

#### Get Issuer Analytics
```
GET /api/admin/analytics/issuers
```

**Response:**
```json
{
  "issuersByStatus": [
    { "_id": "approved", "count": 10 },
    { "_id": "pending", "count": 5 }
  ],
  "topIssuers": [
    {
      "_id": "...",
      "name": "ABC Institute",
      "contactEmail": "contact@abc.com",
      "credentialCount": 150
    }
  ],
  "issuerGrowth": [...]
}
```

---

## Error Handling

All endpoints use consistent error handling:

**401 Unauthorized:**
```json
{
  "error": "No token provided"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Invalid request",
  "details": "..."
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Security Features

1. **JWT Authentication**: All routes require valid JWT token
2. **Role-Based Access**: Only Admin role can access these routes
3. **Input Validation**: All inputs are validated before processing
4. **Audit Logging**: All admin actions are logged
5. **Cascade Deletion**: Associated data is properly cleaned up
6. **Protection**: Cannot delete admin users or issuers with credentials

---

## NSQF Level Calculation

NSQF levels are automatically calculated based on total credits:

| Level | Credit Range |
|-------|-------------|
| 1     | 1-40        |
| 2     | 41-80       |
| 3     | 81-120      |
| 4     | 121-160     |
| 5     | 161-200     |
| 6     | 201-240     |
| 7     | 241-280     |
| 8     | 281-320     |
| 9     | 321-360     |
| 10    | 361+        |

Credits are only added after credential verification, not on upload.

---

## Usage Examples

### Example 1: Approve Pending Issuer
```bash
curl -X PATCH https://api.example.com/api/admin/issuers/123/approve \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```

### Example 2: Get All Pending Credentials
```bash
curl -X GET "https://api.example.com/api/admin/credentials?status=pending&page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

### Example 3: Delete User
```bash
curl -X DELETE https://api.example.com/api/admin/users/123 \
  -H "Authorization: Bearer <admin_token>"
```

### Example 4: Get Dashboard Stats
```bash
curl -X GET https://api.example.com/api/admin/dashboard/stats \
  -H "Authorization: Bearer <admin_token>"
```

---

## Testing

Run tests with:
```bash
npm test
```

Test admin endpoints:
```bash
npm test -- admin.test.js
```

---

## Logging

All admin actions are logged with:
- Action type
- Admin user ID
- Timestamp
- Resource ID
- Additional context

Logs are stored in `backend/logs/combined.log` and `backend/logs/error.log`.

---

## Future Enhancements

- [ ] Bulk operations (approve/reject multiple items)
- [ ] Export data to CSV/Excel
- [ ] Advanced filtering and sorting
- [ ] Activity audit trail
- [ ] Email notifications for admin actions
- [ ] Two-factor authentication for admin users
- [ ] IP whitelisting for admin access
- [ ] Rate limiting per admin user

---

## Support

For issues or questions, contact the development team or create an issue in the repository.
