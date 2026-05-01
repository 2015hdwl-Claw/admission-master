-- 升學大師 v4 資料庫 Schema
-- Supabase PostgreSQL
-- Date: 2026-04-30

-- ============================================
-- 1. 擴充 auth.users 表
-- ============================================
-- （在 Supabase Dashboard 手動新增欄位或用 SQL）

ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role VARCHAR(20) CHECK (role IN ('student', 'parent', 'teacher', 'admin'));
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.student_profiles(id);

-- ============================================
-- 2. student_profiles（能力帳戶主表）
-- ============================================

CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,

  -- 基本資料
  group_code VARCHAR(2) NOT NULL CHECK (group_code IN ('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20')),
  grade SMALLINT NOT NULL CHECK (grade BETWEEN 1 AND 5),
  school_name VARCHAR(100),

  -- 升學目標
  target_pathways TEXT[] DEFAULT '{}',
  target_schools JSONB DEFAULT '{}',

  -- 能力帳戶彙總
  total_records SMALLINT DEFAULT 0,
  total_bonus_percent DECIMAL(5,2) DEFAULT 0,

  -- 社交功能
  partner_ids UUID[] DEFAULT '{}',
  warmth_points SMALLINT DEFAULT 0,
  parent_ids UUID[] DEFAULT '{}',

  -- 系統欄位
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_group_code ON public.student_profiles(group_code);

-- ============================================
-- 3. ability_records_records（能力記錄）
-- ============================================

CREATE TABLE IF NOT EXISTS public.ability_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,

  -- 分類
  category VARCHAR(20) NOT NULL CHECK (category IN ('capstone', 'certification', 'internship', 'competition', 'club', 'license', 'service', 'project', 'other')),

  -- 記錄內容
  title TEXT NOT NULL,
  description TEXT,
  occurred_date DATE,
  semester VARCHAR(10),

  -- 學習歷程代碼
  portfolio_code VARCHAR(5) CHECK (portfolio_code IN (NULL, 'A', 'B-1', 'B-2', 'C-1', 'C-2', 'C-3', 'C-4', 'C-5', 'C-6', 'C-7', 'C-8', 'D-1', 'D-2', 'D-3')),

  -- 升學價值計算
  scoring_value JSONB DEFAULT '{}',

  -- 學習歷程欄位
  process_description TEXT,
  reflection TEXT,
  evidence_url TEXT,

  -- 證照專用欄位
  cert_level VARCHAR(10) CHECK (cert_level IN (NULL, '丙級', '乙級', '甲級', '單一級')),
  cert_number VARCHAR(50),

  -- 競賽專用欄位
  competition_level VARCHAR(20) CHECK (competition_level IN (NULL, '校內', '區賽', '全國', '國際')),
  competition_award TEXT,

  -- 專題專用欄位
  capstone_type VARCHAR(30),
  capstone_duration VARCHAR(20),

  -- 系統欄位
  tags TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ability_records_student_id ON public.ability_records(student_id);
CREATE INDEX IF NOT EXISTS idx_ability_records_category ON public.ability_records(category);
CREATE INDEX IF NOT EXISTS idx_ability_records_portfolio_code ON public.ability_records(portfolio_code);

-- ============================================
-- 4. learning_portfolios（學習歷程自述）
-- ============================================

CREATE TABLE IF NOT EXISTS public.learning_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,

  title TEXT DEFAULT '我的學習歷程自述',
  content TEXT NOT NULL,
  version SMALLINT DEFAULT 1,
  word_count SMALLINT,

  ai_suggestions TEXT[],
  quality_grade VARCHAR(1) CHECK (quality_grade IN ('A', 'B', 'C', 'D')),

  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_portfolios_student_id ON public.learning_portfolios(student_id);

-- ============================================
-- 5. pathway_scoring（校系計分公式）
-- ============================================

CREATE TABLE IF NOT EXISTS public.pathway_scoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  school_code VARCHAR(10) NOT NULL,
  department_code VARCHAR(20) NOT NULL,
  year SMALLINT NOT NULL,

  -- 招生管道
  pathway_type VARCHAR(20) NOT NULL CHECK (pathway_type IN ('甄選入學', '登記分發', '技優甄審', '技優保送', '繁星推薦', '個人申請')),

  -- 計分公式
  exam_weight DECIMAL(5,2),
  portfolio_weight DECIMAL(5,2),
  total_score DECIMAL(5,2),

  -- 116 選考專用
  subjects_required TEXT[],
  subject_weights JSONB,
  min_subjects SMALLINT DEFAULT 2,

  -- 優待加分規則
  bonus_rules JSONB,
  max_bonus_percent DECIMAL(5,2) DEFAULT 25.0,

  -- 錄取門檻
  min_requirements JSONB,

  -- 元資料
  school_name TEXT,
  department_name TEXT,
  admission_quota SMALLINT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_code, department_code, year, pathway_type)
);

CREATE INDEX IF NOT EXISTS idx_pathway_scoring_school_dept ON public.pathway_scoring(school_code);
CREATE INDEX IF NOT EXISTS idx_pathway_scoring_department_code ON public.pathway_scoring(department_code);
CREATE INDEX IF NOT EXISTS idx_pathway_scoring_year ON public.pathway_scoring(year);

-- ============================================
-- 6. external_competitions（外部競賽資料庫）
-- ============================================

CREATE TABLE IF NOT EXISTS public.external_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  organizer TEXT,

  level VARCHAR(20) CHECK (level IN ('校內', '區賽', '全國', '國際')),
  competition_type VARCHAR(30) CHECK (competition_type IN ('hackathon', 'business', 'design', 'tech', 'academic', 'art', 'language', 'skill')),

  suitable_groups TEXT[],
  suitable_grades SMALLINT[],

  portfolio_mapping VARCHAR(5) CHECK (portfolio_mapping IN ('C-4', 'D-3')),
  scoring_impact TEXT,

  deadline DATE,
  start_date DATE,
  registration_deadline DATE,

  url TEXT,
  poster_url TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_external_competitions_type ON public.external_competitions(competition_type);
