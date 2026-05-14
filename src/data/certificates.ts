// 證照對照表：15 個職群對應的技術士證照清單
// 資料來源：勞動部勞動力發展署技能檢定中心

export interface CertificateInfo {
  id: string          // 唯一識別碼
  name: string        // 證照全名
  level: '丙' | '乙' | '甲'  // 級別
  groupCode: string   // 對應職群代碼
}

// 按職群代碼索引的證照清單
export const CERTIFICATES_BY_GROUP: Record<string, CertificateInfo[]> = {
  // 01 - 餐旅群
  "01": [
    { id: "food-bev-c", name: "丙級餐飲服務技術士", level: "丙", groupCode: "01" },
    { id: "food-bev-b", name: "乙級餐飲服務技術士", level: "乙", groupCode: "01" },
    { id: "baking-c", name: "丙級烘焙食品技術士", level: "丙", groupCode: "01" },
    { id: "baking-b", name: "乙級烘焙食品技術士", level: "乙", groupCode: "01" },
    { id: "chinese-cook-c", name: "丙級中餐烹調技術士", level: "丙", groupCode: "01" },
    { id: "chinese-cook-b", name: "乙級中餐烹調技術士", level: "乙", groupCode: "01" },
    { id: "western-cook-c", name: "丙級西餐烹調技術士", level: "丙", groupCode: "01" },
    { id: "western-cook-b", name: "乙級西餐烹調技術士", level: "乙", groupCode: "01" },
    { id: "beverage-c", name: "丙級飲料調製技術士", level: "丙", groupCode: "01" },
    { id: "beverage-b", name: "乙級飲料調製技術士", level: "乙", groupCode: "01" },
  ],

  // 02 - 機械群
  "02": [
    { id: "lathe-c", name: "丙級車床技術士", level: "丙", groupCode: "02" },
    { id: "lathe-b", name: "乙級車床技術士", level: "乙", groupCode: "02" },
    { id: "milling-c", name: "丙級銑床技術士", level: "丙", groupCode: "02" },
    { id: "milling-b", name: "乙級銑床技術士", level: "乙", groupCode: "02" },
    { id: "cnc-lathe-c", name: "丙級 CNC 車床技術士", level: "丙", groupCode: "02" },
    { id: "cnc-lathe-b", name: "乙級 CNC 車床技術士", level: "乙", groupCode: "02" },
    { id: "cnc-mill-c", name: "丙級 CNC 銑床技術士", level: "丙", groupCode: "02" },
    { id: "cnc-mill-b", name: "乙級 CNC 銑床技術士", level: "乙", groupCode: "02" },
    { id: "general-mech-c", name: "丙級一般手工電焊技術士", level: "丙", groupCode: "02" },
    { id: "general-mech-b", name: "乙級一般手工電焊技術士", level: "乙", groupCode: "02" },
    { id: "模具-c", name: "丙級模具技術士", level: "丙", groupCode: "02" },
    { id: "模具-b", name: "乙級模具技術士", level: "乙", groupCode: "02" },
  ],

  // 03 - 電機群
  "03": [
    { id: "indoor-wire-c", name: "丙級室內配線技術士", level: "丙", groupCode: "03" },
    { id: "indoor-wire-b", name: "乙級室內配線技術士", level: "乙", groupCode: "03" },
    { id: "ind-wire-c", name: "丙級工業配線技術士", level: "丙", groupCode: "03" },
    { id: "ind-wire-b", name: "乙級工業配線技術士", level: "乙", groupCode: "03" },
    { id: "electrician-c", name: "丙級配電線路技術士", level: "丙", groupCode: "03" },
    { id: "electrician-b", name: "乙級配電線路技術士", level: "乙", groupCode: "03" },
    { id: "solar-pv-c", name: "丙級太陽光電設置技術士", level: "丙", groupCode: "03" },
    { id: "solar-pv-b", name: "乙級太陽光電設置技術士", level: "乙", groupCode: "03" },
  ],

  // 04 - 電子群
  "04": [
    { id: "digital-elec-c", name: "丙級數位電子技術士", level: "丙", groupCode: "04" },
    { id: "digital-elec-b", name: "乙級數位電子技術士", level: "乙", groupCode: "04" },
    { id: "analog-elec-c", name: "丙級儀表電子技術士", level: "丙", groupCode: "04" },
    { id: "analog-elec-b", name: "乙級儀表電子技術士", level: "乙", groupCode: "04" },
    { id: "elec-comm-c", name: "丙級電力電子技術士", level: "丙", groupCode: "04" },
    { id: "elec-comm-b", name: "乙級電力電子技術士", level: "乙", groupCode: "04" },
  ],

  // 05 - 資訊群
  "05": [
    { id: "comp-sft-c", name: "丙級電腦軟體設計技術士", level: "丙", groupCode: "05" },
    { id: "comp-sft-b", name: "乙級電腦軟體設計技術士", level: "乙", groupCode: "05" },
    { id: "comp-hw-c", name: "丙級電腦硬體裝修技術士", level: "丙", groupCode: "05" },
    { id: "comp-hw-b", name: "乙級電腦硬體裝修技術士", level: "乙", groupCode: "05" },
    { id: "web-c", name: "丙級網頁設計技術士", level: "丙", groupCode: "05" },
    { id: "web-b", name: "乙級網頁設計技術士", level: "乙", groupCode: "05" },
    { id: "sw-app-c", name: "丙級軟體應用技術士", level: "丙", groupCode: "05" },
    { id: "sw-app-b", name: "乙級軟體應用技術士", level: "乙", groupCode: "05" },
    { id: "network-mgmt-c", name: "丙級網路管理技術士", level: "丙", groupCode: "05" },
    { id: "network-mgmt-b", name: "乙級網路管理技術士", level: "乙", groupCode: "05" },
  ],

  // 06 - 商業與管理群
  "06": [
    { id: "biz-sw-c", name: "丙級商業計算技術士", level: "丙", groupCode: "06" },
    { id: "biz-sw-b", name: "乙級商業計算技術士", level: "乙", groupCode: "06" },
    { id: "accounting-c", name: "丙級會計事務技術士", level: "丙", groupCode: "06" },
    { id: "accounting-b", name: "乙級會計事務技術士", level: "乙", groupCode: "06" },
    { id: "marketing-c", name: "丙級門市服務技術士", level: "丙", groupCode: "06" },
    { id: "marketing-b", name: "乙級門市服務技術士", level: "乙", groupCode: "06" },
    { id: "ecommerce-c", name: "丙級電子商務技術士", level: "丙", groupCode: "06" },
    { id: "ecommerce-b", name: "乙級電子商務技術士", level: "乙", groupCode: "06" },
  ],

  // 07 - 設計群
  "07": [
    { id: "graphic-c", name: "丙級圖文組版技術士", level: "丙", groupCode: "07" },
    { id: "graphic-b", name: "乙級圖文組版技術士", level: "乙", groupCode: "07" },
    { id: "printing-c", name: "丙級印刷技術士", level: "丙", groupCode: "07" },
    { id: "printing-b", name: "乙級印刷技術士", level: "乙", groupCode: "07" },
    { id: "visual-design-c", name: "丙級視覺傳達設計技術士", level: "丙", groupCode: "07" },
    { id: "visual-design-b", name: "乙級視覺傳達設計技術士", level: "乙", groupCode: "07" },
    { id: "packaging-c", name: "丙級包裝設計技術士", level: "丙", groupCode: "07" },
    { id: "packaging-b", name: "乙級包裝設計技術士", level: "乙", groupCode: "07" },
  ],

  // 08 - 農業群
  "08": [
    { id: "agronomy-c", name: "丙級農藝技術士", level: "丙", groupCode: "08" },
    { id: "agronomy-b", name: "乙級農藝技術士", level: "乙", groupCode: "08" },
    { id: "horticulture-c", name: "丙級園藝技術士", level: "丙", groupCode: "08" },
    { id: "horticulture-b", name: "乙級園藝技術士", level: "乙", groupCode: "08" },
    { id: "landscape-c", name: "丙級造園景觀技術士", level: "丙", groupCode: "08" },
    { id: "landscape-b", name: "乙級造園景觀技術士", level: "乙", groupCode: "08" },
  ],

  // 09 - 化工群
  "09": [
    { id: "chem-c", name: "丙級化學技術士", level: "丙", groupCode: "09" },
    { id: "chem-b", name: "乙級化學技術士", level: "乙", groupCode: "09" },
    { id: "chem-eng-c", name: "丙級化工技術士", level: "丙", groupCode: "09" },
    { id: "chem-eng-b", name: "乙級化工技術士", level: "乙", groupCode: "09" },
    { id: "env-analyst-c", name: "丙級環境檢驗技術士", level: "丙", groupCode: "09" },
    { id: "env-analyst-b", name: "乙級環境檢驗技術士", level: "乙", groupCode: "09" },
  ],

  // 10 - 土木群
  "10": [
    { id: "survey-c", name: "丙級測量技術士", level: "丙", groupCode: "10" },
    { id: "survey-b", name: "乙級測量技術士", level: "乙", groupCode: "10" },
    { id: "concrete-c", name: "丙級混凝土技術士", level: "丙", groupCode: "10" },
    { id: "concrete-b", name: "乙級混凝土技術士", level: "乙", groupCode: "10" },
    { id: "construction-c", name: "丙級建築製圖技術士", level: "丙", groupCode: "10" },
    { id: "construction-b", name: "乙級建築製圖技術士", level: "乙", groupCode: "10" },
    { id: "water-plumb-c", name: "丙級自來水管承裝技術士", level: "丙", groupCode: "10" },
    { id: "water-plumb-b", name: "乙級自來水管承裝技術士", level: "乙", groupCode: "10" },
  ],

  // 11 - 海事群
  "11": [
    { id: "seamanship-c", name: "丙級船員技術士", level: "丙", groupCode: "11" },
    { id: "seamanship-b", name: "乙級船員技術士", level: "乙", groupCode: "11" },
    { id: "aquaculture-c", name: "丙級水產養殖技術士", level: "丙", groupCode: "11" },
    { id: "aquaculture-b", name: "乙級水產養殖技術士", level: "乙", groupCode: "11" },
  ],

  // 12 - 護理群
  "12": [
    { id: "nursing-c", name: "丙級護理技術士", level: "丙", groupCode: "12" },
    { id: "nursing-b", name: "乙級護理技術士", level: "乙", groupCode: "12" },
    { id: "basic-life-support", name: "基本救命術證書", level: "丙", groupCode: "12" },
    { id: "cpr-aed", name: "CPR+AED 證書", level: "丙", groupCode: "12" },
  ],

  // 13 - 家政群
  "13": [
    { id: "hair-c", name: "丙級女子美髮技術士", level: "丙", groupCode: "13" },
    { id: "hair-b", name: "乙級女子美髮技術士", level: "乙", groupCode: "13" },
    { id: "beauty-c", name: "丙級美容技術士", level: "丙", groupCode: "13" },
    { id: "beauty-b", name: "乙級美容技術士", level: "乙", groupCode: "13" },
    { id: "mens-hair-c", name: "丙級男子理髮技術士", level: "丙", groupCode: "13" },
    { id: "mens-hair-b", name: "乙級男子理髮技術士", level: "乙", groupCode: "13" },
  ],

  // 14 - 語文群
  "14": [
    { id: "eng-b1", name: "CEFR B1 英語能力檢定", level: "丙", groupCode: "14" },
    { id: "eng-b2", name: "CEFR B2 英語能力檢定", level: "乙", groupCode: "14" },
    { id: "jp-n3", name: "JLPT N3 日語能力檢定", level: "丙", groupCode: "14" },
    { id: "jp-n2", name: "JLPT N2 日語能力檢定", level: "乙", groupCode: "14" },
  ],

  // 15 - 商業與管理群（同 06）
  "15": [
    { id: "biz-sw-15-c", name: "丙級商業計算技術士", level: "丙", groupCode: "15" },
    { id: "biz-sw-15-b", name: "乙級商業計算技術士", level: "乙", groupCode: "15" },
    { id: "accounting-15-c", name: "丙級會計事務技術士", level: "丙", groupCode: "15" },
    { id: "accounting-15-b", name: "乙級會計事務技術士", level: "乙", groupCode: "15" },
    { id: "ecommerce-15-c", name: "丙級電子商務技術士", level: "丙", groupCode: "15" },
    { id: "ecommerce-15-b", name: "乙級電子商務技術士", level: "乙", groupCode: "15" },
  ],
}

// 所有證照的扁平清單（用於搜尋）
export const ALL_CERTIFICATES: CertificateInfo[] = Object.values(CERTIFICATES_BY_GROUP).flat()

// 根據證照名稱查找
export function findCertificateByName(name: string): CertificateInfo | undefined {
  return ALL_CERTIFICATES.find(c => c.name === name)
}

// 取得某職群的證照清單
export function getCertificatesByGroup(groupCode: string): CertificateInfo[] {
  return CERTIFICATES_BY_GROUP[groupCode] || []
}

// 取得某職群的乙級證照
export function getLevelBCertificates(groupCode: string): CertificateInfo[] {
  return getCertificatesByGroup(groupCode).filter(c => c.level === '乙')
}
