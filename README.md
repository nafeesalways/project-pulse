# ProjectPulse - Client Feedback & Project Health Tracker

A comprehensive internal project management system designed for IT and software companies to monitor project health, track progress, and collect structured feedback from clients and team members.

## Live Demo

🔗 **Live URL:** [https://project-pulse-ten.vercel.app](https://project-pulse-ten.vercel.app)

📹 **Demo Video:** [https://drive.google.com/your-video-link](https://drive.google.com/your-video-link)

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications

### Backend
- **Next.js API Routes** (Serverless Functions)j
- **MongoDB Native Driver** (No Mongoose)
- **JWT Authentication** for secure access

### Database
- **MongoDB Atlas** (Cloud Database)

### Deployment
- **Vercel** (Frontend + Backend)

---

## Core Features

### Role-Based Access Control
- **Admin:** Full system access, project creation, team assignment
- **Employee:** View assigned projects, submit weekly check-ins
- **Client:** View projects, provide feedback

### Project Management
- Create and manage projects with detailed information
- Assign clients and multiple employees to projects
- Set project timelines and track deadlines
- Real-time project status monitoring

### Weekly Check-in System (Employee)
Employees submit weekly progress reports including:
- **Progress Percentage** (0-100%)
- **Confidence Level** (1-5 scale)
- **Blockers/Challenges** (Text description)
- **Risk Flagging** (Optional high-priority issues)

### Client Feedback System
Clients provide structured feedback:
- **Overall Satisfaction Rating** (1-5 stars)
- **Communication Clarity Rating** (1-5 scale)
- **Optional Comments**

### Automated Health Score Calculation

The system automatically calculates a **Project Health Score (0-100)** based on:

#### Algorithm Logic:

#### Status Determination:
- **80-100:** On Track (Green)
- **60-79:** At Risk (Yellow)
- **0-59:** Critical (Red)

### Real-time Dashboards
- **Admin Dashboard:** Overview of all projects, health metrics, risk alerts
- **Employee Dashboard:** Personal project list, pending check-ins
- **Client Dashboard:** Assigned projects, feedback submission

---

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Git installed

### 1. Clone Repository

### 2. Install Dependencies

### 3. Environment Variables
Create a `.env.local` file in the root directory:

### 4. Database Seeding
Populate the database with demo users and data:


This creates:
- 1 Admin user
- 1 Employee user  
- 1 Client user

### 5. Run Development Server


Open [http://localhost:3000/login](http://localhost:3000/login)

---

## Demo Credentials

### Admin Access

### Employee Access

### Client Access

---

## Project Structure


---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with JWT token generation

### Projects
- `GET /api/projects` - Fetch all projects (Admin)
- `POST /api/projects` - Create new project (Admin only)
- `GET /api/projects/my-projects?userId={id}` - Employee's assigned projects
- `GET /api/projects/client-projects?clientId={id}` - Client's projects

### Check-ins & Feedback
- `POST /api/check-ins` - Submit employee weekly check-in
- `POST /api/feedback` - Submit client feedback

### Users
- `GET /api/users?role={role}` - Fetch users by role (for dropdowns)

---

## Key Implementation Highlights

### 1. Serverless Architecture
All backend logic runs as serverless functions on Vercel, ensuring scalability and zero maintenance.

### 2. MongoDB Connection Pooling
Implemented singleton pattern to prevent connection exhaustion in serverless environment.

### 3. JWT-Based Security
Token-based authentication ensures secure API access. Tokens stored in localStorage and validated on protected routes.

### 4. Real-time Health Scoring
Health score recalculates instantly upon every check-in or feedback submission, providing real-time project insights.

### 5. Responsive Design
Fully responsive UI built with Tailwind CSS, optimized for desktop, tablet, and mobile devices.

---

## Deployment Instructions

### Deploy to Vercel

1. **Push to GitHub:**
