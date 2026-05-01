// 升學大師 v4 - 外部競賽種子資料
// 主要競賽來源：技能競賽、專題競賽、證照考試

// 直接定義類型避免依賴問題
interface ExternalCompetition {
  id: string
  name: string
  organizer: string
  level: string
  category: string
  deadline: string
  url?: string
  bonus_percent: number
  description: string
}

export const externalCompetitionsSeed = [
  // ========================================
  // 技能競賽類
  // ========================================
  {
    id: crypto.randomUUID(),
    name: '全國技能競賽',
    organizer: '勞動部勞動力發展署',
    level: '全國',
    competition_type: '技能競賽',
    suitable_groups: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'A',
    scoring_impact: '依證照級別加分：丙級+5%、乙級+15%、甲級+25%',
    deadline: '2026-09-30',
    start_date: '2026-03-01',
    registration_deadline: '2026-06-30',
    url: 'https://www.wdasec.gov.tw/',
    poster_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: '世界技能競賽國手選拔賽',
    organizer: '勞動部勞動力發展署',
    level: '全國',
    competition_type: '技能競賽',
    suitable_groups: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
    suitable_grades: [3, 4, 5],
    portfolio_mapping: 'A',
    scoring_impact: '國際級競賽獲獎可加30-40分',
    deadline: '2026-11-30',
    start_date: '2026-07-01',
    registration_deadline: '2026-08-31',
    url: 'https://www.wdasec.gov.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '國際技能競賽',
    organizer: 'WorldSkills International',
    level: '國際',
    competition_type: '技能競賽',
    suitable_groups: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
    suitable_grades: [4, 5],
    portfolio_mapping: 'A',
    scoring_impact: '國際級競賽獲獎可加40分',
    deadline: '2027-09-30',
    start_date: '2027-01-01',
    registration_deadline: '2027-03-31',
    url: 'https://www.worldskills.org/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 機械與動力機械群專項競賽
  // ========================================
  {
    name: '全國機電實務專題競賽',
    organizer: '教育部',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['01', '02', '03'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'C',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作5分、三等10分、二等15分、一等20分',
    deadline: '2026-08-31',
    start_date: '2026-03-01',
    registration_deadline: '2026-06-30',
    url: 'https://www.edu.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '機械製圖CAD競賽',
    organizer: '中華民國機械工業同業公會',
    level: '全國',
    competition_type: '技能競賽',
    suitable_groups: ['01', '02'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'A',
    scoring_impact: '丙級證照+5%、乙級證照+15%',
    deadline: '2026-07-31',
    start_date: '2026-02-01',
    registration_deadline: '2026-05-31',
    url: 'https://www.cnam.org.tw/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 電機與電子群專項競賽
  // ========================================
  {
    name: '全國大專電腦軟體設計競賽',
    organizer: '教育部',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['03', '04'],
    suitable_grades: [4, 5],
    portfolio_mapping: 'C',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作10分、三等15分、二等20分、一等30分',
    deadline: '2026-09-30',
    start_date: '2026-04-01',
    registration_deadline: '2026-07-31',
    url: 'https://www.edu.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國電腦應用大賽',
    organizer: '經濟部工業局',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['03', '04'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'C',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-10-31',
    start_date: '2026-05-01',
    registration_deadline: '2026-08-31',
    url: 'https://www.moea.gov.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國電子電路設計競賽',
    organizer: '中華民國電機電子工業同業公會',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['03'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'C',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-08-31',
    start_date: '2026-03-01',
    registration_deadline: '2026-06-30',
    url: 'https://www.teema.org.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國物聯網應用創新大賽',
    organizer: '經濟部工業局',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['03', '04'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'C',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作10分、三等15分、二等20分、一等30分',
    deadline: '2026-09-30',
    start_date: '2026-04-01',
    registration_deadline: '2026-07-31',
    url: 'https://www.moea.gov.tw/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 土木與建築群專項競賽
  // ========================================
  {
    name: '全國建築測量製圖競賽',
    organizer: '內政部營建署',
    level: '全國',
    competition_type: '技能競賽',
    suitable_groups: ['06', '07'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'A',
    scoring_impact: '丙級證照+5%、乙級證照+15%',
    deadline: '2026-07-31',
    start_date: '2026-02-01',
    registration_deadline: '2026-05-31',
    url: 'https://www.cpami.gov.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國室內設計競賽',
    organizer: '中華民國室內設計協會',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['07'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'C',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-09-30',
    start_date: '2026-04-01',
    registration_deadline: '2026-07-31',
    url: 'https://www.csid.org.tw/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 農業與食品群專項競賽
  // ========================================
  {
    name: '全國園藝技能競賽',
    organizer: '農業委員會',
    level: '全國',
    competition_type: '技能競賽',
    suitable_groups: ['08'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'A',
    scoring_impact: '丙級證照+5%、乙級證照+15%',
    deadline: '2026-08-31',
    start_date: '2026-03-01',
    registration_deadline: '2026-06-30',
    url: 'https://www.coa.gov.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國食品加工競賽',
    organizer: '農業委員會農業試驗所',
    level: '全國',
    competition_type: '技能競賽',
    suitable_groups: ['09'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'A',
    scoring_impact: '丙級證照+5%、乙級證照+15%',
    deadline: '2026-07-31',
    start_date: '2026-02-01',
    registration_deadline: '2026-05-31',
    url: 'https://www.tari.coa.gov.tw/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 化學工程與生物技術群專項競賽
  // ========================================
  {
    name: '全國化學實驗創意競賽',
    organizer: '中國化學會',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['10', '11'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'C',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-09-30',
    start_date: '2026-04-01',
    registration_deadline: '2026-07-31',
    url: 'https://www.chem.org.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國生物科技競賽',
    organizer: '國家實驗研究院',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['11'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'C',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作10分、三等15分、二等20分、一等30分',
    deadline: '2026-10-31',
    start_date: '2026-05-01',
    registration_deadline: '2026-08-31',
    url: 'https://www.narl.org.tw/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 紡織群專項競賽
  // ========================================
  {
    name: '全國紡織品設計競賽',
    organizer: '紡織業拓展會',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['12'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'C',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-08-31',
    start_date: '2026-03-01',
    registration_deadline: '2026-06-30',
    url: 'https://www.textiles.org.tw/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 家政與生活應用群專項競賽
  // ========================================
  {
    name: '全國烹飪技藝競賽',
    organizer: '中華民國餐旅教育協會',
    level: '全國',
    competition_type: '技能競賽',
    suitable_groups: ['13', '14'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'A',
    scoring_impact: '丙級證照+5%、乙級證照+15%',
    deadline: '2026-07-31',
    start_date: '2026-02-01',
    registration_deadline: '2026-05-31',
    url: 'https://www.ctea.org.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國幼教教具設計競賽',
    organizer: '中華民國幼兒教育改革協會',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['13'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'C',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-09-30',
    start_date: '2026-04-01',
    registration_deadline: '2026-07-31',
    url: 'https://www.ecer.org.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國美容美髮競賽',
    organizer: '中華民國美容美髮商業同業公會',
    level: '全國',
    competition_type: '技能競賽',
    suitable_groups: ['14'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'A',
    scoring_impact: '丙級證照+5%、乙級證照+15%',
    deadline: '2026-08-31',
    start_date: '2026-03-01',
    registration_deadline: '2026-06-30',
    url: 'https://www.hha.org.tw/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 藝術群專項競賽
  // ========================================
  {
    name: '全國學生美術比賽',
    organizer: '教育部',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['15'],
    suitable_grades: [1, 2, 3, 4, 5],
    portfolio_mapping: 'B',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-07-31',
    start_date: '2026-02-01',
    registration_deadline: '2026-05-31',
    url: 'https://www.edu.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國工藝設計競賽',
    organizer: '國立台灣工藝研究發展中心',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['15'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'B',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作10分、三等15分、二等20分、一等30分',
    deadline: '2026-10-31',
    start_date: '2026-05-01',
    registration_deadline: '2026-08-31',
    url: 'https://www.ntcri.gov.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國音樂比賽',
    organizer: '教育部',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['15'],
    suitable_grades: [1, 2, 3, 4, 5],
    portfolio_mapping: 'B',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-06-30',
    start_date: '2026-01-01',
    registration_deadline: '2026-04-30',
    url: 'https://www.edu.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國舞蹈比賽',
    organizer: '教育部',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['15'],
    suitable_grades: [1, 2, 3, 4, 5],
    portfolio_mapping: 'B',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-06-30',
    start_date: '2026-01-01',
    registration_deadline: '2026-04-30',
    url: 'https://www.edu.tw/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 航空與海事群專項競賽
  // ========================================
  {
    name: '全國航空專題競賽',
    organizer: '交通部民用航空局',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['16'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'C',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作10分、三等15分、二等20分、一等30分',
    deadline: '2026-09-30',
    start_date: '2026-04-01',
    registration_deadline: '2026-07-31',
    url: 'https://www.caa.gov.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國海事專題競賽',
    organizer: '交通部運輸研究所',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['17'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'C',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作10分、三等15分、二等20分、一等30分',
    deadline: '2026-08-31',
    start_date: '2026-03-01',
    registration_deadline: '2026-06-30',
    url: 'https://www.motc.gov.tw/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 外語群專項競賽
  // ========================================
  {
    name: '全國英語競賽',
    organizer: '教育部',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['18'],
    suitable_grades: [1, 2, 3, 4, 5],
    portfolio_mapping: 'B',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-07-31',
    start_date: '2026-02-01',
    registration_deadline: '2026-05-31',
    url: 'https://www.edu.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國日語競賽',
    organizer: '財團法人語言訓練測驗中心',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['18'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'B',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-08-31',
    start_date: '2026-03-01',
    registration_deadline: '2026-06-30',
    url: 'https://www.lttc.org.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國外語演講比賽',
    organizer: '文藻外語大學',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['18'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'B',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-09-30',
    start_date: '2026-04-01',
    registration_deadline: '2026-07-31',
    url: 'https://www.wzu.edu.tw/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 綜合管理與跨領域競賽
  // ========================================
  {
    name: '全國商業技藝競賽',
    organizer: '教育部',
    level: '全國',
    competition_type: '技能競賽',
    suitable_groups: ['19'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'D',
    scoring_impact: '丙級證照+5%、乙級證照+15%',
    deadline: '2026-08-31',
    start_date: '2026-03-01',
    registration_deadline: '2026-06-30',
    url: 'https://www.edu.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國會計資訊競賽',
    organizer: '中華民國會計研究發展基金會',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['19'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'D',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作10分、三等15分、二等20分、一等30分',
    deadline: '2026-10-31',
    start_date: '2026-05-01',
    registration_deadline: '2026-08-31',
    url: 'https://www.ardf.org.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '全國行銷企劃競賽',
    organizer: '中華民國行銷學會',
    level: '全國',
    competition_type: '專題競賽',
    suitable_groups: ['19'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'D',
    scoring_impact: '專題競賽獲獎可依等級加分：佳作8分、三等12分、二等18分、一等25分',
    deadline: '2026-09-30',
    start_date: '2026-04-01',
    registration_deadline: '2026-07-31',
    url: 'https://www.cma.org.tw/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 證照類考試
  // ========================================
  {
    name: '全國技術士證照考試',
    organizer: '勞動部勞動力發展署技能檢定中心',
    level: '全國',
    competition_type: '證照考試',
    suitable_groups: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'A',
    scoring_impact: '依證照級別加分：丙級+5%、乙級+15%、甲級+25%',
    deadline: '2026-12-31',
    start_date: '2026-01-01',
    registration_deadline: '2026-12-31',
    url: 'https://www.labour.gov.tw/',
    poster_url: null,
    is_active: true
  },
  {
    name: '電腦軟體應用專業人員認證',
    organizer: '資訊工業策進會',
    level: '全國',
    competition_type: '證照考試',
    suitable_groups: ['03', '04'],
    suitable_grades: [2, 3, 4, 5],
    portfolio_mapping: 'A',
    scoring_impact: '專業認證可依級別加分：基礎級+5%、中級+15%、高級+20%',
    deadline: '2026-12-31',
    start_date: '2026-01-01',
    registration_deadline: '2026-12-31',
    url: 'https://www.iii.org.tw/',
    poster_url: null,
    is_active: true
  },

  // ========================================
  // 國際競賽
  // ========================================
  {
    name: '國際數學奧林匹亞競賽 IMO',
    organizer: 'International Mathematical Olympiad',
    level: '國際',
    competition_type: '專題競賽',
    suitable_groups: ['20'],
    suitable_grades: [3, 4, 5],
    portfolio_mapping: 'B',
    scoring_impact: '國際奧林匹亞競賽獲獎可加40分',
    deadline: '2027-06-30',
    start_date: '2027-01-01',
    registration_deadline: '2027-04-30',
    url: 'https://www.imo-official.org/',
    poster_url: null,
    is_active: true
  },
  {
    name: '國際物理奧林匹亞競賽 IPhO',
    organizer: 'International Physics Olympiad',
    level: '國際',
    competition_type: '專題競賽',
    suitable_groups: ['20'],
    suitable_grades: [3, 4, 5],
    portfolio_mapping: 'B',
    scoring_impact: '國際奧林匹亞競賽獲獎可加40分',
    deadline: '2027-06-30',
    start_date: '2027-01-01',
    registration_deadline: '2027-04-30',
    url: 'https://www.ipho-unofficial.org/',
    poster_url: null,
    is_active: true
  },
  {
    name: '國際化學奧林匹亞競賽 IChO',
    organizer: 'International Chemistry Olympiad',
    level: '國際',
    competition_type: '專題競賽',
    suitable_groups: ['20'],
    suitable_grades: [3, 4, 5],
    portfolio_mapping: 'B',
    scoring_impact: '國際奧林匹亞競賽獲獎可加40分',
    deadline: '2027-06-30',
    start_date: '2027-01-01',
    registration_deadline: '2027-04-30',
    url: 'https://www.icho2027.org/',
    poster_url: null,
    is_active: true
  },
  {
    name: '國際生物奧林匹亞競賽 IBO',
    organizer: 'International Biology Olympiad',
    level: '國際',
    competition_type: '專題競賽',
    suitable_groups: ['20'],
    suitable_grades: [3, 4, 5],
    portfolio_mapping: 'B',
    scoring_impact: '國際奧林匹亞競賽獲獎可加40分',
    deadline: '2027-06-30',
    start_date: '2027-01-01',
    registration_deadline: '2027-04-30',
    url: 'https://www.ibo-info.org/',
    poster_url: null,
    is_active: true
  }
]

export async function seedExternalCompetitions() {
  const { supabaseServer } = await import('@/lib/supabase/server')
  const supabase = supabaseServer

  const { data, error } = await supabase
    .from('external_competitions')
    .upsert(externalCompetitionsSeed, { onConflict: 'name' })

  if (error) {
    console.error('Error seeding external competitions:', error)
    throw error
  }

  console.log(`✅ Seeded ${externalCompetitionsSeed.length} external competitions`)
  return data
}