/**
 * @file bonus-table.ts
 * @source_description 技優甄審官方加分標準表，從115學年度技優甄審招生簡章手動提取
 * @source_urls ["115學年度技優甄審招生簡章 表1 競賽優勝名次或證照等級及其優待加分標準表"]
 * @generation_method official_pdf_extraction
 * @quality_tier 1
 * @update_frequency annually
 * @known_issues []
 * @last_verified 2026-05-17
 * @maintainer_notes 計算公式：甄審總成績 = 指定項目甄審成績 × (1 + 優待加分比率)
 */

// 技優甄審官方加分標準表
// 資料來源：115學年度 科技校院四年制及專科學校二年制招收技藝技能優良學生甄審入學招生簡章
// 「表1 競賽優勝名次或證照等級及其優待加分標準表」
//
// 計算公式：甄審總成績 = 指定項目甄審成績 × (1 + 優待加分比率)
// 重要：同時持有 2 種以上符合加分優待之技藝技能競賽或證照者，限選 1 項優待加分

import certAdmissionMap from './cert-admission-map.json'

// ── 證照相關性等級 ──
export type RelevanceLevel = '高度相關' | '中度相關' | '低度相關'

// ── 證照加分表 ──
// 甲級一律 +25%，乙級依相關性分三級，丙級不適用技優甄審
export const CERT_BONUS_TABLE: Record<string, Record<RelevanceLevel, number>> = {
  '甲': { '高度相關': 25, '中度相關': 25, '低度相關': 25 },
  '乙': { '高度相關': 15, '中度相關': 8, '低度相關': 4 },
  '丙': { '高度相關': 0, '中度相關': 0, '低度相關': 0 },
}

export function getCertBonus(level: string, relevance: RelevanceLevel): number {
  const levelKey = level.replace('級', '')
  return CERT_BONUS_TABLE[levelKey]?.[relevance] ?? 0
}

// ── 競賽加分表 ──
export type CompetitionCategory =
  | '國際技能競賽'
  | '亞洲技能競賽'
  | '國手'
  | '全國技能競賽'
  | '全國高級中等學校學生技藝競賽'
  | '分區技能競賽'
  | '專題實作及創意競賽'
  | '科展'
  | '技術創造力競賽'
  | '智慧鐵人競賽'
  | '電腦鼠競賽'
  | '美術比賽'
  | '舞蹈比賽'
  | '音樂比賽'
  | '其他'

// Short names for internal use (dropdown labels, keys)
export const COMP_CATEGORY_LABELS: Record<CompetitionCategory, string> = {
  '國際技能競賽': '國際技能競賽',
  '亞洲技能競賽': '亞洲技能競賽',
  '國手': '正(備)取國手',
  '全國技能競賽': '全國技能競賽',
  '全國高級中等學校學生技藝競賽': '全國高級中等學校學生技藝競賽',
  '分區技能競賽': '分區技能競賽',
  '專題實作及創意競賽': '專題實作及創意競賽',
  '科展': '科學展覽會',
  '技術創造力競賽': '技術創造力競賽',
  '智慧鐵人競賽': '智慧鐵人創意競賽',
  '電腦鼠競賽': '電腦鼠競賽',
  '美術比賽': '學生美術比賽',
  '舞蹈比賽': '學生舞蹈比賽',
  '音樂比賽': '學生音樂比賽',
  '其他': '其他',
}

export interface CompetitionBonusTier {
  category: CompetitionCategory
  placings: string[]
  bonusPercent: number
}

