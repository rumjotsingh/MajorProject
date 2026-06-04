# Micro-Credential Aggregator Backend

Production-ready backend for a micro-credential platform with role-based access, credential verification workflow, NSQF progression, AI-powered recommendations, job matching, and subscription billing.

## 1. What This Backend Does

This backend supports four roles:

1. Learner
1. Register/login, upload credentials, track verification, view NSQF progression, get recommendations, apply to jobs.

2. Issuer
1. Issue and verify learner credentials, manage learner interactions.

3. Employer
1. Manage company profile, search learners, create jobs, manage applications, verify credentials.

4. Admin
1. Manage users, issuers, employers, credentials, subscriptions, NSQF mappings, analytics, and blog content.

## 2. Tech Stack

1. Runtime: Node.js (ES Modules)
2. API: Express.js
3. Database: MongoDB + Mongoose
4. Auth: JWT access and refresh tokens
5. File Storage: Cloudinary
6. Payments: Razorpay
7. Realtime: Socket.IO
8. AI: Ollama local model inference
9. Testing: Jest + Supertest

## 3. AI Service Details

### AI type used

This project currently uses local LLM inference through Ollama.

1. Provider: ollama
2. Default model: qwen3.5:2b
3. Endpoint: OLLAMA_BASE_URL/api/generate
4. Response mode: non-streamed JSON/text parsing

### AI capabilities in this project

1. Skill extraction from certificate text.
2. Credential metadata analysis with summary and extracted skills.
3. Unified recommendation generation:
1. career roles
2. courses
3. projects
4. recommended jobs
5. certifications
6. portfolio suggestions

### AI reliability strategy

1. Strict JSON prompting.
2. Safe JSON parse fallback extraction.
3. Sanitization and length capping of arrays.
4. Deterministic fallback recommendations if AI fails.

## 4. System Architecture

### Layered flow

1. Routes layer
1. HTTP endpoint mapping and middleware chain.

2. Controllers layer
1. Request validation, orchestration, response mapping.

3. Services layer
1. AI and skill analytics.
2. Verification flow handling.
3. Profile recomputation from verified credentials.

4. Data layer
1. Mongoose models and indexes.

5. External integrations
1. Cloudinary, Razorpay, Ollama, optional Redis.

## 5. Database Models and Core Fields

### User

1. name, email, mobile, passwordHash
2. role: Learner, Issuer, Employer, Admin
3. isActive
4. currentSubscription

### LearnerProfile

1. userId (unique)
2. bio, skills
3. totalCredits
4. nsqfLevel, levelName
5. education, experience, preferences

### Credential

1. userId, issuerId, title, description
2. credentialType, category, tags, learningOutcomes, skills
3. credits (1-40 integer), nsqfLevel
4. issueDate, expiryDate
5. certificateUrl, evidenceUrls
6. certificateHash (unique)
7. verificationStatus: pending, verified, failed
8. aiInsights object (summary, extractedSkills, provider, model, confidence, status)

### Verification

1. credentialId
2. method: blockchain, issuerAPI, digilocker, manual
3. status: pending, success, failed
4. resultDetails, timestamp

### Issuer

1. name, apiKey, allowedDomains
2. status: pending, approved, suspended
3. contactEmail, mobile
4. blockedLearners

### Employer

1. userId, companyName
2. contactEmail, mobile, website
3. location, industry, companySize
4. verified, logo

### Subscription

1. userId, plan (free, pro, enterprise)
2. status (active, cancelled, expired, pending)
3. Razorpay identifiers
4. amount, currency, startDate, endDate
5. features flags (aiRecommendations, apiAccess, analytics, etc.)

Additional models in codebase include Application, Job, BlogPost, Notification, CareerPath, Contact, Bookmark, and NSQFMapping.

## 6. Calculation Logic and Service Logic

### A. NSQF and credits

Credits are validated per credential:

$$
\text{credits} \in \mathbb{Z}, \quad 1 \le \text{credits} \le 40
$$

Total learner credits are computed from verified credentials only:

$$
\text{TotalCredits} = \sum_{i=1}^{n} \text{verifiedCredentialCredits}_i
$$

Level mapping ranges:

1. Level 1: 0-40
2. Level 2: 41-80
3. Level 3: 81-120
4. Level 4: 121-160
5. Level 5: 161-200
6. Level 6: 201-240
7. Level 7: 241-280
8. Level 8: 281-320
9. Level 9: 321-360
10. Level 10: 361+

### B. Skill analysis and normalization

Skill aliases are normalized so variants map to canonical names, for example js, javascript, and Java Script map to JavaScript.

### C. Skill gap

For each target skill:

$$
\text{gap} = \max(0, \text{requiredLevel} - \text{currentLevel})
$$

### D. Proficiency

