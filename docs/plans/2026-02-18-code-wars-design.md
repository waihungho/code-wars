# Code Wars — Programming Language Card Game on Solana

## Overview

A solo-play card battle game where players collect, upgrade, and battle programming language cards. Regular cards stored in Supabase; ultra-rare Mythic cards minted as Solana NFTs.

## Cards

### 8 Programming Languages

| Language   | Speed | Security | Ecosystem | Scalability | DevExp |
|------------|-------|----------|-----------|-------------|--------|
| Assembly   | 10    | 3        | 2         | 4           | 1      |
| C          | 9     | 2        | 7         | 5           | 3      |
| Rust       | 9     | 10       | 6         | 8           | 4      |
| Java       | 6     | 7        | 10        | 8           | 5      |
| Go         | 7     | 6        | 6         | 9           | 7      |
| JavaScript | 5     | 3        | 10        | 6           | 8      |
| Python     | 3     | 4        | 10        | 4           | 10     |
| Solidity   | 4     | 5        | 5         | 3           | 5      |

### 5 Ability Dimensions

- **Speed** — execution performance
- **Security** — memory safety, vulnerability resistance
- **Ecosystem** — library richness, tooling
- **Scalability** — concurrency, distributed capabilities
- **DevExp** — ease of learning and use

### Rarity Tiers

- **Common** (50%) — base stats, stored in Supabase
- **Uncommon** (30%) — slightly boosted stats, stored in Supabase
- **Rare** (15%) — notably strong, stored in Supabase
- **Legendary** (4.5%) — top-tier stats, stored in Supabase
- **Mythic** (0.5%) — extremely rare, minted as Solana NFT

### Stats & Upgrades

- Base stats range from 1-10 depending on language and rarity
- Max stat per dimension: **1000**
- Upgrade via two paths:
  - **Burn cards** — sacrifice unwanted cards for upgrade materials
  - **Win battles** — earn XP from victories
- Either currency can upgrade a specific dimension on a chosen card

## Battle System

Solo play only — player vs AI.

1. Player selects 1 card from their collection
2. AI opponent is generated (stats scale with difficulty tier)
3. System randomly picks **3 out of 5 dimensions** to compare
4. Higher stat wins each dimension round (tie = 0.5 each)
5. Win 2+ out of 3 rounds to win the battle
6. Winner earns XP + ranking points

The random dimension selection rewards balanced upgrades over min-maxing.

## Gacha System (抽卡)

- **Free pulls:** 3 per day (resets at UTC midnight)
- **Premium pulls:** pay SOL for extra pulls with better rarity odds
- Pull reveals a random language card at a random rarity tier
- Mythic pulls trigger on-chain NFT minting

## Tech Stack

### Frontend
- **Next.js + React** deployed on Vercel
- `@solana/wallet-adapter` for wallet connection
- Pages: Home, Collection, Gacha, Battle, Leaderboard

### Backend / Database
- **Supabase** for all game data
- Row-level security — players read/write only their own data
- Auth via Solana wallet sign-in (no email/password)

### On-chain (Solana)
- Minimal — only for Mythic NFT minting
- Anchor program or Metaplex compressed NFTs
- NFT metadata references card art + stats

## Data Models

### players
- `id` (uuid, PK)
- `wallet_address` (string, unique)
- `free_pulls_remaining` (int, default 3)
- `last_pull_reset` (timestamp)
- `xp` (int)
- `created_at` (timestamp)

### cards
- `id` (uuid, PK)
- `player_id` (FK -> players)
- `language` (enum: Assembly, C, Rust, Java, Go, JavaScript, Python, Solidity)
- `rarity` (enum: Common, Uncommon, Rare, Legendary, Mythic)
- `speed` (int)
- `security` (int)
- `ecosystem` (int)
- `scalability` (int)
- `dev_exp` (int)
- `nft_mint_address` (string, nullable)
- `created_at` (timestamp)

### battle_logs
- `id` (uuid, PK)
- `player_id` (FK -> players)
- `player_card_id` (FK -> cards)
- `ai_language` (enum)
- `ai_stats` (jsonb)
- `dimensions_picked` (text[3])
- `result` (enum: win, lose, draw)
- `xp_earned` (int)
- `created_at` (timestamp)

## Screens

1. **Home** — connect wallet, player stats overview
2. **Collection** — view all cards, upgrade dimensions, burn cards for materials
3. **Gacha (抽卡)** — pull animation, free/premium pulls, reveal card
4. **Battle** — pick card, fight AI, dimension comparison, rewards
5. **Leaderboard** — three tabs:
   - Top Wins (total battle wins)
   - Best Win Rate (win/loss ratio, min 10 battles)
   - Strongest Card (highest total stats on single card)

## MVP Phases

### Phase 1 — Core (ship first)
- Wallet connect + Supabase auth
- Gacha system (free pulls only)
- Card collection page with stats display
- Basic battle vs AI (random opponent stats)

### Phase 2 — Engagement
- Card upgrades (burn + XP paths)
- AI difficulty scaling
- Leaderboard (all 3 tabs)
- Battle animations

### Phase 3 — Monetization
- Premium pulls (SOL payment)
- Mythic NFT minting on-chain
- Card art / visual polish
