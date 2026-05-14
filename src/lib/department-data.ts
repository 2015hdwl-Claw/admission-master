import departmentData from '@/data/departments.json'
import type { DepartmentInfo, GapAnalysis, UserProfile, ConsolidatedActionPlan } from '@/types/department'

// ── 載入科系資料（從 JSON 檔案） ──
const departments: DepartmentInfo[] = departmentData as DepartmentInfo[]

export { departments }

// ── 大學簡稱對照表 ──
const SCHOOL_ALIASES: Record<string, string> = {
  '台科': '國立臺灣科技大學', '台科大': '國立臺灣科技大學', '臺科': '國立臺灣科技大學', '臺科大': '國立臺灣科技大學', 'ntust': '國立臺灣科技大學',
  '北科': '國立臺北科技大學', '北科大': '國立臺北科技大學', '臺北科大': '國立臺北科技大學', 'ntut': '國立臺北科技大學',
  '高科': '國立高雄科技大學', '高科大': '國立高雄科技大學', '高雄科大': '國立高雄科技大學', 'nkust': '國立高雄科技大學',
  '虎科': '國立虎尾科技大學', '虎科大': '國立虎尾科技大學', '虎尾科大': '國立虎尾科技大學', 'nfcu': '國立虎尾科技大學',
  '勤益': '國立勤益科技大學', '勤益科大': '國立勤益科技大學', 'ncut': '國立勤益科技大學',
  '暨南': '國立暨南國際大學', '暨大': '國立暨南國際大學', 'ncnu': '國立暨南國際大學',
  '中興': '國立中興大學', '興大': '國立中興大學', 'nchu': '國立中興大學',
  '嘉義': '國立嘉義大學', '嘉大': '國立嘉義大學', '嘉義大': '國立嘉義大學', 'ncyu': '國立嘉義大學',
  '臺南大': '國立臺南大學', '南大': '國立臺南大學', 'nutn': '國立臺南大學',
  '海大': '國立臺灣海洋大學', '海洋': '國立臺灣海洋大學', 'ntou': '國立臺灣海洋大學',
  '屏科': '國立屏東科技大學', '屏科大': '國立屏東科技大學', 'npust': '國立屏東科技大學',
  '高餐': '國立高雄餐旅大學', '高餐大': '國立高雄餐旅大學', 'nkmu': '國立高雄餐旅大學',
  '雲科': '國立雲林科技大學', '雲科大': '國立雲林科技大學', 'yuntech': '國立雲林科技大學',
  '龍華': '龍華科技大學', '龍華科大': '龍華科技大學', 'lhu': '龍華科技大學',
  '明志': '明志科技大學', '明志科大': '明志科技大學', 'mdu': '明志科技大學',
  '南臺': '南臺科技大學', '南臺科大': '南臺科技大學', 'stust': '南臺科技大學',
  '聖約翰': '聖約翰科技大學', 'sjtu': '聖約翰科技大學',
  '崑山': '崑山科技大學', '崑山科大': '崑山科技大學', 'kuas': '崑山科技大學',
  '淡江': '淡江大學', 'tust': '淡江大學',
  '弘光': '弘光科技大學', 'hwu': '弘光科技大學',
  '中臺': '中臺科技大學', 'ctust': '中臺科技大學',
}

// ── 取得所有不重複的學校列表 ──
export function getSchools(): { id: string; name: string; aliases: string[] }[] {
  const seen = new Map<string, { id: string; name: string; aliases: string[] }>()
  for (const d of departments) {
    if (!seen.has(d.schoolId)) {
      seen.set(d.schoolId, { id: d.schoolId, name: d.schoolName, aliases: [] })
    }
  }
  for (const [alias, schoolName] of Object.entries(SCHOOL_ALIASES)) {
    const entry = [...seen.values()].find(s => s.name === schoolName)
    if (entry) entry.aliases.push(alias)
  }
  return [...seen.values()]
}

