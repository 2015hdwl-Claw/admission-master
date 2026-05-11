export interface Department {
  id: string
  schoolId: string
  schoolName: string
  departmentName: string
  groupCode: string
  groupName: string
  pathwayType: string
  examWeight: number
  portfolioWeight: number
  requiredSubjects: string[]
  subjectWeights: Record<string, number>
  bonusRules: Record<string, number>
  minRequirements: Record<string, any>
  admissionQuota: number
  acceptanceRate: number
  averageScore: number
  tags: string[]
}

export interface SearchFilter {
  groupCode?: string
  pathwayType?: string
  requiredSubjects?: string[]
  minAcceptanceRate?: number
  maxAverageScore?: number
  tags?: string[]
}

export interface GapAnalysis {
  department: Department
  coverage: number
  missingSubjects: string[]
  currentScore: number
  requiredScore: number
  gap: number
  recommendations: string[]
}

// Mock department database for MVP
export const departmentDatabase: Department[] = [
  {
    id: "ntust-business-001",
    schoolId: "ntust",
    schoolName: "台灣科技大學",
    departmentName: "企業管理系",
    groupCode: "06",
    groupName: "商業與管理群",
    pathwayType: "甄選入學",
    examWeight: 50,
    portfolioWeight: 50,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.5, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15, "甲級": 25 },
    minRequirements: { "統測最低分": 350 },
    admissionQuota: 120,
    acceptanceRate: 0.18,
    averageScore: 480,
    tags: ["商管", "企業管理", "熱門"]
  },
  {
    id: "ntust-business-002",
    schoolId: "ntust",
    schoolName: "台灣科技大學",
    departmentName: "資訊管理系",
    groupCode: "06",
    groupName: "商業與管理群",
    pathwayType: "甄選入學",
    examWeight: 60,
    portfolioWeight: 40,
    requiredSubjects: ["國", "英", "數", "專一"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.0, "專一": 2.0 },
    bonusRules: { "丙級": 5, "乙級": 15, "甲級": 25 },
    minRequirements: { "統測最低分": 380 },
    admissionQuota: 90,
    acceptanceRate: 0.12,
    averageScore: 520,
    tags: ["資管", "商管", "熱門", "資訊"]
  },
  {
    id: "ntut-business-001",
    schoolId: "ntut",
    schoolName: "台北科技大學",
    departmentName: "工業工程與管理系",
    groupCode: "06",
    groupName: "商業與管理群",
    pathwayType: "登記分發",
    examWeight: 100,
    portfolioWeight: 0,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "專一": 1.5, "專二": 1.5 },
    bonusRules: {},
    minRequirements: { "統測最低分": 400 },
    admissionQuota: 150,
    acceptanceRate: 0.22,
    averageScore: 450,
    tags: ["工管", "商管", "北科"]
  },
  {
    id: "ncu-business-001",
    schoolId: "ncu",
    schoolName: "中央大學",
    departmentName: "企業管理學系",
    groupCode: "06",
    groupName: "商業與管理群",
    pathwayType: "甄選入學",
    examWeight: 40,
    portfolioWeight: 60,
    requiredSubjects: ["國", "英", "專一"],
    subjectWeights: { "國": 1.0, "英": 2.0, "專一": 2.0 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 320 },
    admissionQuota: 80,
    acceptanceRate: 0.25,
    averageScore: 420,
    tags: ["企管", "中央大學", "一般大學"]
  },
  {
    id: "fju-business-001",
    schoolId: "fju",
    schoolName: "輔仁大學",
    departmentName: "國際企業學系",
    groupCode: "06",
    groupName: "商業與管理群",
    pathwayType: "甄選入學",
    examWeight: 45,
    portfolioWeight: 55,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 2.5, "專一": 1.5, "專二": 1.0 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 300 },
    admissionQuota: 100,
    acceptanceRate: 0.30,
    averageScore: 380,
    tags: ["國企", "輔大", "英文優先"]
  }
]

export function searchDepartments(filter: SearchFilter): Department[] {
  let results = [...departmentDatabase]

  if (filter.groupCode) {
    results = results.filter(d => d.groupCode === filter.groupCode)
  }

  if (filter.pathwayType) {
    results = results.filter(d => d.pathwayType === filter.pathwayType)
  }

  if (filter.requiredSubjects && filter.requiredSubjects.length > 0) {
    results = results.filter(d => {
      const required = new Set(d.requiredSubjects)
      return filter.requiredSubjects!.every(s => required.has(s))
    })
  }

  if (filter.minAcceptanceRate) {
    results = results.filter(d => d.acceptanceRate >= filter.minAcceptanceRate!)
  }

  if (filter.maxAverageScore) {
    results = results.filter(d => d.averageScore <= filter.maxAverageScore!)
  }

  if (filter.tags && filter.tags.length > 0) {
    results = results.filter(d => {
      const deptTags = new Set(d.tags)
      return filter.tags!.some(t => deptTags.has(t))
    })
  }

  return results
}

export function calculateGapAnalysis(
  department: Department,
  studentSubjects: string[],
  studentScores: Record<string, number>,
  certificates: string[] = []
): GapAnalysis {
  const requiredSet = new Set(department.requiredSubjects)
  const studentSet = new Set(studentSubjects)

  const missingSubjects = department.requiredSubjects.filter(s => !studentSet.has(s))
  const coverage = (department.requiredSubjects.length - missingSubjects.length) / department.requiredSubjects.length

  let currentScore = 0
  let totalWeight = 0

  department.requiredSubjects.forEach(subject => {
    if (studentSet.has(subject)) {
      const weight = department.subjectWeights[subject] || 1.0
      currentScore += (studentScores[subject] || 50) * weight
      totalWeight += weight
    }
  })

  const adjustedScore = totalWeight > 0 ? currentScore / totalWeight * 7 : 0

  let bonusPercent = 0
  certificates.forEach(cert => {
    bonusPercent += department.bonusRules[cert] || 0
  })

  const finalScore = adjustedScore * (1 + bonusPercent / 100)

  const gap = department.averageScore - finalScore

  const recommendations: string[] = []

  if (missingSubjects.length > 0) {
    recommendations.push(`需要補考科目: ${missingSubjects.join(', ')}`)
  }

  if (gap > 50) {
    recommendations.push("目前分數落差較大，建議加強弱科或考慮其他科系")
  } else if (gap > 0) {
    recommendations.push("目前分數接近門檻，加強即可達標")
  } else {
    recommendations.push("目前分數已達平均錄取標準")
  }

  if (certificates.length === 0 && Object.keys(department.bonusRules).length > 0) {
    recommendations.push("考取證照可獲得額外加權分數")
  }

  return {
    department,
    coverage,
    missingSubjects,
    currentScore: Math.round(finalScore),
    requiredScore: department.averageScore,
    gap: Math.round(gap),
    recommendations
  }
}

export function getDepartmentById(id: string): Department | undefined {
  return departmentDatabase.find(d => d.id === id)
}
