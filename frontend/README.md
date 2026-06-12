#  AssetFlow — Asset Management System

A full-stack web platform for managing shared assets, booking requests, approval workflows, and utilization analytics. Built for the Cultural Council of IIT Roorkee.

 **Live Demo:** [asset-management-frontend2.vercel.app](http://asset-management-frontend2.vercel.app/)

---

##  Team Members

| Name | Role |
|------|------|
| Ch. Rajeev Lochan | Full Stack Developer |
| A. Iswarya | Full Stack Developer |
| M. Sudhishna | Full Stack Developer |

---

##  Features

### Admin
-  Dashboard with real-time asset statistics
-  Approve or reject user booking requests with optional reason
-  Allocate assets directly to users and track returns
-  User management — view and delete users
-  Analytics — bar chart, line chart, pie chart, summary cards
-  Audit logs — full trail of all admin actions
-  Add, edit, and delete assets

### User
-  Browse assets with search and type filter
-  Submit booking requests with quantity, purpose, and dates
-  View personal booking history and status
-  Personal analytics dashboard

---

##  Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js (Vite), React Router, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (JSON Web Tokens) |
| Deployment | Vercel (Frontend) + Render (Backend) |

---

##  Project Structure

```
asset-management-system/
├── backend/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── role.js
│   ├── models/
│   │   ├── asset.js
│   │   ├── booking.js
│   │   ├── allocation.js
│   │   ├── auditLog.js
│   │   └── user.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── assetRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── allocationRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── auditLogRoutes.js
│   ├── .env
│   └── server.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ApprovalsPage.jsx
        │   ├── AllocationsPage.jsx
        │   ├── AnalyticsPage.jsx
        │   ├── AuditLogsPage.jsx
        │   ├── MyBookings.jsx
        │   ├── MyAnalyticsPage.jsx
        │   └── addAssetPage.jsx
        ├── components/
        │   └── ProtectedRoute.jsx
        ├── api.js
        └── App.jsx
```

---

##  Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### 1. Clone the repository

```bash
git clone https://github.com/iswarya-0901/asset-management-system.git
cd asset-management-system
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Update `src/api.js`:

```js
const BASE_URL = "http://localhost:5000";
export default BASE_URL;
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

##  Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [asset-management-frontend2.vercel.app](http://asset-management-frontend2.vercel.app/) |
| Backend | Render | [asset-management-backend-9eoe.onrender.com](https://asset-management-backend-9eoe.onrender.com) |
| Database | MongoDB Atlas | Cloud hosted |

### Deploy Frontend (Vercel)
1. Push code to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Deploy

### Deploy Backend (Render)
1. Import repo in [render.com](https://render.com)
2. Set root directory to `backend`
3. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`
4. Deploy

---

##  API Overview

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Assets
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/assets` | Auth | Get all assets |
| POST | `/api/assets/add` | Admin | Add new asset |
| PUT | `/api/assets/:id` | Admin | Edit asset |
| DELETE | `/api/assets/:id` | Admin | Delete asset |

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/bookings` | Auth | Submit booking request |
| GET | `/api/bookings/my` | Auth | Get my bookings |
| GET | `/api/bookings/pending` | Admin | Get pending requests |
| GET | `/api/bookings/all` | Admin | Get all requests |
| PUT | `/api/bookings/:id/approve` | Admin | Approve booking |
| PUT | `/api/bookings/:id/reject` | Admin | Reject booking |

### Allocations
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/allocations` | Admin | Allocate asset to user |
| GET | `/api/allocations` | Admin | Get active allocations |
| PUT | `/api/allocations/:id/return` | Admin | Mark asset returned |

### Analytics & Logs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/analytics/summary` | Admin | Summary stats |
| GET | `/api/analytics/bookings-per-asset` | Admin | Bar chart data |
| GET | `/api/analytics/bookings-trend` | Admin | Line chart data |
| GET | `/api/audit-logs` | Admin | All audit logs |

---

##  Authentication & Roles

- All protected routes require `Authorization: Bearer <token>` header
- Two roles: `admin` and `user`
- Role-based access enforced at both frontend and backend levels

### Default Admin Setup
Register normally, then update your role in MongoDB Atlas:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

---

