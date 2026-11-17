# Bethesda Satyavakyam Church Management System & Public Website

A complete, enterprise-grade Church Management System (CMS) integrated seamlessly into the **Bethesda Satyavakyam Church (LEF Kadapa)** MERN web platform.

---

## 🌟 Key Architecture & Features

### 1. Show Page – Announcements & Notice Board
- **Public Show Page (`/announcements`)**: Displays church announcements, upcoming special events, revival meetings, fasting & prayer schedules, and emergency notices.
- **Categorized & Prioritized**: Categorized by *General, Sunday Service, Youth, Worship, Special Event, Urgent Notice, Fasting & Prayer* with visual priority badges (*Urgent/High, Medium, Low*).
- **Admin Management (`/portal/announcements`)**: Full administrative options to create, edit, delete, publish, schedule (publish & expiry dates), and archive notices with banner poster links.

### 2. Church ID Management & Digital ID Cards
- **Sequential Auto-Generation**: Automatically generates unique, zero-padded church identification numbers in format `BSC-YYYY-XXXX` (e.g. `BSC-2026-0001`).
- **Duplicate Prevention**: Backed by atomic MongoDB sequence counters and unique indexing.
- **Member Directory (`/portal/members`)**: Searchable by full name, Church ID, phone, email, status, and department.
- **Interactive Digital ID Card**:
  - Two-sided flip card with official church branding, photo, Church ID, blood group, department, joining date, and emergency contact.
  - Built-in QR Code encoding direct verification URL (`/verify/:churchId`).
  - One-click Print & Download capability (`@media print` optimized).
- **Public / Secure QR Verification (`/verify/:churchId`)**: Scanning the ID card QR code instantly opens a verification page confirming official church membership status.

### 3. ID-Based Login & Role-Based Access Control (RBAC)
- **Login Credentials**: Log in using **Church ID** (or registered email) and password.
- **5 Granular Roles**:
  1. `Super Admin`: Complete platform authority, user management, and role delegation.
  2. `Church Admin`: Member management, departments, attendance, notices, and prayer moderation.
  3. `Pastor`: Pastoral care, attendance reports, confidential prayer requests, and directory.
  4. `Department Head`: Department members, department attendance, notices, and team prayers.
  5. `Church Member`: Personal digital ID card, own attendance logs, prayer submission, and notices.
- **Security**: Password hashing via `bcryptjs`, tamper-proof `jsonwebtoken` (JWT), protected React routes (`ProtectedRoute`), and API authorization middleware.

### 4. Attendance Management & QR Scanner
- **Live Camera QR Scanning (`/portal/attendance`)**: Use device camera/webcam to scan members' physical or digital ID cards for touchless, instant check-in.
- **Fast Church ID Search**: Type or scan Church ID for instant check-in.
- **Supported Service Types**: Sunday Worship, Prayer Meeting, Bible Study, Youth Meeting, Department Meeting, Special Programs.
- **Duplicate Prevention**: Compound unique database constraint on `(churchId, serviceType, date)` guarantees members cannot be checked in more than once for the same service on the same date.
- **Analytics & Reports**: Turnout percentage against active congregation, last 7 days trend, and monthly breakdowns.
- **CSV / Excel Export**: One-click download of attendance logs formatted as CSV.

### 5. Prayer Requests & Intercession Ministry
- **Public Prayer Page (`/prayers`)**: Believers and website visitors can submit intercessory prayer requests.
- **Confidentiality Options**:
  - `Public`: Appears on church prayer wall for all believers to pray.
  - `Prayer Team`: Accessible strictly to church intercessory prayer ministry.
  - `Pastor Only`: Protected exclusively for the Senior Pastor and Super Admin.
  - `Private`: Restricted for pastoral follow-up.
- **Anonymous Submissions**: Toggle `Submit Anonymously` to hide identity.
- **Workflow & Testimonies**: Status lifecycle (*Pending* → *Under Prayer* → *Answered* with praise report testimony).

