/**
 * @file competitions.ts
 * @source_description 高職生可參加的技術競賽清單，手動整理自 wdasec.gov.tw 等官方網站
 * @source_urls ["https://www.wdasec.gov.tw/", "https://sci-me.k12ea.gov.tw/"]
 * @generation_method hand-authored
 * @quality_tier 4
 * @update_frequency on_demand
 * @known_issues ["手動整理，部分競賽 officialUrl 可能過期。建議與 Tier 1 的 competition-admission-map.json 交叉驗證"]
 * @last_verified 2026-05-29
 */

// 競賽資料庫：高職生可參加的技術競賽清單

export interface CompetitionItem {
  name: string
  applicableDepartments: string[] // 適用職群代碼
  maximumBonus: number
}

export interface CompetitionInfo {
  id: string
  name: string              // 競賽全名
  level: '校內' | '縣市' | '全國' | '國際'  // 層級
  groupCodes: string[]      // 適用職群（空 = 所有職群）
  pathwayUseful: string[]   // 對哪些管道有用

  // 115 學年度官方分類欄位（選擇性，向後相容）
  officialCategory?: 'project-creativity' | 'regional-skills' | 'national-skills' | 'asian-skills-youth' | 'hs-vocational-competition'
  competitionItems?: CompetitionItem[]
  officialUrl?: string
  registrationDate?: string
  competitionDate?: string
  applicationDeadline?: string
  notes?: string
}

// 115 學年度官方競賽分類常數
export const OFFICIAL_COMPETITION_CATEGORIES = {
  'asian-skills-youth': {
    name: '亞洲技能競賽（青年組）',
    level: '國際' as const,
    baseBonus: 50,
    officialUrl: 'https://worldskillsasiataipei2025.com/',
    registrationDate: '2025-03',
    competitionDate: '2025-08'
  },
  'national-skills': {
    name: '全國技能競賽',
    level: '全國' as const,
    baseBonus: 40,
    officialUrl: 'https://www.wdasec.gov.tw/News_Content.aspx?n=338EAE7851985E1C&sms=8D2612FA39DF1586&s=3DE50ECAB3BFA3F4',
    registrationDate: '2025-04',
    competitionDate: '2025-07'
  },
  'regional-skills': {
    name: '全國技能競賽分區（北、中、南）技能競賽',
    level: '全國' as const,
    regions: ['北區', '中區', '南區'],
    baseBonus: 25,
    officialUrl: 'https://www.wdasec.gov.tw/News_Content.aspx?n=338EAE7851985E1C&sms=8D2612FA39DF1586&s=294DBA296F317CA5',
    registrationDate: '2025-03',
    competitionDate: '2025-05'
  },
  'project-creativity': {
    name: '全國高級中等學校專業群科專題實作及創意競賽',
    level: '全國' as const,
    baseBonus: 30,
    officialUrl: 'https://vtedu.k12ea.gov.tw/nss/p/0603',
    registrationDate: '2025-03',
    competitionDate: '2025-06'
  }
} as const

export interface CompetitionRecord {
  competitionId: string     // 競賽 ID
  placing: string           // 名次
}

// 競賽名次選項
export const PLACING_OPTIONS = [
  '第1名', '第2名', '第3名',
  '金手獎第一名', '金手獎第二名', '金手獎第三名',
  '優勝', '佳作', '入選',
  '金獎', '銀獎', '銅獎',
] as const

