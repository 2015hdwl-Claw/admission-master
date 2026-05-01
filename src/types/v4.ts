// v4 Type Definitions for Admission Master
// Based on: PLAN-v4 + DESIGN-v3-to-v4

// ====== 基礎型別 ======

export type GroupCode = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20'

export type PathwayType = '甄選入學' | '登記分發' | '技優甄審' | '技優保送' | '繁星推薦' | '個人申請'

export type PortfolioCode = 'A' | 'B-1' | 'B-2' | 'C-1' | 'C-2' | 'C-3' | 'C-4' | 'C-5' | 'C-6' | 'C-7' | 'C-8' | 'D-1' | 'D-2' | 'D-3'

export type CertLevel = '丙級' | '乙級' | '甲級' | '單一級'

export type CompetitionLevel = '校內' | '區賽' | '全國' | '國際'

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin'

// ====== 資料模型 ======

export interface StudentProfile {
  id: string
  user_id: string
  group_code: GroupCode
  grade: number // 1-5
  school_name?: string
  target_pathways: PathwayType[]
  target_schools: TargetSchool[]
  total_records: number
  total_bonus_percent: number
  partner_ids: string[]
  warmth_points: number
  parent_ids: string[]
  created_at: string
  updated_at: string
}

export interface AbilityRecord {
  id: string
  student_id: string
  category: AbilityCategory
  title: string
  description?: string
  occurred_date?: string
  semester?: string // '113-1' format

  // 學習歷程代碼
  portfolio_code?: PortfolioCode

  // 升學價值
  scoring_value: {
    type: 'bonus_percent' | 'portfolio_quality'
    value: number | string
  }

  // 學習歷程欓位
  process_description?: string
  reflection?: string
  evidence_url?: string

  // 證照專用
  cert_level?: CertLevel
  cert_number?: string

  // 競賽專用
  competition_level?: CompetitionLevel
  competition_award?: string

  // 專題專用
  capstone_type?: string
  capstone_duration?: string

  tags: string[]
  verified: boolean
  created_at: string
  updated_at: string
}

export type AbilityCategory =
  | 'capstone'      // 專題實作
  | 'certification' // 技術士證照
  | 'internship'    // 實習經驗
  | 'competition'   // 競賽成果
  | 'club'          // 社團活動
  | 'license'        // 其他檢定（多益、日檢等）
  | 'service'       // 志工服務
  | 'project'       // 學習計畫（自主學習 C-1）
  | 'other'          // 其他

export interface TargetSchool {
  school_code: string
  department_code: string
  pathway?: PathwayType
}

export interface LearningPortfolio {
  id: string
  student_id: string
  title: string
  content: string
  version: number
  word_count?: number
  ai_suggestions?: string[]
  quality_grade?: 'A' | 'B' | 'C' | 'D'
  is_final: boolean
  created_at: string
  updated_at: string
}

export interface PathwayScoring {
  id: string
  school_code: string
  department_code: string
  year: number
  pathway_type: PathwayType
  exam_weight: number // A%
  portfolio_weight: number // B%
  total_score: number
  subjects_required: string[]
  subject_weights: { [key: string]: number }
  min_subjects: number
  bonus_rules: { [key: string]: number }
  max_bonus_percent: number
  min_requirements: { [key: string]: any }
  school_name: string
  department_name: string
  admission_quota?: number
  created_at: string
  updated_at: string
}

