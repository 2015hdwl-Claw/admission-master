// ============================================================
// Phase 1-5: General High School Types (DEPRECATED)
// ============================================================

/** @deprecated Use VocationalGroup instead */
export interface ScoreInput {
  chinese: number;
  english: number;
  math: number;
  science: number;
  social: number;
  mathTrack: 'A' | 'B';
}

/** @deprecated Use UnifiedExamScoreInput instead */
export interface ScoreAnalysis {
  scores: ScoreInput;
  total: number;
  average: number;
  percentile: number;
  recommendedPathways: RecommendedPathway[];
  recommendedDepartments: RecommendedDepartment[];
  summary: string;
}

/** @deprecated */
export interface RecommendedPathway {
  name: string;
  slug: string;
  matchScore: number;
  description: string;
}

/** @deprecated */
export interface RecommendedDepartment {
  university: string;
  department: string;
  category: string;
  matchScore: number;
  note: string;
}

export interface ShareCardData {
  total: number;
  average: number;
  percentile: number;
  topPathway: string;
  goal: string;
  isAnonymous: boolean;
}

// --- Phase 2: Calendar ---

export type CalendarEventType = 'exam' | 'activity' | 'competition' | 'certification' | 'capstone' | 'other';

/** @deprecated Use SkillCategory instead */
export type LearningCode = 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: CalendarEventType;
  isNational: boolean;
  learningCodes: LearningCode[];
  vocational?: boolean;
}

// --- Phase 2: Portfolio ---

/** @deprecated Use SkillItem instead */
export interface PortfolioItem {
  id: string;
  title: string;
  content: string;
  code: LearningCode;
  date: string;
  createdAt: string;
}

// --- Phase 2: Explore ---

/** @deprecated Use VocationalGroup instead */
export type AcademicGroup = '人文' | '社會' | '自然' | '工程' | '商管' | '醫藥衛' | '藝術';

/** @deprecated Use VocationalCategory instead */
export interface AcademicCategory {
  id: string;
  name: string;
  group: AcademicGroup;
  description: string;
  suggestedCodes: LearningCode[];
  exampleDepartments: string[];
}

// --- Phase 2: Roadmap ---

export type GradeLevel = '高一' | '高二' | '高三';

/** @deprecated Use VocationalPathway instead */
export type TargetPathway = '申請入學' | '繁星推薦' | '分發入學';

export interface RoadmapInput {
  grade: GradeLevel;
  pathway: TargetPathway;
  targetGroup: AcademicGroup;
  portfolioCount: number;
}

export interface RoadmapPhase {
  id: string;
  name: string;
  period: string;
  description: string;
  tasks: string[];
  isCurrent: boolean;
  isPast: boolean;
}

// --- Phase 3: Timeline ---

export interface TimelineEntry {
  date: string;
  type: 'portfolio' | 'explore' | 'calendar';
  title: string;
  detail: string;
}

export interface MonthlyReview {
  month: string;
  entries: TimelineEntry[];
  portfolioCount: number;
  exploreCount: number;
  summary: string;
}

// --- Phase 3: Parent ---

export interface ParentWeeklyReport {
  weekStart: string;
  portfolioItems: PortfolioItem[];
  exploredCategories: string[];
  highlights: string[];
}

// --- Phase 3: Pathways ---

export interface PathwayDetail {
  slug: string;
  name: string;
  category: string;
  description: string;
  timeline: string[];
  requirements: string[];
  targetStudents: string;
  quotaPercentage: number;
  tips: string[];
  faqs: { q: string; a: string }[];
  scoreRanges: {
    top: { total: number; description: string };
    high: { total: number; description: string };
    mid: { total: number; description: string };
    base: { total: number; description: string };
  };
}

// --- Phase 4: Onboarding ---

export type OnboardingGrade = '高一' | '高二' | '高三';

/** @deprecated Use VocationalGroup | '未決定' instead */
export type OnboardingTrack = '高職' | '自然組' | '社會組' | '未決定';

export interface OnboardingProfile {
  grade: OnboardingGrade;
  track: OnboardingTrack;
  facts: UserFact[];
  interestAnswers: InterestAnswer[];
  isInterestMode: boolean;
  selectedDirections: string[];
  completedSteps: number;
}

