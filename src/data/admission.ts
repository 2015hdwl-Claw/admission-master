import type { PathwayDetail, VocationalGroup } from '@/types';

export const ADMISSION_PATHWAYS: PathwayDetail[] = [
  {
    slug: 'application',
    name: '申請入學',
    category: '主要管道',
    description: '台灣大學升學最主流的管道，佔總名額約40-45%。透過學習歷程檔案、學測成績與面試申請大學。分為第一階段（書面審查）和第二階段（面試），是展現個人特色的最佳機會。',
    timeline: ['3月：公布招生簡章', '4月：第一階段報名', '4月底：第一階段篩選結果', '5月：第二階段面試', '6月：放榜'],
    requirements: ['學測成績（校系自訂門檻）', '學習歷程檔案（學校上傳）', '備審資料（自製）', '第二階段面試'],
    targetStudents: '學習歷程完整、有明確目標科系、願意投入備審準備的學生',
    quotaPercentage: 45,
    tips: [
      '學習歷程自述（P）是91%系組參採，是最重要的文件',
      '備審資料要與目標科系相關，展現你的連結和動機',
      '面試準備用STAR-S框架（情境→任務→行動→結果→反思）',
      '多練習3分鐘自我介紹',
      '準備2-3個關於科系的深度問題'
    ],
    faqs: [
      { q: '申請入學可以報幾個校系？', a: '最多可以報名6個校系，但建議集中在3-4個相關科系，品質比數量重要。' },
      { q: '學測成績不好可以申請嗎？', a: '部分校系學測門檻不高（均標甚至後標），重點在備審資料和面試表現。' },
      { q: '面試會問什麼？', a: '常見問題包括：為什麼選這個科系？你做了哪些準備？大學四年計畫？遇到挫折怎麼辦？' }
    ],
    scoreRanges: {
      top: { total: 55, description: '醫學系、台清交熱門科系' },
      high: { total: 50, description: '國立大學大多數科系' },
      mid: { total: 42, description: '國立普通科系、私立名校' },
      base: { total: 35, description: '私立大學大多數科系' }
    }
  },
  {
    slug: 'distribution',
    name: '分發入學',
    category: '主要管道',
    description: '依分科測驗（學測）成績直接分發，無需面試或備審資料。成績就是一切，適合成績穩定、不想額外準備面試的學生。可與申請入學同時準備。',
    timeline: ['7月：分科測驗', '7月：填志願', '7月底：放榜'],
    requirements: ['學測成績（5科級分）', '志願填報（最多100個志願）'],
    targetStudents: '學測成績優異、不想額外準備面試和備審資料的學生',
    quotaPercentage: 25,
    tips: [
      '純看學測級分，成績就是一切',
      '志願序非常重要，要仔細排列',
      '可以和申請入學同時準備，不衝突',
      '了解「同分比序」規則：國文→英文→數學→自然→社會'
    ],
    faqs: [
      { q: '分發入學可以填幾個志願？', a: '最多100個志願，建議填滿以增加錄取機會。' },
      { q: '分發入學和申請入學可以同時嗎？', a: '可以，但不會同時錄取。申請入學先放榜，放榜後需決定是否放棄才能參加分發。' }
    ],
    scoreRanges: {
      top: { total: 58, description: '台大醫學系、電機系' },
      high: { total: 52, description: '台清交熱門科系' },
      mid: { total: 44, description: '國立大學普通科系' },
      base: { total: 36, description: '私立大學熱門科系' }
    }
  },
  {
    slug: 'star',
    name: '繁星推薦',
    category: '主要管道',
    description: '由高中推薦，依在校成績排名申請。高一高二成績很重要，不是高三才開始算。每校每科系只能推薦1人，競爭在校內進行。',
    timeline: ['3月：高中內部推薦', '3月底：統一報名', '4月：放榜'],
    requirements: ['高中在校成績排名（全校前20%）', '學測成績（達到校系門檻）', '高中推薦'],
    targetStudents: '在校成績穩定、排名全校前20%的學生',
    quotaPercentage: 15,
    tips: [
      '高一高二的成績都很重要，不是高三才開始算',
      '學測成績只需達到校系門檻，主要看在校排名',
      '每校每科系只能推薦1人，要了解校內競爭對手',
      '跟導師和學務處保持良好關係'
    ],
    faqs: [
      { q: '繁星推薦的在校成績怎麼算？', a: '通常計算高一上到高二下的5次學期成績，各校可能有加權規則。' },
      { q: '繁星推薦要面試嗎？', a: '大部分校系不需要面試，少數校系有第二階段甄試。' }
    ],
    scoreRanges: {
      top: { total: 50, description: '全國頂尖高中前3%' },
      high: { total: 45, description: '各高中前5%' },
      mid: { total: 38, description: '各高中前10%' },
      base: { total: 30, description: '各高中前20%' }
    }
  },
  {
    slug: 'special-talent',
    name: '特殊選才入學',
    category: '特殊管道',
    description: '不看學測成績，以特殊才能、創新表現或弱勢背景為主的申請管道。適合有特殊專長、競賽表現或獨特經歷的學生。',
    timeline: ['10月-1月：各校公告招生', '1月-3月：報名與面試', '3月：放榜'],
    requirements: ['特殊才能證明（競賽獎項、專利、創作等）', '學習歷程檔案', '各校自訂審查資料'],
    targetStudents: '有特殊才能、競賽獲獎、原住民/離島/新住民等特殊背景的學生',
    quotaPercentage: 5,
    tips: [
      '不看學測成績，有特殊才能就能申請',
      '各校招生時段不同，要個別關注',
      '競賽獎牌是最有力的證明',
      '弱勢身份也有專屬名額'
    ],
    faqs: [
      { q: '什麼算「特殊才能」？', a: '包括：國際科展獎牌、全國競賽前三名、發明專利、文學創作獎、藝術比賽獎項等。' },
      { q: '成績普通可以申請嗎？', a: '可以！這個管道不看學測成績，重點在你的特殊表現。' }
    ],
    scoreRanges: {
      top: { total: 0, description: '不看學測成績' },
      high: { total: 0, description: '不看學測成績' },
      mid: { total: 0, description: '不看學測成績' },
      base: { total: 0, description: '不看學測成績' }
    }
  },
  {
    slug: 'tech-star',
    name: '科技校院繁星計畫',
    category: '科技管道',
    description: '科技大學的繁星推薦管道，由高中推薦成績優異學生直升科技大學。科技大學就業率高，許多科系比普通大學更實用。',
    timeline: ['3月：報名', '4月：放榜'],
    requirements: ['高中在校成績排名', '學測成績（門檻）'],
    targetStudents: '目標為科技大學、在校成績優異的學生',
    quotaPercentage: 5,
    tips: [
      '科技大學就業率高，不必迷信普通大學',
      '北科、雲科、高應大都是頂尖科大',
      '很多科系的實務能力比普通大學更強'
    ],
    faqs: [
      { q: '科技大學和普通大學有什麼差別？', a: '科大更重實務技能，業界連結強，就業率高。普通大學更重理論研究。' }
    ],
    scoreRanges: {
      top: { total: 45, description: '北科、雲科熱門科系' },
      high: { total: 40, description: '中技、高應大熱門科系' },
      mid: { total: 35, description: '各科技大學普通科系' },
      base: { total: 28, description: '多數科技大學科系' }
    }
  },
  {
    slug: 'tech-selection',
    name: '四技二專甄選',
    category: '科技管道',
    description: '技職體系最重要的升學管道，高職學生透過統測成績和備審資料申請科技大學。類似普通高中的申請入學，是高職生升學的首選管道。',
    timeline: [
      '5月：統一入學測驗（統測）',
      '5月底-6月初：第一階段報名（最多6個校系）',
      '6月：第一階段篩選結果（書面審查）',
      '6月底-7月：第二階段面試/實作',
      '7月：放榜'
    ],
    requirements: [
      '統測成績（國文、英文、數學、專業科目一、專業科目二）',
      '備審資料（學習歷程、專題實作成果、技能檢定證明、實習紀錄）',
      '第二階段面試或實作測驗（部分校系）'
    ],
    targetStudents: '高職學生、目標科技大學的學生。專題實作完成度高、有技能檢定和實習經驗者更具優勢。',
    quotaPercentage: 10,
    tips: [
      '專題實作是備審資料的核心，比什麼都重要',
      '統測科目依職群不同：資訊群考程式設計，機械群考機械原理，餐旅群考餐飲實務',
      '技能檢定證照是加分利器，乙級比丙級更有說服力',
      '面試常問：專題動機、實習心得、未來職涯規劃',
      '可以同時報名多個校系，建議集中在相關領域',
      '備審資料要展現「做中學」的過程，不是堆砌獎項'
    ],
    faqs: [
      { q: '統測和學測有什麼不同？', a: '統測是技職體系的考試，科目依職群不同。共同科目是國文、英文、數學，再加兩科專業科目。滿分400分（每科最高依群類不同）。' },
      { q: '專題實作佔備審多少比重？', a: '因校系而異，但多數科技大學非常重視專題實作，因為它展現學生的實務能力和解決問題的能力。' },
      { q: '沒有技能檢定可以申請嗎？', a: '可以，但有丙級以上證照會加分。建議高二前至少取得一張丙級證照。' },
      { q: '可以跨職群申請嗎？', a: '可以，但統測成績必須是你要申請的職群成績。跨職群申請會使用統測的國英數成績加權。' }
    ],
    scoreRanges: {
      top: { total: 350, description: '北科、台科大、雲科大頂尖科系' },
      high: { total: 300, description: '國立科技大學熱門科系' },
      mid: { total: 250, description: '一般科技大學主要科系' },
      base: { total: 200, description: '多數科技大學科系' }
    }
  },
  {
    slug: 'tech-distribution',
    name: '聯合登記分發（技職）',
    category: '科技管道',
    description: '技職體系的分發入學，純看統測成績分發，無需面試或備審資料。適合不想準備面試的高職學生，也是甄選未上的備用方案。',
    timeline: [
      '5月：統一入學測驗（統測）',
      '7月：網路登記志願',
      '7月底：統一分發放榜'
    ],
    requirements: ['統測成績', '志願填報（最多100個志願）'],
    targetStudents: '統測成績穩定的高職學生，或甄選未上時的備用方案',
    quotaPercentage: 8,
    tips: [
      '純看統測成績，簡單直接',
      '志願序要仔細排列，了解各校系的歷年分發分數',
      '可以和甄選同時準備，甄選先放榜',
      '分發結果通常比甄選更可預測（看分數就知道）'
    ],
    faqs: [
      { q: '可以同時報名甄選和分發嗎？', a: '可以。甄選先放榜，放榜後需決定是否放棄才能參加分發。' },
      { q: '分發的名額多嗎？', a: '分發名額不少，很多科系的名額主要集中在分發管道。' }
    ],
    scoreRanges: {
      top: { total: 350, description: '頂尖科技大學' },
      high: { total: 300, description: '知名科技大學' },
      mid: { total: 250, description: '一般科技大學' },
      base: { total: 200, description: '多數科大院校' }
    }
  },
  {
    slug: 'tech-excellence',
    name: '技優保送/甄保',
    category: '科技管道',
    description: '技藝競賽優勝學生可直接保送或參加甄選。這是高職生最優秀的升學捷徑，全國賽前三名可保送，無需統測成績。',
    timeline: ['3-5月：報名', '5月：甄試/保送審查', '6月：放榜'],
    requirements: ['全國技藝競賽獲獎', '高中推薦', '部分需統測成績（甄保）'],
    targetStudents: '參加全國技藝競賽的高職學生',
    quotaPercentage: 2,
    tips: [
      '全國賽前三名可保送，免統測、免面試',
      '區賽獲獎也可以參加甄選保送（甄保），需統測成績',
      '比賽成績比在校成績重要',
      '高二就開始準備競賽，高三才能參加全國賽',
      '選擇正確的競賽職類很重要'
    ],
    faqs: [
      { q: '需要什麼等級的獎項？', a: '全國賽前三名可保送，區賽獲獎可參加甄選保送。' },
      { q: '保送和甄保有什麼差別？', a: '保送直接錄取，無需統測。甄保需統測成績+競賽成績綜合評比。' }
    ],
    scoreRanges: {
      top: { total: 0, description: '保送：免統測' },
      high: { total: 0, description: '甄保：依競賽+統測綜合' },
      mid: { total: 0, description: '—' },
      base: { total: 0, description: '—' }
    }
  },
  {
    slug: 'military-police',
    name: '軍警校院',
    category: '特殊管道',
    description: '國防大學、中央警察大學等軍警校院有獨立招生管道。就學期間免學費、有生活津貼，畢業後需服役。',
    timeline: ['11-12月：報名', '1-2月：初試', '3-4月：複試', '5月：放榜'],
    requirements: ['學測成績（門檻）', '體檢合格', '體能測驗', '面試'],
    targetStudents: '對軍警職業有興趣、體能良好、成績中上的學生',
    quotaPercentage: 3,
    tips: [
      '免學費且有生活津貼，經濟壓力小',
      '體檢標準很嚴格，要提前了解',
      '畢業後需服役一定年限',
      '國防醫學系是醫學系的另一條路'
    ],
    faqs: [
      { q: '軍警校院要自費嗎？', a: '不用，免學費且有每月生活津貼約新台幣1-2萬元。' }
    ],
    scoreRanges: {
      top: { total: 50, description: '國防醫學系' },
      high: { total: 40, description: '國防大學理工學群' },
      mid: { total: 35, description: '中央警察大學' },
      base: { total: 28, description: '軍校一般科系' }
    }
  },
  {
    slug: 'sports-art',
    name: '體育/藝術類',
    category: '特殊管道',
    description: '體育和藝術類科系有獨立招生管道，以術科表現為主。適合在體育或藝術方面有專長的學生。',
    timeline: ['11-1月：各校報名', '2-3月：術科測驗', '4月：放榜'],
    requirements: ['學測成績（門檻較低）', '術科測驗', '作品集（藝術類）'],
    targetStudents: '體育或藝術專長學生',
    quotaPercentage: 3,
    tips: [
      '術科成績佔比很高，日常訓練很重要',
      '體育類要注意體檢和運動傷害',
      '藝術類要提早準備作品集'
    ],
    faqs: [
      { q: '學測成績很重要嗎？', a: '學測成績只需達到較低的門檻，主要看術科表現。' }
    ],
    scoreRanges: {
      top: { total: 40, description: '台師大體育系、台大藝術系' },
      high: { total: 30, description: '國立體育/藝術科系' },
      mid: { total: 25, description: '私立體育/藝術科系' },
      base: { total: 20, description: '一般體育/藝術科系' }
    }
  },
  {
    slug: 'indigenous-island',
    name: '原住民/離島加分',
    category: '特殊管道',
    description: '原住民學生和離島地區學生享有升學保障名額和加分優惠。原住民可加總分25%，離島地區有專屬名額。',
    timeline: ['依各管道時間表', '需額外申請身分認定'],
    requirements: ['原住民身分證明 / 離島籍貫證明', '各管道的基本條件'],
    targetStudents: '具原住民身分或離島籍貫的學生',
    quotaPercentage: 3,
    tips: [
      '原住民可加學測總分25%，非常實用',
      '要提前辦理身分認定，不要等到最後',
      '了解各校的原民專班和保障名額'
    ],
    faqs: [
      { q: '原住民加分怎麼算？', a: '原住民學生學測總級分加25%（上限75分），相當於多約12-15級分。' }
    ],
    scoreRanges: {
      top: { total: 40, description: '加分後可達頂標' },
      high: { total: 35, description: '加分後可達前標' },
      mid: { total: 25, description: '加分後可達均標' },
      base: { total: 18, description: '加分後可進多數科系' }
    }
  },
  {
    slug: 'junior-college',
    name: '五專入學',
    category: '科技管道',
    description: '國中畢業直接進入五年制專科學校，五年後取得副學士學位。適合國中階段就想確定方向的學生。',
    timeline: ['6月：國中教育會考', '7月：登記分發'],
    requirements: ['國中教育會考成績', '志願填報'],
    targetStudents: '國中畢業生、想提早進入專業領域的學生',
    quotaPercentage: 5,
    tips: [
      '五年一貫，免受高中升學壓力',
      '畢業後可銜接二技',
      '實務課程多，就業準備快'
    ],
    faqs: [
      { q: '五專和高中+科大有什麼差別？', a: '五專直接5年拿到副學士，高中+科大需要7年。五專更早接觸專業。' }
    ],
    scoreRanges: {
      top: { total: 0, description: '依國中會考PR值' },
      high: { total: 0, description: '依國中會考PR值' },
      mid: { total: 0, description: '依國中會考PR值' },
      base: { total: 0, description: '依國中會考PR值' }
    }
  },
  {
    slug: 'abroad',
    name: '留學/海外升學',
    category: '國際管道',
    description: '直接申請海外大學，包括日本、韓國、美國、英國、澳洲等。成績不是唯一條件，個人特質和申請文章很重要。',
    timeline: ['高二下-高三上：準備（語言考試、申請文章）', '高三上：提交申請', '高三下-暑假：收到結果'],
    requirements: ['語言成績（TOEFL/IELTS/JLPT等）', '在校成績', '申請文章', '推薦信'],
    targetStudents: '語言能力好、家庭經濟許可、想體驗不同教育環境的學生',
    quotaPercentage: 2,
    tips: [
      '高二就要開始準備語言考試',
      '申請文章（Personal Statement）是關鍵',
      '很多海外大學看在校成績（GPA）更甚於學測',
      '日韓留學相對便宜，歐美較貴但獎學金機會多'
    ],
    faqs: [
      { q: '沒有學測成績可以申請海外大學嗎？', a: '可以，很多海外大學不看學測，主要看在校成績、語言成績和申請文章。' }
    ],
    scoreRanges: {
      top: { total: 0, description: '不適用' },
      high: { total: 0, description: '不適用' },
      mid: { total: 0, description: '不適用' },
      base: { total: 0, description: '不適用' }
    }
  },
  {
    slug: 'overseas-chinese',
    name: '僑生/港澳生',
    category: '國際管道',
    description: '海外僑生和港澳學生有專屬的升學管道，以聯合分發為主。名額獨立，不佔一般生名額。',
    timeline: ['3-5月：報名', '6-7月：分發', '8月：入學'],
    requirements: ['僑生/港澳生身分', '學測成績或海外高中成績'],
    targetStudents: '海外僑生、港澳學生',
    quotaPercentage: 2,
    tips: [
      '名額獨立，競爭比一般生小',
      '了解僑生先修部制度',
      '部分校系有僑生專班'
    ],
    faqs: [
      { q: '僑生需要回台灣考學測嗎？', a: '可以在海外參加海外聯合招生考試，不一定需要回台灣考學測。' }
    ],
    scoreRanges: {
      top: { total: 45, description: '台清交熱門科系' },
      high: { total: 40, description: '國立大學大多數科系' },
      mid: { total: 30, description: '國立普通科系' },
      base: { total: 25, description: '私立大學科系' }
    }
  },
  {
    slug: 'transfer',
    name: '二技/轉學考',
    category: '科技管道',
    description: '五專畢業後可透過二技管道進入科技大學二年級。一般大學也有轉學考管道，讓學生有第二次選擇機會。',
    timeline: ['二技：5-6月報名', '轉學考：各校不同時間'],
    requirements: ['五專/大一成績', '轉學考成績（部分校系）'],
    targetStudents: '五專畢業生、對現有學校不滿意的大一學生',
    quotaPercentage: 3,
    tips: [
      '二技是五專生升學的主要管道',
      '轉學考名額有限，競爭激烈',
      '在大一期間保持好成績很重要'
    ],
    faqs: [
      { q: '二技可以轉到普通大學嗎？', a: '二技畢業後可以報考研究所，但一般不能直接轉入普通大學三年級。' }
    ],
    scoreRanges: {
      top: { total: 0, description: '依在校成績' },
      high: { total: 0, description: '依在校成績' },
      mid: { total: 0, description: '依在校成績' },
      base: { total: 0, description: '依在校成績' }
    }
  },
  {
    slug: 'disability',
    name: '身心障礙升學',
    category: '特殊管道',
    description: '身心障礙學生享有專屬升學保障名額和相關輔助措施。各大學都有身心障礙學生招生名額。',
    timeline: ['依各管道時間表', '需提前申請鑑定和輔助'],
    requirements: ['身心障礙手冊/證明', '各管道基本條件'],
    targetStudents: '領有身心障礙證明的學生',
    quotaPercentage: 1,
    tips: [
      '各大學都有保障名額，競爭較小',
      '提前向目標學校了解無障礙設施和輔助措施',
      '申請 Extra Time 等考試 accommodations'
    ],
    faqs: [
      { q: '需要什麼證明？', a: '需領有身心障礙手冊或主管機關核發的身心障礙證明。' }
    ],
    scoreRanges: {
      top: { total: 45, description: '保障名額可達頂標校系' },
      high: { total: 35, description: '保障名額可達前標校系' },
      mid: { total: 25, description: '保障名額可達均標校系' },
      base: { total: 18, description: '保障名額可進多數校系' }
    }
  }
];

