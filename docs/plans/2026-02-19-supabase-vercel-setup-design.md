# Supabase + Vercel Setup Design

**Date**: 2026-02-19
**Status**: Approved

## Goal

Set up Supabase for persistent data storage and Vercel for test (preview) and production environments.

## Decisions

- **1 Supabase project** (free tier) shared across all environments
- **1 Vercel project** with environment variable overrides for preview vs production
- **Supabase CLI** for migration management (no manual SQL in dashboard)
- **Solana devnet** for development/preview, **mainnet-beta** for production
- **No CI/CD** pipelines — manual deploys via Vercel's git integration

## Architecture

```
GitHub Repo
    │
    ├── push to non-main branch → Vercel Preview Deployment
    │       └── Supabase (shared) + Solana Devnet
    │
    └── push/merge to main → Vercel Production Deployment
            └── Supabase (shared) + Solana Mainnet
```

## Supabase Project Setup

- Create project `code-wars` on Supabase free tier
- Initialize Supabase CLI with `supabase init`
- Link CLI to remote project with `supabase link`
- Restructure existing `supabase/schema.sql` into migrations:
  - `supabase/migrations/20260219000000_initial_schema.sql` — full schema
  - `supabase/seed.sql` — 25 equipment catalog items
- Deploy with `supabase db push`

### Schema Contents (from existing schema.sql)

- 6 enums: language, rarity, battle_result, slot_type, tx_status
- 6 tables: players, cards, battle_logs, equipment_items, player_inventory, card_equipment, sol_transactions
- RLS policies: wallet-based row access via `current_setting('app.wallet_address')`
- 3 leaderboard RPC functions
- Indexes on foreign keys and common queries

### Authentication Model

No change. Wallet-based auth via Supabase RLS. No Supabase Auth service used. The anon key + RLS policies control access.

## Vercel Environment Configuration

Single Vercel project with 3 environment scopes:

| Variable | Development | Preview | Production |
|----------|------------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `<project-url>` | `<project-url>` | `<project-url>` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<anon-key>` | `<anon-key>` | `<anon-key>` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | devnet | devnet | mainnet-beta |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` | `devnet` | `mainnet-beta` |

All environments share the same Supabase project. Only Solana network differs.

## Migration Strategy

- Existing `supabase/schema.sql` becomes the first migration file
- Future schema changes: add new files in `supabase/migrations/<timestamp>_description.sql`
- Deploy with `supabase db push`
- `supabase/schema.sql` kept as reference documentation (not source of truth)

## Seed Data

`supabase/seed.sql` contains INSERT statements for the 25 equipment catalog items from `src/lib/constants.ts`. Applied via `supabase db reset` (local) or manually on remote.

## What Changes in Code

Nothing. The existing dual-mode DB layer (`src/lib/db.ts`) and Supabase client (`src/lib/supabase.ts`) work as-is. When env vars are set, Supabase is used; otherwise, in-memory fallback.

## What Stays the Same

- All application code
- Dual-mode fallback (in-memory when no Supabase configured)
- Test suite (runs against in-memory store)
- No CI/CD pipelines

## File Changes Summary

| File | Action |
|------|--------|
| `supabase/config.toml` | Created by `supabase init` |
| `supabase/migrations/20260219000000_initial_schema.sql` | Moved from `schema.sql` |
| `supabase/seed.sql` | New — 25 equipment items |
| `.env.local.example` | Updated with documented env vars |
| Vercel project settings | Configured via dashboard/CLI |
| Supabase remote project | Created, schema pushed |
