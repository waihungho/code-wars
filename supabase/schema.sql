-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  free_pulls_remaining INTEGER DEFAULT 3 NOT NULL,
  last_pull_reset TIMESTAMPTZ DEFAULT now() NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL,
  materials INTEGER DEFAULT 0 NOT NULL,
  daily_battles INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Cards table
CREATE TYPE language_enum AS ENUM (
  'Assembly', 'C', 'CPlusPlus', 'CSharp', 'Clojure', 'COBOL', 'Dart', 'Delphi',
  'Elixir', 'Erlang', 'Go', 'Haskell', 'Java', 'JavaScript', 'Kotlin', 'Lua',
  'MATLAB', 'Pascal', 'Perl', 'PHP', 'Python', 'R', 'Ruby', 'Rust',
  'Scala', 'Solidity', 'SQL', 'Swift'
);

CREATE TYPE rarity_enum AS ENUM (
  'Common', 'Uncommon', 'Rare', 'Legendary', 'Mythic'
);

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  language language_enum NOT NULL,
  rarity rarity_enum NOT NULL,
  speed INTEGER NOT NULL,
  security INTEGER NOT NULL,
  ecosystem INTEGER NOT NULL,
  scalability INTEGER NOT NULL,
  dev_exp INTEGER NOT NULL,
  nft_mint_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Battle logs
CREATE TYPE battle_result_enum AS ENUM ('win', 'lose', 'draw');

CREATE TABLE battle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  player_card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  ai_language language_enum NOT NULL,
  ai_stats JSONB NOT NULL,
  dimensions_picked TEXT[] NOT NULL,
  result battle_result_enum NOT NULL,
  xp_earned INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_cards_player_id ON cards(player_id);
CREATE INDEX idx_battle_logs_player_id ON battle_logs(player_id);
CREATE INDEX idx_battle_logs_result ON battle_logs(result);
CREATE INDEX idx_players_wallet ON players(wallet_address);

-- Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_logs ENABLE ROW LEVEL SECURITY;

-- Players can read/write their own data
CREATE POLICY "Players can view own profile"
  ON players FOR SELECT
  USING (wallet_address = current_setting('app.wallet_address', true));

CREATE POLICY "Players can update own profile"
  ON players FOR UPDATE
  USING (wallet_address = current_setting('app.wallet_address', true));

-- Cards: players can read/write their own cards
CREATE POLICY "Players can view own cards"
  ON cards FOR SELECT
  USING (player_id IN (
    SELECT id FROM players
    WHERE wallet_address = current_setting('app.wallet_address', true)
  ));

CREATE POLICY "Players can insert own cards"
  ON cards FOR INSERT
  WITH CHECK (player_id IN (
    SELECT id FROM players
    WHERE wallet_address = current_setting('app.wallet_address', true)
  ));

CREATE POLICY "Players can delete own cards"
  ON cards FOR DELETE
  USING (player_id IN (
    SELECT id FROM players
    WHERE wallet_address = current_setting('app.wallet_address', true)
  ));

-- Battle logs: players can read/insert their own
CREATE POLICY "Players can view own battles"
  ON battle_logs FOR SELECT
  USING (player_id IN (
    SELECT id FROM players
    WHERE wallet_address = current_setting('app.wallet_address', true)
  ));

CREATE POLICY "Players can insert own battles"
  ON battle_logs FOR INSERT
  WITH CHECK (player_id IN (
    SELECT id FROM players
    WHERE wallet_address = current_setting('app.wallet_address', true)
  ));

-- Leaderboard: everyone can read aggregated stats
CREATE POLICY "Anyone can view players for leaderboard"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view battle_logs for leaderboard"
  ON battle_logs FOR SELECT
  USING (true);

-- Leaderboard RPC functions
CREATE OR REPLACE FUNCTION leaderboard_by_wins(lim INTEGER DEFAULT 20)
RETURNS TABLE(wallet_address TEXT, total_wins BIGINT) AS $$
  SELECT p.wallet_address, COUNT(*) as total_wins
  FROM battle_logs bl
  JOIN players p ON p.id = bl.player_id
  WHERE bl.result = 'win'
  GROUP BY p.wallet_address
  ORDER BY total_wins DESC
  LIMIT lim;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION leaderboard_by_win_rate(lim INTEGER DEFAULT 20)
