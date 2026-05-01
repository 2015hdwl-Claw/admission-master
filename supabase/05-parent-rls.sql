-- ============================================
-- 升學大師 v4 家長系統 RLS Policies（Phase 3）
-- ============================================
-- Date: 2026-04-30
-- Description: Security policies for parent system

-- ============================================
-- 1. 啟用 Row Level Security
-- ============================================

ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. parent_profiles RLS
-- ============================================

-- 家長可以查看自己的資料
DROP POLICY IF EXISTS "Parents can view own profile" ON public.parent_profiles;
CREATE POLICY "Parents can view own profile"
  ON public.parent_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 學生可以查看連結到自己的家長資料
DROP POLICY IF EXISTS "Students can view linked parents" ON public.parent_profiles;
CREATE POLICY "Students can view linked parents"
  ON public.parent_profiles FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    )
  );

-- 家長可以更新自己的資料
DROP POLICY IF EXISTS "Parents can update own profile" ON public.parent_profiles;
CREATE POLICY "Parents can update own profile"
  ON public.parent_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 系統可以插入家長資料（通過邀請碼註冊）
DROP POLICY IF EXISTS "System can insert parent profiles" ON public.parent_profiles;
CREATE POLICY "System can insert parent profiles"
  ON public.parent_profiles FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 3. parent_reports RLS
-- ============================================

-- 家長可以查看自己的報告
DROP POLICY IF EXISTS "Parents can view own reports" ON public.parent_reports;
CREATE POLICY "Parents can view own reports"
  ON public.parent_reports FOR SELECT
  USING (parent_id IN (
    SELECT id FROM public.parent_profiles
    WHERE user_id = auth.uid()
  ));

-- 學生可以查看關於自己的報告
DROP POLICY IF EXISTS "Students can view own reports" ON public.parent_reports;
CREATE POLICY "Students can view own reports"
  ON public.parent_reports FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    )
  );

-- 系統可以插入報告（自動生成）
DROP POLICY IF EXISTS "System can insert reports" ON public.parent_reports;
CREATE POLICY "System can insert reports"
  ON public.parent_reports FOR INSERT
  WITH CHECK (true);

-- 系統可以更新報告（付費狀態等）
DROP POLICY IF EXISTS "System can update reports" ON public.parent_reports;
CREATE POLICY "System can update reports"
  ON public.parent_reports FOR UPDATE
  USING (true);

-- ============================================
-- 4. report_templates RLS
-- ============================================

-- 所有認證用戶都可以查看報告模板
DROP POLICY IF EXISTS "Authenticated users can view templates" ON public.report_templates;
CREATE POLICY "Authenticated users can view templates"
  ON public.report_templates FOR SELECT
  USING (auth.role() = 'authenticated');

-- 只有系統可以管理模板
DROP POLICY IF EXISTS "System can manage templates" ON public.report_templates;
CREATE POLICY "System can manage templates"
  ON public.report_templates FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 5. parent_payments RLS
-- ============================================

-- 家長可以查看自己的付款記錄
DROP POLICY IF EXISTS "Parents can view own payments" ON public.parent_payments;
CREATE POLICY "Parents can view own payments"
  ON public.parent_payments FOR SELECT
  USING (parent_id IN (
    SELECT id FROM public.parent_profiles
    WHERE user_id = auth.uid()
  ));

-- 系統可以插入付款記錄
DROP POLICY IF EXISTS "System can insert payments" ON public.parent_payments;
CREATE POLICY "System can insert payments"
  ON public.parent_payments FOR INSERT
  WITH CHECK (true);

-- 系統可以更新付款狀態
DROP POLICY IF EXISTS "System can update payments" ON public.parent_payments;
CREATE POLICY "System can update payments"
  ON public.parent_payments FOR UPDATE
  USING (true);

-- ============================================
-- 6. 更新 parent_invites RLS（增強版）
-- ============================================

-- 學生可以查看自己的邀請
DROP POLICY IF EXISTS "Students can manage own invites" ON public.parent_invites;
CREATE POLICY "Students can manage own invites"
  ON public.parent_invites FOR ALL
  USING (
    student_id IN (
      SELECT id FROM public.student_profiles
      WHERE user_id = auth.uid()
    )
  );

