-- Phase 3: VRI 시스템 데이터베이스 마이그레이션
-- 2028년 멸망 시나리오 관련 테이블 생성 및 확장

-- 1. user_vri 테이블: 사용자별 VRI (가치 회복 지수) 저장
CREATE TABLE IF NOT EXISTS public.user_vri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_vri INTEGER NOT NULL DEFAULT 0,
  trust_vri INTEGER NOT NULL DEFAULT 0,
  empathy_vri INTEGER NOT NULL DEFAULT 0,
  love_vri INTEGER NOT NULL DEFAULT 0,
  global_rank INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- user_vri RLS 정책
ALTER TABLE public.user_vri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own VRI"
  ON public.user_vri FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own VRI"
  ON public.user_vri FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own VRI"
  ON public.user_vri FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view VRI for rankings"
  ON public.user_vri FOR SELECT
  USING (true);

-- user_vri 인덱스
CREATE INDEX idx_user_vri_user_id ON public.user_vri(user_id);
CREATE INDEX idx_user_vri_total ON public.user_vri(total_vri DESC);
CREATE INDEX idx_user_vri_global_rank ON public.user_vri(global_rank);

-- 2. branch_progress 테이블: 브랜치별 진행도 저장
CREATE TABLE IF NOT EXISTS public.branch_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL,
  current_vri INTEGER NOT NULL DEFAULT 0,
  max_vri INTEGER NOT NULL,
  completed_missions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_cleared BOOLEAN NOT NULL DEFAULT false,
  first_cleared_at TIMESTAMP WITH TIME ZONE,
  last_played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, branch_id)
);

-- branch_progress RLS 정책
ALTER TABLE public.branch_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own branch progress"
  ON public.branch_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own branch progress"
  ON public.branch_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branch progress"
  ON public.branch_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own branch progress"
  ON public.branch_progress FOR DELETE
  USING (auth.uid() = user_id);

-- branch_progress 인덱스
CREATE INDEX idx_branch_progress_user_id ON public.branch_progress(user_id);
CREATE INDEX idx_branch_progress_branch_id ON public.branch_progress(branch_id);
CREATE INDEX idx_branch_progress_is_cleared ON public.branch_progress(is_cleared);

-- 3. memory_cards 테이블 확장: VRI 및 브랜치 정보 추가
ALTER TABLE public.memory_cards
  ADD COLUMN IF NOT EXISTS vri_value INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS value_type TEXT,
  ADD COLUMN IF NOT EXISTS branch_id TEXT,
  ADD COLUMN IF NOT EXISTS branch_year INTEGER;

-- memory_cards 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_memory_cards_branch_id ON public.memory_cards(branch_id);
CREATE INDEX IF NOT EXISTS idx_memory_cards_value_type ON public.memory_cards(value_type);
CREATE INDEX IF NOT EXISTS idx_memory_cards_vri_value ON public.memory_cards(vri_value DESC);

-- 4. VRI 랭킹 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_vri_rankings()
RETURNS TRIGGER AS $$
BEGIN
  -- 전체 사용자의 랭킹을 total_vri 기준으로 업데이트
  WITH ranked_users AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY total_vri DESC, last_updated ASC) as new_rank
    FROM public.user_vri
  )
  UPDATE public.user_vri
  SET global_rank = ranked_users.new_rank
  FROM ranked_users
  WHERE public.user_vri.id = ranked_users.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- VRI 업데이트 시 랭킹 자동 갱신 트리거
CREATE TRIGGER trigger_update_vri_rankings
  AFTER INSERT OR UPDATE OF total_vri ON public.user_vri
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_vri_rankings();

-- 5. 브랜치 진행도 업데이트 시 VRI 자동 동기화 함수
CREATE OR REPLACE FUNCTION sync_vri_from_branch_progress()
RETURNS TRIGGER AS $$
DECLARE
  trust_total INTEGER := 0;
  empathy_total INTEGER := 0;
  love_total INTEGER := 0;
  vri_total INTEGER := 0;
BEGIN
  -- 사용자의 모든 브랜치 진행도에서 VRI 합산
  SELECT 
    COALESCE(SUM(CASE WHEN branch_id = 'branch-2017-trust' THEN current_vri ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN branch_id = 'branch-2024-empathy' THEN current_vri ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN branch_id = 'branch-2026-love' THEN current_vri ELSE 0 END), 0),
    COALESCE(SUM(current_vri), 0)
  INTO trust_total, empathy_total, love_total, vri_total
  FROM public.branch_progress
  WHERE user_id = NEW.user_id;

  -- user_vri 테이블 업데이트 또는 생성
  INSERT INTO public.user_vri (user_id, total_vri, trust_vri, empathy_vri, love_vri, last_updated)
  VALUES (NEW.user_id, vri_total, trust_total, empathy_total, love_total, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_vri = vri_total,
    trust_vri = trust_total,
    empathy_vri = empathy_total,
    love_vri = love_total,
    last_updated = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 브랜치 진행도 변경 시 VRI 자동 동기화 트리거
CREATE TRIGGER trigger_sync_vri_from_branch_progress
  AFTER INSERT OR UPDATE OF current_vri ON public.branch_progress
  FOR EACH ROW
  EXECUTE FUNCTION sync_vri_from_branch_progress();

-- 6. VRI 통계 뷰 (랭킹 조회 최적화)
CREATE OR REPLACE VIEW public.vri_leaderboard AS
SELECT 
  uv.user_id,
  u.wallet_address,
  uv.total_vri,
  uv.trust_vri,
  uv.empathy_vri,
  uv.love_vri,
  uv.global_rank,
  uv.last_updated,
  (SELECT COUNT(*) FROM public.branch_progress bp WHERE bp.user_id = uv.user_id AND bp.is_cleared = true) as cleared_branches
FROM public.user_vri uv
LEFT JOIN public.users u ON u.id = uv.user_id
ORDER BY uv.global_rank ASC NULLS LAST;

COMMENT ON TABLE public.user_vri IS '사용자별 VRI (Value Restoration Index) - 가치 회복 지수';
COMMENT ON TABLE public.branch_progress IS '브랜치별 진행도 - 2028년 멸망 시나리오 브랜치 진행 상태';
COMMENT ON COLUMN public.memory_cards.vri_value IS '이 포토카드(희망의 파편)가 기여하는 VRI 값';
COMMENT ON COLUMN public.memory_cards.value_type IS '가치 타입: trust, empathy, love';
COMMENT ON COLUMN public.memory_cards.branch_id IS '획득한 브랜치 ID';
COMMENT ON COLUMN public.memory_cards.branch_year IS '브랜치의 시간점: 2017, 2024, 2026';