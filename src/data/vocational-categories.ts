import type { VocationalGroup, VocationalCategory, SkillCategory } from '../types';

export const VOCATIONAL_GROUP_LABELS: Record<VocationalGroup, string> = {
  '餐旅群': '餐旅群',
  '機械群': '機械群',
  '電機群': '電機群',
  '電子群': '電子群',
  '資訊群': '資訊群',
  '商管群': '商管群',
  '設計群': '設計群',
  '農業群': '農業群',
  '化工群': '化工群',
  '土木群': '土木群',
  '海事群': '海事群',
  '護理群': '護理群',
  '家政群': '家政群',
  '語文群': '語文群',
  '商業與管理群': '商業與管理群',
};

export const VOCATIONAL_GROUP_COLORS: Record<VocationalGroup, string> = {
  '餐旅群': 'bg-orange-500',
  '機械群': 'bg-slate-500',
  '電機群': 'bg-yellow-500',
  '電子群': 'bg-cyan-500',
  '資訊群': 'bg-blue-500',
  '商管群': 'bg-emerald-500',
  '設計群': 'bg-pink-500',
  '農業群': 'bg-green-600',
  '化工群': 'bg-purple-500',
  '土木群': 'bg-amber-700',
  '海事群': 'bg-indigo-500',
  '護理群': 'bg-rose-500',
  '家政群': 'bg-fuchsia-500',
  '語文群': 'bg-teal-500',
  '商業與管理群': 'bg-lime-600',
};

export type SuperCategory = '工業類' | '商業類' | '設計類' | '服務類' | '資訊類' | '農業類' | '海事類' | '語文類';

export const SUPER_CATEGORY_LABELS: Record<SuperCategory, string> = {
  '工業類': '工業類',
  '商業類': '商業類',
  '設計類': '設計類',
  '服務類': '服務類',
  '資訊類': '資訊類',
  '農業類': '農業類',
  '海事類': '海事類',
  '語文類': '語文類',
};

export const VOCATIONAL_GROUP_SUPER_CATEGORY: Record<VocationalGroup, SuperCategory> = {
  '機械群': '工業類',
  '電機群': '工業類',
  '電子群': '工業類',
  '化工群': '工業類',
  '土木群': '工業類',
  '商管群': '商業類',
  '商業與管理群': '商業類',
  '設計群': '設計類',
  '餐旅群': '服務類',
  '護理群': '服務類',
  '家政群': '服務類',
  '資訊群': '資訊類',
  '農業群': '農業類',
  '海事群': '海事類',
  '語文群': '語文類',
};

