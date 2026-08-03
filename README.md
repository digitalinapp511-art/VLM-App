# VLM Academy

Welcome to **VLM Academy**, a next-generation real-time edtech platform designed to connect students with expert teachers for instant doubt resolution, structured live classes, and interactive AI-assisted learning.

---

## 1. Project Introduction

**VLM Academy** is a comprehensive educational ecosystem built to bridge the gap between traditional learning environments and instant, on-demand support. At its core, the platform combines a robust real-time matching system (linking students with live, verified tutors) with a personalized AI tutor to assist students in their day-to-day academic challenges. 

By leveraging real-time technologies like Socket.io and background job queues (BullMQ/Redis), VLM Academy provides seamless voice, video, and chat interactions, alongside structured class scheduling and parents-guided student monitoring.

---

## 2. Objectives

* **On-Demand Assistance:** Eliminate learning bottlenecks by matching students with available teachers in under a minute for real-time doubt resolution.
* **Gamified Progress:** Incentivize academic persistence with daily streaks, points, and spin-wheel rewards for students, while compensating teachers fairly with redeemable points.
* **Parent-led Governance:** Provide parents with granular controls over child device time, feature permissions, and learning goals.
* **High-Quality Teaching Standards:** Vet teachers through a multi-step onboarding process, including video applications and live Agora-based interviews.

---

## 3. Target Users

The platform is optimized for three main groups:

1. **Students:** K-12 students seeking homework help, test preparation, live academic instruction, or instant interaction with an AI companion.
2. **Teachers/Tutors:** Academic professionals and subject matter experts looking to monetize their free time by answering doubts, hosting live classes, and providing mentorship.
3. **Parents:** Guardians who want to monitor their children's educational progress, restrict screen time or certain communication features (like video calls), and sponsor subscriptions.
4. **Administrators:** Platform supervisors who manage payouts, verify teacher documents, review interview reports, adjust system parameters, and resolve disputes.

---

## 4. Key Features

### 📡 Real-Time Doubt Dispatching
* **Smart Matching:** Tutors are queried dynamically using a priority queue (BullMQ + Redis) based on online availability, subjects, and grade ranges.
* **Agora-Powered Classrooms:** Audio, video, and real-time chat spaces for live collaborative problem-solving.

### 🤖 AI-Powered Tutor Companion
* **24/7 Support:** AI chatbot that guides students through complex equations and language concepts.
* **Usage Limits:** Credit-based usage limits to balance automated instruction with human tutoring sessions.

### 🔒 Parent Dashboard & Controls
* **Feature Flags:** Parents can toggle chat, video calls, live classes, and MCQ games on or off.
* **Limits:** Daily study hour trackers and app restriction timings.
* **Linking Requests:** Quick connection via QR code scans or parent-child requests.

### 💼 Teacher Onboarding & Wallet
* **KYC & Verification:** Review of bank details, qualifications, certifications, and teaching experience.
* **Point Conversion:** Points-based wallet ledger mapping to INR earnings with support for secure bank withdrawals.
* **Live Slot Interviewing:** Admin scheduling for vetting candidates via video interviews.

### 🏆 Gamification & Engagement
* **Leaderboards:** Grade-level rankings based on points won from MCQ tasks and sessions.
* **Streak Tracking:** Streaks for daily logins and completed study sessions.

---

## 5. Repository Layout

* 📁 [backend](file:///Users/ritikparihar/Desktop/DigitalInApp/VLM-App/backend): Node.js + Express API, Socket.io layer, BullMQ, and MongoDB configuration.
* 📁 [frontend](file:///Users/ritikparihar/Desktop/DigitalInApp/VLM-App/frontend): React, TypeScript, Vite, TailwindCSS, and shadcn/ui client code.
* 📄 [DATABASE_DESIGN.md](file:///Users/ritikparihar/Desktop/DigitalInApp/VLM-App/DATABASE_DESIGN.md): Detailed database architecture, entity schemas, and Mermaid ER Diagrams.
