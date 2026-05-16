// 時間線 — 基於學生選擇的活動 + 升學管道里程碑
// 讀取 chosen_activities_v1，合併所有時間事件

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { trackPageView, trackFeatureUsage } from '@/lib/analytics'
import { getChosenActivities, generateUnifiedTimeline } from '@/lib/activity-plan'
import type { ChosenActivitiesData, UnifiedTimelineEvent } from '@/types/activity-plan'
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

const EVENT_TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  certificate: { icon: '📜', color: 'text-amber-600', bg: 'bg-amber-50' },
  competition: { icon: '🏆', color: 'text-blue-600', bg: 'bg-blue-50' },
  pathway: { icon: '🎓', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  exam: { icon: '📝', color: 'text-purple-600', bg: 'bg-purple-50' },
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

export default function RoadmapPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [timeline, setTimeline] = useState<UnifiedTimelineEvent[]>([])
  const [plan, setPlan] = useState<SavedPlan | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    trackPageView('roadmap_v2')
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

      let targetPathways: string[] = []
      try {
        const tp = localStorage.getItem('user_target_pathways')
        if (tp) targetPathways = Object.entries(JSON.parse(tp)).filter(([, v]: [string, any]) => v.selected).map(([k]) => k)
      } catch {}

      const events = generateUnifiedTimeline(chosenData.activities, targetPathways)
      setTimeline(events)
    }

    // Load completed state
    const completedRaw = localStorage.getItem('roadmap_completed_v2')
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
    localStorage.setItem('roadmap_completed_v2', JSON.stringify([...next]))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <motion.div {...fadeUp} className="text-center max-w-md">
          <div className="text-6xl mb-6">🗓️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">你的時間線</h1>
          <p className="text-lg text-gray-500 mb-4">
            {plan ? '前往能力中心選擇你要參加的活動，時間線會自動更新。' : '先完成發現流程，開始規劃你的升學準備。'}
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

  const completedCount = timeline.filter(e => completedIds.has(e.id) || e.status === 'completed').length
  const urgentCount = timeline.filter(e => e.status === 'urgent').length
  const upcomingEvents = timeline.filter(e => !completedIds.has(e.id) && e.status !== 'completed')
  const pastEvents = timeline.filter(e => completedIds.has(e.id) || e.status === 'completed')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 border-b border-indigo-100 py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <p className="text-indigo-600 font-semibold text-sm">我的時間線</p>
          <span className="text-xs text-gray-500">{timeline.length} 個事件 · {completedCount} 已完成</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div {...stagger(0)} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">即將到來</div>
            <div className="text-2xl font-bold text-indigo-600">{upcomingEvents.length}</div>
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

        {/* Timeline */}
        <div className="space-y-0">
          {timeline.map((event, i) => {
            const isCompleted = completedIds.has(event.id) || event.status === 'completed'
            const config = EVENT_TYPE_CONFIG[event.eventType] || EVENT_TYPE_CONFIG.exam
            const daysLeft = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000)
            const isPast = daysLeft < 0

            return (
              <motion.div key={event.id} {...stagger(i)} className="flex gap-3">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => toggleComplete(event.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1.5 transition ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : event.status === 'urgent'
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 bg-white hover:border-indigo-400'
                    }`}
                  >
                    {isCompleted && <span className="text-xs">✓</span>}
                  </button>
                  {i < timeline.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-[2rem] ${isCompleted ? 'bg-green-200' : 'bg-gray-200'}`} />
                  )}
                </div>

                {/* Event card */}
                <div className={`flex-1 pb-4 ${isCompleted ? 'opacity-60' : ''}`}>
                  <div className={`bg-white rounded-2xl p-4 shadow-sm ${event.status === 'urgent' ? 'ring-2 ring-red-200' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          {config.icon} {event.category}
                        </span>
                        {event.pathways.length > 0 && (
                          <div className="flex gap-1">
                            {event.pathways.slice(0, 2).map(p => (
                              <span key={p} className="px-1.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-600 rounded-full">
                                {PATHWAY_SHORT[p] || p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {!isPast && !isCompleted && (
                        <span className={`text-xs font-bold shrink-0 ${
                          daysLeft < 14 ? 'text-red-500' : daysLeft < 30 ? 'text-amber-500' : 'text-gray-500'
                        }`}>
                          {daysLeft <= 0 ? '今天' : `${daysLeft}天後`}
                        </span>
                      )}
                      {isPast && !isCompleted && (
                        <span className="text-xs text-gray-400 shrink-0">
                          {new Date(event.date).toLocaleDateString('zh-TW')}
                        </span>
                      )}
                    </div>
                    <div className={`font-medium mt-1 ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {event.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">{event.description}</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Empty state for no upcoming */}
        {upcomingEvents.length === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center mt-6">
            <div className="text-4xl mb-3">🎊</div>
            <p className="text-gray-600">所有事件都已完成！幹得好！</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mt-8 mb-6">
          <h3 className="text-lg font-bold mb-4">快速導航</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => router.push('/ability-account')}
              className="bg-white/20 hover:bg-white/30 transition rounded-xl p-3 text-left">
              <div className="font-semibold text-sm">🎯 能力中心</div>
              <div className="text-xs opacity-80">管理你的活動計畫</div>
            </button>
            <button onClick={() => router.push('/portfolio')}
              className="bg-white/20 hover:bg-white/30 transition rounded-xl p-3 text-left">
              <div className="font-semibold text-sm">📑 準備材料</div>
              <div className="text-xs opacity-80">考前賽前準備</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

const PATHWAY_SHORT: Record<string, string> = {
  stars: '繁星', selection: '甄選', distribution: '分發',
  skills: '技優', guarantee: '保送', special: '特殊',
}