export const VOCATIONAL_CATEGORIES: VocationalCategory[] = [
  // === 資訊群 ===
  {
    id: 'info-software',
    name: '資訊軟體應用',
    group: '資訊群',
    description: '培養程式設計、軟體開發與系統管理能力。學習寫程式、做專題、參加技能競賽。AI 時代最熱門的領域之一。',
    requiredSkills: ['capstone', 'certification', 'competition'],
    exampleDepartments: ['資訊工程系', '資訊管理系', '資訊網路技術系', '數位多媒體設計系'],
    exampleTechSchools: ['國立台北科技大學', '國立台灣科技大學', '國立雲林科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '程式設計概論', '資料處理'],
    careerOutlook: '軟體工程師、APP開發、網頁設計、AI應用開發。AI 時代需求持續成長。',
    startingSalary: 'NT$35,000-55,000',
  },
  {
    id: 'info-network',
    name: '資訊網路技術',
    group: '資訊群',
    description: '專注於網路架構、伺服器管理與資安。適合對硬體和網路有興趣的學生。',
    requiredSkills: ['capstone', 'certification', 'competition'],
    exampleDepartments: ['資訊網路技術系', '資訊工程系', '電腦與通訊工程系'],
    exampleTechSchools: ['國立台北科技大學', '國立高雄科技大學', '國立虎尾科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '程式設計概論', '資料處理'],
    careerOutlook: '網路工程師、資安工程師、系統管理員。',
    startingSalary: 'NT$33,000-50,000',
  },

  // === 電機群 ===
  {
    id: 'elec-maintenance',
    name: '電機維修',
    group: '電機群',
    description: '學習電力系統、電機控制與自動化。從家庭用電到工業電力系統。就業市場穩定，技術門檻高。',
    requiredSkills: ['capstone', 'certification', 'internship'],
    exampleDepartments: ['電機工程系', '電力工程系', '自動化工程系'],
    exampleTechSchools: ['國立台北科技大學', '國立高雄科技大學', '國立雲林科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '電工原理與實務', '電子學與實務'],
    careerOutlook: '電機技師、自動化工程師、工廠電力維護。台灣製造業升級帶來大量需求。',
    startingSalary: 'NT$35,000-50,000',
  },

  // === 電子群 ===
  {
    id: 'elec-circuit',
    name: '電子技術',
    group: '電子群',
    description: '學習電路設計、半導體製程與電子元件。台灣半導體產業的核心人才來源。',
    requiredSkills: ['capstone', 'certification', 'competition'],
    exampleDepartments: ['電子工程系', '半導體工程系', '光電工程系'],
    exampleTechSchools: ['國立台北科技大學', '國立台灣科技大學', '國立勤益科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '電子學與實務', '電工原理與實務'],
    careerOutlook: '半導體工程師、電路設計工程師、IC佈局工程師。台灣半導體產業是核心優勢。',
    startingSalary: 'NT$35,000-55,000',
  },

  // === 機械群 ===
  {
    id: 'mech-machining',
    name: '機械加工',
    group: '機械群',
    description: '學習 CNC 加工、精密製造與機械設計。台灣精密機械產業的重要人才來源。',
    requiredSkills: ['capstone', 'certification', 'internship', 'competition'],
    exampleDepartments: ['機械工程系', '機電整合系', '精密製造系'],
    exampleTechSchools: ['國立台北科技大學', '國立虎尾科技大學', '國立勤益科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '機械原理', '機械製造'],
    careerOutlook: 'CNC工程師、機械設計工程師、精密加工技師。工業4.0帶來轉型需求。',
    startingSalary: 'NT$32,000-48,000',
  },

  // === 餐旅群 ===
  {
    id: 'hospitality-food',
    name: '餐飲管理',
    group: '餐旅群',
    description: '學習烹飪技術、餐飲管理與食品安全。適合熱愛美食和服務的學生。實作比重高，就業快。',
    requiredSkills: ['capstone', 'certification', 'internship', 'competition'],
    exampleDepartments: ['餐飲管理系', '烘焙管理系', '廚藝系'],
    exampleTechSchools: ['國立高雄餐旅大學', '國立台灣觀光學院', '屏東科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '餐飲實務', '旅遊實務'],
    careerOutlook: '廚師、餐飲管理、烘焙師、餐飲創業。觀光業持續成長。',
    startingSalary: 'NT$28,000-42,000',
  },
  {
    id: 'hospitality-tourism',
    name: '旅遊管理',
    group: '餐旅群',
    description: '學習旅遊規劃、飯店管理與導覽解說。台灣觀光產業的重要人才來源。',
    requiredSkills: ['capstone', 'certification', 'internship'],
    exampleDepartments: ['旅遊管理系', '休閒事業管理系', '飯店管理系'],
    exampleTechSchools: ['國立高雄餐旅大學', '國立台灣觀光學院', '輔仁大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '餐飲實務', '旅遊實務'],
    careerOutlook: '領隊、導遊、飯店管理、旅遊規劃。國際觀光持續復甦。',
    startingSalary: 'NT$28,000-38,000',
  },

  // === 商管群 ===
  {
    id: 'biz-accounting',
    name: '會計事務',
    group: '商管群',
    description: '學習會計、稅務與財務管理。就業市場穩定，升學路徑廣泛。',
    requiredSkills: ['capstone', 'certification', 'club'],
    exampleDepartments: ['會計系', '財務金融系', '稅務系'],
    exampleTechSchools: ['國立台北科技大學', '國立台灣科技大學', '國立雲林科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '計算機概論', '會計學'],
    careerOutlook: '會計師、記帳員、財務分析師。AI時代會取代基礎記帳，但分析能力更有價值。',
    startingSalary: 'NT$32,000-45,000',
  },
  {
    id: 'biz-marketing',
    name: '行銷與流通管理',
    group: '商管群',
    description: '學習行銷策略、電子商務與供應鏈管理。適合有創意和溝通能力的學生。',
    requiredSkills: ['capstone', 'club', 'internship'],
    exampleDepartments: ['行銷管理系', '國際貿易系', '流通管理系'],
    exampleTechSchools: ['國立台北科技大學', '國立高雄科技大學', '國立台灣科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '計算機概論', '會計學'],
    careerOutlook: '行銷專員、電商經營、品牌管理。數位行銷需求大。',
    startingSalary: 'NT$30,000-42,000',
  },

  // === 設計群 ===
  {
    id: 'design-graphic',
    name: '商業設計',
    group: '設計群',
    description: '學習平面設計、品牌識別與包裝設計。適合有美感和創意的學生。',
    requiredSkills: ['capstone', 'competition', 'club'],
    exampleDepartments: ['商業設計系', '視覺傳達設計系', '多媒體設計系'],
    exampleTechSchools: ['國立台北科技大學', '國立雲林科技大學', '嶺東科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '設計基礎', '色彩原理'],
    careerOutlook: '平面設計師、UI/UX設計師、品牌設計師。AI工具輔助設計成趨勢。',
    startingSalary: 'NT$30,000-45,000',
  },
  {
    id: 'design-interior',
    name: '室內設計',
    group: '設計群',
    description: '學習室內空間規劃、家具設計與施工管理。實務性強，與建築業緊密連結。',
    requiredSkills: ['capstone', 'certification', 'competition'],
    exampleDepartments: ['室內設計系', '空間設計系', '建築系'],
    exampleTechSchools: ['國立台北科技大學', '國立雲林科技大學', '國立高雄科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '設計基礎', '色彩原理'],
    careerOutlook: '室內設計師、空間規劃師、展場設計。台灣房市帶來穩定需求。',
    startingSalary: 'NT$30,000-45,000',
  },

  // === 農業群 ===
  {
    id: 'agri-tech',
    name: '農業技術',
    group: '農業群',
    description: '學習農業生產、智慧農業與生物技術。農業正經歷科技化轉型。',
    requiredSkills: ['capstone', 'certification', 'internship'],
    exampleDepartments: ['農業科技系', '園藝系', '生物科技系'],
    exampleTechSchools: ['國立屏東科技大學', '國立宜蘭大學', '國立中興大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '農業概論', '生物技術'],
    careerOutlook: '農業技術員、智慧農業工程師、生物技術研究。智慧農業是新興領域。',
    startingSalary: 'NT$30,000-40,000',
  },

  // === 化工群 ===
  {
    id: 'chem-process',
    name: '化工技術',
    group: '化工群',
    description: '學習化學工程、材料科學與製程控制。台灣石化及半導體材料產業的人才來源。',
    requiredSkills: ['capstone', 'certification', 'internship'],
    exampleDepartments: ['化學工程系', '材料工程系', '光電材料系'],
    exampleTechSchools: ['國立台北科技大學', '國立雲林科技大學', '國立高雄科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '化工原理', '化學'],
    careerOutlook: '化學工程師、材料工程師、製程工程師。半導體材料需求大。',
    startingSalary: 'NT$33,000-48,000',
  },

  // === 土木群 ===
  {
    id: 'civil-construction',
    name: '土木技術',
    group: '土木群',
    description: '學習建築施工、工程測量與工程管理。台灣公共工程和營建業的人才來源。',
    requiredSkills: ['capstone', 'certification', 'internship'],
    exampleDepartments: ['土木工程系', '營建工程系', '空間設計系'],
    exampleTechSchools: ['國立台北科技大學', '國立高雄科技大學', '國立雲林科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '工程力學概論', '工程材料'],
    careerOutlook: '營建工程師、測量技師、工地管理。公共工程持續推動。',
    startingSalary: 'NT$32,000-45,000',
  },

  // === 海事群 ===
  {
    id: 'maritime-navigation',
    name: '航海技術',
    group: '海事群',
    description: '學習船舶駕駛、航海學與海上安全。台灣是海島國家，海事人才有特殊需求。',
    requiredSkills: ['capstone', 'certification', 'internship'],
    exampleDepartments: ['航海系', '輪機工程系', '海事資訊系'],
    exampleTechSchools: ['國立台灣海洋大學', '國立高雄科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '航海學概論', '船舶概論'],
    careerOutlook: '船員、航海員、港務管理。國際航運持續成長。',
    startingSalary: 'NT$45,000-80,000（含海外加給）',
  },

  // === 護理群 ===
  {
    id: 'nursing-care',
    name: '護理照護',
    group: '護理群',
    description: '學習護理技術、醫療照護與健康促進。台灣高齡化社會，護理人才需求極大。',
    requiredSkills: ['capstone', 'certification', 'internship', 'service'],
    exampleDepartments: ['護理系', '長期照護系', '健康管理系'],
    exampleTechSchools: ['國立台北護理健康大學', '國立高雄科技大學', '慈濟科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '護理學概論', '生物'],
    careerOutlook: '護理師、照服員、健康管理師。高齡化社會需求持續增長，就業率極高。',
    startingSalary: 'NT$38,000-50,000',
  },

  // === 家政群 ===
  {
    id: 'home-food',
    name: '食品與營養',
    group: '家政群',
    description: '學習食品加工、營養學與食品安全。適合對食品科學有興趣的學生。',
    requiredSkills: ['capstone', 'certification', 'internship'],
    exampleDepartments: ['食品科技系', '營養系', '食品安全系'],
    exampleTechSchools: ['國立屏東科技大學', '國立高雄科技大學', '靜宜大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '家政概論', '食品與營養'],
    careerOutlook: '食品工程師、營養師、食品安全管理。食品安全意識抬頭。',
    startingSalary: 'NT$30,000-40,000',
  },

  // === 語文群 ===
  {
    id: 'lang-applications',
    name: '應用外語',
    group: '語文群',
    description: '學習外語能力、跨文化溝通與翻譯。適合語文能力強、對國際事務有興趣的學生。',
    requiredSkills: ['capstone', 'competition', 'club'],
    exampleDepartments: ['應用外語系', '國際企業系', '觀光事業系'],
    exampleTechSchools: ['國立台北科技大學', '國立台灣科技大學', '文藻外語大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '本國語文', '外國語文'],
    careerOutlook: '翻譯、國際業務、外語教學、跨文化溝通。',
    startingSalary: 'NT$30,000-42,000',
  },

  // === 商業與管理群 ===
  {
    id: 'biz-admin',
    name: '商業經營',
    group: '商業與管理群',
    description: '學習商業運營、管理實務與創新創業。適合有領導力和企圖心的學生。',
    requiredSkills: ['capstone', 'club', 'internship'],
    exampleDepartments: ['企業管理系', '創業管理系', '經營管理系'],
    exampleTechSchools: ['國立台北科技大學', '國立台灣科技大學', '國立雲林科技大學'],
    unifiedExamSubjects: ['國文', '英文', '數學', '商業概論', '經濟學'],
    careerOutlook: '企業管理、創業、專案管理。數位轉型帶來新機會。',
    startingSalary: 'NT$32,000-45,000',
  },
];

export function getCategoriesByGroup(group: VocationalGroup): VocationalCategory[] {
  return VOCATIONAL_CATEGORIES.filter(c => c.group === group);
}

export function getCategoryById(id: string): VocationalCategory | undefined {
  return VOCATIONAL_CATEGORIES.find(c => c.id === id);
}

export function getGroupsBySuperCategory(superCat: SuperCategory): VocationalGroup[] {
  const entries = Object.entries(VOCATIONAL_GROUP_SUPER_CATEGORY);
  const filtered = entries.filter(([_, v]) => v === superCat);
  return filtered.map(([k]) => k as VocationalGroup);
}
