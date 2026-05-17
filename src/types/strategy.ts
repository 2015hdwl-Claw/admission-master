// 策略引擎資料模型 — 證照考試時程 + 競賽行事曆 + 升學管道時程
// 用於「時間倒推」策略建議：不只分析現狀，還要幫學生創造最優解

// ── 證照考試時程 ──
export interface ExamSchedule {
  id: string                          // e.g. "115-1-乙-00700"
  certCode: string                    // 職類代碼
  certName: string                    // 室內配線(屋內線路裝修)
  level: string                       // 丙/乙/甲
  groupCode: string                   // 職群代碼
  groupCodes: string[]                // 適用職群代碼
  year: number                        // 民國年
  batch: number                       // 梯次 (1/2/3)
  registrationStart: string           // 報名開始 (ISO date)
  registrationEnd: string             // 報名截止
  writtenTestDate: string             // 學科測試日期
  resultDate: string                  // 放榜日期
  source: string
  fetchedAt: string
}

// ── 競賽行事曆 ──
export interface CompetitionEvent {
  id: string                          // e.g. "115-技藝競賽-工業類-工業配電"
  competitionName: string             // 全國高級中等學校學生技藝競賽
  subCompetition?: string             // 子競賽：工業類、分區賽等
  category: string                    // 職類/組別：工業配電、室內配電...
  level: string                       // 校內/縣市/分區/全國/國際
  groupCodes: string[]                // 適用職群
  year: number                        // 學年度
  registrationStart: string | null    // 報名開始
  registrationEnd: string | null      // 報名截止
  schoolCompetitionDeadline?: string | null  // 校內初賽截止
  finalRegistrationStart?: string | null     // 決賽報名開始
  finalRegistrationEnd?: string | null       // 決賽報名截止
  eventDate: string | null            // 比賽日期
  eventEndDate?: string | null        // 比賽結束日期
  resultDate: string | null           // 結果公告
  placingThreshold: string[]          // 技優認定門檻
  pathwayUseful: string[]             // 對哪些管道有用
  source: string
  fetchedAt: string
}

// ── 升學管道申請時程 ──
export interface PathwayDeadline {
  id: string                          // e.g. "115-繁星推薦"
  pathwayType: string                 // stars/selection/distribution/skills/guarantee/special
  pathwayName: string                 // 繁星推薦
  year: number                        // 學年度
  milestones: PathwayMilestone[]
  source: string
  fetchedAt: string
}

export interface PathwayMilestone {
  name: string                        // 報名/繳件/面試/放榜
  date: string                        // ISO date 或日期範圍
  description: string                 // 說明
}

// ── 策略建議（計算產出） ──
export interface StrategyAdvice {
  grade: 10 | 11 | 12
  phase: '探索期' | '鍛造期' | '衝刺期'
  currentTime: string                 // ISO datetime

  // 所有可行的升級路線
  upgradePaths: UpgradePath[]

  // 按管道分組的時程
  pathwayTimelines: PathwayTimeline[]

  // 不可錯過的截止日
  criticalDeadlines: CriticalDeadline[]
}

export interface UpgradePath {
  id: string
  type: 'certificate' | 'competition' | 'exam_prep' | 'portfolio'
  title: string                       // "考取乙級室內配線技術士"
  description: string
  targetItem: string                  // 目標武器名稱

  // 時間
  nextOpportunity: string | null      // 下一次機會日期
  registrationDeadline: string | null // 報名截止
  estimatedPrepDays: number           // 預估準備天數
  canStillMakeIt: boolean             // 來不來得及

  // 影響
  effortLevel: 'low' | 'medium' | 'high'
  probabilityBoost: number            // 完成後錄取率提升多少 %
  pathwaysOpened: string[]            // 打通哪些管道
  departmentsAffected: string[]       // 影響哪些目標科系

  // ROI
  roi: 'high' | 'medium' | 'low'     // 投資報酬率

  // 分類
  groupCodes: string[]                // 適用職群代碼，如 ["03"]
  category: string                    // 職種名稱，如 "冷凍空調裝修"
  level: string                       // 等級，如 "乙" / "全國"
}

export interface PathwayTimeline {
  pathwayType: string
  pathwayName: string
  currentEligible: boolean
  currentProbability: number
  potentialProbability: number
  milestones: {
    name: string
    date: string
    daysLeft: number
    status: 'upcoming' | 'urgent' | 'passed' | 'completed'
  }[]
}

export interface CriticalDeadline {
  date: string
  daysLeft: number
  title: string
  type: 'certificate' | 'competition' | 'pathway'
  description: string
  urgency: 'critical' | 'warning' | 'info'
}