export interface UserFact {
  id: string;
  category: FactCategory;
  label: string;
  detail: string;
}

export type FactCategory =
  | 'academic'
  | 'club'
  | 'extracurricular'
  | 'selfStudy'
  | 'other';

export interface InterestAnswer {
  questionId: number;
  answer: string;
}

export interface InterestQuestion {
  id: number;
  question: string;
  options: { value: string; label: string }[];
}

// --- Phase 4: Direction Engine ---

export interface DirectionRule {
  id: string;
  conditions: string[];
  direction: string;
  directionGroup: string;
  confidence: number;
  reason: string;
  relatedCategoryIds: string[];
}

export interface DirectionResult {
  direction: string;
  directionGroup: string;
  confidence: number;
  reasons: string[];
  relatedCategoryIds: string[];
  factCount: number;
}

// --- Phase 4: Auth ---

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'parent';
  createdAt: string;
}

// --- Phase 4: Subscription ---

export interface Subscription {
  plan: 'free' | 'pro' | 'family';
  expiresAt: string | null;
  activatedAt: string | null;
}

// --- Phase 4: Personalized Roadmap ---

export interface RoadmapGap {
  category: string;
  current: number;
  recommended: number;
  description: string;
}

export interface PersonalizedRoadmapPhase {
  id: string;
  name: string;
  period: string;
  deadline: string;
  description: string;
  tasks: string[];
  gaps: RoadmapGap[];
  isCurrent: boolean;
  isPast: boolean;
}

// --- Phase 5: Interview Simulation ---

export interface InterviewMessage {
  role: 'interviewer' | 'user' | 'feedback';
  content: string;
}

export interface InterviewState {
  direction: string;
  directionGroup: string;
  round: number;
  maxRounds: number;
  messages: InterviewMessage[];
  isComplete: boolean;
  overallScore: number | null;
  overallFeedback: string | null;
}

// --- Phase 5: Strategy Report ---

export interface StrategyDepartment {
  rank: number;
  name: string;
  university: string;
  category: string;
  scoreRange: string;
  keyRequirement: string;
  portfolioFocus: string;
}

export interface StrategyReport {
  direction: string;
  directionGroup: string;
  grade: string;
  departments: StrategyDepartment[];
  timeline: string[];
  portfolioAdvice: string;
  interviewAdvice: string;
  overallStrategy: string;
}

// --- Phase 5: Quiz ---

export interface QuizQuestion {
  id: number;
  question: string;
  options: { value: string; label: string }[];
}

export interface QuizResult {
  type: string;
  typeName: string;
  emoji: string;
  description: string;
  directions: string[];
  color: string;
}

// --- Phase 5: Results Wall ---

