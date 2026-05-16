// 學生選擇的活動計畫 — 能力中心寫入，其他頁面讀取

export type ActivityType = 'certificate' | 'competition' | 'grade_improvement'
export type ActivityStatus = 'planned' | 'registered' | 'preparing' | 'completed' | 'missed'

export interface ChosenActivity {
  id: string
  type: ActivityType

  // What
  targetItemId: string
  targetItemName: string

  // When
  registrationDeadline: string | null
  eventDate: string | null
  resultDate: string | null

  // Why
  pathwayImpact: string[]
  probabilityBoost: number
  departmentsAffected: string[]

  // Tracking
  status: ActivityStatus
  addedAt: string
  notes: string
}

export interface ChosenActivitiesData {
  activities: ChosenActivity[]
  updatedAt: string
  groupCode: string
  grade: number
}

// 事件分類準備項
export type PrepCategory = 'exam' | 'certificate' | 'competition' | 'application'

export interface PrepItem {
  id: string
  category: PrepCategory
  title: string
  description: string
  deadline: string | null
  daysLeft: number
  relatedActivity?: ChosenActivity
  priority: 'high' | 'medium' | 'low'
  completed: boolean
}

// 統一時間線事件
export type TimelineEventType = 'certificate' | 'competition' | 'pathway' | 'exam'

export interface UnifiedTimelineEvent {
  id: string
  eventType: TimelineEventType
  title: string
  date: string
  endDate?: string
  description: string
  category: string
  pathways: string[]
  departments: string[]
  status: 'upcoming' | 'urgent' | 'completed' | 'missed'
  sourceActivity?: ChosenActivity
}
