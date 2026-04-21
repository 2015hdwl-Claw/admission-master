export interface ScoreInput {
  chinese: number;
  english: number;
  math: number;
  science: number;
  social: number;
  mathTrack: 'A' | 'B';
}

export interface ScoreAnalysis {
  scores: ScoreInput;
  total: number;
  average: number;
  percentile: number;
  recommendedPathways: RecommendedPathway[];
  recommendedDepartments: RecommendedDepartment[];
  summary: string;
}

export interface RecommendedPathway {
  name: string;
  slug: string;
  matchScore: number;
  description: string;
}

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

export type CalendarEventType = 'exam' | 'activity' | 'competition' | 'other';

export type LearningCode = 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: CalendarEventType;
  isNational: boolean;
  learningCodes: LearningCode[];
}

// --- Phase 2: Portfolio ---

export interface PortfolioItem {
  id: string;
  title: string;
  content: string;
  code: LearningCode;
  date: string;
  createdAt: string;
}

// --- Phase 2: Explore ---

export type AcademicGroup = '人文' | '社會' | '自然' | '工程' | '商管' | '醫藥衛' | '藝術';

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
export type OnboardingTrack = '自然組' | '社會組' | '未決定';

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
  directionGroup: AcademicGroup;
  confidence: number;
  reason: string;
  relatedCategoryIds: string[];
}

export interface DirectionResult {
  direction: string;
  directionGroup: AcademicGroup;
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
  directionGroup: AcademicGroup;
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
  directionGroup: AcademicGroup;
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