// 全國級以上競賽（技優保送適用）
export const COMPETITIONS: CompetitionInfo[] = [
  // ── 115 學年度官方分類競賽 ──
  {
    id: "asian-skills-youth",
    name: "亞洲技能競賽（青年組）",
    level: "國際",
    groupCodes: [],
    pathwayUseful: ["guarantee", "skills", "special"],
    officialCategory: "asian-skills-youth",
    officialUrl: "https://worldskillsasiataipei2025.com/",
    registrationDate: "2025-03",
    competitionDate: "2025-08",
    competitionItems: [
      { name: "工業控制", applicableDepartments: ["02", "03"], maximumBonus: 50 },
      { name: "電氣裝置", applicableDepartments: ["03"], maximumBonus: 50 },
      { name: "電子", applicableDepartments: ["03", "04"], maximumBonus: 50 },
      { name: "資訊技術", applicableDepartments: ["05"], maximumBonus: 50 },
      { name: "機械設計 CAD", applicableDepartments: ["02"], maximumBonus: 50 },
      { name: "數控銑床", applicableDepartments: ["02"], maximumBonus: 50 },
      { name: "數控車床", applicableDepartments: ["02"], maximumBonus: 50 },
      { name: "焊接", applicableDepartments: ["02"], maximumBonus: 50 },
      { name: "鈑金", applicableDepartments: ["02"], maximumBonus: 50 },
      { name: "冷凍空調", applicableDepartments: ["03"], maximumBonus: 50 },
    ]
  },
  {
    id: "national-skills-official",
    name: "全國技能競賽",
    level: "全國",
    groupCodes: [],
    pathwayUseful: ["guarantee", "skills", "special"],
    officialCategory: "national-skills",
    officialUrl: "https://www.wdasec.gov.tw/News_Content.aspx?n=338EAE7851985E1C&sms=8D2612FA39DF1586&s=3DE50ECAB3BFA3F4",
    registrationDate: "2025-04",
    competitionDate: "2025-07",
    competitionItems: [
      { name: "工業控制", applicableDepartments: ["02", "03"], maximumBonus: 40 },
      { name: "電氣裝置", applicableDepartments: ["03"], maximumBonus: 40 },
      { name: "電子", applicableDepartments: ["03", "04"], maximumBonus: 40 },
      { name: "資訊技術", applicableDepartments: ["05"], maximumBonus: 40 },
      { name: "機械設計 CAD", applicableDepartments: ["02"], maximumBonus: 40 },
      { name: "數控銑床", applicableDepartments: ["02"], maximumBonus: 40 },
      { name: "數控車床", applicableDepartments: ["02"], maximumBonus: 40 },
      { name: "焊接", applicableDepartments: ["02"], maximumBonus: 40 },
      { name: "鈑金", applicableDepartments: ["02"], maximumBonus: 40 },
      { name: "冷凍空調", applicableDepartments: ["03"], maximumBonus: 40 },
      { name: "電腦軟體設計", applicableDepartments: ["05"], maximumBonus: 40 },
      { name: "網頁設計", applicableDepartments: ["05", "07"], maximumBonus: 40 },
    ]
  },
  {
    id: "regional-skills",
    name: "分區技能競賽（北、中、南）",
    level: "全國",
    groupCodes: [],
    pathwayUseful: ["guarantee", "skills", "special"],
    officialCategory: "regional-skills",
    officialUrl: "https://www.wdasec.gov.tw/News_Content.aspx?n=338EAE7851985E1C&sms=8D2612FA39DF1586&s=294DBA296F317CA5",
    registrationDate: "2025-03",
    competitionDate: "2025-05",
    competitionItems: [
      { name: "工業控制", applicableDepartments: ["02", "03"], maximumBonus: 25 },
      { name: "電氣裝置", applicableDepartments: ["03"], maximumBonus: 25 },
      { name: "電子", applicableDepartments: ["03", "04"], maximumBonus: 25 },
      { name: "資訊技術", applicableDepartments: ["05"], maximumBonus: 25 },
      { name: "機械設計 CAD", applicableDepartments: ["02"], maximumBonus: 25 },
      { name: "數控銑床", applicableDepartments: ["02"], maximumBonus: 25 },
      { name: "數控車床", applicableDepartments: ["02"], maximumBonus: 25 },
    ]
  },
  {
    id: "project-creativity",
    name: "全國高級中等學校專業群科專題實作及創意競賽",
    level: "全國",
    groupCodes: [],
    pathwayUseful: ["skills", "special", "selection"],
    officialCategory: "project-creativity",
    officialUrl: "https://vtedu.k12ea.gov.tw/nss/p/0603",
    registrationDate: "2025-03",
    competitionDate: "2025-06",
    competitionItems: [
      { name: "專題實作（工業類）", applicableDepartments: ["02", "03", "04", "05"], maximumBonus: 30 },
      { name: "創意競賽（工業類）", applicableDepartments: ["02", "03", "04", "05"], maximumBonus: 30 },
      { name: "專題實作（商業類）", applicableDepartments: ["06", "15"], maximumBonus: 30 },
      { name: "創意競賽（商業類）", applicableDepartments: ["06", "15"], maximumBonus: 30 },
      { name: "專題實作（家政類）", applicableDepartments: ["01", "12"], maximumBonus: 30 },
      { name: "創意競賽（家政類）", applicableDepartments: ["01", "12"], maximumBonus: 30 },
    ]
  },

  // ── 原有競賽項目（維持向後相容性） ──
  {
    id: "national-skills",
    name: "全國技能競賽（舊版）",
    level: "全國",
    groupCodes: [],
    pathwayUseful: ["guarantee", "skills", "special"],
  },
  {
    id: "international-skills",
    name: "國際技能競賽",
    level: "國際",
    groupCodes: [],
    pathwayUseful: ["guarantee", "skills", "special"],
  },

  // ── 全國高級中等學校技藝競賽 ──
  {
    id: "hs-vocational-competition",
    name: "全國高級中等學校技藝競賽",
    level: "全國",
    groupCodes: [],
    pathwayUseful: ["guarantee", "skills", "special"],
    officialCategory: "hs-vocational-competition",
    officialUrl: "https://sci-me.k12ea.gov.tw/Contest/ContestView?cont_id=11615",
    registrationDate: "2025-03",
    competitionDate: "2025-11",
    competitionItems: [
      { name: "工業配電", applicableDepartments: ["03"], maximumBonus: 30 },
      { name: "室內配電", applicableDepartments: ["03"], maximumBonus: 30 },
      { name: "工業電子", applicableDepartments: ["03", "04"], maximumBonus: 30 },
      { name: "數位電子", applicableDepartments: ["04", "05"], maximumBonus: 30 },
      { name: "電腦軟體設計", applicableDepartments: ["05"], maximumBonus: 30 },
      { name: "網頁設計", applicableDepartments: ["05", "07"], maximumBonus: 30 },
      { name: "電腦修護", applicableDepartments: ["05"], maximumBonus: 30 },
      { name: "機械製圖", applicableDepartments: ["02"], maximumBonus: 30 },
      { name: "鉗工", applicableDepartments: ["02"], maximumBonus: 30 },
      { name: "車床", applicableDepartments: ["02"], maximumBonus: 30 },
      { name: "銑床", applicableDepartments: ["02"], maximumBonus: 30 },
      { name: "銲接", applicableDepartments: ["02"], maximumBonus: 30 },
      { name: "建築製圖", applicableDepartments: ["10"], maximumBonus: 30 },
      { name: "測量", applicableDepartments: ["10"], maximumBonus: 30 },
      { name: "商業廣告", applicableDepartments: ["06", "07"], maximumBonus: 30 },
      { name: "中餐烹飪", applicableDepartments: ["01"], maximumBonus: 30 },
      { name: "烘焙", applicableDepartments: ["01"], maximumBonus: 30 },
      { name: "餐旅服務", applicableDepartments: ["01"], maximumBonus: 30 },
    ]
  },

  // ── 全國科學展覽會 ──
  {
    id: "national-science-fair",
    name: "全國中小學科學展覽會",
    level: "全國",
    groupCodes: [],
    pathwayUseful: ["special", "skills"],
  },

  // ── 全國專題暨創意製作競賽 ──
  {
    id: "national-project-competition",
    name: "全國高級中等學校專題暨創意製作競賽",
    level: "全國",
    groupCodes: [],
    pathwayUseful: ["skills", "special", "selection"],
  },

  // ── 資訊類競賽 ──
  {
    id: "npcp",
    name: "全國高級中等學校電腦軟體設計競賽",
    level: "全國",
    groupCodes: ["05"],
    pathwayUseful: ["guarantee", "skills", "special"],
  },
  {
    id: "weblab",
    name: "全國網頁設計競賽",
    level: "全國",
    groupCodes: ["05", "07"],
    pathwayUseful: ["skills", "special"],
  },
  {
    id: "robot-competition",
    name: "全國機器人競賽",
    level: "全國",
    groupCodes: ["02", "03", "04", "05"],
    pathwayUseful: ["skills", "special"],
  },

  // ── 電機/電子競賽 ──
  {
    id: "ee-competition",
    name: "全國電機電子專題製作競賽",
    level: "全國",
    groupCodes: ["03", "04"],
    pathwayUseful: ["skills", "special"],
  },

  // ── 機械競賽 ──
  {
    id: "mech-competition",
    name: "全國機械專題製作競賽",
    level: "全國",
    groupCodes: ["02"],
    pathwayUseful: ["skills", "special"],
  },

  // ── 商管競賽 ──
  {
    id: "biz-competition",
    name: "全國商業類科學生技藝競賽",
    level: "全國",
    groupCodes: ["06", "15"],
    pathwayUseful: ["skills", "special"],
  },

  // ── 設計競賽 ──
  {
    id: "design-competition",
    name: "全國學生美術比賽",
    level: "全國",
    groupCodes: ["07"],
    pathwayUseful: ["special"],
  },
  {
    id: "int-design-competition",
    name: "臺灣國際學生創意設計大賽",
    level: "國際",
    groupCodes: ["07"],
    pathwayUseful: ["special"],
  },

  // ── 餐旅競賽 ──
  {
    id: "hospitality-competition",
    name: "全國餐旅類科學生技藝競賽",
    level: "全國",
    groupCodes: ["01"],
    pathwayUseful: ["skills", "special"],
  },

  // ── 護理競賽 ──
  {
    id: "nursing-competition",
    name: "全國高級中等學校護理類技藝競賽",
    level: "全國",
    groupCodes: ["12"],
    pathwayUseful: ["skills", "special"],
  },

  // ── 校內/縣市级 ──
  {
    id: "school-competition",
    name: "校內技藝競賽",
    level: "校內",
    groupCodes: [],
    pathwayUseful: ["skills"],
  },
  {
    id: "county-competition",
    name: "縣市科學展覽會",
    level: "縣市",
    groupCodes: [],
    pathwayUseful: ["special"],
  },
]

// 取得某職群相關的競賽
export function getCompetitionsByGroup(groupCode: string): CompetitionInfo[] {
  return COMPETITIONS.filter(c => c.groupCodes.length === 0 || c.groupCodes.includes(groupCode))
}

// 取得全國級以上的競賽（技優保送適用）
export function getNationalCompetitions(): CompetitionInfo[] {
  return COMPETITIONS.filter(c => c.level === '全國' || c.level === '國際')
}

// 根據 ID 查找
export function findCompetitionById(id: string): CompetitionInfo | undefined {
  return COMPETITIONS.find(c => c.id === id)
}

// 判斷名次是否符合技優保送資格
export function isQualifyingPlacing(placing: string): boolean {
  const qualifyingPlacings = ['第1名', '第2名', '第3名', '金手獎第一名', '金手獎第二名', '金手獎第三名', '優勝', '金獎', '銀獎', '銅獎']
  return qualifyingPlacings.includes(placing)
}
