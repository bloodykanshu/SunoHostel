# SunoHostel — Hostel Complaint & Management Web System 🏰

SunoHostel is an end-to-end Hostel Complaint & Management Web System designed for educational institutions, hostels, and residential complexes. It provides a seamless responsive web experience for students to report issues, track resolutions live, view announcements, and give mess feedback, alongside an intuitive admin console for wardens to assign duties and verify photo proofs.

---

### 🌟 Key Web System Features

#### 🎓 Student Self-Service Web Portal
- **Login Gateway**: Role-based access for Students and Wardens.
- **Hostels Supported**:
  - 👩 Girls Hostel
  - 👨 Boys Diu Hostel
  - 👨 Boys Una Hostel 1
  - 👨 Boys Una Hostel 2
- **Issue Reporting**: Category selection (*Plumbing, Electricity, Wi-Fi, Mess Food, Cleaning, Security*), urgency levels (*Normal, Urgent, Emergency*), and optional anonymous switch.
- **Live Ticket Tracker**: Real-time progress timeline.
- **Digital Notice Board**: Announcement feed from wardens.
- **Mess Menu & Voting**: Daily meal menu with thumbs up/down quality voting.

#### 🛡️ Warden Operations Command Console
- **Centralized Metrics**: Real-time counts for Total, Pending, In-Progress, and Resolved complaints.
- **Staff Duty Assignment**: Assign maintenance staff with contact numbers.
- **Resolution Proof Verification**: Mandatory photo proof review before resolving tickets.
- **Digital Notice Broadcast**: Broadcast announcements to all students.

---

### 📁 Project Directory Layout

```
SunoHostel/
├── index.html                   # Complete Standalone Web Application
├── netlify.toml                 # Netlify Serverless Deployment Config
├── package.json                 # Project Dependencies
├── netlify/
│   └── functions/
│       └── api.js               # Netlify Serverless CockroachDB API
└── apps/
    ├── backend/                 # Express REST API, Prisma Schema & CockroachDB setup
    └── web-admin/               # React Admin Dashboard Component
```

---

### 🗄️ Database Architecture
- **Database**: CockroachDB Serverless (10 GB Free Tier)
- **Tables**: `users`, `complaints`, `feedbacks`, `notices`, `mess_menus`, `mess_feedbacks`