export interface AnonymousResult {
  id: string;
  department: string;
  university: string;
  pathway: string;
  advice: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

// --- Phase 5: Portfolio AI Suggestion ---

export interface PortfolioSuggestion {
  missingCodes: LearningCode[];
  suggestions: string[];
  priority: string;
}

// ============================================================
// v2: Vocational High School Types (高職)
// ============================================================

export type VocationalGroup =
  | '餐旅群' | '機械群' | '電機群' | '電子群' | '資訊群'
  | '商管群' | '設計群' | '農業群' | '化工群' | '土木群'
  | '海事群' | '護理群' | '家政群' | '語文群' | '商業與管理群';

export type VocationalPathway =
  | '四技二專甄選' | '聯合登記分發' | '技優保送甄保'
  | '科技校院繁星' | '各校單獨招生' | '二技轉學考';

export type SkillCategory =
  | 'capstone'        // 專題實作
  | 'certification'   // 技能檢定
  | 'internship'      // 實習
  | 'competition'     // 競賽
  | 'club'            // 社團
  | 'license'         // 證照
  | 'service';        // 服務學習

export type CertificationLevel = '丙級' | '乙級' | '甲級' | '單一級';

export type CompetitionLevel = '校內' | '區賽' | '全國' | '國際';

export type CapstoneStatus = 'planning' | 'in-progress' | 'completed' | 'awarded';

export type QualityGrade = 'A' | 'B' | 'C' | 'D';

export interface SkillItem {
  id: string;
  category: SkillCategory;
  title: string;
  description: string;
  date: string;
  createdAt: string;
  qualityGrade?: QualityGrade;
  // 專題實作
  capstoneTopic?: string;
  capstoneRole?: string;
  capstoneStatus?: CapstoneStatus;
  // 技能檢定
  certificationLevel?: CertificationLevel;
  certificationName?: string;
  certificationScore?: number;
  // 競賽
  competitionName?: string;
  competitionLevel?: CompetitionLevel;
  competitionResult?: string;
  // 實習
  internshipCompany?: string;
  internshipDuration?: string;
  internshipRole?: string;
  // 社團
  clubRole?: string;
  // 服務學習
  serviceHours?: number;
  serviceOrganization?: string;
  // 證照
  licenseName?: string;
  licenseIssuer?: string;
  // 通用
  tags?: string[];
  generatedDraft?: string; // 一鍵轉備審素材（學自 Yory）
}

export interface VocationalCategory {
  id: string;
  name: string;
  group: VocationalGroup;
  description: string;
  requiredSkills: SkillCategory[];
  exampleDepartments: string[];
  exampleTechSchools: string[];
  unifiedExamSubjects: string[];
  careerOutlook?: string;
  startingSalary?: string;
}

export interface VocationalDirectionRule {
  id: string;
  conditions: string[];
  direction: string;
  directionGroup: VocationalGroup;
  confidence: number;
  reason: string;
  relatedCategoryIds: string[];
}

export interface VocationalDirectionResult {
  direction: string;
  directionGroup: VocationalGroup;
  confidence: number;
  reasons: string[];
  relatedCategoryIds: string[];
  factCount: number;
}

export type VocationalFactCategory =
  | 'skill'
  | 'capstone'
  | 'certification'
  | 'competition'
  | 'club'
  | 'internship'
  | 'selfStudy'
  | 'other';

export interface VocationalUserFact {
  id: string;
  category: VocationalFactCategory;
  label: string;
  detail: string;
}

export interface UnifiedExamScoreInput {
  chinese: number;
  english: number;
  math: number;
  professional1: number;
  professional2: number;
  group: VocationalGroup;
}

export interface UnifiedExamAnalysis {
  scores: UnifiedExamScoreInput;
  total: number;
  group: VocationalGroup;
  recommendedPathways: VocationalPathway[];
  percentile: number;
  summary: string;
}

export interface SkillGap {
  category: SkillCategory;
  current: number;
  recommended: number;
  description: string;
  priority: 'critical' | 'important' | 'suggested';
}

export interface VocationalRoadmapPhase {
  id: string;
  name: string;
  period: string;
  deadline: string;
  description: string;
  tasks: string[];
  skillGaps: SkillGap[];
  isCurrent: boolean;
  isPast: boolean;
}

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  capstone: '專題實作',
  certification: '技能檢定',
  internship: '實習',
  competition: '競賽',
  club: '社團',
  license: '證照',
  service: '服務學習',
};

export const SKILL_CATEGORY_ICONS: Record<SkillCategory, string> = {
  capstone: '🎯',
  certification: '🏅',
  internship: '🏭',
  competition: '🏆',
  club: '👥',
  license: '📜',
  service: '🤝',
};

export const CERTIFICATION_LEVEL_ORDER: CertificationLevel[] = ['丙級', '乙級', '甲級', '單一級'];

export const QUALITY_GRADE_LABELS: Record<QualityGrade, string> = {
  A: 'A — 精緻完整，可直接用於備審',
  B: 'B — 結構清楚，需補充細節',
  C: 'C — 有基本內容，需大幅修改',
  D: 'D — 草稿階段，需重寫',
};

// --- Phase 5: Score Trend ---

export interface ScoreRecord {
  id: string;
  label: string;
  date: string;
  chinese: number;
  english: number;
  math: number;
  science: number;
  social: number;
  mathTrack: 'A' | 'B';
}

export interface PathwayMatch {
  name: string;
  slug: string;
  minScore: number;
  maxScore: number;
  status: 'safe' | 'reachable' | 'stretch' | 'unlikely';
}
