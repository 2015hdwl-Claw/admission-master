// 能力中心 — 互動武器庫
// 學生在這裡選擇要做的活動（證照、競賽、提升成績）
// 寫入 chosen_activities_v1，其他頁面讀取

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { trackPageView, trackFeatureUsage } from '@/lib/analytics'
import { departments } from '@/lib/department-data'
import {
  analyzeDepartment,
  consolidateActionPlan,
  generateGradeAdvice,
} from '@/lib/pathway-matcher'
import { generateStrategy } from '@/lib/strategy-engine'
import {
  getChosenActivities,
  addChosenActivity,
  removeChosenActivity,
  updateActivityStatus,
  upgradePathToActivity,
} from '@/lib/activity-plan'
import type {
  DepartmentInfo,
  StudentProfile,
  DepartmentAnalysis,
  ConsolidatedActionPlan,
  GradeAdvice,
} from '@/types/department'
import type { StrategyAdvice, UpgradePath, CriticalDeadline } from '@/types/strategy'
import type { ChosenActivity, ChosenActivitiesData } from '@/types/activity-plan'

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

const GRADE_LABELS: Record<number, string> = { 10: '高一', 11: '高二', 12: '高三' }
const PATHWAY_NAMES: Record<string, string> = {
  stars: '繁星推薦', selection: '甄選入學', distribution: '聯合登記分發',
  skills: '技優甄審', guarantee: '技優保送', special: '特殊選才',
}
const PATHWAY_SHORT: Record<string, string> = {
  stars: '繁星', selection: '甄選', distribution: '分發',
  skills: '技優', guarantee: '保送', special: '特殊',
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.4 },
})

