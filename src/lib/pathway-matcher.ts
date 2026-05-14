// 管道獨立匹配引擎 v3.0
// 每個管道獨立計算匹配結果，不混成一個分數
// 核心邏輯：先看學生有什麼武器 → 再看每個管道需要什麼 → 匹配

import type {
  DepartmentInfo,
  PathwayRequirement,
  PathwayMatch,
  StudentProfile,
  ActionItem,
  GradeAdvice,
  RoadmapItem,
  UpgradeItem,
  SprintItem,
  DepartmentAnalysis,
  GapAnalysis,
  ConsolidatedActionPlan,
} from '@/types/department'
import { findCertificateByName, getCertificatesByGroup, getLevelBCertificates } from '@/data/certificates'
import { isQualifyingPlacing, getNationalCompetitions } from '@/data/competitions'

// 管道名稱對照
const PATHWAY_NAMES: Record<string, string> = {
  stars: '繁星推薦',
  selection: '甄選入學',
  distribution: '聯合登記分發',
  skills: '技優甄審',
  guarantee: '技優保送',
  special: '特殊選才',
}

// ── 主入口：計算科系所有管道匹配 ──
export function matchAllPathways(
  dept: DepartmentInfo,
  profile: StudentProfile
): PathwayMatch[] {
  const results: PathwayMatch[] = []
  for (const [type, req] of Object.entries(dept.pathways)) {
    results.push(matchSinglePathway(dept, type, req, profile))
  }
  return results
}

// ── 單一管道匹配 ──
function matchSinglePathway(
  dept: DepartmentInfo,
  pathwayType: string,
  req: PathwayRequirement,
  profile: StudentProfile
): PathwayMatch {
  if (!req.available) {
    return emptyMatch(pathwayType)
  }

  switch (pathwayType) {
    case 'stars': return matchStars(req, profile)
    case 'selection': return matchSelection(req, profile)
    case 'distribution': return matchDistribution(req, profile)
    case 'skills': return matchSkills(req, profile)
    case 'guarantee': return matchGuarantee(req, profile)
    case 'special': return matchSpecial(req, profile)
    default: return emptyMatch(pathwayType)
  }
}

// ── 繁星推薦：比對在校成績排名 ──
function matchStars(req: PathwayRequirement, profile: StudentProfile): PathwayMatch {
  const matched: string[] = []
  const missing: string[] = []
  const actions: ActionItem[] = []
  let score = 0

  const threshold = req.minGradePercentile || 25

  if (profile.gradePercentile > 0 && profile.gradePercentile <= threshold) {
    matched.push(`在校成績前 ${profile.gradePercentile}%（門檻：前 ${threshold}%）`)
    score += 70
  } else if (profile.gradePercentile > threshold && profile.gradePercentile <= 50) {
    missing.push(`在校成績需提升至前 ${threshold}%（目前前 ${profile.gradePercentile}%）`)
    score += 30
    actions.push({
      title: '提升在校成績',
      description: `目標：從前 ${profile.gradePercentile}% 提升至前 ${threshold}%`,
      deadline: '下次段考前',
      priority: 'high',
      forPathway: 'stars',
    })
  } else {
    missing.push(`在校成績需達前 ${threshold}%`)
    actions.push({
      title: '擬定成績提升計畫',
      description: `繁星推薦需要在校成績維持在前 ${threshold}%`,
      deadline: '本學期結束前',
      priority: 'high',
      forPathway: 'stars',
    })
  }

  if (req.needSchoolRecommendation) {
    matched.push('需要學校推薦')
  }

  actions.push({
    title: '確認學校推薦資格',
    description: '繁星推薦需要學校推薦，向導師或輔導室確認',
    deadline: '申請前 2 週',
    priority: 'medium',
    forPathway: 'stars',
  })

  const eligible = score >= 50

  return {
    pathwayType: 'stars',
    pathwayName: PATHWAY_NAMES.stars,
    eligible,
    matchScore: score,
    matchedItems: matched,
    missingItems: missing,
    acceptanceEstimate: eligible ? req.acceptanceRate : 0,
    actionItems: actions,
  }
}

