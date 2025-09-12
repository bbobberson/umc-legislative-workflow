# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UMC Legislative Workflow is a sales prototype demonstrating modernization of the United Methodist Church's legislative petition management system. This replaces their legacy CALMS system with cloud-based, real-time collaboration tools. The focus is on visual impact and user experience over backend complexity - this is throwaway code for demo purposes.

**Key Demo Focus**: The Committee Recording Interface is the star feature that UMC has never seen demoed before.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Database**: Neon Postgres (serverless PostgreSQL) via `@neondatabase/serverless`
- **Deployment**: Vercel with Neon database integration
- **Environment**: Local `.env.local` with `POSTGRES_URL`

### Database Architecture
The system uses a straightforward relational schema focused on three main workflows:

1. **Petition Submission**: `petitions` table with Book of Discipline paragraph references
2. **Committee Management**: `committees` and `committee_votes` tables (the core demo feature)
3. **Book of Discipline Integration**: `bod_paragraphs` table with structured amendment tracking

Key design decisions:
- Uses direct SQL queries via Neon serverless (no ORM complexity)
- JSONB for vote tallies: `{yes: number, no: number, abstain: number, present: number}`
- Consent calendar automation through `consent_calendar_eligible` and `consent_calendar_category`
- Amendment tracking with before/after text comparison

### Application Structure

**Three Main User Flows:**
1. `/submit` - Public petition submission form with BoD paragraph lookup
2. `/secretary` - Dashboard for petition management (planned)
3. `/recorder` - Committee recording interface (★ demo highlight)

**API Endpoints:**
- `/api/bod-paragraphs` - Fetches Book of Discipline paragraphs for dropdown
- `/api/petitions` - GET (list) and POST (create) petition operations

## Common Development Commands

```bash
# Development
npm run dev              # Start development server (usually runs on :3001)

# Database
npm run db:setup         # Initialize database schema and sample data
                        # Requires POSTGRES_URL in .env.local

# Build & Deploy  
npm run build           # Production build
npm run start           # Start production server
npm run lint            # ESLint check
```

## Key Business Logic

### Committee Vote Types
- `adopt` - Accept petition as written
- `refer` - Send to another committee  
- `not_support` - Reject petition
- `assign_to_reference` - Assign to reference committee

### Consent Calendar Rules (Critical Demo Feature)
Automated eligibility determination:
- **Category A (Discipline)**: Disciplinary changes, no constitutional amendments, specific vote thresholds
- **Category B (Non-Discipline)**: Non-disciplinary matters
- **Category C (Referrals)**: Items referred to other bodies
- Financial implications automatically disqualify from consent calendar

### Petition Types
- **D**: Disciplinary changes
- **C**: Constitutional amendments  
- **R**: Resolutions
- **O**: Other legislative matters

## Environment Setup

Required environment variables in `.env.local`:
```
POSTGRES_URL="postgresql://username:password@host/database?sslmode=require"
```

Database connection uses Neon serverless driver, configured in `src/lib/database.ts`. The setup script (`scripts/setup-database.ts`) includes dotenv loading for local development.

## Demo Strategy Notes

This is prototype code prioritizing visual impact for UMC leadership and IT decision makers. The Committee Recording Interface should be the centerpiece of any demo, as it showcases:

1. Real-time vote recording
2. Automated consent calendar rule application  
3. Amendment tracking with diff visualization
4. Committee approval workflow

Sample data includes 8 legislative committees and 6 Book of Discipline paragraphs. The system pre-populates realistic UMC organizational structure for authentic demos.

## Development Notes

- Port 3000 may be in use; Next.js typically falls back to 3001
- Database queries use template literals with the Neon serverless client
- Tailwind CSS provides rapid UI development with professional appearance
- Form submissions include success states and error handling for demo polish