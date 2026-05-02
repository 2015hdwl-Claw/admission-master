/**
 * 升學大師 v5.0 - 商管群匹配度演算法核心
 *
 * 實現 7 個商管科系的資料庫和匹配度計算公式
 * Phase 1 核心演算法實現
 */

// ============= 型別定義 =============

/**
 * 商管群科系列表
 */
export enum BusinessDepartment {
  ACCOUNTING = 'accounting',           // 會計學系
  FINANCE = 'finance',                 // 財務金融學系
  INTERNATIONAL_BUSINESS = 'intl-business', // 國際企業學系
  MARKETING = 'marketing',              // 行銷學系
  ECONOMICS = 'economics',             // 經濟學系
  MANAGEMENT = 'management',           // 企業管理學系
  INFORMATION_MANAGEMENT = 'info-mgmt' // 資訊管理學系
}

/**
 * 使用者商管群特質資料
 */
export interface BusinessProfile {
  // 數學能力（重要性：★★★★★）
  mathScore: number; // 0-100

  // 邏輯思維（重要性：★★★★★）
  logicScore: number; // 0-100

  // 語文能力（重要性：★★★★☆）
  languageScore: number; // 0-100

  // 溝通表達（重要性：★★★★☆）
  communicationScore: number; // 0-100

  // 創意思考（重要性：★★★☆☆）
  creativityScore: number; // 0-100

  // 領導能力（重要性：★★★☆☆）
  leadershipScore: number; // 0-100

  // 資訊能力（重要性：★★☆☆☆）
  itScore: number; // 0-100

  // 國際視野（重要性：★★☆☆☆）
  globalVisionScore: number; // 0-100
}

/**
 * 科系特質需求
 */
export interface DepartmentRequirement {
  department: BusinessDepartment;
  name: string;

  // 能力權重（相對權重，會標準化處理）
  weights: {
    math: number;        // 數學能力權重
    logic: number;       // 邏輯思維權重
    language: number;    // 語文能力權重
    communication: number; // 溝通表達權重
    creativity: number;  // 創意思考權重
    leadership: number;  // 領導能力權重
    it: number;         // 資訊能力權重
    globalVision: number; // 國際視野權重
  };

  // 最低門檻（低於此值大幅扣分）
  thresholds: {
    math: number;
    logic: number;
    language: number;
  };
}

// ============= 科系資料庫 =============

/**
 * 7 個商管科系特質資料庫
 * 基於教育部的課程標準和業界需求分析
 */
