# Micro-Credential Aggregator Platform - Project Report

## Chapter 1

### I. Problem Background and Its Context

The Indian and global skill ecosystem has rapidly shifted toward short-cycle learning, modular certifications, and job-role specific upskilling. Learners now collect micro-credentials from universities, online learning platforms, bootcamps, and industry bodies. However, three practical issues remain unresolved in many existing ecosystems:

1. Credential fragmentation: learners hold credentials across disconnected platforms, making portfolio management difficult.
2. Verification trust gap: employers and institutions need reliable verification before accepting credentials.
3. Progression ambiguity: learners often do not know how their current credentials map to structured growth frameworks such as NSQF levels.

The presented project addresses these gaps by building a role-based platform where learners can upload credentials, issuers can validate them, employers can discover talent, and administrators can monitor ecosystem-level quality and growth metrics.

This project is aligned with outcome-based education and employability-oriented learning by:

1. Structuring credential evidence in a single profile.
2. Enforcing verification workflow before credits influence learner progression.
3. Mapping accumulated credits to NSQF levels for objective progression tracking.
4. Enabling AI-assisted skill extraction and recommendation services.

The context of implementation is a modern API-first architecture with:

1. Node.js + Express backend.
2. MongoDB document data store.
3. Cloudinary-based secure document hosting.
4. Optional payment subscription enablement using Razorpay.
5. AI recommendation layer using local LLM inference through Ollama.

The platform is therefore positioned at the intersection of academic credentialing, employability analytics, and intelligent guidance systems.

### II. System Objective

The objective is to design and implement an end-to-end micro-credential lifecycle platform with secure identity, verifiable evidence, measurable progression, and role-specific operations.

#### Primary objectives

1. Provide secure role-based onboarding for Learner, Issuer, Employer, and Admin roles.
2. Support credential upload with metadata validation and duplicate prevention.
3. Execute credential verification workflows and update status reliably.
4. Calculate learner progression using total verified credits and NSQF logic.
5. Build searchable learner profiles for talent discovery by employers.
6. Deliver recommendation intelligence via AI and deterministic fallback logic.
7. Integrate subscription plan management for premium features.

#### Secondary objectives

1. Maintain an audit-friendly history of verification and profile progression.
2. Provide extensible module boundaries for future services (blockchain, external issuer APIs, richer analytics).
3. Ensure deployment readiness through environment-driven configuration.

### III. Functionality (Core and Enhanced)

#### Core functionality

1. Authentication and authorization
1. JWT-based register, login, refresh, logout, and profile identity retrieval.
2. Role-based middleware for endpoint-level access enforcement.

2. Credential lifecycle
1. File upload endpoint with multipart support.
2. Metadata validation for title, issuer, dates, credits, and structured fields.
3. Hash-based duplicate detection.
4. Verification trigger and status tracking.

3. NSQF and profile progression
1. Credit validation at credential-level.
2. NSQF level calculation from total verified credits.
3. Auto recomputation of learner profile on credential state transitions.

4. Employer and job flow
1. Employer profile creation and management.
2. Job posting and candidate application tracking.
3. Learner search and bookmarking.

5. Admin operations
1. User, issuer, employer, credential, blog, subscription, and NSQF mapping management.
2. Dashboard and analytics endpoints.

#### Enhanced functionality

1. AI enrichment and recommendation
1. Metadata analysis for skill extraction and summary generation.
2. AI-based recommendation bundles for courses, projects, and job suggestions.
3. Robust fallback generation in case AI output is unavailable.

2. Real-time notification support
1. Socket.IO connectivity for push-enabled notifications.

3. Subscription and monetization
1. Plan listing and payment order creation.
2. Payment signature verification and subscription activation.

4. Content and engagement
1. Blog API.
2. Contact management workflow.

### IV. Academic, Technical and Economic Feasibility

#### Academic feasibility

The project is academically feasible because it combines multiple software engineering outcomes within one cohesive system:

1. Requirements engineering and role-based use-case modeling.
2. Data modeling with relationships and indexing.
3. API design and secure middleware pipelines.
4. Integration engineering (Cloudinary, Razorpay, AI provider).
5. Test design with unit and functional methods.

It maps well to curriculum goals in full stack development, software architecture, and data-driven systems.

#### Technical feasibility

The stack is technically feasible for student-level and production-like deployment:

1. Express and Mongoose provide mature ecosystem support.
2. JWT middleware patterns are standard and maintainable.
3. Service-layer separation exists for AI, verification, and profile synchronization.
4. The codebase already includes automated test scaffolding with Jest and Supertest.

Risks like service outages are handled by fallback logic and defensive error handling in critical modules.

