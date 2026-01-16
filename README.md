# Scheduling Platform (Calendly Clone)

A full-stack meeting scheduling & booking platform that replicates Calendly-like user experience.
Users can create event types, define availability, and allow invitees to book public time slots.

> Built for: **Scaler SDE Intern Fullstack Assignment (Calendly Clone)** :contentReference[oaicite:1]{index=1}

---

## Live Demo

- Frontend (Vercel): 
- Backend (render);

---

## Features

### ✅ Core Features (Must Have)

#### 1) Event Types Management
- Create event types: name, duration, slug
- Edit/delete event types
- List all event types
- Each event type has a unique public booking link

#### 2) Availability Settings
- Set available days (Mon-Sun)
- Define time range per day (e.g. 9:00 AM - 5:00 PM)
- Set timezone for schedule

#### 3) Public Booking Page (`/book/:slug`)
- Month calendar view to pick date
- Displays available slots for selected date
- Booking form: invitee name + email
- Prevents double booking
- Confirmation screen with meeting details

#### 4) Meetings Page
- Upcoming meetings view
- Past meetings view
- Cancel meeting flow

---

## Tech Stack

### Frontend
- React (Vite) + TypeScript
- TailwindCSS
- React Router
- Date handling: date-fns
- Calendar: react-day-picker

### Backend
- Node.js + Express + TypeScript
- Prisma ORM

### Database
- PostgreSQL (local or cloud: Neon / Supabase / Railway)

---

## Project Structure

```

scaler_assigment/
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── lib/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
└── package.json

````

---

## Local Setup

### 1) Clone repository
```bash
git clone <repo-url>
cd scaler_assigment
````

### 2) Install dependencies

```bash
npm install

cd backend
npm install

cd ../frontend
npm install

cd ..
```

---

## Environment Variables

### Backend

Create `.env` inside `backend/`:

```bash
cd backend
cp .env.example .env
```

Set DB URL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/calendly_clone?schema=public"
PORT=3000
```

### Frontend

Create `.env` inside `frontend/`:

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL="http://localhost:3000/api"
```

---

## Database Setup (Prisma)

From backend directory:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

To view DB tables:

```bash
npx prisma studio
```

---

## Run Application

From root directory:

```bash
npm run dev
```

Frontend:

* [http://localhost:5173](http://localhost:5173)

Backend:

* [http://localhost:3000/api](http://localhost:3000/api)

---

## Deployment Guide (Recommended)

### ✅ Database (Neon / Supabase)

1. Create a free Postgres DB
2. Copy connection string
3. Use it as `DATABASE_URL` for backend

---

### ✅ Backend Deployment (Render / Railway recommended)

Recommended platform: **Render**

Build command:

```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

Start command:

```bash
npm start
```

Environment variables:

* DATABASE_URL = cloud DB url

---

### ✅ Frontend Deployment (Vercel)

Steps:

1. Import repo in Vercel
2. Set Root Directory = `frontend`
3. Add Env Variable:

```env
VITE_API_URL=https://<your-backend-domain>/api
```

Deploy ✅

---

## CORS Note (Backend)

Ensure backend allows frontend origin:

* Local: [http://localhost:5173](http://localhost:5173)
* Production: [https://your-frontend.vercel.app](https://your-frontend.vercel.app)

---

## Assumptions

* No login required (default admin user assumed logged in).
* Public booking page accessible to anyone with link.
* Database is seeded with sample event types + meetings.

---

## AI Tools Usage

AI tools (Antigravity / ChatGPT / Gemini) were used to speed up development.
All code was reviewed and understood before final submission as required. 

---

## Submission Links

* GitHub Repo: `<repo-link>`
* Deployed Frontend: `<frontend-link>`
* Backend API: `<backend-link>`

```

---

If you want, I can also:
✅ generate `vercel.json` for routing fixes (`/book/:slug` refresh 404)  
✅ write a “Deployment Troubleshooting” section (Prisma + CORS + env errors)
::contentReference[oaicite:3]{index=3}
```