export const COMPETITION_BONUS_TABLE: CompetitionBonusTier[] = [
  // 國際技能競賽 / 國際展能節 / 國際科技展覽
  { category: '國際技能競賽', placings: ['第1名', '第2名', '第3名', '金牌', '銀牌', '銅牌'], bonusPercent: 60 },
  { category: '國際技能競賽', placings: ['優勝'], bonusPercent: 50 },
  // 亞洲技能競賽（青年組）
  { category: '亞洲技能競賽', placings: ['第1名', '第2名', '第3名', '金牌', '銀牌', '銅牌'], bonusPercent: 50 },
  { category: '亞洲技能競賽', placings: ['優勝'], bonusPercent: 45 },
  // 國手
  { category: '國手', placings: ['正取', '備取', '正取國手', '備取國手'], bonusPercent: 45 },
  // 全國技能競賽 / 全國身心障礙者技能競賽
  { category: '全國技能競賽', placings: ['第1名', '金牌'], bonusPercent: 40 },
  { category: '全國技能競賽', placings: ['第2名', '銀牌'], bonusPercent: 35 },
  { category: '全國技能競賽', placings: ['第3名', '銅牌'], bonusPercent: 30 },
  { category: '全國技能競賽', placings: ['第4名', '第5名'], bonusPercent: 25 },
  // 全國技能競賽分區（北、中、南）技能競賽
  { category: '分區技能競賽', placings: ['第1名', '金牌'], bonusPercent: 25 },
  { category: '分區技能競賽', placings: ['第2名', '銀牌'], bonusPercent: 20 },
  { category: '分區技能競賽', placings: ['第3名', '銅牌'], bonusPercent: 15 },
  // 全國高級中等學校專業群科專題實作及創意競賽
  { category: '專題實作及創意競賽', placings: ['第1名', '金牌'], bonusPercent: 30 },
  { category: '專題實作及創意競賽', placings: ['第2名', '銀牌'], bonusPercent: 25 },
  { category: '專題實作及創意競賽', placings: ['第3名', '銅牌'], bonusPercent: 20 },
  { category: '專題實作及創意競賽', placings: ['佳作'], bonusPercent: 15 },
  // 全國高級中等學校學生技藝競賽
  { category: '全國高級中等學校學生技藝競賽', placings: ['第1名', '第2名', '第3名'], bonusPercent: 30 },
  { category: '全國高級中等學校學生技藝競賽', placings: ['第4名', '第5名', '第6名', '第7名', '第8名', '第9名', '第10名', '第11名', '第12名', '第13名', '第14名', '第15名'], bonusPercent: 25 },
  { category: '全國高級中等學校學生技藝競賽', placings: ['第16名', '第17名', '第18名', '第19名', '第20名', '第21名', '第22名', '第23名', '第24名', '第25名', '第26名', '第27名', '第28名', '第29名', '第30名'], bonusPercent: 20 },
  { category: '全國高級中等學校學生技藝競賽', placings: ['第31名', '第32名', '第33名', '第34名', '第35名', '第36名', '第37名', '第38名', '第39名', '第40名', '第41名', '第42名', '第43名', '第44名', '第45名', '第46名', '第47名', '第48名', '第49名', '第50名'], bonusPercent: 15 },
  { category: '全國高級中等學校學生技藝競賽', placings: ['第51名', '第52名', '第53名', '第54名', '第55名', '第56名', '第57名', '第58名', '第59名', '第60名', '第61名', '第62名', '第63名', '第64名', '第65名', '第66名', '第67名', '第68名', '第69名', '第70名', '第71名', '第72名', '第73名', '第74名', '第75名', '第76名'], bonusPercent: 10 },
  // 全國中小學科學展覽會 / 臺灣國際科學展覽會
  { category: '科展', placings: ['第1名'], bonusPercent: 25 },
  { category: '科展', placings: ['第2名', '第3名'], bonusPercent: 20 },
  { category: '科展', placings: ['佳作'], bonusPercent: 15 },
  // 中央各級機關全國性競賽 (PDF Table 2 — 細分類別)
  { category: '技術創造力競賽', placings: ['第1名', '第2名', '第3名'], bonusPercent: 20 },
  { category: '技術創造力競賽', placings: ['第4名', '佳作'], bonusPercent: 15 },
  { category: '智慧鐵人競賽', placings: ['第1名', '第2名', '第3名'], bonusPercent: 20 },
  { category: '智慧鐵人競賽', placings: ['第4名', '第5名', '第6名'], bonusPercent: 15 },
  { category: '電腦鼠競賽', placings: ['第1名', '第2名', '第3名'], bonusPercent: 20 },
  { category: '電腦鼠競賽', placings: ['其餘得獎者'], bonusPercent: 15 },
  { category: '美術比賽', placings: ['特優', '優等', '甲等'], bonusPercent: 20 },
  { category: '美術比賽', placings: ['入選', '佳作'], bonusPercent: 15 },
  { category: '舞蹈比賽', placings: ['第1名', '第2名', '第3名'], bonusPercent: 20 },
  { category: '舞蹈比賽', placings: ['其餘得獎者'], bonusPercent: 15 },
  { category: '音樂比賽', placings: ['第1名', '第2名', '第3名'], bonusPercent: 20 },
  { category: '音樂比賽', placings: ['其餘得獎者'], bonusPercent: 15 },
]

// ── 競賽加分查詢 ──

