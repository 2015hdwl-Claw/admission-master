// 升學大師 v4 - 登入/註冊頁面

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        // 註冊
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'student'
            }
          }
        })

        if (error) throw error

        if (data.user) {
          setMessage('註冊成功！請檢查您的電子郵件以確認帳戶。')

          // 自動建立學生資料
          const { error: profileError } = await supabase
            .from('student_profiles')
            .insert({
              user_id: data.user.id,
              group_code: '01', // 預設值，用戶可以後續修改
              grade: 1,
              school_name: null,
              target_pathways: [],
              target_schooles: [],
              total_records: 0,
              total_bonus_percent: 0,
              partner_ids: [],
              warmth_points: 0,
              parent_ids: []
            } as any)

          if (profileError) {
            console.error('建立學生資料失敗:', profileError)
          } else {
            // 註冊成功後跳轉到能力帳戶頁面
            setTimeout(() => {
              router.push('/ability-account')
            }, 2000)
          }
        }
      } else {
        // 登入
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        if (data.session) {
          router.push('/ability-account')
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err instanceof Error ? err.message : '登入或註冊失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
      <div className="max-w-md w-full" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
        {/* Logo */}
        <div className="text-center mb-8" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>升學大師 v4</h1>
          <p className="mt-2 text-gray-600" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
            {isSignUp ? '建立您的學習帳戶' : '登入您的學習帳戶'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
          <form onSubmit={handleAuth} className="space-y-6" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
            {/* Email */}
            <div style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
                電子郵件
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="your@email.com"
                style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}
              />
            </div>

            {/* Password */}
            <div style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
                密碼
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="••••••••"
                style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
                <div className="flex items-center" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
                <div className="flex items-center" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-700" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>{message}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}
            >
              {loading ? '處理中...' : (isSignUp ? '註冊帳戶' : '登入')}
            </button>
          </form>

          {/* Toggle Sign In/Sign Up */}
          <div className="mt-6 text-center" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setMessage(null)
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}
            >
              {isSignUp ? '已有帳戶？點擊登入' : '沒有帳戶？點擊註冊'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>
          <p style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed', direction: 'ltr' }}>登入即表示您同意我們的服務條款和隱私政策</p>
        </div>
      </div>
    </div>
  )
}