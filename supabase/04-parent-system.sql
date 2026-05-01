-- ============================================
-- 升學大師 v4 家長系統（Phase 3）
-- ============================================
-- Date: 2026-04-30
-- Description: Parent management and reporting system

-- ============================================
-- parent_profiles（家長資料）
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 用戶連結
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,

  -- 基本資料
  relationship VARCHAR(20) NOT NULL CHECK (relationship IN ('父親', '母親', '監護人', '其他')),
  display_name VARCHAR(50),
  phone VARCHAR(20),

  -- 偏好設定
  notification_preferences JSONB DEFAULT '{"weekly": true, "monthly": true, "achievements": true}',
  language VARCHAR(10) DEFAULT 'zh-TW',

  -- 系統欄位
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_profiles_user_id ON public.parent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_profiles_student_id ON public.parent_profiles(student_id);

-- ============================================
-- parent_reports（家長報告）
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  student_id UUID NOT NULL,
  parent_id UUID NOT NULL,

  -- 報告類型
  report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'custom')),

  -- 報告內容（JSONB 格式）
  content JSONB NOT NULL,

  -- 報告摘要
  summary TEXT,

  -- 付費狀態
  is_paid BOOLEAN DEFAULT false,
  price DECIMAL(10,0) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'free' CHECK (payment_status IN ('free', 'pending', 'paid', 'failed')),

  -- 生成設定
  include_portfolio BOOLEAN DEFAULT true,
  include_timeline BOOLEAN DEFAULT true,
  include_achievements BOOLEAN DEFAULT true,
  include_ai_insights BOOLEAN DEFAULT true,

  -- 分享設定
  share_token VARCHAR(100) UNIQUE,
  share_expires_at TIMESTAMPTZ,
  share_count SMALLINT DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  -- 系統欄位
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_reports_student_id ON public.parent_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_reports_parent_id ON public.parent_reports(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_reports_share_token ON public.parent_reports(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parent_reports_generated_at ON public.parent_reports(generated_at DESC);

-- ============================================
-- report_templates（報告模板）
-- ============================================

CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(100) NOT NULL,
  description TEXT,

  template_type VARCHAR(20) NOT NULL CHECK (template_type IN ('weekly', 'monthly', 'custom')),

  -- 模板內容
  sections JSONB NOT NULL,

  -- 樣式設定
  styling JSONB DEFAULT '{}',

  -- 狀態
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_templates_type ON public.report_templates(template_type);

-- ============================================
-- parent_payments（付款記錄）
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  report_id UUID NOT NULL REFERENCES public.parent_reports(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL,

  -- 付款資訊
  amount DECIMAL(10,0) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TWD',

  -- 付款狀態
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

  -- 付款方式
  payment_method VARCHAR(20) CHECK (payment_method IN ('line_pay', 'credit_card', 'bank_transfer', 'offline')),

  -- 外部交易 ID
  external_transaction_id VARCHAR(100),

  -- 元資料
  metadata JSONB DEFAULT '{}',

  -- 系統欄位
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_parent_payments_report_id ON public.parent_payments(report_id);
CREATE INDEX IF NOT EXISTS idx_parent_payments_parent_id ON public.parent_payments(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_payments_status ON public.parent_payments(status);

-- ============================================
-- 修改 student_profiles 添加 parent_ids 欄位索引
-- ============================================

-- 如果沒有 parent_ids 欄位則添加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_profiles' AND column_name = 'parent_ids'
  ) THEN
    ALTER TABLE public.student_profiles ADD COLUMN parent_ids UUID[] DEFAULT '{}';
  END IF;
END $$;

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_student_profiles_parent_ids ON public.student_profiles USING GIN(parent_ids);

-- ============================================
-- 觸發器：自動更新 updated_at
-- ============================================

-- parent_profiles
DROP TRIGGER IF EXISTS update_parent_profiles_updated_at ON public.parent_profiles;
CREATE TRIGGER update_parent_profiles_updated_at
  BEFORE UPDATE ON public.parent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- parent_reports
DROP TRIGGER IF EXISTS update_parent_reports_updated_at ON public.parent_reports;
CREATE TRIGGER update_parent_reports_updated_at
  BEFORE UPDATE ON public.parent_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- report_templates
DROP TRIGGER IF EXISTS update_report_templates_updated_at ON public.report_templates;
CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- parent_payments
DROP TRIGGER IF EXISTS update_parent_payments_updated_at ON public.parent_payments;
CREATE TRIGGER update_parent_payments_updated_at
  BEFORE UPDATE ON public.parent_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 預設報告模板
-- ============================================

INSERT INTO public.report_templates (name, description, template_type, sections, styling) VALUES
(
  '週報標準模板',
  '包含學習歷程更新、能力記錄變化、AI 洞察的標準週報',
  'weekly',
  '{
    "header": {"title": "學習成果週報", "show_period": true},
    "sections": [
      {"type": "summary", "title": "本週重點", "enabled": true},
      {"type": "ability_records", "title": "新增能力記錄", "enabled": true, "limit": 5},
      {"type": "portfolio_updates", "title": "學習歷程更新", "enabled": true},
      {"type": "ai_insights", "title": "AI 洞察與建議", "enabled": true},
      {"type": "next_steps", "title": "下週目標", "enabled": true}
    ]
  }'::jsonb,
  '{"theme": "professional", "color_scheme": "blue", "logo_position": "top-left"}'::jsonb
),
(
  '月報詳細模板',
  '包含完整學習成果、競賽活動、升學策略的詳細月報',
  'monthly',
  '{
    "header": {"title": "學習成果月報", "show_period": true, "show_student_info": true},
    "sections": [
      {"type": "executive_summary", "title": "執行摘要", "enabled": true},
      {"type": "ability_growth", "title": "能力成長分析", "enabled": true},
      {"type": "competition_activity", "title": "競賽與活動參與", "enabled": true},
      {"type": "portfolio_progress", "title": "學習歷程進度", "enabled": true},
      {"type": "strategy_analysis", "title": "升學策略分析", "enabled": true},
      {"type": "ai_recommendations", "title": "AI 智能建議", "enabled": true},
      {"type": "achievements", "title": "本月成就", "enabled": true}
    ]
  }'::jsonb,
  '{"theme": "professional", "color_scheme": "green", "include_charts": true}'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 輔助函數：生成邀請碼
-- ============================================

CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR AS $$
DECLARE
  code VARCHAR;
  exists BOOLEAN;
BEGIN
  -- 生成唯一的邀請碼格式：PARENT-XXXX-XXXX
  LOOP
    code := 'PARENT-' || upper(substring(encode(gen_random_bytes(4), 'base64'), 1, 4)) || '-' || upper(substring(encode(gen_random_bytes(4), 'base64'), 1, 4));

    -- 檢查是否已存在
    SELECT EXISTS(SELECT 1 FROM public.parent_invites WHERE invite_code = code) INTO exists;

    IF NOT EXISTS THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 輔助函數：生成分享令牌
-- ============================================

CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS VARCHAR AS $$
DECLARE
  token VARCHAR;
  exists BOOLEAN;
BEGIN
  -- 生成安全的分享令牌
  LOOP
    token := encode(gen_random_bytes(32), 'base64');

    -- 檢查是否已存在
    SELECT EXISTS(SELECT 1 FROM public.parent_reports WHERE share_token = token) INTO exists;

    IF NOT EXISTS THEN
      RETURN token;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 輔助函數：計算報告價格
-- ============================================

CREATE OR REPLACE FUNCTION calculate_report_price(report_type VARCHAR, is_monthly_free BOOLEAN DEFAULT false)
RETURNS DECIMAL AS $$
BEGIN
  -- 免費策略：每月第一份報告免費
  IF is_monthly_free THEN
    RETURN 0;
  END IF;

  -- 付費策略
  CASE report_type
    WHEN 'weekly' THEN RETURN 49;
    WHEN 'monthly' THEN RETURN 99;
    WHEN 'custom' THEN RETURN 149;
    ELSE RETURN 99;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 輔助函數：檢查本月免費配額
-- ============================================

CREATE OR REPLACE FUNCTION check_monthly_free_quota(parent_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  monthly_count SMALLINT;
BEGIN
  -- 計算本月已生成的報告數量
  SELECT COUNT(*) INTO monthly_count
  FROM public.parent_reports
  WHERE parent_id = parent_id
    AND report_type IN ('weekly', 'monthly')
    AND generated_at >= date_trunc('month', now())
    AND generated_at < date_trunc('month', now() + INTERVAL '1 month');

  -- 如果本月沒有生成過報告，則免費
  RETURN monthly_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 資料庫視圖：家長報告摘要
-- ============================================

CREATE OR REPLACE VIEW parent_reports_summary AS
SELECT
  pr.id,
  pr.student_id,
  pr.parent_id,
  pr.report_type,
  pr.generated_at,
  pr.is_paid,
  pr.price,
  pr.payment_status,
  pr.share_token,
  pp.display_name AS parent_name,
  pp.relationship,
  sp.group_code,
  sp.grade,
  sp.school_name,
  -- 提取關鍵內容
  pr.content->>'summary' AS summary,
  -- 新增記錄數量
  (pr.content->>'new_records_count')::SMALLINT AS new_records_count,
  -- AI 洞察數量
  jsonb_array_length(pr.content->'ai_insights') AS ai_insights_count
FROM public.parent_reports pr
JOIN public.parent_profiles pp ON pr.parent_id = pp.id
JOIN public.student_profiles sp ON pr.student_id = sp.id
WHERE pr.generated_at >= now() - INTERVAL '3 months'; -- 只顯示最近3個月的報告

COMMENT ON VIEW parent_reports_summary IS '家長報告摘要視圖，包含最新報告資訊和基本學生資料';
