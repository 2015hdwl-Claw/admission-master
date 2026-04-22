import type { VocationalDirectionRule, VocationalFactCategory } from '../types';

export interface VocationalFactTemplate {
  id: string;
  category: VocationalFactCategory;
  label: string;
  placeholder: string;
  tags: string[];
}

export const VOCATIONAL_DIRECTION_RULES: VocationalDirectionRule[] = [
  // === 資訊群 ===
  { id: 'vr-001', conditions: ['programming', 'web-design'], direction: '軟體開發', directionGroup: '資訊群', confidence: 0.95, reason: '你會寫程式又做過網頁，軟體開發是你的強項。', relatedCategoryIds: ['info-software'] },
  { id: 'vr-002', conditions: ['programming', 'database'], direction: '軟體開發', directionGroup: '資訊群', confidence: 0.9, reason: '程式設計加上資料庫經驗，後端開發是你的方向。', relatedCategoryIds: ['info-software'] },
  { id: 'vr-003', conditions: ['programming'], direction: '軟體開發', directionGroup: '資訊群', confidence: 0.8, reason: '有程式設計經驗是進入資訊群最好的基礎。', relatedCategoryIds: ['info-software'] },
  { id: 'vr-004', conditions: ['networking', 'hardware'], direction: '網路技術', directionGroup: '資訊群', confidence: 0.85, reason: '對網路和硬體有興趣，網路技術是很好的方向。', relatedCategoryIds: ['info-network'] },
  { id: 'vr-005', conditions: ['networking'], direction: '網路技術', directionGroup: '資訊群', confidence: 0.75, reason: '網路相關經驗可以往網路技術發展。', relatedCategoryIds: ['info-network'] },
  { id: 'vr-006', conditions: ['game-design', 'animation'], direction: '多媒體與遊戲開發', directionGroup: '資訊群', confidence: 0.8, reason: '遊戲和動畫結合程式能力，多媒體方向很適合你。', relatedCategoryIds: ['info-software'] },

  // === 電機群 ===
  { id: 'vr-007', conditions: ['circuit', 'electrical-wiring'], direction: '電力系統維護', directionGroup: '電機群', confidence: 0.9, reason: '你懂電路和配線，電機維修是你的強項。', relatedCategoryIds: ['elec-maintenance'] },
  { id: 'vr-008', conditions: ['automation', 'plc'], direction: '自動化控制', directionGroup: '電機群', confidence: 0.9, reason: '自動化和PLC經驗是電機群最熱門的方向。', relatedCategoryIds: ['elec-maintenance'] },
  { id: 'vr-009', conditions: ['circuit'], direction: '電機維修', directionGroup: '電機群', confidence: 0.8, reason: '電路基礎是電機群的入門。', relatedCategoryIds: ['elec-maintenance'] },
  { id: 'vr-010', conditions: ['electrical-wiring'], direction: '電機維修', directionGroup: '電機群', confidence: 0.75, reason: '配線經驗可以直接應用在電機維修領域。', relatedCategoryIds: ['elec-maintenance'] },

  // === 電子群 ===
  { id: 'vr-011', conditions: ['soldering', 'circuit-design'], direction: '電子技術', directionGroup: '電子群', confidence: 0.9, reason: '焊接和電路設計是電子群的核心技能。', relatedCategoryIds: ['elec-circuit'] },
  { id: 'vr-012', conditions: ['semiconductor', 'ic-design'], direction: '半導體技術', directionGroup: '電子群', confidence: 0.95, reason: '半導體和IC設計經驗，你是台灣最需要的人才。', relatedCategoryIds: ['elec-circuit'] },
  { id: 'vr-013', conditions: ['soldering'], direction: '電子技術', directionGroup: '電子群', confidence: 0.8, reason: '焊接是電子群的基本功。', relatedCategoryIds: ['elec-circuit'] },
  { id: 'vr-014', conditions: ['iot', 'sensor'], direction: '物聯網應用', directionGroup: '電子群', confidence: 0.85, reason: 'IoT和感測器結合電子技術，是未來趨勢。', relatedCategoryIds: ['elec-circuit'] },

  // === 機械群 ===
  { id: 'vr-015', conditions: ['cnc', 'machining'], direction: '精密加工', directionGroup: '機械群', confidence: 0.95, reason: 'CNC和加工是機械群的核心技能，工業4.0時代很吃香。', relatedCategoryIds: ['mech-machining'] },
  { id: 'vr-016', conditions: ['welding', 'metalwork'], direction: '金屬加工', directionGroup: '機械群', confidence: 0.9, reason: '焊接和金屬加工是機械群的傳統強項。', relatedCategoryIds: ['mech-machining'] },
  { id: 'vr-017', conditions: ['cad', '3d-modeling'], direction: '機械設計', directionGroup: '機械群', confidence: 0.85, reason: 'CAD和3D建模能力可以往機械設計發展。', relatedCategoryIds: ['mech-machining'] },
  { id: 'vr-018', conditions: ['welding'], direction: '金屬加工', directionGroup: '機械群', confidence: 0.8, reason: '焊接技能是機械群的入門基石。', relatedCategoryIds: ['mech-machining'] },

  // === 餐旅群 ===
  { id: 'vr-019', conditions: ['cooking', 'baking'], direction: '餐飲管理', directionGroup: '餐旅群', confidence: 0.9, reason: '烹飪和烘焙經驗直接對應餐飲管理科系。', relatedCategoryIds: ['hospitality-food'] },
  { id: 'vr-020', conditions: ['cooking'], direction: '餐飲管理', directionGroup: '餐旅群', confidence: 0.85, reason: '烹飪技能是餐飲管理的核心。', relatedCategoryIds: ['hospitality-food'] },
  { id: 'vr-021', conditions: ['baking'], direction: '烘焙管理', directionGroup: '餐旅群', confidence: 0.85, reason: '烘焙是餐旅群中獨立且熱門的專業方向。', relatedCategoryIds: ['hospitality-food'] },
  { id: 'vr-022', conditions: ['service-hospitality', 'tourism'], direction: '旅遊管理', directionGroup: '餐旅群', confidence: 0.8, reason: '服務和旅遊經驗可以往旅遊管理發展。', relatedCategoryIds: ['hospitality-tourism'] },
  { id: 'vr-023', conditions: ['service-hospitality'], direction: '餐旅管理', directionGroup: '餐旅群', confidence: 0.75, reason: '服務經驗是餐旅業的基礎。', relatedCategoryIds: ['hospitality-food', 'hospitality-tourism'] },

  // === 商管群 ===
  { id: 'vr-024', conditions: ['accounting', 'finance'], direction: '會計事務', directionGroup: '商管群', confidence: 0.9, reason: '會計和理財經驗直接對應會計事務科系。', relatedCategoryIds: ['biz-accounting'] },
  { id: 'vr-025', conditions: ['marketing', 'ecommerce'], direction: '行銷管理', directionGroup: '商管群', confidence: 0.85, reason: '行銷和電商經驗是現代商管最實用的技能。', relatedCategoryIds: ['biz-marketing'] },
  { id: 'vr-026', conditions: ['accounting'], direction: '會計事務', directionGroup: '商管群', confidence: 0.8, reason: '會計是商管群最穩定的專業方向。', relatedCategoryIds: ['biz-accounting'] },
  { id: 'vr-027', conditions: ['leadership', 'event-planning'], direction: '商業管理', directionGroup: '商管群', confidence: 0.8, reason: '領導和活動企劃能力是商業管理的基礎。', relatedCategoryIds: ['biz-admin'] },
  { id: 'vr-028', conditions: ['sales', 'communication'], direction: '行銷管理', directionGroup: '商管群', confidence: 0.75, reason: '銷售和溝通能力是行銷的核心。', relatedCategoryIds: ['biz-marketing'] },

  // === 設計群 ===
  { id: 'vr-029', conditions: ['graphic-design', 'ui-design'], direction: '商業設計', directionGroup: '設計群', confidence: 0.9, reason: '平面和UI設計經驗直接對應商業設計科系。', relatedCategoryIds: ['design-graphic'] },
  { id: 'vr-030', conditions: ['interior-design', 'space-planning'], direction: '室內設計', directionGroup: '設計群', confidence: 0.9, reason: '室內和空間設計經驗直接對應室內設計科系。', relatedCategoryIds: ['design-interior'] },
  { id: 'vr-031', conditions: ['drawing', 'illustration'], direction: '商業設計', directionGroup: '設計群', confidence: 0.8, reason: '繪畫和插畫是設計群的基本功。', relatedCategoryIds: ['design-graphic'] },
  { id: 'vr-032', conditions: ['photography', 'video-editing'], direction: '多媒體設計', directionGroup: '設計群', confidence: 0.8, reason: '攝影和影片剪輯是現代設計的重要技能。', relatedCategoryIds: ['design-graphic'] },

  // === 農業群 ===
  { id: 'vr-033', conditions: ['farming', 'plant-cultivation'], direction: '農業技術', directionGroup: '農業群', confidence: 0.9, reason: '農作和植物栽培是農業群的核心。', relatedCategoryIds: ['agri-tech'] },
  { id: 'vr-034', conditions: ['biotech', 'lab-work'], direction: '生物技術', directionGroup: '農業群', confidence: 0.85, reason: '生物技術和實驗經驗可以往農業生物技術發展。', relatedCategoryIds: ['agri-tech'] },

  // === 化工群 ===
  { id: 'vr-035', conditions: ['chemistry', 'lab-experiment'], direction: '化工技術', directionGroup: '化工群', confidence: 0.9, reason: '化學和實驗經驗是化工群的基礎。', relatedCategoryIds: ['chem-process'] },
  { id: 'vr-036', conditions: ['chemistry'], direction: '化工技術', directionGroup: '化工群', confidence: 0.8, reason: '化學基礎是進入化工群的門票。', relatedCategoryIds: ['chem-process'] },

  // === 土木群 ===
  { id: 'vr-037', conditions: ['construction', 'surveying'], direction: '土木技術', directionGroup: '土木群', confidence: 0.9, reason: '施工和測量經驗直接對應土木技術科系。', relatedCategoryIds: ['civil-construction'] },
  { id: 'vr-038', conditions: ['construction'], direction: '土木技術', directionGroup: '土木群', confidence: 0.8, reason: '施工經驗是土木群的核心技能。', relatedCategoryIds: ['civil-construction'] },

  // === 護理群 ===
  { id: 'vr-039', conditions: ['nursing', 'patient-care'], direction: '護理照護', directionGroup: '護理群', confidence: 0.95, reason: '護理和病患照護經驗直接對應護理科系。', relatedCategoryIds: ['nursing-care'] },
  { id: 'vr-040', conditions: ['health-care', 'first-aid'], direction: '護理照護', directionGroup: '護理群', confidence: 0.85, reason: '健康照護和急救經驗是護理群的基礎。', relatedCategoryIds: ['nursing-care'] },
  { id: 'vr-041', conditions: ['service-learning'], direction: '護理照護', directionGroup: '護理群', confidence: 0.7, reason: '服務學習經驗顯示你的服務熱忱，護理需要這個特質。', relatedCategoryIds: ['nursing-care'] },

  // === 海事群 ===
  { id: 'vr-042', conditions: ['sailing', 'maritime'], direction: '航海技術', directionGroup: '海事群', confidence: 0.9, reason: '航海經驗直接對應海事群科系。', relatedCategoryIds: ['maritime-navigation'] },

  // === 家政群 ===
  { id: 'vr-043', conditions: ['food-science', 'nutrition'], direction: '食品與營養', directionGroup: '家政群', confidence: 0.9, reason: '食品科學和營養學經驗對應家政群科系。', relatedCategoryIds: ['home-food'] },
  { id: 'vr-044', conditions: ['childcare', 'elderly-care'], direction: '照護服務', directionGroup: '家政群', confidence: 0.85, reason: '育幼和長照經驗是家政群的重要方向。', relatedCategoryIds: ['home-food'] },

  // === 語文群 ===
  { id: 'vr-045', conditions: ['english', 'translation'], direction: '應用外語', directionGroup: '語文群', confidence: 0.9, reason: '英文和翻譯經驗直接對應應用外語科系。', relatedCategoryIds: ['lang-applications'] },
  { id: 'vr-046', conditions: ['japanese', 'korean'], direction: '應用外語', directionGroup: '語文群', confidence: 0.85, reason: '日韓語能力是應用外語的重要方向。', relatedCategoryIds: ['lang-applications'] },
  { id: 'vr-047', conditions: ['english'], direction: '應用外語', directionGroup: '語文群', confidence: 0.75, reason: '英文能力是語文群的基礎。', relatedCategoryIds: ['lang-applications'] },
];