// ── 甄選入學：統測 + 備審 + 面試 ──
function matchSelection(req: PathwayRequirement, profile: StudentProfile): PathwayMatch {
  const matched: string[] = []
  const missing: string[] = []
  const actions: ActionItem[] = []
  let score = 0

  if (profile.hasProject) {
    matched.push('有專題作品（可作為備審亮點）')
    score += 20
  } else {
    missing.push('備審資料中的專題作品')
    actions.push({
      title: '開始準備專題作品',
      description: '甄選入學的備審資料中，專題作品是很重要的加分項',
      deadline: '申請前完成',
      priority: 'high',
      forPathway: 'selection',
    })
  }

  if (profile.certificates.length > 0) {
    matched.push(`有 ${profile.certificates.length} 張證照（備審加分）`)
    score += 15
  }

  if (profile.competitions.length > 0) {
    matched.push('有競賽紀錄（備審加分）')
    score += 15
  }

  if (req.lowestScore) {
    missing.push(`統測目標分數：${req.lowestScore} 分以上`)
    score += 20
  }

  // 備審 + 面試準備
  missing.push('讀書計畫 / 備審資料')
  missing.push('面試準備')
  score += 20
  actions.push({
    title: '完成讀書計畫初稿',
    description: '甄選入學備審資料佔很大比重，讀書計畫是核心',
    deadline: '申請截止前 30 天',
    priority: 'high',
    forPathway: 'selection',
  })
  actions.push({
    title: '準備面試自我介紹',
    description: '練習 1 分鐘和 3 分鐘版本自我介紹',
    deadline: '面試前 2 週',
    priority: 'medium',
    forPathway: 'selection',
  })

  return {
    pathwayType: 'selection',
    pathwayName: PATHWAY_NAMES.selection,
    eligible: true, // 甄選入學通常沒有硬門檻
    matchScore: score,
    matchedItems: matched,
    missingItems: missing,
    acceptanceEstimate: req.acceptanceRate,
    actionItems: actions,
  }
}

// ── 聯合登記分發：純看統測分數 ──
function matchDistribution(req: PathwayRequirement, profile: StudentProfile): PathwayMatch {
  const matched: string[] = []
  const missing: string[] = []
  const actions: ActionItem[] = []

  if (req.lowestScore) {
    missing.push(`統測目標分數：${req.lowestScore} 分以上`)
  }

  // 有證照/競賽不影響分發，但提醒
  if (profile.certificates.length > 0) {
    matched.push('有證照（分發不採計，但可做為備用）')
  }

  return {
    pathwayType: 'distribution',
    pathwayName: PATHWAY_NAMES.distribution,
    eligible: true, // 沒有硬門檻，看分數
    matchScore: 50,
    matchedItems: matched,
    missingItems: missing,
    acceptanceEstimate: req.acceptanceRate,
    actionItems: actions,
  }
}