export const NEXT_EXAM_DATE = new Date('2027-04-24T00:00:00+08:00');

export const NEXT_UNIFIED_EXAM_DATE = new Date('2027-05-04T00:00:00+08:00');

export const SUBJECT_LABELS: Record<string, string> = {
  chinese: '國文',
  english: '英文',
  math: '數學',
  science: '自然',
  social: '社會'
};

export const MATH_TRACK_LABELS = {
  A: '數學A（社會組）',
  B: '數學B（自然組）'
};

export const UNIFIED_EXAM_SUBJECTS: Record<VocationalGroup, { common: string[]; professional: string[] }> = {
  '資訊群': { common: ['國文', '英文', '數學'], professional: ['程式設計概論', '資料處理'] },
  '電機群': { common: ['國文', '英文', '數學'], professional: ['電工原理與實務', '電子學與實務'] },
  '電子群': { common: ['國文', '英文', '數學'], professional: ['電子學與實務', '電工原理與實務'] },
  '機械群': { common: ['國文', '英文', '數學'], professional: ['機械原理', '機械製造'] },
  '餐旅群': { common: ['國文', '英文', '數學'], professional: ['餐飲實務', '旅遊實務'] },
  '商管群': { common: ['國文', '英文', '數學'], professional: ['計算機概論', '會計學'] },
  '設計群': { common: ['國文', '英文', '數學'], professional: ['設計基礎', '色彩原理'] },
  '農業群': { common: ['國文', '英文', '數學'], professional: ['農業概論', '生物技術'] },
  '化工群': { common: ['國文', '英文', '數學'], professional: ['化工原理', '化學'] },
  '土木群': { common: ['國文', '英文', '數學'], professional: ['工程力學概論', '工程材料'] },
  '海事群': { common: ['國文', '英文', '數學'], professional: ['航海學概論', '船舶概論'] },
  '護理群': { common: ['國文', '英文', '數學'], professional: ['護理學概論', '生物'] },
  '家政群': { common: ['國文', '英文', '數學'], professional: ['家政概論', '食品與營養'] },
  '語文群': { common: ['國文', '英文', '數學'], professional: ['本國語文', '外國語文'] },
  '商業與管理群': { common: ['國文', '英文', '數學'], professional: ['商業概論', '經濟學'] }
};

