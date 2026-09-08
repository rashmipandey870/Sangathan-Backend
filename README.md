# Sangathan – Sports Management Backend API 🏆

A scalable RESTful API service built with **Node.js**, **Express.js**, and **MongoDB** powering the Sangathan Sports Management Android Application. Provides role-based access control, captaincy management, trial scheduling, automated email notifications, and player recruitment workflows.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 System Architecture

```
Android Client Application (Retrofit / Java)
              │
              │ HTTPS / REST API JSON
              ▼
    Node.js + Express Server
   ├── Middleware (JWT Authentication, CORS, Body-Parser)
   ├── Routing & Controllers
   │    ├── Auth & User Management
   │    ├── Team Creation & Rosters
   │    ├── Player Selection & Trial Applications
   │    └── Notifications (Nodemailer Service)
   └── Mongoose Data Models
              │
              ▼
      MongoDB Database
```

---

## ✨ Key Features

- 🔐 **Role-Based Authentication:** Secure user registration and login using JWT tokens and hashed credentials.
- 👥 **Team & Captain Management:** Captains can create sport-specific teams, manage rosters, and publish trial schedules.
- 🏅 **Player Selection Workflow:** Dynamic student application, trial evaluation, selection, and status synchronization.
- 📧 **Automated Notifications:** Email alerts dispatched to candidates upon selection or trial updates via Nodemailer.
- 🛡️ **Defensive API Design:** Centralized error handling, input validation, and decoupled business logic.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT), Bcrypt
- **Email Service:** Nodemailer
- **Testing & Tooling:** Postman, Git

---

## 📂 Project Structure

```
├── constants/          # Global constants and status enums
├── controllers/        # Request handlers & core business logic
│   ├── authController.js
│   ├── teamController.js
│   └── playerController.js
├── models/             # Mongoose schemas (User, Team, Player, Trial)
├── routes/             # Express API routes
│   ├── authRoutes.js
│   ├── teamRoutes.js
│   └── adminRoutes.js
├── utils/              # Email utilities and helper functions
├── .env.example        # Environment variable template
├── db.js               # Database connection configuration
└── server.js           # Server entry point
```

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rashmipandey870/Sangathan-Backend.git
   cd Sangathan-Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/sangathan
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_app_password
   ```

4. **Start the server:**
   ```bash
   # Production
   node server.js

   # Development
   npm run dev
   ```

---

## 📡 Core API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | Public |
| `POST` | `/api/teams/create` | Create a new sports team | Captain / Admin |
| `GET`  | `/api/teams/all` | Fetch all active sports teams | Authenticated |
| `POST` | `/api/players/apply` | Apply for sports team trial | Student |
| `PATCH`| `/api/players/status` | Update player selection status | Captain |

---

## 🔗 Related Repositories
- **Android Client:** [Sangathan-sports-management-Android-application-](https://github.com/rashmipandey870/Sangathan-sports-management-Android-application-)

---

## 👩‍💻 Author
**Rashmi Pandey**  
- [GitHub](https://github.com/rashmipandey870)  
- [LinkedIn](https://www.linkedin.com/in/rashmipandey870)