// ── 技優甄審：比對證照 ──
function matchSkills(req: PathwayRequirement, profile: StudentProfile): PathwayMatch {
  const matched: string[] = []
  const missing: string[] = []
  const actions: ActionItem[] = []
  let score = 0
  let hasRequiredCert = false

  const requiredCerts = req.requiredCertificates || []
  const matchRule = req.certificateMatchRule || 'any'
  const minCount = req.minCertificateCount || 1

  if (requiredCerts.length > 0) {
    // 精確名稱匹配
    const matchedCerts = requiredCerts.filter(rc =>
      profile.certificates.some(pc => pc === rc)
    )

    if (matchRule === 'any' && matchedCerts.length > 0) {
      matched.push(`符合證照要求：${matchedCerts.join('、')}`)
      hasRequiredCert = true
      score += 60
    } else if (matchRule === 'count' && profile.certificates.filter(c =>
      requiredCerts.includes(c) || c.includes('乙級')
    ).length >= minCount) {
      matched.push(`持有 ${minCount} 張以上相關證照`)
      hasRequiredCert = true
      score += 60
    } else if (matchRule === 'all' && matchedCerts.length === requiredCerts.length) {
      matched.push('符合所有證照要求')
      hasRequiredCert = true
      score += 60
    } else {
      // 檢查是否有同職群的乙級證照
      const levelB = profile.certificates.filter(c => c.includes('乙級'))
      if (levelB.length > 0) {
        matched.push(`有乙級證照：${levelB.join('、')}`)
        score += 40
        missing.push('需要確認是否為科系要求的證照種類')
      } else {
        const certNames = requiredCerts.length > 0 ? requiredCerts.join(' 或 ') : '乙級相關證照'
        missing.push(`需要取得：${certNames}`)
        actions.push({
          title: `報名 ${certNames} 考試`,
          description: '技優甄審的核心條件是持有相關乙級證照',
          deadline: '下次考試日期',
          priority: 'high',
          forPathway: 'skills',
        })
      }
    }
  } else {
    // 沒有列出具體證照，只要求有乙級
    const levelB = profile.certificates.filter(c => c.includes('乙級'))
    if (levelB.length > 0) {
      matched.push(`有乙級證照：${levelB[0]}`)
      hasRequiredCert = true
      score += 60
    } else {
      const levelC = profile.certificates.filter(c => c.includes('丙級'))
      if (levelC.length > 0) {
        matched.push(`有丙級證照：${levelC[0]}（需要升級為乙級）`)
        score += 20
        missing.push('需要升級為乙級證照')
        actions.push({
          title: '升級乙級證照',
          description: `從丙級升級到乙級，即可符合技優甄審資格`,
          deadline: '下次考試日期',
          priority: 'high',
          forPathway: 'skills',
        })
      } else {
        missing.push('需要取得乙級證照')
        actions.push({
          title: '報名乙級證照考試',
          description: '技優甄審需要乙級技術士證照',
          deadline: '下次考試日期',
          priority: 'high',
          forPathway: 'skills',
        })
      }
    }
  }

  if (profile.competitions.length > 0) {
    matched.push('有競賽紀錄（加分）')
    score += 15
  }

  if (profile.hasProject) {
    matched.push('有專題作品（加分）')
    score += 10
  }

  actions.push({
    title: '準備技優甄審備審資料',
    description: '包含證照影本、自傳、讀書計畫',
    deadline: '申請截止前 2 週',
    priority: 'medium',
    forPathway: 'skills',
  })

  return {
    pathwayType: 'skills',
    pathwayName: PATHWAY_NAMES.skills,
    eligible: hasRequiredCert || score >= 50,
    matchScore: Math.min(100, score),
    matchedItems: matched,
    missingItems: missing,
    acceptanceEstimate: hasRequiredCert ? req.acceptanceRate : req.acceptanceRate * 0.3,
    actionItems: actions,
  }
}

// ── 技優保送：比對競賽 ──
function matchGuarantee(req: PathwayRequirement, profile: StudentProfile): PathwayMatch {
  const matched: string[] = []
  const missing: string[] = []
  const actions: ActionItem[] = []
  let score = 0

  const hasQualifyingComp = profile.competitions.some(cr => {
    const placing = cr.placing
    return isQualifyingPlacing(placing)
  })

  const hasNationalComp = profile.competitions.some(cr => {
    const compId = cr.competitionId
    const nationals = getNationalCompetitions().map(c => c.id)
    return nationals.includes(compId)
  })

  if (hasNationalComp && hasQualifyingComp) {
    matched.push('有全國級以上競賽得名紀錄')
    score = 90
  } else if (hasNationalComp) {
    matched.push('有參加全國級競賽（但名次未達標準）')
    score = 40
    missing.push('競賽名次需達前三名/金手獎/優勝')
    actions.push({
      title: '確認競賽名次是否符合保送資格',
      description: '技優保送需要全國賽前三名或金手獎',
      deadline: '立即確認',
      priority: 'high',
      forPathway: 'guarantee',
    })
  } else if (profile.competitions.length > 0) {
    matched.push('有競賽參賽經驗')
    score = 20
    missing.push('需要全國技能競賽或技藝競賽前三名')
    actions.push({
      title: '了解技優保送條件',
      description: '保送需要全國技能競賽或全國技藝競賽前三名',
      deadline: '立即了解',
      priority: 'medium',
      forPathway: 'guarantee',
    })
  } else {
    missing.push('需要參加全國技能競賽或技藝競賽')
    actions.push({
      title: '了解並報名技藝競賽',
      description: '先參加校內初選，通過後參加全國賽',
      deadline: '校內初選報名截止前',
      priority: 'medium',
      forPathway: 'guarantee',
    })
  }

  return {
    pathwayType: 'guarantee',
    pathwayName: PATHWAY_NAMES.guarantee,
    eligible: score >= 70,
    matchScore: score,
    matchedItems: matched,
    missingItems: missing,
    acceptanceEstimate: score >= 70 ? req.acceptanceRate : 0,
    actionItems: actions,
  }
}

