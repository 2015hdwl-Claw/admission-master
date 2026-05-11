// 職群科系介紹頁面 - 職群科系介紹
// 目標：從科系詳情轉變為職群科系介紹，提供完整的職群與科系資訊

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { trackPageView } from '@/lib/analytics'

// 15 個職群的完整資訊
const VOCATIONAL_GROUPS = {
  '01': {
    code: '01',
    name: '餐旅群',
    emoji: '🍽️',
    description: '培養餐飲服務、旅遊規劃與飯店管理的專業人才',
    fullDescription: '餐旅群涵蓋餐飲製作、旅遊規劃、飯店管理、會展設計等領域，適合喜歡與人互動、提供服務、對美食和旅遊有興趣的學生。',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    skills: ['烹飪技術', '餐飲服務', '旅遊規劃', '外語能力', '溝通技巧', '顧客服務'],
    departments: [
      { name: '餐旅管理系', description: '學習飯店管理、餐廳營運、旅遊服務等專業知識與技能' },
      { name: '烘焙管理系', description: '專精麵包、蛋糕、甜點等烘焙技術與品質管理' },
      { name: '飲食文化系', description: '研究飲食文化、食品科學與營養知識' }
    ],
    careerPaths: ['廚師', '餐飲經理', '旅遊規劃師', '飯店管理', '活動策劃'],
    applicationTips: [
      '展現對服務業的熱情與興趣',
      '相關工讀或實習經驗加分',
      '外語能力是重要優勢',
      '強調團隊合作與溝通能力'
    ],
    relatedPathways: ['個人申請', '技優甄審', '繁星推薦']
  },
  '02': {
    code: '02',
    name: '機械群',
    emoji: '⚙️',
    description: '培養機械設計、製造技術與精密加工的專業人才',
    fullDescription: '機械群涵蓋機械設計、製造技術、精密加工、自動化控制等領域，是台灣製造業的重要基石。',
    color: 'from-gray-500 to-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    skills: ['機械製圖', 'CNC加工', '機械設計', '精密量測', '材料科學', '自動化控制'],
    departments: [
      { name: '機械工程系', description: '學習機械設計、製造、熱流體等工程原理與應用' },
      { name: '精密製造系', description: '專精CNC加工、精密模具、量測技術' },
      { name: '機電整合系', description: '結合機械與電子，開發智慧機械與自動化系統' }
    ],
    careerPaths: ['機械工程師', '製造工程師', '維護技師', '設備工程師', '研發工程師'],
    applicationTips: [
      '數學、物理基礎要扎实',
      '機械相關競賽成績很有幫助',
      '實作經驗比理論知識更重要',
      '展現對製造業的興趣與了解'
    ],
    relatedPathways: ['個人申請', '技優甄審', '指考分發']
  },
  '03': {
    code: '03',
    name: '電機群',
    emoji: '⚡',
    description: '培養電力系統、控制技術與電子電路的專業人才',
    fullDescription: '電機群涵蓋電力系統、控制技術、電子電路、通訊工程等領域，是現代科技產業的核心。',
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    skills: ['電路設計', '電力系統', '控制理論', '電子技術', '通訊工程', '程式設計'],
    departments: [
      { name: '電機工程系', description: '學習電力系統、控制理論、電子電路等專業知識' },
      { name: '電子工程系', description: '專精電子電路、半導體、積體電路設計' },
      { name: '自動控制系', description: '研究自動化控制、機電整合、智慧系統' }
    ],
    careerPaths: ['電機工程師', '電子工程師', '控制工程師', '電力工程師', '研發工程師'],
    applicationTips: [
      '物理、數學成績重要',
      '電子電路相關專題或競賽加分',
      '程式設計能力是重要優勢',
      '展現對電子技術的熱情'
    ],
    relatedPathways: ['個人申請', '技優甄審', '繁星推薦']
  },
  '04': {
    code: '04',
    name: '電子群',
    emoji: '🔌',
    description: '培養電子產品設計、測試與維護的專業技術人才',
    fullDescription: '電子群專注於電子產品設計、測試、維修與應用，是電子產品製造與研發的基礎。',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    skills: ['電子電路', '產品測試', '維修技術', '電子元件', '焊接技術', '儀器使用'],
    departments: [
      { name: '電子工程系', description: '學習電子電路、電子產品設計與測試' },
      { name: '電腦系統系', description: '專精電腦硬體、系統維護與網路技術' },
      { name: '光電工程系', description: '研究光電技術、顯示器、光通訊等應用' }
    ],
    careerPaths: ['電子工程師', '測試工程師', '維護技師', '品質工程師', '研發助理'],
    applicationTips: [
      '電子實作經驗很重要',
      '專題製作或作品集展示',
      '相關技證加分',
      '對電子產品有濃厚興趣'
    ],
    relatedPathways: ['個人申請', '技優甄審', '社區推甄']
  },
  '05': {
    code: '05',
    name: '資訊群',
    emoji: '💻',
    description: '培養軟體開發、系統管理與資料應用的資訊專業人才',
    fullDescription: '資訊群涵蓋軟體開發、系統管理、資料分析、網路安全等領域，是數位經濟的核心人才。',
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    skills: ['程式設計', '系統管理', '資料庫', '網路技術', '演算法', 'UI/UX設計'],
    departments: [
      { name: '資訊工程系', description: '學習軟體開發、演算法、資料結構等核心知識' },
      { name: '資訊管理系', description: '結合資訊技術與商業應用，培養IT管理人才' },
      { name: '數位媒體系', description: '專精網頁設計、多媒體製作、UI/UX設計' }
    ],
    careerPaths: ['軟體工程師', '系統管理師', '資料分析師', '網頁設計師', '產品經理'],
    applicationTips: [
      '程式設計能力是關鍵',
      '專題開發或專案經驗很重要',
      'GitHub作品集或個人網站加分',
      '參加黑客松或程式競賽'
    ],
    relatedPathways: ['個人申請', '技優甄審', '繁星推薦', '特殊選才']
  },
  '06': {
    code: '06',
    name: '商管群',
    emoji: '📊',
    description: '培養企業管理、商業分析與行銷規劃的商業專業人才',
    fullDescription: '商管群涵蓋企業管理、行銷、財務、會計等商業領域，培養現代企業所需的商業專業人才。',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    skills: ['企業管理', '行銷策略', '財務分析', '會計處理', '商業英語', '團隊領導'],
    departments: [
      { name: '企業管理系', description: '學習企業管理、行銷、人資、策略等商業知識' },
      { name: '會計系', description: '專精財務會計、審計、稅務等專業會計技能' },
      { name: '行銷系', description: '研究市場分析、品牌管理、數位行銷等行銷技術' }
    ],
    careerPaths: ['企劃人員', '行銷專員', '會計人員', '管理培訓生', '創業者'],
    applicationTips: [
      '數學成績對會計系重要',
      '商業競賽或專案經驗加分',
      '展現領導力與團隊合作',
      '英語能力是重要優勢'
    ],
    relatedPathways: ['個人申請', '繁星推薦', '指考分發']
  },
  '07': {
    code: '07',
    name: '設計群',
    emoji: '🎨',
    description: '培養視覺設計、產品設計與空間設計的創意設計人才',
    fullDescription: '設計群涵蓋視覺設計、產品設計、空間設計等領域，培養具備美學素養與實作能力的設計人才。',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    skills: ['視覺設計', '產品設計', '空間設計', '美學素養', '設計軟體', '創意思考'],
    departments: [
      { name: '視覺傳達設計系', description: '學習平面設計、品牌設計、包裝設計等視覺設計技能' },
      { name: '工業設計系', description: '專精產品設計、人因工程、設計思考等產品設計' },
      { name: '室內設計系', description: '研究空間規劃、室內設計、傢俱設計等空間設計' }
    ],
    careerPaths: ['平面設計師', '產品設計師', '室內設計師', '創意總監', '自由接案'],
    applicationTips: [
      '作品集是申請關鍵',
      '設計相關競賽或專案加分',
      '展示設計思考過程',
      '美學素養與創意能力'
    ],
    relatedPathways: ['個人申請', '技優甄審', '特殊選才']
  },
  '08': {
    code: '08',
    name: '農業群',
    emoji: '🌱',
    description: '培養農業生產、農產加工與農業技術的現代農業人才',
    fullDescription: '農業群涵蓋農業生產、園藝技術、畜牧養殖、農產加工等領域，結合現代科技發展智慧農業。',
    color: 'from-lime-500 to-green-600',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-300',
    skills: ['農業技術', '園藝栽培', '畜牧養殖', '農產加工', '生物科技', '智慧農業'],
    departments: [
      { name: '農業經營系', description: '學習農企業管理、農產行銷、農業技術等專業知識' },
      { name: '園藝系', description: '專精園藝作物栽培、育種、生產技術' },
      { name: '畜產保健系', description: '研究畜牧養殖、動物保健、畜產品加工' }
    ],
    careerPaths: ['農場管理者', '農業技師', '農產加工員', '農企業經營者', '農業推廣員'],
    applicationTips: [
      '展現對農業的熱情與了解',
      '相關實習經驗加分',
      '生物、化學基礎重要',
      '農業相關專案或競賽'
    ],
    relatedPathways: ['個人申請', '技優甄審', '社區推甄']
  },
  '09': {
    code: '09',
    name: '化工群',
    emoji: '⚗️',
    description: '培養化學工程、材料研發與生產技術的化工專業人才',
    fullDescription: '化工群涵蓋化學工程、材料研發、生產技術、品質管理等領域，是傳統製造與高科技產業的基礎。',
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-300',
    skills: ['化學工程', '材料研發', '生產技術', '品質管理', '程序控制', '實驗操作'],
    departments: [
      { name: '化學工程系', description: '學習化學工程原理、程序設計、工業化學等專業知識' },
      { name: '材料工程系', description: '專精材料研發、材料測試、材料應用' },
      { name: '纖維工程系', description: '研究紡織材料、高分子材料、複合材料等' }
    ],
    careerPaths: ['化學工程師', '材料研發員', '製造工程師', '品質工程師', '製程工程師'],
    applicationTips: [
      '化學、物理成績重要',
      '化學相關實驗或專題加分',
      '展現對材料科學的興趣',
      '工讀或實習經驗很有幫助'
    ],
    relatedPathways: ['個人申請', '技優甄審', '指考分發']
  },
  '10': {
    code: '10',
    name: '土木群',
    emoji: '🏗️',
    description: '培養營建工程、結構設計與工程管理的營建專業人才',
    fullDescription: '土木群涵蓋營建工程、結構設計、工程管理、測量技術等領域，是基礎建設與房地產產業的基礎。',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    skills: ['營建工程', '結構設計', '工程管理', '測量技術', '材料知識', '工程製圖'],
    departments: [
      { name: '土木工程系', description: '學習結構設計、營建技術、工程管理等專業知識' },
      { name: '建築系', description: '專精建築設計、營建技術、空間規劃' },
      { name: '測量工程系', description: '研究測量技術、地理資訊系統、空間資訊應用' }
    ],
    careerPaths: ['土木工程師', '結構工程師', '營建管理師', '測量技師', '建築師'],
    applicationTips: [
      '數學、物理基礎重要',
      '製圖能力是基本要求',
      '相關實習或工讀加分',
      '對營建業有深入了解'
    ],
    relatedPathways: ['個人申請', '技優甄審', '指考分發']
  },
  '11': {
    code: '11',
    name: '海事群',
    emoji: '🚢',
    description: '培養航海技術、輪機工程與海事物流的海事專業人才',
    fullDescription: '海事群涵蓋航海技術、輪機工程、海事物流、船舶修造等領域，支援航運與貿易產業發展。',
    color: 'from-blue-600 to-blue-800',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    skills: ['航海技術', '輪機工程', '海事物流', '船舶修造', '海事法規', '國際貿易'],
    departments: [
      { name: '航海系', description: '學習航海技術、海事法規、船舶操作等專業知識' },
      { name: '輪機系', description: '專精輪機工程、船舶動力、機電系統' },
      { name: '海運物流系', description: '研究海事物流、航運管理、國際貿易實務' }
    ],
    careerPaths: ['航海員', '輪機工程師', '海運物流師', '船舶工程師', '海運管理者'],
    applicationTips: [
      '體能要求較高',
      '英文能力很重要',
      '對航運業有興趣',
      '國外就業機會多'
    ],
    relatedPathways: ['個人申請', '技優甄審', '社區推甄']
  },
  '12': {
    code: '12',
    name: '護理群',
    emoji: '🏥',
    description: '培養護理技術、醫療照護與健康管理的醫護專業人才',
    fullDescription: '護理群涵蓋護理技術、醫療照護、健康管理、長期照護等領域，是醫療體系的重要專業人才。',
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    skills: ['護理技術', '醫療照護', '健康管理', '長期照護', '醫學知識', '溝通技巧'],
    departments: [
      { name: '護理系', description: '學習護理技術、醫療照護、健康管理等專業知識' },
      { name: '長期照護系', description: '專精長期照護、老人照護、照護管理' },
      { name: '醫務管理系', description: '研究醫療機構管理、醫務行政、健康產業管理' }
    ],
    careerPaths: ['護理師', '照護員', '健康管理師', '醫務行政', '長照機構管理者'],
    applicationTips: [
      '生物、化學基礎重要',
      '照護相關實習經驗加分',
      '展現對醫護工作的熱情',
      '體力與耐心很重要'
    ],
    relatedPathways: ['個人申請', '技優甄審', '繁星推薦']
  },
  '13': {
    code: '13',
    name: '家政群',
    emoji: '🏠',
    description: '培養生活應用、兒童發展與家庭科學的家政專業人才',
    fullDescription: '家政群涵蓋生活應用、兒童發展、食品科學、家庭經營等領域，提升生活品質與家庭福祉。',
    color: 'from-fuchsia-500 to-purple-600',
    bgColor: 'bg-fuchsia-50',
    borderColor: 'border-fuchsia-300',
    skills: ['生活應用', '兒童發展', '食品科學', '家庭經營', '生活美學', '教育輔導'],
    departments: [
      { name: '家政系', description: '學習生活應用、家庭經營、生活美學等專業知識' },
      { name: '幼兒保育系', description: '專精兒童發展、幼兒教育、保育技術' },
      { name: '食品科學系', description: '研究食品科學、營養學、食品加工技術' }
    ],
    careerPaths: ['家政老師', '幼教老師', '食品研發員', '生活顧問', '家庭教育師'],
    applicationTips: [
      '對家庭與生活有熱情',
      '相關志工或實習經驗加分',
      '教育相關背景優勢',
      '展現生活應用能力'
    ],
    relatedPathways: ['個人申請', '繁星推薦', '社區推甄']
  },
  '14': {
    code: '14',
    name: '語文群',
    emoji: '📚',
    description: '培養語文應用、文學創作與國際交流的語文專業人才',
    fullDescription: '語文群涵蓋語文應用、文學創作、翻譯、國際交流等領域，培養具備語文能力的專業人才。',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-300',
    skills: ['語文應用', '文學創作', '翻譯能力', '國際交流', '文化素養', '表達能力'],
    departments: [
      { name: '中國文學系', description: '學習中國文學、語文應用、文化研究等專業知識' },
      { name: '外國語文學系', description: '專精外國語文學、翻譯、國際文化研究' },
      { name: '翻譯系', description: '研究翻譯理論、翻譯技巧、專業翻譯實務' }
    ],
    careerPaths: ['語文老師', '翻譯人員', '文化工作者', '編輯記者', '國際貿易人員'],
    applicationTips: [
      '語文能力是關鍵',
      '寫作或翻譯作品集加分',
      '文學相關競賽或專案',
      '展現文化素養與國際視野'
    ],
    relatedPathways: ['個人申請', '繁星推薦', '特殊選才']
  },
  '15': {
    code: '15',
    name: '商業與管理群',
    emoji: '💼',
    description: '培養商業管理、國際貿易與財務金融的現代商業人才',
    fullDescription: '商業與管理群結合商業管理與實務應用，培養具備國際視野的現代商業專業人才。',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    skills: ['商業管理', '國際貿易', '財務金融', '商業英語', '創新創業', '數位行銷'],
    departments: [
      { name: '國際貿易系', description: '學習國際貿易實務、外匯、國際商法等專業知識' },
      { name: '財務金融系', description: '專精財務管理、投資理財、金融市場' },
      { name: '創業管理系', description: '研究創業模式、創新商業、新創事業經營' }
    ],
    careerPaths: ['貿易人員', '金融專員', '創業者', '商業分析師', '管理顧問'],
    applicationTips: [
      '數學、英文成績重要',
      '商業競賽或創業經驗加分',
      '展現國際視野與商業敏感度',
      '創新思考與執行力'
    ],
    relatedPathways: ['個人申請', '繁星推薦', '技優甄審']
  }
}

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const group = VOCATIONAL_GROUPS[params.slug as keyof typeof VOCATIONAL_GROUPS]

  if (!group) {
    return {
      title: '職群資訊找不到 | 升學大師 v2.0',
    }
  }

  return {
    title: `${group.name} | 職群科系介紹 - 升學大師 v2.0`,
    description: group.fullDescription,
  }
}

