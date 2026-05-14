// 競賽資料庫：高職生可參加的技術競賽清單
// 用於武器庫盤點 + 技優保送/甄審資格匹配

export interface CompetitionInfo {
  id: string
  name: string              // 競賽全名
  level: '校內' | '縣市' | '全國' | '國際'  // 層級
  groupCodes: string[]      // 適用職群（空 = 所有職群）
  pathwayUseful: string[]   // 對哪些管道有用
}

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
  // ── 全國技能競賽 ──
  {
    id: "national-skills",
    name: "全國技能競賽",
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
