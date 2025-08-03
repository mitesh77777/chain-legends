-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  fighter_nft_id BIGINT,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  ranking INTEGER DEFAULT 1000,
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Battle rooms for matchmaking
CREATE TABLE battle_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES players(id),
  player2_id UUID REFERENCES players(id),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  winner_id UUID REFERENCES players(id),
  battle_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Tournament brackets
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  prize_pool DECIMAL(18,8),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  max_participants INTEGER DEFAULT 16,
  entry_fee DECIMAL(18,8),
  start_time TIMESTAMP,
  bracket_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tournament participants
CREATE TABLE tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tournament_id, player_id)
);

-- Battle history for analytics
CREATE TABLE battle_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES battle_rooms(id),
  player1_id UUID REFERENCES players(id),
  player2_id UUID REFERENCES players(id),
  winner_id UUID REFERENCES players(id),
  battle_log JSONB,
  duration_seconds INTEGER,
  total_turns INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily challenges
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  challenge_type TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  reward_claimed BOOLEAN DEFAULT FALSE,
  challenge_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(player_id, challenge_type, challenge_date)
);

-- Indexes for performance
CREATE INDEX idx_players_wallet_address ON players(wallet_address);
CREATE INDEX idx_players_ranking ON players(ranking DESC);
CREATE INDEX idx_battle_rooms_status ON battle_rooms(status);
CREATE INDEX idx_battle_rooms_created_at ON battle_rooms(created_at);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start_time ON tournaments(start_time);
CREATE INDEX idx_battle_history_created_at ON battle_history(created_at);
CREATE INDEX idx_daily_challenges_player_date ON daily_challenges(player_id, challenge_date);

-- Functions
CREATE OR REPLACE FUNCTION update_player_ranking()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple ELO-like ranking system
  -- Winner gains points, loser loses points
  IF NEW.winner_id IS NOT NULL THEN
    UPDATE players 
    SET ranking = ranking + 25,
        last_active = NOW()
    WHERE id = NEW.winner_id;
    
    -- Update loser (whoever is not the winner)
    UPDATE players 
    SET ranking = GREATEST(ranking - 15, 100),
        last_active = NOW()
    WHERE id = CASE 
      WHEN NEW.player1_id = NEW.winner_id THEN NEW.player2_id 
      ELSE NEW.player1_id 
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rankings after battle completion
CREATE TRIGGER update_rankings_after_battle
  AFTER UPDATE OF winner_id ON battle_rooms
  FOR EACH ROW
  WHEN (NEW.winner_id IS NOT NULL AND OLD.winner_id IS NULL)
  EXECUTE FUNCTION update_player_ranking();

-- Function to clean up old waiting rooms
CREATE OR REPLACE FUNCTION cleanup_old_waiting_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM battle_rooms 
  WHERE status = 'waiting' 
    AND created_at < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;

-- Function to generate daily challenges
CREATE OR REPLACE FUNCTION generate_daily_challenges(p_player_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert today's challenges if they don't exist
  INSERT INTO daily_challenges (player_id, challenge_type, target)
  VALUES 
    (p_player_id, 'wins', 3),
    (p_player_id, 'battles', 5),
    (p_player_id, 'use_all_actions', 1)
  ON CONFLICT (player_id, challenge_type, challenge_date) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Players can read all player data but only update their own
CREATE POLICY "Players can read all players" ON players FOR SELECT USING (true);
CREATE POLICY "Players can update own data" ON players FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet', true));
CREATE POLICY "Players can insert own data" ON players FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_user_wallet', true));

-- Battle rooms policies
CREATE POLICY "Anyone can read battle rooms" ON battle_rooms FOR SELECT USING (true);
CREATE POLICY "Players can create battle rooms" ON battle_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can update own battle rooms" ON battle_rooms FOR UPDATE USING (
  player1_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.current_user_wallet', true)) OR
  player2_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.current_user_wallet', true))
);

-- Tournament policies
CREATE POLICY "Anyone can read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Anyone can read tournament participants" ON tournament_participants FOR SELECT USING (true);
CREATE POLICY "Players can join tournaments" ON tournament_participants FOR INSERT WITH CHECK (true);

-- Battle history policies
CREATE POLICY "Anyone can read battle history" ON battle_history FOR SELECT USING (true);
CREATE POLICY "System can insert battle history" ON battle_history FOR INSERT WITH CHECK (true);

-- Daily challenges policies
CREATE POLICY "Players can read own challenges" ON daily_challenges FOR SELECT USING (
  player_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.current_user_wallet', true))
);
CREATE POLICY "System can manage challenges" ON daily_challenges FOR ALL USING (true);