// ── 搜尋科系（支援簡稱） ──
export function searchDepartments(query: string): DepartmentInfo[] {
  if (!query || query.length < 1) return []
  const q = query.toLowerCase()
  let expandedQuery = query
  for (const [alias, fullName] of Object.entries(SCHOOL_ALIASES)) {
    if (alias.includes(q) || q.includes(alias)) {
      expandedQuery = fullName
      break
    }
  }
  const eq = expandedQuery.toLowerCase()
  return departments.filter(d =>
    d.schoolName.toLowerCase().includes(eq) ||
    d.schoolName.toLowerCase().includes(q) ||
    d.departmentName.toLowerCase().includes(q) ||
    d.groupName.toLowerCase().includes(q) ||
    d.careerPaths?.some(c => c.toLowerCase().includes(q)) ||
    d.researchAreas?.some(r => r.toLowerCase().includes(q))
  )
}

// ── 根據職群找科系 ──
export function getDepartmentsByGroup(groupCode: string): DepartmentInfo[] {
  return departments.filter(d => d.groupCode === groupCode)
}

// ── 取得科系所有可用管道 ──
export function getAvailablePathways(dept: DepartmentInfo): string[] {
  return Object.entries(dept.pathways)
    .filter(([_, p]) => p.available)
    .map(([key]) => key)
}

// ── 計算單一科系的差距分析 ──
export function calculateGapForDepartment(
  dept: DepartmentInfo,
  pathwayType: string,
  profile: UserProfile
): GapAnalysis {
  const pathway = dept.pathways[pathwayType]
  if (!pathway || !pathway.available) {
    return emptyGap(dept, pathwayType)
  }

  const alreadyHave: { name: string }[] = []
  const needImprovement: { name: string; current: string; required: string; daysLeft: number }[] = []
  const completelyMissing: { name: string; required: string; daysLeft: number }[] = []
  const actionItems: { title: string; deadline: string; daysLeft: number; priority: 'high' | 'medium' | 'low' }[] = []
  let score = 0
  let gain = 0

  if (pathway.minGradePercentile) {
    if (profile.gradePercentile > 0 && profile.gradePercentile <= pathway.minGradePercentile) {
      alreadyHave.push({ name: '在校成績' }); score += 35
    } else if (profile.gradePercentile > pathway.minGradePercentile && profile.gradePercentile <= 50) {
      needImprovement.push({ name: '在校成績', current: `前 ${profile.gradePercentile}%`, required: `前 ${pathway.minGradePercentile}%`, daysLeft: 180 })
      score += 15; gain += 20
      actionItems.push({ title: '提升在校成績', deadline: '下次段考前', daysLeft: 60, priority: 'high' })
    } else if (profile.gradePercentile > 50) {
      completelyMissing.push({ name: '在校成績', required: `前 ${pathway.minGradePercentile}%`, daysLeft: 180 })
      gain += 35
      actionItems.push({ title: '擬定成績提升計畫', deadline: '本學期結束前', daysLeft: 90, priority: 'high' })
    }
  }

  // v3.0: requiredCertificates is now an array
  const reqCerts = pathway.requiredCertificates || []
  if (reqCerts.length > 0) {
    const matchedCert = reqCerts.find(rc => profile.certificates?.includes(rc))
    if (matchedCert) {
      alreadyHave.push({ name: matchedCert }); score += 30
    } else {
      const certName = reqCerts[0]
      completelyMissing.push({ name: certName, required: certName, daysLeft: 90 })
      gain += 30
      actionItems.push({ title: `報名 ${certName} 考試`, deadline: '下次考試日期', daysLeft: 72, priority: 'high' })
    }
  }

  // v3.0: requiredCompetitions is now an array
  const reqComps = pathway.requiredCompetitions || []
  if (reqComps.length > 0) {
    if (profile.competitions?.length > 0) {
      alreadyHave.push({ name: '技藝競賽經驗' }); score += 25
    } else {
      completelyMissing.push({ name: '技藝競賽', required: reqComps[0], daysLeft: 120 })
      gain += 25
      actionItems.push({ title: '了解並報名技藝競賽', deadline: '校內初選前', daysLeft: 45, priority: 'medium' })
    }
  }

  if (profile.hasProject) {
    alreadyHave.push({ name: '專題作品' }); score += 10
  } else {
    needImprovement.push({ name: '專題作品', current: '尚未準備', required: '需要實作專題', daysLeft: 150 })
    gain += 10
    actionItems.push({ title: '開始準備專題作品', deadline: '申請前完成', daysLeft: 120, priority: 'medium' })
  }

  needImprovement.push({ name: '備審資料 / 讀書計畫', current: '尚未準備', required: '讀書計畫 + 備審資料', daysLeft: 60 })
  actionItems.push({ title: '完成讀書計畫初稿', deadline: '申請截止前 30 天', daysLeft: 30, priority: 'low' })

  const prioOrder = { high: 0, medium: 1, low: 2 }
  actionItems.sort((a, b) => prioOrder[a.priority] - prioOrder[b.priority])

  const pathwayNames: Record<string, string> = { stars: '繁星推薦', selection: '甄選入學', distribution: '聯合登記分發', skills: '技優甄審', guarantee: '技優保送', special: '特殊選才' }

  return {
    departmentId: dept.id, departmentName: dept.departmentName, schoolName: dept.schoolName,
    pathwayType, pathwayName: pathwayNames[pathwayType] || pathwayType,
    currentProbability: Math.min(95, score), potentialProbability: Math.min(95, score + gain),
    alreadyHave, needImprovement, completelyMissing, actionItems,
  }
}

