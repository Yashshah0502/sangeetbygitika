# SanGeet by Gitika

**Luxury e-commerce platform for handcrafted bags**, built with a modern full-stack architecture powered by **Next.js 16**, **React 19**, **TypeScript**, **Supabase**, and **Node.js**.
It includes a **customer storefront** and a **secure, role-aware admin workspace** for complete catalog and content management.

**Live Demo:** [https://sangeetbygitika-ow3q.vercel.app](https://sangeetbygitika-ow3q.vercel.app)

---

## Table of Contents

* [Overview](#overview)
* [Feature Highlights](#feature-highlights)
* [Tech Stack](#tech-stack)
* [System Architecture](#system-architecture)
* [Directory Map](#directory-map)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Environment Variables](#environment-variables)
  * [Supabase Setup](#supabase-setup)
  * [Seed an Admin User](#seed-an-admin-user)
  * [Run Locally](#run-locally)
* [Available Scripts](#available-scripts)
* [Deployment Checklist](#deployment-checklist)
* [Additional Resources](#additional-resources)
* [Legacy Portfolio Pages](#legacy-portfolio-pages)
* [License](#license)

---

## Overview

**SanGeet by Gitika** reimagines a luxury e-commerce experience for premium handbags and accessories while offering a robust internal admin control system.

* **Storefront:** Immersive, SEO-optimized shopping experience with real-time product data and conversational commerce via WhatsApp and Instagram.
* **Admin Workspace:** Secure, JWT-based dashboard with analytics, catalog CRUD, and content management built on Supabase and Node.js APIs.

All data (products, categories, hero slides, admins) resides in **Supabase (PostgreSQL)**.
Carts and wishlists persist in the browser using React Context + localStorage for a smooth user experience.

---

## Feature Highlights

### Storefront

* Dynamic hero carousel with Supabase-driven slides and deep links to curated categories.
* Responsive product grid with category filters, search, infinite scroll, and hover image transitions.
* Product detail pages with Embla carousel, promotional badges, and instant WhatsApp/Instagram contact options.
* Floating contact launcher integrating multiple platforms (email, Instagram, WhatsApp).
* Optimized SEO setup: structured data, Open Graph, manifest, and metadata.
* Cart and wishlist powered by React Context with quantity control and persistent state.

### Admin Workspace

* Secure **JWT + bcrypt** authentication with **role-based access control** and HTTP-only cookies.
* Dashboard showing live metrics, stock alerts, and quick links to catalog actions.
* CRUD management for products, categories, and hero banners with client-side **image compression** before Supabase Storage upload.
* Superadmin panel to manage admin users, activate/deactivate roles, and audit activity.
* Analytics dashboard using **Recharts** with exportable CSV snapshots.
* Optimized Node.js API routes leveraging **Supabase service-role key** for secure server-side operations.

### Developer & Infrastructure Features

* Modular Next.js 16 App Router with **React Server Components** and client hydration.
* Fully typed **TypeScript** architecture for safety and maintainability.
* Modern UI using **Tailwind CSS v4**, **Framer Motion**, and **Lucide Icons**.
* Structured database schema with SQL migrations and Row Level Security (RLS).
* Ready-to-deploy configuration for **Vercel**, including environment setup and Supabase CORS integration.
* Clear documentation for onboarding, deployment, and admin workflows.

---

## Tech Stack

### Frontend

* **Next.js 16** (App Router)
* **React 19**
* **TypeScript**
* **Tailwind CSS v4**
* **Framer Motion**
* **Embla Carousel**
* **Lucide React Icons**
* **React Hot Toast**
* **browser-image-compression**

### Backend & Database

* **Node.js 18+**
* **Supabase (PostgreSQL + Auth + Storage)**
* **JWT Authentication**
* **bcrypt Password Hashing**
* **Supabase RLS Policies**
* **SQL Migrations**

### Data Visualization

* **Recharts** (analytics dashboard)
* **CSV Export**

### DevOps & Deployment

* **Vercel Cloud** (Next.js hosting)
* **Supabase Cloud** (backend)
* **ESLint + Prettier**
* **Environment-based Secrets (.env.local)**
* **GitHub Version Control**

---

## System Architecture

```
Client (Next.js / React)
        │
        ▼
Next.js App Router
(SSR + API Routes)
        │
        ▼
Supabase SDK (Client + Server Contexts)
        │
        ▼
PostgreSQL + Supabase Storage
(Products, Categories, Admins, Hero Slides)
```

The **frontend** runs on Next.js (React Server Components) while **server actions** and **API routes** handle authentication and admin logic using Node.js with Supabase’s REST and SQL interface.

---

## Directory Map

```text
.
├── assets/                       # Legacy media and screenshots
├── index.html                    # Old portfolio landing page
├── mediaqueries.css, style.css   # Legacy CSS
├── script.js                     # Legacy interactivity
├── sales-data-analysis.html      # Data case study
├── stock-market-prediction.html  # ML case study
└── sangeet-by-gitika/            # Next.js storefront + admin
    ├── src/app/                  # App Router & UI
    ├── src/contexts/             # Cart & Wishlist providers
    ├── src/lib/                  # Supabase clients & auth helpers
    ├── supabase/migrations/      # SQL migrations & RLS
    ├── public/                   # Manifest, icons, robots.txt
    └── *.md                      # Developer docs
```

---

## Getting Started

### Prerequisites

* Node.js ≥ 18.18
* npm ≥ 9 (or pnpm/yarn/bun)
* Supabase project with **Database + Storage** enabled

### Installation

```bash
git clone <repo-url>
cd sangeetbygitika/sangeet-by-gitika
npm install
```

### Environment Variables

Create `.env.local` in the project root:

| Variable                        | Required | Description                                   |
| ------------------------------- | -------- | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅        | Supabase project URL                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅        | Public anonymous key                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅        | Service role key for admin APIs (server-only) |
| `JWT_SECRET`                    | ✅        | Secret used for signing admin cookies         |

> Keep the service role key private; never expose it client-side.

---

### Supabase Setup

1. Run SQL migrations from `supabase/migrations` in order.
2. Create buckets:

   * `product-images`
   * `hero-images`
3. Apply CORS settings from `cors.json` to allow your dev & production origins.
4. Verify service role key has full table access.

---

### Seed an Admin User

```bash
node generate-admin-hash.mjs "YourSecurePassword123!"
```

Insert the generated hash, email, name, and role (`admin` or `superadmin`) into the Supabase `admins` table.
Set `is_active = true`.
Access the admin portal at `/admin/login`.

---

### Run Locally

```bash
npm run dev
```

* Storefront: [http://localhost:3000](http://localhost:3000)
* Admin Portal: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## Available Scripts

| Command         | Description               |
| --------------- | ------------------------- |
| `npm run dev`   | Start development server  |
| `npm run build` | Build production bundle   |
| `npm start`     | Run production server     |
| `npm run lint`  | Lint project using ESLint |

---

## Deployment Checklist

* Configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`).
* Apply SQL migrations to your production Supabase instance.
* Ensure `product-images` and `hero-images` buckets exist and are public.
* Verify CORS configuration.
* Update `metadataBase` in `layout.tsx` to match live domain.
* Rotate all credentials and secrets before launch.

---

## Additional Resources

* `ADMIN_AUTH_SETUP.md` – Admin authentication setup
* `DEPLOYMENT_GUIDE.md` – Deployment instructions
* `ENHANCEMENT_GUIDE.md` – Planned UI/UX improvements
* `HERO_CAROUSEL_GUIDE.md` – Carousel management guide
* `CLEANUP_SUMMARY.md` – Refactoring and cleanup notes

---

## Legacy Portfolio Pages

Legacy static portfolio content includes:

* `index.html` – Portfolio landing page
* `sales-data-analysis.html` – Analytics case study
* `stock-market-prediction.html` – ML project

All assets are stored in `/assets` with styling via `style.css` and `mediaqueries.css`.

---

## License

This project is proprietary to **SanGeet by Gitika**.
Contact the project owner for licensing or reuse permissions.

---
