# Scripts Directory

## Current Scripts

### Database Management
- `setup-database.ts` - ✅ CURRENT: Sets up database schema with amendment support
- `remove-petition-text-column.ts` - Migration script that removed legacy petition_text column

### Data Population
- `populate-real-bod-paragraphs.ts` - ✅ CURRENT: Loads authentic BoD paragraphs

### Legacy Scripts (DO NOT USE)
These scripts reference the old `petition_text` column that was removed:
- `add-sample-petitions.ts` - ❌ OUTDATED: Contains petition_text field
- `add-20-realistic-petitions.ts` - ❌ OUTDATED: Contains petition_text field

## Current Database Schema
The petitions table now focuses on amendment-based workflow:
- No `petition_text` field (removed)
- Amendment data stored in `amendment_data` JSONB
- Original/modified paragraph text in dedicated columns
- Rationale field for justification

## Running Scripts
```bash
npx tsx scripts/setup-database.ts
npx tsx scripts/populate-real-bod-paragraphs.ts
```