// ── 找出最佳管道 ──
export function findBestPathway(dept: DepartmentInfo, profile: UserProfile): { type: string; analysis: GapAnalysis } | null {
  let best: { type: string; analysis: GapAnalysis } | null = null
  for (const [type, req] of Object.entries(dept.pathways)) {
    if (!req.available) continue
    const analysis = calculateGapForDepartment(dept, type, profile)
    if (!best || analysis.potentialProbability > best.analysis.potentialProbability) {
      best = { type, analysis }
    }
  }
  return best
}

// ── 合併多個目標的行動計畫 ──
export function consolidateActionPlan(
  targets: { dept: DepartmentInfo; analysis: GapAnalysis }[]
): ConsolidatedActionPlan {
  const allActions: ConsolidatedActionPlan['actionItems'] = []
  const seenTitles = new Map<string, ConsolidatedActionPlan['actionItems'][0]>()

  for (const { dept, analysis } of targets) {
    for (const item of analysis.actionItems) {
      if (seenTitles.has(item.title)) {
        const existing = seenTitles.get(item.title)!
        if (!existing.forDepartments.includes(dept.departmentName)) {
          existing.forDepartments.push(dept.departmentName)
        }
      } else {
        const entry = { ...item, forDepartments: [dept.departmentName], forPathway: analysis.pathwayType }
        seenTitles.set(item.title, entry)
        allActions.push(entry)
      }
    }
  }

  const prioOrder = { high: 0, medium: 1, low: 2 }
  allActions.sort((a, b) => prioOrder[a.priority] - prioOrder[b.priority])

  return {
    targets: targets.map(t => ({
      departmentName: t.dept.departmentName,
      schoolName: t.dept.schoolName,
      bestPathway: t.analysis.pathwayName,
      currentProbability: t.analysis.currentProbability,
      potentialProbability: t.analysis.potentialProbability,
    })),
    actionItems: allActions,
  }
}

function emptyGap(dept: DepartmentInfo, pathwayType: string): GapAnalysis {
  const pathwayNames: Record<string, string> = { stars: '繁星推薦', selection: '甄選入學', distribution: '聯合登記分發', skills: '技優甄審', guarantee: '技優保送', special: '特殊選才' }
  return {
    departmentId: dept.id, departmentName: dept.departmentName, schoolName: dept.schoolName,
    pathwayType, pathwayName: pathwayNames[pathwayType] || pathwayType,
    currentProbability: 0, potentialProbability: 0,
    alreadyHave: [], needImprovement: [], completelyMissing: [], actionItems: [],
  }
}
