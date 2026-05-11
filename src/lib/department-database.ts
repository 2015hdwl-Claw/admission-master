import { DepartmentInfo, GapAnalysis, UserProfile, ConsolidatedActionPlan } from '@/types/department'

// ── 科系資料庫 ──
// 每個科系有教學特色、研究方向、職涯方向
// 每個科系有 6 種管道各自的錄取條件

export const departments: DepartmentInfo[] = [
  // ══════════ 國立臺灣科技大學 (NTUST) ══════════
  {
    id: 'ntust-ee', schoolId: 'ntust', schoolName: '國立臺灣科技大學',
    departmentName: '電機工程系', groupCode: '03', groupName: '電機群',
    description: '培養電力、控制、通訊領域的高階工程人才',
    features: ['智慧電網與綠能技術', '機器人自動化控制', '5G 通訊系統設計'],
    researchAreas: ['電力電子', '人工智慧邊緣運算', '物聯網應用'],
    careerPaths: ['電力工程師', '自動控制工程師', '通訊系統工程師', '半導體製程工程師', '研發工程師'],
    pathways: {
      stars: { available: true, minGradePercentile: 15, acceptanceRate: 8, deadline: '10/15', quota: 15, specialNote: '需學校推薦' },
      selection: { available: true, acceptanceRate: 10, deadline: '12/20', quota: 40, lowestScore: 570 },
      distribution: { available: true, acceptanceRate: 6, deadline: '04/10', quota: 20, lowestScore: 580 },
      skills: { available: true, requiredCertificate: '乙級電力技術士', acceptanceRate: 35, deadline: '03/05', quota: 5 },
      guarantee: { available: true, requiredCompetition: '全國技能競賽前三名', acceptanceRate: 90, deadline: '02/20', quota: 2 },
      special: { available: false, acceptanceRate: 0, deadline: '' },
    }
  },
  {
    id: 'ntust-ece', schoolId: 'ntust', schoolName: '國立臺灣科技大學',
    departmentName: '電子工程系', groupCode: '04', groupName: '電子群',
    description: '專注 IC 設計、半導體、嵌入式系統的頂尖科系',
    features: ['半導體製程實作', 'IC 晶片設計', '嵌入式系統開發'],
    researchAreas: ['VLSI 設計', '奈米電子', '光電半導體'],
    careerPaths: ['IC 設計工程師', '半導體工程師', '硬體研發工程師', '韌體工程師', '光電工程師'],
    pathways: {
      stars: { available: true, minGradePercentile: 15, acceptanceRate: 7, deadline: '10/15', quota: 12 },
      selection: { available: true, acceptanceRate: 9, deadline: '12/20', quota: 35, lowestScore: 560 },
      distribution: { available: true, acceptanceRate: 5, deadline: '04/10', quota: 18, lowestScore: 575 },
      skills: { available: true, requiredCertificate: '乙級電子技術士', acceptanceRate: 38, deadline: '03/05', quota: 5 },
      guarantee: { available: true, requiredCompetition: '全國技能競賽前三名', acceptanceRate: 88, deadline: '02/20', quota: 2 },
      special: { available: false, acceptanceRate: 0, deadline: '' },
    }
  },
  {
    id: 'ntust-cs', schoolId: 'ntust', schoolName: '國立臺灣科技大學',
    departmentName: '資訊工程系', groupCode: '05', groupName: '資訊群',
    description: '全國科大最頂尖的資工系，軟硬體兼備',
    features: ['演算法與資料結構', '人工智慧與機器學習', '資訊安全'],
    researchAreas: ['深度學習', '區塊鏈技術', '量子計算'],
    careerPaths: ['軟體工程師', 'AI 工程師', '資安工程師', '全端開發工程師', '資料科學家'],
    pathways: {
      stars: { available: true, minGradePercentile: 10, acceptanceRate: 5, deadline: '10/15', quota: 8 },
      selection: { available: true, acceptanceRate: 7, deadline: '12/20', quota: 30, lowestScore: 590 },
      distribution: { available: true, acceptanceRate: 4, deadline: '04/10', quota: 15, lowestScore: 600 },
      skills: { available: true, requiredCertificate: '乙級電腦技術士', acceptanceRate: 30, deadline: '03/05', quota: 4 },
      guarantee: { available: true, requiredCompetition: '全國技能競賽前三名', acceptanceRate: 85, deadline: '02/20', quota: 1 },
      special: { available: true, acceptanceRate: 20, deadline: '01/15', quota: 3, specialNote: '需有程式競賽獲獎或開源貢獻證明' },
    }
  },
  {
    id: 'ntust-ba', schoolId: 'ntust', schoolName: '國立臺灣科技大學',
    departmentName: '企業管理系', groupCode: '06', groupName: '商業與管理群',
    description: '結合理論與實務，培養跨領域管理人才',
    features: ['個案教學法', '企業實習制度', '創業學程'],
    researchAreas: ['數位行銷', '供應鏈管理', '組織行為'],
    careerPaths: ['行銷企劃', '人資管理師', '專案經理', '業務工程師', '創業家'],
    pathways: {
      stars: { available: true, minGradePercentile: 20, acceptanceRate: 12, deadline: '10/15', quota: 20 },
      selection: { available: true, acceptanceRate: 18, deadline: '12/20', quota: 55, lowestScore: 480 },
      distribution: { available: true, acceptanceRate: 10, deadline: '04/10', quota: 35, lowestScore: 490 },
      skills: { available: true, requiredCertificate: '乙級商業技術士', acceptanceRate: 42, deadline: '03/05', quota: 8 },
      guarantee: { available: false, acceptanceRate: 0, deadline: '' },
      special: { available: true, acceptanceRate: 25, deadline: '01/15', quota: 4 },
    }
  },
  {
    id: 'ntust-design', schoolId: 'ntust', schoolName: '國立臺灣科技大學',
    departmentName: '設計系', groupCode: '07', groupName: '設計群',
    description: '工商業設計並重，強調創新與實作能力',
    features: ['使用者經驗設計', '產品原型製作', '跨領域設計思考'],
    researchAreas: ['人機互動', '永續設計', '數位製造'],
    careerPaths: ['產品設計師', 'UI/UX 設計師', '平面設計師', '設計研究員', '品牌設計師'],
    pathways: {
      stars: { available: true, minGradePercentile: 25, acceptanceRate: 15, deadline: '10/15', quota: 10 },
      selection: { available: true, acceptanceRate: 22, deadline: '12/20', quota: 30, lowestScore: 400, specialNote: '備審作品集佔 50%' },
      distribution: { available: false, acceptanceRate: 0, deadline: '' },
      skills: { available: true, requiredCertificate: '乙級圖文組版技術士', acceptanceRate: 45, deadline: '03/05', quota: 6 },
      guarantee: { available: false, acceptanceRate: 0, deadline: '' },
      special: { available: true, acceptanceRate: 30, deadline: '01/15', quota: 5, specialNote: '需有設計作品集' },
    }
  },

  // ══════════ 國立臺北科技大學 (NTUT) ══════════
  {
    id: 'ntut-me', schoolId: 'ntut', schoolName: '國立臺北科技大學',
    departmentName: '機械工程系', groupCode: '02', groupName: '機械群',
    description: '百年機械名校，精密製造與自動化領域領先',
    features: ['精密加工實作', 'CNC 數控機械', '自動化產線設計'],
    researchAreas: ['微奈米製造', '智慧機器人', '綠色能源機械'],
    careerPaths: ['機械工程師', 'CNC 程式工程師', '自動化工程師', '品保工程師', '研發工程師'],
    pathways: {
      stars: { available: true, minGradePercentile: 20, acceptanceRate: 10, deadline: '10/15', quota: 18 },
      selection: { available: true, acceptanceRate: 14, deadline: '12/20', quota: 45, lowestScore: 510 },
      distribution: { available: true, acceptanceRate: 8, deadline: '04/10', quota: 25, lowestScore: 520 },
      skills: { available: true, requiredCertificate: '乙級機械技術士', acceptanceRate: 40, deadline: '03/05', quota: 6 },
      guarantee: { available: true, requiredCompetition: '全國技能競賽前三名', acceptanceRate: 92, deadline: '02/20', quota: 2 },
      special: { available: false, acceptanceRate: 0, deadline: '' },
    }
  },
  {
    id: 'ntut-ece', schoolId: 'ntut', schoolName: '國立臺北科技大學',
    departmentName: '電子工程系', groupCode: '04', groupName: '電子群',
    description: '半導體與通訊技術重鎮，產學合作緊密',
    features: ['半導體封裝測試', '無線通訊系統', '系統晶片設計'],
    researchAreas: ['5G/6G 通訊', 'AI 晶片', '感測器整合'],
    careerPaths: ['半導體工程師', '通訊工程師', 'IC 佈局工程師', '測試工程師', '韌體工程師'],
    pathways: {
      stars: { available: true, minGradePercentile: 18, acceptanceRate: 9, deadline: '10/15', quota: 15 },
      selection: { available: true, acceptanceRate: 13, deadline: '12/20', quota: 40, lowestScore: 500 },
      distribution: { available: true, acceptanceRate: 7, deadline: '04/10', quota: 22, lowestScore: 515 },
      skills: { available: true, requiredCertificate: '乙級電子技術士', acceptanceRate: 36, deadline: '03/05', quota: 5 },
      guarantee: { available: true, requiredCompetition: '全國技能競賽前三名', acceptanceRate: 89, deadline: '02/20', quota: 2 },
      special: { available: false, acceptanceRate: 0, deadline: '' },
    }
  },
  {
    id: 'ntut-cs', schoolId: 'ntut', schoolName: '國立臺北科技大學',
    departmentName: '資訊工程系', groupCode: '05', groupName: '資訊群',
    description: '實務導向的資工訓練，業界最愛的科大資工',
    features: ['實務專題製作', '業界實習', '黑客松競賽'],
    researchAreas: ['物聯網應用', '大數據分析', '資訊安全'],
    careerPaths: ['軟體工程師', '後端工程師', 'DevOps 工程師', '資料工程師', 'QA 工程師'],
    pathways: {
      stars: { available: true, minGradePercentile: 12, acceptanceRate: 6, deadline: '10/15', quota: 10 },
      selection: { available: true, acceptanceRate: 9, deadline: '12/20', quota: 35, lowestScore: 540 },
      distribution: { available: true, acceptanceRate: 5, deadline: '04/10', quota: 18, lowestScore: 555 },
      skills: { available: true, requiredCertificate: '乙級電腦技術士', acceptanceRate: 28, deadline: '03/05', quota: 4 },
      guarantee: { available: true, requiredCompetition: '全國技能競賽前三名', acceptanceRate: 86, deadline: '02/20', quota: 1 },
      special: { available: true, acceptanceRate: 18, deadline: '01/15', quota: 3 },
    }
  },
  {
    id: 'ntut-civil', schoolId: 'ntut', schoolName: '國立臺北科技大學',
    departmentName: '土木工程系', groupCode: '10', groupName: '土木群',
    description: '百年土木，結構工程與營建管理專長',
    features: ['結構安全檢測', 'BIM 建築資訊模型', '耐震工程'],
    researchAreas: ['智慧營建', '綠建築', '大地工程'],
    careerPaths: ['土木工程師', '結構工程師', '營建管理師', '工地主任', 'BIM 工程師'],
    pathways: {
      stars: { available: true, minGradePercentile: 30, acceptanceRate: 18, deadline: '10/15', quota: 15 },
      selection: { available: true, acceptanceRate: 20, deadline: '12/20', quota: 40, lowestScore: 440 },
      distribution: { available: true, acceptanceRate: 12, deadline: '04/10', quota: 30, lowestScore: 450 },
      skills: { available: true, requiredCertificate: '乙級建築技術士', acceptanceRate: 44, deadline: '03/05', quota: 5 },
      guarantee: { available: false, acceptanceRate: 0, deadline: '' },
      special: { available: false, acceptanceRate: 0, deadline: '' },
    }
  },

  // ══════════ 國立高雄科技大學 (NKUST) ══════════
  {
    id: 'nkust-ee', schoolId: 'nkust', schoolName: '國立高雄科技大學',
    departmentName: '電機工程系', groupCode: '03', groupName: '電機群',
    description: '南台灣最大電機系，涵蓋電力、控制、光電',
    features: ['太陽光電系統', '電動車驅動技術', '機電整合'],
    researchAreas: ['再生能源', '智慧電網', '電力電子'],
    careerPaths: ['電力工程師', '再生能源工程師', '機電整合工程師', '光電工程師', '設備工程師'],
    pathways: {
      stars: { available: true, minGradePercentile: 25, acceptanceRate: 14, deadline: '10/15', quota: 25 },
      selection: { available: true, acceptanceRate: 18, deadline: '12/20', quota: 50, lowestScore: 480 },
      distribution: { available: true, acceptanceRate: 10, deadline: '04/10', quota: 30, lowestScore: 490 },
      skills: { available: true, requiredCertificate: '乙級電力技術士', acceptanceRate: 42, deadline: '03/05', quota: 8 },
      guarantee: { available: true, requiredCompetition: '全國技能競賽前三名', acceptanceRate: 91, deadline: '02/20', quota: 3 },
      special: { available: false, acceptanceRate: 0, deadline: '' },
    }
  },
  {
    id: 'nkust-ba', schoolId: 'nkust', schoolName: '國立高雄科技大學',
    departmentName: '企業管理系', groupCode: '06', groupName: '商業與管理群',
    description: '南台灣最具規模的商管科系，產學資源豐富',
    features: ['企業診斷實作', '連鎖加盟管理', '電子商務實務'],
    researchAreas: ['服務業管理', '品牌行銷', '社會企業'],
    careerPaths: ['行銷專員', '儲備幹部', '電商營運', '門市店長', '採購專員'],
    pathways: {
      stars: { available: true, minGradePercentile: 30, acceptanceRate: 20, deadline: '10/15', quota: 30 },
      selection: { available: true, acceptanceRate: 25, deadline: '12/20', quota: 70, lowestScore: 420 },
      distribution: { available: true, acceptanceRate: 15, deadline: '04/10', quota: 50, lowestScore: 430 },
      skills: { available: true, requiredCertificate: '乙級商業技術士', acceptanceRate: 48, deadline: '03/05', quota: 10 },
      guarantee: { available: false, acceptanceRate: 0, deadline: '' },
      special: { available: true, acceptanceRate: 28, deadline: '01/15', quota: 5 },
    }
  },
  {
    id: 'nkust-tourism', schoolId: 'nkust', schoolName: '國立高雄科技大學',
    departmentName: '觀光管理系', groupCode: '01', groupName: '餐旅群',
    description: '培育觀光產業專業管理人才',
    features: ['旅遊行程規劃實作', '航空訂位系統實習', '觀光英文'],
    researchAreas: ['生態旅遊', '文化觀光', '智慧觀光'],
    careerPaths: ['領隊導遊', '旅遊企劃', '飯店管理', '航空地勤', '觀光行政'],
    pathways: {
      stars: { available: true, minGradePercentile: 30, acceptanceRate: 22, deadline: '10/15', quota: 20 },
      selection: { available: true, acceptanceRate: 28, deadline: '12/20', quota: 60, lowestScore: 380 },
      distribution: { available: true, acceptanceRate: 18, deadline: '04/10', quota: 40, lowestScore: 390 },
      skills: { available: true, requiredCertificate: '乙級餐飲技術士', acceptanceRate: 50, deadline: '03/05', quota: 8 },
      guarantee: { available: false, acceptanceRate: 0, deadline: '' },
      special: { available: true, acceptanceRate: 32, deadline: '01/15', quota: 5, specialNote: '需有外語能力證明' },
    }
  },

  // ══════════ 國立虎尾科技大學 (NFCU) ══════════
  {
    id: 'nfcu-me', schoolId: 'nfcu', schoolName: '國立虎尾科技大學',
    departmentName: '機械設計工程系', groupCode: '02', groupName: '機械群',
    description: '精密機械設計與製造，中部精密機械重鎮',
    features: ['3D CAD/CAM 設計', '精密量測技術', '模具設計實作'],
    researchAreas: ['精密製造', '模具工程', '逆向工程'],
    careerPaths: ['機械設計工程師', '模具工程師', 'CAD/CAM 工程師', '品管工程師', '自動化工程師'],
    pathways: {
      stars: { available: true, minGradePercentile: 30, acceptanceRate: 20, deadline: '10/15', quota: 20 },
      selection: { available: true, acceptanceRate: 24, deadline: '12/20', quota: 50, lowestScore: 420 },
      distribution: { available: true, acceptanceRate: 16, deadline: '04/10', quota: 30, lowestScore: 430 },
      skills: { available: true, requiredCertificate: '乙級機械技術士', acceptanceRate: 46, deadline: '03/05', quota: 7 },
      guarantee: { available: true, requiredCompetition: '全國技能競賽前三名', acceptanceRate: 93, deadline: '02/20', quota: 2 },
      special: { available: false, acceptanceRate: 0, deadline: '' },
    }
  },

  // ══════════ 國立勤益科技大學 (NFU) ══════════
  {
    id: 'nfu-cs', schoolId: 'nfu', schoolName: '國立勤益科技大學',
    departmentName: '資訊工程系', groupCode: '05', groupName: '資訊群',
    description: '中部實力堅強的資工系，產學合作豐富',
    features: ['APP 開發實作', '遊戲程式設計', '網路安全管理'],
    researchAreas: ['物聯網', '機器學習', '資訊安全'],
    careerPaths: ['軟體工程師', 'APP 開發工程師', '網管工程師', '遊戲程式設計師', '系統分析師'],
    pathways: {
      stars: { available: true, minGradePercentile: 25, acceptanceRate: 15, deadline: '10/15', quota: 15 },
      selection: { available: true, acceptanceRate: 20, deadline: '12/20', quota: 40, lowestScore: 430 },
      distribution: { available: true, acceptanceRate: 12, deadline: '04/10', quota: 25, lowestScore: 440 },
      skills: { available: true, requiredCertificate: '乙級電腦技術士', acceptanceRate: 38, deadline: '03/05', quota: 5 },
      guarantee: { available: true, requiredCompetition: '全國技能競賽前三名', acceptanceRate: 88, deadline: '02/20', quota: 1 },
      special: { available: true, acceptanceRate: 22, deadline: '01/15', quota: 3 },
    }
  },

  // ══════════ 國立臺灣海洋大學 (NTOU) ══════════
  {
    id: 'ntou-maritime', schoolId: 'ntou', schoolName: '國立臺灣海洋大學',
    departmentName: '航運管理學系', groupCode: '11', groupName: '海事群',
    description: '台灣唯一航運管理專業，航商最愛',
    features: ['航運實務操作', '國際物流管理', '海事法規'],
    researchAreas: ['港埠管理', '國際供應鏈', '船舶管理'],
    careerPaths: ['海運操作員', '物流管理師', '報關行', '船務代理', '港務人員'],
    pathways: {
      stars: { available: true, minGradePercentile: 30, acceptanceRate: 22, deadline: '10/15', quota: 10 },
      selection: { available: true, acceptanceRate: 25, deadline: '12/20', quota: 25, lowestScore: 410 },
      distribution: { available: true, acceptanceRate: 18, deadline: '04/10', quota: 15, lowestScore: 420 },
      skills: { available: true, acceptanceRate: 50, deadline: '03/05', quota: 5 },
      guarantee: { available: false, acceptanceRate: 0, deadline: '' },
      special: { available: true, acceptanceRate: 30, deadline: '01/15', quota: 3, specialNote: '需有海事相關經歷' },
    }
  },

  // ══════════ 國立中興大學 (NCHU) ══════════
  {
    id: 'nchu-chem', schoolId: 'nchu', schoolName: '國立中興大學',
    departmentName: '化學工程學系', groupCode: '09', groupName: '化工群',
    description: '中台灣老牌化工系，材料與製程專長',
    features: ['單元操作實驗', '材料分析技術', '綠色化學製程'],
    researchAreas: ['高分子材料', '生醫材料', '能源材料'],
    careerPaths: ['化學工程師', '製程工程師', '品保工程師', '材料研發', '半導體製程'],
    pathways: {
      stars: { available: true, minGradePercentile: 20, acceptanceRate: 12, deadline: '10/15', quota: 10 },
      selection: { available: true, acceptanceRate: 15, deadline: '12/20', quota: 30, lowestScore: 490 },
      distribution: { available: true, acceptanceRate: 9, deadline: '04/10', quota: 18, lowestScore: 500 },
      skills: { available: true, requiredCertificate: '乙級化工技術士', acceptanceRate: 38, deadline: '03/05', quota: 4 },
      guarantee: { available: false, acceptanceRate: 0, deadline: '' },
      special: { available: false, acceptanceRate: 0, deadline: '' },
    }
  },

  // ══════════ 國立嘉義大學 (NCYU) ══════════
  {
    id: 'ncyu-nursing', schoolId: 'ncyu', schoolName: '國立嘉義大學',
    departmentName: '護理學系', groupCode: '12', groupName: '護理群',
    description: '培育專業護理人才，臨床實習資源豐富',
    features: ['臨床護理實習', '社區衛生護理', '護理資訊系統'],
    researchAreas: ['長期照護', '老人護理', '護理教育'],
    careerPaths: ['臨床護理師', '社區護理師', '衛教護理師', '護理長', '居家護理師'],
    pathways: {
      stars: { available: true, minGradePercentile: 20, acceptanceRate: 14, deadline: '10/15', quota: 15 },
      selection: { available: true, acceptanceRate: 18, deadline: '12/20', quota: 40, lowestScore: 460 },
      distribution: { available: true, acceptanceRate: 11, deadline: '04/10', quota: 25, lowestScore: 470 },
      skills: { available: true, requiredCertificate: '乙級護理技術士', acceptanceRate: 35, deadline: '03/05', quota: 5 },
      guarantee: { available: false, acceptanceRate: 0, deadline: '' },
      special: { available: false, acceptanceRate: 0, deadline: '' },
    }
  },
]

