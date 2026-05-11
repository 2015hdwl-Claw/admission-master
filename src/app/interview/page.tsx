// 個人申請準備頁面 - 個人申請準備工具
// 目標：從面試準備轉變為個人申請準備，幫助學生準備申請資料和面試

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

interface ApplicationDocument {
  id: string
  name: string
  description: string
  required: boolean
  completed: boolean
  tips: string[]
}

interface ApplicationStep {
  id: string
  title: string
  description: string
  documents: ApplicationDocument[]
  timeline: string
  status: 'not_started' | 'in_progress' | 'completed'
}

export default function InterviewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [applicationSteps, setApplicationSteps] = useState<ApplicationStep[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedStep, setSelectedStep] = useState<ApplicationStep | null>(null)

  // 頁面載入時追蹤
  useEffect(() => {
    trackPageView('personal_application_preparation')
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // 獲取用戶資料
      const { data: profileData, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setProfile(profileData)

      // 生成個人申請準備步驟
      generateApplicationSteps(profileData)
    } catch (err) {
      console.error('Error loading user data:', err)
      setError(err instanceof Error ? err.message : '載入資料失敗')
    } finally {
      setLoading(false)
    }
  }

  // 根據用戶職群，生成個人申請準備步驟
  const generateApplicationSteps = (profile: StudentProfile) => {
    const steps: ApplicationStep[] = []

    // 步驟 1: 自傳與學習計畫
    steps.push({
      id: 'autobiography',
      title: '自傳與學習計畫',
      description: '撰寫個人背景、學習動機與未來規劃，展現你的特色與潛力',
      timeline: '建議提前 2-3 個月開始準備',
      status: 'not_started',
      documents: [
        {
          id: 'autobiography_basic',
          name: '個人自傳',
          description: '包括家庭背景、成長過程、興趣發展等個人故事',
          required: true,
          completed: false,
          tips: [
            '從個人成長經歷切入，展現真實的自己',
            '重點突出與申請科系相關的經歷',
            '避免流水帳，要有具體案例和心得',
            '控制在 800-1200 字'
          ]
        },
        {
          id: 'learning_plan',
          name: '學習計畫',
          description: '說明在大學期間的學習目標與規劃',
          required: true,
          completed: false,
          tips: [
            '具體說明想學什麼、為什麼想學',
            '展現對科系的了解與熱情',
            '說明未來的職業發展規劃',
            '與個人自傳相互呼應'
          ]
        },
        {
          id: 'motivation_letter',
          name: '讀書計畫',
          description: '詳細的學術研究興趣與學習路徑規劃',
          required: false,
          completed: false,
          tips: [
            '針對特定科系或學術領域深入探討',
            '展現學術潛力與研究興趣',
            '說明選擇該科系的原因',
            '可參考科系官網的師資與研究方向'
          ]
        }
      ]
    })

    // 步驟 2: 學習歷程檔案
    steps.push({
      id: 'learning_portfolio',
      title: '學習歷程檔案',
      description: '系統化整理你的學習成果，包括課堂學習、專題製作、實習經驗等',
      timeline: '持續累積，申請前 1 個月完成整理',
      status: 'not_started',
      documents: [
        {
          id: 'course_learning',
          name: '課堂學習成果',
          description: '重要課程的學習筆記、作業、專案報告等',
          required: true,
          completed: false,
          tips: [
            '選擇與申請科系相關的課程作品',
            '展示學習過程與成果',
            '可包括小組專題、實驗報告等',
            '最好有指導老師的評語或成績'
          ]
        },
        {
          id: 'project_works',
          name: '專題製作記錄',
          description: '專題實作、畢業專題、課外專案等完整記錄',
          required: true,
          completed: false,
          tips: [
            '詳細記錄專題目標、過程、成果',
            '強調個人的貢獻與學習',
            '包含遇到的困難與解決方案',
            '附上照片、圖表、成果展示'
          ]
        },
        {
          id: 'internship_experience',
          name: '實習與校外學習',
          description: '企業實習、校外參訪、產學合作等經驗',
          required: false,
          completed: false,
          tips: [
            '記錄實習單位、工作內容、學習心得',
            '強調實務技能的學習與應用',
            '可請實習指導老師提供評語',
            '展示職場素養與專業態度'
          ]
        }
      ]
    })

    // 步驟 3: 面試準備
    steps.push({
      id: 'interview_prep',
      title: '面試準備',
      description: '準備面試常見問題、模擬面試練習、了解面試技巧',
      timeline: '面試前 2-4 週開始準備',
      status: 'not_started',
      documents: [
        {
          id: 'common_questions',
          name: '常見面試問題準備',
          description: '準備自我介紹、申請動機、未來規劃等常見問題的回答',
          required: true,
          completed: false,
          tips: [
            '準備 1-2 分鐘的自我介紹',
            '針對「為什麼選這個科系」準備充分答案',
            '思考個人優缺點',
            '準備具體的例子來支持你的說法'
          ]
        },
        {
          id: 'mock_interview',
          name: '模擬面試練習',
          description: '與老師或同學進行模擬面試，熟悉面試流程',
          required: true,
          completed: false,
          tips: [
            '至少進行 2-3 次模擬面試',
            '錄影練習，觀察自己的肢體語言',
            '請練習伙伴提供回饋意見',
            '練習回答問題的時間控制'
          ]
        },
        {
          id: 'interview_etiquette',
          name: '面試禮儀與技巧',
          description: '了解面試注意事項、穿著建議、禮儀規範',
          required: false,
          completed: false,
          tips: [
            '提前到達面試地點，熟悉環境',
            '穿著整潔得體，展現專業形象',
            '注意眼神交流與肢體語言',
            '準備好要問面試官的問題'
          ]
        }
      ]
    })

    // 步驟 4: 推薦函與證明文件
    steps.push({
      id: 'recommendation_docs',
      title: '推薦函與證明文件',
      description: '蒐集推薦信、成績單、獲獎證書等支持文件',
      timeline: '申請前 1 個月完成準備',
      status: 'not_started',
      documents: [
        {
          id: 'teacher_recommendation',
          name: '教師推薦函',
          description: '請任課教師或導師撰寫推薦信',
          required: true,
          completed: false,
          tips: [
            '選擇熟悉你的老師撰寫推薦函',
            '提前至少 2-3 週邀請老師',
            '提供個人資料、申計畫等參考材料',
            '感謝老師的協助與時間'
          ]
        },
        {
          id: 'transcript',
          name: '成績單',
          description: '官方在校成績單，需要學校蓋章認證',
          required: true,
          completed: false,
          tips: [
            '向學校申請官方成績單',
            '確認成績單包含所有必要學期',
            '檢查成績單資料是否正確',
            '提前申請，避免截止日前後申請'
          ]
        },
        {
          id: 'certificates',
          name: '獲獎與證照證明',
          description: '競賽獲獎、技能檢定、語言測驗等證書複本',
          required: false,
          completed: false,
          tips: [
            '整理所有相關證書文件',
            '確認證書在有效期限內',
            '準備正本供驗證',
            '按重要程度排序整理'
          ]
        }
      ]
    })

    setApplicationSteps(steps)
  }

  const handleToggleDocument = (stepIndex: number, documentId: string) => {
    const updatedSteps = [...applicationSteps]
    const step = updatedSteps[stepIndex]

    // Find and toggle the document
    const document = step.documents.find(d => d.id === documentId)
    if (document) {
      document.completed = !document.completed

      // Update step status
      const completedDocs = step.documents.filter(d => d.completed).length
      const totalRequiredDocs = step.documents.filter(d => d.required).length

      if (completedDocs === 0) {
        step.status = 'not_started'
      } else if (completedDocs < totalRequiredDocs) {
        step.status = 'in_progress'
      } else {
        step.status = 'completed'
      }

      setApplicationSteps(updatedSteps)
      trackFeatureUsage('toggle_application_document')
    }
  }

  const handleViewStepDetails = (step: ApplicationStep) => {
    setSelectedStep(step)
    trackFeatureUsage('view_application_step_details')
  }

  const handleCloseModal = () => {
    setSelectedStep(null)
  }

  const handleGoToPortfolio = () => {
    trackFeatureUsage('go_to_portfolio_from_interview')
    router.push('/portfolio')
  }

  const handleGoToRoadmap = () => {
    trackFeatureUsage('go_to_roadmap_from_interview')
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
            onClick={() => router.push('/login')}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            返回登入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">升學大師 v2.0</span>
                <p className="text-xs text-indigo-600 font-medium">個人申請準備</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {profile?.group_code && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {profile.group_code === '01' ? '餐旅群' :
                     profile.group_code === '02' ? '機械群' :
                     profile.group_code === '03' ? '電機群' :
                     profile.group_code === '04' ? '電子群' :
                     profile.group_code === '05' ? '資訊群' :
                     profile.group_code === '06' ? '商管群' :
                     profile.group_code === '07' ? '設計群' :
                     profile.group_code === '08' ? '農業群' :
                     profile.group_code === '09' ? '化工群' :
                     profile.group_code === '10' ? '土木群' :
                     profile.group_code === '11' ? '海事群' :
                     profile.group_code === '12' ? '護理群' :
                     profile.group_code === '13' ? '家政群' :
                     profile.group_code === '14' ? '語文群' :
                     profile.group_code === '15' ? '商業與管理群' : profile.group_code}
                  </div>
                  <div className="text-xs text-gray-600">
                    {profile.grade ? `${profile.grade} 年級` : '就讀中'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-8 px-4 py-2 bg-orange-100 rounded-full">
            <p className="text-orange-700 font-semibold text-sm">
              📝 個人申請準備 - 申請文件與面試準備指南
            </p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            個人申請完整準備
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            系統化準備個人申請所需的各項文件與面試技巧，
            <br />
            <strong>從自傳到面試，一步步引導你完成申請準備。</strong>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white mr-4">
                📝
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">準備步驟</h3>
                <p className="text-blue-600 font-medium text-2xl">{applicationSteps.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white mr-4">
                ✅
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">已完成步驟</h3>
                <p className="text-green-600 font-medium text-2xl">
                  {applicationSteps.filter(s => s.status === 'completed').length}
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
                  {applicationSteps.filter(s => s.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white mr-4">
                📄
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">必要文件</h3>
                <p className="text-purple-600 font-medium text-2xl">
                  {applicationSteps.reduce((count, step) =>
                    count + step.documents.filter(d => d.required).length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Steps */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              申請準備步驟
            </h2>
            <p className="text-gray-600">
              按順序完成各項準備工作，確保申請資料完整
            </p>
          </div>

          {applicationSteps.map((step, stepIndex) => {
            const completedDocs = step.documents.filter(d => d.completed).length
            const totalDocs = step.documents.length
            const progressPercent = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

            return (
              <div key={stepIndex} className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
                {/* Step Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {stepIndex + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                      <p className="text-sm text-gray-500 mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {step.timeline}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {step.status === 'completed' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">已完成</span>
                    )}
                    {step.status === 'in_progress' && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">準備中</span>
                    )}
                    {step.status === 'not_started' && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">未開始</span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">準備進度</span>
                    <span className="text-sm font-medium text-gray-900">{completedDocs}/{totalDocs} 項 ({progressPercent}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Documents Preview */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {step.documents.slice(0, 4).map((doc) => (
                      <div key={doc.id} className="flex items-center space-x-2 text-sm p-2 bg-gray-50 rounded">
                        <div className={`w-4 h-4 rounded border ${doc.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                          {doc.completed && (
                            <svg className="w-3 h-3 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={doc.completed ? 'text-gray-900 line-through' : 'text-gray-700'}>
                          {doc.name}
                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </div>
                    ))}
                    {step.documents.length > 4 && (
                      <p className="text-xs text-gray-500 col-span-2">... 還有 {step.documents.length - 4} 項文件</p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleViewStepDetails(step)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
                  >
                    <span>查看詳細準備指南</span>
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
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-8 mb-12 text-white">
          <h3 className="text-2xl font-bold mb-6">快速行動</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleGoToPortfolio}
              className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold">準備申請材料</span>
              </div>
              <p className="text-sm opacity-90">管理你的學習歷程和申請文件</p>
            </button>

            <button
              onClick={handleGoToRoadmap}
              className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold">查看申請時間線</span>
              </div>
              <p className="text-sm opacity-90">了解各階段的重要時間點和準備工作</p>
            </button>
          </div>
        </div>

        {/* Help & Guidance */}
        <div className="text-center text-gray-600 text-sm">
          <p className="mb-2">
            <strong>個人申請準備</strong>幫助你系統化準備申請資料
            <br />• 從自傳到面試，<strong>完整的準備流程指南</strong>
            <br />• 每項文件都有詳細的撰寫建議與技巧
            <br />• 提供申請時間規劃與進度追蹤
          </p>
          <p className="text-xs text-gray-500 mt-4">
            建議提前 2-3 個月開始準備，確保各項文件品質
          </p>
        </div>
      </main>

      {/* Modal for Step Details */}
      {selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedStep.title}</h2>
                  <p className="text-gray-600 mt-1">{selectedStep.description}</p>
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {selectedStep.timeline}
                  </p>
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
              <div className="space-y-6">
                {selectedStep.documents.map((doc) => (
                  <div key={doc.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition">
                    <div className="flex items-start space-x-4">
                      {/* Completion Toggle */}
                      <div
                        onClick={() => handleToggleDocument(applicationSteps.indexOf(selectedStep), doc.id)}
                        className={`w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center cursor-pointer ${doc.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                      >
                        {doc.completed && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Document Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className={`text-lg font-semibold text-gray-900 ${doc.completed ? 'line-through' : ''}`}>
                            {doc.name}
                          </h4>
                          {doc.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">必要</span>
                          )}
                          {doc.completed && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">已完成</span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{doc.description}</p>

                        {/* Tips */}
                        <div className="bg-white rounded-lg p-4 border border-indigo-100">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            準備建議
                          </h5>
                          <ul className="space-y-1">
                            {doc.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="text-sm text-gray-700 flex items-start">
                                <span className="text-indigo-600 mr-2">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <strong>準備進度：</strong>
                  {selectedStep.documents.filter(d => d.completed).length} / {selectedStep.documents.length} 項文件
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