#### Economic feasibility

The project minimizes cost through:

1. Open-source frameworks.
2. Local AI inference option via Ollama (reduces recurring API fees).
3. Modular paid feature path through subscription plans.

Expected cost heads include cloud database hosting, media storage bandwidth, and payment gateway transaction fees. The architecture allows starting small and scaling cost with user growth.

### V. Risk Factors Identification and Their Mitigation

1. Credential fraud or tampering
1. Mitigation: file hash generation, verification records, and issuer/admin moderation.

2. Unauthorized access
1. Mitigation: JWT auth, role-based guards, protected admin/employer flows, centralized error handling.

3. AI unreliability
1. Mitigation: strict JSON prompt contracts, safe parsing, sanitization, fallback recommendation generation.

4. Data inconsistency in profile totals
1. Mitigation: recompute profile from verified credentials only, not from pending credentials.

5. Third-party dependency downtime
1. Mitigation: graceful error handling for payment and AI operations, non-blocking design for optional features.

6. Scalability bottlenecks
1. Mitigation: indexed fields on frequent query paths and paginated retrieval endpoints.

7. Secret leakage and misconfiguration
1. Mitigation: use .env.example templates, deploy via environment variables, rotate secrets regularly.

## Chapter 2

### I. Primary Research Techniques and Analysis

Primary research inputs for this system can be summarized as stakeholder-driven requirement exploration:

1. Learner interviews
1. Pain points in credential storage, verification delay, and lack of roadmap guidance.

2. Issuer discussions
1. Need for controlled credential issuance, learner blocking in abuse scenarios, and pending verification queue visibility.

3. Employer feedback
1. Need for skill-based learner search, profile confidence indicators, and application lifecycle tracking.

4. Admin and governance perspective
1. Need for modular oversight dashboards, status-based filtering, and intervention controls.

#### Analysis outcome

The above inputs directly influenced:

1. Multi-role architecture.
2. Verification status states (pending, verified, failed).
3. Search/filter capabilities.
4. Analytics and moderation endpoints.
5. Recommendation features as decision support rather than final decision automation.

### II. Secondary Research

#### Existing system study

Conventional systems often provide one of the following in isolation:

1. LMS credential generation without employer discovery.
2. Job portals without verified micro-credential trust layers.
3. Portfolio systems without progression mapping frameworks.

The proposed system combines all three concerns into one lifecycle platform.

#### SDLC approach

A practical iterative SDLC was followed:

1. Requirement clarification per role.
2. API and data model baseline.
3. Core module implementation.
4. Integration of AI, payment, and notification services.
5. Testing and iterative bug-fix cycles.

This aligns closest to Agile-Incremental development due to feature staging and module-wise delivery.

#### Proposed system architecture

1. Client layer: web frontend consuming REST APIs.
2. API layer: Express routes/controllers/middleware.
3. Service layer: AI, skill analysis, verification, profile synchronization.
4. Data layer: MongoDB collections with Mongoose models.
5. External integrations: Cloudinary, Razorpay, optional Redis, and local Ollama.

#### Development software comparison (brief)

1. Node.js + Express vs monolithic frameworks
1. Chosen for lightweight modular APIs and middleware composability.

2. MongoDB vs strict relational schema
1. Chosen for flexible credential metadata and evolving profile structures.

3. Ollama local inference vs paid-only APIs
1. Chosen for low-cost experimentation and privacy-friendly local serving.

## Chapter 3

### I. Requirement Analysis (Use Cases and SRS)

#### Functional requirements

1. User registration/login/logout/refresh.
2. Role-based route protection.
3. Upload, update, fetch, delete credentials.
4. Verify credentials and track verification logs.
5. Compute and expose NSQF progression.
6. Job and application lifecycle.
7. AI analysis and recommendation endpoints.
8. Payment and subscription management.
9. Admin governance APIs.

#### Non-functional requirements

1. Security: JWT, validation, input sanitization, role guard.
2. Reliability: error middleware and fallback behavior.
3. Performance: indexed lookups, pagination.
4. Maintainability: modular controllers/services/models.
5. Scalability: stateless API with externalizable services.

#### Use-case summary

1. Learner
1. Registers, uploads credentials, tracks verification, receives recommendations, applies to jobs.

2. Issuer
1. Manages learner issuance and verification decisions.

3. Employer
1. Searches learners, posts jobs, processes applications.

4. Admin
1. Governs users/entities, monitors analytics, controls NSQF and content modules.

### II. System Design

#### A. DFD-style textual flow