export const VOCATIONAL_FACT_TEMPLATES: VocationalFactTemplate[] = [
  // 技能學習
  { id: 'vf-001', category: 'skill', label: '擅長某項專業技能', placeholder: '例如：焊接、烹飪、程式設計、會計、AutoCAD...', tags: ['skill'] },
  { id: 'vf-002', category: 'skill', label: '參加過技能訓練課程', placeholder: '什麼課程？學了多久？', tags: ['skill'] },
  { id: 'vf-003', category: 'skill', label: '自學相關專業技能', placeholder: '例如：線上學Python、看YouTube學電路...', tags: ['selfStudy'] },

  // 專題實作
  { id: 'vf-004', category: 'capstone', label: '已開始專題實作', placeholder: '專題主題是什麼？目前進度？', tags: ['capstone'] },
  { id: 'vf-005', category: 'capstone', label: '專題實作獲得校內評比成績', placeholder: '什麼評比？第幾名？', tags: ['capstone', 'competition'] },
  { id: 'vf-006', category: 'capstone', label: '專題實作參加校外競賽', placeholder: '什麼競賽？什麼級別？', tags: ['capstone', 'competition'] },

  // 證照檢定
  { id: 'vf-007', category: 'certification', label: '已取得丙級技術士證照', placeholder: '什麼職類的丙級？', tags: ['certification'] },
  { id: 'vf-008', category: 'certification', label: '已取得乙級技術士證照', placeholder: '什麼職類的乙級？', tags: ['certification'] },
  { id: 'vf-009', category: 'certification', label: '正在準備技能檢定', placeholder: '準備什麼職類？幾月考？', tags: ['certification'] },

  // 競賽
  { id: 'vf-010', category: 'competition', label: '校內技能競賽經驗', placeholder: '什麼競賽？什麼成績？', tags: ['competition'] },
  { id: 'vf-011', category: 'competition', label: '全國技能競賽/職類競賽', placeholder: '什麼競賽？什麼級別？什麼成績？', tags: ['competition'] },
  { id: 'vf-012', category: 'competition', label: '其他校外競賽', placeholder: '什麼競賽？什麼成績？', tags: ['competition'] },

  // 社團
  { id: 'vf-013', category: 'club', label: '社團普通成員', placeholder: '什麼社團？參與多久？', tags: ['club'] },
  { id: 'vf-014', category: 'club', label: '社團幹部/社長', placeholder: '什麼社團？什麼職位？', tags: ['club', 'leadership'] },
  { id: 'vf-015', category: 'club', label: '技能型社團', placeholder: '例如：機器人社、烘焙社、電機社、日語社...', tags: ['club', 'skill'] },

  // 實習
  { id: 'vf-016', category: 'internship', label: '校內實習經驗', placeholder: '什麼實習？做了什麼？', tags: ['internship'] },
  { id: 'vf-017', category: 'internship', label: '校外實習/產學合作', placeholder: '什麼公司？做了什麼？多久？', tags: ['internship'] },
  { id: 'vf-018', category: 'internship', label: '相關領域打工', placeholder: '什麼工作？學到什麼？', tags: ['internship'] },

  // 自學/其他
  { id: 'vf-019', category: 'selfStudy', label: '線上課程學習', placeholder: '例如：Coursera、Hahow、YouTube...學了什麼？', tags: ['selfStudy'] },
  { id: 'vf-020', category: 'selfStudy', label: '業師計畫/職人指導', placeholder: '跟誰學？學了什麼？', tags: ['selfStudy'] },
  { id: 'vf-021', category: 'other', label: '其他特殊經歷', placeholder: '例如：家庭事業參與、志工經驗...', tags: ['other'] },
];