$$
\text{proficiency} = \min\left(100, \text{round}\left(\frac{\text{currentLevel}}{\text{targetLevel}} \times 100\right)\right)
$$

### E. Job relevance scoring

1. Skill score based on required skill overlap.
2. NSQF score based on level distance.
3. Weighted final score:

$$
\text{matchScore} = 0.75 \times \text{skillScore} + 0.25 \times \text{nsqfScore}
$$

## 7. API Modules

Base prefix in server routing uses /api/<module>.

### Auth

1. POST /api/auth/register
2. POST /api/auth/login
3. POST /api/auth/refresh
4. POST /api/auth/logout
5. GET /api/auth/me

### Credential

1. POST /api/credentials/upload
2. POST /api/credentials/upload-file
3. GET /api/credentials
4. GET /api/credentials/:id
5. PUT /api/credentials/:id
6. DELETE /api/credentials/:id
7. GET /api/credentials/:id/download
8. POST /api/credentials/:id/verify

### Recommendation

1. POST /api/recommendations/analyze
2. POST /api/recommendations/skill-gap
3. POST /api/recommendations/generate
4. GET /api/recommendations/career-paths
5. POST /api/recommendations/extract-skills
6. GET /api/recommendations/jobs/relevant
7. POST /api/recommendations/jobs/:jobId/apply
8. GET /api/recommendations/jobs/applications
9. PATCH /api/recommendations/jobs/applications/:applicationId/withdraw

### NSQF

1. GET /api/nsqf/levels
2. GET /api/nsqf/my-level
3. GET /api/nsqf/calculate
4. POST /api/nsqf/map
5. GET /api/nsqf/stack/:userId

### Employer

1. Profile, dashboard, learner search
2. Bookmark operations
3. Job CRUD and application status updates
4. Credential verification from employer side

### Issuer

1. Issuer registration (admin path)
2. Learner management
3. Credential issue/update and verification flows
4. Dashboard and pending verification queue

### Payment

1. GET /api/payment/plans
2. POST /api/payment/create-order
3. POST /api/payment/verify
4. GET /api/payment/subscription
5. POST /api/payment/cancel-subscription
6. POST /api/payment/webhook

### Admin

Comprehensive domain governance module:

1. User CRUD and learner creation
2. Issuer CRUD and approve/reject
3. Employer CRUD and verify/unverify
4. Subscription management
5. Credential moderation
6. Blog administration
7. NSQF level/mapping administration
8. Analytics overview endpoints

Additional modules: blog, contact, search, notification, analytics, profile, users, verification, career-paths.

## 8. Middleware and Security

1. authenticate: validates JWT and injects req.user.
2. authorize: role-based access control.
3. rate limiters for auth and upload/search paths.
4. validation middleware using Joi schemas.
5. centralized error handler.
6. Helmet and CORS configuration.

## 9. Environment Variables

Copy .env.example to .env and set values.

Important variables:

1. MONGODB_URI
2. JWT_SECRET, JWT_REFRESH_SECRET
3. CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
4. RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
5. CORS_ORIGIN
6. AI_PROVIDER=ollama
7. OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT_MS

Security note: never commit real secrets. Rotate any exposed keys immediately.

## 10. Setup and Run

### Prerequisites

1. Node.js 18+
2. MongoDB instance
3. Cloudinary account
4. Razorpay account (for paid plans)
5. Ollama running locally for AI features

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Tests

```bash
npm test
```

## 11. Key Scripts

1. npm run seed:blog
2. npm run seed:jobs
3. npm run fix:profiles

Scripts folder also includes data migration and seed helpers for career paths, NSQF mappings, and operational maintenance.

## 12. Test Coverage State

Current repository includes:

1. Auth endpoint tests (register/login validations and role checks).
2. NSQF utility tests with boundary and mapping checks.

Recommended next additions:

1. Credential upload branch coverage.
2. Recommendation fallback vs AI path tests.
3. Payment signature and webhook path tests.

## 13. High-Level Request Flow Examples

### Credential upload

1. Learner sends file + metadata.
2. API validates input and deduplicates via hash.
3. Cloudinary upload returns URL.
4. Credential saved with pending verification.
5. AI enrichment runs asynchronously.
6. Verification completion updates profile credits and NSQF.

### Recommendation generation

1. Gather learner profile and analyzed skills.
2. Compute skill gaps against target career path.
3. Attempt AI unified recommendation generation.
4. If AI fails, return deterministic fallback bundle.
5. Include relevant jobs and metadata in response.

## 14. Production Readiness Checklist

1. Rotate all secrets and use secret manager.
2. Configure database backup and monitoring.
3. Add request tracing and structured observability.
4. Enforce HTTPS and secure cookie/token policy.
5. Add CI test gates and lint checks.
6. Expand integration and load testing.

## 15. License

MIT
