// 科系資訊：每個科系的教學特色、研究方向、職涯方向
export interface DepartmentInfo {
  id: string
  schoolId: string
  schoolName: string
  departmentName: string
  groupCode: string
  groupName: string

  // 科系特色
  description: string        // 一句話介紹
  features: string[]         // 教學特色（2-3 點）
  researchAreas: string[]    // 研究方向（2-3 點）
  careerPaths: string[]      // 畢業出路（3-5 個）

  // 6 種管道的錄取條件（每個科系不同）
  pathways: Record<string, PathwayRequirement>
}

// 單一管道的錄取條件
export interface PathwayRequirement {
  available: boolean           // 這個科系有沒有這個管道
  minGradePercentile?: number  // 在校成績門檻
  requiredCertificate?: string // 需要的證照
  requiredCompetition?: string // 需要的競賽
  acceptanceRate: number       // 去年錄取率 %
  deadline: string             // 截止日期
  quota?: number               // 招生名額
  lowestScore?: number         // 去年最低錄取分
  specialNote?: string         // 特別備註
}

// 使用者盤點結果
export interface UserProfile {
  grade: number
  gradePercentile: number
  certificates: string[]
  competitions: string[]
  hasProject: boolean
}

// 差距分析結果
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

// 合併的行動計畫（跨多個目標科系）
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
    forDepartments: string[]  // 這個行動項目服務哪些目標科系
  }[]
}