export const UNIFIED_EXAM_SUBJECT_LABELS: Record<string, string> = {
  chinese: '國文',
  english: '英文',
  math: '數學',
  professional1: '專業科目(一)',
  professional2: '專業科目(二)'
};

export const UNIFIED_EXAM_SCORE_RANGES: Record<VocationalGroup, { top: number; high: number; mid: number; base: number }> = {
  '資訊群': { top: 380, high: 340, mid: 290, base: 230 },
  '電機群': { top: 370, high: 330, mid: 280, base: 220 },
  '電子群': { top: 360, high: 320, mid: 270, base: 210 },
  '機械群': { top: 350, high: 310, mid: 260, base: 200 },
  '餐旅群': { top: 360, high: 320, mid: 270, base: 210 },
  '商管群': { top: 370, high: 330, mid: 280, base: 220 },
  '設計群': { top: 370, high: 330, mid: 280, base: 220 },
  '農業群': { top: 330, high: 290, mid: 240, base: 190 },
  '化工群': { top: 340, high: 300, mid: 250, base: 195 },
  '土木群': { top: 350, high: 310, mid: 260, base: 200 },
  '海事群': { top: 320, high: 280, mid: 235, base: 185 },
  '護理群': { top: 380, high: 340, mid: 290, base: 230 },
  '家政群': { top: 340, high: 300, mid: 250, base: 195 },
  '語文群': { top: 360, high: 320, mid: 270, base: 210 },
  '商業與管理群': { top: 360, high: 320, mid: 270, base: 210 }
};

export const VOCATIONAL_PATHWAY_CATEGORIES: Record<string, { label: string; pathways: string[] }> = {
  '主要管道': {
    label: '主要升學管道',
    pathways: ['四技二專甄選', '聯合登記分發（技職）']
  },
  '競賽管道': {
    label: '技藝競賽管道',
    pathways: ['技優保送/甄保']
  },
  '推薦管道': {
    label: '推薦升學管道',
    pathways: ['科技校院繁星計畫']
  },
  '特殊管道': {
    label: '特殊升學管道',
    pathways: ['特殊選才入學', '軍警校院', '體育/藝術類', '原住民/離島加分', '身心障礙升學']
  },
  '其他管道': {
    label: '其他升學管道',
    pathways: ['留學/海外升學', '二技/轉學考']
  }
};
