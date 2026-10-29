# Store Rating Platform

A full-stack web application where users can browse stores and submit ratings. Administrators can manage users and stores, while store owners can view ratings for their stores.

## Tech Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JWT and bcryptjs

## Features

### Admin
- View dashboard statistics.
- Add and manage stores.
- Create and view user accounts.
- Search, filter, and sort users.
- View user details and store ratings.

### Normal User
- Register and log in.
- Browse and search stores.
- View overall store ratings.
- Submit or update a rating from 1 to 5.
- Change password.

### Store Owner
- View their store's average rating and total ratings.
- See users who rated their store.
- Change password.

## Project Structure

```text
Coding Challenge/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   └── server.js
├── frontend/
│   └── src/
│       ├── admin/
│       ├── pages/
│       ├── users/
│       └── store-owner/
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js and npm
- MySQL Server 8

### 1. Configure the Database

Create the MySQL database named `storerate` and set up the required tables: `users`, `stores`, and `ratings`.

Configure your local `backend/.env` file with your database connection details and JWT secret.

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on port `5000`.

### 3. Start the Frontend

Open another terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `alexander.test@example.com` | `SecurePass@123` |
| Normal User | `jordan.test@example.com` | `JordanNew@456` |
| Store Owner | `chris.morgan@example.com` | `StrongPass@123` |

## Database

The application uses three main tables:

- `users` — account details and roles.
- `stores` — store details and owner association.
- `ratings` — user ratings linked to stores.

Each user can submit one rating per store and update it later. Store averages are calculated from submitted ratings.

## API

The backend exposes REST endpoints for authentication, user management, store management, ratings, password changes, and store-owner dashboard data. Protected endpoints use JWT authentication and role-based authorization.
