-- ============================================
-- 升學大師 v4 Storage Buckets 設定
-- ============================================
-- 用途：儲存學習歷程相關檔案
-- 權限：公開讀取，僅授權用戶可上傳

-- ============================================
-- 1. 建立 Storage Buckets
-- ============================================

-- 學習歷程文件 (portfolio-docs) - PDF, DOCX
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-docs',
  'portfolio-docs',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

-- 證據檔案 (evidence-files) - 圖片, PDF
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence-files',
  'evidence-files',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- 個人資料圖片 (profile-images) - 頭像, 封面
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ============================================
-- 2. 建立 Storage RLS Policies
-- ============================================

-- 2.1 portfolio-docs 權限
-- 公開讀取權限
CREATE POLICY "Public read access to portfolio-docs"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'portfolio-docs');

-- 學生上傳權限（透過 student_profiles JOIN）
CREATE POLICY "Students can upload to portfolio-docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-docs' AND
    auth.uid() IN (
      SELECT user_id FROM public.student_profiles
      WHERE id = (storage.foldername(name))[1]::uuid
    )
  );

-- 學生刪除權限（只能刪除自己的檔案）
CREATE POLICY "Students can delete own portfolio-docs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-docs' AND
    auth.uid() IN (
      SELECT user_id FROM public.student_profiles
      WHERE id = (storage.foldername(name))[1]::uuid
    )
  );

-- 2.2 evidence-files 權限
-- 公開讀取權限
CREATE POLICY "Public read access to evidence-files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'evidence-files');

-- 學生上傳權限
CREATE POLICY "Students can upload to evidence-files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'evidence-files' AND
    auth.uid() IN (
      SELECT user_id FROM public.student_profiles
      WHERE id = (storage.foldername(name))[1]::uuid
    )
  );

-- 學生刪除權限
CREATE POLICY "Students can delete own evidence-files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'evidence-files' AND
    auth.uid() IN (
      SELECT user_id FROM public.student_profiles
      WHERE id = (storage.foldername(name))[1]::uuid
    )
  );

-- 2.3 profile-images 權限
-- 公開讀取權限
CREATE POLICY "Public read access to profile-images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-images');

-- 學生上傳權限（只能上傳到自己的資料夾）
CREATE POLICY "Students can upload to profile-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid() IN (
      SELECT user_id FROM public.student_profiles
      WHERE id = (storage.foldername(name))[1]::uuid
    )
  );

-- 學生刪除權限
CREATE POLICY "Students can delete own profile-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images' AND
    auth.uid() IN (
      SELECT user_id FROM public.student_profiles
      WHERE id = (storage.foldername(name))[1]::uuid
    )
  );

-- ============================================
-- 3. 建立 Storage 資料夾結構函數
-- ============================================

-- 函數：取得學生的檔案路徑
CREATE OR REPLACE FUNCTION get_student_storage_path(
  student_id UUID,
  bucket_name TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN bucket_name || '/' || student_id::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. 權限說明
-- ============================================

-- 檔案路徑格式：
-- portfolio-docs/{student_id}/{filename}
-- evidence-files/{student_id}/{filename}
-- profile-images/{student_id}/{filename}

-- 學生只能：
-- 1. 讀取所有公開檔案
-- 2. 上傳到自己的資料夾
-- 3. 刪除自己資料夾中的檔案

-- 系統管理員可以透過 SUPABASE_SERVICE_ROLE_KEY 繞過 RLS 進行管理操作