// ── 特殊選才：條件彈性大 ──
function matchSpecial(req: PathwayRequirement, profile: StudentProfile): PathwayMatch {
  const matched: string[] = []
  const missing: string[] = []
  const actions: ActionItem[] = []
  let score = 0

  if (profile.specialExperiences && profile.specialExperiences.trim()) {
    matched.push(`有特殊經歷：${profile.specialExperiences.slice(0, 20)}...`)
    score += 30
  }

  if (profile.hasProject) {
    matched.push('有專題作品')
    score += 25
  }

  if (profile.competitions.length > 0) {
    matched.push('有競賽紀錄')
    score += 20
  }

  if (profile.certificates.filter(c => c.includes('乙級')).length > 0) {
    matched.push('有乙級證照')
    score += 15
  }

  if (req.specialConditions && req.specialConditions.length > 0) {
    missing.push(...req.specialConditions)
  }

  missing.push('特殊選才審查資料')
  actions.push({
    title: '準備特殊選才申請資料',
    description: '包含特殊經歷證明、作品集、自傳等',
    deadline: '申請截止前 30 天',
    priority: 'high',
    forPathway: 'special',
  })

  return {
    pathwayType: 'special',
    pathwayName: PATHWAY_NAMES.special,
    eligible: true,
    matchScore: score,
    matchedItems: matched,
    missingItems: missing,
    acceptanceEstimate: req.acceptanceRate,
    actionItems: actions,
  }
}

// ── 空匹配（管道不可用） ──
function emptyMatch(pathwayType: string): PathwayMatch {
  return {
    pathwayType,
    pathwayName: PATHWAY_NAMES[pathwayType] || pathwayType,
    eligible: false,
    matchScore: 0,
    matchedItems: [],
    missingItems: ['此科系未提供此管道'],
    acceptanceEstimate: 0,
    actionItems: [],
  }
}

// ── 找出最佳管道 ──
export function findBestPathway(
  dept: DepartmentInfo,
  profile: StudentProfile
): PathwayMatch {
  const matches = matchAllPathways(dept, profile)
  // Only consider eligible pathways (exclude distribution as a fallback)
  const eligible = matches.filter(m => m.eligible && m.pathwayType !== 'distribution')
  if (eligible.length === 0) {
    const dist = matches.find(m => m.pathwayType === 'distribution')
    return dist || matches[0]
  }
  // Prefer: highest acceptanceEstimate, then highest matchScore as tiebreaker
  return eligible.reduce((best, cur) => {
    if (cur.acceptanceEstimate !== best.acceptanceEstimate) {
      return cur.acceptanceEstimate > best.acceptanceEstimate ? cur : best
    }
    return cur.matchScore > best.matchScore ? cur : best
  })
}

// ── 找出 TOP N 管道 ──
export function findTopPathways(
  dept: DepartmentInfo,
  profile: StudentProfile,
  n: number = 3
): PathwayMatch[] {
  const matches = matchAllPathways(dept, profile)
  return matches
    .filter(m => m.eligible)
    .sort((a, b) => b.acceptanceEstimate - a.acceptanceEstimate)
    .slice(0, n)
}

