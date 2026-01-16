# Scheduling Platform

A full-stack meeting scheduling application similar to Calendly, built with React, Node.js, Express, and PostgreSQL.

## Tech Stack

*   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide React, Date-fns.
*   **Backend**: Node.js, Express, TypeScript, Prisma ORM.
*   **Database**: PostgreSQL.

## Prerequisites

*   Node.js (v18 or higher)
*   npm (v9 or higher)
*   PostgreSQL running locally or via a cloud provider.

## Local Setup

1.  **Clone the repository**
    ```bash
    git clone <repository_url>
    cd scaler_assigment
    ```

2.  **Install dependencies**
    ```bash
    # Install root dependencies (for concurrency script)
    npm install

    # Install backend dependencies
    cd backend
    npm install

    # Install frontend dependencies
    cd ../frontend
    npm install
    
    # Return to root
    cd ..
    ```

3.  **Environment Variables**

    *   **Backend**: Copy `.env.example` to `.env` in the `backend` directory.
        ```bash
        cd backend
        cp .env.example .env
        ```
        Update `DATABASE_URL` with your PostgreSQL connection string.
        Example: `DATABASE_URL="postgresql://user:password@localhost:5432/scheduling_db?schema=public"`

    *   **Frontend**: Copy `.env.example` to `.env` in the `frontend` directory.
        ```bash
        cd frontend
        cp .env.example .env
        ```
        Update `VITE_API_URL` if your backend runs on a port other than 3000.
        Default: `VITE_API_URL="http://localhost:3000/api"`

4.  **Database Setup**
    Initialize the database and seed it with default data (User & Event Types).
    ```bash
    cd backend
    npx prisma migrate dev --name init
    npm run prisma:seed
    ```

5.  **Run the Application**
    From the **root** directory, run:
    ```bash
    npm run dev
    ```
    This command uses `concurrently` to start both the backend (port 3000) and frontend (port 5173).

    *   Frontend: [http://localhost:5173](http://localhost:5173)
    *   Backend API: [http://localhost:3000](http://localhost:3000)

## Project Structure

```
scaler_assigment/
├── backend/                # Node.js/Express backend
│   ├── prisma/            # Database schema & seeds
│   ├── src/               # Source code
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   └── lib/           # Utilities (Prisma client)
├── frontend/               # React frontend
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities (API, class names)
└── package.json            # Root configuration for concurrent execution
```

## Deployment Guide (Vercel)

### Prerequisites
- GitHub repository with this code
- Vercel account (free tier works)
- Cloud PostgreSQL database (Supabase, Neon, or Railway - all have free tiers)

### Step 1: Set Up Cloud Database
1. Create an account on [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string (it looks like: `postgresql://user:pass@host:5432/dbname`)

### Step 2: Deploy Backend
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Set **Root Directory** to `backend`
4. Add environment variable:
   - `DATABASE_URL` = your cloud PostgreSQL connection string
5. Click Deploy
6. After deployment, run migrations:
   ```bash
   npx vercel env pull .env.local
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Step 3: Deploy Frontend
1. Import the same repository again in Vercel
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.vercel.app/api`
4. Click Deploy

### Alternative: Single Repository Deployment
You can also deploy both from the root using a monorepo setup. Contact Vercel support for advanced configurations.

## Notes

- The seed script creates a default user "Nawazish Hassan" which appears on the booking page.
- The default time availability is Mon-Fri, 9 AM - 5 PM.
- Time collision detection works across all event types for the same host.
