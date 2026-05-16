// 申請準備頁面 — 4 區塊文件管理 + Supabase Storage
// 成績/證照/競賽/備審資料，支援上傳與下載

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { trackPageView } from '@/lib/analytics'
import { getChosenActivities } from '@/lib/activity-plan'
import type { ChosenActivity, ChosenActivitiesData } from '@/types/activity-plan'
import type { StudentProfile, DepartmentInfo } from '@/types/department'
import { departments } from '@/lib/department-data'
import { uploadFile, listStudentFiles, deleteFiles, checkFileSize, checkFileType, getPublicUrl, downloadFile } from '@/lib/supabase/storage'
import type { StorageBucket } from '@/lib/supabase/storage'

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

interface StoredFile {
  name: string
  id: string
  created_at: string
  metadata?: { size?: number }
}

const SECTIONS = [
  { id: 'grades', icon: '📊', label: '成績', bucket: 'evidence-files' as StorageBucket, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'certificates', icon: '📜', label: '證照', bucket: 'evidence-files' as StorageBucket, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'competitions', icon: '🏆', label: '競賽', bucket: 'evidence-files' as StorageBucket, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'portfolio', icon: '📋', label: '備審資料', bucket: 'portfolio-docs' as StorageBucket, color: 'text-indigo-600', bg: 'bg-indigo-50' },
] as const

type SectionId = typeof SECTIONS[number]['id']

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

const PORTFOLIO_TEMPLATES = [
  { id: 'autobiography', name: '自傳大綱', description: '500-1000字，涵蓋家庭背景、學習經歷、興趣發展、未來規劃' },
  { id: 'study_plan', name: '讀書計畫', description: '近程（入學前）、中程（大一至大三）、遠程（畢業後）規劃' },
  { id: 'project_report', name: '專題實作報告', description: '動機、方法、過程、成果、心得反思，附照片與數據' },
  { id: 'learning_portfolio', name: '學習歷程摘述', description: '課程學習成果 + 多元表現，每項100字核心摘述' },
]

