// 能力中心 — first-discovery 的深度後台
// 從 localStorage 讀取發現結果，用 pathway-matcher 計算真實管道準備度

'use client'

import { useEffect, useState } from 'react'
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
import type {
  DepartmentInfo,
  StudentProfile,
  DepartmentAnalysis,
  ConsolidatedActionPlan,
  GradeAdvice,
} from '@/types/department'
import type { StrategyAdvice, UpgradePath, CriticalDeadline } from '@/types/strategy'

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

const GROUP_NAMES: Record<string, string> = {
  '01': '餐旅群', '02': '機械群', '03': '電機群', '04': '電子群',
  '05': '資訊群', '06': '商業與管理群', '07': '設計群', '08': '農業群',
  '09': '化工群', '10': '土木群', '11': '海事群', '12': '護理群',
  '13': '家政群', '14': '語文群', '15': '商業與管理群',
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.4 },
})

export default function AbilityAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<SavedPlan | null>(null)
  const [analyses, setAnalyses] = useState<DepartmentAnalysis[]>([])
  const [consolidated, setConsolidated] = useState<ConsolidatedActionPlan | null>(null)
  const [advice, setAdvice] = useState<GradeAdvice | null>(null)
  const [strategy, setStrategy] = useState<StrategyAdvice | null>(null)
  const [expandedPathway, setExpandedPathway] = useState<string | null>(null)

  useEffect(() => {
    trackPageView('ability_account_v3')
    loadData()
  }, [])

  function loadData() {
    // 1. Try saved plan first
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

    // 2. Try auto-saved state
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
    // targets might be stripped (id-only) from old saves — resolve from departments
    const resolved = saved.targets.map(t => {
      const full = departments.find(d => d.id === t.id)
      return full || t
    }).filter(t => t.schoolName) as DepartmentInfo[]

    if (resolved.length === 0) {
      setLoading(false)
      return
    }

    const p = { ...saved, targets: resolved }
    setPlan(p)

    const a = resolved.map(d => analyzeDepartment(d, saved.profile))
    setAnalyses(a)
    setConsolidated(consolidateActionPlan(a))
    if (resolved.length > 0) {
      setAdvice(generateGradeAdvice(resolved[0], saved.profile))
      setStrategy(generateStrategy(saved.profile, resolved))
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  // ── No data: show CTA ──
  if (!plan || analyses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <motion.div {...fadeUp} className="text-center max-w-md">
          <div className="text-6xl mb-6">🗺️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">還沒有探索過你的升學路徑</h1>
          <p className="text-lg text-gray-500 mb-8">
            先完成 4 步驟發現流程，了解你的武器庫和最佳升學路線，然後回來這裡查看完整的能力分析。
          </p>
          <button
            onClick={() => {
              trackFeatureUsage('ability_account_cta_click', {})
              router.push('/first-discovery')
            }}
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
  const groupName = GROUP_NAMES[profile.groupCode] || profile.groupCode
  const allMatches = analyses[0]?.pathwayMatches || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 border-b border-indigo-100 py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <p className="text-indigo-600 font-semibold text-sm">能力中心</p>
          <span className="text-xs text-gray-500">{groupName} · {gradeLabel}</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* ── Target Summary ── */}
        <motion.div {...fadeUp} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">你的能力中心</h1>
          <p className="text-gray-500">基於你的武器庫和 {analyses.length} 個目標科系，即時計算的升學管道準備度。</p>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div {...stagger(0)} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">目標科系</div>
            <div className="text-2xl font-bold text-gray-900">{analyses.length} 個</div>
          </motion.div>
          <motion.div {...stagger(1)} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">最高錄取率</div>
            <div className="text-2xl font-bold text-indigo-600">
              {consolidated ? Math.max(...consolidated.targets.map(t => t.potentialProbability)) : 0}%
            </div>
          </motion.div>
          <motion.div {...stagger(2)} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">待完成行動</div>
            <div className="text-2xl font-bold text-gray-900">{consolidated?.actionItems.length || 0} 項</div>
          </motion.div>
        </div>

        {/* ── Target Department Cards ── */}
        <div className="space-y-4 mb-10">
          <h2 className="text-xl font-bold text-gray-900">目標科系</h2>
          {analyses.map((a, i) => (
            <motion.div key={a.department.id} {...stagger(i)}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{a.department.departmentName}</div>
                  <div className="text-sm text-gray-500">{a.department.schoolName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">最佳管道</div>
                  <div className="text-sm font-bold text-indigo-600">{a.bestPathway.pathwayName}</div>
                  <div className="text-2xl font-bold text-indigo-700">{a.bestPathway.acceptanceEstimate}%</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── 6-Pathway Readiness ── */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">6 大升學管道準備度</h2>
          <p className="text-sm text-gray-500 mb-4">
            以下顯示 <strong>{analyses[0]?.department.departmentName}</strong> 的 6 種管道分析。
            {analyses.length > 1 && '其他科系的數據可在目標科系卡片中查看。'}
          </p>

          <div className="space-y-3">
            {allMatches.map((pm, i) => {
              const isOpen = expandedPathway === pm.pathwayType
              return (
                <motion.div key={pm.pathwayType} {...stagger(i)}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
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
                      {/* Mini progress bar */}
                      <div className="w-24 h-2 bg-gray-100 rounded-full hidden sm:block">
                        <div
                          className={`h-2 rounded-full ${pm.eligible ? 'bg-green-400' : 'bg-gray-300'}`}
                          style={{ width: `${Math.min(pm.matchScore, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4">
                      {/* Matched items */}
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

                      {/* Missing items */}
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

                      {/* Actions */}
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
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Grade-Specific Advice ── */}
        {advice && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {gradeLabel}專屬建議 · {advice.phase}
            </h2>

            {/* High 1: Roadmap */}
            {profile.grade === 10 && advice.roadmap && advice.roadmap.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="space-y-0">
                  {advice.roadmap.map((item, j) => (
                    <div key={j} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${j === 0 ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                        {j < advice.roadmap!.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 min-h-[1.5rem]" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="font-medium text-sm text-gray-800">{item.period}</div>
                        <div className="text-sm text-gray-500">{item.goal}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.actions.map((a, k) => (
                            <span key={k} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{a}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High 2: Upgrade guide */}
            {profile.grade === 11 && advice.upgradeGuide && advice.upgradeGuide.length > 0 && (
              <div className="space-y-2">
                {advice.upgradeGuide.map((item, j) => (
                  <div key={j} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${
                      item.effort === 'high' ? 'bg-red-400' :
                      item.effort === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.weapon}</div>
                      <div className="text-xs text-gray-500">{item.current} → {item.target}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-gray-400">{item.impact}</div>
                      <div className="flex gap-1 mt-0.5 justify-end">
                        {item.pathwayOpened.map(p => (
                          <span key={p} className="px-1.5 py-0.5 text-[10px] bg-indigo-100 text-indigo-700 rounded-full">
                            {pathwayShort(p)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* High 3: Sprint plan */}
            {profile.grade === 12 && advice.sprintPlan && advice.sprintPlan.length > 0 && (
              <div className="space-y-2">
                {advice.sprintPlan.map((item, j) => (
                  <div key={j} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{item.pathway}</div>
                      <div className="text-lg font-bold text-indigo-600">{item.probability}%</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.immediateActions.map((a, k) => (
                        <span key={k} className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 rounded-full">{a}</span>
                      ))}
                    </div>
                    {item.deadline && (
                      <div className="text-xs text-gray-400 mt-2">截止：{item.deadline}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Consolidated Action Plan ── */}
        {consolidated && consolidated.actionItems.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">優先行動計畫</h2>
            <div className="space-y-2">
              {consolidated.actionItems.map((item, i) => (
                <motion.div key={i} {...stagger(i)}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold ${
                    item.priority === 'high' ? 'bg-red-400' :
                    item.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.deadline}</div>
                    {item.forDepartments.length > 1 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.forDepartments.map(d => (
                          <span key={d} className="px-1.5 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded-full">{d}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {item.priority === 'high' ? '重要' : item.priority === 'medium' ? '中等' : '一般'}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Strategy: Upgrade Paths ── */}
        {strategy && strategy.upgradePaths.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {gradeLabel}策略 · {strategy.phase}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {strategy.phase === '鍛造期'
                ? '你還有時間鍛造新武器，以下是 CP 值最高的升級路線'
                : strategy.phase === '衝刺期'
                ? '時間有限，專注在還來得及的行動'
                : '三年養成路線，現在開始累積'}
            </p>

            <div className="space-y-3">
              {strategy.upgradePaths.filter(p => p.canStillMakeIt).map((path, i) => (
                <motion.div key={path.id} {...stagger(i)}
                  className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${
                    path.roi === 'high' ? 'border-l-amber-400' :
                    path.roi === 'medium' ? 'border-l-blue-400' : 'border-l-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          path.type === 'certificate' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
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

                      {/* Impact */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {path.pathwaysOpened.map(pw => (
                          <span key={pw} className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 rounded-full">
                            +{pathwayShort(pw)}管道
                          </span>
                        ))}
                        {path.probabilityBoost > 0 && (
                          <span className="px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded-full">
                            +{path.probabilityBoost}% 錄取率
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    {path.registrationDeadline && (
                      <div className="text-right shrink-0">
                        <div className="text-xs text-gray-400">報名截止</div>
                        <div className={`text-sm font-bold ${
                          daysFromNowLocal(path.registrationDeadline) < 14 ? 'text-red-500' :
                          daysFromNowLocal(path.registrationDeadline) < 30 ? 'text-amber-500' : 'text-gray-700'
                        }`}>
                          {formatDaysLeft(path.registrationDeadline)}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Strategy: Critical Deadlines ── */}
        {strategy && strategy.criticalDeadlines.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">不可錯過的截止日</h2>
            <div className="space-y-2">
              {strategy.criticalDeadlines.filter(d => d.daysLeft > 0).slice(0, 8).map((dl, i) => (
                <motion.div key={`${dl.date}-${dl.title}`} {...stagger(i)}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
                >
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
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
          <h3 className="text-lg font-bold mb-4">快速行動</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                trackFeatureUsage('ability_rediscover_click', {})
                router.push('/first-discovery')
              }}
              className="bg-white/20 hover:bg-white/30 transition rounded-xl p-4 text-left"
            >
              <div className="font-semibold mb-1">重新發現路徑</div>
              <div className="text-sm opacity-80">重新選擇科系或更新武器庫</div>
            </button>
            <button
              onClick={() => {
                trackFeatureUsage('ability_portfolio_click', {})
                router.push('/portfolio')
              }}
              className="bg-white/20 hover:bg-white/30 transition rounded-xl p-4 text-left"
            >
              <div className="font-semibold mb-1">準備申請材料</div>
              <div className="text-sm opacity-80">管理學習歷程和申請文件</div>
            </button>
            <button
              onClick={() => {
                trackFeatureUsage('ability_roadmap_click', {})
                router.push('/roadmap')
              }}
              className="bg-white/20 hover:bg-white/30 transition rounded-xl p-4 text-left"
            >
              <div className="font-semibold mb-1">升學時間線</div>
              <div className="text-sm opacity-80">查看各階段重要時程</div>
            </button>
          </div>
        </div>

        {/* Saved at */}
        {plan.createdAt && (
          <p className="text-center text-xs text-gray-400">
            資料建立於 {new Date(plan.createdAt).toLocaleDateString('zh-TW')}
          </p>
        )}
      </main>
    </div>
  )
}

function pathwayShort(key: string): string {
  const map: Record<string, string> = {
    stars: '繁星', selection: '甄選', distribution: '分發',
    skills: '技優', guarantee: '保送', special: '特殊',
  }
  return map[key] || key
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