1. Credential Upload Flow
1. Learner uploads file and metadata.
2. API validates payload and checks hash duplication.
3. File stored in Cloudinary, credential saved as pending.
4. Issuer/admin verification updates status.
5. Profile sync service recomputes credits and NSQF.

2. Recommendation Flow
1. Learner requests recommendations.
2. Skill analysis service computes current skill map.
3. Career target skills determine gaps.
4. AI service generates recommendations (or fallback engine runs).
5. Response returned with metadata.

#### B. UML-style design notes

1. Activity diagrams (conceptual)
1. Auth activity.
2. Credential verification activity.
3. Job application activity.

2. Class-level entities (domain)
1. User
2. LearnerProfile
3. Credential
4. Verification
5. Issuer
6. Employer
7. Job
8. Application
9. Subscription
10. Notification

3. Sequence highlights
1. Upload credential sequence.
2. Verify credential sequence.
3. Generate recommendation sequence.

#### C. ERD/EERD narrative

1. One User to one LearnerProfile (for learner role).
2. One User to one Employer (for employer role).
3. One Learner (User) to many Credentials.
4. One Credential to many Verification records over lifecycle.
5. One Employer to many Jobs.
6. One Job to many Applications.
7. One User to many Subscriptions over time; one currentSubscription pointer in User.

## Chapter 4

### System Implementation (Functional Briefing with Module Logic)

### Module 1: Authentication and Identity

1. Register validates role-specific fields.
2. Password hashing is enforced in pre-save model hook.
3. On success, role-specific profile document is created.
4. JWT access and refresh tokens are generated.

Pseudo-code:

```text
if email already exists -> conflict
create User(passwordHash=password)
if role is Learner -> create LearnerProfile
if role is Employer -> create Employer
if role is Issuer -> create Issuer
return access token + refresh token
```

### Module 2: Credential Upload and Verification

1. Validate request user and file existence.
2. Parse metadata and enforce constraints.
3. Validate credits in [1, 40] integer range.
4. Generate file hash and reject duplicates.
5. Upload binary to Cloudinary.
6. Save credential with pending status.
7. Trigger asynchronous AI metadata enrichment.
8. Recompute learner progression only after verification success.

Pseudo-code:

```text
validate auth + file
metadata = parse(metadataJson)
validate required fields
hash = generateFileHash(file)
if hash exists -> duplicate error
url = uploadToCloudinary(file)
credential = create pending credential
send notifications
runCredentialAIEnrichment async
return credential summary
```

### Module 3: NSQF and Profile Sync Service

1. Retrieve all verified credentials for user.
2. Sum credits.
3. Normalize and deduplicate skills.
4. Calculate level using fixed NSQF credit bands.
5. Persist learner profile atomically.

Formula:

$$
\text{TotalCredits} = \sum_{i=1}^{n} \text{credits}_i \quad \text{for verified credentials only}
$$

Level mapping rule uses threshold intervals:

$$
\text{NSQF Level} = f(\text{TotalCredits}) \in \{1,2,\dots,10\}
$$

### Module 4: Recommendation and Skill-Gap Intelligence

1. Skill analysis derives user skill levels from verified credentials.
2. Career path target skills are loaded from DB or fallback catalog.
3. Gap engine computes required vs current levels.
4. AI service attempts unified recommendation JSON generation.
5. Deterministic fallback composes courses/projects/roles/jobs when AI fails.

Skill gap equation per target skill:

$$
\text{Gap} = \max(0, \text{TargetLevel} - \text{CurrentLevel})
$$

Proficiency equation:

$$
\text{Proficiency}(\%) = \min\left(100, \left\lfloor \frac{\text{CurrentLevel}}{\text{TargetLevel}} \times 100 \right\rceil \right)
$$

Job relevance scoring (weighted):

$$
\text{MatchScore} = 0.75 \times \text{SkillScore} + 0.25 \times \text{NSQFScore}
$$

### Module 5: Payment and Subscription

1. Learner selects plan.
2. Razorpay order is created.
3. Signature is validated on callback payload.
4. Active subscription saved and linked to user.
5. Feature flags enforce capability checks (e.g., AI recommendations).

## Chapter 5

### Testing (Unit and Functional Testing)

### A) Unit Testing (Boundary Value and Equivalent Class Partitioning)

#### Unit target 1: Credit validation

Function: validateCredits(credits)

1. Boundary value tests
1. Valid lower edge: 1
2. Valid upper edge: 40
3. Invalid below lower: 0
4. Invalid above upper: 41

2. Equivalent class partitions
1. Valid integer class [1..40]
2. Invalid integer class <1 or >40
3. Invalid non-integer numeric class (20.5)
4. Invalid non-numeric class (string, null, object)