export const VOCATIONAL_INTEREST_QUESTIONS = [
  {
    id: 1,
    question: '你在實習或實作課中，最享受哪個環節？',
    options: [
      { value: 'building', label: '動手做出東西的過程' },
      { value: 'solving', label: '解決問題和找bug' },
      { value: 'creating', label: '發揮創意和美感' },
      { value: 'helping', label: '幫助別人和服務他人' },
    ],
  },
  {
    id: 2,
    question: '哪種工作環境最吸引你？',
    options: [
      { value: 'office', label: '辦公室/電腦前面' },
      { value: 'factory', label: '工廠/實驗室/廚房' },
      { value: 'outdoor', label: '戶外/工地/現場' },
      { value: 'people', label: '和很多人互動的環境' },
    ],
  },
  {
    id: 3,
    question: '如果可以選擇，你最想學的一項技能是？',
    options: [
      { value: 'tech-skill', label: '寫程式或操作機器' },
      { value: 'creative', label: '設計或創作' },
      { value: 'business', label: '做生意或管理' },
      { value: 'care', label: '照顧人或烹飪' },
    ],
  },
  {
    id: 4,
    question: '你的專題實作，最想選的主題方向是？',
    options: [
      { value: 'tech-topic', label: '科技/AI/自動化相關' },
      { value: 'design-topic', label: '設計/美學/空間相關' },
      { value: 'food-topic', label: '食品/餐飲/烘焙相關' },
      { value: 'service-topic', label: '照護/服務/教育相關' },
    ],
  },
  {
    id: 5,
    question: '你平常最常看什麼類型的內容？',
    options: [
      { value: 'tech-content', label: '科技新聞/教學影片' },
      { value: 'art-content', label: '設計作品/藝術創作' },
      { value: 'biz-content', label: '商業/創業/投資' },
      { value: 'life-content', label: '美食/旅遊/生活' },
    ],
  },
  {
    id: 6,
    question: '你覺得自己最強的能力是什麼？',
    options: [
      { value: 'logic', label: '邏輯思考和數理能力' },
      { value: 'artistic', label: '美感和創意能力' },
      { value: 'social', label: '溝通和人際關係' },
      { value: 'practical', label: '動手實作和操作能力' },
    ],
  },
  {
    id: 7,
    question: '你未來最想從事的工作型態是？',
    options: [
      { value: 'desk', label: '坐在電腦前工作' },
      { value: 'hands-on', label: '動手操作和製造' },
      { value: 'creative-work', label: '創作和設計' },
      { value: 'service-work', label: '服務和照顧他人' },
    ],
  },
  {
    id: 8,
    question: '如果不用考慮薪水和現實，你最想做什麼？',
    options: [
      { value: 'invent', label: '發明或創造新東西' },
      { value: 'express', label: '用創作表達自己' },
      { value: 'connect', label: '和人交流、建立人脈' },
      { value: 'nurture', label: '照顧和培養事物或人' },
    ],
  },
];

export const FACT_CATEGORY_LABELS: Record<VocationalFactCategory, string> = {
  skill: '技能學習',
  capstone: '專題實作',
  certification: '證照檢定',
  competition: '競賽',
  club: '社團',
  internship: '實習',
  selfStudy: '自學',
  other: '其他經歷',
};

export const FACT_CATEGORY_ORDER: VocationalFactCategory[] = [
  'skill', 'capstone', 'certification', 'competition', 'club', 'internship', 'selfStudy', 'other',
];
