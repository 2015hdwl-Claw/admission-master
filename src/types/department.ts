// 科系資訊：每個科系的教學特色、研究方向、職涯方向
// v3.0: 武器庫導向 + 年級分流 + 管道獨立匹配

// ── 證照相關 ──
export interface CertificateInfo {
  id: string
  name: string
  level: '丙' | '乙' | '甲'
  groupCode: string
}

// ── 競賽相關 ──
export interface CompetitionRecord {
  competitionId: string
  placing: string           // 第1名/金手獎/優勝/佳作...
}

// ── 學生武器庫 ──
export interface StudentProfile {
  grade: 10 | 11 | 12                    // 高一/高二/高三
  groupCode: string                       // 職群代碼
  gradePercentile: number                 // 在校成績排名（前 X%，0 = 未填）
  certificates: string[]                  // 已取得的證照名稱（精確名稱）
  competitions: CompetitionRecord[]       // 競賽紀錄
  hasProject: boolean                     // 專題作品
  projectDescription?: string             // 專題描述
  specialExperiences?: string             // 特殊經歷
}

// ── 科系資訊 ──
export interface DepartmentInfo {
  id: string
  schoolId: string
  schoolName: string
  departmentName: string
  groupCode: string
  groupName: string

  description: string
  fullDescription?: string  // 完整科系介紹
  website: string
  techadmiUrl?: string      // techadmi 詳細頁
  youtubeUrl?: string       // YouTube 介紹影片
  features: string[]
  researchAreas: string[]
  careerPaths: string[]

  // 護城河：職涯出路資料（104 升學就業地圖）
  publicPrivate?: string
  region?: string
  careerOutcomes?: {
    topJobs: { title: string; freshSalary: number; avgSalary: number }[]
    freshAvgSalary: number
    avgSalary: number
    topIndustries: { name: string; salary: number }[]
    requiredTools: string[]
    requiredSkills: string[]
    requiredCerts: string[]
    source: string
    fetchedAt: string
  }

  // 來源資訊
  source?: {
    year: number
    deptCode: string
    crawledAt: string
  }

  // 6 種管道的錄取條件
  pathways: Record<string, PathwayRequirement>
}

// ── 管道條件（v3.0 豐富版） ──
export interface PathwayRequirement {
  available: boolean
  acceptanceRate: number
  deadline: string
  quota?: number

  // 繁星推薦
  minGradePercentile?: number
  needSchoolRecommendation?: boolean

  // 甄選入學
  testScoreWeight?: number       // 統測權重 %
  portfolioWeight?: number       // 備審權重 %
  interviewWeight?: number       // 面試權重 %
  lowestScore?: number

  // 技優甄審
  requiredCertificates?: string[]   // 精確證照名稱（任一符合即可）
  certificateLevel?: string         // 乙級/甲級
  certificateMatchRule?: 'any' | 'all' | 'count'
  minCertificateCount?: number

  // 技優保送
  requiredCompetitions?: string[]   // 精確競賽名稱
  requiredCompetitionLevel?: string // 全國/國際
  requiredPlacing?: string          // 前三名/金手獎/優勝

  // 特殊選才
  specialConditions?: string[]

  // 通用
  specialNote?: string

  // 舊版相容（漸進淘汰）
  requiredCertificate?: string
  requiredCompetition?: string
}

// ── 管道匹配結果（單一管道） ──
export interface PathwayMatch {
  pathwayType: string           // stars/selection/distribution/skills/guarantee/special
  pathwayName: string           // 繁星推薦/甄選入學/...
  eligible: boolean             // 是否符合基本資格
  matchScore: number            // 0-100 匹配度
  matchedItems: string[]        // 已符合的條件
  missingItems: string[]        // 還缺的條件
  acceptanceEstimate: number    // 預估錄取率
  actionItems: ActionItem[]     // 需要完成的行動
}

export interface ActionItem {
  title: string
  description: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  forPathway: string            // 對應哪個管道
}

// ── 年級導向建議 ──
export interface GradeAdvice {
  grade: 10 | 11 | 12
  phase: string                 // 探索期/準備期/衝刺期
  topPathways: PathwayMatch[]   // 推薦的管道
  roadmap?: RoadmapItem[]       // 高一/高二專用：時間線建議
  upgradeGuide?: UpgradeItem[]  // 高二專用：武器升級建議
  sprintPlan?: SprintItem[]     // 高三專用：衝刺計畫
}

export interface RoadmapItem {
  period: string                // 高一上/高一下/...
  goal: string                  // 這段時間的目標
  actions: string[]             // 具體行動
}

export interface UpgradeItem {
  weapon: string                // 武器名稱
  current: string               // 現在狀態
  target: string                // 目標狀態
  effort: 'low' | 'medium' | 'high'
  impact: string                // 完成後打通哪個管道
  pathwayOpened: string[]       // 打通的管道
}

export interface SprintItem {
  pathway: string               // 對應管道
  probability: number           // 預估機率
  immediateActions: string[]    // 立即行動
  deadline: string              // 截止日期
}

// ── 科系完整分析結果（v3.0） ──
export interface DepartmentAnalysis {
  department: DepartmentInfo
  pathwayMatches: PathwayMatch[]
  bestPathway: PathwayMatch
  gradeAdvice: GradeAdvice
}

// ── 合併的行動計畫 ──
export interface ConsolidatedActionPlan {
  targets: {
    departmentName: string
    schoolName: string
    bestPathway: string
    currentProbability: number
    potentialProbability: number
  }[]
  actionItems: {
    title: string
    deadline: string
    daysLeft: number
    priority: 'high' | 'medium' | 'low'
    forDepartments: string[]
    forPathway: string
  }[]
}

// ── 向後相容（舊版 type，漸進淘汰） ──
export type UserProfile = StudentProfile

export interface GapAnalysis {
  departmentId: string
  departmentName: string
  schoolName: string
  pathwayType: string
  pathwayName: string
  currentProbability: number
  potentialProbability: number
  alreadyHave: { name: string }[]
  needImprovement: { name: string; current: string; required: string; daysLeft: number }[]
  completelyMissing: { name: string; required: string; daysLeft: number }[]
  actionItems: { title: string; deadline: string; daysLeft: number; priority: 'high' | 'medium' | 'low' }[]
}
