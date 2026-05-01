/**
 * 20 類群知識庫種子資料
 * Source: PLAN-v4 + 高職升學制度研究
 */

import { GroupKnowledge } from '../types/v4'

export const groupKnowledgeSeed: GroupKnowledge[] = [
  {
    id: 'group-01',
    group_code: '01',
    group_name: '機械群',
    description: '機械設計、製造、維修、操作，包含傳統機械與 CNC 工具機',
    certificate_types: [
      { name: '機械製圖技術士', level: '丙級', bonus_percent: 5 },
      { name: '機械製圖技術士', level: '乙級', bonus_percent: 15 },
      { name: '車床銑工技術士', level: '丙級', bonus_percent: 5 },
      { name: '車床銑工技術士', level: '乙級', bonus_percent: 15 },
      { name: '機械加工技術士', level: '丙級', bonus_percent: 5 },
      { name: '機械加工技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 機械製圖類', pathway: '技優保送/甄審' },
      { name: '全國技藝競賽 - 機械加工類', pathway: '技優保送/甄審' }
    ],
    career_paths: [
      { title: '機械工程師', growth: '高', salary_range: '45K-80K' },
      { title: 'CNC 程式師', growth: '高', salary_range: '50K-90K' },
      { title: '製造工程師', growth: '中', salary_range: '40K-70K' }
    ],
    cross_group_opportunities: ['03', '19'], // 電機群、資電群
    structural_advantages: ['證照體系完整', '多元升學管道', '就業機會多'],
    structural_challenges: ['工作環境較辛苦', '需不斷學習新技術'],
    annual_quota: 5200
  },
  {
    id: 'group-02',
    group_code: '02',
    group_name: '動力機械群',
    description: '汽車、機車修護與維修，引擎原理與維修',
    certificate_types: [
      { name: '汽車修護技術士', level: '丙級', bonus_percent: 5 },
      { name: '汽車修護技術士', level: '乙級', bonus_percent: 15 },
      { name: '機車修護技術士', level: '丙級', bonus_percent: 5 },
      { name: '機車修護技術士', level: '乙級', bonus_percent: 15 },
      { name: '柴油引擎修護技術士', level: '丙級', bonus_percent: 5 },
      { name: '柴油引擎修護技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 汽車修護類', pathway: '技優保送/甄審' },
      { name: '全國技藝競賽 - 機車修護類', pathway: '技優保送/甄審' }
    ],
    career_paths: [
      { title: '汽車技師', growth: '中', salary_range: '40K-70K' },
      { title: '機車技師', growth: '中', salary_range: '35K-60K' },
      { title: '維修廠主管', growth: '高', salary_range: '50K-80K' }
    ],
    cross_group_opportunities: ['01', '09'], // 機械群、工程管理群
    structural_advantages: ['證照體系完整', '實務導向'],
    structural_challenges: ['需要體力工作', '需跟上技術進步'],
    annual_quota: 2800
  },
  {
    id: 'group-03',
    group_code: '03',
    group_name: '電機與電子群',
    description: '電子、電腦、通訊、控制系統設計與維護',
    certificate_types: [
      { name: '室內配線技術士', level: '丙級', bonus_percent: 5 },
      { name: '室內配線技術士', level: '乙級', bonus_percent: 15 },
      { name: '數位電子電路設計技術士', level: '丙級', bonus_percent: 5 },
      { name: '數位電子電路設計技術士', level: '乙級', bonus_percent: 15 },
      { name: '電腦軟體設計技術士', level: '丙級', bonus_percent: 5 },
      { name: '電腦軟體設計技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 電子類', pathway: '技優保送/甄審' },
      { name: '國際技能競賽 - 電子訓', pathway: '技優保送' }
    ],
    career_paths: [
      { title: '電子工程師', growth: '高', salary_range: '50K-90K' },
      { title: '嵌入式系統工程師', growth: '高', salary_range: '60K-100K' },
      { title: '控制系統工程師', growth: '高', salary_range: '55K-85K' }
    ],
    cross_group_opportunities: ['19', '09'], // 資電群、工程管理群
    structural_advantages: ['證照體系完整', '科技業需求大', '薪資高'],
    structural_challenges: ['技術更新快', '需持續學習'],
    annual_quota: 8500
  },
  {
    id: 'group-04',
    group_code: '04',
    group_name: '化工群',
    description: '化學工程、材料科學、製程工程',
    certificate_types: [
      { name: '化工操作技術士', level: '丙級', bonus_percent: 5 },
      { name: '化工操作技術士', level: '乙級', bonus_percent: 15 },
      { name: '化驗品分析技術士', level: '丙級', bonus_percent: 5 },
      { name: '化驗品分析技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 化工類', pathway: '技優保送/甄審' }
    ],
    career_paths: [
      { title: '化學工程師', growth: '高', salary_range: '50K-85K' },
      { title: '製程工程師', growth: '中', salary_range: '45K-75K' },
      { title: '品質管理工程師', growth: '中', salary_range: '40K-70K' }
    ],
    cross_group_opportunities: ['12', '13'], // 農業群、食品群
    structural_advantages: ['化工產業重要', '升學管道穩定'],
    structural_challenges: ['工作環境需注意安全', '需輪班'],
    annual_quota: 1200
  },
  {
    id: 'group-05',
    group_code: '05',
    group_name: '土木與建築群',
    description: '建築設計、土木工程、施工管理',
    certificate_types: [
      { name: '建築製圖技術士', level: '丙級', bonus_percent: 5 },
      { name: '建築製圖技術士', level: '乙級', bonus_percent: 15 },
      { name: '施工技術士', level: '丙級', bonus_percent: 5 },
      { name: '施工技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 建築類', pathway: '技優保送/甄審' },
      { name: '全國技能競賽 - 土木類', pathway: '技優保送/甄審' }
    ],
    career_paths: [
      { title: '建築師', growth: '中', salary_range: '45K-80K' },
      { title: '土木工程師', growth: '中', salary_range: '50K-90K' },
      { title: '營造管理師', growth: '高', salary_range: '60K-100K' }
    ],
    cross_group_opportunities: ['09', '12'], // 工管群、農業群
    structural_advantages:['建設產業穩定', '實務經驗重要'],
    structural_challenges: ['戶外工作多', '需配合天候'],
    annual_quota: 3500
  },
  {
    id: 'group-06',
    group_code: '06',
    group_name: '商業與管理群',
    description: '企管、會計、行銷、國貿、金融、資訊管理',
    certificate_types: [
      { name: '會計事務技術士', level: '丙級', bonus_percent: 5 },
      { name: '會計事務技術士', level: '乙級', bonus_percent: 15 },
      { name: '電腦輔助設計技術士', level: '丙級', bonus_percent: 5 },
      { name: '電腦輔助設計技術士', level: '乙級', bonus_percent: 15 },
      { name: '資訊管理應用技術士', level: '丙級', bonus_percent: 5 },
      { name: '資訊管理應用技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 商業類', pathway: '技優保送/甄審' },
      { name: '全國商業類技藝競賽', pathway: '技優保送/甄審' },
      { name: '全國高中職創意行銷競賽', portfolio_code: 'C-4' },
      { name: '全國高中職專題及創意製作競賽', portfolio_code: 'C-4' }
    ],
    career_paths: [
      { title: '會計師', growth: '中', salary_range: '40K-80K' },
      { title: '行銷經理', growth: '高', salary_range: '45K-90K' },
      { title: '企管顧問', growth: '高', salary_range: '50K-100K' }
    ],
    cross_group_opportunities: ['07', '08'], // 外語群、設計群
    structural_advantages: ['升學管道多元', '可跨考一般大學商學院'],
    structural_challenges: ['證照相對工科少', '跨考率高', '競爭激烈'],
    annual_quota: 12928 // 最大族群
  },
  {
    id: 'group-07',
    group_code: '07',
    group_name: '外語群',
    description: '英語、日語等外語，國際貿易、跨文化溝通',
    certificate_types: [], // 幾乎無技術士證照
    has_certificate_system: false,
    competition_types: [
      { name: '全國語文競賽', portfolio_code: 'C-4' },
      { name: '全國高中職英語演講競賽', portfolio_code: 'C-4' },
      { name: '國際行銷競賽', portfolio_code: 'C-4' },
      { name: '多益英文檢定（TOEIC）', portfolio_code: 'C-5' },
      { name: '日檢（JLPT）', portfolio_code: 'C-5' },
      { name: '全民英檢（GEPT）', portfolio_code: 'C-5' }
    ],
    career_paths: [
      { title: '外贸專員', growth: '中', salary_range: '40K-80K' },
      { title: '翻譯', growth: '中', salary_range: '35K-70K' },
      { title: '國際行銷', growth: '高', salary_range: '50K-100K' }
    ],
    cross_group_opportunities: ['06', '08'], // 商管群、設計群
    structural_advantages: ['國際化機會多', '語言能力是優勢'],
    structural_challenges: ['無技術士證照', '升學管道不清楚', '跨考率最高'], // 最大劣勢
    annual_quota: 2400
  },
  {
    id: 'group-08',
    group_code: '08',
    group_name: '設計群',
    description: '視覺設計、工業設計、室內設計、時尚設計',
    certificate_types: [
      { name: '室內設計技術士', level: '丙級', bonus_percent: 5 },
      { name: '室內設計技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 設計類', pathway: '技優保送/甄審' },
      { name: '國際設計競賽', portfolio_code: 'C-4' },
      { name: '紡點設計競賽', portfolio_code: 'C-4' }
    ],
    career_paths: [
      { title: '視覺設計師', growth: '高', salary_range: '40K-80K' },
      { title: '工業設計師', growth: '中', salary_range: '45K-75K' },
      { title: '室內設計師', growth: '中', salary_range: '35K-70K' }
    ],
    cross_group_opportunities: ['06', '07', '03'], // 商管群、外語群、電機群
    structural_advantages: ['設計競賽機會多', '作品集可直接作為備審'],
    structural_challenges: ['證照相對少', '競爭激烈', '主觀評分標準不統一'],
    annual_quota: 3600
  },
  {
    id: 'group-09',
    group_code: '09',
    group_name: '工程與管理群',
    description: '工程管理、工業安全、品質管理',
    certificate_types: [
      { name: '工業安全技術士', level: '丙級', bonus_percent: 5 },
      { name: '工業安全技術士', level: '乙級', bonus_percent: 15 },
      { name: '品質管理技術士', level: '丙級', bonus_percent: 5 },
      { name: '品質管理技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 工業安全類', pathway: '技優保送/甄審' }
    ],
    career_paths: [
      { title: '工程師', growth: '中', salary_range: '50K-90K' },
      { title: '專案管理師', growth: '高', salary_range: '55K-95K' },
      { title: '品質經理', growth: '中', salary_range: '40K-75K' }
    ],
    cross_group_opportunities: ['01', '02', '03', '04', '05'], // 各工科群
    structural_advantages: ['跨領域整合能力', '升學管道多元'],
    structural_challenges: ['知名度較低', '學生不太清楚'],
    annual_quota: 1500
  },
  {
    id: 'group-10',
    group_code: '10',
    group_name: '海事群',
    description: '航海、輪機、海事工程、運輸管理',
    certificate_types: [
      { name: '海事技術士 - 航舶', level: '丙級', bonus_percent: 5 },
      { name: '海事技術士 - 船舶', level: '乙級', bonus_percent: 15 },
      { name: '船員證（一等、二等、三等）', bonus_percent: 10 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 海事類', pathway: '技優保送/甄審' }
    ],
    career_paths: [
      { title: '船長', growth: '中', salary_range: '60K-100K' },
      { title: '輪機工程師', growth: '中', salary_range: '55K-90K' },
      { title: '海事工程師', growth: '高', salary_range: '65K-110K' }
    ],
    cross_group_opportunities: [],
    structural_advantages: ['就業穩定', '薪資較高', '國際化機會'],
    structural_challenges: ['需長期海上工作', '考取船員證手續繁雜'],
    annual_quota: 800
  },
  {
    id: 'group-11',
    group_code: '11',
    group_name: '水產群',
    description: '養殖漁業、水產品加工、海洋資源管理',
    certificate_types: [
      { name: '水產養殖技術士', level: '丙級', bonus_percent: 5 },
      { name: '水產養殖技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 水產類', pathway: '技優保送/甄審' }
    ],
    career_paths: [
      { title: '水產養殖師', growth: '中', salary_range: '35K-70K' },
      { title: '水產品加工工程師', growth: '中', salary_range: '40K-75K' },
      { title: '海洋資源管理師', growth: '高', salary_range: '45K-80K' }
    ],
    cross_group_opportunities: ['04', '13'], // 土木建築、食品群
    structural_advantages: ['產業特殊性強', '升學競爭相對較小'],
    structural_challenges: ['工作環境特殊', '地區性強'],
    annual_quota: 400
  },
  {
    id: 'group-12',
    group_code: '12',
    group_name: '農業群',
    description: '農藝、園藝、畜牧、農業經營、農企業管理',
    certificate_types: [
      { name: '農業技術士 - 農藝', level: '丙級', bonus_percent: 5 },
      { name: '農業技術士 - 農藝', level: '乙級', bonus_percent: 15 },
      { name: '園藝技術士', level: '丙級', bonus_percent: 5 },
      { name: '園藝技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 農業類', pathway: '技優保送/甄審' },
      { name: '全國中小學科展覽會', portfolio_code: 'C-4' }
    ],
    career_paths: [
      { title: '農業技師', growth: '中', salary_range: '35K-70K' },
      { title: '園藝師', growth: '中', salary_range: '30K-60K' },
      { title: '農企業管理師', growth: '高', salary_range: '40K-75K' }
    ],
    cross_group_opportunities: ['05', '13'], // 土木建築、食品群
    structural_advantages: ['農業是國家重點產業', '升學管道穩定'],
    structural_challenges: ['農村人口流失', '需要體力工作'],
    annual_quota: 1800
  },
  {
    id: 'group-13',
    group_code: '13',
    group_name: '食品群',
    description: '食品加工、餐飲製備、食品安全管理、營養學',
    certificate_types: [
      { name: '食品技術士', level: '丙級', bonus_percent: 5 },
      { name: '食品技術士', level: '乙級', bonus_percent: 15 },
      { name: '烘焙技術士', level: '丙級', bonus_percent: 5 },
      { name: '烘焙技術士', level: '乙級', bonus_percent: 15 },
      { name: '餐飲技術士', level: '丙級', bonus_percent: 5 },
      { name: '餐飲技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 食品類', pathway: '技優保送/甄審' },
      { name: '全國烘焙競賽', portfolio_code: 'C-4' },
      { name: '全國烹飪競賽', portfolio_code: 'C-4' }
    ],
    career_paths: [
      { title: '食品工程師', growth: '中', salary_range: '40K-75K' },
      { title: '研發廚長', growth: '高', salary_range: '50K-90K' },
      { title: '餐飲經理', growth: '中', salary_range: '35K-70K' }
    ],
    cross_group_opportunities: ['04', '12'], // 土木建築、農業群
    structural_advantages: ['食品產業重要', '競爭相對較小'],
    structural_challenges: ['需長時間站立工作', '環境溫度高'],
    annual_quota: 2800
  },
  {
    id: 'group-14',
    group_code: '14',
    group_name: '家政委',
    description: '美容、美髮、幼兒保育、時尚設計、家政管理',
    certificate_types: [
      { name: '美容技術士', level: '丙級', bonus_percent: 5 },
      { name: '美容技術士', level: '乙級', bonus_percent: 15 },
      { name: '美髮技術士', level: '丙級', bonus_percent: 5 },
      { name: '美髮技術士', level: '乙級', bonus_percent: 15 },
      { name: '保母人員技術士', level: '丙級', bonus_percent: 5 },
      { name: '保母人員技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 美髮類', pathway: '技優保送/甄審' },
      { name: '全國技能競賽 - 美容類', pathway: '技優保送/甄審' },
      { name: '國際美髮競賽', portfolio_code: 'C-4' }
    ],
    career_paths: [
      { title: '美髮師', growth: '中', salary_range: '30K-60K' },
      { title: '美容師', growth: '中', salary_range: '35K-70K' },
      { title: '幼兒園老師', growth: '中', salary_range: '30K-50K' }
    ],
    cross_group_opportunities: ['08', '15'], // 設計群、商管群幼保
    structural_advantages: ['服務業需求大', '女性職場優勢'],
    structural_challenges: ['工作時間不固定', '需要情緒勞動'],
    annual_quota: 1500
  },
  {
    id: 'group-15',
    group_code: '15',
    group_name: '商業與管理群(幼保)',
    description: '幼兒保育、幼兒教育、教保輔導',
    certificate_types: [
      { name: '保母人員技術士', level: '丙級', bonus_percent: 5 },
      { name: '保母人員技術士', level: '乙級', bonus_percent: 15 },
      { name: '幼教教師證', bonus_percent: 5 } // 非技術士
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 幼兒保育類', pathway: '技優保送/甄審' },
      { name: '全國幼教教學競賽', portfolio_code: 'C-4' }
    ],
    career_paths: [
      { title: '幼兒園老師', growth: '中', salary_range: '30K-50K' },
      { title: '教保輔導員', growth: '中', salary_range: '35K-60K' },
      { title: '幼兒園園長', growth: '高', salary_range: '40K-70K' }
    ],
    cross_group_opportunities: ['14', '06'], // 家政委、商管群
    structural_advantages: ['教育專業化', '女性工作友善'],
    structural_challenges: ['需耐心', '責任重大'],
    annual_quota: 1200
  },
  {
    id: 'group-16',
    group_code: '16',
    group_name: '餐旅群',
    description: '餐飲管理、旅遊管理、酒店服務、觀光規劃',
    certificate_types: [
      { name: '餐飲技術士', level: '丙級', bonus_percent: 5 },
      { name: '餐飲技術士', level: '乙級', bonus_percent: 15 },
      { name: '調酒技術士', level: '丙級', bonus_percent: 5 },
      { name: '調酒技術士', level: '乙級', bonus_percent: 15 },
      { name: '西餐烹調技術士', level: '丙級', bonus_percent: 5 },
      { name: '西餐烹調技術士', level: '乙級', bonus_percent: 15 },
      { name: '中餐烹調技術士', level: '丙級', bonus_percent: 5 },
      { name: '中餐烹調技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 餐旅類', pathway: '技優保送/甄審' },
      { name: '全國烹飪競賽', portfolio_code: 'C-4' },
      { name: '全國餐旅技能競賽', pathway: '技優保送/甄審' }
    ],
    career_paths: [
      { title: '餐飲經理', growth: '中', salary_range: '35K-70K' },
      { title: '旅遊經理', growth: '中', salary_range: '40K-75K' },
      { title: '酒店經理', growth: '高', salary_range: '45K-85K' }
    ],
    cross_group_opportunities: ['07', '13', '14'], // 外語、食品、家政
    structural_advantages: ['服務業強', '實務導向', '國際化'],
    structural_challenges: ['需站立工作', '工作時間長'],
    annual_quota: 4800
  },
  {
    id: 'group-17',
    group_code: '17',
    group_name: '農業群(森林)',
    description: '林業、森林經營、自然資源管理、生態保育',
    certificate_types: [
      { name: '造林技術士', level: '丙級', bonus_percent: 5 },
      { name: '造林技術士', level: '乙級', bonus_percent: 15 },
      { name: '森林遊憩技術士', level: '丙級', bonus_percent: 5 },
      { name: '森林遊憩技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 林業類', pathway: '技優保送/甄審' }
    ],
    career_paths: [
      { title: '林業技師', growth: '中', salary_range: '40K-75K' },
      { title: '森林遊憩規劃師', growth: '中', salary_range: '45K-80K' },
      { title: '生態保育員', growth: '高', salary_range: '35K-70K' }
    ],
    cross_group_opportunities: ['12'], // 農業群
    structural_advantages: ['生態保護重視', '政策支持'],
    structural_challenges: ['地區性強', '戶外工作多'],
    annual_quota: 300
  },
  {
    id: 'group-18',
    group_code: '18',
    group_name: '藝術群',
    description: '美術、音樂、表演、視覺藝術、表演藝術',
    certificate_types: [
      { name: '美術設計類檢定', bonus_percent: 5 }
    ],
    has_certificate_system: false,
    competition_types: [
      { name: '全國美展競賽', portfolio_code: 'C-4' },
      { name: '全國音樂競賽', portfolio_code: 'C-4' },
      { name: '全國學生美展比賽', portfolio_code: 'C-4' },
      { name: '國際藝術競賽', portfolio_code: 'C-4' }
    ],
    career_paths: [
      { title: '藝術家', growth: '高', salary_range: '30K-70K' },
      { title: '音樂家', growth: '高', salary_range: '25K-60K' },
      { title: '表演藝術家', growth: '中', salary_range: '25K-60K' }
    ],
    cross_group_opportunities: ['08', '19'], // 設計群、資電群
    structural_advantages: ['創意產業機會多', '作品可直接作為備審'],
    structural_challenges: ['收入不穩定', '競爭激烈', '主觀評分'],
    annual_quota: 1000
  },
  {
    id: 'group-19',
    group_code: '19',
    group_name: '電機與電子群(資電)',
    description: '資訊工程、軟體設計、系統分析、程式設計',
    certificate_types: [
      { name: '數位電子電路設計技術士', level: '丙級', bonus_percent: 5 },
      { name: '數位電子電路設計技術士', level: '乙級', bonus_percent: 15 },
      { name: '電腦軟體設計技術士', level: '丙級', bonus_percent: 5 },
      { name: '電腦軟體設計技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '全國技能競賽 - 資電類', pathway: '技優保送/甄審' },
      { name: '國際技能競賽 - 資訊訓', pathway: '技優保送' },
      { name: '國際資訊奧林匹克（ICO）', portfolio_code: 'C-4' },
      { name: '各類黑客松', portfolio_code: 'C-4' },
      { name: '全國高中職專題及創意製作競賽', portfolio_code: 'C-4' }
    ],
    career_paths: [
      { title: '軟體工程師', growth: '高', salary_range: '50K-100K' },
      { title: '系統分析師', growth: '高', salary_range: '55K-95K' },
      { title: '資安工程師', growth: '高', salary_range: '60K-110K' }
    ],
    cross_group_opportunities: ['03', '06', '08', '18'], // 電機群、商管群、外語群、藝術群
    structural_advantages: ['科技業需求最大', '遠端工作機會多', '國際化程度高'],
    structural_challenges: ['技術更新極快', '需不斷學習', '工作壓力大'],
    annual_quota: 4500
  },
  {
    id: 'group-20',
    group_code: '20',
    group_name: '藝術群(影視)',
    description: '電影、電視、動畫、廣播、影音後製',
    certificate_types: [
      { name: '影音後製技術士', level: '丙級', bonus_percent: 5 },
      { name: '影音後製技術士', level: '乙級', bonus_percent: 15 }
    ],
    has_certificate_system: true,
    competition_types: [
      { name: '國際學生影展', portfolio_code: 'C-4' },
      { name: '金穗獎、金馬獎', portfolio_code: 'C-4' },
      { name: '金鐘獎、金鐘獎', portfolio_code: 'C-4' },
      { name: '其他影視競賽', portfolio_code: 'C-4' }
    ],
    career_paths: [
      { title: '導演', growth: '高', salary_range: '40K-90K' },
      { title: '製片', growth: '中', salary_range: '35K-70K' },
      { title: '後製工程師', growth: '中', salary_range: '40K-75K' }
    ],
    cross_group_opportunities: ['18', '07', '08'], // 藝術群、外語群
    structural_advantages: ['影視產業升級中', '國際化程度高'],
    structural_challenges: ['行業競爭激烈', '收入不穩定'],
    annual_quota: 500
  }
]