// ── 年級導向建議 ──
export function generateGradeAdvice(
  dept: DepartmentInfo,
  profile: StudentProfile
): GradeAdvice {
  const matches = matchAllPathways(dept, profile)

  if (profile.grade === 10) {
    return {
      grade: 10,
      phase: '探索期',
      topPathways: matches.filter(m => m.eligible).slice(0, 2),
      roadmap: generateRoadmap(dept, profile),
    }
  }

  if (profile.grade === 11) {
    return {
      grade: 11,
      phase: '準備期',
      topPathways: matches.filter(m => m.eligible).slice(0, 3),
      upgradeGuide: generateUpgradeGuide(dept, profile, matches),
    }
  }

  // grade 12
  const best = findBestPathway(dept, profile)
  return {
    grade: 12,
    phase: '衝刺期',
    topPathways: matches.filter(m => m.eligible),
    sprintPlan: generateSprintPlan(dept, matches),
  }
}

// ── 高一三年路線圖 ──
function generateRoadmap(dept: DepartmentInfo, profile: StudentProfile): RoadmapItem[] {
  const groupCerts = getLevelBCertificates(profile.groupCode)
  const certNames = groupCerts.slice(0, 3).map(c => c.name)

  return [
    {
      period: '高一上學期',
      goal: '打好基礎，了解目標科系',
      actions: [
        '把在校成績維持在前 30%',
        '了解目標科系在做什麼（瀏覽科系官網）',
        '開始準備丙級證照考試',
      ],
    },
    {
      period: '高一下學期',
      goal: '取得丙級證照',
      actions: [
        '考取丙級證照',
        '參加校內技藝競賽初選',
        '成績提升至前 20%',
      ],
    },
    {
      period: '高二上學期',
      goal: '升級乙級證照',
      actions: [
        `報名 ${certNames[0] || '乙級證照'} 考試`,
        '通過校內技藝競賽初選',
        '開始構思專題作品方向',
      ],
    },
    {
      period: '高二下學期',
      goal: '累積競賽經驗',
      actions: [
        '參加全國技藝競賽或專題競賽',
        '完成專題作品初版',
        '確認目標科系的入學管道條件',
      ],
    },
    {
      period: '高三上學期',
      goal: '衝刺申請',
      actions: [
        '準備備審資料和讀書計畫',
        '確認用哪個管道申請最有利',
        '準備面試（如需）',
      ],
    },
    {
      period: '高三下學期',
      goal: '完成申請',
      actions: [
        '提交申請文件',
        '參加面試或指定項目考試',
        '準備聯合分發作為備案',
      ],
    },
  ]
}

// ── 高二武器升級指南 ──
function generateUpgradeGuide(
  dept: DepartmentInfo,
  profile: StudentProfile,
  matches: PathwayMatch[]
): UpgradeItem[] {
  const items: UpgradeItem[] = []
  const groupCerts = getLevelBCertificates(profile.groupCode)

  // 證照升級
  const hasLevelB = profile.certificates.some(c => c.includes('乙級'))
  if (!hasLevelB) {
    const hasLevelC = profile.certificates.some(c => c.includes('丙級'))
    items.push({
      weapon: '技術證照',
      current: hasLevelC ? '有丙級證照' : '尚無證照',
      target: groupCerts[0]?.name || '乙級技術士證照',
      effort: 'high',
      impact: '打通技優甄審管道',
      pathwayOpened: ['skills'],
    })
  }

  // 競賽
  if (profile.competitions.length === 0) {
    items.push({
      weapon: '技藝競賽',
      current: '未參加過',
      target: '參加全國技藝競賽',
      effort: 'high',
      impact: '打通技優保送管道，甄選入學加分',
      pathwayOpened: ['guarantee', 'selection'],
    })
  }

  // 成績
  const threshold = dept.pathways.stars?.minGradePercentile || 25
  if (profile.gradePercentile > threshold) {
    items.push({
      weapon: '在校成績',
      current: `前 ${profile.gradePercentile}%`,
      target: `前 ${threshold}%`,
      effort: 'medium',
      impact: '打通繁星推薦管道',
      pathwayOpened: ['stars'],
    })
  }

  // 專題
  if (!profile.hasProject) {
    items.push({
      weapon: '專題作品',
      current: '尚未開始',
      target: '完成專題作品',
      effort: 'medium',
      impact: '甄選入學和特殊選才的加分項',
      pathwayOpened: ['selection', 'special'],
    })
  }

  // 按影響力排序（開通的管道越多越重要）
  items.sort((a, b) => b.pathwayOpened.length - a.pathwayOpened.length)

  return items
}

