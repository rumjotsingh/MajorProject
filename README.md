# MajorProject Monorepo

MajorProject is a full-stack micro-credential platform built as a monorepo with:
- `backend/`: Node.js + Express + MongoDB APIs
- `frontend/`: Next.js (App Router) + React + Redux Toolkit UI

This repository contains admin, institute, learner, and employer workflows for managing users, pathways, credentials, notifications, and authentication.

## Project Structure

```text
MajorProject/
  backend/    # Express API, MongoDB models, routes, controllers, scripts
  frontend/   # Next.js app, pages, components, state management
```

## Tech Stack

- Backend: Node.js, Express, Mongoose, JWT, Socket.IO, Nodemailer, Cloudinary
- Frontend: Next.js, React, TypeScript, Redux Toolkit, Tailwind CSS
- Database: MongoDB

## Prerequisites

- Node.js 18+
- npm
- MongoDB instance (local or cloud)

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # if .env.example exists
npm run dev
```

Backend default entrypoint is `backend/server.js`.

Common backend scripts:
- `npm run dev`
- `npm run start`
- `npm run create:admin`

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local   # if .env.example exists
npm run dev
```

Frontend runs on Next.js development server.

Common frontend scripts:
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Running Full Project (Two Terminals)

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

## Git Tracking Notes

This repository is configured as a single monorepo. The nested Git metadata in `frontend/` has been removed, so both `backend/` and `frontend/` are tracked by the root Git repository.

If VS Code shows files in blue, that usually means new or changed files not yet committed. Check with:

```bash
git status
```

Then stage and commit:

```bash
git add .
git commit -m "your message"
git push
```

## License

No license specified yet.