export default function InterviewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<{ profile: StudentProfile; targets: DepartmentInfo[] } | null>(null)
  const [chosenActivities, setChosenActivities] = useState<ChosenActivity[]>([])
  const [activeSection, setActiveSection] = useState<SectionId>('grades')
  const [files, setFiles] = useState<Record<SectionId, StoredFile[]>>({
    grades: [], certificates: [], competitions: [], portfolio: [],
  })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    trackPageView('interview_v2')
    loadData()
  }, [])

  async function loadData() {
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
      setPlan({ profile, targets })
      const chosenData = getChosenActivities()
      setChosenActivities(chosenData.activities)
    }

    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)

    const section = SECTIONS.find(s => s.id === activeSection)!
    const studentId = `local_${plan?.profile?.groupCode || 'demo'}`

    if (!checkFileSize(file, section.bucket)) {
      setUploadError('檔案太大，請確認大小限制')
      return
    }
    if (!checkFileType(file, section.bucket)) {
      setUploadError('不支援的檔案格式')
      return
    }

    setUploading(true)
    try {
      const path = `${activeSection}/${Date.now()}_${file.name}`
      await uploadFile({
        bucket: section.bucket,
        studentId,
        file,
      })
      // Refresh file list
      const updated = await listStudentFiles(section.bucket, studentId)
      setFiles(prev => ({ ...prev, [activeSection]: updated || [] }))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '上傳失敗')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDownload(path: string) {
    const section = SECTIONS.find(s => s.id === activeSection)!
    try {
      const blob = await downloadFile(section.bucket, path)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = path.split('/').pop() || 'download'
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  async function handleDelete(path: string) {
    const section = SECTIONS.find(s => s.id === activeSection)!
    const studentId = `local_${plan?.profile?.groupCode || 'demo'}`
    try {
      await deleteFiles(section.bucket, [path])
      const updated = await listStudentFiles(section.bucket, studentId)
      setFiles(prev => ({ ...prev, [activeSection]: updated || [] }))
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  const certActivities = chosenActivities.filter(a => a.type === 'certificate')
  const compActivities = chosenActivities.filter(a => a.type === 'competition')
  const sectionFiles = files[activeSection]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 border-b border-indigo-100 py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <p className="text-indigo-600 font-semibold text-sm">申請準備</p>
          <span className="text-xs text-gray-500">管理你的申請文件</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Section tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {SECTIONS.map(s => {
            const count = s.id === 'certificates' ? certActivities.length
              : s.id === 'competitions' ? compActivities.length
              : sectionFiles.length
            return (
              <button key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeSection === s.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            )
          })}
        </div>

        {/* Grades Section */}
        {activeSection === 'grades' && (
          <motion.div {...fadeUp} className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-lg text-gray-900 mb-4">📊 成績管理</h2>

              {/* Current stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-purple-50 rounded-xl text-center">
                  <div className="text-xs text-purple-500">在校排名百分位</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {plan?.profile?.gradePercentile ? `${plan.profile.gradePercentile}%` : '未填寫'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <div className="text-xs text-gray-500">目標科系數</div>
                  <div className="text-2xl font-bold text-gray-700">{plan?.targets?.length || 0}</div>
                </div>
              </div>

              {/* Upload area */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.png" onChange={handleUpload} className="hidden" id="grade-upload" />
                <label htmlFor="grade-upload" className="cursor-pointer">
                  <div className="text-3xl mb-2">📄</div>
                  <div className="text-sm text-gray-600 font-medium">上傳成績單</div>
                  <div className="text-xs text-gray-400 mt-1">PDF、JPG、PNG，最大 5MB</div>
                </label>
              </div>

              {uploadError && <div className="text-red-500 text-sm mt-2">{uploadError}</div>}
              {uploading && <div className="text-indigo-500 text-sm mt-2 animate-pulse">上傳中...</div>}
            </div>
          </motion.div>
        )}

        {/* Certificates Section */}
        {activeSection === 'certificates' && (
          <motion.div {...fadeUp} className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-lg text-gray-900 mb-4">📜 證照管理</h2>

              {/* Existing certificates */}
              {plan?.profile?.certificates && plan.profile.certificates.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">已取得</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.profile.certificates.map((cert, i) => (
                      <span key={i} className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                        ✓ {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Planned certificates from chosen activities */}
              {certActivities.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">計畫中</h3>
                  <div className="space-y-2">
                    {certActivities.map(act => (
                      <div key={act.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          act.status === 'completed' ? 'bg-green-100 text-green-700' :
                          act.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                          act.status === 'registered' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {act.status === 'completed' ? '已完成' : act.status === 'preparing' ? '準備中' : act.status === 'registered' ? '已報名' : '計畫中'}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{act.targetItemName}</div>
                          {act.eventDate && (
                            <div className="text-xs text-gray-500">
                              考試日期：{new Date(act.eventDate).toLocaleDateString('zh-TW')}
                            </div>
                          )}
                        </div>
                        {act.probabilityBoost > 0 && (
                          <span className="text-xs text-amber-600 font-bold">+{act.probabilityBoost}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {certActivities.length === 0 && (!plan?.profile?.certificates || plan.profile.certificates.length === 0) && (
                <div className="text-center py-6 text-gray-400">
                  <div className="text-3xl mb-2">📜</div>
                  <p className="text-sm">尚未有證照紀錄</p>
                  <p className="text-xs mt-1">前往能力中心規劃證照考試</p>
                </div>
              )}

              {/* Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mt-4">
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.png" onChange={handleUpload} className="hidden" id="cert-upload" />
                <label htmlFor="cert-upload" className="cursor-pointer">
                  <div className="text-3xl mb-2">📎</div>
                  <div className="text-sm text-gray-600 font-medium">上傳證照副本</div>
                  <div className="text-xs text-gray-400 mt-1">PDF、JPG、PNG，最大 5MB</div>
                </label>
              </div>
              {uploadError && <div className="text-red-500 text-sm mt-2">{uploadError}</div>}
              {uploading && <div className="text-indigo-500 text-sm mt-2 animate-pulse">上傳中...</div>}
            </div>
          </motion.div>
        )}

        {/* Competitions Section */}
        {activeSection === 'competitions' && (
          <motion.div {...fadeUp} className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-lg text-gray-900 mb-4">🏆 競賽管理</h2>

              {/* Existing competitions */}
              {plan?.profile?.competitions && plan.profile.competitions.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">已參加</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.profile.competitions.map((comp, i) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                        🏆 {comp.competitionId} {comp.placing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Planned competitions */}
              {compActivities.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">計畫中</h3>
                  <div className="space-y-2">
                    {compActivities.map(act => (
                      <div key={act.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          act.status === 'completed' ? 'bg-green-100 text-green-700' :
                          act.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                          act.status === 'registered' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {act.status === 'completed' ? '已完成' : act.status === 'preparing' ? '準備中' : act.status === 'registered' ? '已報名' : '計畫中'}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{act.targetItemName}</div>
                          {act.eventDate && (
                            <div className="text-xs text-gray-500">
                              競賽日期：{new Date(act.eventDate).toLocaleDateString('zh-TW')}
                            </div>
                          )}
                        </div>
                        {act.probabilityBoost > 0 && (
                          <span className="text-xs text-blue-600 font-bold">+{act.probabilityBoost}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {compActivities.length === 0 && (!plan?.profile?.competitions || plan.profile.competitions.length === 0) && (
                <div className="text-center py-6 text-gray-400">
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="text-sm">尚未有競賽紀錄</p>
                  <p className="text-xs mt-1">前往能力中心規劃競賽參加</p>
                </div>
              )}

              {/* Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mt-4">
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.png" onChange={handleUpload} className="hidden" id="comp-upload" />
                <label htmlFor="comp-upload" className="cursor-pointer">
                  <div className="text-3xl mb-2">🏅</div>
                  <div className="text-sm text-gray-600 font-medium">上傳獎狀/證明</div>
                  <div className="text-xs text-gray-400 mt-1">PDF、JPG、PNG，最大 5MB</div>
                </label>
              </div>
              {uploadError && <div className="text-red-500 text-sm mt-2">{uploadError}</div>}
              {uploading && <div className="text-indigo-500 text-sm mt-2 animate-pulse">上傳中...</div>}
            </div>
          </motion.div>
        )}

        {/* Portfolio Section */}
        {activeSection === 'portfolio' && (
          <motion.div {...fadeUp} className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-lg text-gray-900 mb-4">📋 備審資料</h2>

              {/* Templates */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">參考範本</h3>
                <div className="grid grid-cols-1 gap-2">
                  {PORTFOLIO_TEMPLATES.map(tpl => (
                    <div key={tpl.id} className="p-3 bg-indigo-50 rounded-xl">
                      <div className="font-medium text-sm text-indigo-700">{tpl.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{tpl.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} className="hidden" id="portfolio-upload" />
                <label htmlFor="portfolio-upload" className="cursor-pointer">
                  <div className="text-3xl mb-2">📁</div>
                  <div className="text-sm text-gray-600 font-medium">上傳備審文件</div>
                  <div className="text-xs text-gray-400 mt-1">PDF、Word，最大 10MB</div>
                </label>
              </div>
              {uploadError && <div className="text-red-500 text-sm mt-2">{uploadError}</div>}
              {uploading && <div className="text-indigo-500 text-sm mt-2 animate-pulse">上傳中...</div>}
            </div>
          </motion.div>
        )}

        {/* File list */}
        {sectionFiles.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">已上傳文件</h3>
            <div className="space-y-2">
              {sectionFiles.map(file => (
                <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{file.name}</div>
                    <div className="text-xs text-gray-400">{new Date(file.created_at).toLocaleDateString('zh-TW')}</div>
                  </div>
                  <button onClick={() => handleDownload(`${file.name}`)}
                    className="px-3 py-1.5 bg-indigo-100 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-200 transition">
                    下載
                  </button>
                  <button onClick={() => handleDelete(`${file.name}`)}
                    className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition">
                    刪除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mt-8 mb-6">
          <h3 className="text-lg font-bold mb-4">快速導航</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => router.push('/ability-account')}
              className="bg-white/20 hover:bg-white/30 transition rounded-xl p-3 text-left">
              <div className="font-semibold text-sm">🎯 能力中心</div>
              <div className="text-xs opacity-80">管理活動計畫</div>
            </button>
            <button onClick={() => router.push('/portfolio')}
              className="bg-white/20 hover:bg-white/30 transition rounded-xl p-3 text-left">
              <div className="font-semibold text-sm">📑 準備材料</div>
              <div className="text-xs opacity-80">查看準備事項</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