/** 從競賽名稱推斷官方分類 */
export function classifyCompetition(name: string): CompetitionCategory {
  if (name.includes('國際技能競賽') || name.includes('國際展能節') || name.includes('國際科技展覽')) return '國際技能競賽'
  if (name.includes('亞洲技能競賽')) return '亞洲技能競賽'
  if (name.includes('正取國手') || name.includes('備取國手') || name.includes('國手')) return '國手'
  if (name.includes('分區技能競賽') || name.includes('技能競賽分區') || name.includes('北區技能競賽') || name.includes('中區技能競賽') || name.includes('南區技能競賽')) return '分區技能競賽'
  if (name.includes('全國技能競賽') || name.includes('全國身心障礙')) return '全國技能競賽'
  if (name.includes('專題實作') || name.includes('創意競賽') || name.includes('專題暨創意')) return '專題實作及創意競賽'
  if (name.includes('技藝競賽')) return '全國高級中等學校學生技藝競賽'
  if (name.includes('科展') || name.includes('科學展覽')) return '科展'
  if (name.includes('技術創造力')) return '技術創造力競賽'
  if (name.includes('智慧鐵人')) return '智慧鐵人競賽'
  if (name.includes('電腦鼠') || name.includes('智慧輪形機器人')) return '電腦鼠競賽'
  if (name.includes('美術比賽') || name.includes('學生美術')) return '美術比賽'
  if (name.includes('舞蹈比賽') || name.includes('學生舞蹈')) return '舞蹈比賽'
  if (name.includes('音樂比賽') || name.includes('學生音樂')) return '音樂比賽'
  return '其他'
}

/** 取得競賽預估最高加分（取該分類下的最高值） */
export function getCompMaxBonus(category: CompetitionCategory): number {
  if (category === '其他') return 0
  const tiers = COMPETITION_BONUS_TABLE.filter(t => t.category === category)
  return tiers.length > 0 ? Math.max(...tiers.map(t => t.bonusPercent)) : 0
}

/** 取得特定名次的加分（精確查詢） */
export function getCompBonus(category: CompetitionCategory, placing: string): number {
  const tiers = COMPETITION_BONUS_TABLE.filter(t => t.category === category)
  for (const tier of tiers) {
    if (tier.placings.includes(placing)) return tier.bonusPercent
  }
  const minBonus = tiers.length > 0 ? Math.min(...tiers.map(t => t.bonusPercent)) : 0
  return minBonus
}

/** 從 placingThreshold 陣列估算預期加分（取最高可達成的） */
export function estimateCompBonus(competitionName: string, placingThresholds: string[]): number {
  const category = classifyCompetition(competitionName)
  if (category === '其他') return 0
  for (const placing of placingThresholds) {
    const bonus = getCompBonus(category, placing)
    if (bonus > 0) return bonus
  }
  return getCompMaxBonus(category)
}

// ── 群代碼 ↔ 招生類別對照 ──
// 高職群代碼 (01-20) → 招生類別代碼 (10-96)
export const GROUP_TO_CATEGORIES: Record<string, string[]> = {
  '01': ['10'],
  '02': ['15', '12'],
  '03': ['20', '21', '25', '26'],
  '04': ['30', '33', '34'],
  '05': ['40', '41'],
  '06': ['56', '60', '65', '62'],
  '07': ['62'],
  '08': ['80', '85'],
  '09': ['55', '56'],
  '10': ['44', '45'],
  '11': ['46', '91'],
  '12': ['70', '12'],
  '13': ['90'],
  '14': ['76', '77', '78', '95'],
  '16': ['79'],
  '17': ['74'],
  '18': ['80', '85'],
  '19': ['20', '25', '26', '96'],
  '20': ['80', '85'],
}

export function getAdmissionCategoriesForGroup(groupCode: string): string[] {
  return GROUP_TO_CATEGORIES[groupCode] || []
}

// ── 科系名稱 → 招生類別推斷 ──
// departments.json 的 groupCode 全是 "03"，所以用名稱關鍵字推斷

