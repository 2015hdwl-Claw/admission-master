'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createParentInvite, getParentInvites, revokeParentInvite, type ParentInvite } from '@/lib/parent-service'
import type { Database } from '@/lib/supabase/database.types'

type StudentProfile = Database['public']['Tables']['student_profiles']['Row']

export default function ParentManagement({ profile }: { profile: StudentProfile | null }) {
  const [invites, setInvites] = useState<ParentInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.id) {
      loadInvites()
    }
  }, [profile])

  const loadInvites = async () => {
    try {
      setLoading(true)
      const data = await getParentInvites(profile?.id || '')
      setInvites(data)
    } catch (err) {
      console.error('Error loading invites:', err)
      setError('載入邀請列表失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvite = async () => {
    if (!profile?.id) return

    try {
      setCreating(true)
      setError(null)
      setSuccess(null)

      const newInvite = await createParentInvite(profile.id, {
        can_view_portfolio: true,
        can_view_timeline: true,
        can_view_achievements: true
      })

      if (newInvite) {
        setSuccess(`邀請碼已生成：${newInvite.invite_code}`)
        await loadInvites()
      } else {
        setError('生成邀請碼失敗')
      }
    } catch (err) {
      console.error('Error creating invite:', err)
      setError('生成邀請碼失敗')
    } finally {
      setCreating(false)
    }
  }

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      setError(null)
      const success = await revokeParentInvite(inviteId)
      if (success) {
        setSuccess('邀請已撤銷')
        await loadInvites()
      } else {
        setError('撤銷邀請失敗')
      }
    } catch (err) {
      console.error('Error revoking invite:', err)
      setError('撤銷邀請失敗')
    }
  }

  const copyInviteLink = (inviteCode: string) => {
    const link = `${window.location.origin}/parent/register?code=${inviteCode}`
    navigator.clipboard.writeText(link)
    setSuccess('邀請連結已複製到剪貼簿')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Create Invite Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">邀請家長</h3>
        <p className="text-gray-600 mb-4">
          生成邀請碼分享給家長，讓他們查看您的學習歷程和成長報告
        </p>
        <button
          onClick={handleCreateInvite}
          disabled={creating}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? '生成中...' : '+ 生成邀請碼'}
        </button>
      </div>

      {/* Invites List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">邀請列表</h3>

        {invites.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">👨‍👩‍👧‍👦</div>
            <p className="text-gray-600">還沒有邀請任何家長</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invites.map((invite) => (
              <div key={invite.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        invite.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        invite.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invite.status === 'accepted' ? '已接受' :
                         invite.status === 'pending' ? '待接受' :
                         '已撤銷'}
                      </span>
                      <span className="text-sm text-gray-500">
                        到期：{new Date(invite.expires_at).toLocaleDateString('zh-TW')}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <code className="text-lg font-mono font-bold text-indigo-600">
                        {invite.invite_code}
                      </code>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      {invite.can_view_portfolio && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">學習歷程</span>
                      )}
                      {invite.can_view_timeline && (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">時間軸</span>
                      )}
                      {invite.can_view_achievements && (
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded">成就記錄</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {invite.status === 'pending' && (
                      <>
                        <button
                          onClick={() => copyInviteLink(invite.invite_code)}
                          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                          複製連結
                        </button>
                        <button
                          onClick={() => handleRevokeInvite(invite.id)}
                          className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          撤銷
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
