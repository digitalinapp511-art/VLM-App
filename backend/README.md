# VLM Academy — Backend API

Node.js + Express REST API with Socket.io real-time layer, BullMQ job queues, Redis presence tracking, and MongoDB (via Mongoose).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v20+ (ESM modules) |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Cache / Presence | Redis (ioredis) |
| Job Queues | BullMQ |
| Real-Time | Socket.io |
| Auth | JWT Access Token (15m) + Refresh Token (30d, httpOnly cookie) |
| Media Upload | Cloudinary |
| Voice / Video | Agora RTC |

---

## Project Structure

```
backend/
├── src/
│   ├── server.js           ← Entry point: starts HTTP server, connects DB/Redis, runs workers
│   ├── app.js              ← Express app factory: middleware, CORS, route mounting
│   │
│   ├── config/
│   │   ├── db.js           ← MongoDB connection (singleton pattern)
│   │   ├── cloudinary.js   ← Cloudinary SDK configuration
│   │   └── constants.js    ← App-wide enums: ROLES, SESSION_TYPES, STATUS values
│   │
│   ├── middleware/
│   │   ├── auth.js         ← JWT protect + authorize guards, token generators, cookie helpers
│   │   ├── errorHandler.js ← Global Express error handler + asyncHandler wrapper
│   │   └── upload.js       ← Multer file upload middleware (local + Cloudinary)
│   │
│   ├── models/             ← Mongoose schemas (one file per collection)
│   │   ├── User.js         ← Core auth user (stores mobile, email, roles, JWT state)
│   │   ├── Student.js      ← Student profile linked to User
│   │   ├── Teacher.js      ← Teacher profile with subjects, classes, availability
│   │   ├── Parent.js       ← Parent profile with linked child references
│   │   ├── Session.js      ← Live session record (chat/audio/video)
│   │   ├── DoubtRequest.js ← Request lifecycle (searching → accepted → completed)
│   │   ├── Notification.js ← In-app notifications
│   │   ├── WalletTransaction.js ← Teacher points credit/debit ledger
│   │   ├── Withdrawal.js   ← Teacher withdrawal requests
│   │   ├── AiChatMessage.js← AI tutor conversation history
│   │   ├── McqTask.js      ← Daily MCQ quiz tasks
│   │   ├── Review.js       ← Session ratings and reviews
│   │   ├── Otp.js          ← OTP records for mobile/email verification
│   │   ├── Plan.js         ← Subscription plan definitions
│   │   ├── StudentUsage.js ← AI credit usage tracking per student
│   │   ├── Referral.js     ← Referral program records
│   │   ├── AdminSettings.js← Key-value store for admin config flags
│   │   ├── VlmCounter.js   ← Auto-increment ID generator for VLM IDs
│   │   ├── Interview.js    ← Teacher interview/application records
│   │   ├── LiveClass.js    ← Scheduled live classes
│   │   ├── Message.js      ← Chat messages within sessions
│   │   ├── ShortVideo.js   ← Short educational video content
│   │   ├── StudyResource.js← Study material uploads
│   │   ├── ParentChildRequest.js ← Parent linking requests
│   │   └── SupportTicket.js← User support tickets
│   │
│   ├── controllers/        ← Route handlers (business logic)
│   │   ├── authController.js      ← OTP login, email login, refresh tokens, logout
│   │   ├── studentController.js   ← Student profile, session requests, AI chat, plans
│   │   ├── teacherController.js   ← Teacher profile, availability, wallet, sessions
│   │   ├── parentController.js    ← Parent profile, child linking
│   │   ├── sessionController.js   ← Shared session lifecycle (join, leave, complete)
│   │   ├── sharedController.js    ← Cross-role operations (ratings, session completion)
│   │   └── adminController.js     ← Admin dashboard, user management, settings
│   │
│   ├── routes/             ← Express routers (thin — just mount controllers)
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── teacherRoutes.js
│   │   ├── parentRoutes.js
│   │   ├── sessionRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── services/           ← Pure business logic, no Express req/res knowledge
│   │   ├── matchingService.js     ← Find eligible online teachers for a student request
│   │   ├── presenceService.js     ← Redis AVAILABLE set: track online/busy teachers
│   │   ├── redisService.js        ← Redis client singleton + generic helpers
│   │   ├── routingService.js      ← Step-through teacher routing logic
│   │   ├── notificationService.js ← Create and broadcast notifications
│   │   └── rewardService.js       ← Teacher points/rewards calculation
│   │
│   ├── queues/             ← BullMQ queue definitions (shared between producers & workers)
│   │   └── dispatchQueue.js       ← Active dispatch queue for teacher matching jobs
│   │
│   ├── workers/            ← BullMQ job processors (run in background)
│   │   └── dispatchWorker.js      ← Processes dispatch jobs: routes requests to teachers
│   │
│   ├── socket/
│   │   └── index.js        ← Socket.io server init, auth middleware, event handlers
│   │
│   ├── utils/
│   │   ├── helpers.js      ← OTP generator, referral code generator, small utilities
│   │   └── vlmIdGenerator.js ← Auto-increment VLM ID (e.g., VLM-10001)
│   │
│   └── seed/
│       └── seedData.js     ← Seeds default admin user on first startup
│
├── .env                    ← Local environment variables (never commit to git)
├── .env.example            ← Template for required environment variables
├── .gitignore
├── .dockerignore
├── Dockerfile              ← Docker container definition (for containerized VPS deploy)
└── package.json
```

---

## Auth System

This API uses a **dual-token authentication** pattern:

| Token | Lifetime | Storage | Use |
|---|---|---|---|
| **Access Token** (JWT) | 15 minutes | `localStorage` (frontend) | Sent in `Authorization: Bearer` header with every API request |
| **Refresh Token** (JWT) | 30 days | `httpOnly` cookie (`vlm_refresh`) | Used to silently issue new access tokens without re-login |

### Flow
1. User logs in → receives `accessToken` in response body + `vlm_refresh` cookie set server-side
2. Frontend sends `accessToken` in `Authorization` header on every request
3. On `401` response → frontend silently calls `POST /api/auth/refresh` → gets new `accessToken`
4. If refresh also fails → user is logged out and redirected to `/login`

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, secrets, and API keys

# 3. Start development server (with auto-restart)
npm run dev

# 4. Start production server
npm start
```

---

## API Prefix

All endpoints are prefixed with `/api/`:
- `GET  /api/health`
- `POST /api/auth/send-otp`
- `POST /api/auth/refresh`
- `GET  /api/student/profile`
- `GET  /api/teacher/profile`
- `POST /api/sessions/:id/complete`
- etc.