const DEPT_KEYWORD_CATEGORIES: [RegExp, string][] = [
  // 輪機、飛行（最先比對，避免被機械/飛機覆蓋）
  [/輪機/, '44'],
  [/飛行與民航|民航人員/, '45'],
  // 車輛/汽車
  [/車輛|汽車/, '15'],
  // 冷凍空調
  [/冷凍空調|能源與冷凍/, '21'],
  // 通訊/電訊/電信
  [/通訊|電訊|電信工程/, '26'],
  // 電子工程（在電機之前比對）
  [/電子工程|半導體|光電/, '25'],
  // 電機（排除「電機與資訊」）
  [/電機(?!與資訊)/, '20'],
  // 資工/資科
  [/資訊工程|資訊科技|資訊與通訊/, '55'],
  // 資管/資網
  [/資訊管理|資訊網路/, '56'],
  // 資安
  [/資安/, '96'],
  // 機電（在機械之前比對）
  [/機電/, '20'],
  // 航空機械/飛機工程
  [/航空機械|飛機工程/, '10'],
  // 機械
  [/機械|自動化工程|製造/, '10'],
  // 化工/材料/環境
  [/化工|材料|環境/, '30'],
  // 安全衛生
  [/職業安全|安全衛生/, '35'],
  // 消防
  [/消防|公共安全/, '20'],
  // 醫學/生醫
  [/醫學影像|醫療器材/, '50'],
  [/生物醫學|醫務管理|醫學資訊/, '50'],
  // 生物機電
  [/生物機電/, '20'],
  // 智慧機器人
  [/機器人/, '25'],
  // AI/無人機
  [/人工智慧|無人機|智慧科技/, '55'],
  // 運動/行銷
  [/運動|行銷/, '60'],
  // 風力
  [/風力發電/, '20'],
  // 工業管理
  [/工業管理/, '56'],
]

export function inferCategoryFromDeptName(deptName: string): string {
  for (const [regex, catCode] of DEPT_KEYWORD_CATEGORIES) {
    if (regex.test(deptName)) return catCode
  }
  return '20' // fallback to 電機
}

export function getCategoriesForDept(deptName: string): string[] {
  const catCode = inferCategoryFromDeptName(deptName)
  // Return the primary category plus related ones from the same group
  for (const cats of Object.values(GROUP_TO_CATEGORIES)) {
    if (cats.includes(catCode)) return cats
  }
  return [catCode]
}

// ── 真實 PDF 對照表查詢 ──

// ── 真實 PDF 對照表查詢 ──

type CertMapCategories = typeof certAdmissionMap.categories

/** 從 cert-admission-map.json 查詢證照對招生類別的相關性 */
export function getCertRelevanceFromMap(
  certCode: string,
  categoryCode: string,
): RelevanceLevel | null {
  const categories = certAdmissionMap.categories
  const category = categories[categoryCode as keyof CertMapCategories]
  if (!category) return null

  for (const cert of category.certificates.high) {
    if (cert.code === certCode) return '高度相關'
  }
  for (const cert of category.certificates.medium) {
    if (cert.code === certCode) return '中度相關'
  }
  for (const cert of category.certificates.low) {
    if (cert.code === certCode) return '低度相關'
  }

  return null
}

/** 取得某招生類別的所有證照（含相關性與加分） */
export function getAllCertsForCategory(categoryCode: string): Array<{
  code: string
  name: string
  relevance: RelevanceLevel
  bonus甲: number
  bonus乙: number
}> {
  const categories = certAdmissionMap.categories
  const category = categories[categoryCode as keyof CertMapCategories]
  if (!category) return []

  const result: Array<{
    code: string
    name: string
    relevance: RelevanceLevel
    bonus甲: number
    bonus乙: number
  }> = []

  const levels: Array<{ key: 'high' | 'medium' | 'low'; rel: RelevanceLevel }> = [
    { key: 'high', rel: '高度相關' },
    { key: 'medium', rel: '中度相關' },
    { key: 'low', rel: '低度相關' },
  ]

  for (const { key, rel } of levels) {
    const certs = category.certificates[key] || []
    for (const cert of certs) {
      result.push({
        code: cert.code,
        name: cert.name,
        relevance: rel,
        bonus甲: getCertBonus('甲', rel),
        bonus乙: getCertBonus('乙', rel),
      })
    }
  }

  return result
}

/** 取得招生類別名稱 */
export function getCategoryName(categoryCode: string): string {
  const categories = certAdmissionMap.categories
  const category = categories[categoryCode as keyof CertMapCategories]
  return category?.name || ''
}

// ── 舊版簡化相關性估算（fallback） ──

export function estimateRelevance(
  certGroupCode: string,
  targetGroupCode: string,
): RelevanceLevel {
  if (certGroupCode === targetGroupCode) return '高度相關'
  // Try real PDF mapping first
  const categories = getAdmissionCategoriesForGroup(targetGroupCode)
  for (const catCode of categories) {
    const rel = getCertRelevanceFromMap(certGroupCode, catCode)
    if (rel) return rel
  }
  return '低度相關'
}

export function calcCertBonusPercent(
  certLevel: string,
  certGroupCode: string,
  targetGroupCode: string,
): number {
  const relevance = estimateRelevance(certGroupCode, targetGroupCode)
  return getCertBonus(certLevel, relevance)
}
