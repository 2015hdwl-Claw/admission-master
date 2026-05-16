'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { DepartmentInfo, StudentProfile, DepartmentAnalysis, ConsolidatedActionPlan } from '@/types/department'
import { analyzeDepartment, consolidateActionPlan } from '@/lib/pathway-matcher'

interface Props {
  targets: DepartmentInfo[]
  profile: StudentProfile
  onSave: () => void
  onShare: () => void
  onStartPlanning: () => void
}

const GRADE_LABELS: Record<number, string> = { 10: '高一', 11: '高二', 12: '高三' }

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.1, duration: 0.4 },
})

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function PathwayResults({ targets, profile, onSave, onShare, onStartPlanning }: Props) {
  const [analyses, setAnalyses] = useState<DepartmentAnalysis[]>([])
  const [plan, setPlan] = useState<ConsolidatedActionPlan | null>(null)
  const [animatedScores, setAnimatedScores] = useState<Record<string, { current: number; potential: number }>>({})
  const [expandedDept, setExpandedDept] = useState<string | null>(null)

  useEffect(() => {
    if (targets.length === 0) return
    const a = targets.map(dept => analyzeDepartment(dept, profile))
    setAnalyses(a)
    setPlan(consolidateActionPlan(a))
  }, [targets, profile])

  useEffect(() => {
    if (!plan) return
    const timer = setInterval(() => {
      setAnimatedScores(prev => {
        let changed = false
        const next = { ...prev }
        for (const t of plan.targets) {
          const key = t.departmentName
          const cur = next[key] || { current: 0, potential: 0 }
          if (cur.current < t.currentProbability || cur.potential < t.potentialProbability) {
            next[key] = {
              current: Math.min(cur.current + 2, t.currentProbability),
              potential: Math.min(cur.potential + 2, t.potentialProbability),
            }
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 25)
    return () => clearInterval(timer)
  }, [plan])

  if (targets.length === 0) return null
  if (!plan || analyses.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  const grade = profile.grade
  const gradeLabel = GRADE_LABELS[grade] || '高三'

  return (
    <div className="w-full max-w-3xl mx-auto text-center">
      {renderGapSnapshot()}
      {grade === 10 && renderGrade10()}
      {grade === 11 && renderGrade11()}
      {grade === 12 && renderGrade12()}
      {renderCTA()}
      {renderButtons(grade)}
    </div>
  )

  // ═══ 差距快照（所有年級共用） ═══
  function renderGapSnapshot() {
    return (
      <motion.div {...fadeUp} className="mb-8">
        <motion.h1 {...fadeUp} className="text-4xl font-bold text-gray-900 mb-2">
          {grade === 10 ? '你的三年升學路線圖' : grade === 11 ? '你的武器庫升級指南' : '你的最佳升學路線'}
        </motion.h1>
        <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-lg text-gray-500 mb-6">
          {grade === 10 ? '距離申請還有 2 年，現在開始準備剛好！' : grade === 11 ? '專注升級關鍵武器，打通更多升學管道！' : '申請季來了，衝刺最有把握的管道！'}
        </motion.p>

        <div className="space-y-4">
          {analyses.map((analysis, i) => {
            const bp = analysis.bestPathway
            const matched = bp.matchedItems
            const missing = bp.missingItems
            const t = plan?.targets.find(t => t.departmentName === analysis.department.departmentName)
            const current = t?.currentProbability ?? 0
            const potential = t?.potentialProbability ?? 0

            return (
              <motion.div key={analysis.department.id} {...stagger(i)}
                className="bg-white/80 rounded-2xl p-5 shadow-sm text-left"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-lg">{analysis.department.departmentName}</div>
                    <div className="text-sm text-gray-500">{analysis.department.schoolName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">最佳推薦管道</div>
                    <div className="text-sm font-bold text-indigo-600">{bp.pathwayName}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>目前匹配度</span>
                    <span>預估上限</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="h-full bg-indigo-400 rounded-full transition-all duration-1000"
                      style={{ width: `${current}%` }} />
                    <div className="absolute top-0 left-0 h-full border-r-2 border-indigo-700 border-dashed"
                      style={{ width: `${potential}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-indigo-600 font-bold">{current}%</span>
                    <span className="text-purple-600 font-bold">{potential}%</span>
                  </div>
                </div>

                {/* Matched vs Missing */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <div className="text-xs font-bold text-green-700 mb-2">✓ 已具備</div>
                    {matched.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {matched.map((item, j) => (
                          <span key={j} className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">{item}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-green-400">尚無匹配項</p>
                    )}
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl">
                    <div className="text-xs font-bold text-red-700 mb-2">✗ 還需要</div>
                    {missing.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {missing.slice(0, 4).map((item, j) => (
                          <span key={j} className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">{item}</span>
                        ))}
                        {missing.length > 4 && (
                          <span className="px-2 py-0.5 text-xs text-red-400">+{missing.length - 4} 項</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-green-500">條件都具備了！</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    )
  }

  // ═══ CTA：前往能力中心 ═══
  function renderCTA() {
    return (
      <motion.div {...fadeUp} transition={{ delay: 0.6 }} className="mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">建立你的行動計畫</h3>
          <p className="text-sm opacity-90 mb-4">前往能力中心，選擇要參加的證照考試、競賽和學習活動</p>
          <button onClick={onStartPlanning}
            className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition text-lg"
          >
            前往能力中心 →
          </button>
        </div>
      </motion.div>
    )
  }

  // ═══ 高一：三年路線圖 ═══
  function renderGrade10() {
    return (
      <>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">三年準備路線圖</h2>
        {analyses.map((analysis, i) => {
          const roadmap = analysis.gradeAdvice.roadmap || []
          return (
            <motion.div key={analysis.department.id} {...stagger(i)}
              className="bg-white/80 rounded-2xl p-6 shadow-sm text-left mb-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-bold text-xl">{analysis.department.departmentName}</div>
                  <div className="text-sm text-gray-500">{analysis.department.schoolName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">最佳推薦管道</div>
                  <div className="text-sm font-bold text-indigo-600">{analysis.bestPathway.pathwayName}</div>
                </div>
              </div>

              <div className="space-y-0">
                {roadmap.map((item, j) => (
                  <div key={j} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${j === 0 ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                      {j < roadmap.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 min-h-[2rem]" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="font-medium text-sm text-gray-800">{item.period}</div>
                      <div className="text-sm text-gray-500 mb-1">{item.goal}</div>
                      <div className="flex flex-wrap gap-1">
                        {item.actions.map((action, k) => (
                          <span key={k} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{action}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}

        {renderActionPlan('現在可以開始做的事')}
      </>
    )
  }

  // ═══ 高二：武器升級指南 ═══
  function renderGrade11() {
    return (
      <>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">武器升級建議</h2>
        {analyses.map((analysis, i) => {
          const upgrades = analysis.gradeAdvice.upgradeGuide || []
          const eligible = analysis.pathwayMatches.filter(m => m.eligible && m.acceptanceEstimate > 0)
          return (
            <motion.div key={analysis.department.id} {...stagger(i)}
              className="bg-white/80 rounded-2xl p-6 shadow-sm text-left mb-6"
            >
              <div className="mb-4">
                <div className="font-bold text-xl">{analysis.department.departmentName}</div>
                <div className="text-sm text-gray-500">{analysis.department.schoolName}</div>
              </div>

              {upgrades.length > 0 && (
                <div className="mb-5">
                  <h3 className="font-bold text-sm text-gray-700 mb-3">升級項目</h3>
                  <div className="space-y-2">
                    {upgrades.map((item, j) => (
                      <div key={j} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          item.effort === 'high' ? 'bg-red-400' :
                          item.effort === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{item.weapon}</div>
                          <div className="text-xs text-gray-500 truncate">{item.current} → {item.target}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[11px] text-gray-400">{item.impact}</div>
                          <div className="flex gap-1 mt-0.5 justify-end">
                            {item.pathwayOpened.map(p => (
                              <span key={p} className="px-1.5 py-0.5 text-[10px] bg-indigo-100 text-indigo-700 rounded-full">
                                {pathwayShortName(p)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-bold text-sm text-gray-700 mb-2">目前符合的管道</h3>
                {eligible.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {eligible.map(m => (
                      <span key={m.pathwayType} className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                        {m.pathwayName} <span className="text-green-500">({m.acceptanceEstimate}%)</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">升級武器後就能打通更多管道！</p>
                )}
              </div>
            </motion.div>
          )
        })}

        {renderActionPlan('優先升級順序')}
      </>
    )
  }

  // ═══ 高三：管道匹配 + 衝刺計畫 ═══
  function renderGrade12() {
    return (
      <>
        {/* Summary score cards */}
        <div className="space-y-4 mb-6">
          {plan.targets.map((t, i) => {
            const anim = animatedScores[t.departmentName] || { current: 0, potential: 0 }
            return (
              <motion.div key={t.departmentName} {...stagger(i)}
                className="bg-white/80 rounded-2xl p-5 shadow-sm text-left"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="font-bold text-lg">{t.departmentName}</div>
                    <div className="text-sm text-gray-500">{t.schoolName} · {t.bestPathway}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-xl bg-gray-50">
                    <div className="text-sm text-gray-500 mb-1">目前匹配度</div>
                    <div className="text-3xl font-bold text-indigo-600">{anim.current}%</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <div className="text-sm opacity-80 mb-1">預估錄取率</div>
                    <div className="text-3xl font-bold">{anim.potential}%</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* 6-pathway breakdown per department */}
        {analyses.map((analysis, i) => {
          const isExpanded = expandedDept === analysis.department.id
          return (
            <motion.div key={analysis.department.id} {...stagger(i + 3)}
              className="bg-white/80 rounded-2xl shadow-sm text-left mb-4 overflow-hidden"
            >
              <button
                onClick={() => setExpandedDept(isExpanded ? null : analysis.department.id)}
                className="w-full p-5 flex justify-between items-center hover:bg-white/50 transition"
              >
                <div>
                  <div className="font-bold text-lg">{analysis.department.departmentName}</div>
                  <div className="text-sm text-indigo-600">
                    最佳路線: {analysis.bestPathway.pathwayName}
                    {analysis.bestPathway.acceptanceEstimate > 0 && ` (${analysis.bestPathway.acceptanceEstimate}%)`}
                  </div>
                </div>
                <span className="text-gray-400 text-sm">{isExpanded ? '收起 ▲' : '展開 6 大管道 ▼'}</span>
              </button>

              {isExpanded && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {analysis.pathwayMatches.map(pm => (
                      <div key={pm.pathwayType}
                        className={`p-3 rounded-xl text-center transition ${
                          pm.eligible ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">{pm.pathwayName}</div>
                        <div className={`text-lg font-bold ${pm.eligible ? 'text-green-600' : 'text-gray-400'}`}>
                          {pm.acceptanceEstimate > 0 ? `${pm.acceptanceEstimate}%` : '--'}
                        </div>
                        <div className={`text-[10px] ${pm.eligible ? 'text-green-500' : 'text-gray-400'}`}>
                          {pm.eligible ? '可申請' : '未符合'}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}

        {renderActionPlan('你的行動計畫')}
      </>
    )
  }

  // ═══ 共用：合併行動計畫 ═══
  function renderActionPlan(title: string) {
    if (!plan || plan.actionItems.length === 0) return null
    return (
      <motion.div {...fadeUp} transition={{ delay: 0.8 }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">{title}</h2>
        <div className="space-y-3">
          {plan.actionItems.map((item, i) => (
            <motion.div key={i} {...stagger(i + 3)}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white/80 shadow-sm text-left"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold ${
                item.priority === 'high' ? 'bg-red-400' : item.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-lg">{item.title}</div>
                <div className="text-sm text-gray-500">{item.deadline}</div>
                {item.forDepartments.length > 1 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.forDepartments.map(d => (
                      <span key={d} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">{d}</span>
                    ))}
                  </div>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                item.priority === 'high' ? 'bg-red-100 text-red-700' :
                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
              }`}>
                {item.priority === 'high' ? '重要' : item.priority === 'medium' ? '中等' : '一般'}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  // ═══ 共用：底部按鈕 ═══
  function renderButtons(g: number) {
    const encouragements: Record<number, string> = {
      10: '時間站在你這邊！按部就班完成準備，你會很有競爭力。',
      11: '升級關鍵武器，你就能打通更多升學管道！',
      12: plan && plan.targets.some(t => t.currentProbability < 30)
        ? '別擔心！一步一步完成行動計畫，你會越來越接近目標。'
        : '你的條件已經不錯了！完成行動計畫讓你更有把握。',
    }
    return (
      <motion.div {...fadeUp} transition={{ delay: 1.5 }} className="space-y-6">
        <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-center">
          <p className="text-lg font-medium">{encouragements[g]}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={onSave}
            className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-medium hover:bg-indigo-700 transition text-lg"
          >
            儲存我的計畫
          </button>
          <button onClick={onShare}
            className="px-6 py-4 bg-green-600 text-white rounded-2xl font-medium hover:bg-green-700 transition text-lg"
          >
            分享給朋友
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <button onClick={onStartPlanning}
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-medium hover:from-blue-700 hover:to-indigo-700 transition text-lg"
          >
            📊 能力中心分析
          </button>
          <button onClick={() => window.location.href = '/portfolio'}
            className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium hover:from-purple-700 hover:to-pink-700 transition text-lg"
          >
            📑 準備申請材料
          </button>
          <button onClick={() => window.location.href = '/roadmap'}
            className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-medium hover:from-emerald-700 hover:to-teal-700 transition text-lg"
          >
            🗓️ 升學時間線
          </button>
        </div>
      </motion.div>
    )
  }
}

function pathwayShortName(key: string): string {
  const map: Record<string, string> = {
    stars: '繁星', selection: '甄選', distribution: '分發',
    skills: '技優', guarantee: '保送', special: '特殊',
  }
  return map[key] || key
}