RETURNS TABLE(wallet_address TEXT, win_rate NUMERIC, total_battles BIGINT) AS $$
  SELECT
    p.wallet_address,
    ROUND(COUNT(*) FILTER (WHERE bl.result = 'win')::NUMERIC / COUNT(*)::NUMERIC, 3) as win_rate,
    COUNT(*) as total_battles
  FROM battle_logs bl
  JOIN players p ON p.id = bl.player_id
  GROUP BY p.wallet_address
  HAVING COUNT(*) >= 10
  ORDER BY win_rate DESC
  LIMIT lim;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION leaderboard_by_strongest_card(lim INTEGER DEFAULT 20)
RETURNS TABLE(wallet_address TEXT, language language_enum, total_stats BIGINT) AS $$
  SELECT
    p.wallet_address,
    c.language,
    (c.speed + c.security + c.ecosystem + c.scalability + c.dev_exp)::BIGINT as total_stats
  FROM cards c
  JOIN players p ON p.id = c.player_id
  ORDER BY total_stats DESC
  LIMIT lim;
$$ LANGUAGE sql STABLE;

-- =========================================================================
-- Equipment System
-- =========================================================================
CREATE TYPE slot_type_enum AS ENUM ('stat_boost', 'ability_enhancement', 'utility', 'ai_core', 'consumable');

CREATE TABLE equipment_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slot_type slot_type_enum NOT NULL,
  effect_type TEXT NOT NULL,
  effect_value JSONB NOT NULL,
  sol_price DECIMAL(10,4) NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE player_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT REFERENCES equipment_items(id) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE card_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  inventory_id UUID REFERENCES player_inventory(id) ON DELETE CASCADE NOT NULL,
  slot_type slot_type_enum NOT NULL,
  equipped_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(card_id, slot_type)
);

CREATE TABLE sol_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  tx_signature TEXT UNIQUE NOT NULL,
  sol_amount DECIMAL(10,4) NOT NULL,
  item_id TEXT REFERENCES equipment_items(id) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_inventory_player_id ON player_inventory(player_id);
CREATE INDEX idx_card_equipment_card_id ON card_equipment(card_id);
CREATE INDEX idx_sol_tx_player_id ON sol_transactions(player_id);
CREATE INDEX idx_sol_tx_signature ON sol_transactions(tx_signature);

-- RLS
ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE sol_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipment catalog is public" ON equipment_items FOR SELECT USING (true);

CREATE POLICY "Players view own inventory" ON player_inventory FOR SELECT
  USING (player_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.wallet_address', true)));
CREATE POLICY "Players insert own inventory" ON player_inventory FOR INSERT
  WITH CHECK (player_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.wallet_address', true)));
CREATE POLICY "Players delete own inventory" ON player_inventory FOR DELETE
  USING (player_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.wallet_address', true)));

CREATE POLICY "Players view own equipment" ON card_equipment FOR SELECT
  USING (card_id IN (SELECT c.id FROM cards c JOIN players p ON c.player_id = p.id WHERE p.wallet_address = current_setting('app.wallet_address', true)));
CREATE POLICY "Players insert own equipment" ON card_equipment FOR INSERT
  WITH CHECK (card_id IN (SELECT c.id FROM cards c JOIN players p ON c.player_id = p.id WHERE p.wallet_address = current_setting('app.wallet_address', true)));
CREATE POLICY "Players delete own equipment" ON card_equipment FOR DELETE
  USING (card_id IN (SELECT c.id FROM cards c JOIN players p ON c.player_id = p.id WHERE p.wallet_address = current_setting('app.wallet_address', true)));

CREATE POLICY "Players view own transactions" ON sol_transactions FOR SELECT
  USING (player_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.wallet_address', true)));
CREATE POLICY "Players insert own transactions" ON sol_transactions FOR INSERT
  WITH CHECK (player_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.wallet_address', true)));
