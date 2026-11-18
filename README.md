# 🌟 Store Rating Management System
> **Full Stack Intern Coding Challenge Submission**  
> A complete, fully functional, responsive Store Rating Management Web Application with Role-Based Access Control (Admin, Store Owner, Normal User), MySQL database, and JWT authentication.

---

## 📌 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [User Roles & Key Features](#-user-roles--key-features)
4. [Form Validation Requirements](#-form-validation-requirements)
5. [Database Architecture & Schema](#-database-architecture--schema)
6. [Pre-configured Test Credentials](#-pre-configured-test-credentials)
7. [Local Installation & Setup Guide](#-local-installation--setup-guide)
8. [Comprehensive REST API Documentation](#-comprehensive-rest-api-documentation)
9. [Project Folder Structure](#-project-folder-structure)
10. [Instructions to Push to GitHub](#-instructions-to-push-to-github)

---

## 🚀 Project Overview

The **Store Rating Management System** is an end-to-end web platform designed for multi-tenant retail store evaluation. It provides:
- A unified authentication portal for three distinct user roles (**System Administrator**, **Store Owner**, and **Normal User**).
- Automatic role-based routing and protected client-side routes.
- An interactive **5-star rating system** allowing users to review stores and modify their feedback.
- Live administrative controls, user role provisioning, store onboarding, and review audit trails.
- Dedicated owner portal isolating store-specific metrics, review counts, and customer feedback logs.

---

## 🛠 Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18+ with Vite | Fast modular build, modern component structure |
| **Styling** | Tailwind CSS | Responsive utility-first design, custom modern scrollbars & animations |
| **Icons** | Lucide React | Crisp, accessible SVG icons |
| **HTTP Client** | Axios | Configured with automatic Bearer token interceptor and 401 handling |
| **Backend** | Node.js with Express.js | Modular REST architecture (Controllers, Middleware, Routes) |
| **Database** | MySQL 8.0 | Normalized relational schema, constraints, cascading FKs |
| **Database Client**| `mysql2/promise` | Connection pooling with async/await query execution |
| **Authentication** | JWT (`jsonwebtoken`) | Stateless Bearer token verification and role authorization |
| **Password Hashing**| `bcryptjs` | Salted 10-round bcrypt password hashing |

---

## 👥 User Roles & Key Features

### 1. System Administrator (`admin`)
- **Dashboard Metrics**: Real-time counter of total registered users, total registered stores, and total submitted reviews.
- **Store Management**:
  - Add new stores (Name, Email, Address, and assign an existing Store Owner).
  - View all registered stores with email, address, and overall average star rating.
  - Search stores by name or address.
  - Multi-column ascending/descending sorting (Name, Email, Address, Average Rating).
- **User Management**:
  - Provision new accounts for **Normal Users**, **Store Owners**, or **Administrators**.
  - View full user roster (Name, Email, Address, Role).
  - Search users by name, email, or address.
  - Filter users by role (`admin`, `store_owner`, `user`).
  - View detailed user profile modal.
- **Ratings & Reviews Audit**:
  - Audit all ratings across stores with store name, customer name, star rating, and timestamp.
  - Filter reviews by store and sort chronologically.

### 2. Normal User / Shopper (`user`)
- **Self Registration**: Clean registration form strictly validating name, email, password strength, and address.
- **Store Catalog**:
  - Browse all active stores with address and calculated average ratings.
  - Search stores dynamically by name and address.
  - Sort stores by name, average rating, or personal rating.
- **Rating Submission & Updates**:
  - View user's previously submitted rating (e.g., `(4/5)` or "Not rated yet").
  - Submit ratings between **1 and 5 stars** using the interactive Star Rating component.
  - Modify/update an existing rating anytime (enforces **one rating per store** constraint).
- **Personal Ratings History**: View a dedicated list of all stores previously rated with direct edit triggers.
- **Account Security**: Change account password and secure logout.

### 3. Store Owner (`store_owner`)
- **Store Performance**:
  - Live average store rating (with visual star breakdown and numerical score).
  - Total number of customer reviews received.
  - Customer sentiment status and star rating distribution bar chart (1 to 5 stars).
- **Customer Feedback Log**:
  - Detailed list of shoppers who rated the store (Shopper name, email, star score, submission date).
- **Data Isolation**: Strict server-level query filtering ensures owners only access information pertaining to their assigned store.
- **Account Security**: Change password and secure logout.

---

## 📋 Form Validation Requirements

Both frontend forms and backend API middleware strictly enforce the following validation constraints:

| Field | Rule | Error Feedback |
|---|---|---|
| **Name** | Minimum 20 characters, Maximum 60 characters | "Name must be between 20 and 60 characters." |
| **Address** | Maximum 400 characters, required | "Address is required and must not exceed 400 characters." |
| **Password** | 8–16 characters, ≥1 uppercase letter, ≥1 special character | "Password must be 8–16 characters long, contain at least one uppercase letter and one special character." |
| **Email** | Valid RFC 5322 compatible email format | "Please enter a valid email address." |
| **Rating** | Integer value strictly from 1 to 5 | "Rating must be an integer between 1 and 5." |

---

## 🗄 Database Architecture & Schema

- **Database Name**: `store_rating_db`
- **Schema File**: [database.sql](./database.sql)

### Entity-Relationship Diagram (ERD)

```text
  +------------------+         +------------------+
  |      users       |         |      stores      |
  +------------------+         +------------------+
  | id (PK)          |<---+    | id (PK)          |<---+
  | name VARCHAR(60) |    |    | name VARCHAR(60) |    |
  | email (UNIQUE)   |    +----| owner_id (FK)    |    |
  | password (HASH)  |         | email (UNIQUE)   |    |
  | address (400)    |         | address (400)    |    |
  | role (ENUM)      |         | created_at       |    |
  | created_at       |         +------------------+    |
  +------------------+                   |             |
           |                             |             |
           |         +-------------------+             |
           |         |                                 |
           v         v                                 |
  +-------------------------------------+             |
  |               ratings               |             |
  +-------------------------------------+             |
  | id (PK)                             |             |
  | user_id (FK -> users.id)            |             |
  | store_id (FK -> stores.id) ---------+-------------+
  | rating TINYINT (1-5)                |
  | created_at, updated_at              |
  | CONSTRAINT: UNIQUE(user_id, store_id)|
  +-------------------------------------+
```

---

## 🔑 Pre-configured Test Credentials

The database seed script initializes the following accounts out of the box (with 1-click test fill available on the login page):

| Role | Name | Email | Password |
|---|---|---|---|
| **System Administrator** | `System Administrator Master` | `admin@storerating.com` | `AdminPass123!` |
| **Store Owner (ShopVista)** | `Store Owner Alice Cooper` | `alice.owner@shopvista.com` | `OwnerPass123!` |
| **Store Owner (ElectroHub)**| `Store Owner Bob Henderson` | `bob.owner@electrohub.com` | `OwnerPass123!` |
| **Normal User 1** | `Johnathan Doe Regular User` | `johnathan.doe@example.com` | `UserPass123!` |
| **Normal User 2** | `Jane Smith Certified Shopper` | `jane.smith@example.com` | `UserPass123!` |
| **Normal User 3** | `Michael Robert Johnson Doe` | `michael.r@example.com` | `UserPass123!` |

*(All passwords meet the 8–16 character, uppercase, and special character criteria).*

---

## 💻 Local Installation & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MySQL Server**: 8.0 or higher (running on port 3306)

---

### 2. Database Setup
1. Open your MySQL terminal or GUI client (e.g., MySQL Workbench):
   ```bash
   mysql -u root -p
   ```
2. Execute the included SQL file:
   ```sql
   source /path/to/store-rating-app/database.sql;
   ```
   *Or from terminal:*
   ```bash
   mysql -u root -p < database.sql
   ```
   This creates `store_rating_db`, defines all tables with constraints, and inserts initial seed data.

---

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Verify your database connection settings in `.env`:
   ```ini
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=store_rating_db
   JWT_SECRET=super_secret_jwt_store_rating_key_2026_change_me
   JWT_EXPIRES_IN=7d
   ```
5. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *Backend will run at:* `http://localhost:5000`

---

### 4. Frontend Setup
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📡 Comprehensive REST API Documentation

### 1. Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new normal user account.
- **Request Body**:
  ```json
  {
    "name": "Christopher Nolan Director User",
    "email": "chris.nolan@example.com",
    "password": "SecurePassword123!",
    "address": "456 Hollywood Boulevard, Los Angeles, CA 90028"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration successful! Welcome aboard.",
    "token": "eyJhbGciOi...",
    "user": {
      "id": 7,
      "name": "Christopher Nolan Director User",
      "email": "chris.nolan@example.com",
      "address": "456 Hollywood Boulevard, Los Angeles, CA 90028",
      "role": "user"
    }
  }
  ```

#### `POST /api/auth/login`
- **Access**: Public
- **Description**: Authenticates user and returns JWT.
- **Request Body**:
  ```json
  {
    "email": "admin@storerating.com",
    "password": "AdminPass123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "name": "System Administrator Master",
      "email": "admin@storerating.com",
      "role": "admin"
    }
  }
  ```

#### `GET /api/auth/me`
- **Access**: Private (Bearer Token)
- **Description**: Returns current authenticated user profile.

#### `POST /api/auth/change-password`
- **Access**: Private (Bearer Token)
- **Description**: Updates user password after verifying current password.
- **Request Body**:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword456!"
  }
  ```

---

### 2. Admin Endpoints (`/api/admin`)
*(All require `Authorization: Bearer <token>` with `role: admin`)*

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Dashboard statistics (total users, stores, ratings) | - |
| `GET` | `/api/admin/users` | List all users | `search`, `role`, `sortBy`, `sortOrder` |
| `GET` | `/api/admin/users/:id` | Get single user details by ID | - |
| `POST` | `/api/admin/users` | Create user with specific role | - |
| `GET` | `/api/admin/stores` | List all stores with calculated ratings & owner info | `search`, `sortBy`, `sortOrder` |
| `POST` | `/api/admin/stores` | Register a new retail store | - |
| `GET` | `/api/admin/ratings` | Audit log of all ratings across all stores | `storeId`, `userId`, `sortOrder` |

---

### 3. Normal User Endpoints (`/api/user`)
*(All require `Authorization: Bearer <token>` with `role: user`)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user/stores` | List all stores with average rating & current user's rating |
| `POST` | `/api/user/ratings` | Submit new rating or update existing store rating |
| `GET` | `/api/user/my-ratings` | Fetch history of ratings submitted by the logged-in user |

**Rating Payload (`POST /api/user/ratings`):**
```json
{
  "storeId": 1,
  "rating": 5
}
```

---

### 4. Store Owner Endpoints (`/api/store-owner`)
*(Requires `Authorization: Bearer <token>` with `role: store_owner`)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/store-owner/dashboard` | Get store details, average rating, distribution, and shopper review list |

---

## 📂 Project Folder Structure

```
store-rating-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL pool connection setup
│   ├── controllers/
│   │   ├── adminController.js      # Admin business logic & stats
│   │   ├── authController.js       # Register, login, change password
│   │   ├── storeOwnerController.js # Owner isolated metrics & reviews
│   │   └── userController.js       # Store browsing & rating submissions
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification & role authorization
│   │   └── validator.js            # Input validation middleware
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── storeOwnerRoutes.js
│   │   └── userRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js                   # Express application entrypoint
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios client with interceptors
│   │   ├── components/
│   │   │   ├── ChangePasswordModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StarRating.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global authentication state
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── StoreOwnerDashboard.jsx
│   │   │   └── UserDashboard.jsx
│   │   ├── utils/
│   │   │   └── validators.js       # Client-side input validation
│   │   ├── App.jsx                 # Client-side routing
│   │   ├── index.css               # Tailwind CSS entry
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── database.sql                    # MySQL schema, constraints & seed data
├── package.json                    # Root script convenience manifest
├── README.md                       # Complete documentation
└── .gitignore                      # Git ignore patterns
```

---

## 📤 Instructions to Push to GitHub

To submit or publish this repository to your personal GitHub account:

1. **Initialize Git Repository** (if not already initialized):
   ```bash
   cd store-rating-app
   git init
   ```

2. **Verify That Sensitive Files Are Ignored**:
   ```bash
   git status
   ```
   *(Ensure `.env` and `node_modules` are NOT staged).*

3. **Stage and Commit All Project Files**:
   ```bash
   git add .
   git commit -m "feat: complete Store Rating Management System full stack application"
   ```

4. **Create a New Repository on GitHub**:
   - Go to [github.com/new](https://github.com/new).
   - Enter a repository name (e.g. `store-rating-management-system`).
   - Choose **Public** or **Private**.
   - Do **NOT** initialize with README, .gitignore, or license (we already created them).

5. **Link Remote and Push**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

---

## 🏆 Summary Checklist

- [x] Separate frontend (`React + Vite`) and backend (`Node + Express`) folders.
- [x] MySQL database named `store_rating_db` with `database.sql` schema and seeds.
- [x] Common login system routing to 3 distinct dashboards based on role.
- [x] System Administrator Dashboard with user/store management, sorting, filtering, and stats.
- [x] Normal User Dashboard with store browsing, search, and 1-rating-per-store update capability.
- [x] Store Owner Dashboard displaying store metrics and customer rating breakdown.
- [x] Strict form validation (Name 20-60 chars, Address ≤400 chars, Password 8-16 chars with uppercase & special char, Email, Rating 1-5).
- [x] JWT authentication and secure bcrypt password hashing.
- [x] Fully functional, tested, and ready for deployment.
