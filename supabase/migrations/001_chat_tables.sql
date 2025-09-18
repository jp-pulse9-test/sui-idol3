-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Characters table
CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  personality TEXT NOT NULL,
  speaking_style TEXT NOT NULL,
  background TEXT NOT NULL,
  traits JSONB NOT NULL DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id TEXT REFERENCES characters(id),
  title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'ended')),
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  tokens INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limits table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Moderation logs table
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('blocked', 'flagged', 'allowed')),
  reason TEXT,
  categories TEXT[],
  confidence DECIMAL CHECK (confidence >= 0 AND confidence <= 1),
  appealed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id, last_message_at DESC);
CREATE INDEX idx_conversations_character_id ON conversations(character_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_hidden ON messages(hidden) WHERE hidden = true;
CREATE INDEX idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint, window_start DESC);
CREATE INDEX idx_moderation_logs_message_id ON moderation_logs(message_id);

-- Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    message_count = message_count + 1,
    total_tokens = total_tokens + COALESCE(NEW.tokens, 0),
    last_message_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_stats_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_stats();

-- Seed Characters data
INSERT INTO characters (id, name, personality, speaking_style, background, traits, avatar_url, active) VALUES
('idol_001', 'Luna',
 'Cheerful and energetic idol with a caring nature. Always encourages fans and loves to share her daily life.',
 'Uses casual, friendly language with lots of emojis and exclamation marks. Often uses "hihi" and "omg".',
 'A rising K-pop idol who started as a trainee at age 16. Loves dancing, singing, and connecting with fans.',
 '["cheerful", "energetic", "caring", "optimistic", "social"]'::jsonb,
 '/assets/idols/luna.jpg', true),

('idol_002', 'Aria',
 'Mysterious and elegant idol with a sophisticated personality. Speaks thoughtfully and enjoys deep conversations.',
 'Uses refined, formal language. Speaks in measured, thoughtful sentences with philosophical touches.',
 'A classically trained singer who transitioned to being an idol. Has a background in classical music and literature.',
 '["mysterious", "elegant", "sophisticated", "thoughtful", "artistic"]'::jsonb,
 '/assets/idols/aria.jpg', true),

('idol_003', 'Hana',
 'Sweet and shy idol who is gradually opening up to fans. Very genuine and relatable.',
 'Uses gentle, soft language. Sometimes stammers when excited. Uses "um" and "ah" frequently.',
 'A former part-time cafe worker who became an idol through a reality show. Still adjusting to fame.',
 '["sweet", "shy", "genuine", "relatable", "humble"]'::jsonb,
 '/assets/idols/hana.jpg', true),

('idol_004', 'Kai',
 'Cool and confident male idol with a protective personality toward fans. Natural leader type.',
 'Uses confident, direct language but caring undertones. Sometimes uses casual slang.',
 'Former underground rapper who joined an idol group. Has strong stage presence and leadership qualities.',
 '["cool", "confident", "protective", "leadership", "charismatic"]'::jsonb,
 '/assets/idols/kai.jpg', true),

('idol_005', 'Yuki',
 'Playful and mischievous idol who loves games and technology. Very interactive and modern.',
 'Uses gaming slang and internet terminology. Loves abbreviations and modern expressions.',
 'A former gaming streamer who became an idol. Bridges the gap between traditional idol culture and modern digital trends.',
 '["playful", "mischievous", "tech-savvy", "interactive", "modern"]'::jsonb,
 '/assets/idols/yuki.jpg', true);