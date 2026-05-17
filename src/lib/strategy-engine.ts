// 時間倒推策略引擎
// 從目標科系的管道條件 → 反推學生需要準備什麼 → 搭配考試時程/競賽行事曆 → 生成可執行的策略

import type {
  ExamSchedule,
  CompetitionEvent,
  PathwayDeadline,
  StrategyAdvice,
  UpgradePath,
  PathwayTimeline,
  CriticalDeadline,
} from '@/types/strategy'
import type { StudentProfile, DepartmentInfo } from '@/types/department'

import examSchedules from '@/data/exam-schedules.json'
import competitionEvents from '@/data/competition-events.json'
import pathwayDeadlines from '@/data/pathway-deadlines.json'
import { getCertBonus, estimateRelevance, estimateCompBonus, type RelevanceLevel } from '@/data/bonus-table'

// ── helpers ──
function daysBetween(a: string, b: string): number {
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

function daysFromNow(date: string): number {
  return daysBetween(new Date().toISOString().slice(0, 10), date)
}

function isFuture(date: string | null): boolean {
  if (!date) return false
  return daysFromNow(date) > 0
}

// ── 主要函數：生成策略建議 ──
export function generateStrategy(
  profile: StudentProfile,
  targets: DepartmentInfo[],
): StrategyAdvice {
  const now = new Date().toISOString()
  const grade = profile.grade

  const phase = grade === 10 ? '探索期' : grade === 11 ? '鍛造期' : '衝刺期'

  const upgradePaths = generateUpgradePaths(profile, targets)
  const pathwayTimelines = generatePathwayTimelines(profile, targets)
  const criticalDeadlines = generateCriticalDeadlines(profile)

  return {
    grade,
    phase,
    currentTime: now,
    upgradePaths,
    pathwayTimelines,
    criticalDeadlines,
  }
}

// ── 升級路線：證照 + 競賽機會 ──
function generateUpgradePaths(
  profile: StudentProfile,
  targets: DepartmentInfo[],
): UpgradePath[] {
  const paths: UpgradePath[] = []
  const now = new Date().toISOString().slice(0, 10)

  // 1. Certificate upgrade paths
  const certPaths = generateCertPaths(profile, targets, now)
  paths.push(...certPaths)

  // 2. Competition opportunities
  const compPaths = generateCompPaths(profile, now)
  paths.push(...compPaths)

  // Sort by: canStillMakeIt desc, roi desc, bonus desc, deadline asc
  paths.sort((a, b) => {
    if (a.canStillMakeIt !== b.canStillMakeIt) return a.canStillMakeIt ? -1 : 1
    const roiOrder = { high: 0, medium: 1, low: 2 }
    if (roiOrder[a.roi] !== roiOrder[b.roi]) return roiOrder[a.roi] - roiOrder[b.roi]
    if (a.probabilityBoost !== b.probabilityBoost) return b.probabilityBoost - a.probabilityBoost
    return (a.registrationDeadline ? daysFromNow(a.registrationDeadline) : 999) -
           (b.registrationDeadline ? daysFromNow(b.registrationDeadline) : 999)
  })

  return paths
}

function generateCertPaths(
  profile: StudentProfile,
  targets: DepartmentInfo[],
  now: string,
): UpgradePath[] {
  const paths: UpgradePath[] = []
  const existingCerts = new Set(profile.certificates)

  // Collect all target groupCodes for relevance calculation
  const targetGroupCodes = [...new Set(targets.map(d => d.groupCode))]

  // Find what certificates targets need for 技優甄審
  const neededCerts = new Map<string, Set<string>>() // certName → Set<pathway>
  for (const dept of targets) {
    for (const [ptype, req] of Object.entries(dept.pathways)) {
      if (!req.available) continue
      if (req.requiredCertificates) {
        for (const cert of req.requiredCertificates) {
          if (!existingCerts.has(cert)) {
            if (!neededCerts.has(cert)) neededCerts.set(cert, new Set())
            neededCerts.get(cert)!.add(ptype)
          }
        }
      }
    }
  }

  // Match needed certs to exam schedules
  const schedules = examSchedules as ExamSchedule[]

  for (const [certName, pathways] of neededCerts) {
    // Find matching exam schedule
    const matching = schedules.filter(s =>
      certName.includes(s.certName.split('(')[0]) ||
      s.certName.includes(certName.split('級')[1] || certName)
    )

    // Find next opportunity
    const futureExams = matching.filter(s =>
      s.registrationEnd && isFuture(s.registrationEnd)
    ).sort((a, b) =>
      (a.registrationEnd || '').localeCompare(b.registrationEnd || '')
    )

    const nextExam = futureExams[0]

    if (nextExam) {
      const regDeadline = nextExam.registrationEnd!
      const daysToReg = daysFromNow(regDeadline)
      const daysToResult = nextExam.resultDate ? daysFromNow(nextExam.resultDate) : 0

      // Check if result comes before 技優甄審 deadline (usually March)
      const canMakeIt = daysToResult > 0 && nextExam.resultDate
        ? nextExam.resultDate < '2027-03-05'  // 技優甄審 報名截止約 3月初
        : true

      // Calculate real bonus from official table (best across all target groups)
      const examGroupCodes = nextExam.groupCodes || [nextExam.groupCode]
      let bestBonus = 0
      for (const egc of examGroupCodes) {
        for (const tgc of targetGroupCodes) {
          const relevance = estimateRelevance(egc, tgc)
          const bonus = getCertBonus(nextExam.level, relevance)
          if (bonus > bestBonus) bestBonus = bonus
        }
      }

      paths.push({
        id: `cert-${nextExam.id}`,
        type: 'certificate',
        title: `考取 ${certName}`,
        description: `下一次考試：${nextExam.writtenTestDate}，報名截止 ${regDeadline}`,
        targetItem: certName,
        nextOpportunity: nextExam.writtenTestDate || null,
        registrationDeadline: regDeadline,
        estimatedPrepDays: nextExam.level === '甲' ? 120 : nextExam.level === '乙' ? 60 : 30,
        canStillMakeIt: canMakeIt && daysToReg > 0,
        effortLevel: nextExam.level === '甲' ? 'high' : nextExam.level === '乙' ? 'medium' : 'low',
        probabilityBoost: bestBonus,
        pathwaysOpened: Array.from(pathways),
        departmentsAffected: targets.map(d => d.departmentName),
        roi: nextExam.level === '乙' ? 'high' : nextExam.level === '甲' ? 'medium' : 'medium',
        groupCodes: nextExam.groupCodes || [nextExam.groupCode],
        category: nextExam.certName,
        level: nextExam.level,
      })
    }
  }

  // If no specific certs needed, suggest common 乙級
  if (neededCerts.size === 0 && !profile.certificates.some(c => c.includes('乙級'))) {
    const nextExams = schedules
      .filter(s => s.level === '乙' && s.registrationEnd && isFuture(s.registrationEnd))
      .sort((a, b) => (a.registrationEnd || '').localeCompare(b.registrationEnd || ''))

    if (nextExams.length > 0) {
      const exam = nextExams[0]
      const examGroupCodes = exam.groupCodes || [exam.groupCode]
      let bestBonus = 0
      for (const egc of examGroupCodes) {
        for (const tgc of targetGroupCodes) {
          const bonus = getCertBonus('乙', estimateRelevance(egc, tgc))
          if (bonus > bestBonus) bestBonus = bonus
        }
      }

      paths.push({
        id: `cert-suggest-${exam.id}`,
        type: 'certificate',
        title: `考取 ${exam.certName}（乙級）`,
        description: `建議取得乙級證照以開通技優甄審管道`,
        targetItem: `乙級${exam.certName}`,
        nextOpportunity: exam.writtenTestDate || null,
        registrationDeadline: exam.registrationEnd || null,
        estimatedPrepDays: 60,
        canStillMakeIt: isFuture(exam.registrationEnd || ''),
        effortLevel: 'medium',
        probabilityBoost: bestBonus,
        pathwaysOpened: ['skills'],
        departmentsAffected: [],
        roi: 'high',
        groupCodes: exam.groupCodes || [exam.groupCode],
        category: exam.certName,
        level: exam.level,
      })
    }
  }

  return paths
}

function generateCompPaths(profile: StudentProfile, now: string): UpgradePath[] {
  const paths: UpgradePath[] = []
  const events = competitionEvents as CompetitionEvent[]

  // Filter events that haven't passed
  const futureEvents = events.filter(e => {
    if (!e.registrationEnd && !e.eventDate) return false
    const deadline = e.registrationEnd || e.eventDate
    return deadline && isFuture(deadline)
  })

  for (const event of futureEvents) {
    const regDeadline = event.registrationEnd || event.eventDate || ''
    const daysToReg = daysFromNow(regDeadline)

    if (daysToReg <= 0) continue

    // Determine effort and ROI based on competition level
    const isNational = event.level === '全國'
    const isRegional = event.level === '分區'

    // Calculate real bonus from official table
    const bonus = estimateCompBonus(
      event.competitionName,
      event.placingThreshold || [],
    )

    paths.push({
      id: `comp-${event.id}`,
      type: 'competition',
      title: `參加 ${event.competitionName} — ${event.category}`,
      description: `${event.subCompetition || ''} ${event.eventDate || ''}，
        報名截止 ${regDeadline}`,
      targetItem: `${event.competitionName} ${event.category}`,
      nextOpportunity: event.registrationStart || null,
      registrationDeadline: regDeadline,
      estimatedPrepDays: isNational ? 90 : isRegional ? 45 : 30,
      canStillMakeIt: true,
      effortLevel: isNational ? 'high' : 'medium',
      probabilityBoost: bonus,
      pathwaysOpened: event.pathwayUseful,
      departmentsAffected: [],
      roi: isNational ? 'high' : isRegional ? 'medium' : 'low',
      groupCodes: event.groupCodes || [],
      category: event.category,
      level: event.level,
    })
  }

  return paths
}

// ── 管道時程 ──
function generatePathwayTimelines(
  profile: StudentProfile,
  targets: DepartmentInfo[],
): PathwayTimeline[] {
  const deadlines = pathwayDeadlines as PathwayDeadline[]
  const timelines: PathwayTimeline[] = []

  for (const pd of deadlines) {
    const milestones = pd.milestones.map(m => ({
      name: m.name,
      date: m.date,
      daysLeft: daysFromNow(m.date),
      status: daysFromNow(m.date) < 0 ? 'passed' as const
        : daysFromNow(m.date) < 14 ? 'urgent' as const
        : 'upcoming' as const,
    }))

    // Check if student is eligible (basic check)
    const eligible = checkBasicEligibility(pd.pathwayType, profile)

    timelines.push({
      pathwayType: pd.pathwayType,
      pathwayName: pd.pathwayName,
      currentEligible: eligible,
      currentProbability: eligible ? 30 : 0,
      potentialProbability: eligible ? 50 : 30,
      milestones,
    })
  }

  return timelines
}

function checkBasicEligibility(pathwayType: string, profile: StudentProfile): boolean {
  switch (pathwayType) {
    case 'stars':
      return profile.gradePercentile > 0 && profile.gradePercentile <= 25
    case 'selection':
      return true // Everyone can apply
    case 'distribution':
      return true // Based on test scores
    case 'skills':
      return profile.certificates.some(c => c.includes('乙級')) ||
             profile.competitions.some(c => c.placing.includes('第') || c.placing.includes('金手'))
    case 'guarantee':
      return profile.competitions.some(c => c.placing.includes('第1名') || c.placing.includes('金手獎'))
    case 'special':
      return profile.hasProject || !!profile.specialExperiences
    default:
      return false
  }
}

// ── 關鍵截止日 ──
function generateCriticalDeadlines(profile: StudentProfile): CriticalDeadline[] {
  const deadlines: CriticalDeadline[] = []

  // From exam schedules
  const schedules = examSchedules as ExamSchedule[]
  const futureExams = schedules
    .filter(s => s.registrationEnd && isFuture(s.registrationEnd))
    .sort((a, b) => (a.registrationEnd || '').localeCompare(b.registrationEnd || ''))

  for (const exam of futureExams.slice(0, 3)) {
    const daysLeft = daysFromNow(exam.registrationEnd!)
    deadlines.push({
      date: exam.registrationEnd!,
      daysLeft,
      title: `${exam.certName}（${exam.level}級）報名截止`,
      type: 'certificate',
      description: `第${exam.batch}梯次，學科測試 ${exam.writtenTestDate}`,
      urgency: daysLeft < 14 ? 'critical' : daysLeft < 30 ? 'warning' : 'info',
    })
  }

  // From competition events
  const events = competitionEvents as CompetitionEvent[]
  const futureComps = events
    .filter(e => e.registrationEnd && isFuture(e.registrationEnd))
    .sort((a, b) => (a.registrationEnd || '').localeCompare(b.registrationEnd || ''))

  for (const comp of futureComps.slice(0, 3)) {
    const daysLeft = daysFromNow(comp.registrationEnd!)
    deadlines.push({
      date: comp.registrationEnd!,
      daysLeft,
      title: `${comp.competitionName} ${comp.category} 報名截止`,
      type: 'competition',
      description: `比賽日期 ${comp.eventDate || 'TBD'}`,
      urgency: daysLeft < 14 ? 'critical' : daysLeft < 30 ? 'warning' : 'info',
    })
  }

  // From pathway deadlines
  const pathways = pathwayDeadlines as PathwayDeadline[]
  for (const pd of pathways) {
    const upcoming = pd.milestones
      .filter(m => isFuture(m.date))
      .sort((a, b) => a.date.localeCompare(b.date))

    if (upcoming.length > 0) {
      const next = upcoming[0]
      const daysLeft = daysFromNow(next.date)
      deadlines.push({
        date: next.date,
        daysLeft,
        title: `${pd.pathwayName} — ${next.name}`,
        type: 'pathway',
        description: next.description,
        urgency: daysLeft < 14 ? 'critical' : daysLeft < 30 ? 'warning' : 'info',
      })
    }
  }

  // Sort by urgency then date
  deadlines.sort((a, b) => {
    const urgencyOrder = { critical: 0, warning: 1, info: 2 }
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency])
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    return a.daysLeft - b.daysLeft
  })

  return deadlines
}
