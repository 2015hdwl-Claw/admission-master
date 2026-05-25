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
import { GROUP_INFO, getGroupName } from '@/types/v4'
import type { GroupCode } from '@/types/v4'
import { getCertBonus, estimateRelevance, classifyCompetition, getCompMaxBonus, getCategoryName, getCategoriesForDept } from '@/data/bonus-table'
import competitionAdmissionMap from '@/data/competition-admission-map.json'

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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const loadData = useCallback(() => {
    // Read both sources and pick the one with targets
    let planData: { targets: DepartmentInfo[], profile: StudentProfile, createdAt: string } | null = null

    // Source 1: saved_discovery_plan_v4 (auto-saved on step 3)
    const raw = localStorage.getItem('saved_discovery_plan_v4')
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedPlan
        if (parsed.targets?.length > 0 && parsed.profile) {
          planData = parsed
        }
      } catch { /* corrupt */ }
    }

    // Source 2: discovery_state_v4 (saved on every step — may be more recent)
    const stateRaw = localStorage.getItem('discovery_state_v4')
    if (stateRaw) {
      try {
        const s = JSON.parse(stateRaw) as SavedState
        if (s.targets?.length > 0 && s.profile) {
          // Use state if it has targets and either: no plan yet, or state is newer
          if (!planData || (s.targets.length > 0)) {
            planData = { targets: s.targets, profile: s.profile, createdAt: new Date().toISOString() }
          }
        }
      } catch { /* corrupt */ }
    }

    if (planData) {
      resolveAndSet(planData)
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    trackPageView('ability_account_v4')
    loadData()

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'saved_discovery_plan_v4' || e.key === 'discovery_state_v4') loadData()
    }
    const onVisible = () => { if (document.visibilityState === 'visible') loadData() }
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [loadData])

  function resolveAndSet(saved: SavedPlan) {
    const resolved = saved.targets.map(t => {
      const full = departments.find(d => d.id === t.id)
      return full || t
    }).filter(t => t.schoolName) as DepartmentInfo[]

    if (resolved.length === 0) { setLoading(false); return }

    const p = { ...saved, targets: resolved }
    const newAnalyses = resolved.map(d => analyzeDepartment(d, saved.profile))
    setPlan(p)
    setAnalyses(newAnalyses)
    setConsolidated(consolidateActionPlan(newAnalyses))
    setMyPlan(getChosenActivities())
    setSelectedDepartmentIndex(prev => prev >= resolved.length ? 0 : prev)
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
  const currentStrategy = plan ? generateStrategy(plan.profile, plan.targets) : null
  const allMatches = currentAnalysis?.pathwayMatches || []
  const totalBoost = myPlan.activities.reduce((sum, a) => sum + a.probabilityBoost, 0)
  const maxBoost = myPlan.activities.length > 0 ? Math.max(...myPlan.activities.map(a => a.probabilityBoost)) : 0

  // Per-department filtering: derive 招生類別 from department name (groupCode in DB is unreliable)
  const currentDept = plan?.targets[selectedDepartmentIndex]
  const currentDeptCategories = currentDept
    ? getCategoriesForDept(currentDept.departmentName)
    : []
  const allPaths = currentStrategy?.upgradePaths.filter(p => p.canStillMakeIt) || []
  const filteredPaths = currentDept ? allPaths.filter(p => {
    if (p.type === 'certificate') {
      return !p.admissionCategory || currentDeptCategories.includes(p.admissionCategory)
    }
    if (p.type === 'competition') {
      return p.groupCodes.length === 0 || p.groupCodes.includes(currentDept.groupCode)
    }
    return true
  }) : allPaths

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
              {maxBoost > 0 && <span className="text-green-600 ml-2">技優甄審最高 +{maxBoost}%（擇一計算）</span>}
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
                <div className="text-xs text-gray-500">技優甄審加分</div>
                <div className="text-2xl font-bold text-green-600">+{maxBoost}%</div>
                <div className="text-xs text-gray-400">擇一最高</div>
              </motion.div>
            </div>

            {/* Upgrade Guide Summary — per selected department */}
            {(() => {
              const dept = currentAnalysis.department
              const certPaths = filteredPaths.filter(p => p.type === 'certificate')
              const compPaths = filteredPaths.filter(p => p.type === 'competition')
              const bestCert = certPaths.length > 0 ? certPaths.reduce((a, b) => a.probabilityBoost > b.probabilityBoost ? a : b) : null
              const bestComp = compPaths.length > 0 ? compPaths.reduce((a, b) => a.probabilityBoost > b.probabilityBoost ? a : b) : null

              return (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-200/50">
                  <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <span>⚔️</span> 武器庫升級指南 — {dept.departmentName}
                    <span className="text-xs font-normal text-amber-600">{dept.schoolName}</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {bestCert && (
                      <div className="bg-white/80 rounded-xl p-3">
                        <div className="text-xs text-gray-500">最佳證照加分</div>
                        <div className="text-sm font-medium text-gray-900">{bestCert.category}</div>
                        <div className="text-xs text-green-600 font-medium mt-1">技優甄審 +{bestCert.probabilityBoost}%</div>
                        <div className={`mt-1 text-xs ${
                          bestCert.relevance === '高度相關' ? 'text-amber-500' :
                          bestCert.relevance === '中度相關' ? 'text-blue-500' : 'text-gray-400'
                        }`}>{bestCert.relevance}</div>
                      </div>
                    )}
                    {bestComp && (
                      <div className="bg-white/80 rounded-xl p-3">
                        <div className="text-xs text-gray-500">最佳競賽加分</div>
                        <div className="text-sm font-medium text-gray-900">{bestComp.category}</div>
                        <div className="text-xs text-green-600 font-medium mt-1">技優甄審 +{bestComp.probabilityBoost}%</div>
                        <div className="text-xs text-gray-400 mt-1">{LEVEL_LABELS[bestComp.level] || bestComp.level}</div>
                      </div>
                    )}
                    <div className="bg-white/80 rounded-xl p-3">
                      <div className="text-xs text-gray-500">可考證照</div>
                      <div className="text-sm font-medium text-gray-900">{certPaths.length} 張</div>
                      <div className="text-xs text-gray-400 mt-1">含考試時程</div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-3">
                      <div className="text-xs text-gray-500">可報名競賽</div>
                      <div className="text-sm font-medium text-gray-900">{compPaths.length} 個</div>
                      <div className="text-xs text-gray-400 mt-1">尚在報名期內</div>
                    </div>
                  </div>
                </div>
              )
            })()}

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
            {activeTab === 'opportunities' && (
              <div>
                {/* 技優甄審擇一加分提示 */}
                <div className="bg-indigo-50 border border-indigo-200/50 rounded-2xl p-4 mb-4 flex items-start gap-3">
                  <span className="text-2xl shrink-0">ℹ️</span>
                  <div>
                    <div className="text-sm font-medium text-indigo-800">技優甄審加分規則</div>
                    <div className="text-xs text-indigo-600 mt-1">
                      持有多項資格者僅能<strong>擇一項目</strong>計算加分。建議優先選擇加分百分比最高的項目。
                      公式：甄審總成績 = 指定項目甄審成績 × (1 + 優待加分比率)
                    </div>
                  </div>
                </div>

                {filteredPaths.length > 0 ? (
                  <GroupedUpgradePaths
                    paths={filteredPaths}
                    expandedGroups={expandedGroups}
                    setExpandedGroups={setExpandedGroups}
                    isAlreadyAdded={isAlreadyAdded}
                    handleAddToPlan={handleAddToPlan}
                    targetPathways={targetPathways}
                    targetGroupCode={currentAnalysis.department.groupCode}
                    deptCategories={currentDeptCategories}
                  />
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
                          {myPlan.activities.length} 個活動計畫中，技優甄審最高可加 {maxBoost}%
                        </div>
                        <div className="text-sm text-green-600">
                          技優甄審僅能擇一項目加分，建議選擇加分最高的項目
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

const LEVEL_LABELS: Record<string, string> = {
  '丙': '丙級', '乙': '乙級', '甲': '甲級', '單一': '單一級',
  '全國': '全國賽', '分區': '分區賽', '校內': '校內賽', '縣市': '縣市賽', '國際': '國際賽',
}

function resolveGroupName(code: string): string {
  return GROUP_INFO[code as GroupCode]?.name || `群 ${code}`
}

function resolveGroupIcon(code: string): string {
  return GROUP_INFO[code as GroupCode]?.icon || '📚'
}

// ── 分組渲染元件 ──

const RELEVANCE_ORDER = ['高度相關', '中度相關', '低度相關']
const RELEVANCE_STYLE: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  '高度相關': { border: 'border-l-amber-400', bg: 'bg-amber-50/30', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  '中度相關': { border: 'border-l-blue-400', bg: 'bg-blue-50/30', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  '低度相關': { border: 'border-l-gray-400', bg: 'bg-gray-50/30', text: 'text-gray-500', badge: 'bg-gray-100 text-gray-600' },
}

function GroupedUpgradePaths({
  paths,
  expandedGroups,
  setExpandedGroups,
  isAlreadyAdded,
  handleAddToPlan,
  targetPathways,
  targetGroupCode,
  deptCategories,
}: {
  paths: UpgradePath[]
  expandedGroups: Set<string>
  setExpandedGroups: React.Dispatch<React.SetStateAction<Set<string>>>
  isAlreadyAdded: (p: UpgradePath) => boolean
  handleAddToPlan: (p: UpgradePath) => void
  targetPathways: string[]
  targetGroupCode?: string
  deptCategories?: string[]
}) {
  const certs = paths.filter(p => p.type === 'certificate')
  const comps = paths.filter(p => p.type === 'competition')

  function toggleGroup(key: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Group certs by relevance level (高度相關 → 中度相關 → 低度相關)
  function groupCertsByRelevance(items: UpgradePath[]): Map<string, UpgradePath[]> {
    const map = new Map<string, UpgradePath[]>()
    for (const item of items) {
      const rel = item.relevance || '低度相關'
      if (!map.has(rel)) map.set(rel, [])
      map.get(rel)!.push(item)
    }
    // Sort within each group by bonus% desc, then deadline asc
    for (const [, items] of map) {
      items.sort((a, b) => {
        if (b.probabilityBoost !== a.probabilityBoost) return b.probabilityBoost - a.probabilityBoost
        const da = a.registrationDeadline ? daysFromNowLocal(a.registrationDeadline) : 999
        const db = b.registrationDeadline ? daysFromNowLocal(b.registrationDeadline) : 999
        return da - db
      })
    }
    // Sort groups: 高度 → 中度 → 低度
    const sorted = new Map<string, UpgradePath[]>()
    for (const rel of RELEVANCE_ORDER) {
      const group = map.get(rel)
      if (group) sorted.set(rel, group)
    }
    return sorted
  }

  // Group competitions by category - 優先顯示官方四大分類，依獎勵價值排序
  function groupCompsByCategory(items: UpgradePath[]): Map<string, UpgradePath[]> {
    const map = new Map<string, UpgradePath[]>()
    for (const item of items) {
      // Use category directly if it's already an official category name,
      // otherwise classify from title
      const cat = item.category && [
        '國際技能競賽', '亞洲技能競賽', '國手',
        '全國技能競賽', '全國高級中等學校學生技藝競賽', '分區技能競賽',
        '專題實作及創意競賽', '科展',
        '技術創造力競賽', '智慧鐵人競賽', '電腦鼠競賽',
        '美術比賽', '舞蹈比賽', '音樂比賽', '其他'
      ].includes(item.category)
        ? item.category
        : classifyCompetition(item.title || item.category)
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(item)
    }
    for (const [, items] of map) {
      items.sort((a, b) => {
        if (b.probabilityBoost !== a.probabilityBoost) return b.probabilityBoost - a.probabilityBoost
        const da = a.registrationDeadline ? daysFromNowLocal(a.registrationDeadline) : 999
        const db = b.registrationDeadline ? daysFromNowLocal(b.registrationDeadline) : 999
        return da - db
      })
    }

    // 官方分類優先級：依獎勵價值由高到低排序
    const OFFICIAL_CATEGORY_ORDER = [
      '國際技能競賽',
      '亞洲技能競賽',
      '國手',
      '全國技能競賽',
      '全國高級中等學校學生技藝競賽',
      '分區技能競賽',
      '專題實作及創意競賽',
      '科展',
      '技術創造力競賽',
      '智慧鐵人競賽',
      '電腦鼠競賽',
      '美術比賽',
      '舞蹈比賽',
      '音樂比賽',
    ]

    // 重新排序分類顯示順序
    const sorted = new Map<string, UpgradePath[]>()
    // 先加入官方分類
    for (const cat of OFFICIAL_CATEGORY_ORDER) {
      const group = map.get(cat)
      if (group) sorted.set(cat, group)
    }
    // 再加入其餘分類
    for (const [cat, items] of map) {
      if (!OFFICIAL_CATEGORY_ORDER.includes(cat)) {
        sorted.set(cat, items)
      }
    }

    return sorted
  }

  function renderCertSection() {
    if (certs.length === 0) return null
    const grouped = groupCertsByRelevance(certs)
    const totalHigh = grouped.get('高度相關')?.length || 0
    const totalMed = grouped.get('中度相關')?.length || 0
    const totalLow = grouped.get('低度相關')?.length || 0

    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span className="text-2xl">📜</span>
          證照考試
          <span className="text-sm font-normal text-gray-400">({certs.length})</span>
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          高度相關 {totalHigh} 個（乙級 +15%）· 中度相關 {totalMed} 個（乙級 +8%）· 低度相關 {totalLow} 個（乙級 +4%）
        </p>
        <div className="space-y-3">
          {Array.from(grouped.entries()).map(([relevance, items]) => {
            const style = RELEVANCE_STYLE[relevance] || RELEVANCE_STYLE['低度相關']
            const groupKey = `cert-${relevance}`
            const isExpanded = expandedGroups.has(groupKey)
            const bestBonus = items[0]?.probabilityBoost || 0

            return (
              <div key={relevance} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${style.badge}`}>
                      {relevance === '高度相關' ? '++' : relevance === '中度相關' ? '+' : '-'}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900">{relevance}</div>
                      <div className="text-xs text-gray-400">
                        {items.length} 張證照 · 乙級最高 +{bestBonus}%
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-4 space-y-2">
                    {items.map(path => {
                      const added = isAlreadyAdded(path)
                      const levelLabel = LEVEL_LABELS[path.level] || path.level

                      return (
                        <div key={path.id}
                          className={`rounded-xl p-4 border-l-4 ${
                            added ? 'border-l-green-400 bg-green-50/50' :
                            `${style.border} ${style.bg}`
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold">{path.category}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  path.type === 'certificate' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {levelLabel}
                                </span>
                                {path.roi === 'high' && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    高 CP 值
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{path.description}</div>

                              <div className="flex flex-wrap gap-1 mt-2">
                                {path.probabilityBoost > 0 && (
                                  <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                                    path.probabilityBoost >= 25 ? 'bg-green-100 text-green-700' :
                                    path.probabilityBoost >= 10 ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    技優甄審 +{path.probabilityBoost}%
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 text-xs rounded-full ${style.badge}`}>
                                  {relevance}
                                </span>
                              </div>
                            </div>

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
                                {added ? '✓ 已加入' : '加入計畫'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function renderCompSection() {
    if (comps.length === 0) return null
    const grouped = groupCompsByCategory(comps)

    // Map competition category → JSON key in competition-admission-map
    const COMP_CAT_TO_JSON_KEY: Record<string, string> = {
      '國際技能競賽': 'internationalSkills',
      '亞洲技能競賽': 'asianSkillsYouth',
      '全國技能競賽': 'national',
      '全國高級中等學校學生技藝競賽': 'hsVocational',
      '分區技能競賽': 'regional',
      '專題實作及創意競賽': 'projectCreativity',
    }

    // Get trade list for a given competition category + department's admission categories
    function getTradeList(category: string): string[] {
      const jsonKey = COMP_CAT_TO_JSON_KEY[category]
      if (!jsonKey || !deptCategories?.length) return []
      const allTrades: string[] = []
      for (const catCode of deptCategories) {
        const catData = (competitionAdmissionMap.categories as Record<string, any>)[catCode]
        if (!catData) continue
        const trades = catData[jsonKey]
        if (Array.isArray(trades)) {
          allTrades.push(...trades)
        }
      }
      return [...new Set(allTrades)]
    }

    // 官方分類額外資訊
    const OFFICIAL_CATEGORY_INFO: Record<string, { icon: string; url?: string; date?: string }> = {
      '國際技能競賽': {
        icon: '🌍',
      },
      '亞洲技能競賽': {
        icon: '🌏',
        url: 'https://worldskillsasiataipei2025.com/',
        date: '2025-08'
      },
      '國手': {
        icon: '🏆',
      },
      '全國技能競賽': {
        icon: '🏅',
        url: 'https://ws.wda.gov.tw/Download.ashx?u=LzAwMS9VcGxvYWQvMzMxL3JlbGZpbGUvMTAyNDgvMTg2MTA3LzAyYWY0YjAzLWZjMmQtNGYxMC1iYzQyLTg1N2QzOWRmNTZiNC5wZGY%3d&n=56ysNTblsYblhajlnIvmioDog73nq7bos73nsKHnq6Ao5YWs5ZGKKS5wZGY%3d',
        date: '2025-07'
      },
      '全國高級中等學校學生技藝競賽': {
        icon: '🎯',
        url: 'https://sci-me.k12ea.gov.tw/PortalFile/ContestData/11615/e8f953de-65f9-4025-8fbe-e4830fe7723b.pdf',
        date: '2025-03'
      },
      '分區技能競賽': {
        icon: '📍',
        url: 'https://ws.wda.gov.tw/Download.ashx?u=LzAwMS9VcGxvYWQvMzMxL3JlbGZpbGUvMTAyNDgvMTg1MjI2L2M1NzNkYmYyLWRlMTEtNDFlZC05ZTRjLWFiY2RlODJhYjNkZS5wZGY%3d&n=56ysNTblsYblhajlnIvmioDog73nq7bos73ljJfljYDliIbljYDmioDog73nq7bos73nsKHnq6AucGRm',
        date: '2025-05'
      },
      '專題實作及創意競賽': {
        icon: '💡',
        url: 'https://vtedu.k12ea.gov.tw/uploads/17745900443165MS9asHP.pdf',
        date: '2025-06'
      },
      '科展': {
        icon: '🔬',
      },
      '技術創造力競賽': {
        icon: '🔧',
      },
      '智慧鐵人競賽': {
        icon: '🤖',
      },
      '電腦鼠競賽': {
        icon: '🖱️',
      },
      '美術比賽': {
        icon: '🎨',
      },
      '舞蹈比賽': {
        icon: '💃',
      },
      '音樂比賽': {
        icon: '🎵',
      },
    }

    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          競賽機會
          <span className="text-sm font-normal text-gray-400">({comps.length})</span>
        </h3>
        <div className="space-y-3">
          {Array.from(grouped.entries()).map(([category, items]) => {
            const groupKey = `comp-${category}`
            const isExpanded = expandedGroups.has(groupKey)
            const maxBonus = getCompMaxBonus(category as any)
            const officialInfo = OFFICIAL_CATEGORY_INFO[category]

            return (
              <div key={category} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      officialInfo ? 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {officialInfo?.icon ||
                       category === '全國高級中等學校學生技藝競賽' ? '技' :
                       category === '科展' ? '科' : '賽'}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        {category}
                        {officialInfo?.url && (
                          <a
                            href={officialInfo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                          >
                            官方簡章 →
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-3">
                        <span>{items.length} 個比賽 · 最高 +{maxBonus}%</span>
                        {officialInfo?.date && <span>📅 {officialInfo.date}</span>}
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-4 space-y-3">
                    {/* Trade list for this competition category */}
                    {(() => {
                      const trades = getTradeList(category)
                      if (trades.length === 0) return null
                      return (
                        <div className="p-3 bg-indigo-50/50 rounded-xl">
                          <div className="text-xs font-bold text-indigo-700 mb-2">
                            適用職類（{trades.length} 項）
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {trades.map((t, i) => (
                              <span key={i} className="px-2 py-1 text-xs bg-white rounded-lg border border-indigo-100 text-gray-700">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                    {/* Competition items — info only, no per-item button */}
                    {items.map(path => {
                      const levelLabel = LEVEL_LABELS[path.level] || path.level
                      return (
                        <div key={path.id}
                          className={`rounded-xl p-3 border-l-4 ${
                            path.roi === 'high' ? 'border-l-amber-400 bg-amber-50/30' :
                            'border-l-blue-400 bg-blue-50/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm">{path.category}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                              {levelLabel}
                            </span>
                            {path.probabilityBoost > 0 && (
                              <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                                path.probabilityBoost >= 30 ? 'bg-green-100 text-green-700' :
                                path.probabilityBoost >= 15 ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                技優甄審 +{path.probabilityBoost}%
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{path.description}</div>
                          {path.registrationDeadline && (
                            <div className="text-xs mt-1 text-gray-400">
                              報名截止 {path.registrationDeadline}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {/* Single action button per category */}
                    {(() => {
                      const allAdded = items.every(p => isAlreadyAdded(p))
                      return (
                        <button
                          onClick={() => {
                            for (const p of items) {
                              if (!isAlreadyAdded(p)) handleAddToPlan(p)
                            }
                          }}
                          disabled={allAdded}
                          className={`w-full py-2.5 rounded-xl text-sm font-medium transition ${
                            allAdded
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                          }`}
                        >
                          {allAdded ? '✓ 已全部加入' : '加入計畫'}
                        </button>
                      )
                    })()}
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        證照按相關性分組（高度相關加分最多），點擊展開查看詳細項目。
      </p>
      {renderCertSection()}
      {renderCompSection()}
    </div>
  )
}
