-- ============================================
-- 升學大師 v4 完整資料庫架構
-- ============================================
-- Date: 2026-04-30
-- Description: Complete database schema for all phases

-- ============================================
-- Ability Records (Phase 2)
-- ============================================

CREATE TABLE IF NOT EXISTS public.ability_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,

  -- Basic Information
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) CHECK (category IN ('證照', '競賽', '專題', '其他')),
  portfolio_code VARCHAR(1) CHECK (portfolio_code IN ('A', 'B', 'C', 'D')),

  -- Details
  occurred_date DATE,
  organization VARCHAR(200),
  position VARCHAR(100),
  achievement_level VARCHAR(50),

  -- Attachment Links
  attachment_url VARCHAR(500),
  certificate_url VARCHAR(500),

  -- System Fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ability_records_student_id ON public.ability_records(student_id);
CREATE INDEX IF NOT EXISTS idx_ability_records_category ON public.ability_records(category);
CREATE INDEX IF NOT EXISTS idx_ability_records_portfolio_code ON public.ability_records(portfolio_code);

-- ============================================
-- Learning Portfolios (Phase 2)
-- ============================================

CREATE TABLE IF NOT EXISTS public.learning_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,

  -- Content
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  tags TEXT[],

  -- Statistics
  word_count INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,

  -- Status
  is_final BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,

  -- System Fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_portfolios_student_id ON public.learning_portfolios(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_portfolios_category ON public.learning_portfolios(category);

-- ============================================
-- Parent Invites (Phase 3)
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Invite Details
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  permissions JSONB DEFAULT '{"view_portfolio": true, "view_timeline": true, "view_achievements": true}',

  -- Individual Permissions
  can_view_portfolio BOOLEAN DEFAULT true,
  can_view_timeline BOOLEAN DEFAULT true,
  can_view_achievements BOOLEAN DEFAULT true,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),

  -- Timing
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_invites_student_id ON public.parent_invites(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_invites_invite_code ON public.parent_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_parent_invites_status ON public.parent_invites(status);

-- ============================================
-- Parent Profiles (Phase 3)
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Link
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,

  -- Basic Info
  relationship VARCHAR(20) NOT NULL CHECK (relationship IN ('父親', '母親', '監護人', '其他')),
  display_name VARCHAR(50),
  phone VARCHAR(20),

  -- Preferences
  notification_preferences JSONB DEFAULT '{"weekly": true, "monthly": true, "achievements": true}',
  language VARCHAR(10) DEFAULT 'zh-TW',

  -- System Fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_profiles_user_id ON public.parent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_profiles_student_id ON public.parent_profiles(student_id);

-- ============================================
-- Parent Reports (Phase 3)
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.parent_profiles(id) ON DELETE CASCADE,

  -- Report Type
  report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'custom')),
  content JSONB NOT NULL,
  summary TEXT,

  -- Payment
  is_paid BOOLEAN DEFAULT false,
  price DECIMAL(10, 2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'free' CHECK (payment_status IN ('free', 'pending', 'paid', 'failed')),

  -- Content Options
  include_portfolio BOOLEAN DEFAULT true,
  include_timeline BOOLEAN DEFAULT true,
  include_achievements BOOLEAN DEFAULT true,
  include_ai_insights BOOLEAN DEFAULT true,

  -- Sharing
  share_token VARCHAR(100) UNIQUE,
  share_expires_at TIMESTAMPTZ,
  share_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  -- Timing
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_reports_student_id ON public.parent_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_reports_parent_id ON public.parent_reports(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_reports_share_token ON public.parent_reports(share_token);

-- ============================================
-- Report Templates (Phase 3)
-- ============================================

CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template Details
  name VARCHAR(100) NOT NULL,
  description TEXT,
  template_type VARCHAR(20) NOT NULL CHECK (template_type IN ('weekly', 'monthly', 'custom')),

  -- Content Structure
  sections JSONB NOT NULL,
  styling JSONB DEFAULT '{}',

  -- System Fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Parent Payments (Phase 3)
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  report_id UUID NOT NULL REFERENCES public.parent_reports(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.parent_profiles(id) ON DELETE CASCADE,

  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TWD',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Payment Method
  payment_method VARCHAR(20) CHECK (payment_method IN ('line_pay', 'credit_card', 'bank_transfer', 'offline')),

  -- External References
  external_transaction_id VARCHAR(100),
  metadata JSONB DEFAULT '{}',

  -- Timing
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_parent_payments_report_id ON public.parent_payments(report_id);
CREATE INDEX IF NOT EXISTS idx_parent_payments_parent_id ON public.parent_payments(parent_id);

-- ============================================
-- Referral System (Phase 4)
-- ============================================

CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Code Details
  code VARCHAR(10) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,

  -- Statistics
  total_uses INTEGER DEFAULT 0,
  successful_conversions INTEGER DEFAULT 0,

  -- System Fields
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_referrer_id ON public.referral_codes(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);

-- ============================================
-- Referral Tracking (Phase 4)
-- ============================================

CREATE TABLE IF NOT EXISTS public.referral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),

  -- Rewards
  referrer_reward_xp INTEGER DEFAULT 0,
  referred_reward_xp INTEGER DEFAULT 0,

  -- System Fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referral_tracking_referral_code_id ON public.referral_tracking(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referred_user_id ON public.referral_tracking(referred_user_id);

-- ============================================
-- Share Analytics (Phase 4)
-- ============================================

CREATE TABLE IF NOT EXISTS public.share_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Share Details
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('achievement', 'weekly', 'department', 'goal')),
  platform VARCHAR(20) CHECK (platform IN ('facebook', 'twitter', 'line', 'instagram', 'copy_link')),

  -- Content Reference
  content_id UUID,
  share_token VARCHAR(100),

  -- Analytics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,

  -- Timing
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_analytics_user_id ON public.share_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_share_analytics_share_type ON public.share_analytics(share_type);

-- ============================================
-- Database Functions
-- ============================================

-- Generate Invite Code Function
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

-- Calculate Report Price Function
CREATE OR REPLACE FUNCTION calculate_report_price(
  p_parent_id UUID,
  p_report_type VARCHAR
)
RETURNS TABLE(is_free BOOLEAN, price DECIMAL) AS $$
DECLARE
  monthly_count INTEGER;
  is_free BOOLEAN;
  report_price DECIMAL;
BEGIN
  -- Count reports this month
  SELECT COUNT(*) INTO monthly_count
  FROM public.parent_reports
  WHERE parent_id = p_parent_id
    AND report_type = p_report_type
    AND created_at >= date_trunc('month', now());

  -- First report of month is free
  is_free := (monthly_count = 0);

  -- Set pricing
  IF p_report_type = 'weekly' THEN
    report_price := 49;
  ELSIF p_report_type = 'monthly' THEN
    report_price := 99;
  ELSE
    report_price := 149;
  END IF;

  IF is_free THEN
    report_price := 0;
  END IF;

  RETURN QUERY SELECT is_free, report_price;
END;
$$ LANGUAGE plpgsql;

-- Generate Referral Code Function
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

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.ability_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_analytics ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (simplified for deployment)
CREATE POLICY "Users can view their own ability records" ON public.ability_records
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.student_profiles WHERE id = student_id));

CREATE POLICY "Users can insert their own ability records" ON public.ability_records
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.student_profiles WHERE id = student_id));

CREATE POLICY "Users can update their own ability records" ON public.ability_records
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.student_profiles WHERE id = student_id));

CREATE POLICY "Users can delete their own ability records" ON public.ability_records
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.student_profiles WHERE id = student_id));

-- ============================================
-- Initial Data
-- ============================================

-- Insert default report templates
INSERT INTO public.report_templates (name, description, template_type, sections) VALUES
('週報範本', '每週學習歷程更新報告', 'weekly', '{"sections": ["achievements", "portfolio_updates", "ai_insights"]}'),
('月報範本', '每月綜合成長分析報告', 'monthly', '{"sections": ["monthly_summary", "detailed_analysis", "goals_progress"]}'),
('自訂報告', '客製化內容報告', 'custom', '{"sections": ["custom_content", "attachments", "recommendations"]}')
ON CONFLICT DO NOTHING;

-- ============================================
-- Triggers
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all relevant tables
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

CREATE TRIGGER update_parent_payments_updated_at BEFORE UPDATE ON public.parent_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_tracking_updated_at BEFORE UPDATE ON public.referral_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();