export default function AbilityAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<SavedPlan | null>(null)
  const [analyses, setAnalyses] = useState<DepartmentAnalysis[]>([])
  const [consolidated, setConsolidated] = useState<ConsolidatedActionPlan | null>(null)
  const [selectedDepartmentIndex, setSelectedDepartmentIndex] = useState(0)
  const [expandedPathway, setExpandedPathway] = useState<string | null>(null)
  const [myPlan, setMyPlan] = useState<ChosenActivitiesData>({ activities: [], updatedAt: '', groupCode: '', grade: 0 })
  const [activeTab, setActiveTab] = useState<'opportunities' | 'myplan' | 'readiness'>('opportunities')

  useEffect(() => {
    trackPageView('ability_account_v4')
    loadData()
  }, [])

  function loadData() {
    const raw = localStorage.getItem('saved_discovery_plan_v4')
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedPlan
        if (parsed.targets?.length > 0 && parsed.profile) {
          resolveAndSet(parsed)
          return
        }
      } catch { /* corrupt */ }
    }

    const stateRaw = localStorage.getItem('discovery_state_v4')
    if (stateRaw) {
      try {
        const s = JSON.parse(stateRaw) as SavedState
        if (s.targets?.length > 0 && s.profile && s.step >= 2) {
          resolveAndSet({ targets: s.targets, profile: s.profile, createdAt: new Date().toISOString() })
          return
        }
      } catch { /* corrupt */ }
    }

    setLoading(false)
  }

  function resolveAndSet(saved: SavedPlan) {
    const resolved = saved.targets.map(t => {
      const full = departments.find(d => d.id === t.id)
      return full || t
    }).filter(t => t.schoolName) as DepartmentInfo[]

    if (resolved.length === 0) { setLoading(false); return }

    const p = { ...saved, targets: resolved }
    setPlan(p)
    setAnalyses(resolved.map(d => analyzeDepartment(d, saved.profile)))
    setConsolidated(consolidateActionPlan(analyses))
    setMyPlan(getChosenActivities())
    setLoading(false)
  }

  // Reload myPlan from localStorage
  const refreshMyPlan = useCallback(() => {
    setMyPlan(getChosenActivities())
  }, [])

  function handleAddToPlan(path: UpgradePath) {
    if (!plan) return
    const activity = upgradePathToActivity(path, plan.profile, plan.targets)
    addChosenActivity(activity)
    refreshMyPlan()
    trackFeatureUsage('ability_add_activity', { type: activity.type, name: activity.targetItemName })
  }

  function handleRemoveFromPlan(id: string) {
    removeChosenActivity(id)
    refreshMyPlan()
  }

  function handleUpdateStatus(id: string, status: ChosenActivity['status']) {
    updateActivityStatus(id, status)
    refreshMyPlan()
  }

  function isAlreadyAdded(path: UpgradePath): boolean {
    return myPlan.activities.some(a =>
      a.type === (path.type === 'certificate' ? 'certificate' : 'competition') &&
      a.targetItemName === path.title
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!plan || analyses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <motion.div {...fadeUp} className="text-center max-w-md">
          <div className="text-6xl mb-6">🗺️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">還沒有探索過你的升學路徑</h1>
          <p className="text-lg text-gray-500 mb-8">
            先完成 4 步驟發現流程，了解你的武器庫和最佳升學路線，然後回來這裡規劃你的行動。
          </p>
          <button
            onClick={() => router.push('/first-discovery')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-lg font-medium hover:bg-indigo-700 transition"
          >
            開始探索升學路徑 →
          </button>
        </motion.div>
      </div>
    )
  }

  const profile = plan.profile
  const gradeLabel = GRADE_LABELS[profile.grade] || '高三'
  const currentAnalysis = analyses[selectedDepartmentIndex]
  const currentStrategy = plan && currentAnalysis ? generateStrategy(plan.profile, [currentAnalysis.department]) : null
  const allMatches = currentAnalysis?.pathwayMatches || []
  const totalBoost = myPlan.activities.reduce((sum, a) => sum + a.probabilityBoost, 0)

  // Get target pathways from portfolio selection
  let targetPathways: string[] = []
  try {
    const tp = localStorage.getItem('user_target_pathways')
    if (tp) targetPathways = Object.entries(JSON.parse(tp)).filter(([, v]: [string, any]) => v.selected).map(([k]) => k)
  } catch {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 border-b border-indigo-100 py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div>
            <p className="text-indigo-600 font-semibold text-sm">互動武器庫</p>
            <p className="text-xs text-gray-400">
              {plan.targets.length} 個目標科系 · {gradeLabel}
              {totalBoost > 0 && <span className="text-green-600 ml-2">預估 +{totalBoost}% 提升</span>}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Department Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {analyses.map((a, i) => (
            <button
              key={a.department.id}
              onClick={() => setSelectedDepartmentIndex(i)}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                selectedDepartmentIndex === i
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <div className="text-left">
                <div className="font-medium text-sm">{a.department.departmentName}</div>
                <div className="text-xs opacity-80">{a.department.schoolName}</div>
              </div>
            </button>
          ))}
        </div>

        {currentAnalysis && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <motion.div {...stagger(0)} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-gray-500">目前匹配度</div>
                <div className="text-2xl font-bold text-indigo-600">{currentAnalysis.bestPathway.acceptanceEstimate}%</div>
              </motion.div>
              <motion.div {...stagger(1)} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-gray-500">最佳管道</div>
                <div className="text-lg font-bold text-purple-600">{currentAnalysis.bestPathway.pathwayName}</div>
              </motion.div>
              <motion.div {...stagger(2)} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-gray-500">已選活動</div>
                <div className="text-2xl font-bold text-emerald-600">{myPlan.activities.length}</div>
              </motion.div>
              <motion.div {...stagger(3)} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-gray-500">預估提升</div>
                <div className="text-2xl font-bold text-green-600">+{totalBoost}%</div>
              </motion.div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm mb-6">
              {[
                { key: 'opportunities', label: '即將到來的機會', icon: '🎯' },
                { key: 'myplan', label: `我的計畫 (${myPlan.activities.length})`, icon: '📋' },
                { key: 'readiness', label: '管道準備度', icon: '📊' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-3 px-2 rounded-xl text-sm font-medium transition ${
                    activeTab === tab.key
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.icon}</span>
                </button>
              ))}
            </div>

            {/* ── Tab A: Opportunities ── */}
            {activeTab === 'opportunities' && currentStrategy && (
              <div>
                {/* Upgrade Paths */}
                {currentStrategy.upgradePaths.filter(p => p.canStillMakeIt).length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-2">
                      以下是你可以採取的行動，按時間緊迫度排序。選擇要加入你的計畫。
                    </p>
                    {currentStrategy.upgradePaths
                      .filter(p => p.canStillMakeIt)
                      .sort((a, b) => {
                        const da = a.registrationDeadline ? daysFromNowLocal(a.registrationDeadline) : 999
                        const db = b.registrationDeadline ? daysFromNowLocal(b.registrationDeadline) : 999
                        return da - db
                      })
                      .map((path, i) => {
                        const added = isAlreadyAdded(path)
                        const isRelevant = targetPathways.length === 0 || path.pathwaysOpened.some(p => targetPathways.includes(p))
                        return (
                          <motion.div key={path.id} {...stagger(i)}
                            className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 relative ${
                              added ? 'border-l-green-400 opacity-75' :
                              path.roi === 'high' ? 'border-l-amber-400' :
                              path.roi === 'medium' ? 'border-l-blue-400' : 'border-l-gray-300'
                            }`}
                          >
                            {/* Match badge */}
                            {isRelevant && path.pathwaysOpened.length > 0 && (
                              <div className="absolute top-3 right-3">
                                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                                  ✓ 符合目標：{path.pathwaysOpened.map(p => PATHWAY_SHORT[p]).join('+')}
                                </span>
                              </div>
                            )}
                            {!isRelevant && targetPathways.length > 0 && (
                              <div className="absolute top-3 right-3">
                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                                  非主要目標管道
                                </span>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                                path.type === 'certificate' ? 'bg-amber-50' : 'bg-blue-50'
                              }`}>
                                {path.type === 'certificate' ? '📜' : '🏆'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    path.type === 'certificate' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {path.type === 'certificate' ? '證照' : '競賽'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    path.roi === 'high' ? 'bg-green-100 text-green-700' :
                                    path.roi === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {path.roi === 'high' ? '高 CP 值' : path.roi === 'medium' ? '中 CP 值' : '一般'}
                                  </span>
                                </div>
                                <div className="font-bold text-lg">{path.title}</div>
                                <div className="text-sm text-gray-500 mt-1">{path.description}</div>

                                {/* Impact tags */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {path.pathwaysOpened.map(pw => (
                                    <span key={pw} className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 rounded-full">
                                      +{PATHWAY_SHORT[pw]}管道
                                    </span>
                                  ))}
                                  {path.probabilityBoost > 0 && (
                                    <span className="px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded-full font-medium">
                                      +{path.probabilityBoost}% 錄取率
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Timeline + Action */}
                              <div className="text-right shrink-0 flex flex-col items-end gap-2">
                                {path.registrationDeadline && (
                                  <div>
                                    <div className="text-xs text-gray-400">報名截止</div>
                                    <div className={`text-sm font-bold ${
                                      daysFromNowLocal(path.registrationDeadline) < 14 ? 'text-red-500' :
                                      daysFromNowLocal(path.registrationDeadline) < 30 ? 'text-amber-500' : 'text-gray-700'
                                    }`}>
                                      {formatDaysLeft(path.registrationDeadline)}
                                    </div>
                                  </div>
                                )}
                                <button
                                  onClick={() => handleAddToPlan(path)}
                                  disabled={added}
                                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                                    added
                                      ? 'bg-green-100 text-green-700 cursor-default'
                                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                                  }`}
                                >
                                  {added ? '✓ 已加入' : '加入我的計畫'}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                    <div className="text-4xl mb-3">🎉</div>
                    <p className="text-gray-600">目前沒有額外的升級機會，你的準備已經很充分了！</p>
                  </div>
                )}

                {/* Critical Deadlines */}
                {currentStrategy.criticalDeadlines.filter(d => d.daysLeft > 0).length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">即將到來的截止日</h3>
                    <div className="space-y-2">
                      {currentStrategy.criticalDeadlines.filter(d => d.daysLeft > 0).slice(0, 6).map((dl, i) => (
                        <div key={`${dl.date}-${dl.title}`} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold ${
                            dl.urgency === 'critical' ? 'bg-red-400' :
                            dl.urgency === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                          }`}>
                            {dl.daysLeft}天
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{dl.title}</div>
                            <div className="text-xs text-gray-500">{dl.description}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                            dl.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                            dl.urgency === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {dl.type === 'certificate' ? '證照' : dl.type === 'competition' ? '競賽' : '管道'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab B: My Plan ── */}
            {activeTab === 'myplan' && (
              <div>
                {myPlan.activities.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                    <div className="text-5xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">還沒有選擇任何活動</h3>
                    <p className="text-gray-500 mb-6">
                      前往「即將到來的機會」分頁，選擇你想要參加的證照考試或競賽，加入你的計畫。
                    </p>
                    <button
                      onClick={() => setActiveTab('opportunities')}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                    >
                      查看機會 →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-green-50 rounded-2xl p-4 mb-4 flex items-center gap-3">
                      <div className="text-2xl">📈</div>
                      <div>
                        <div className="font-medium text-green-800">
                          {myPlan.activities.length} 個活動計畫中，預估可提升 {totalBoost}% 錄取率
                        </div>
                        <div className="text-sm text-green-600">
                          完成這些活動後，你的升學競爭力將大幅提升
                        </div>
                      </div>
                    </div>

                    {myPlan.activities.map((activity, i) => (
                      <motion.div key={activity.id} {...stagger(i)}
                        className="bg-white rounded-2xl p-5 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                            activity.type === 'certificate' ? 'bg-amber-50' :
                            activity.type === 'competition' ? 'bg-blue-50' : 'bg-purple-50'
                          }`}>
                            {activity.type === 'certificate' ? '📜' : activity.type === 'competition' ? '🏆' : '📝'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold">{activity.targetItemName}</div>
                            <div className="text-sm text-gray-500 mt-1">{activity.notes}</div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {activity.pathwayImpact.map(p => (
                                <span key={p} className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 rounded-full">
                                  {PATHWAY_SHORT[p] || p}
                                </span>
                              ))}
                              {activity.probabilityBoost > 0 && (
                                <span className="px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded-full font-medium">
                                  +{activity.probabilityBoost}%
                                </span>
                              )}
                            </div>
                            {/* Timeline info */}
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                              {activity.registrationDeadline && (
                                <span>報名：{formatDaysLeft(activity.registrationDeadline)}</span>
                              )}
                              {activity.eventDate && (
                                <span>考試/比賽：{new Date(activity.eventDate).toLocaleDateString('zh-TW')}</span>
                              )}
                            </div>
                          </div>

                          {/* Status control */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <select
                              value={activity.status}
                              onChange={(e) => handleUpdateStatus(activity.id, e.target.value as ChosenActivity['status'])}
                              className={`text-xs font-medium rounded-lg px-3 py-1.5 border-0 ${
                                activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                                activity.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                                activity.status === 'registered' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <option value="planned">計畫中</option>
                              <option value="registered">已報名</option>
                              <option value="preparing">準備中</option>
                              <option value="completed">已完成</option>
                            </select>
                            <button
                              onClick={() => handleRemoveFromPlan(activity.id)}
                              className="text-xs text-red-400 hover:text-red-600 transition"
                            >
                              移除
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab C: Pathway Readiness ── */}
            {activeTab === 'readiness' && (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>{currentAnalysis.department.departmentName}</strong> — 6 種升學管道準備度
                </p>
                <div className="space-y-3">
                  {allMatches.map((pm, i) => {
                    const isOpen = expandedPathway === pm.pathwayType
                    return (
                      <div key={pm.pathwayType} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <button
                          onClick={() => setExpandedPathway(isOpen ? null : pm.pathwayType)}
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                              pm.eligible ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gray-300'
                            }`}>
                              {pm.acceptanceEstimate > 0 ? `${pm.acceptanceEstimate}` : '--'}
                            </div>
                            <div className="text-left">
                              <div className="font-bold">{pm.pathwayName}</div>
                              <div className="text-xs text-gray-500">
                                {pm.eligible ? `可申請 · 預估 ${pm.acceptanceEstimate}%` : '未符合資格'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-gray-100 rounded-full hidden sm:block">
                              <div className={`h-2 rounded-full ${pm.eligible ? 'bg-green-400' : 'bg-gray-300'}`}
                                style={{ width: `${Math.min(pm.matchScore, 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
                          </div>
                        </button>

                        {isOpen && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4">
                            {pm.matchedItems.length > 0 && (
                              <div className="mb-3">
                                <div className="text-xs font-medium text-green-600 mb-1">已具備</div>
                                <div className="flex flex-wrap gap-1">
                                  {pm.matchedItems.map((item, j) => (
                                    <span key={j} className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded-full">{item}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {pm.missingItems.length > 0 && (
                              <div className="mb-3">
                                <div className="text-xs font-medium text-red-500 mb-1">還需要</div>
                                <div className="flex flex-wrap gap-1">
                                  {pm.missingItems.map((item, j) => (
                                    <span key={j} className="px-2 py-0.5 text-xs bg-red-50 text-red-600 rounded-full">{item}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {pm.actionItems.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 mb-1">下步行動</div>
                                <div className="space-y-1">
                                  {pm.actionItems.slice(0, 3).map((act, j) => (
                                    <div key={j} className="flex items-center gap-2 text-xs text-gray-600">
                                      <div className={`w-1.5 h-1.5 rounded-full ${
                                        act.priority === 'high' ? 'bg-red-400' :
                                        act.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                                      }`} />
                                      <span>{act.title}</span>
                                      <span className="text-gray-400">· {act.deadline}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Quick Actions ── */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mt-8 mb-6">
              <h3 className="text-lg font-bold mb-4">下一步</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => router.push('/first-discovery')}
                  className="bg-white/20 hover:bg-white/30 transition rounded-xl p-4 text-left">
                  <div className="font-semibold mb-1">🔄 重新發現</div>
                  <div className="text-xs opacity-80">重新選擇科系</div>
                </button>
                <button onClick={() => router.push('/portfolio')}
                  className="bg-white/20 hover:bg-white/30 transition rounded-xl p-4 text-left">
                  <div className="font-semibold mb-1">📑 準備材料</div>
                  <div className="text-xs opacity-80">考前/賽前準備</div>
                </button>
                <button onClick={() => router.push('/roadmap')}
                  className="bg-white/20 hover:bg-white/30 transition rounded-xl p-4 text-left">
                  <div className="font-semibold mb-1">🗓️ 時間線</div>
                  <div className="text-xs opacity-80">你的活動時程</div>
                </button>
                <button onClick={() => router.push('/interview')}
                  className="bg-white/20 hover:bg-white/30 transition rounded-xl p-4 text-left">
                  <div className="font-semibold mb-1">📁 申請準備</div>
                  <div className="text-xs opacity-80">上傳管理文件</div>
                </button>
              </div>
            </div>
          </>
        )}

        {plan.createdAt && (
          <p className="text-center text-xs text-gray-400 mb-4">
            資料建立於 {new Date(plan.createdAt).toLocaleDateString('zh-TW')}
          </p>
        )}
      </main>
    </div>
  )
}

function daysFromNowLocal(date: string): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
}

function formatDaysLeft(date: string): string {
  const d = daysFromNowLocal(date)
  if (d <= 0) return '已截止'
  if (d < 7) return `${d} 天後截止`
  if (d < 30) return `${Math.ceil(d / 7)} 週後`
  if (d < 365) return `${Math.ceil(d / 30)} 個月後`
  return `${Math.ceil(d / 365)} 年後`
}
