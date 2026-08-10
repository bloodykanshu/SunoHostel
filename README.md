# SunoHostel — Hostel Complaint & Management System

SunoHostel is an end-to-end Hostel Complaint & Management System designed for educational institutions, hostels, and residential complexes. It provides a seamless mobile experience for students to report issues, track resolutions, view announcements, and give mess feedback, alongside an intuitive admin dashboard for wardens and staff to assign duties, track SLA, and manage hostel operations.

---

## 📁 Complete File & Folder Architecture

```
SunoHostel/
├── README.md
├── apps/
│   ├── backend/                         # Express.js REST API Server
│   │   ├── prisma/
│   │   │   └── schema.prisma            # PostgreSQL Database Schema (Prisma ORM)
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── db.js                # Database connection client
│   │   │   ├── controllers/
│   │   │   │   ├── authController.js    # Student & Admin auth logic
│   │   │   │   ├── complaintController.js # Complaint submission, status update, staff assign
│   │   │   │   ├── noticeController.js  # Notice broadcast management
│   │   │   │   └── messController.js    # Mess menu & meal rating logic
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.js              # JWT Verification & Role-Based Access Control (RBAC)
│   │   │   │   └── upload.js            # Multer File/Media upload middleware
│   │   │   ├── models/
│   │   │   │   └── Schemas.js           # Mongoose Schema definitions (MongoDB option)
│   │   │   ├── routes/
│   │   │   │   └── apiRoutes.js         # REST API Route definitions
│   │   │   └── app.js                   # Express App Entry Point
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── mobile-student/                  # React Native (Expo) Student Application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Header.jsx           # App top bar with notifications badge
│   │   │   │   └── TicketCard.jsx       # Complaint card component with status badge
│   │   │   ├── screens/
│   │   │   │   ├── ComplaintSubmissionScreen.jsx # Issue Reporting screen with media upload & urgency
│   │   │   │   ├── TicketTrackerScreen.jsx # Visual status tracker timeline
│   │   │   │   ├── NoticeBoardScreen.jsx   # Hostel announcements stream
│   │   │   │   └── MessFeedbackScreen.jsx  # Daily mess menu & feedback voting
│   │   │   ├── services/
│   │   │   │   └── api.js               # Axios HTTP client with token injection
│   │   │   └── context/
│   │   │       └── AuthContext.js       # Auth provider for student JWT & profile
│   │   ├── App.js                       # Expo Root Navigation
│   │   └── package.json
│   │
│   └── web-admin/                       # React.js + Tailwind CSS Admin Web Dashboard
│       ├── src/
│       │   ├── components/
│       │   │   ├── StatCard.jsx         # Analytics summary card
│       │   │   ├── AssignStaffModal.jsx # Modal to assign ticket to staff with contact details
│       │   │   └── ResolutionModal.jsx  # Modal requiring photo proof before resolving ticket
│       │   ├── pages/
│       │   │   └── AdminDashboard.jsx   # Centralized Ticket Management & Analytics Dashboard
│       │   ├── services/
│       │   │   └── api.js               # Admin API Service
│       │   ├── index.css                # Tailwind CSS Directives & Custom Aesthetics
│       │   └── App.jsx                  # Main Admin Dashboard Application
│       ├── index.html
│       ├── tailwind.config.js
│       └── package.json
```

---

## 🛠️ Technology Stack

- **Backend API**: Node.js, Express.js, JWT Authentication, Multer file handling.
- **Database Options**:
  - **Relational**: PostgreSQL with Prisma ORM.
  - **NoSQL**: MongoDB with Mongoose Schema models.
- **Student Mobile App**: React Native (Expo), React Hooks, Lucide Icons.
- **Admin Web Dashboard**: React 18, Tailwind CSS, Lucide React Icons.

---

## ⚡ Quick Start Guide

### 1. Backend Setup
```bash
cd apps/backend
npm install
npx prisma db push # For PostgreSQL setup
npm run dev
```

### 2. Student Mobile App Setup
```bash
cd apps/mobile-student
npm install
npx expo start
```

### 3. Admin Web Dashboard Setup
```bash
cd apps/web-admin
npm install
npm run dev
```
