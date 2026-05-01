-- 升學大師 v4 資料庫 Schema（Supabase 正確版）
-- Date: 2026-04-30
-- 方案：不修改 auth.users，用 public.student_profiles

-- ============================================
-- 公共表：student_profiles（用戶擴展資料）
-- ============================================

CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

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
-- ability_records（能力記錄）
-- ============================================

CREATE TABLE IF NOT EXISTS public.ability_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,

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
-- learning_portfolios（學習歷程自述）
-- ============================================

CREATE TABLE IF NOT EXISTS public.learning_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,

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
-- pathway_scoring（校系計分公式）
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

CREATE INDEX IF NOT EXISTS idx_pathway_scoring_school_dept ON public.pathway_scoring(school_code, department_code, year);
CREATE INDEX IF NOT EXISTS idx_pathway_scoring_year ON public.pathway_scoring(year);

-- ============================================
-- external_competitions（外部競賽資料庫）
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
-- group_knowledge（20 類群知識庫）
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
-- subject_strategies（116 選考策略）
-- ============================================

CREATE TABLE IF NOT EXISTS public.subject_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,

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
-- companion_matches（夥伴配對）
-- ============================================

CREATE TABLE IF NOT EXISTS public.companion_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_a UUID NOT NULL,
  student_b UUID NOT NULL,

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
-- parent_invites（家長邀請）
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id UUID NOT NULL,
  parent_id UUID,

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
