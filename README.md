# Where’s Waldo (Photo-Tagging Game)

![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-20232a?logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwind-css&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)


**Live Site:**  
https://wheres-waldo-cyan.vercel.app/

A full-stack “Where’s Waldo?” game built with **React + Vite + Tailwind** on the frontend and **Node.js + Express + Prisma + PostgreSQL** on the backend. Players can **play as Guest or log in**, click the image to place a **targeting box with a character dropdown**, get instant feedback, and race the **timer** to the leaderboard.

---

## ✨ Highlights

- **Gameplay**

  - Click scene → **target box** + **dropdown** appears at the click
  - **Normalized hit-detection** (0..1 coordinates) works on any screen size
  - **Timer** starts on page load; **You Won** overlay when all are found
  - **Toasts near the click** for success/fail feedback
  - Responsive UI using small Tailwind utilities only (no heavy UI frameworks)

- **Auth & Scores**

  - **Guest session** or **JWT login** (Passport-JWT + bcrypt)
  - **Scores per scene** with **leaderboard tabs** for each scene

- **Data & Assets**

  - Scenes/characters **seeded** with Prisma
  - Image assets are served by the **frontend** (`/public`); the DB stores **relative paths**

- **Deployment**
  - **Frontend:** Vercel (Vite)
  - **Backend:** Render (Express API + Prisma)
  - **Database:** Render PostgreSQL

---

## 🧰 Tech Stack

**Frontend**

- React 18 (Vite)
- Tailwind CSS
- react-hot-toast

**Backend**

- Node.js + Express
- Passport (JWT)
- Prisma ORM
- PostgreSQL

**Infra**

- Vercel (frontend), Render (backend)
- Prisma migrations & seed

---

## 🧠 Hit-Detection (how it works)

All answer coordinates are stored **normalized** in the DB (`0..1` for both x and y).

On click:
xPct = (clientX - rect.left) / rect.width
yPct = (clientY - rect.top) / rect.height
The API compares `(xPct, yPct)` to the stored answer with a small threshold → accurate on any device.

---

## 🗃️ Data Model (Prisma)

- `User` — name, email, password (hashed), `roles` (`USER | ADMIN`)
- `GuestSession` — anonymous players (`roles = GUEST`)
- `Scene` — image `url` (relative), optional `name`
- `Character` — `name`, `iconUrl` (relative)
- `SceneCharacter` — **answer** per (scene, character) with normalized `x, y`
- `Score` — completion time in `ms`, linked to either a user or a guest

> Scenes can include different subsets of characters (Waldo, Wenda, Wizard, Oswald, …).

---

## 🔌 API Overview

**Auth**

- `POST /api/auth/register` → `{ name, email, password }`
- `POST /api/auth/login` → `{ email, password }`
- `POST /api/auth/guest` → create guest + return JWT
- `GET  /api/auth/me` → current principal (JWT)

**Game**

- `GET  /api/scenes` → list scenes (+ characters for display)
- `POST /api/game/check` → `{ sceneId, characterId, click: { x, y } }` → `{ correct: boolean }`  
  (expects `x,y` normalized 0..1)

**Scores**

- `GET  /api/scores/:sceneId` → top scores for a scene
- `POST /api/scores` (JWT) → `{ sceneId, ms }` (associates with user or guest)

---

## 🏗️ Project Structure

/
├─ client/ # React (Vite) app
│ ├─ public/ # Scene & Icon images
│ └─ src/
│ ├─ components/ # TargetBox, Dropdown, Timer, Leaderboard, etc.
│ └─ pages/ # Home, Menu, Game
└─ server/ # Express API
├─ routes/ # auth, scenes, game, scores
├─ prisma/
│ ├─ schema.prisma
│ ├─ migrations/
│ └─ seed.js
└─ index.js # server entry

---

## 🚀 Local Development

> **Prereqs:** Node 18+, PostgreSQL 14+, Prisma CLI

### 1) Backend

```bash
cd server
cp .env.example .env
# .env should contain (example):
# DATABASE_URL="postgresql://user:password@localhost:5432/waldo_db?schema=waldo"
# JWT_SECRET="super-secret"
# CLIENT_ORIGIN="http://localhost:5173"

npm install
npx prisma generate
# first time (empty DB):
npx prisma db push
# or if you already have migrations:
# npx prisma migrate dev
npx prisma db seed
npm run dev   # nodemon
☁️ Deployment (summary)

Frontend (Vercel)

Root: client

Build: npm run build

Output: dist

ENV: VITE_API_URL=https://<your-render-api>.onrender.com

Backend (Render)

Root: server

Build: npm ci && npx prisma generate

Start: node index.js

Health Check: /api/health

ENV:

DATABASE_URL=postgresql://.../dbname?schema=waldo

JWT_SECRET=...

CLIENT_ORIGIN=https://<your-vercel-app>.vercel.app

(Optional) Post-deploy:
npx prisma migrate deploy && npx prisma db seed
```
## 🧪 What I Focused On (skills)

Clean React state & overlay control (click/escape/focus, mobile taps)

Coordinate math for responsive hit-detection

REST API design for gameplay & scoring

Prisma modeling, migrations, and robust seed

Auth (guest + JWT) and secure password hashing (bcrypt)

Cloud deployment on Vercel/Render with environment variables

## 🧭 Future Ideas

Admin tool to upload scenes & annotate answers

Global + per-character leaderboards

Social share of results

Enhanced accessibility (keyboard targeting / ARIA live regions)

Integration tests (Vitest/Playwright)
