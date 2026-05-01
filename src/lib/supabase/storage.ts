// Supabase Storage Helper
// 用於管理學習歷程相關檔案的上傳、下載、刪除

import { createClient } from './client'

export type StorageBucket = 'portfolio-docs' | 'evidence-files' | 'profile-images'

export interface UploadOptions {
  bucket: StorageBucket
  studentId: string
  file: File
  upsert?: boolean
}

export interface UploadResult {
  path: string
  fullPath: string
  publicUrl: string
}

/**
 * 上傳檔案到 Supabase Storage
 * @param options 上傳選項
 * @returns 上傳結果
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const supabase = createClient()
  const { bucket, studentId, file, upsert = false } = options

  // 產生檔案路徑：{bucket}/{studentId}/{timestamp}_{filename}
  const timestamp = Date.now()
  const filename = `${timestamp}_${file.name}`
  const path = `${studentId}/${filename}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert })

  if (error) {
    console.error('Storage upload error:', error)
    throw new Error(`上傳失敗: ${error.message}`)
  }

  // 取得公開 URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return {
    path,
    fullPath: data.path,
    publicUrl
  }
}

/**
 * 刪除檔案從 Supabase Storage
 * @param bucket 儲存桶名稱
 * @param paths 檔案路徑陣列
 */
export async function deleteFiles(bucket: StorageBucket, paths: string[]): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths)

  if (error) {
    console.error('Storage delete error:', error)
    throw new Error(`刪除失敗: ${error.message}`)
  }
}

/**
 * 取得檔案的公開 URL
 * @param bucket 儲存桶名稱
 * @param path 檔案路徑
 * @returns 公開 URL
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = createClient()

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

/**
 * 列出學生在某個儲存桶中的所有檔案
 * @param bucket 儲存桶名稱
 * @param studentId 學生 ID
 * @returns 檔案列表
 */
export async function listStudentFiles(
  bucket: StorageBucket,
  studentId: string
) {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(studentId)

  if (error) {
    console.error('Storage list error:', error)
    throw new Error(`列出檔案失敗: ${error.message}`)
  }

  return data
}

/**
 * 下載檔案
 * @param bucket 儲存桶名稱
 * @param path 檔案路徑
 * @returns 檔案資料
 */
export async function downloadFile(bucket: StorageBucket, path: string) {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)

  if (error) {
    console.error('Storage download error:', error)
    throw new Error(`下載失敗: ${error.message}`)
  }

  return data
}

/**
 * 檢查檔案大小是否在限制內
 * @param file 檔案物件
 * @param bucket 儲存桶名稱
 * @returns 是否符合大小限制
 */
export function checkFileSize(file: File, bucket: StorageBucket): boolean {
  const sizeLimits = {
    'portfolio-docs': 10 * 1024 * 1024, // 10MB
    'evidence-files': 5 * 1024 * 1024,  // 5MB
    'profile-images': 2 * 1024 * 1024   // 2MB
  }

  return file.size <= sizeLimits[bucket]
}

/**
 * 檢查檔案類型是否允許
 * @param file 檔案物件
 * @param bucket 儲存桶名稱
 * @returns 是否符合類型限制
 */
export function checkFileType(file: File, bucket: StorageBucket): boolean {
  const allowedTypes = {
    'portfolio-docs': [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ],
    'evidence-files': [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ],
    'profile-images': [
      'image/jpeg',
      'image/png',
      'image/webp'
    ]
  }

  return allowedTypes[bucket].includes(file.type)
}