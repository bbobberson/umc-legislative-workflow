# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UMC Legislative Workflow is a sales prototype demonstrating modernization of the United Methodist Church's legislative petition management system. This replaces their legacy CALMS system with cloud-based, real-time collaboration tools. The focus is on visual impact and user experience over backend complexity - this is throwaway code for demo purposes.

**Key Demo Focus**: The Committee Recording Interface is the star feature that UMC has never seen demoed before.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS v4
- **Database**: Neon Postgres (serverless PostgreSQL) via `@neondatabase/serverless`
- **UI Libraries**: `@tanstack/react-virtual` for performance, `diff` for text comparison
- **Deployment**: Vercel with Neon database integration
- **Environment**: Local `.env.local` with `POSTGRES_URL`

### Database Architecture
The system uses a straightforward relational schema focused on three main workflows:

1. **Petition Submission**: `petitions` table with Book of Discipline paragraph references and visual amendment tracking
2. **Committee Management**: `committees` and `committee_votes` tables (the core demo feature)
3. **Book of Discipline Integration**: `bod_paragraphs` table with 28+ real paragraphs from Constitutional, Social Principles, and Ministry sections

Key design decisions:
- Uses direct SQL queries via Neon serverless (no ORM complexity)
- JSONB for vote tallies: `{yes: number, no: number, abstain: number, present: number}`
- JSONB for amendment data: structured tracking of insertions/deletions with position metadata
- Consent calendar automation through `consent_calendar_eligible` and `consent_calendar_category`
- Visual diff tracking using `diff` library for before/after text comparison

### Application Structure

**Three Main User Flows:**
1. `/submit` - Public petition submission with visual amendment editor (RTF-style editing with strike-through/underline)
2. `/secretary` - Dashboard for petition management and committee assignment (supports large datasets)
3. `/recorder` - Committee recording interface (★ demo highlight)
   - `/recorder/vote/[id]` - Individual petition voting interface
   - `/recorder/approve/[id]` - Committee approval workflow

