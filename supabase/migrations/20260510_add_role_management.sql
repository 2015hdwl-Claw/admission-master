-- ============================================
-- 角色管理系統 Migration
-- 升學大師 v2.0 - 用戶角色系統
-- Date: 2026-05-10
-- ============================================

-- ============================================
-- 1. 用戶角色追蹤表 (user_roles)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,

  -- 角色系統
  current_role VARCHAR(20) NOT NULL CHECK (current_role IN ('explorer', 'pathfinder', 'architect', 'catalyst', 'trailblazer')),
  level SMALLINT DEFAULT 1 CHECK (level BETWEEN 1 AND 15),
  experience_points INTEGER DEFAULT 0,

  -- 多角色支援
  secondary_roles TEXT[] DEFAULT '{}', -- ['mentor', 'community_leader']

  -- 群體隸屬
  group_affiliation VARCHAR(20), -- '商管群', '外語群', '工科群', etc.

  -- 系統欄位
  joined_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- 索引優化
  CONSTRAINT user_roles_user_id_unique UNIQUE (user_id)
);

-- 創建索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_user_roles_current_role ON public.user_roles(current_role, level);
CREATE INDEX IF NOT EXISTS idx_user_roles_group_affiliation ON public.user_roles(group_affiliation);
CREATE INDEX IF NOT EXISTS idx_user_roles_xp ON public.user_roles(experience_points DESC);

-- ============================================
-- 2. 角色升級歷史表 (role_evolution)
-- ============================================

CREATE TABLE IF NOT EXISTS public.role_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- 角色轉換記錄
  from_role VARCHAR(20) CHECK (from_role IN ('explorer', 'pathfinder', 'architect', 'catalyst', 'trailblazer', NULL)),
  to_role VARCHAR(20) NOT NULL CHECK (to_role IN ('explorer', 'pathfinder', 'architect', 'catalyst', 'trailblazer')),

  -- 升級詳情
  upgraded_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT, -- 升級原因描述
  milestone_achieved TEXT, -- 達成的里程碑

  -- 經驗值記錄
  xp_at_upgrade INTEGER DEFAULT 0,
  level_at_upgrade SMALLINT DEFAULT 1,

  -- 索引
  CONSTRAINT role_evolution_user_id_unique UNIQUE (user_id, upgraded_at)
);

CREATE INDEX IF NOT EXISTS idx_role_evolution_user_id ON public.role_evolution(user_id, upgraded_at DESC);
CREATE INDEX IF NOT EXISTS idx_role_evolution_to_role ON public.role_evolution(to_role);

-- ============================================
-- 3. 角色成就系統表 (role_achievements)
-- ============================================

CREATE TABLE IF NOT EXISTS public.role_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- 成就類型
  achievement_type VARCHAR(50) NOT NULL,
  -- 'discovery_first', 'path_created', 'blueprint_complete', 'first_execution',
  -- 'mentor_first', 'community_leader', 'story_shared', etc.

  -- 成就資料
  achievement_data JSONB DEFAULT '{}',
  -- 包含成就詳情：{title, description, icon_url, rarity, bonus_xp}

  -- 解鎖資訊
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  is_displayed BOOLEAN DEFAULT true, -- 是否在個人頁面顯示

  -- 社交相關
  share_count SMALLINT DEFAULT 0, -- 分享次數
  congratulation_count SMALLINT DEFAULT 0, -- 祝賀數量

  CONSTRAINT role_achievements_unique UNIQUE (user_id, achievement_type)
);

