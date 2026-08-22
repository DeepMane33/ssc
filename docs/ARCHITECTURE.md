# SSC Registration System — Architecture

## Overview

Two web applications backed by a single Supabase database.

- **Registration Form** — public-facing, for participants to sign up
- **Admin Dashboard** — private, for the team to view and manage submissions

Both are static sites hosted on Vercel. No backend server — Supabase handles the API layer automatically.

## Architecture Diagram

```
┌─────────────────────┐         ┌─────────────────────┐
│  REGISTRATION FORM  │  POST   │     SUPABASE        │
│                     │────────▶│                     │
│  index.html         │  anon   │  Table:             │
│  styles.css         │  key    │  registrations      │
│  form.js            │         │                     │
│                     │         │  - REST API (auto)  │
│  Vercel             │         │  - RLS policies     │
└─────────────────────┘         └──────────┬──────────┘
                                            │
                                            │ GET
                                            ▼
                              ┌─────────────────────┐
                              │  ADMIN DASHBOARD    │
                              │                     │
                              │  index.html         │
                              │  styles.css         │
                              │  dashboard.js       │
                              │                     │
                              │  Vercel             │
                              └─────────────────────┘
```

## Why No Backend Server

Supabase auto-generates a REST API from the database schema. The frontend calls it directly using the Supabase JS client with an anonymous key. This key only has permission to INSERT into the registrations table — it cannot read, update, or delete existing rows.

This means:
- No Express server to maintain
- No deployment pipeline for backend code
- No server costs
- API scales automatically with Supabase infrastructure

## Why No Load Balancer

Supabase is a managed cloud service running on AWS/GCP. It already handles:

- **Connection pooling** — PgBouncer manages concurrent database connections out of the box
- **Auto-scaling** — resources scale based on traffic
- **Managed infrastructure** — no servers to provision or maintain

For a university-level registration form expecting a few hundred submissions, Supabase's infrastructure handles this without any additional tooling. A load balancer is only relevant when self-hosting across multiple servers or serving very high concurrency, neither of which applies here.

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Animations | GSAP, ScrollTrigger, Lenis |
| Database + API | Supabase (PostgreSQL) |
| Hosting | Vercel |

## Deployment

| Site | Purpose |
|------|---------|
| Form site | Public registration URL |
| Dashboard site | Admin-only submission viewer |

Both deployed as separate Vercel projects. The form site is public. The dashboard site will have admin authentication added later.
