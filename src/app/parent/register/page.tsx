'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateInviteCode, acceptParentInvite } from '@/lib/parent-service'

function ParentRegistrationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'validate' | 'register' | 'complete'>('validate')
  const [inviteCode, setInviteCode] = useState('')
  const [inviteValid, setInviteValid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    relationship: '母親' as '父親' | '母親' | '監護人' | '其他',
    displayName: '',
    phone: ''
  })

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setInviteCode(code)
      validateCode(code)
    }
  }, [searchParams])

  const validateCode = async (code: string) => {
    try {
      setLoading(true)
      setError(null)

      const invite = await validateInviteCode(code)
      if (invite) {
        setInviteValid(true)
        setStep('register')
      } else {
        setError('邀請碼無效或已過期')
      }
    } catch (err) {
      console.error('Error validating code:', err)
      setError('驗證邀請碼時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitCode = () => {
    if (inviteCode.trim()) {
      validateCode(inviteCode.trim())
    }
  }

  const handleRegister = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirect=/parent/register?code=' + inviteCode)
        return
      }

      const result = await acceptParentInvite(inviteCode, user.id, {
        relationship: formData.relationship,
        display_name: formData.displayName || undefined,
        phone: formData.phone || undefined
      })

      if (result) {
        setStep('complete')
      } else {
        setError('註冊失敗，請稍後再試')
      }
    } catch (err) {
      console.error('Error registering:', err)
      setError('註冊時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'validate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">家長註冊</h1>
              <p className="text-gray-600">輸入邀請碼以查看孩子的學習歷程</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邀請碼
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="PARENT-XXXX-XXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-lg font-mono"
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleSubmitCode}
                disabled={loading || !inviteCode.trim()}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '驗證中...' : '驗證邀請碼'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                返回首頁
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">完成註冊</h1>
              <p className="text-gray-600">請填寫基本資料</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  與學生的關係 *
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData({...formData, relationship: e.target.value as any})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                >
                  <option value="母親">母親</option>
                  <option value="父親">父親</option>
                  <option value="監護人">監護人</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  顯示名稱
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  placeholder="如何稱呼您"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  聯絡電話
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="09xx-xxx-xxx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '註冊中...' : '完成註冊'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">註冊成功！</h1>
            <p className="text-gray-600 mb-6">
              您已成功連結到孩子的學習歷程
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/ability-account')}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                前往家長儀表板
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                返回首頁
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function ParentRegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ParentRegistrationContent />
    </Suspense>
  )
}