-- 家長可以查看使用自己的邀請
DROP POLICY IF EXISTS "Parents can view own invites" ON public.parent_invites;
CREATE POLICY "Parents can view own invites"
  ON public.parent_invites FOR SELECT
  USING (auth.uid() = parent_id);

-- 系統可以插入邀請（邀請碼生成）
DROP POLICY IF EXISTS "System can insert invites" ON public.parent_invites;
CREATE POLICY "System can insert invites"
  ON public.parent_invites FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 7. 添加修改後的 parent_invites 權限更新
-- ============================================

-- 允許家長接受邀請（更新狀態）
DROP POLICY IF EXISTS "Parents can accept invites" ON public.parent_invites;
CREATE POLICY "Parents can accept invites"
  ON public.parent_invites FOR UPDATE
  USING (auth.uid() = parent_id)
  WITH CHECK (
    status = 'accepted' AND
    auth.uid() = parent_id
  );

-- ============================================
-- 8. 安全函數：檢查用戶角色
-- ============================================

CREATE OR REPLACE FUNCTION is_parent_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.parent_profiles
    WHERE user_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_student_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.student_profiles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. 資料庫函數：創建家長報告（帶價格計算）
-- ============================================

CREATE OR REPLACE FUNCTION create_parent_report(
  p_student_id UUID,
  p_parent_id UUID,
  p_report_type VARCHAR,
  p_content JSONB,
  p_include_portfolio BOOLEAN DEFAULT true,
  p_include_timeline BOOLEAN DEFAULT true,
  p_include_achievements BOOLEAN DEFAULT true,
  p_include_ai_insights BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
  v_report_id UUID;
  v_is_free BOOLEAN;
  v_price DECIMAL;
BEGIN
  -- 檢查本月免費配額
  v_is_free := check_monthly_free_quota(p_parent_id);
  
  -- 計算價格
  v_price := calculate_report_price(p_report_type, v_is_free);
  
  -- 創建報告
  INSERT INTO public.parent_reports (
    student_id,
    parent_id,
    report_type,
    content,
    include_portfolio,
    include_timeline,
    include_achievements,
    include_ai_insights,
    is_paid,
    price,
    payment_status
  ) VALUES (
    p_student_id,
    p_parent_id,
    p_report_type,
    p_content,
    p_include_portfolio,
    p_include_timeline,
    p_include_achievements,
    p_include_ai_insights,
    NOT v_is_free,
    v_price,
    CASE WHEN v_is_free THEN 'free' ELSE 'pending' END
  ) RETURNING id INTO v_report_id;
  
  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. 資料庫觸發器：自動更新 student_profiles 的 parent_ids
-- ============================================

CREATE OR REPLACE FUNCTION update_student_parent_ids()
RETURNS TRIGGER AS $$
BEGIN
  -- 當家長資料插入或更新時，自動更新對應學生的 parent_ids
  IF TG_OP = 'INSERT' THEN
    UPDATE public.student_profiles
    SET parent_ids = array_append(parent_ids, NEW.id)
    WHERE id = NEW.student_id AND NOT (NEW.id = ANY(parent_ids));
    
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active != NEW.is_active THEN
    -- 如果家長被停用，從 parent_ids 中移除
    IF NEW.is_active = false THEN
      UPDATE public.student_profiles
      SET parent_ids = array_remove(parent_ids, NEW.id)
      WHERE id = NEW.student_id;
    -- 如果家長被啟用，添加到 parent_ids
    ELSE
      UPDATE public.student_profiles
      SET parent_ids = array_append(parent_ids, NEW.id)
      WHERE id = NEW.student_id AND NOT (NEW.id = ANY(parent_ids));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_parent_ids_to_student ON public.parent_profiles;
CREATE TRIGGER sync_parent_ids_to_student
  AFTER INSERT OR UPDATE ON public.parent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_student_parent_ids();

COMMENT ON FUNCTION update_student_parent_ids() IS '自動同步家長 ID 到學生的 parent_ids 陣列';