export const BUSINESS_DEPARTMENTS: Record<BusinessDepartment, DepartmentRequirement> = {
  [BusinessDepartment.ACCOUNTING]: {
    department: BusinessDepartment.ACCOUNTING,
    name: '會計學系',
    weights: {
      math: 35,        // 數學最重要（會計處理、財務分析）
      logic: 30,       // 邏輯次之（審計思維、法規適用）
      language: 15,    // 語文中等（報表閱讀、法規理解）
      communication: 10, // 溝通較低（主要是對內溝通）
      creativity: 5,   // 創意低（標準化程度高）
      leadership: 5,   // 領導低（初階會計師）
      it: 15,          // 資訊中等（會計軟體、Excel）
      globalVision: 5  // 國際低（除非做國際稅務）
    },
    thresholds: {
      math: 50,    // 數學門檻高
      logic: 55,   // 邏輯門檻最高
      language: 40 // 語文門檻中等
    }
  },

  [BusinessDepartment.FINANCE]: {
    department: BusinessDepartment.FINANCE,
    name: '財務金融學系',
    weights: {
      math: 40,        // 數學最重要（投資分析、風險計算）
      logic: 25,       // 邏輯重要（市場判斷、決策分析）
      language: 15,    // 語文重要（國際金融資訊）
      communication: 10, // 溝通中等（業務溝通）
      creativity: 10,  // 創意中等（金融商品創新）
      leadership: 5,   // 領導低（初階分析師）
      it: 20,          // 資訊重要（金融科技、量化交易）
      globalVision: 15 // 國際重要（外匯、國際市場）
    },
    thresholds: {
      math: 60,    // 數學門檻最高
      logic: 50,   // 邏輯門檻高
      language: 45 // 語文門檻中等偏高
    }
  },

  [BusinessDepartment.INTERNATIONAL_BUSINESS]: {
    department: BusinessDepartment.INTERNATIONAL_BUSINESS,
    name: '國際企業學系',
    weights: {
      math: 20,        // 數學中等（商業計算）
      logic: 20,       // 邏輯中等（策略規劃）
      language: 30,    // 語文最重要（外語能力）
      communication: 25, // 溝通重要（跨文化溝通）
      creativity: 15,  // 創意重要（國際市場創新）
      leadership: 15,  // 領導重要（跨國領導）
      it: 10,          // 資訊較低（基本工具）
      globalVision: 30 // 國際最重要（全球視野）
    },
    thresholds: {
      math: 35,    // 數學門檻低
      logic: 40,   // 邏輯門檻中等
      language: 65 // 語文門檻最高
    }
  },

  [BusinessDepartment.MARKETING]: {
    department: BusinessDepartment.MARKETING,
    name: '行銷學系',
    weights: {
      math: 15,        // 數學較低（基本統計）
      logic: 20,       // 邏輯中等（行銷策略）
      language: 25,    // 語文重要（文案、溝通）
      communication: 30, // 溝通最重要（對外溝通）
      creativity: 30,  // 創意最重要（行銷創意）
      leadership: 10,  // 領導中等（團隊協調）
      it: 15,          // 資訊中等（數位行銷工具）
      globalVision: 10 // 國際較低（除非國際行銷）
    },
    thresholds: {
      math: 30,    // 數學門檻低
      logic: 40,   // 邏輯門檻中等
      language: 55 // 語文門檻高
    }
  },

  [BusinessDepartment.ECONOMICS]: {
    department: BusinessDepartment.ECONOMICS,
    name: '經濟學系',
    weights: {
      math: 35,        // 數學最重要（計量經濟）
      logic: 35,       // 邏輯最重要（經濟理論）
      language: 15,    // 語文中等（論文閱讀）
      communication: 10, // 溝通較低（學術導向）
      creativity: 10,  // 創意中等（理論創新）
      leadership: 5,   // 領導低（研究導向）
      it: 15,          // 資訊中等（統計軟體）
      globalVision: 15 // 國際中等（全球經濟）
    },
    thresholds: {
      math: 65,    // 數學門檻最高
      logic: 65,   // 邏輯門檻最高
      language: 50 // 語文門檻中等
    }
  },

  [BusinessDepartment.MANAGEMENT]: {
    department: BusinessDepartment.MANAGEMENT,
    name: '企業管理學系',
    weights: {
      math: 20,        // 數學中等（商業計算）
      logic: 25,       // 邏輯重要（管理決策）
      language: 20,    // 語文重要（溝通協調）
      communication: 25, // 溝通重要（團隊溝通）
      creativity: 15,  // 創意中等（管理創新）
      leadership: 25,  // 領導重要（團隊領導）
      it: 10,          // 資訊較低（基本工具）
      globalVision: 10 // 國際較低（除非跨國管理）
    },
    thresholds: {
      math: 35,    // 數學門檻低
      logic: 45,   // 邏輯門檻中等
      language: 50 // 語文門檻中等
    }
  },

  [BusinessDepartment.INFORMATION_MANAGEMENT]: {
    department: BusinessDepartment.INFORMATION_MANAGEMENT,
    name: '資訊管理學系',
    weights: {
      math: 30,        // 數學重要（資料分析）
      logic: 30,       // 邏輯重要（系統設計）
      language: 15,    // 語文中等（文件撰寫）
      communication: 15, // 溝通中等（需求溝通）
      creativity: 10,  // 創意較低（技術導向）
      leadership: 10,  // 領導較低（專案管理）
      it: 40,          // 資訊最重要（系統開發）
      globalVision: 10 // 國際較低（除非國際專案）
    },
    thresholds: {
      math: 50,    // 數學門檻高
      logic: 55,   // 邏輯門檻高
      language: 40 // 語文門檻中等
    }
  }
};

