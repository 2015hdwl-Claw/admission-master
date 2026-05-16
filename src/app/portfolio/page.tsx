// 準備材料頁面 — 基於學生選擇的活動，按事件分類
// 讀取 chosen_activities_v1，產生分類準備事項

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { trackPageView } from '@/lib/analytics'
import { getChosenActivities, generateEventBasedPrepItems } from '@/lib/activity-plan'
import type { ChosenActivitiesData, PrepItem } from '@/types/activity-plan'
import type { StudentProfile, DepartmentInfo } from '@/types/department'
import { departments } from '@/lib/department-data'

interface SavedPlan {
  targets: DepartmentInfo[]
  profile: StudentProfile
  createdAt: string
}

interface SavedState {
  step: number
  group: string
  groupName: string
  targets: DepartmentInfo[]
  profile: StudentProfile
  groupConfirmed: boolean
}

const CATEGORY_CONFIG: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  exam: { icon: '📝', label: '段考/期末考', color: 'text-purple-600', bg: 'bg-purple-50' },
  certificate: { icon: '📜', label: '證照考試', color: 'text-amber-600', bg: 'bg-amber-50' },
  competition: { icon: '🏆', label: '競賽', color: 'text-blue-600', bg: 'bg-blue-50' },
  application: { icon: '📋', label: '申請材料', color: 'text-indigo-600', bg: 'bg-indigo-50' },
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  high: { color: 'text-red-700', bg: 'bg-red-100', label: '緊急' },
  medium: { color: 'text-amber-700', bg: 'bg-amber-100', label: '中等' },
  low: { color: 'text-green-700', bg: 'bg-green-100', label: '一般' },
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.05, duration: 0.3 },
})

