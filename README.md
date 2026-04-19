# 🚀 Online Service Effectiveness Dashboard

A full-stack MERN application with JWT authentication, role-based access, charts, and admin management.

---

## 📁 Project Structure

```
online-service-dashboard/
├── client/                  ← React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      ← Navbar, Sidebar, Loader, ProtectedRoute
│   │   ├── pages/           ← Login, Register, UserDashboard, AdminDashboard, Profile, Feedback
│   │   ├── services/        ← api.js (Axios)
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
└── server/                  ← Node.js + Express Backend
    ├── config/db.js
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── seed.js              ← Database seed script
    ├── server.js
    ├── .env
    └── package.json
```

---

## ⚙️ Prerequisites

- Node.js v16+
- MongoDB (local) or MongoDB Atlas
- npm

---

## 🛠️ Setup & Run Steps

### Step 1: Start MongoDB
Make sure MongoDB is running locally on port 27017.
Or update `MONGO_URI` in `server/.env` with your Atlas connection string.

---

### Step 2: Setup & Start Backend

```bash
cd server
npm install
node seed.js       # ← Run this ONCE to add demo users & data
npm start
```

Backend runs on: **http://localhost:5000**

---

### Step 3: Setup & Start Frontend

Open a new terminal:

```bash
cd client
npm install
npm start
```

Frontend runs on: **http://localhost:3000**

---

## 🔐 Login Credentials

| Role  | Email             | Password |
|-------|-------------------|----------|
| Admin | admin@gmail.com   | admin123 |
| User  | user@gmail.com    | user123  |
| User  | jane@gmail.com    | jane1234 |

---

## ✅ Features

### User
- Login / Register with JWT
- Dashboard with charts (Bar, Pie, Line)
- Submit feedback with star rating
- AI sentiment prediction
- View feedback history with pagination
- Edit profile (name, email, password)
- Dark / Light mode toggle
- Notifications panel

### Admin
- Full dashboard with stats
- Manage Users (Add / Edit / Delete)
- Manage Services (Add / Edit / Delete)
- View & update all feedback status
- Export CSV report
- Sentiment analytics

---

## 🔒 Security

- Passwords hashed with bcrypt
- JWT token authentication
- Protected API routes
- Role-based middleware

---

## 🧰 Tech Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Frontend   | React.js + Tailwind CSS        |
| Charts     | Chart.js + react-chartjs-2    |
| Backend    | Node.js + Express             |
| Database   | MongoDB + Mongoose            |
| Auth       | JWT + bcryptjs                |
| HTTP       | Axios                         |
| Toast      | react-hot-toast               |