// ── 高三衝刺計畫 ──
function generateSprintPlan(dept: DepartmentInfo, matches: PathwayMatch[]): SprintItem[] {
  const eligible = matches.filter(m => m.eligible && m.acceptanceEstimate > 0)
  return eligible
    .sort((a, b) => b.acceptanceEstimate - a.acceptanceEstimate)
    .map(m => ({
      pathway: m.pathwayName,
      probability: m.acceptanceEstimate,
      immediateActions: m.actionItems.slice(0, 3).map(a => a.title),
      deadline: m.actionItems[0]?.deadline || '',
    }))
}

// ── 完整科系分析 ──
export function analyzeDepartment(
  dept: DepartmentInfo,
  profile: StudentProfile
): DepartmentAnalysis {
  const matches = matchAllPathways(dept, profile)
  const best = findBestPathway(dept, profile)
  const advice = generateGradeAdvice(dept, profile)

  return {
    department: dept,
    pathwayMatches: matches,
    bestPathway: best,
    gradeAdvice: advice,
  }
}

// ── 合併多個目標的行動計畫 ──
export function consolidateActionPlan(
  targets: DepartmentAnalysis[]
): ConsolidatedActionPlan {
  const allActions: ConsolidatedActionPlan['actionItems'] = []
  const seenTitles = new Map<string, ConsolidatedActionPlan['actionItems'][0]>()

  for (const analysis of targets) {
    const dept = analysis.department

    // Collect lowest scores across selection+distribution, pick the highest target
    const scores: number[] = []
    for (const pm of analysis.pathwayMatches) {
      const scoreMatch = pm.missingItems.find(m => m.includes('統測目標分數'))
      if (scoreMatch) {
        const num = parseInt(scoreMatch.replace(/[^0-9]/g, ''), 10)
        if (num > 0) scores.push(num)
      }
    }
    if (scores.length > 1) {
      const maxScore = Math.max(...scores)
      allActions.push({
        title: `統測目標 ${maxScore} 分`,
        deadline: '統測前',
        daysLeft: 30,
        priority: 'high',
        forDepartments: [dept.departmentName],
        forPathway: 'selection',
      })
    }

    for (const pm of analysis.pathwayMatches) {
      for (const item of pm.actionItems) {
        // Deduplicate score targets — already handled above
        if (item.title.includes('統測目標')) continue

        const key = `${item.title}:${item.forPathway}`
        if (seenTitles.has(key)) {
          const existing = seenTitles.get(key)!
          if (!existing.forDepartments.includes(dept.departmentName)) {
            existing.forDepartments.push(dept.departmentName)
          }
        } else {
          const entry = {
            title: item.title,
            deadline: item.deadline,
            daysLeft: 30,
            priority: item.priority,
            forDepartments: [dept.departmentName],
            forPathway: item.forPathway,
          }
          seenTitles.set(key, entry)
          allActions.push(entry)
        }
      }
    }
  }

  const prioOrder = { high: 0, medium: 1, low: 2 }
  allActions.sort((a, b) => prioOrder[a.priority] - prioOrder[b.priority])

  return {
    targets: targets.map(t => ({
      departmentName: t.department.departmentName,
      schoolName: t.department.schoolName,
      bestPathway: t.bestPathway.pathwayName,
      currentProbability: t.bestPathway.matchScore,
      potentialProbability: t.bestPathway.acceptanceEstimate,
    })),
    actionItems: allActions,
  }
}