**Key Components:**
- `BodParagraphSearch` - Smart search with multi-mode filtering (paragraph #, title, keywords, sections)
- `BodParagraphEditor` - contentEditable rich text editor with diff tracking
- `BodParagraphPreview` - Before/after comparison with visual diff rendering

**Performance Features:**
- Virtual scrolling for large petition lists using `@tanstack/react-virtual`
- Real-time search highlighting with regex-based text matching
- Committee workload popover to reduce UI clutter
- Sortable columns with visual indicators

**API Endpoints:**
- `/api/bod-paragraphs` - Fetches Book of Discipline paragraphs for smart search
- `/api/petitions` - GET (list) and POST (create) petition operations
- `/api/petitions/[id]` - GET individual petition details, PATCH updates petition metadata
- `/api/petitions/[id]/assign` - POST committee assignment
- `/api/committees` - GET list of committees
- `/api/committee-votes` - POST create committee vote records
- `/api/committee-votes/[id]` - GET individual vote details, PATCH update votes
- `/api/committee-votes/[id]/approve` - POST approve committee vote decisions

**Secretary Workflow Features:**
- Auto-redirect with success toast notification after petition save
- "Return to Submitter" secondary action for workflow discussions
- Enhanced Secretary Review panel with improved visual hierarchy
- Full-width layouts for better screen utilization on modern displays

## Common Development Commands

```bash
# Development
npm run dev              # Start development server (usually runs on :3000)

# Database
npm run db:setup         # Initialize database schema and sample data
                        # Requires POSTGRES_URL in .env.local

# Build & Deploy  
npm run build           # Production build
npm run start           # Start production server
npm run lint            # ESLint check

# Database Scripts
npx tsx scripts/setup-database.ts              # Full database initialization
npx tsx scripts/populate-real-bod-paragraphs.ts # Load authentic BoD content
npx tsx scripts/check-committee-duplicates.ts   # Verify committee data integrity
npx tsx scripts/fix-committee-duplicates-final.ts # Clean duplicate committee records

# Legacy Scripts (DO NOT USE)
# These scripts reference the old petition_text column that was removed:
# - scripts/add-sample-petitions.ts
# - scripts/add-20-realistic-petitions.ts
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

## Critical Data Integrity Issues

### Committee Duplicates
The database has historically had duplicate committee records (same name, different IDs). Always verify committee data integrity before major releases:

```bash
npx tsx scripts/check-committee-duplicates.ts
```

If duplicates exist, use the fix script which properly handles foreign key relationships:
```bash  
npx tsx scripts/fix-committee-duplicates-final.ts
```

### Search Performance
The secretary dashboard is designed to handle large petition datasets (1000+ records) efficiently:
- Current implementation uses traditional table rendering with pagination-ready architecture
- Virtual scrolling capability available via `@tanstack/react-virtual` (73px row height, 10 overscan)
- Full-text search includes: title, submitter, organization, BoD paragraph, amendment text, committee name, petition type
- Real-time filtering and sorting without performance degradation

## Demo Strategy Notes

This is prototype code prioritizing visual impact for UMC leadership and IT decision makers. The Committee Recording Interface should be the centerpiece of any demo, as it showcases:

1. Real-time vote recording
2. Automated consent calendar rule application  
3. Amendment tracking with diff visualization
4. Committee approval workflow

Sample data includes 8 legislative committees and 28+ real Book of Discipline paragraphs from Constitutional (¶38-61), Social Principles, Local Church, and Ministry sections. The system pre-populates authentic UMC content and organizational structure for realistic demos.

## UMC Branding and Design System

The application implements authentic UMC branding following the official UMC brand guidelines:

### Color System
- **UMC Red (#E4002B)**: Reserved for brand identity elements only (logos, cross/flame icons, brand text)
- **Primary Blue (#1D4ED8)**: Used for all interactive elements (buttons, CTAs, hover states) following UI best practices
- **UMC Black (#231F20)**: Official UMC black for text and brand elements
- **Trade Gothic**: Brand typography with system font fallbacks

### Design Principles
- Red signifies brand identity, not functional actions (avoids "error" associations)
- Blue indicates trustworthy primary actions (submit, save, continue)
- Minimal header with just UMC cross/flame logo and organization name
- Clean, professional appearance suitable for church leadership demos

### Tailwind CSS v4 Implementation
Colors and fonts are defined in `src/app/globals.css` using the `@theme inline` directive:
```css
@theme inline {
  --color-umc-red: #E4002B;
  --color-primary: #1D4ED8;
  --color-primary-hover: #1E3A8A;
  --color-primary-300: #93C5FD;
  --font-trade: "Trade Gothic", "Trade Gothic Next", ...;
}
```

### Layout System
The application uses a mixed layout approach optimized for different page types:
- **Home page**: Centered container layout (`container mx-auto`) for marketing feel
- **Application pages**: Full-width layout (`max-w-7xl mx-auto`) for data-dense interfaces
- **Submit page**: Full-width with optimized 3-column form layout for petition details
- **Secretary pages**: Full-width with enhanced card layouts and proper visual hierarchy

## Development Notes

- Port 3000 is the default; Next.js may fallback to 3001 if occupied
- Database queries use template literals with the Neon serverless client
- Visual amendment editing uses `diffWords` from the `diff` library for change detection
- Amendment data is stored as JSONB with structured `{type: 'delete'|'insert', originalText?, newText?, position}` format
- **Tailwind CSS v4**: Uses `@theme inline` directive in `globals.css` instead of separate config file
- Form submissions include success states and error handling for demo polish

## Troubleshooting

### Performance and Rendering Issues
If the secretary dashboard has performance issues or display problems:
1. Check for JavaScript syntax errors in browser console (especially template literal escaping)
2. Clear Next.js build cache: `rm -rf .next && npm run dev`
3. Verify database queries are completing successfully in server logs
4. For large datasets (1000+ records), consider implementing virtual scrolling with `@tanstack/react-virtual`

### Database Connection Issues
All scripts require `.env.local` with valid `POSTGRES_URL`. The Neon serverless client will fail silently if environment variables are missing.

## Script Utilities

Various TypeScript scripts in `/scripts/` for database management:
- `setup-database.ts` - Initialize schema and sample data
- `populate-real-bod-paragraphs.ts` - Load authentic BoD content
- `check-committee-duplicates.ts` - Verify data integrity
- `fix-committee-duplicates-final.ts` - Clean duplicate committee records (handles FK relationships)
- `remove-petition-text-column.ts` - Migration script (historical)

**Legacy Scripts (DO NOT USE):**
- `add-sample-petitions.ts` - ❌ References removed petition_text column
- `add-20-realistic-petitions.ts` - ❌ References removed petition_text column  
- `reset-petitions.ts` - ❌ May reference outdated schema

## Important Database Schema Changes

The system recently migrated from a `petition_text` field to an amendment-based workflow:
- **Removed**: `petition_text` column from petitions table
- **Added**: `amendment_data` JSONB field for structured change tracking
- **Added**: `original_paragraph_text` and `modified_paragraph_text` fields
- All petition data now focuses on amendments to existing BoD paragraphs