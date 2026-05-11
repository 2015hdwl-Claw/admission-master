import { supabase } from './supabase'
import { DepartmentRequirements } from '@/types/department'

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

// Mock department database for MVP - expanded to cover major vocational groups
export const departmentDatabase: Department[] = [
  // === 台灣科技大學 (NTUST) ===
  {
    id: "ntust-ba-001",
    schoolId: "ntust", schoolName: "台灣科技大學", departmentName: "企業管理系",
    groupCode: "06", groupName: "商業與管理群", pathwayType: "甄選入學",
    examWeight: 50, portfolioWeight: 50,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.5, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15, "甲級": 25 },
    minRequirements: { "統測最低分": 350 },
    admissionQuota: 120, acceptanceRate: 0.18, averageScore: 480,
    tags: ["商管", "企業管理", "熱門"]
  },
  {
    id: "ntust-im-001",
    schoolId: "ntust", schoolName: "台灣科技大學", departmentName: "資訊管理系",
    groupCode: "05", groupName: "資訊群", pathwayType: "甄選入學",
    examWeight: 60, portfolioWeight: 40,
    requiredSubjects: ["國", "英", "數", "專一"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.0, "專一": 2.0 },
    bonusRules: { "丙級": 5, "乙級": 15, "甲級": 25 },
    minRequirements: { "統測最低分": 380 },
    admissionQuota: 90, acceptanceRate: 0.12, averageScore: 520,
    tags: ["資管", "資訊", "熱門"]
  },
  {
    id: "ntust-ece-001",
    schoolId: "ntust", schoolName: "台灣科技大學", departmentName: "電子工程系",
    groupCode: "04", groupName: "電子群", pathwayType: "甄選入學",
    examWeight: 55, portfolioWeight: 45,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.0, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15, "甲級": 25 },
    minRequirements: { "統測最低分": 400 },
    admissionQuota: 100, acceptanceRate: 0.10, averageScore: 550,
    tags: ["電子", "工程", "熱門"]
  },
  {
    id: "ntust-ee-001",
    schoolId: "ntust", schoolName: "台灣科技大學", departmentName: "電機工程系",
    groupCode: "03", groupName: "電機群", pathwayType: "甄選入學",
    examWeight: 55, portfolioWeight: 45,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.5, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15, "甲級": 25 },
    minRequirements: { "統測最低分": 420 },
    admissionQuota: 80, acceptanceRate: 0.08, averageScore: 570,
    tags: ["電機", "工程", "熱門"]
  },
  {
    id: "ntust-cs-001",
    schoolId: "ntust", schoolName: "台灣科技大學", departmentName: "資訊工程系",
    groupCode: "05", groupName: "資訊群", pathwayType: "甄選入學",
    examWeight: 50, portfolioWeight: 50,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.5, "數": 2.5, "專一": 2.0, "專二": 1.0 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 430 },
    admissionQuota: 70, acceptanceRate: 0.07, averageScore: 580,
    tags: ["資工", "程式", "熱門"]
  },
  {
    id: "ntust-design-001",
    schoolId: "ntust", schoolName: "台灣科技大學", departmentName: "設計系",
    groupCode: "07", groupName: "設計群", pathwayType: "甄選入學",
    examWeight: 30, portfolioWeight: 70,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "專一": 2.5, "專二": 2.5 },
    bonusRules: { "丙級": 5, "乙級": 10 },
    minRequirements: { "統測最低分": 280 },
    admissionQuota: 60, acceptanceRate: 0.15, averageScore: 400,
    tags: ["設計", "創意", "作品集"]
  },
  {
    id: "ntust-hospitality-001",
    schoolId: "ntust", schoolName: "台灣科技大學", departmentName: "色彩與照明科技研究所",
    groupCode: "07", groupName: "設計群", pathwayType: "甄選入學",
    examWeight: 35, portfolioWeight: 65,
    requiredSubjects: ["國", "英", "專一"],
    subjectWeights: { "國": 1.0, "英": 1.5, "專一": 2.5 },
    bonusRules: { "乙級": 10 },
    minRequirements: { "統測最低分": 300 },
    admissionQuota: 40, acceptanceRate: 0.20, averageScore: 380,
    tags: ["設計", "照明"]
  },

  // === 台北科技大學 (NTUT) ===
  {
    id: "ntut-ie-001",
    schoolId: "ntut", schoolName: "台北科技大學", departmentName: "工業工程與管理系",
    groupCode: "06", groupName: "商業與管理群", pathwayType: "登記分發",
    examWeight: 100, portfolioWeight: 0,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "專一": 1.5, "專二": 1.5 },
    bonusRules: {},
    minRequirements: { "統測最低分": 400 },
    admissionQuota: 150, acceptanceRate: 0.22, averageScore: 450,
    tags: ["工管", "商管", "北科"]
  },
  {
    id: "ntut-me-001",
    schoolId: "ntut", schoolName: "台北科技大學", departmentName: "機械工程系",
    groupCode: "02", groupName: "機械群", pathwayType: "甄選入學",
    examWeight: 60, portfolioWeight: 40,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.0, "專一": 2.5, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15, "甲級": 25 },
    minRequirements: { "統測最低分": 390 },
    admissionQuota: 120, acceptanceRate: 0.14, averageScore: 510,
    tags: ["機械", "工程", "北科"]
  },
  {
    id: "ntut-ece-001",
    schoolId: "ntut", schoolName: "台北科技大學", departmentName: "電子工程系",
    groupCode: "04", groupName: "電子群", pathwayType: "甄選入學",
    examWeight: 55, portfolioWeight: 45,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.0, "專一": 2.5, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 385 },
    admissionQuota: 110, acceptanceRate: 0.13, averageScore: 500,
    tags: ["電子", "工程", "北科"]
  },
  {
    id: "ntut-cs-001",
    schoolId: "ntut", schoolName: "台北科技大學", departmentName: "資訊工程系",
    groupCode: "05", groupName: "資訊群", pathwayType: "甄選入學",
    examWeight: 55, portfolioWeight: 45,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.5, "數": 2.5, "專一": 2.0, "專二": 1.0 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 410 },
    admissionQuota: 80, acceptanceRate: 0.09, averageScore: 540,
    tags: ["資工", "程式", "北科"]
  },
  {
    id: "ntut-chem-001",
    schoolId: "ntut", schoolName: "台北科技大學", departmentName: "化學工程與生物科技系",
    groupCode: "09", groupName: "化工群", pathwayType: "甄選入學",
    examWeight: 60, portfolioWeight: 40,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 1.5, "專一": 2.5, "專二": 2.0 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 370 },
    admissionQuota: 60, acceptanceRate: 0.18, averageScore: 460,
    tags: ["化工", "生物科技", "北科"]
  },
  {
    id: "ntut-civil-001",
    schoolId: "ntut", schoolName: "台北科技大學", departmentName: "土木工程系",
    groupCode: "10", groupName: "土木群", pathwayType: "甄選入學",
    examWeight: 60, portfolioWeight: 40,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.0, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 360 },
    admissionQuota: 90, acceptanceRate: 0.20, averageScore: 440,
    tags: ["土木", "工程", "北科"]
  },

  // === 高雄科技大學 (NKUST) ===
  {
    id: "nkust-ba-001",
    schoolId: "nkust", schoolName: "高雄科技大學", departmentName: "企業管理系",
    groupCode: "06", groupName: "商業與管理群", pathwayType: "甄選入學",
    examWeight: 50, portfolioWeight: 50,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.5, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 320 },
    admissionQuota: 200, acceptanceRate: 0.25, averageScore: 420,
    tags: ["商管", "企管", "高科"]
  },
  {
    id: "nkust-hospitality-001",
    schoolId: "nkust", schoolName: "高雄科技大學", departmentName: "觀光管理系",
    groupCode: "01", groupName: "餐旅群", pathwayType: "甄選入學",
    examWeight: 40, portfolioWeight: 60,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 2.0, "專一": 2.0, "專二": 1.0 },
    bonusRules: { "丙級": 5, "乙級": 10 },
    minRequirements: { "統測最低分": 280 },
    admissionQuota: 150, acceptanceRate: 0.28, averageScore: 380,
    tags: ["觀光", "餐旅", "高科"]
  },
  {
    id: "nkust-me-001",
    schoolId: "nkust", schoolName: "高雄科技大學", departmentName: "機械工程系",
    groupCode: "02", groupName: "機械群", pathwayType: "甄選入學",
    examWeight: 60, portfolioWeight: 40,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.0, "專一": 2.5, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 350 },
    admissionQuota: 130, acceptanceRate: 0.20, averageScore: 470,
    tags: ["機械", "工程", "高科"]
  },
  {
    id: "nkust-ee-001",
    schoolId: "nkust", schoolName: "高雄科技大學", departmentName: "電機工程系",
    groupCode: "03", groupName: "電機群", pathwayType: "甄選入學",
    examWeight: 60, portfolioWeight: 40,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.5, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 360 },
    admissionQuota: 110, acceptanceRate: 0.18, averageScore: 480,
    tags: ["電機", "工程", "高科"]
  },
  {
    id: "nkust-marine-001",
    schoolId: "nkust", schoolName: "高雄科技大學", departmentName: "航運技術系",
    groupCode: "11", groupName: "海事群", pathwayType: "甄選入學",
    examWeight: 55, portfolioWeight: 45,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 2.0, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 10 },
    minRequirements: { "統測最低分": 300 },
    admissionQuota: 60, acceptanceRate: 0.30, averageScore: 380,
    tags: ["航運", "海事", "高科"]
  },

  // === 虎尾科技大學 (NFCU) ===
  {
    id: "nfcu-ee-001",
    schoolId: "nfcu", schoolName: "虎尾科技大學", departmentName: "電機工程系",
    groupCode: "03", groupName: "電機群", pathwayType: "甄選入學",
    examWeight: 60, portfolioWeight: 40,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.0, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 330 },
    admissionQuota: 100, acceptanceRate: 0.22, averageScore: 430,
    tags: ["電機", "工程", "虎科"]
  },
  {
    id: "nfcu-ece-001",
    schoolId: "nfcu", schoolName: "虎尾科技大學", departmentName: "電子工程系",
    groupCode: "04", groupName: "電子群", pathwayType: "甄選入學",
    examWeight: 60, portfolioWeight: 40,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.0, "專一": 2.5, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 340 },
    admissionQuota: 90, acceptanceRate: 0.20, averageScore: 440,
    tags: ["電子", "工程", "虎科"]
  },
  {
    id: "nfcu-me-001",
    schoolId: "nfcu", schoolName: "虎尾科技大學", departmentName: "機械設計工程系",
    groupCode: "02", groupName: "機械群", pathwayType: "甄選入學",
    examWeight: 60, portfolioWeight: 40,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.0, "專一": 2.5, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 320 },
    admissionQuota: 110, acceptanceRate: 0.24, averageScore: 420,
    tags: ["機械", "設計", "虎科"]
  },

  // === 勤益科技大學 (NFU) ===
  {
    id: "nfu-ba-001",
    schoolId: "nfu", schoolName: "勤益科技大學", departmentName: "企業管理系",
    groupCode: "06", groupName: "商業與管理群", pathwayType: "甄選入學",
    examWeight: 50, portfolioWeight: 50,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.5, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 10 },
    minRequirements: { "統測最低分": 300 },
    admissionQuota: 140, acceptanceRate: 0.28, averageScore: 400,
    tags: ["商管", "企管", "勤益"]
  },
  {
    id: "nfu-ee-001",
    schoolId: "nfu", schoolName: "勤益科技大學", departmentName: "電機工程系",
    groupCode: "03", groupName: "電機群", pathwayType: "甄選入學",
    examWeight: 60, portfolioWeight: 40,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.0, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 320 },
    admissionQuota: 120, acceptanceRate: 0.22, averageScore: 420,
    tags: ["電機", "工程", "勤益"]
  },
  {
    id: "nfu-cs-001",
    schoolId: "nfu", schoolName: "勤益科技大學", departmentName: "資訊工程系",
    groupCode: "05", groupName: "資訊群", pathwayType: "甄選入學",
    examWeight: 55, portfolioWeight: 45,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.5, "數": 2.0, "專一": 2.0, "專二": 1.0 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 330 },
    admissionQuota: 80, acceptanceRate: 0.20, averageScore: 430,
    tags: ["資工", "程式", "勤益"]
  },

  // === 台灣海洋大學 (NTOU) ===
  {
    id: "ntou-marine-001",
    schoolId: "ntou", schoolName: "台灣海洋大學", departmentName: "航運管理學系",
    groupCode: "11", groupName: "海事群", pathwayType: "甄選入學",
    examWeight: 45, portfolioWeight: 55,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 2.5, "專一": 1.5, "專二": 1.0 },
    bonusRules: { "丙級": 5, "乙級": 10 },
    minRequirements: { "統測最低分": 320 },
    admissionQuota: 50, acceptanceRate: 0.25, averageScore: 410,
    tags: ["航運", "管理", "海大"]
  },
  {
    id: "ntou-food-001",
    schoolId: "ntou", schoolName: "台灣海洋大學", departmentName: "食品科學系",
    groupCode: "09", groupName: "化工群", pathwayType: "甄選入學",
    examWeight: 50, portfolioWeight: 50,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.5, "專一": 2.5, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 340 },
    admissionQuota: 60, acceptanceRate: 0.20, averageScore: 430,
    tags: ["食品", "科學", "海大"]
  },

  // === 暨南國際大學 (NCNU) ===
  {
    id: "ncnu-cs-001",
    schoolId: "ncnu", schoolName: "暨南國際大學", departmentName: "資訊工程學系",
    groupCode: "05", groupName: "資訊群", pathwayType: "甄選入學",
    examWeight: 50, portfolioWeight: 50,
    requiredSubjects: ["國", "英", "數", "專一"],
    subjectWeights: { "國": 1.0, "英": 1.5, "數": 2.5, "專一": 2.0 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 340 },
    admissionQuota: 60, acceptanceRate: 0.22, averageScore: 430,
    tags: ["資工", "暨大"]
  },
  {
    id: "ncnu-ba-001",
    schoolId: "ncnu", schoolName: "暨南國際大學", departmentName: "國際企業學系",
    groupCode: "06", groupName: "商業與管理群", pathwayType: "甄選入學",
    examWeight: 45, portfolioWeight: 55,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 2.5, "專一": 1.5, "專二": 1.0 },
    bonusRules: { "丙級": 5, "乙級": 10 },
    minRequirements: { "統測最低分": 310 },
    admissionQuota: 70, acceptanceRate: 0.26, averageScore: 400,
    tags: ["國企", "暨大", "英文優先"]
  },

  // === 中興大學 (NCHU) ===
  {
    id: "nchu-agri-001",
    schoolId: "nchu", schoolName: "中興大學", departmentName: "農藝學系",
    groupCode: "08", groupName: "農業群", pathwayType: "甄選入學",
    examWeight: 40, portfolioWeight: 60,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.5, "專一": 2.0, "專二": 2.0 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 330 },
    admissionQuota: 50, acceptanceRate: 0.22, averageScore: 420,
    tags: ["農藝", "農業", "中興"]
  },
  {
    id: "nchu-chem-001",
    schoolId: "nchu", schoolName: "中興大學", departmentName: "化學工程學系",
    groupCode: "09", groupName: "化工群", pathwayType: "甄選入學",
    examWeight: 55, portfolioWeight: 45,
    requiredSubjects: ["國", "英", "數", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.0, "數": 2.5, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 380 },
    admissionQuota: 60, acceptanceRate: 0.15, averageScore: 490,
    tags: ["化工", "工程", "中興"]
  },

  // === 嘉義大學 (NCYU) ===
  {
    id: "ncyu-agri-001",
    schoolId: "ncyu", schoolName: "嘉義大學", departmentName: "農藝學系",
    groupCode: "08", groupName: "農業群", pathwayType: "甄選入學",
    examWeight: 45, portfolioWeight: 55,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 1.5, "專一": 2.0, "專二": 2.0 },
    bonusRules: { "丙級": 5, "乙級": 10 },
    minRequirements: { "統測最低分": 300 },
    admissionQuota: 60, acceptanceRate: 0.28, averageScore: 390,
    tags: ["農藝", "農業", "嘉大"]
  },
  {
    id: "ncyu-nursing-001",
    schoolId: "ncyu", schoolName: "嘉義大學", departmentName: "護理學系",
    groupCode: "12", groupName: "護理群", pathwayType: "甄選入學",
    examWeight: 55, portfolioWeight: 45,
    requiredSubjects: ["國", "英", "專一", "專二"],
    subjectWeights: { "國": 1.0, "英": 2.0, "專一": 2.0, "專二": 1.5 },
    bonusRules: { "丙級": 5, "乙級": 15 },
    minRequirements: { "統測最低分": 350 },
    admissionQuota: 80, acceptanceRate: 0.18, averageScore: 460,
    tags: ["護理", "醫護", "嘉大"]
  },

  // === 台南大學 (NUTN) ===
  {
    id: "nutn-edu-001",
    schoolId: "nutn", schoolName: "台南大學", departmentName: "教育學系",
    groupCode: "06", groupName: "商業與管理群", pathwayType: "甄選入學",
    examWeight: 35, portfolioWeight: 65,
    requiredSubjects: ["國", "英", "專一"],
    subjectWeights: { "國": 2.0, "英": 1.5, "專一": 2.0 },
    bonusRules: { "丙級": 5, "乙級": 10 },
    minRequirements: { "統測最低分": 290 },
    admissionQuota: 50, acceptanceRate: 0.30, averageScore: 370,
    tags: ["教育", "南大"]
  },
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

export function searchDepartmentsByText(query: string): Department[] {
  if (!query || query.length < 1) return []
  const q = query.toLowerCase()
  return departmentDatabase.filter(d =>
    d.schoolName.toLowerCase().includes(q) ||
    d.departmentName.toLowerCase().includes(q) ||
    d.groupName.toLowerCase().includes(q) ||
    d.tags.some(t => t.toLowerCase().includes(q))
  )
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

export async function getDepartmentPathways(departmentCode: string): Promise<DepartmentRequirements[]> {
  const { data } = await supabase
    .from('department_requirements')
    .select('*')
    .eq('department_code', departmentCode)
    .eq('academic_year', new Date().getFullYear())

  return data || []
}