CREATE INDEX IF NOT EXISTS idx_external_competitions_groups ON public.external_competitions(suitable_groups);
CREATE INDEX IF NOT EXISTS idx_external_competitions_deadline ON public.external_competitions(deadline) WHERE is_active = true;

-- ============================================
-- 7. group_knowledge（20 類群知識庫）
-- ============================================

CREATE TABLE IF NOT EXISTS public.group_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  group_code VARCHAR(2) NOT NULL UNIQUE,
  group_name TEXT NOT NULL,
  description TEXT,

  certificate_types JSONB,
  has_certificate_system BOOLEAN DEFAULT true,

  competition_types JSONB,

  career_paths JSONB,
  cross_group_opportunities JSONB,

  structural_advantages TEXT[],
  structural_challenges TEXT[],

  annual_quota SMALLINT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_knowledge_code ON public.group_knowledge(group_code);

-- ============================================
-- 8. subject_strategies（116 選考策略）
-- ============================================

CREATE TABLE IF NOT EXISTS public.subject_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,

  target_schools JSONB NOT NULL,

  recommended_combination TEXT[],
  coverage_score DECIMAL(5,2),
  covered_targets SMALLINT,
  total_targets SMALLINT,

  risk_assessment JSONB,
  alternatives JSONB DEFAULT '[]',
  gaps JSONB DEFAULT '[]',

  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subject_strategies_student_id ON public.subject_strategies(student_id);

-- ============================================
-- 9. companion_matches（夥伴配對）
-- ============================================

CREATE TABLE IF NOT EXISTS public.companion_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_a UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  student_b UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,

  group_code VARCHAR(2),
  grade_diff SMALLINT,

  trust_level SMALLINT DEFAULT 0,
  trust_milestones JSONB DEFAULT '{}',

  messages_sent SMALLINT DEFAULT 0,
  warmth_given SMALLINT DEFAULT 0,
  warmth_received SMALLINT DEFAULT 0,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CHECK (student_a < student_b)
);

CREATE INDEX IF NOT EXISTS idx_companion_matches_student_a ON public.companion_matches(student_a) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_companion_matches_student_b ON public.companion_matches(student_b) WHERE is_active = true;

-- ============================================
-- 10. parent_invites（家長邀請）
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES auth.users(id),

  invite_code VARCHAR(20) UNIQUE NOT NULL,

  can_view_portfolio BOOLEAN DEFAULT true,
  can_view_timeline BOOLEAN DEFAULT true,
  can_view_achievements BOOLEAN DEFAULT true,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_parent_invites_code ON public.parent_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_parent_invites_student_id ON public.parent_invites(student_id);

-- ============================================
-- 啟用 Row Level Security
-- ============================================

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ability_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_invites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 政策
-- ============================================

-- student_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.student_profiles;
CREATE POLICY "Users can view own profile"
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.student_profiles;
CREATE POLICY "Users can update own profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.student_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ability_records
DROP POLICY IF EXISTS "Users can view own records" ON public.ability_records;
CREATE POLICY "Users can view own records"
  ON public.ability_records FOR SELECT
  USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own records" ON public.ability_records;
CREATE POLICY "Users can insert own records"
  ON public.ability_records FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own records" ON public.ability_records;
CREATE POLICY "Users can update own records"
  ON public.ability_records FOR UPDATE
  USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete own records" ON public.ability_records;
CREATE POLICY "Users can delete own records"
  ON public.ability_records FOR DELETE
  USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

-- learning_portfolios
DROP POLICY IF EXISTS "Users can view own portfolios" ON public.learning_portfolios;
CREATE POLICY "Users can view own portfolios"
  ON public.learning_portfolios FOR SELECT
  USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own portfolios" ON public.learning_portfolios;
CREATE POLICY "Users can manage own portfolios"
  ON public.learning_portfolios FOR ALL
  USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

-- subject_strategies
DROP POLICY IF EXISTS "Users can manage own strategies" ON public.subject_strategies;
CREATE POLICY "Users can manage own strategies"
  ON public.subject_strategies FOR ALL
  USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

-- companion_matches
DROP POLICY IF EXISTS "Users can view own matches" ON public.companion_matches;
CREATE POLICY "Users can view own matches"
  ON public.companion_matches FOR SELECT
  USING (
    student_a IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()) OR
    student_b IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own matches" ON public.companion_matches;
CREATE POLICY "Users can insert own matches"
  ON public.companion_matches FOR INSERT
  WITH CHECK (
    student_a IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()) OR
    student_b IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
  );

-- parent_invites
DROP POLICY IF EXISTS "Students can view own invites" ON public.parent_invites;
CREATE POLICY "Students can view own invites"
  ON public.parent_invites FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()) OR
    auth.uid() = parent_id
  );

-- 公開表策略
ALTER TABLE public.group_knowledge ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access to group_knowledge" ON public.group_knowledge;
CREATE POLICY "Public read access to group_knowledge"
  ON public.group_knowledge FOR SELECT
  USING (true);

ALTER TABLE public.pathway_scoring ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access to pathway_scoring" ON public.pathway_scoring;
CREATE POLICY "Public read access to pathway_scoring"
  ON public.pathway_scoring FOR SELECT
  USING (true);

ALTER TABLE public.external_competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access to external_competitions" ON public.external_competitions;
CREATE POLICY "Public read access to external_competitions"
  ON public.external_competitions FOR SELECT
  USING (true);
