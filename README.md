# Job Application Tracker

A production-ready full-stack job tracking system built with Next.js, Prisma and PostgreSQL.

Includes a protected production deployment and a public read-only demo environment.

## Live Demo

- Demo (Read-only): https://job-application-tracker-demo-amayorga.vercel.app
- Production (Private): Access protected

## Tech Stack

- Next.js (App Router)
- React
- Prisma ORM
- PostgreSQL (Neon)
- TanStack Query
- Shadcn/UI
- TailwindCSS
- Vercel (Deployment)

## Key Features

- Server-side offset pagination
- Column sorting with URL state synchronization
- Case-insensitive search using PostgreSQL
- Persisted column visibility preferences
- Optimized data fetching with caching (TanStack Query)
- Read-only demo mode via environment-based configuration
- Protected production deployment using middleware authentication

## Architecture

The application is deployed in two environments:

### Production
- Protected via middleware authentication
- Connected to a dedicated PostgreSQL database
- Full read/write access

### Demo
- Public read-only deployment
- Separate PostgreSQL database with seeded mock data
- Write operations disabled via environment flag

Both environments use the same codebase and are configured through environment variables.

## Technical Decisions

- Offset-based pagination was chosen to keep the implementation predictable and scalable.
- Search is implemented at the database level using case-insensitive filters.
- Environment-based configuration allows safe separation between production and demo deployments.
- Prisma was selected for type-safe database interaction.