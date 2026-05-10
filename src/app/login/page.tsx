// 升學大師 v4 - 登入/註冊頁面 (完全重寫版)

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { VocationalGroup } from '@/types'
import VocationalGroupSelector from '@/components/VocationalGroupSelector'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<VocationalGroup | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    console.log('🚀 開始認證流程:', { isSignUp, email })

    try {
      if (isSignUp) {
        console.log('📝 嘗試註冊帳戶...')

        // 檢查註冊時是否選擇了職群
        if (!selectedGroup) {
          setError('請選擇您的職群以繼續註冊')
          setLoading(false)
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'student',
              vocational_group: selectedGroup
            },
            emailRedirectTo: `${window.location.origin}/ability-account`
          }
        })

        console.log('📊 註冊回應:', { data, error })

        if (error) {
          console.error('❌ 註冊錯誤:', error)
          throw error
        }

        if (data.user) {
          console.log('✅ 用戶創建成功:', data.user)

          // 檢查是否需要 email 驗證
          if (data.user.identities && data.user.identities.length === 0) {
            setMessage('註冊成功！但需要確認電子郵件才能登入。')
            setLoading(false)
            return
          }

          setMessage('註冊成功！正在創建學生資料...')

          // 延遲創建資料，確保 auth 完成後
          setTimeout(async () => {
            try {
              // 將職群名稱轉換為 group_code (使用前兩個字或特定映射)
              const groupCodeMap: Record<VocationalGroup, string> = {
                '餐旅群': '01',
                '機械群': '02',
                '電機群': '03',
                '電子群': '04',
                '資訊群': '05',
                '商管群': '06',
                '設計群': '07',
                '農業群': '08',
                '化工群': '09',
                '土木群': '10',
                '海事群': '11',
                '護理群': '12',
                '家政群': '13',
                '語文群': '14',
                '商業與管理群': '15',
              }

              const { error: profileError } = await supabase
                .from('student_profiles')
                .insert({
                  user_id: data.user!.id,
                  group_code: groupCodeMap[selectedGroup],
                  grade: 1,
                  school_name: null,
                  target_pathways: [],
                  target_schools: [],  // 修復錯字
                  total_records: 0,
                  total_bonus_percent: 0,
                  partner_ids: [],
                  warmth_points: 0,
                  parent_ids: []
                } as any)

              if (profileError) {
                console.error('❌ 建立學生資料失敗:', profileError)
                setError(`註冊成功但建立資料失敗: ${profileError.message}`)
              } else {
                console.log('✅ 學生資料創建成功，職群:', selectedGroup)
                setMessage('註冊完成！即將跳轉...')
                setTimeout(() => {
                  router.push('/ability-account')
                }, 1000)
              }
            } catch (err) {
              console.error('❌ 資料創建異常:', err)
              setError('註冊成功但建立資料時發生錯誤')
            } finally {
              setLoading(false)
            }
          }, 1000)

          return // 不立即設置 setLoading(false)，等待資料創建完成
        }
      } else {
        console.log('🔑 嘗試登入帳戶...')

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        console.log('📊 登入回應:', { data, error })

        if (error) {
          console.error('❌ 登入錯誤:', error)
          throw error
        }

        if (data.session) {
          console.log('✅ 登入成功')
          router.push('/ability-account')
        }
      }
    } catch (err) {
      console.error('❌ 認證失敗:', err)
      const errorMessage = err instanceof Error ? err.message : '登入或註冊失敗'
      console.error('詳細錯誤:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #eef2ff, #ffffff, #faf5ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ maxWidth: '448px', width: '100%' }}>
        {/* Logo 區域 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'linear-gradient(to bottom right, #6366f1, #a855f7)',
            borderRadius: '16px',
            marginBottom: '16px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            升學大師 v4
          </h1>
        </div>

        {/* 表單卡片 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '32px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            {isSignUp ? '註冊帳戶' : '登入您的學習帳戶'}
          </h2>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email - 橫式布局 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                電子郵件
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Password - 橫式布局 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* 職群選擇器 - 只在註冊時顯示 */}
            {isSignUp && (
              <div>
                <VocationalGroupSelector
                  selectedGroup={selectedGroup}
                  onGroupSelect={setSelectedGroup}
                  disabled={loading}
                  showLabel={true}
                  compact={false}
                />
                {!selectedGroup && (
                  <p style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginTop: '4px'
                  }}>
                    請選擇您的職群
                  </p>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" fill="#ef4444" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p style={{ fontSize: '14px', color: '#b91c1c' }}>{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" fill="#22c55e" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p style={{ fontSize: '14px', color: '#15803d' }}>{message}</p>
                </div>
              </div>
            )}

            {/* 測試連線按鈕 */}
            <button
              type="button"
              onClick={async () => {
                try {
                  console.log('🧪 測試 Supabase 連線...')
                  const { data, error } = await supabase.auth.getSession()
                  console.log('📊 連線測試結果:', { data, error })
                  alert(`連線${error ? '失敗' : '成功'}: ${error ? error.message : 'Supabase 連線正常'}`)
                } catch (err) {
                  console.error('❌ 連線測試失敗:', err)
                  alert(`連線失敗: ${err instanceof Error ? err.message : 'Unknown error'}`)
                }
              }}
              style={{
                width: '100%',
                background: '#059669',
                color: 'white',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '8px'
              }}
            >
              🧪 測試 Supabase 連線
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #4f46e5, #9333ea)',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? '處理中...' : (isSignUp ? '註冊帳戶' : '登入')}
            </button>
          </form>

          {/* Toggle Sign In/Sign Up */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setMessage(null)
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '14px',
                color: '#4f46e5',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {isSignUp ? '已有帳戶？點擊登入' : '沒有帳戶？點擊註冊'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#4b5563' }}>
          <p>登入即表示您同意我們的服務條款和隱私政策</p>
        </div>
      </div>
    </div>
  )
}