### 6. Department & Ministry Management
- **Dynamic Departments (`/portal/departments`)**: Create, edit, and manage ministries (Youth, Worship & Choir, Sunday School, Prayer Team, Women Fellowship, Media & Sound).
- **Department Head & Member Assignment**: Link church members to specific ministries.
- **Ministry Dashboards**: Detailed department view with meeting schedules, member rosters, and attendance statistics.

### 7. Central Admin Dashboard
- **Real-Time Metrics (`/portal/dashboard`)**:
  - Total registered members
  - Active Church IDs
  - Today's attendance & turnout percentage
  - Department count
  - Pending prayer requests
  - Recent announcements & live audit activity feed
- **Interactive Visual Charts**: Attendance trends over time and department member distribution.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router v6, QRCode.react, Html5-Qrcode, Vanilla CSS with Sacred Bethesda Theme (`#1B2A4E` Navy, `#D4AF37` Gold, `#FAF6F0` Ivory).
- **Backend**: Node.js, Express.js, Mongoose ODM, JWT, BcryptJS, CORS.
- **Database**: MongoDB / MongoDB Atlas.
- **Deployment**: Vercel (Frontend), Render (Backend), GitHub (Source Control).

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Backend Setup
```bash
cd backend
npm install

# Copy environment variables
copy .env.example .env
# Edit .env with your MongoDB connection string and JWT secret

# Seed initial departments, sample members, and admin accounts
npm run seed

# Start backend server
npm start
# Backend runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Copy environment variables
copy .env.example .env

# Run development server
npm start
# Frontend runs on http://localhost:3000
```

---

## 🔑 Pre-Seeded Demo Credentials

Run `npm run seed` inside `backend/` to populate these ready-to-test accounts:

| Role | Church ID | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `BSC-2026-0001` | `Admin@2026` | Full system access, all modules & user roles |
| **Church Admin** | `BSC-2026-0002` | `Admin@2026` | Members, attendance, departments, notices |
| **Dept Head (Youth)** | `BSC-2026-0003` | `Leader@2026` | Department management, check-in, notices |
| **Church Member** | `BSC-2026-0004` | `Member@2026` | Digital ID card, personal attendance, prayers |

---

## ☁️ Deployment Guide

### 1. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user (e.g. `church_admin`).
3. Add IP Address `0.0.0.0/0` under Network Access to allow Render and Vercel connections.
4. Copy the connection string:
   ```
   mongodb+srv://church_admin:<password>@cluster0.mongodb.net/church_cms?retryWrites=true&w=majority
   ```

### 2. Backend Deployment on Render
1. Push code to GitHub repository (`origin/main`).
2. Log in to [Render](https://render.com) and click **New +** → **Web Service**.
3. Connect your `Church-Website` GitHub repository.
4. Configure service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `mongodb+srv://...` (your Atlas URI)
   - `JWT_SECRET`: (a secure 32+ character string)
   - `FRONTEND_URL`: `https://<your-vercel-domain>.vercel.app`
6. Click **Create Web Service**. Your backend API will be live at `https://<your-service>.onrender.com`.

### 3. Frontend Deployment on Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New...** → **Project**.
2. Select your `Church-Website` repository.
3. Configure project settings:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
4. Under **Environment Variables**, add:
   - `REACT_APP_API_URL`: `https://<your-service>.onrender.com/api`
5. Click **Deploy**. Vercel will build and host your website with automatic SPA routing using `frontend/vercel.json`.

---

## 📜 Public & Management URLs Summary

- **Public Church Website**: `https://<frontend-url>/`
- **Announcements Show Page**: `https://<frontend-url>/announcements`
- **Prayer Wall & Requests**: `https://<frontend-url>/prayers`
- **Member ID Verification**: `https://<frontend-url>/verify/:churchId`
- **Member & Admin Portal Login**: `https://<frontend-url>/login`
- **Central Admin Dashboard**: `https://<frontend-url>/portal/dashboard`
- **Church ID & Member Directory**: `https://<frontend-url>/portal/members`
- **Attendance & QR Check-in**: `https://<frontend-url>/portal/attendance`
- **Department Management**: `https://<frontend-url>/portal/departments`
- **Personal Digital ID Card**: `https://<frontend-url>/portal/my-id`
