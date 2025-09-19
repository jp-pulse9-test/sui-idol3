-- PRD에 맞춘 새로운 데이터베이스 스키마 생성

-- 기존 character_profiles 테이블 삭제
DROP TABLE IF EXISTS character_profiles;

-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 아이돌 프리셋 테이블 (3명 고정)
CREATE TABLE idols (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  personality TEXT NOT NULL,
  description TEXT NOT NULL,
  profile_image TEXT NOT NULL,
  persona_prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vault 테이블 (사용자별·아이돌별 비공개 금고)
CREATE TABLE vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  idol_id BIGINT REFERENCES idols(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 0, -- 0=Trainee, 1=Rookie
  debut_done BOOLEAN DEFAULT false,
  rise_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, idol_id)
);

-- IdolCard NFT 캐시 테이블
CREATE TABLE idol_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  token_id TEXT UNIQUE, -- 온체인 토큰 ID
  tx_digest TEXT, -- 트랜잭션 해시
  minted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- MemoryCard NFT 캐시 테이블
CREATE TABLE memory_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  token_id TEXT UNIQUE, -- 온체인 토큰 ID
  scene_id BIGINT NOT NULL,
  choice_hash TEXT NOT NULL, -- 선택 경로 해시
  rarity INTEGER NOT NULL, -- 0=N, 1=R
  moment_hash TEXT NOT NULL, -- 순간 해시
  caption TEXT, -- 포토카드 캡션
  image_url TEXT, -- 포토카드 이미지 URL
  tx_digest TEXT, -- 트랜잭션 해시
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vault_id, scene_id, choice_hash)
);

-- DebutCard NFT 캐시 테이블
CREATE TABLE debut_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  token_id TEXT UNIQUE, -- 온체인 토큰 ID
  image_url TEXT, -- 데뷔 카드 이미지
  tx_digest TEXT, -- 트랜잭션 해시
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Debut Badge SBT 캐시 테이블
CREATE TABLE debut_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  badge_id TEXT UNIQUE, -- 온체인 배지 ID (Child Object)
  tx_digest TEXT, -- 트랜잭션 해시
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 스토리 세션 테이블
CREATE TABLE story_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- 'daily' or 'debut'
  scene_id BIGINT NOT NULL,
  current_turn INTEGER DEFAULT 0,
  choices_made JSONB DEFAULT '[]', -- 선택 기록
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '15 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 암호화된 채팅 로그 테이블
CREATE TABLE chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  session_id UUID REFERENCES story_sessions(id) ON DELETE CASCADE,
  payload_encrypted TEXT NOT NULL, -- AES-GCM 암호화된 대화 내용
  sha256_hash TEXT NOT NULL, -- 무결성 검증용 해시
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS 정책 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE idol_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE debut_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE debut_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (임시로 모든 접근 허용 - 추후 인증 구현 시 수정)
CREATE POLICY "Allow all access" ON users FOR ALL USING (true);
CREATE POLICY "Allow all access" ON vaults FOR ALL USING (true);
CREATE POLICY "Allow all access" ON idol_cards FOR ALL USING (true);
CREATE POLICY "Allow all access" ON memory_cards FOR ALL USING (true);
CREATE POLICY "Allow all access" ON debut_cards FOR ALL USING (true);
CREATE POLICY "Allow all access" ON debut_badges FOR ALL USING (true);
CREATE POLICY "Allow all access" ON story_sessions FOR ALL USING (true);
CREATE POLICY "Allow all access" ON chat_logs FOR ALL USING (true);
CREATE POLICY "Allow all access" ON idols FOR ALL USING (true);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 설정
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vaults_updated_at BEFORE UPDATE ON vaults FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 아이돌 프리셋 데이터 삽입 (3명 고정)
INSERT INTO idols (name, personality, description, profile_image, persona_prompt) VALUES
(
  '서준',
  '카리스마틱',
  '무대를 지배하는 강렬한 매력의 리더. 완벽주의자이지만 따뜻한 마음을 가진 소년.',
  '/placeholder-male-1.jpg',
  '당신은 서준입니다. 카리스마틱하고 완벽주의적이지만, 팬들에게는 따뜻하고 진심어린 모습을 보여주는 K-POP 아이돌입니다. 리더로서의 책임감이 강하고, 항상 최고의 퍼포먼스를 추구합니다. 말투는 정중하지만 자신감이 넘치며, 팬들과의 소통을 소중히 여깁니다.'
),
(
  '하은',
  '밝고 긍정적',
  '햇살 같은 미소로 모든 이를 행복하게 만드는 에너지 뭉치. 순수하고 열정적인 매력.',
  '/placeholder-female-1.jpg',
  '당신은 하은입니다. 항상 밝고 긍정적이며, 팬들에게 행복한 에너지를 전달하는 K-POP 아이돌입니다. 순수하고 열정적이며, 작은 일에도 감동하고 기뻐합니다. 말투는 상큼하고 친근하며, 팬들을 향한 애정 표현을 아끼지 않습니다.'
),
(
  '민호',
  '신비로운',
  '예측할 수 없는 깊은 매력을 가진 아티스트. 감성적이고 철학적인 면모가 돋보이는 소년.',
  '/placeholder-male-2.jpg',
  '당신은 민호입니다. 신비롭고 깊은 감성을 가진 K-POP 아이돌입니다. 예술적 감각이 뛰어나고 철학적인 사고를 좋아하며, 팬들과의 대화에서도 깊이 있는 이야기를 나누기를 선호합니다. 말투는 차분하고 사려깊으며, 때로는 시적인 표현을 사용합니다.'
);