// ============= 匹配度計算 =============

/**
 * 科系匹配度結果
 */
export interface DepartmentMatch {
  department: BusinessDepartment;
  name: string;
  matchScore: number; // 0-100 匹配度
  riskLevel: 'low' | 'medium' | 'high'; // 適配風險
  strengths: string[]; // 優勢項目
  concerns: string[]; // 關注項目
  recommendations: string[]; // 發展建議
}

/**
 * 計算單一科系匹配度
 *
 * @param profile 使用者商管特質
 * @param dept 科系需求
 * @returns 匹配度結果
 */
export function calculateDepartmentMatch(
  profile: BusinessProfile,
  dept: DepartmentRequirement
): DepartmentMatch {
  // 1. 加權匹配度計算（先標準化權重）
  const totalWeight =
    dept.weights.math +
    dept.weights.logic +
    dept.weights.language +
    dept.weights.communication +
    dept.weights.creativity +
    dept.weights.leadership +
    dept.weights.it +
    dept.weights.globalVision;

  const weightedScore =
    (profile.mathScore * dept.weights.math / totalWeight) +
    (profile.logicScore * dept.weights.logic / totalWeight) +
    (profile.languageScore * dept.weights.language / totalWeight) +
    (profile.communicationScore * dept.weights.communication / totalWeight) +
    (profile.creativityScore * dept.weights.creativity / totalWeight) +
    (profile.leadershipScore * dept.weights.leadership / totalWeight) +
    (profile.itScore * dept.weights.it / totalWeight) +
    (profile.globalVisionScore * dept.weights.globalVision / totalWeight);

  // 2. 門檻懲罰（低於門檻大幅扣分）
  let thresholdPenalty = 0;
  if (profile.mathScore < dept.thresholds.math) {
    thresholdPenalty += (dept.thresholds.math - profile.mathScore) * 0.5;
  }
  if (profile.logicScore < dept.thresholds.logic) {
    thresholdPenalty += (dept.thresholds.logic - profile.logicScore) * 0.5;
  }
  if (profile.languageScore < dept.thresholds.language) {
    thresholdPenalty += (dept.thresholds.language - profile.languageScore) * 0.5;
  }

  // 3. 最終匹配度（0-100）
  const matchScore = Math.max(0, Math.min(100, weightedScore - thresholdPenalty));

  // 4. 分析優勢和關注
  const strengths: string[] = [];
  const concerns: string[] = [];

  // 分析各項能力
  if (profile.mathScore >= 70 && dept.weights.math >= 25) {
    strengths.push('數學能力符合需求');
  } else if (profile.mathScore < dept.thresholds.math) {
    concerns.push(`數學能力低於門檻（${profile.mathScore} < ${dept.thresholds.math}）`);
  }

  if (profile.logicScore >= 70 && dept.weights.logic >= 25) {
    strengths.push('邏輯思維符合需求');
  } else if (profile.logicScore < dept.thresholds.logic) {
    concerns.push(`邏輯思維低於門檻（${profile.logicScore} < ${dept.thresholds.logic}）`);
  }

  if (profile.languageScore >= 70 && dept.weights.language >= 20) {
    strengths.push('語文能力符合需求');
  } else if (profile.languageScore < dept.thresholds.language) {
    concerns.push(`語文能力低於門檻（${profile.languageScore} < ${dept.thresholds.language}）`);
  }

  // 特殊能力分析
  if (dept.weights.it >= 30 && profile.itScore >= 70) {
    strengths.push('資訊能力強項');
  }
  if (dept.weights.globalVision >= 20 && profile.globalVisionScore >= 70) {
    strengths.push('國際視野符合需求');
  }
  if (dept.weights.creativity >= 25 && profile.creativityScore >= 70) {
    strengths.push('創意思考符合需求');
  }

  // 5. 風險評估
  let riskLevel: 'low' | 'medium' | 'high';
  if (matchScore >= 75 && concerns.length === 0) {
    riskLevel = 'low';
  } else if (matchScore >= 60 && concerns.length <= 1) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }

  // 6. 發展建議
  const recommendations: string[] = [];

  if (concerns.length > 0) {
    recommendations.push('建議加強薄弱能力項目');
  }

  if (dept.weights.math >= 30 && profile.mathScore < 60) {
    recommendations.push('建議多修習數學相關課程');
  }

  if (dept.weights.language >= 25 && profile.languageScore < 60) {
    recommendations.push('建議加強英語或第二外語能力');
  }

  if (dept.weights.it >= 25 && profile.itScore < 60) {
    recommendations.push('建議學習基礎程式設計或資料分析工具');
  }

  if (riskLevel === 'low') {
    recommendations.push('此科系與你的特質高度匹配，建議優先考虑');
  } else if (riskLevel === 'high') {
    recommendations.push('此科系與你的特質匹配度較低，建議謹慎評估');
  }

  return {
    department: dept.department,
    name: dept.name,
    matchScore: Math.round(matchScore),
    riskLevel,
    strengths,
    concerns,
    recommendations
  };
}