#### Unit target 2: NSQF level calculation

Function: calculateNSQFLevel(totalCredits)

1. Boundary tests at level transition edges: 40/41, 80/81, ... , 360/361.
2. Max-level persistence for very high credits.
3. Invalid input behavior for negative and non-numeric values.

### B) Functional Testing (White-Box) for Two Complex Modules

#### Module 1: Credential upload controller (white-box)

Critical internal paths:

1. No auth user path -> 401.
2. Missing file path -> 400.
3. Metadata parse failure path -> 400.
4. Invalid credits/date/type path -> 400.
5. Duplicate hash path -> 409.
6. Success path with AI enrichment async call -> 201.

White-box focus:

1. Branch coverage for all guard clauses.
2. Decision table for metadata validation combinations.
3. Verification that profile totals are not changed before verification status update.

#### Module 2: Recommendation generation controller (white-box)

Critical internal paths:

1. AI configured and AI returns valid structured data.
2. AI configured but fails -> fallback recommendation path.
3. No career path provided -> generic recommendation path.
4. Relevant jobs available vs not available.

White-box focus:

1. Condition coverage for aiEnabled toggling.
2. Boundary validation for minMatch and pagination.
3. Correct default population when AI arrays are empty.

### Current test assets in repository

1. auth.test.js for registration/login behaviors.
2. nsqf.test.js for utility-level boundary and mapping correctness.
3. Jest configuration with coverage collection across controllers/services/middleware/utils.

## Chapter 6

### Future Scope and Limitations

### Future scope

1. Replace stub verification with real blockchain, DigiLocker, and issuer API connectors.
2. Introduce explainable recommendation outputs with confidence breakdown dashboards.
3. Add event-driven architecture using queue workers for verification and analytics.
4. Add tenant-level issuer organizations and enterprise dashboards.
5. Expand to standards-based credential formats and signed verifiable credentials.

### Current limitations

1. Verification service currently uses stub/manual default logic.
2. AI quality depends on model availability and prompt stability.
3. Some test suites are still sparse for end-to-end flows.
4. Feature set is backend-strong; frontend experience depends on integration maturity.

## Chapter 7

### Conclusion

The project delivers a practical, role-driven micro-credential platform with strong foundation modules for authentication, credential management, verification workflow, NSQF progression, recommendations, and subscription handling. The architecture demonstrates good engineering practices through separation of concerns, route-level authorization, model validation, service abstraction, and graceful fallbacks.

The implemented system is suitable as both an academic capstone and a deployable baseline for a scalable EdTech employability product. It can be further strengthened through deeper test automation, external verification integrations, and richer analytical intelligence.

## Chapter 8

### Bibliography

1. Express.js Documentation. Routing and Middleware Guides. https://expressjs.com/
2. Mongoose Documentation. Models, Schemas, Validation, Indexing. https://mongoosejs.com/docs/
3. JSON Web Token Introduction. RFC 7519. https://datatracker.ietf.org/doc/html/rfc7519
4. Razorpay API Documentation. Orders, Payments, Webhooks. https://razorpay.com/docs/api/
5. Cloudinary Documentation. Upload API and Asset Management. https://cloudinary.com/documentation
6. Node.js Official Documentation. Runtime, Streams, Process Handling. https://nodejs.org/docs/latest/api/
7. National Skills Qualification Framework (NSQF), Government of India references and policy summaries. https://www.msde.gov.in/ and relevant NSQF policy publications.
8. OWASP Top Ten Web Application Security Risks. https://owasp.org/www-project-top-ten/
9. Jest Documentation. Unit Testing and Coverage. https://jestjs.io/docs/getting-started
10. Supertest Documentation. HTTP Endpoint Testing for Node.js. https://github.com/ladjs/supertest

## Chapter 9

### Appendix

### A. Meeting Log Sheet Template

| Date | Participants | Agenda | Decisions | Action Items | Status |
|---|---|---|---|---|---|
| YYYY-MM-DD | Team + Guide | Requirement review | Finalized module scope | Prepare SRS draft | Done |

### B. Result Snapshot Checklist

1. Registration and login screenshots.
2. Credential upload and pending verification screenshot.
3. Verified credential and NSQF level update screenshot.
4. AI recommendation response sample screenshot.
5. Employer search and job application lifecycle screenshot.
6. Admin dashboard analytics screenshot.

### C. API Evidence Samples (to attach)

1. Postman collection exports.
2. Success and error response examples for major endpoints.
3. Webhook payload verification logs.

### D. Deployment and Runtime Evidence

1. Environment setup file template used.
2. Server startup logs and health endpoint response.
3. Test command output summary with coverage.