export default function PortfolioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<PrepItem[]>([])
  const [plan, setPlan] = useState<SavedPlan | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<string>('all')

  useEffect(() => {
    trackPageView('portfolio_v2')
    loadData()
  }, [])

  function loadData() {
    let profile: StudentProfile | null = null
    let targets: DepartmentInfo[] = []

    const raw = localStorage.getItem('saved_discovery_plan_v4')
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedPlan
        if (parsed.targets?.length > 0 && parsed.profile) {
          profile = parsed.profile
          targets = parsed.targets.map(t => departments.find(d => d.id === t.id) || t).filter(t => t.schoolName) as DepartmentInfo[]
        }
      } catch {}
    }

    if (!profile) {
      const stateRaw = localStorage.getItem('discovery_state_v4')
      if (stateRaw) {
        try {
          const s = JSON.parse(stateRaw) as SavedState
          if (s.targets?.length > 0 && s.profile) {
            profile = s.profile
            targets = s.targets.map(t => departments.find(d => d.id === t.id) || t).filter(t => t.schoolName) as DepartmentInfo[]
          }
        } catch {}
      }
    }

    if (profile) {
      setPlan({ targets, profile, createdAt: new Date().toISOString() })

      const chosenData = getChosenActivities()
      const prepItems = generateEventBasedPrepItems(chosenData.activities, profile, targets)
      setItems(prepItems)
    }

    const completedRaw = localStorage.getItem('portfolio_completed_v2')
    if (completedRaw) {
      try { setCompletedIds(new Set(JSON.parse(completedRaw))) } catch {}
    }

    setLoading(false)
  }

  function toggleComplete(id: string) {
    const next = new Set(completedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setCompletedIds(next)
    localStorage.setItem('portfolio_completed_v2', JSON.stringify([...next]))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <motion.div {...fadeUp} className="text-center max-w-md">
          <div className="text-6xl mb-6">📑</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">準備材料</h1>
          <p className="text-lg text-gray-500 mb-4">
            {plan ? '前往能力中心選擇活動，這裡會自動產生準備事項。' : '先完成發現流程，開始規劃你的升學準備。'}
          </p>
          <button
            onClick={() => router.push(plan ? '/ability-account' : '/first-discovery')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-lg font-medium hover:bg-indigo-700 transition"
          >
            {plan ? '前往能力中心 →' : '開始探索 →'}
          </button>
        </motion.div>
      </div>
    )
  }

  const filteredItems = activeTab === 'all' ? items : items.filter(i => i.category === activeTab)
  const urgentCount = items.filter(i => i.priority === 'high' && !completedIds.has(i.id)).length
  const completedCount = items.filter(i => completedIds.has(i.id)).length

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 border-b border-indigo-100 py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <p className="text-indigo-600 font-semibold text-sm">準備材料</p>
          <span className="text-xs text-gray-500">{items.length} 項準備 · {completedCount} 已完成</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div {...stagger(0)} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">準備項目</div>
            <div className="text-2xl font-bold text-indigo-600">{items.length}</div>
          </motion.div>
          <motion.div {...stagger(1)} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">緊急</div>
            <div className="text-2xl font-bold text-red-500">{urgentCount}</div>
          </motion.div>
          <motion.div {...stagger(2)} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">已完成</div>
            <div className="text-2xl font-bold text-green-500">{completedCount}</div>
          </motion.div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map(cat => {
            const config = cat === 'all' ? { icon: '📊', label: '全部', color: 'text-gray-600', bg: 'bg-gray-50' } : CATEGORY_CONFIG[cat]
            const count = cat === 'all' ? items.length : items.filter(i => i.category === cat).length
            return (
              <button key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  activeTab === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {config.icon} {config.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Items list */}
        <div className="space-y-3">
          {filteredItems.map((item, i) => {
            const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.application
            const pConfig = PRIORITY_CONFIG[item.priority]
            const isCompleted = completedIds.has(item.id)

            return (
              <motion.div key={item.id} {...stagger(i)}
                className={`bg-white rounded-2xl p-4 shadow-sm ${isCompleted ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                      isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {isCompleted && <span className="text-xs">✓</span>}
                  </button>

                  <div className="flex-1 min-w-0">
                    {/* Category + Priority badges */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                        {config.icon} {config.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pConfig.bg} ${pConfig.color}`}>
                        {pConfig.label}
                      </span>
                      {item.daysLeft < 999 && !isCompleted && (
                        <span className={`text-xs font-bold ${
                          item.daysLeft < 14 ? 'text-red-500' : item.daysLeft < 30 ? 'text-amber-500' : 'text-gray-500'
                        }`}>
                          {item.daysLeft <= 0 ? '已到期' : `${item.daysLeft}天後`}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className={`font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {item.title}
                    </div>

                    {/* Description */}
                    <div className="text-sm text-gray-500 mt-0.5">{item.description}</div>

                    {/* Deadline */}
                    {item.deadline && (
                      <div className="text-xs text-gray-400 mt-1">
                        截止：{new Date(item.deadline).toLocaleDateString('zh-TW')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mt-8 mb-6">
          <h3 className="text-lg font-bold mb-4">快速導航</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => router.push('/ability-account')}
              className="bg-white/20 hover:bg-white/30 transition rounded-xl p-3 text-left">
              <div className="font-semibold text-sm">🎯 能力中心</div>
              <div className="text-xs opacity-80">管理你的活動計畫</div>
            </button>
            <button onClick={() => router.push('/roadmap')}
              className="bg-white/20 hover:bg-white/30 transition rounded-xl p-3 text-left">
              <div className="font-semibold text-sm">🗓️ 時間線</div>
              <div className="text-xs opacity-80">查看所有重要日期</div>
            </button>
            <button onClick={() => router.push('/interview')}
              className="bg-white/20 hover:bg-white/30 transition rounded-xl p-3 text-left">
              <div className="font-semibold text-sm">📁 申請準備</div>
              <div className="text-xs opacity-80">管理上傳文件</div>
            </button>
            <button onClick={() => router.push('/first-discovery')}
              className="bg-white/20 hover:bg-white/30 transition rounded-xl p-3 text-left">
              <div className="font-semibold text-sm">🔍 重新探索</div>
              <div className="text-xs opacity-80">調整目標科系</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