CREATE INDEX IF NOT EXISTS idx_role_achievements_user_id ON public.role_achievements(user_id, unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_role_achievements_type ON public.role_achievements(achievement_type);

-- ============================================
-- 4. 經驗值獲得記錄表 (xp_history)
-- ============================================

CREATE TABLE IF NOT EXISTS public.xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- 經驗值來源
  xp_source VARCHAR(30) NOT NULL,
  -- 'read_pipeline', 'visit_group_page', 'complete_training',
  -- 'record_experience', 'create_blueprint', 'execute_action', etc.

  -- 經驗值詳情
  xp_amount INTEGER NOT NULL, -- 正數為獲得，負數為扣除
  description TEXT, -- 獲得原因描述

  -- 關聯資料
  related_resource_type VARCHAR(20), -- 'ability_record', 'blueprint', 'competition', etc.
  related_resource_id UUID,

  -- 時間記錄
  earned_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON public.xp_history(user_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_history_source ON public.xp_history(xp_source);

-- ============================================
-- 5. 擴充 student_profiles 表以支援角色系統
-- ============================================

-- 新增角色相關欄位到現有的 student_profiles 表
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS current_role VARCHAR(20)
  CHECK (current_role IN ('explorer', 'pathfinder', 'architect', 'catalyst', 'trailblazer'))
  DEFAULT 'explorer';

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS level SMALLINT DEFAULT 1;

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0;

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS onboarding_step SMALLINT DEFAULT 0;

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}';

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS onboarding_last_updated TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS onboarding_skipped_at TIMESTAMPTZ;

-- ============================================
-- 6. 創建預設角色記錄的觸發器
-- ============================================

-- 當新用戶註冊時，自動創建 explorer 角色記錄
CREATE OR REPLACE FUNCTION create_default_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, current_role, level, experience_points)
  VALUES (NEW.id, 'explorer', 1, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- 同時更新 student_profiles 的預設角色
  UPDATE public.student_profiles
  SET
    current_role = 'explorer',
    level = 1,
    experience_points = 0
  WHERE user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 創建觸發器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_role();

-- ============================================
-- 7. 創建角色升級函數
-- ============================================

CREATE OR REPLACE FUNCTION upgrade_user_role(
  p_user_id UUID,
  p_new_role VARCHAR(20)
)
RETURNS JSONB AS $$
DECLARE
  v_current_role VARCHAR(20);
  v_current_level SMALLINT;
  v_current_xp INTEGER;
  v_upgrade_record_id UUID;
BEGIN
  -- 獲取當前角色資訊
  SELECT current_role, level, experience_points
  INTO v_current_role, v_current_level, v_current_xp
  FROM public.user_roles
  WHERE user_id = p_user_id;

  -- 檢查是否已經是該角色
  IF v_current_role = p_new_role THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Already has this role',
      'current_role', v_current_role
    );
  END IF;

  -- 更新用戶角色
  UPDATE public.user_roles
  SET
    current_role = p_new_role,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- 同步更新 student_profiles
  UPDATE public.student_profiles
  SET
    current_role = p_new_role,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- 記錄升級歷史
  INSERT INTO public.role_evolution (
    user_id, from_role, to_role,
    xp_at_upgrade, level_at_upgrade,
    reason, milestone_achieved
  ) VALUES (
    p_user_id, v_current_role, p_new_role,
    v_current_xp, v_current_level,
    'Role upgrade completed', 'Reached ' || p_new_role || ' requirements'
  )
  RETURNING id INTO v_upgrade_record_id;

  -- 返回成功結果
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Role upgraded successfully',
    'from_role', v_current_role,
    'to_role', p_new_role,
    'upgrade_id', v_upgrade_record_id,
    'upgraded_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. 創建經驗值增加函數
-- ============================================

