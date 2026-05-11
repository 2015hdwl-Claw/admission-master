// 路徑準備材料頁面 - Planner 準備工具
// 目標：從學習歷程記錄轉變為路徑準備材料管理，幫助學生準備升學申請材料

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { trackPageView, trackFeatureUsage } from '@/lib/analytics'

interface StudentProfile {
  user_id: string
  group_code: string
  grade?: string
  total_bonus_percent?: number
}

interface PathwayMaterials {
  pathway: string
  pathwayCode: string
  requiredMaterials: MaterialItem[]
  optionalMaterials: MaterialItem[]
  priority: 'high' | 'medium' | 'low'
  status: 'not_started' | 'in_progress' | 'ready'
}

interface MaterialItem {
  id: string
  name: string
  description: string
  required: boolean
  completed: boolean
  notes?: string
}

export default function PortfolioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [pathwayMaterials, setPathwayMaterials] = useState<PathwayMaterials[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedPathway, setSelectedPathway] = useState<PathwayMaterials | null>(null)

  // 頁面載入時追蹤
  useEffect(() => {
    trackPageView('planner_preparation_materials')
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        const { data: profileData, error } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!error && profileData) {
          setProfile(profileData)
          generatePathwayMaterials(profileData)
        } else {
          const defaultProfile = { user_id: 'demo', group_code: '06', grade: '高三' }
          setProfile(defaultProfile)
          generatePathwayMaterials(defaultProfile)
        }
      } else {
        const defaultProfile = { user_id: 'demo', group_code: '06', grade: '高三' }
        setProfile(defaultProfile)
        generatePathwayMaterials(defaultProfile)
      }
    } catch (err) {
      console.error('Error loading user data:', err)
      setError(err instanceof Error ? err.message : '載入資料失敗')
    } finally {
      setLoading(false)
    }
  }

  // 根據用戶職群，生成各個升學管道的準備材料清單
  const generatePathwayMaterials = (profile: StudentProfile) => {
    const pathways: PathwayMaterials[] = []

    // 繁星推薦
    pathways.push({
      pathway: '繁星推薦',
      pathwayCode: 'xingxing',
      requiredMaterials: [
        {
          id: 'transcript',
          name: '在校成績單',
          description: '包含高一至高三的所有成績，需學校蓋章認證',
          required: true,
          completed: false
        },
        {
          id: 'learning_portfolio',
          name: '學習歷程檔案',
          description: '記錄課堂學習、專題製作、實習經驗等學習成果',
          required: true,
          completed: false
        },
        {
          id: 'performance_record',
          name: '在校表現紀錄',
          description: '包含社團參與、競賽成績、服務學習等表現',
          required: true,
          completed: false
        },
        {
          id: 'teacher_recommendation',
          name: '教師推薦函',
          description: '至少需要 2-3 位任課教師的推薦信',
          required: true,
          completed: false
        }
      ],
      optionalMaterials: [
        {
          id: 'competition_awards',
          name: '競賽獲獎證明',
          description: '技能競賽、專題競賽等獲獎紀錄',
          required: false,
          completed: false
        },
        {
          id: 'certification',
          name: '技術士證照',
          description: '相關領域的技術士證照複本',
          required: false,
          completed: false
        }
      ],
      priority: 'high',
      status: 'not_started'
    })

    // 個人申請
    pathways.push({
      pathway: '個人申請',
      pathwayCode: 'individual',
      requiredMaterials: [
        {
          id: 'transcript_individual',
          name: '在校成績單',
          description: '高一至高三的完整成績單',
          required: true,
          completed: false
        },
        {
          id: 'learning_portfolio_individual',
          name: '學習歷程檔案',
          description: '詳細記錄學習過程與成果',
          required: true,
          completed: false
        },
        {
          id: 'performance_record_individual',
          name: '在校表現紀錄',
          description: '課外活動、社團、競賽等綜合表現',
          required: true,
          completed: false
        }
      ],
      optionalMaterials: [
        {
          id: 'self_introduction',
          name: '自傳 / 學習計畫',
          description: '個人背景、學習動機、未來規劃說明',
          required: false,
          completed: false
        },
        {
          id: 'portfolio_works',
          name: '作品集',
          description: '專題製作、實習成果等作品展示',
          required: false,
          completed: false
        }
      ],
      priority: 'high',
      status: 'not_started'
    })

    // 技優甄審
    if (profile.total_bonus_percent && profile.total_bonus_percent > 10) {
      pathways.push({
        pathway: '技優甄審',
        pathwayCode: 'technical',
        requiredMaterials: [
          {
            id: 'transcript_technical',
            name: '在校成績單',
            description: '完整學業成績紀錄',
            required: true,
            completed: false
          },
          {
            id: 'technical_proof',
            name: '技優證明文件',
            description: '技能競賽獲獎、技優加分等證明文件',
            required: true,
            completed: false
          },
          {
            id: 'learning_portfolio_technical',
            name: '學習歷程檔案',
            description: '專業學習與技能發展紀錄',
            required: true,
            completed: false
          }
        ],
        optionalMaterials: [
          {
            id: 'works_collection',
            name: '技優作品集',
            description: '技能競賽作品、實作成果等展示',
            required: false,
            completed: false
          },
          {
            id: 'recommendation_technical',
            name: '指導老師推薦函',
            description: '專業能力與技優表現推薦',
            required: false,
            completed: false
          }
        ],
        priority: 'medium',
        status: 'not_started'
      })
    }

    // 指考分發
    pathways.push({
      pathway: '指考分發',
      pathwayCode: 'zhikao',
      requiredMaterials: [
        {
          id: 'exam_scores',
          name: '學測成績',
          description: '國文、英文、數學、社會、自然等科目成績',
          required: true,
          completed: false
        },
        {
          id: 'entrance_exam_scores',
          name: '指考成績',
          description: '指定科目考試成績單',
          required: true,
          completed: false
        }
      ],
      optionalMaterials: [
        {
          id: 'exam_preparation_record',
          name: '考試準備紀錄',
          description: '模擬考成績、複習計畫等準備過程',
          required: false,
          completed: false
        }
      ],
      priority: 'medium',
      status: 'not_started'
    })

    // 社區推甄
    pathways.push({
      pathway: '社區推甄',
      pathwayCode: 'community',
      requiredMaterials: [
        {
          id: 'transcript_community',
          name: '在校成績單',
          description: '基本學業成績紀錄',
          required: true,
          completed: false
        },
        {
          id: 'service_record',
          name: '社區服務紀錄',
          description: '服務時數、服務內容、服務成果等詳細紀錄',
          required: true,
          completed: false
        }
      ],
      optionalMaterials: [
        {
          id: 'community_reflection',
          name: '服務心得紀錄',
          description: '社區服務過程中的心得與成長',
          required: false,
          completed: false
        },
        {
          id: 'recommendation_community',
          name: '服務單位推薦函',
          description: '服務機構或指導老師的推薦信',
          required: false,
          completed: false
        }
      ],
      priority: 'low',
      status: 'not_started'
    })

    // 特殊選才
    pathways.push({
      pathway: '特殊選才',
      pathwayCode: 'special',
      requiredMaterials: [
        {
          id: 'special_talent_proof',
          name: '特殊才能證明',
          description: '專業領域的才能展示與證明文件',
          required: true,
          completed: false
        },
        {
          id: 'learning_portfolio_special',
          name: '學習歷程檔案',
          description: '專業學習與才能發展紀錄',
          required: true,
          completed: false
        }
      ],
      optionalMaterials: [
        {
          id: 'talent_works',
          name: '專業作品集',
          description: '代表作品、表演紀錄、創作成果等',
          required: false,
          completed: false
        },
        {
          id: 'recommendation_special',
          name: '專業推薦函',
          description: '專業領域老師或專家的推薦信',
          required: false,
          completed: false
        }
      ],
      priority: 'low',
      status: 'not_started'
    })

    setPathwayMaterials(pathways)
  }

  const handleToggleMaterial = (pathwayIndex: number, materialId: string) => {
    const updatedPathways = [...pathwayMaterials]
    const pathway = updatedPathways[pathwayIndex]

    // Find and toggle the material
    const allMaterials = [...pathway.requiredMaterials, ...pathway.optionalMaterials]
    const material = allMaterials.find(m => m.id === materialId)
    if (material) {
      material.completed = !material.completed

      // Update pathway status
      const requiredCompleted = pathway.requiredMaterials.filter(m => m.completed).length
      const requiredTotal = pathway.requiredMaterials.length

      if (requiredCompleted === 0) {
        pathway.status = 'not_started'
      } else if (requiredCompleted < requiredTotal) {
        pathway.status = 'in_progress'
      } else {
        pathway.status = 'ready'
      }

      setPathwayMaterials(updatedPathways)
      trackFeatureUsage('toggle_material_completion')
    }
  }

  const handleViewPathwayDetails = (pathway: PathwayMaterials) => {
    setSelectedPathway(pathway)
    trackFeatureUsage('view_pathway_materials_details')
  }

  const handleCloseModal = () => {
    setSelectedPathway(null)
  }

  const handleGoToAbilityCenter = () => {
    trackFeatureUsage('go_to_ability_center_from_portfolio')
    router.push('/ability-account')
  }

  const handleGoToRoadmap = () => {
    trackFeatureUsage('go_to_roadmap_from_portfolio')
    router.push('/roadmap')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-600">載入中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">載入失敗</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            返回首頁
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Page title bar */}
      <div className="bg-white/90 border-b border-indigo-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-indigo-600 font-semibold text-sm">路徑準備材料</p>
          {profile?.group_code && (
            <span className="text-xs text-gray-500">
              {profile.group_code === '06' ? '商管群' : profile.group_code} · {profile.grade || '高三'}
            </span>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-8 px-4 py-2 bg-green-100 rounded-full">
            <p className="text-green-700 font-semibold text-sm">
              📋 Planner 準備工具 - 路徑準備材料管理
            </p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            升學申請材料準備清單
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            根據你的職群，為各個升學管道準備所需的申請材料，
            <br />
            <strong>追蹤準備進度，確保不遺漏任何重要文件。</strong>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white mr-4">
                📋
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">準備管道數</h3>
                <p className="text-blue-600 font-medium text-2xl">{pathwayMaterials.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white mr-4">
                ✅
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">準備完成</h3>
                <p className="text-green-600 font-medium text-2xl">
                  {pathwayMaterials.filter(p => p.status === 'ready').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white mr-4">
                ⏳
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">準備中</h3>
                <p className="text-orange-600 font-medium text-2xl">
                  {pathwayMaterials.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pathway Materials List */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              各管道準備材料清單
            </h2>
            <p className="text-gray-600">
              點擊查看詳細材料項目與準備進度
            </p>
          </div>

          {pathwayMaterials.map((pathway, index) => {
            const requiredCompleted = pathway.requiredMaterials.filter(m => m.completed).length
            const requiredTotal = pathway.requiredMaterials.length
            const progressPercent = requiredTotal > 0 ? Math.round((requiredCompleted / requiredTotal) * 100) : 0

            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
                {/* Pathway Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{pathway.pathway}</h3>
                      <p className="text-sm text-gray-600">準備進度：{requiredCompleted}/{requiredTotal} 項 ({progressPercent}%)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {pathway.priority === 'high' && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">高優先級</span>
                    )}
                    {pathway.priority === 'medium' && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">中優先級</span>
                    )}
                    {pathway.priority === 'low' && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">低優先級</span>
                    )}
                    {pathway.status === 'ready' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">準備完成</span>
                    )}
                    {pathway.status === 'in_progress' && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">準備中</span>
                    )}
                    {pathway.status === 'not_started' && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">未開始</span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Materials Preview */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Required Materials */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="text-red-500 mr-2">*</span>
                        必要材料 ({requiredCompleted}/{requiredTotal})
                      </h4>
                      <div className="space-y-2">
                        {pathway.requiredMaterials.slice(0, 3).map((material) => (
                          <div key={material.id} className="flex items-center space-x-2 text-sm">
                            <div className={`w-4 h-4 rounded border ${material.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                              {material.completed && (
                                <svg className="w-3 h-3 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={material.completed ? 'text-gray-900 line-through' : 'text-gray-700'}>
                              {material.name}
                            </span>
                          </div>
                        ))}
                        {pathway.requiredMaterials.length > 3 && (
                          <p className="text-xs text-gray-500">... 還有 {pathway.requiredMaterials.length - 3} 項</p>
                        )}
                      </div>
                    </div>

                    {/* Optional Materials */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">選填材料</h4>
                      <div className="space-y-2">
                        {pathway.optionalMaterials.slice(0, 2).map((material) => (
                          <div key={material.id} className="flex items-center space-x-2 text-sm">
                            <div className={`w-4 h-4 rounded border ${material.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                              {material.completed && (
                                <svg className="w-3 h-3 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={material.completed ? 'text-gray-900 line-through' : 'text-gray-700'}>
                              {material.name}
                            </span>
                          </div>
                        ))}
                        {pathway.optionalMaterials.length > 2 && (
                          <p className="text-xs text-gray-500">... 還有 {pathway.optionalMaterials.length - 2} 項</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleViewPathwayDetails(pathway)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
                  >
                    <span>查看詳細材料清單</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 mb-12 text-white">
          <h3 className="text-2xl font-bold mb-6">快速行動</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleGoToAbilityCenter}
              className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold">查看能力中心</span>
              </div>
              <p className="text-sm opacity-90">了解適合你的升學管道和準備進度</p>
            </button>

            <button
              onClick={handleGoToRoadmap}
              className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold">查看升學時間線</span>
              </div>
              <p className="text-sm opacity-90">了解各階段的重要時間點和準備工作</p>
            </button>
          </div>
        </div>

        {/* Help & Guidance */}
        <div className="text-center text-gray-600 text-sm">
          <p className="mb-2">
            <strong>路徑準備材料</strong>幫助你系統化準備升學申請
            <br />• 根據不同的升學管道，提供<strong>個人化的材料清單</strong>
            <br />• 追蹤每份材料的準備進度，確保不遺漏重要文件
            <br />• 提供<strong>準備建議和時間安排</strong>
          </p>
          <p className="text-xs text-gray-500 mt-4">
            建議優先準備高優先級管道的必要材料，再逐步補充選填材料
          </p>
        </div>
      </main>

      {/* Modal for Pathway Details */}
      {selectedPathway && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedPathway.pathway}</h2>
                  <p className="text-gray-600 mt-1">申請材料詳細清單</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Required Materials */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-red-500 mr-2">*</span>
                  必要材料
                </h3>
                <div className="space-y-3">
                  {selectedPathway.requiredMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition cursor-pointer"
                      onClick={() => handleToggleMaterial(pathwayMaterials.indexOf(selectedPathway), material.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${material.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                          {material.completed && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-gray-900 ${material.completed ? 'line-through' : ''}`}>
                            {material.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${material.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {material.completed ? '已完成' : '待準備'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Materials */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">選填材料 (建議準備)</h3>
                <div className="space-y-3">
                  {selectedPathway.optionalMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition cursor-pointer"
                      onClick={() => handleToggleMaterial(pathwayMaterials.indexOf(selectedPathway), material.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${material.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                          {material.completed && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-gray-900 ${material.completed ? 'line-through' : ''}`}>
                            {material.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${material.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {material.completed ? '已完成' : '選填'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <strong>準備進度：</strong>
                  {selectedPathway.requiredMaterials.filter(m => m.completed).length} / {selectedPathway.requiredMaterials.length} 項必要材料
                </div>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2026 升學大師 v2.0 • 讓每個高職生都找到最適合的升學路徑</p>
          </div>
        </div>
      </footer>
    </div>
  )
}