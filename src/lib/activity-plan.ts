// 活動規劃工具 — 管理 chosen_activities_v1
// 能力中心寫入，準備材料/時間線/申請準備讀取

import type {
  ChosenActivity,
  ChosenActivitiesData,
  PrepItem,
  UnifiedTimelineEvent,
} from '@/types/activity-plan'
import type { StudentProfile, DepartmentInfo } from '@/types/department'
import type { UpgradePath } from '@/types/strategy'

import { NATIONAL_CALENDAR_EVENTS } from '@/data/national-calendar'
import { getCertificatesByGroup } from '@/data/certificates'
import { getCompetitionsByGroup } from '@/data/competitions'

const STORAGE_KEY = 'chosen_activities_v1'

function daysFromNowLocal(date: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

// ── CRUD ──

export function getChosenActivities(): ChosenActivitiesData {
  if (typeof window === 'undefined') return { activities: [], updatedAt: '', groupCode: '', grade: 0 }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* corrupt */ }
  return { activities: [], updatedAt: '', groupCode: '', grade: 0 }
}

export function saveChosenActivities(data: ChosenActivitiesData): void {
  data.updatedAt = new Date().toISOString()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function addChosenActivity(activity: ChosenActivity): void {
  const data = getChosenActivities()
  if (data.activities.some(a => a.targetItemId === activity.targetItemId && a.type === activity.type)) return
  data.activities.push(activity)
  saveChosenActivities(data)
}

export function removeChosenActivity(id: string): void {
  const data = getChosenActivities()
  data.activities = data.activities.filter(a => a.id !== id)
  saveChosenActivities(data)
}

export function updateActivityStatus(id: string, status: ChosenActivity['status']): void {
  const data = getChosenActivities()
  const activity = data.activities.find(a => a.id === id)
  if (activity) {
    activity.status = status
    saveChosenActivities(data)
  }
}

// ── Convert UpgradePath → ChosenActivity ──

export function upgradePathToActivity(path: UpgradePath, profile: StudentProfile, targets: DepartmentInfo[]): ChosenActivity {
  const type = path.type === 'certificate' ? 'certificate' : 'competition'
  return {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    targetItemId: path.id || `${type}_${path.title}`,
    targetItemName: path.title,
    registrationDeadline: path.registrationDeadline || null,
    eventDate: path.nextOpportunity || null,
    resultDate: null,
    pathwayImpact: path.pathwaysOpened || [],
    probabilityBoost: path.probabilityBoost || 0,
    departmentsAffected: targets.map(t => t.id),
    status: 'planned',
    addedAt: new Date().toISOString(),
    notes: path.description || '',
  }
}

// ── Competition Match Check ──

export interface CompetitionMatchResult {
  competitionName: string
  pathwayMatch: string[]
  boostEstimate: number
  warning: string | null
}

export function checkCompetitionMatch(
  competitionId: string,
  targetPathways: string[],
): CompetitionMatchResult {
  const competitions = getCompetitionsByGroup('03') // will be dynamic
  const comp = competitions.find(c => c.id === competitionId)

  if (!comp) {
    return { competitionName: '', pathwayMatch: [], boostEstimate: 0, warning: null }
  }

  const pathwayMatch = (comp as any).pathwayUseful as string[] || []
  const overlap = pathwayMatch.filter(p => targetPathways.includes(p))

  let boostEstimate = 0
  if (overlap.includes('guarantee')) boostEstimate += 25
  if (overlap.includes('skills')) boostEstimate += 15
  if (overlap.includes('special')) boostEstimate += 10
  if (overlap.includes('selection')) boostEstimate += 10

  return {
    competitionName: comp.name,
    pathwayMatch: overlap,
    boostEstimate,
    warning: null,
  }
}

// ── Generate Event-Based Prep Items ──

export function generateEventBasedPrepItems(
  activities: ChosenActivity[],
  profile: StudentProfile,
  targets: DepartmentInfo[],
): PrepItem[] {
  const items: PrepItem[] = []
  const now = new Date().toISOString().slice(0, 10)

  for (const act of activities) {
    if (act.status === 'completed' || act.status === 'missed') continue

    if (act.type === 'certificate') {
      items.push({
        id: `prep_cert_${act.id}`,
        category: 'certificate',
        title: `證照準備：${act.targetItemName}`,
        description: act.notes || '熟悉考試範圍，練習歷屆試題',
        deadline: act.eventDate,
        daysLeft: act.eventDate ? daysFromNowLocal(act.eventDate) : 999,
        relatedActivity: act,
        priority: daysFromNowLocal(act.registrationDeadline || act.eventDate || now) < 30 ? 'high' : 'medium',
        completed: false,
      })
      if (act.registrationDeadline) {
        items.push({
          id: `prep_cert_reg_${act.id}`,
          category: 'certificate',
          title: `報名：${act.targetItemName}`,
          description: '確認報名資格，準備報名文件',
          deadline: act.registrationDeadline,
          daysLeft: daysFromNowLocal(act.registrationDeadline),
          relatedActivity: act,
          priority: daysFromNowLocal(act.registrationDeadline) < 14 ? 'high' : 'medium',
          completed: false,
        })
      }
    }

    if (act.type === 'competition') {
      items.push({
        id: `prep_comp_${act.id}`,
        category: 'competition',
        title: `競賽準備：${act.targetItemName}`,
        description: `目標名次：前3名/金手獎。${act.notes || '加強專業技能訓練'}`,
        deadline: act.eventDate,
        daysLeft: act.eventDate ? daysFromNowLocal(act.eventDate) : 999,
        relatedActivity: act,
        priority: act.eventDate ? (daysFromNowLocal(act.eventDate) < 60 ? 'high' : 'medium') : 'medium',
        completed: false,
      })
      if (act.registrationDeadline) {
        items.push({
          id: `prep_comp_reg_${act.id}`,
          category: 'competition',
          title: `報名：${act.targetItemName}`,
          description: '確認競賽資格，完成報名程序',
          deadline: act.registrationDeadline,
          daysLeft: daysFromNowLocal(act.registrationDeadline),
          relatedActivity: act,
          priority: daysFromNowLocal(act.registrationDeadline) < 14 ? 'high' : 'medium',
          completed: false,
        })
      }
    }

    if (act.type === 'grade_improvement') {
      // Find relevant school exam dates from calendar
      const examEvents = NATIONAL_CALENDAR_EVENTS.filter(
        e => e.type === 'exam' && e.vocational && new Date(e.date) > new Date()
      )
      for (const exam of examEvents.slice(0, 2)) {
        items.push({
          id: `prep_exam_${act.id}_${exam.id}`,
          category: 'exam',
          title: `段考/期末考準備`,
          description: getExamPrepDescription(targets, profile),
          deadline: exam.date,
          daysLeft: daysFromNowLocal(exam.date),
          relatedActivity: act,
          priority: daysFromNowLocal(exam.date) < 30 ? 'high' : 'medium',
          completed: false,
        })
      }
    }
  }

  // Always add application materials section
  items.push({
    id: 'prep_application',
    category: 'application',
    title: '備審資料準備',
    description: '自傳、讀書計畫、專題實作報告、學習歷程',
    deadline: null,
    daysLeft: 999,
    priority: 'low',
    completed: false,
  })

  return items.sort((a, b) => a.daysLeft - b.daysLeft)
}

function getExamPrepDescription(targets: DepartmentInfo[], profile: StudentProfile): string {
  const subjects: string[] = []
  for (const dept of targets.slice(0, 3)) {
    const sel = dept.pathways?.selection as any
    if (sel?.scoreWeights) {
      const w = sel.scoreWeights
      if ((w.mat || 0) >= 1.5) subjects.push('數學（高權重）')
      if ((w.pro1 || 0) >= 2) subjects.push('專業科目一（高權重）')
      if ((w.pro2 || 0) >= 2) subjects.push('專業科目二（高權重）')
    }
  }
  const unique = [...new Set(subjects)]
  return unique.length > 0
    ? `重點科目：${unique.join('、')}。目標：提升在校排名`
    : '維持各科成績，提升在校排名百分比'
}

// ── Generate Unified Timeline ──

export function generateUnifiedTimeline(
  activities: ChosenActivity[],
  targetPathways: string[],
): UnifiedTimelineEvent[] {
  const events: UnifiedTimelineEvent[] = []

  // 1. Activities → timeline events
  for (const act of activities) {
    const eventType: UnifiedTimelineEvent['eventType'] = act.type === 'grade_improvement' ? 'exam' : act.type

    if (act.registrationDeadline) {
      events.push({
        id: `tl_reg_${act.id}`,
        eventType,
        title: `報名截止：${act.targetItemName}`,
        date: act.registrationDeadline,
        description: '完成報名程序',
        category: getCategoryLabel(act.type),
        pathways: act.pathwayImpact,
        departments: act.departmentsAffected,
        status: daysFromNowLocal(act.registrationDeadline) < 0 ? 'missed' : daysFromNowLocal(act.registrationDeadline) < 14 ? 'urgent' : 'upcoming',
        sourceActivity: act,
      })
    }

    if (act.eventDate) {
      events.push({
        id: `tl_event_${act.id}`,
        eventType,
        title: `${getCategoryLabel(act.type)}：${act.targetItemName}`,
        date: act.eventDate,
        description: act.type === 'competition' ? '競賽日期' : act.type === 'certificate' ? '考試日期' : '考試日期',
        category: getCategoryLabel(act.type),
        pathways: act.pathwayImpact,
        departments: act.departmentsAffected,
        status: daysFromNowLocal(act.eventDate) < 0 ? 'completed' : daysFromNowLocal(act.eventDate) < 14 ? 'urgent' : 'upcoming',
        sourceActivity: act,
      })
    }

    if (act.resultDate) {
      events.push({
        id: `tl_result_${act.id}`,
        eventType,
        title: `成績公布：${act.targetItemName}`,
        date: act.resultDate,
        description: '查詢結果',
        category: getCategoryLabel(act.type),
        pathways: act.pathwayImpact,
        departments: act.departmentsAffected,
        status: 'upcoming',
        sourceActivity: act,
      })
    }
  }

  // 2. Pathway milestones from national calendar
  const pathwayTypes = ['stars', 'selection', 'distribution', 'skills', 'guarantee', 'special']
  const activePathways = pathwayTypes.filter(p => targetPathways.includes(p))

  const pathwayCalendarMap: Record<string, string[]> = {
    stars: ['voc-c1', 'voc-c2'],
    selection: ['voc-c3', 'voc-c4'],
    skills: ['voc-c3'],
    guarantee: ['voc-c3'],
    distribution: ['voc-a12', 'voc-a13'],
  }

  for (const pathway of activePathways) {
    const calIds = pathwayCalendarMap[pathway] || []
    for (const calId of calIds) {
      const calEvent = NATIONAL_CALENDAR_EVENTS.find(e => e.id === calId)
      if (calEvent && daysFromNowLocal(calEvent.date) > -30) {
        events.push({
          id: `tl_pathway_${calId}`,
          eventType: 'pathway',
          title: calEvent.title,
          date: calEvent.date,
          description: `升學管道里程碑`,
          category: getPathwayName(pathway),
          pathways: [pathway],
          departments: [],
          status: daysFromNowLocal(calEvent.date) < 0 ? 'completed' : daysFromNowLocal(calEvent.date) < 14 ? 'urgent' : 'upcoming',
        })
      }
    }
  }

  // 3. National exam events (統測)
  const examEvents = NATIONAL_CALENDAR_EVENTS.filter(
    e => e.type === 'exam' && e.vocational && e.id.startsWith('voc-c')
  )
  for (const exam of examEvents) {
    if (daysFromNowLocal(exam.date) > -30) {
      events.push({
        id: `tl_exam_${exam.id}`,
        eventType: 'exam',
        title: exam.title,
        date: exam.date,
        description: '國家考試',
        category: '統測',
        pathways: activePathways,
        departments: [],
        status: daysFromNowLocal(exam.date) < 0 ? 'completed' : daysFromNowLocal(exam.date) < 14 ? 'urgent' : 'upcoming',
      })
    }
  }

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function getCategoryLabel(type: string): string {
  switch (type) {
    case 'certificate': return '證照'
    case 'competition': return '競賽'
    case 'grade_improvement': return '學校考試'
    default: return '其他'
  }
}

function getPathwayName(type: string): string {
  const names: Record<string, string> = {
    stars: '繁星推薦',
    selection: '甄選入學',
    distribution: '聯合登記分發',
    skills: '技優甄審',
    guarantee: '技優保送',
    special: '特殊選才',
  }
  return names[type] || type
}
