-- ============================================
-- 升學大師 v4 完整資料庫架構 (一次性執行版本)
-- ============================================
-- Date: 2026-05-06
-- Description: Complete database schema with all tables

-- ============================================
-- 1. 基礎表：student_profiles（用戶擴展資料）
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

  -- 推薦系統 (Phase 4)
  referral_code TEXT UNIQUE,
  referred_by TEXT,

  -- 系統欄位
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_group_code ON public.student_profiles(group_code);
CREATE INDEX IF NOT EXISTS idx_student_referral_code ON public.student_profiles(referral_code);

-- ============================================
-- 2. 能力記錄表 (ability_records)
-- ============================================

CREATE TABLE IF NOT EXISTS public.ability_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,

  -- 分類
  category VARCHAR(20) NOT NULL CHECK (category IN ('capstone', 'certification', 'internship', 'competition', 'club', 'license', 'service', 'project', 'other')),

  -- 記錄內容
  title TEXT NOT NULL,
  description TEXT,
  portfolio_code VARCHAR(1) CHECK (portfolio_code IN ('A', 'B', 'C', 'D')),

  -- 詳細資訊
  occurred_date DATE,
  organization VARCHAR(200),
  position VARCHAR(100),
  achievement_level VARCHAR(50),

  -- 附件連結
  attachment_url VARCHAR(500),
  certificate_url VARCHAR(500),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ability_records_student_id ON public.ability_records(student_id);
CREATE INDEX IF NOT EXISTS idx_ability_records_category ON public.ability_records(category);
CREATE INDEX IF NOT EXISTS idx_ability_records_portfolio_code ON public.ability_records(portfolio_code);

-- ============================================
-- 3. 學習歷程表 (learning_portfolios)
-- ============================================

