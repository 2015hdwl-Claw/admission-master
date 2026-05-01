-- ============================================
-- 升學大師 v4 RLS Policies（正確版）
-- ============================================
-- 原則：不修改 auth.users，RLS policy 透過 JOIN student_profiles 來控制權限

-- ============================================
-- 1. 啟用 Row Level Security
-- ============================================

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ability_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pathway_scoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_competitions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. student_profiles RLS
-- ============================================

-- 用戶只能查看自己的 profile（通過 auth.uid() JOIN）
DROP POLICY IF EXISTS "Students can view own profile" ON public.student_profiles;
CREATE POLICY "Students can view own profile"
  ON public.student_profiles FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM auth.users
    WHERE raw_user_meta_data->>'role' = 'student'
  ));

-- DROP POLICY IF EXISTS "Users can update own profile" ON public.student_profiles;
-- CREATE POLICY "Users can update own profile"
--   ON public.student_profiles FOR UPDATE
--   USING (auth.uid() IN (
--     SELECT id FROM auth.users
--     WHERE raw_user_meta_data->>'role' = 'student'
--   ));

-- ============================================
-- 3. ability_records RLS
-- ============================================

-- 用戶只能查看自己的記錄（通過 student_profiles JOIN）
DROP POLICY IF EXISTS "Students can view own records" ON public.ability_records;
CREATE POLICY "Students can view own records"
  ON public.ability_records FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can insert own records" ON public.ability_records;
CREATE POLICY "Students can insert own records"
  ON public.ability_records FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can update own records" ON public.ability_records;
CREATE POLICY "Students can update own records"
  ON public.ability_records FOR UPDATE
  USING (
    student_id IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can delete own records" ON public.ability_records;
CREATE POLICY "Students can delete own records"
  ON public.ability_records FOR DELETE
  USING (
    student_id IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 4. learning_portfolios RLS
-- ============================================

DROP POLICY IF EXISTS "Students can view own portfolios" ON public.learning_portfolios;
CREATE POLICY "Students can view own portfolios"
  ON public.learning_portfolios FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can manage own portfolios" ON public.learning_portfolios;
CREATE POLICY "Students can manage own portfolios"
  ON public.learning_portfolios FOR ALL
  WITH CHECK (
    student_id IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 5. subject_strategies RLS
-- ============================================

DROP POLICY IF EXISTS "Students can manage own strategies" ON public.subject_strategies;
CREATE POLICY "Students can manage own strategies"
  ON public.subject_strategies FOR ALL
  WITH CHECK (
    student_id IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 6. companion_matches RLS
-- ============================================

DROP POLICY IF EXISTS "Students can view own matches" ON public.companion_matches;
CREATE POLICY "Students can view own matches"
  ON public.companion_matches FOR SELECT
  USING (
    student_a IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    ) OR
    student_b IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can insert own matches" ON public.companion_matches;
CREATE POLICY "Students can insert own matches"
  ON public.companion_matches FOR INSERT
  WITH CHECK (
    student_a IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    ) OR
    student_b IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 7. parent_invites RLS
-- ============================================

DROP POLICY IF EXISTS "Students can view own invites" ON public.parent_invites;
CREATE POLICY "Students can view own invites"
  ON public.parent_invites FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    ) OR
    auth.uid() = parent_id
  );

-- ============================================
-- 8. 公開表 RLS（所有人都可以讀取）
-- ============================================

-- group_knowledge
DROP POLICY IF EXISTS "Public read access to group_knowledge" ON public.group_knowledge;
CREATE POLICY "Public read access to group_knowledge"
  ON public.group_knowledge FOR SELECT
  USING (true);

-- pathway_scoring
DROP POLICY IF EXISTS "Public read access to pathway_scoring" ON public.pathway_scoring;
CREATE POLICY "Public read access to pathway_scoring"
  ON public.pathway_scoring FOR SELECT
  USING (true);

-- external_competitions
DROP POLICY IF EXISTS "Public read access to external_competitions" ON public.external_competitions;
CREATE POLICY "Public read access to external_competitions"
  ON public.external_competitions FOR SELECT
  USING (true);