/**
 * 計算所有商管科系匹配度
 *
 * @param profile 使用者商管特質
 * @returns 所有科系的匹配度結果（依匹配度排序）
 */
export function calculateAllBusinessMatches(
  profile: BusinessProfile
): DepartmentMatch[] {
  const departments = Object.values(BUSINESS_DEPARTMENTS);
  const matches = departments.map(dept =>
    calculateDepartmentMatch(profile, dept)
  );

  // 依匹配度排序（高到低）
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

// ============= 資料轉換 =============

/**
 * 從使用者的問卷回答轉換為商管特質評分
 *
 * @param answers 使用者問卷回答
 * @returns 商管特質評分
 */
export function convertAnswersToProfile(
  answers: Record<string, number | string>
): BusinessProfile {
  // 支援兩種欄位名稱格式：完整名稱和簡稱
  return {
    mathScore: (answers.mathScore || answers.math || 50) as number,
    logicScore: (answers.logicScore || answers.logic || 50) as number,
    languageScore: (answers.languageScore || answers.language || 50) as number,
    communicationScore: (answers.communicationScore || answers.communication || 50) as number,
    creativityScore: (answers.creativityScore || answers.creativity || 50) as number,
    leadershipScore: (answers.leadershipScore || answers.leadership || 50) as number,
    itScore: (answers.itScore || answers.it || 50) as number,
    globalVisionScore: (answers.globalVisionScore || answers.globalVision || 50) as number
  };
}

/**
 * 產生推薦摘要
 *
 * @param matches 排序後的匹配結果
 * @returns 推薦摘要文字
 */
export function generateRecommendationSummary(matches: DepartmentMatch[]): string {
  if (matches.length === 0) {
    return '無法產生推薦，請重新評估';
  }

  const topMatch = matches[0];
  const highRiskCount = matches.filter(m => m.riskLevel === 'high').length;

  let summary = `🎯 **最推薦：${topMatch.name}**（匹配度 ${topMatch.matchScore}%）\n\n`;

  if (topMatch.riskLevel === 'low') {
    summary += `✅ 你的特質與${topMatch.name}高度匹配，強項包括：\n`;
    summary += topMatch.strengths.map(s => `• ${s}`).join('\n');
  } else if (topMatch.riskLevel === 'medium') {
    summary += `⚠️ 你的特質與${topMatch.name}中度匹配，\n`;
    summary += `建議關注：${topMatch.concerns.join('、')}`;
  } else {
    summary += `❌ 你的特質與${topMatch.name}匹配度較低，\n`;
    summary += `主要問題：${topMatch.concerns.join('、')}\n\n`;
    summary += `💡 建議考慮其他匹配度更高的科系`;
  }

  if (highRiskCount > 0) {
    summary += `\n\n⚠️ 注意：有 ${highRiskCount} 個科系匹配度較低，建議謹慎評估`;
  }

  return summary;
}