CREATE TABLE IF NOT EXISTS public.learning_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,

  -- 內容
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  tags TEXT[],

  -- 統計
  word_count INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,

  -- 狀態
  is_final BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_portfolios_student_id ON public.learning_portfolios(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_portfolios_category ON public.learning_portfolios(category);

-- ============================================
-- 4. 家長邀請表 (parent_invites)
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- 邀請詳情
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  permissions JSONB DEFAULT '{"view_portfolio": true, "view_timeline": true, "view_achievements": true}',

  -- 個別權限
  can_view_portfolio BOOLEAN DEFAULT true,
  can_view_timeline BOOLEAN DEFAULT true,
  can_view_achievements BOOLEAN DEFAULT true,

  -- 狀態
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),

  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_invites_student_id ON public.parent_invites(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_invites_invite_code ON public.parent_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_parent_invites_status ON public.parent_invites(status);

-- ============================================
-- 5. 家長資料表 (parent_profiles)
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,

  -- 基本資料
  relationship VARCHAR(20) NOT NULL CHECK (relationship IN ('父親', '母親', '監護人', '其他')),
  display_name VARCHAR(50),
  phone VARCHAR(20),

  -- 偏好設定
  notification_preferences JSONB DEFAULT '{"weekly": true, "monthly": true, "achievements": true}',
  language VARCHAR(10) DEFAULT 'zh-TW',

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_profiles_user_id ON public.parent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_profiles_student_id ON public.parent_profiles(student_id);

-- ============================================
-- 6. 家長報告表 (parent_reports)
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.parent_profiles(id) ON DELETE CASCADE,

  -- 報告類型
  report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'custom')),
  content JSONB NOT NULL,
  summary TEXT,

  -- 付款
  is_paid BOOLEAN DEFAULT false,
  price DECIMAL(10, 2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'free' CHECK (payment_status IN ('free', 'pending', 'paid', 'failed')),

  -- 內容選項
  include_portfolio BOOLEAN DEFAULT true,
  include_timeline BOOLEAN DEFAULT true,
  include_achievements BOOLEAN DEFAULT true,
  include_ai_insights BOOLEAN DEFAULT true,

  -- 分享
  share_token VARCHAR(100) UNIQUE,
  share_expires_at TIMESTAMPTZ,
  share_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_reports_student_id ON public.parent_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_reports_parent_id ON public.parent_reports(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_reports_share_token ON public.parent_reports(share_token);

-- ============================================
-- 7. 推薦碼表 (referral_codes)
-- ============================================

CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  code VARCHAR(10) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,

  total_uses INTEGER DEFAULT 0,
  successful_conversions INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_referrer_id ON public.referral_codes(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);

-- ============================================
-- 8. 推薦追蹤表 (referral_tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS public.referral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),

  referrer_reward_xp INTEGER DEFAULT 0,
  referred_reward_xp INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referral_tracking_referral_code_id ON public.referral_tracking(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referred_user_id ON public.referral_tracking(referred_user_id);

-- ============================================
-- 9. 分享分析表 (share_analytics)
-- ============================================

CREATE TABLE IF NOT EXISTS public.share_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('achievement', 'weekly', 'department', 'goal')),
  platform VARCHAR(20) CHECK (platform IN ('facebook', 'twitter', 'line', 'instagram', 'copy_link')),

  content_id UUID,
  share_token VARCHAR(100),

  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_analytics_user_id ON public.share_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_share_analytics_share_type ON public.share_analytics(share_type);

-- ============================================
-- 10. 推薦關係表 (referrals)
-- ============================================

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  reward_given BOOLEAN DEFAULT FALSE,
  reward_amount INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);

-- ============================================
-- 11. 分享追蹤表 (share_tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS public.share_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  share_type TEXT NOT NULL,
  platform TEXT,
  share_url TEXT,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 12. 學校排行榜表 (school_leaderboard)
-- ============================================

CREATE TABLE IF NOT EXISTS public.school_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  total_students INTEGER DEFAULT 0,
  total_achievements INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  ranking INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 資料庫函數
-- ============================================

-- 生成邀請碼函數
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  code VARCHAR(20);
  exists BOOLEAN;
BEGIN
  LOOP
    code := 'PARENT-' || upper(substring(encode(gen_random_bytes(4), 'hex'), 1, 4)) || '-' || upper(substring(encode(gen_random_bytes(4), 'hex'), 1, 4));

    SELECT EXISTS(SELECT 1 FROM public.parent_invites WHERE invite_code = code) INTO exists;

    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 生成推薦碼函數
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS VARCHAR(10) AS $$
DECLARE
  code VARCHAR(10);
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(encode(gen_random_bytes(3), 'hex'), 1, 6));

    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = code) INTO exists;

    IF NOT exists THEN
      INSERT INTO public.referral_codes (referrer_id, code)
      VALUES (p_user_id, code);

      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 更新時間戳觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 套用觸發器到所有相關表
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ability_records_updated_at BEFORE UPDATE ON public.ability_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_portfolios_updated_at BEFORE UPDATE ON public.learning_portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parent_invites_updated_at BEFORE UPDATE ON public.parent_invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parent_profiles_updated_at BEFORE UPDATE ON public.parent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parent_reports_updated_at BEFORE UPDATE ON public.parent_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_tracking_updated_at BEFORE UPDATE ON public.referral_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- 啟用 RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ability_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_leaderboard ENABLE ROW LEVEL SECURITY;

-- 基礎 RLS 政策
CREATE POLICY "Users can view their own profile" ON public.student_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.student_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.student_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own ability records" ON public.ability_records
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.student_profiles WHERE id = student_id));

CREATE POLICY "Users can insert their own ability records" ON public.ability_records
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.student_profiles WHERE id = student_id));

CREATE POLICY "Users can update their own ability records" ON public.ability_records
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.student_profiles WHERE id = student_id));

CREATE POLICY "Users can delete their own ability records" ON public.ability_records
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.student_profiles WHERE id = student_id));

CREATE POLICY "Users can view their own learning portfolios" ON public.learning_portfolios
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.student_profiles WHERE id = student_id));

CREATE POLICY "Users can insert their own learning portfolios" ON public.learning_portfolios
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.student_profiles WHERE id = student_id));

CREATE POLICY "Users can update their own learning portfolios" ON public.learning_portfolios
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.student_profiles WHERE id = student_id));

CREATE POLICY "Users can delete their own learning portfolios" ON public.learning_portfolios
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.student_profiles WHERE id = student_id));

-- ============================================
-- 完成訊息
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '升學大師 v4 資料庫架構建立完成！';
  RAISE NOTICE '已建立 12 個主要資料表';
  RASE NOTICE '已建立索引、觸發器和 RLS 政策';
  RAISE NOTICE '資料庫準備就緒！';
END $$;