export default function DepartmentPage({ params }: Props) {
  const group = VOCATIONAL_GROUPS[params.slug as keyof typeof VOCATIONAL_GROUPS]

  if (!group) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/explore" className="text-indigo-600 hover:text-indigo-700 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">{group.emoji}</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">升學大師 v2.0</span>
              <p className="text-xs text-indigo-600 font-medium">職群科系介紹</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Group Header */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-indigo-100 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${group.color} rounded-xl flex items-center justify-center text-white text-3xl`}>
                {group.emoji}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{group.name}</h1>
                <p className="text-lg text-gray-600">{group.description}</p>
                <div className="flex items-center space-x-2 mt-3">
                  <span className={`px-3 py-1 ${group.bgColor} ${group.borderColor} border rounded-full text-sm font-medium`}>
                    代碼：{group.code}
                  </span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    15 職群之一
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{group.fullDescription}</p>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-indigo-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806-1.946 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806 1.946z" />
            </svg>
            核心技能與能力
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {group.skills.map((skill, index) => (
              <div key={index} className={`p-3 ${group.bgColor} ${group.borderColor} border rounded-lg text-center`}>
                <span className="text-gray-800 font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Departments Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-indigo-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5-1.253" />
            </svg>
            相關科系
          </h2>
          <div className="space-y-4">
            {group.departments.map((dept, index) => (
              <div key={index} className={`p-4 ${group.bgColor} rounded-lg border ${group.borderColor}`}>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{dept.name}</h3>
                <p className="text-gray-700">{dept.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Career Paths Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-indigo-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            職涯發展路徑
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {group.careerPaths.map((career, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <span className="text-gray-800 font-medium">{career}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Application Tips Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-indigo-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            申請建議
          </h2>
          <div className="space-y-3">
            {group.applicationTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <p className="text-gray-800">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Pathways Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-indigo-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            適用升學管道
          </h2>
          <div className="flex flex-wrap gap-2">
            {group.relatedPathways.map((pathway, index) => (
              <Link
                key={index}
                href="/pathways"
                className={`px-4 py-2 bg-gradient-to-r ${group.color} text-white rounded-lg font-medium hover:opacity-90 transition`}
              >
                {pathway}
              </Link>
            ))}
          </div>
        </div>

        {/* Related Groups Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-indigo-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">探索其他職群</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(VOCATIONAL_GROUPS)
              .filter(([code]) => code !== group.code)
              .slice(0, 8)
              .map(([code, otherGroup]) => (
                <Link
                  key={code}
                  href={`/department/${code}`}
                  className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition border border-gray-200 hover:border-indigo-300"
                >
                  <span className="text-xl">{otherGroup.emoji}</span>
                  <span className="text-gray-800 text-sm">{otherGroup.name}</span>
                </Link>
              ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 mb-12 text-white">
          <h3 className="text-2xl font-bold mb-6">開始你的升學規劃</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/quiz"
              className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="font-semibold">職群發現測驗</span>
              </div>
              <p className="text-sm opacity-90">找出最適合你的職群</p>
            </Link>

            <Link
              href="/pathways"
              className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-3 3L5 20" />
                </svg>
                <span className="font-semibold">6 種升學管道</span>
              </div>
              <p className="text-sm opacity-90">了解所有升學途徑</p>
            </Link>

            <Link
              href="/interview"
              className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold">申請準備</span>
              </div>
              <p className="text-sm opacity-90">準備申請文件與面試</p>
            </Link>
          </div>
        </div>

        {/* Back to Explore */}
        <div className="text-center">
          <Link
            href="/explore"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">回到職群探索</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2026 升學大師 v2.0 • 讓每個高職生都找到最適合的升學路徑</p>
          </div>
        </div>
      </footer>
    </div>
  )
}