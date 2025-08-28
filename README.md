# Student Feedback System

A full‑stack web application to collect, analyze, and manage course feedback. Includes a modern, animated React UI and a role‑based admin panel for managing courses and viewing analytics.

## Table of Contents
- [Live Views (Local Dev)](#live-views-local-dev)
- [Key Features](#key-features)
- [Role-Based Access](#role-based-access)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Seeding the Database](#seeding-the-database)
- [Running the App](#running-the-app)
- [Frontend UX Details](#frontend-ux-details)
- [Routing](#routing)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Validation Rules](#validation-rules)
- [Security & Error Handling](#security--error-handling)
- [Performance Notes](#performance-notes)
- [Troubleshooting](#troubleshooting)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Live Views (Local Dev)
- Courses (public): `/courses`
- Admin Panel (admin): `/adminPanel`
- Analytics (admin): `/analytics`

Admin mode is inferred automatically when you visit an admin route (no hash in URL, no dropdowns).

---

## Key Features
- Courses overview with aggregated ratings (avg and total count)
- Detailed per‑course feedback view with:
  - All feedback entries
  - Amazon‑style rating distribution (1–5 stars count and %)
  - Add feedback form (star rating + comment)
- Admin Panel (CRUD for courses): create, edit, delete
- Analytics (admin): system‑wide and per‑course metrics
- Modern UI/UX: animations, responsive design, accessible focus states
- Default Black & White theme across the app

---

## Role-Based Access
This project uses simple, header‑based role and identity for demonstration.
- Header `x-user-role`: `admin` or `student`
- Header `x-user-name`: display name used to determine feedback ownership

Frontend automatically sets these headers via `localStorage`:
- Visiting `/adminPanel` or `/analytics` stores role `admin`
- Visiting `/courses` sets role `student`

Permissions
- Student: view courses and feedback, submit feedback, edit/delete OWN feedback
- Admin: full course CRUD, view analytics and summaries, edit/delete ANY feedback

---

## Architecture
- Backend: Node.js + Express + MongoDB (Mongoose)
- Frontend: React (CRA) + CSS animations
- RESTful API between frontend and backend

Directory layout (root):
- `backend/` Express app, models, routes, seed script
- `frontend/` React app (UI)

---

## Installation & Setup
Prerequisites
- Node.js 16+
- MongoDB 4.4+

Backend
```bash
cd backend
npm install
npm start
```
Runs on `http://localhost:5000` by default.

Frontend
```bash
cd frontend
npm install
npm start
```
Runs on `http://localhost:3000` by default.

Environment
- Default MongoDB connection is configured in `backend/config/db.js`. Update if needed.

---

## Seeding the Database
Load rich demo data (multiple courses and randomized feedback):
```bash
cd backend
node seed.js
```
This clears existing `courses` and `feedbacks` collections and repopulates them.

---

## Running the App
1. Start MongoDB
2. Start backend: `cd backend && npm start`
3. Start frontend: `cd frontend && npm start`
4. Open the browser:
   - Public courses: `http://localhost:3000/courses`
   - Admin panel: `http://localhost:3000/adminPanel`
   - Analytics: `http://localhost:3000/analytics`

---

## Frontend UX Details
- Default theme is Black & White (monochrome). All gradients and highlights are grayscale.
- Course card is fully clickable. Rating block is anchored to the bottom for consistent alignment.
- Feedback page shows:
  - Course summary (code, instructor, description)
  - Average rating and total count
  - Rating distribution (1–5)
  - All feedback items with student name and date
  - Inline edit/delete controls shown only for owner or admin
- Submitting feedback requires a rating and a name (if not inferred).

---

## Routing
Path‑based routing using the History API (no hash):
- `/courses` → public courses list
- `/adminPanel` → admin only; enables admin capabilities in UI and API
- `/analytics` → admin only
- `/feedback` → internal view for selected course (navigated programmatically)

Role inference:
- Visiting `/adminPanel` or `/analytics` sets role to `admin` in `localStorage`
- Visiting `/courses` resets role to `student`

---

## API Reference
Base URL: `http://localhost:5000/api`

Headers for protected endpoints
- `x-user-role`: `admin` or `student`
- `x-user-name`: string (only needed to own feedback)

Courses
- `GET /courses`
  - Returns all courses with `totalRatings` and `averageRating`
- `POST /courses` (admin)
  - Body: `{ name, code, instructor, description? }`
- `GET /courses/:id`
- `PUT /courses/:id` (admin)
  - Body: same as POST
- `DELETE /courses/:id` (admin)
- `GET /courses/:id/analytics` (admin)
  - Returns `{ course, totalRatings, averageRating, ratingDistribution }`
- `GET /courses/stats/summary` (admin)
  - Returns overall system stats and top courses

Feedback
- `POST /feedback`
  - Body: `{ courseId, rating (1..5), comment?, studentName }`
- `GET /feedback/course/:courseId`
  - Returns all feedback for the course
- `PUT /feedback/:id` (owner or admin)
  - Body: subset of `{ rating, comment, studentName }`
- `DELETE /feedback/:id` (owner or admin)
- `GET /feedback/stats` (admin)

Notes
- Ownership is determined by exact match of `studentName` vs header `x-user-name` (case‑insensitive).

---

## Data Models
Course (Mongoose)
```js
{
  name: String!,          // trimmed, 2..100
  code: String!,          // unique, uppercase A‑Z 0‑9, 3..20
  instructor: String!,    // trimmed, 2..100
  description?: String,   // <= 500
  createdAt: Date,
  updatedAt: Date,
  // virtuals: displayName
}
```

Feedback (Mongoose)
```js
{
  courseId: ObjectId!,
  rating: Number!,     // 1..5
  comment?: String,
  studentName: String!,
  createdAt: Date
}
```

---

## Validation Rules
- Course
  - name: required, 2–100 chars
  - code: required, uppercase, 3–20 chars, alphanumeric only, unique
  - instructor: required, 2–100 chars
  - description: optional, max 500
- Feedback
  - courseId: required
  - rating: required, 1–5
  - studentName: required (used for ownership)

---

## Security & Error Handling
- Route guards:
  - Admin‑only: course create/update/delete, analytics & summaries, feedback stats
  - Owner‑or‑admin: feedback update/delete
- Input sanitization: server trims strings and uppercases course code
- Duplicate protection: unique index on `Course.code`
- Clear errors: JSON messages for all failure cases; 403 for unauthorized

---

## Performance Notes
- Compound indexes for courses
- Aggregations for analytics and summaries
- Minimal payloads and computed stats on the backend

---

## Troubleshooting
- 403 on admin routes
  - Ensure you are visiting `/adminPanel` or `/analytics` (sets role to admin)
- No courses/feedback
  - Run the seed: `cd backend && node seed.js`
- Port already in use
  - Stop other processes using 3000/5000 or change ports in start scripts
- Mongo connection fails
  - Check `backend/config/db.js` connection string and that MongoDB is running

---

## Tech Stack
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Frontend: React, CSS (animations)

---

## License
MIT 