export interface ExternalCompetition {
  id: string
  name: string
  organizer?: string
  level: CompetitionLevel
  competition_type: CompetitionType
  suitable_groups: GroupCode[]
  suitable_grades: number[]
  portfolio_mapping: 'C-4' | 'D-3'
  scoring_impact?: string
  deadline?: string
  start_date?: string
  registration_deadline?: string
  url?: string
  poster_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CompetitionType = 'hackathon' | 'business' | 'design' | 'tech' | 'academic' | 'art' | 'language' | 'skill'

export interface SubjectStrategy {
  id: string
  student_id: string
  target_schools: TargetSchool[]
  recommended_combination: string[]
  coverage_score: number
  covered_targets: number
  total_targets: number
  risk_assessment: {
    level: 'low' | 'medium' | 'high'
    description: string
  }
  alternatives: Array<{
    combination: string[]
    coverage: number
    risk_level: string
    trade_off?: string
  }>
  gaps: Array<{
    target: string
    missing: string[]
    suggestion: string
  }>
  generated_at: string
}

export interface GroupKnowledge {
  id: string
  group_code: GroupCode
  group_name: string
  description?: string
  certificate_types: Array<{
    name: string
    level: CertLevel
    bonus_percent: number
  }>
  has_certificate_system: boolean
  competition_types: Array<{
    name: string
    category?: string
    pathway?: string
  }>
  career_paths: Array<{
    title: string
    growth: string
    salary_range?: string
  }>
  cross_group_opportunities: GroupCode[]
  structural_advantages: string[]
  structural_challenges: string[]
  annual_quota?: number
  created_at: string
  updated_at: string
}

export interface CompanionMatch {
  id: string
  student_a: string
  student_b: string
  group_code: GroupCode
  grade_diff: number
  trust_level: number // 0-4
  trust_milestones: { [key: string]: boolean }
  messages_sent: number
  warmth_given: number
  warmth_received: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ParentInvite {
  id: string
  student_id: string
  parent_id?: string
  invite_code: string
  can_view_portfolio: boolean
  can_view_timeline: boolean
  can_view_achievements: boolean
  status: 'pending' | 'accepted' | 'revoked'
  created_at: string
  updated_at: string
  expires_at: string
}

// ====== API 請求/回應型別 ======

export interface CreateAbilityRequest {
  category: AbilityCategory
  title: string
  description?: string
  occurred_date?: string
  semester?: string
  portfolio_code?: PortfolioCode
  process_description?: string
  reflection?: string
  evidence_url?: string
  cert_level?: CertLevel
  cert_number?: string
  competition_level?: CompetitionLevel
  competition_award?: string
  capstone_type?: string
  capstone_duration?: string
}

export interface StrategyRequest {
  student_id: string
  target_pathways: PathwayType[]
}

export interface StrategyResponse {
  student_id: string
  target_pathways: PathwayType[]
  analysis: Array<{
    pathway: PathwayType
    schools: Array<{
      school: string
      department: string
      total_score: number
      breakdown: {
        exam_contribution: number
        portfolio_contribution: number
        bonus_percentage: number
        final_weight: number
      }
      gap: {
        score: number
        suggestion: string
      }
    }>
  }>
  recommendations: string[]
}

export interface SubjectStrategyRequest {
  student_id: string
  target_schools: TargetSchool[]
}

export interface SubjectStrategyResponse {
  student_id: string
  recommended: {
    subjects: string[]
    coverage: number
    covered_targets: number
    total_targets: number
    risk_level: 'low' | 'medium' | 'high'
  }
  alternatives: Array<{
    subjects: string[]
    coverage: number
    risk_level: string
    trade_off?: string
  }>
  gaps: Array<{
    target: string
    missing: string[]
    suggestion: string
  }>
}

export interface PortfolioPreviewRequest {
  student_id: string
}

export interface PortfolioPreviewResponse {
  summary: {
    total_items: number
    by_code: {
      [key: string]: {
        count: number
        max: number
        complete: boolean
      }
    }
    overall_completeness: number
    suggestion: string
  }
  preview_by_code: {
    [key: string]: Array<{
      title: string
      description: string
      quality_grade: string
      professor_comment: string
    }>
  }
  autobiographies: LearningPortfolio[]
}

export interface ParentInviteRequest {
  student_id: string
  can_view_portfolio?: boolean
  can_view_timeline?: boolean
  can_view_achievements?: boolean
}

export interface ParentInviteResponse {
  invite_code: string
  invite_url: string
  expires_at: string
}

export interface ParentViewRequest {
  student_id: string
}

export interface ParentViewResponse {
  child: {
    name: string
    grade: number
    group: string
  }
  weekly_summary: {
    week: string
    highlight: string
    achievements: string[]
    ai_comment: string
  }
  timeline: AbilityRecord[]
  warmth_opportunities: number
}

// ====== 工具函數型別 ======

export type PortfolioCodeLimits = {
  [key: string]: {
    code: string
    name: string
    max_per_period: number
    period: 'semester' | 'year'
    optional: boolean
  }
}

export const PORTFOLIO_CODE_LIMITS: PortfolioCodeLimits = {
  'A': { code: 'A', name: '基本資料', max_per_period: 999, period: 'semester', optional: false },
  'B-1': { code: 'B-1', name: '專題實作', max_per_period: 6, period: 'semester', optional: false },
  'B-2': { code: 'B-2', name: '其他課程學習', max_per_period: 6, period: 'semester', optional: false },
  'C-1': { code: 'C-1', name: '自主學習計畫', max_per_period: 2, period: 'year', optional: false },
  'C-2': { code: 'C-2', name: '社團活動', max_per_period: 2, period: 'year', optional: false },
  'C-3': { code: 'C-3', name: '擔任幹部', max_per_period: 2, period: 'year', optional: false },
  'C-4': { code: 'C-4', name: '競賽成果', max_per_period: 2, period: 'year', optional: false },
  'C-5': { code: 'C-5', name: '檢定證照', max_per_period: 2, period: 'year', optional: false },
  'C-6': { code: 'C-6', name: '志工服務', max_per_period: 2, period: 'year', optional: false },
  'C-7': { code: 'C-7', name: '其他', max_per_period: 2, period: 'year', optional: false },
  'C-8': { code: 'C-8', name: '彈性學習', max_per_period: 2, period: 'year', optional: false },
  'D-1': { code: 'D-1', name: '自傳', max_per_period: 1, period: 'year', optional: false },
  'D-2': { code: 'D-2', name: '學習歷程自述', max_per_period: 1, period: 'year', optional: false },
  'D-3': { code: 'D-3', name: '其他有利審查資料', max_per_period: 999, period: 'year', optional: true },
}

export type GroupInfo = {
  code: GroupCode
  name: string
  description: string
  color: string
  icon: string
}

export const GROUP_INFO: Record<GroupCode, GroupInfo> = {
  '01': { code: '01', name: '機械群', description: '機械設計、製造、維修', color: '#E57373', icon: '⚙️' },
  '02': { code: '02', name: '動力機械群', description: '汽車、機車修護與維修', color: '#F97316', icon: '🚗' },
  '03': { code: '03', name: '電機與電子群', description: '電子、電腦、通訊', color: '#3B82F6', icon: '💡' },
  '04': { code: '04', name: '化工群', description: '化學工程、材料', color: '#10B981', icon: '⚗️' },
  '05': { code: '05', name: '土木與建築群', description: '建築、土木工程', color: '#795548', icon: '🏗️' },
  '06': { code: '06', name: '商業與管理群', description: '企管、會計、行銷', color: '#8B5CF6', icon: '💼' },
  '07': { code: '07', name: '外語群', description: '英語、日語等外語', color: '#EC4899', icon: '🌐' },
  '08': { code: '08', name: '設計群', description: '視覺、工業、室內設計', color: '#06B6D4', icon: '🎨' },
  '09': { code: '09', name: '工程與管理群', description: '工程管理、工業安全', color: '#6366F1', icon: '📋' },
  '10': { code: '10', name: '海事群', description: '航海、輪機', color: '#0EA5E9', icon: '🚢' },
  '11': { code: '11', name: '水產群', description: '漁業、養殖', color: '#14B8A6', icon: '🐟' },
  '12': { code: '12', name: '農業群', description: '農業、園藝', color: '#22C55E', icon: '🌾' },
  '13': { code: '13', name: '食品群', description: '食品加工、餐飲', color: '#F59E0B', icon: '🍽' },
  '14': { code: '14', name: '家政委', description: '美容、幼保、家政', color: '#F472B6', icon: '💄' },
  '15': { code: '15', name: '商業與管理群(幼保)', description: '幼兒保育', color: '#DB2777', icon: '👶' },
  '16': { code: '16', name: '餐旅群', description: '餐飲、旅遊', color: '#84CC16', icon: '🍴' },
  '17': { code: '17', name: '農業群(森林)', description: '林業', color: '#65A30D', icon: '🌲' },
  '18': { code: '18', name: '藝術群', description: '美術、音樂、表演', color: '#A855F7', icon: '🎭' },
  '19': { code: '19', name: '電機與電子群(資電)', description: '資訊工程', color: '#6366F1', icon: '💻' },
  '20': { code: '20', name: '藝術群(影視)', description: '影視、動畫', color: '#DC2626', icon: '🎬' },
}

export function getGroupName(groupCode: GroupCode): string {
  return GROUP_INFO[groupCode]?.name || '未知類群'
}

export function getGroupColor(groupCode: GroupCode): string {
  return GROUP_INFO[groupCode]?.color || '#6B7280'
}

export function getGroupIcon(groupCode: GroupCode): string {
  return GROUP_INFO[groupCode]?.icon || '📚'
}