CREATE OR REPLACE FUNCTION add_user_experience(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source VARCHAR(30),
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_current_xp INTEGER;
  v_current_level SMALLINT;
  v_new_xp INTEGER;
  v_new_level SMALLINT;
  v_level_up_threshold INTEGER;
  v_current_role VARCHAR(20);
BEGIN
  -- 獲取當前經驗值和等級
  SELECT experience_points, level, current_role
  INTO v_current_xp, v_current_level, v_current_role
  FROM public.user_roles
  WHERE user_id = p_user_id;

  -- 計算新經驗值
  v_new_xp := v_current_xp + p_xp_amount;

  -- 檢查是否升等 (每 100 XP 升一級)
  v_level_up_threshold := v_current_level * 100;

  IF v_new_xp >= v_level_up_threshold THEN
    v_new_level := v_current_level + 1;

    -- 更新等級
    UPDATE public.user_roles
    SET level = v_new_level
    WHERE user_id = p_user_id;

    -- 同步更新 student_profiles
    UPDATE public.student_profiles
    SET level = v_new_level
    WHERE user_id = p_user_id;
  END IF;

  -- 更新經驗值
  UPDATE public.user_roles
  SET
    experience_points = v_new_xp,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- 同步更新 student_profiles
  UPDATE public.student_profiles
  SET
    experience_points = v_new_xp,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- 記錄經驗值歷史
  INSERT INTO public.xp_history (
    user_id, xp_source, xp_amount, description, earned_at
  ) VALUES (
    p_user_id, p_source, p_xp_amount, p_description, now()
  );

  -- 返回結果
  RETURN jsonb_build_object(
    'success', true,
    'xp_added', p_xp_amount,
    'xp_total', v_new_xp,
    'level', v_new_level,
    'leveled_up', (v_new_level > v_current_level),
    'current_role', v_current_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. 啟用 RLS (Row Level Security)
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;

-- user_roles RLS 政策
DROP POLICY IF EXISTS "Users can view own role data" ON public.user_roles;
CREATE POLICY "Users can view own role data"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own role data" ON public.user_roles;
CREATE POLICY "Users can update own role data"
  ON public.user_roles FOR UPDATE
  USING (auth.uid() = user_id);

-- role_evolution RLS 政策
DROP POLICY IF EXISTS "Users can view own evolution history" ON public.role_evolution;
CREATE POLICY "Users can view own evolution history"
  ON public.role_evolution FOR SELECT
  USING (auth.uid() = user_id);

-- role_achievements RLS 政策
DROP POLICY IF EXISTS "Users can view own achievements" ON public.role_achievements;
CREATE POLICY "Users can view own achievements"
  ON public.role_achievements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own achievements" ON public.role_achievements;
CREATE POLICY "Users can manage own achievements"
  ON public.role_achievements FOR ALL
  USING (auth.uid() = user_id);

-- xp_history RLS 政策
DROP POLICY IF EXISTS "Users can view own xp history" ON public.xp_history;
CREATE POLICY "Users can view own xp history"
  ON public.xp_history FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 10. 初始化現有用戶的預設角色
-- ============================================

-- 為所有現有用戶創建預設的 explorer 角色
INSERT INTO public.user_roles (user_id, current_role, level, experience_points)
SELECT
  user_id,
  'explorer',
  CASE
    WHEN total_records > 10 THEN 5
    WHEN total_records > 5 THEN 3
    WHEN total_records > 0 THEN 2
    ELSE 1
  END,
  CASE
    WHEN total_records > 10 THEN 400
    WHEN total_records > 5 THEN 200
    WHEN total_records > 0 THEN 50
    ELSE 0
  END
FROM public.student_profiles
ON CONFLICT (user_id) DO NOTHING;

-- 更新現有用戶的 student_profiles 角色資訊
UPDATE public.student_profiles
SET
  current_role = 'explorer',
  level = CASE
    WHEN total_records > 10 THEN 5
    WHEN total_records > 5 THEN 3
    WHEN total_records > 0 THEN 2
    ELSE 1
  END,
  experience_points = CASE
    WHEN total_records > 10 THEN 400
    WHEN total_records > 5 THEN 200
    WHEN total_records > 0 THEN 50
    ELSE 0
  END
WHERE current_role IS NULL;

-- ============================================
-- Migration 完成
-- ============================================

-- 添加註釋說明
COMMENT ON TABLE public.user_roles IS '用戶角色追蹤表：管理用戶的升學角色、等級和經驗值';
COMMENT ON TABLE public.role_evolution IS '角色升級歷史表：記錄用戶角色演化的完整歷史';
COMMENT ON TABLE public.role_achievements IS '角色成就系統表：追蹤用戶解鎖的所有成就和里程碑';
COMMENT ON TABLE public.xp_history IS '經驗值獲得記錄表：詳細記錄用戶獲得經驗值的來源和時間';

COMMENT ON FUNCTION public.upgrade_user_role IS '升級用戶角色函數：處理角色轉換、歷史記錄和資料同步';
COMMENT ON FUNCTION public.add_user_experience IS '增加用戶經驗值函數：處理經驗值增加、等級提升和歷史記錄';