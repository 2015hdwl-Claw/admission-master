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
import {
  getCertBonus,
  estimateCompBonus,
  getAdmissionCategoriesForGroup,
  getAllCertsForCategory,
  getCertRelevanceFromMap,
  type RelevanceLevel,
} from '@/data/bonus-table'

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

  // 1. Certificate upgrade paths (from real PDF mapping)
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
  const schedules = examSchedules as ExamSchedule[]

  // Collect all target groupCodes
  const targetGroupCodes = [...new Set(targets.map(d => d.groupCode))]

  // Get all admission categories for target groups
  const targetCategories = new Map<string, string>() // categoryCode → groupCode
  for (const gc of targetGroupCodes) {
    for (const catCode of getAdmissionCategoriesForGroup(gc)) {
      if (!targetCategories.has(catCode)) {
        targetCategories.set(catCode, gc)
      }
    }
  }

  // Build a lookup: certCode → all exam schedule entries
  const examByCertCode = new Map<string, ExamSchedule[]>()
  for (const s of schedules) {
    const code = s.certCode
    if (!examByCertCode.has(code)) examByCertCode.set(code, [])
    examByCertCode.get(code)!.push(s)
  }

  // Track which cert codes we've already added (avoid duplicates)
  const seenCertCodes = new Set<string>()

  // For each admission category, get ALL certs from PDF mapping
  for (const [categoryCode] of targetCategories) {
    const allCerts = getAllCertsForCategory(categoryCode)

    for (const certInfo of allCerts) {
      // Skip if already seen
      if (seenCertCodes.has(certInfo.code)) continue

      // Skip if student already has this cert
      const alreadyHas = existingCerts.has(`乙級${certInfo.name}技術士`) ||
        existingCerts.has(`甲級${certInfo.name}技術士`) ||
        existingCerts.has(`丙級${certInfo.name}技術士`)
      if (alreadyHas) {
        seenCertCodes.add(certInfo.code)
        continue
      }

      seenCertCodes.add(certInfo.code)

      // Find matching exam schedule
      const matchingExams = examByCertCode.get(certInfo.code) || []

      // Find next 乙級 exam opportunity
      const future乙級 = matchingExams
        .filter(s => s.level === '乙' && s.registrationEnd && isFuture(s.registrationEnd))
        .sort((a, b) => (a.registrationEnd || '').localeCompare(b.registrationEnd || ''))

      // Find next 甲級 exam opportunity
      const future甲級 = matchingExams
        .filter(s => s.level === '甲' && s.registrationEnd && isFuture(s.registrationEnd))
        .sort((a, b) => (a.registrationEnd || '').localeCompare(b.registrationEnd || ''))

      // Add 乙級 path (most common for high school students)
      if (future乙級.length > 0) {
        const exam = future乙級[0]
        const regDeadline = exam.registrationEnd!
        const daysToReg = daysFromNow(regDeadline)
        const daysToResult = exam.resultDate ? daysFromNow(exam.resultDate) : 0

        const canMakeIt = exam.resultDate
          ? exam.resultDate < '2027-03-05'
          : true

        const bonus = certInfo.bonus乙

        paths.push({
          id: `cert-${exam.id}`,
          type: 'certificate',
          title: `考取 ${certInfo.name}（乙級）`,
          description: `下一次考試：${exam.writtenTestDate}，報名截止 ${regDeadline}`,
          targetItem: `乙級${certInfo.name}`,
          nextOpportunity: exam.writtenTestDate || null,
          registrationDeadline: regDeadline,
          estimatedPrepDays: 60,
          canStillMakeIt: canMakeIt && daysToReg > 0,
          effortLevel: 'medium',
          probabilityBoost: bonus,
          pathwaysOpened: ['skills'],
          departmentsAffected: targets.map(d => d.departmentName),
          roi: bonus >= 15 ? 'high' : bonus >= 8 ? 'medium' : 'low',
          groupCodes: exam.groupCodes || [exam.groupCode],
          category: certInfo.name,
          level: '乙',
          relevance: certInfo.relevance,
          admissionCategory: categoryCode,
        })
      }

      // Add 甲級 path if available (higher bonus, more effort)
      if (future甲級.length > 0) {
        const exam = future甲級[0]
        const regDeadline = exam.registrationEnd!
        const daysToReg = daysFromNow(regDeadline)

        paths.push({
          id: `cert-${exam.id}`,
          type: 'certificate',
          title: `考取 ${certInfo.name}（甲級）`,
          description: `下一次考試：${exam.writtenTestDate}，報名截止 ${regDeadline}`,
          targetItem: `甲級${certInfo.name}`,
          nextOpportunity: exam.writtenTestDate || null,
          registrationDeadline: regDeadline,
          estimatedPrepDays: 120,
          canStillMakeIt: isFuture(regDeadline),
          effortLevel: 'high',
          probabilityBoost: 25, // 甲級一律 +25%
          pathwaysOpened: ['skills'],
          departmentsAffected: targets.map(d => d.departmentName),
          roi: 'medium',
          groupCodes: exam.groupCodes || [exam.groupCode],
          category: certInfo.name,
          level: '甲',
          relevance: certInfo.relevance,
          admissionCategory: categoryCode,
        })
      }

      // Add cert even without exam schedule (still show it for reference)
      if (future乙級.length === 0 && future甲級.length === 0) {
        const bonus = certInfo.bonus乙
        paths.push({
          id: `cert-map-${certInfo.code}`,
          type: 'certificate',
          title: `考取 ${certInfo.name}（乙級）`,
          description: `技優甄審適用證照，考試時程待公告`,
          targetItem: `乙級${certInfo.name}`,
          nextOpportunity: null,
          registrationDeadline: null,
          estimatedPrepDays: 60,
          canStillMakeIt: true,
          effortLevel: 'medium',
          probabilityBoost: bonus,
          pathwaysOpened: ['skills'],
          departmentsAffected: targets.map(d => d.departmentName),
          roi: bonus >= 15 ? 'high' : bonus >= 8 ? 'medium' : 'low',
          groupCodes: targetGroupCodes,
          category: certInfo.name,
          level: '乙',
          relevance: certInfo.relevance,
          admissionCategory: categoryCode,
        })
      }
    }
  }

  // Fallback: if no categories found, suggest common 乙級
  if (targetCategories.size === 0 && !profile.certificates.some(c => c.includes('乙級'))) {
    const nextExams = schedules
      .filter(s => s.level === '乙' && s.registrationEnd && isFuture(s.registrationEnd))
      .sort((a, b) => (a.registrationEnd || '').localeCompare(b.registrationEnd || ''))

    if (nextExams.length > 0) {
      const exam = nextExams[0]
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
        probabilityBoost: 15,
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

  const futureEvents = events.filter(e => {
    if (!e.registrationEnd && !e.eventDate) return false
    const deadline = e.registrationEnd || e.eventDate
    return deadline && isFuture(deadline)
  })

  for (const event of futureEvents) {
    const regDeadline = event.registrationEnd || event.eventDate || ''
    const daysToReg = daysFromNow(regDeadline)

    if (daysToReg <= 0) continue

    const isNational = event.level === '全國'
    const isRegional = event.level === '分區'

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
      return true
    case 'distribution':
      return true
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

  deadlines.sort((a, b) => {
    const urgencyOrder = { critical: 0, warning: 1, info: 2 }
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency])
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    return a.daysLeft - b.daysLeft
  })

  return deadlines
}