// ── 大學簡稱對照表 ──
const SCHOOL_ALIASES: Record<string, string> = {
  '台科': '國立臺灣科技大學', '台科大': '國立臺灣科技大學', '臺科': '國立臺灣科技大學', '臺科大': '國立臺灣科技大學', 'ntust': '國立臺灣科技大學',
  '北科': '國立臺北科技大學', '北科大': '國立臺北科技大學', '臺北科大': '國立臺北科技大學', 'ntut': '國立臺北科技大學',
  '高科': '國立高雄科技大學', '高科大': '國立高雄科技大學', '高雄科大': '國立高雄科技大學', 'nkust': '國立高雄科技大學',
  '虎科': '國立虎尾科技大學', '虎科大': '國立虎尾科技大學', '虎尾科大': '國立虎尾科技大學', 'nfcu': '國立虎尾科技大學',
  '勤益': '國立勤益科技大學', '勤益科大': '國立勤益科技大學', 'nfu': '國立勤益科技大學',
  '暨南': '國立暨南國際大學', '暨大': '國立暨南國際大學', 'ncnu': '國立暨南國際大學',
  '中興': '國立中興大學', '興大': '國立中興大學', 'nchu': '國立中興大學',
  '嘉義': '國立嘉義大學', '嘉大': '國立嘉義大學', '嘉義大': '國立嘉義大學', 'ncyu': '國立嘉義大學',
  '臺南大': '國立臺南大學', '南大': '國立臺南大學', 'nutn': '國立臺南大學',
  '海大': '國立臺灣海洋大學', '海洋': '國立臺灣海洋大學', 'ntou': '國立臺灣海洋大學',
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
  // Resolve aliases to full school name
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
    d.careerPaths.some(c => c.toLowerCase().includes(q)) ||
    d.researchAreas.some(r => r.toLowerCase().includes(q))
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

  // 在校成績
  if (pathway.minGradePercentile) {
    if (profile.gradePercentile > 0 && profile.gradePercentile <= pathway.minGradePercentile) {
      alreadyHave.push({ name: '在校成績' })
      score += 35
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

  // 證照
  if (pathway.requiredCertificate) {
    if (profile.certificates.includes(pathway.requiredCertificate)) {
      alreadyHave.push({ name: pathway.requiredCertificate })
      score += 30
    } else {
      completelyMissing.push({ name: pathway.requiredCertificate, required: pathway.requiredCertificate, daysLeft: 90 })
      gain += 30
      actionItems.push({ title: `報名 ${pathway.requiredCertificate} 考試`, deadline: '下次考試日期', daysLeft: 72, priority: 'high' })
    }
  }

  // 競賽
  if (pathway.requiredCompetition) {
    if (profile.competitions.length > 0) {
      alreadyHave.push({ name: '技藝競賽經驗' })
      score += 25
    } else {
      completelyMissing.push({ name: '技藝競賽', required: pathway.requiredCompetition, daysLeft: 120 })
      gain += 25
      actionItems.push({ title: '了解並報名技藝競賽', deadline: '校內初選前', daysLeft: 45, priority: 'medium' })
    }
  }

  // 專題
  if (profile.hasProject) {
    alreadyHave.push({ name: '專題作品' })
    score += 10
  } else {
    needImprovement.push({ name: '專題作品', current: '尚未準備', required: '需要實作專題', daysLeft: 150 })
    gain += 10
    actionItems.push({ title: '開始準備專題作品', deadline: '申請前完成', daysLeft: 120, priority: 'medium' })
  }

  // 備審
  needImprovement.push({ name: '備審資料 / 讀書計畫', current: '尚未準備', required: '讀書計畫 + 備審資料', daysLeft: 60 })
  actionItems.push({ title: '完成讀書計畫初稿', deadline: '申請截止前 30 天', daysLeft: 30, priority: 'low' })

  const prioOrder = { high: 0, medium: 1, low: 2 }
  actionItems.sort((a, b) => prioOrder[a.priority] - prioOrder[b.priority])

  const pathwayNames: Record<string, string> = { stars: '繁星推薦', selection: '甄選入學', distribution: '聯合登記分發', skills: '技優甄審', guarantee: '技優保送', special: '特殊選才' }

  return {
    departmentId: dept.id,
    departmentName: dept.departmentName,
    schoolName: dept.schoolName,
    pathwayType,
    pathwayName: pathwayNames[pathwayType] || pathwayType,
    currentProbability: Math.min(95, score),
    potentialProbability: Math.min(95, score + gain),
    alreadyHave,
    needImprovement,
    completelyMissing,
    actionItems,
  }
}

// ── 找出最佳管道（錄取率最高的可用管道） ──
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
        const entry = { ...item, forDepartments: [dept.departmentName] }
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

// 舊的 Supabase 函數保留（向後相容）
export async function getDepartmentPathways(departmentCode: string): Promise<any[]> {
  const { data } = await (await import('./supabase')).supabase
    .from('department_requirements')
    .select('*')
    .eq('department_code', departmentCode)
    .eq('academic_year', new Date().getFullYear())
  return data || []
}
