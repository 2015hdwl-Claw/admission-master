/**
 * 升學大師 v5.0 - 商管群演算法單元測試
 *
 * 測試 7 個科系的資料庫和匹配度計算邏輯
 */

import { describe, it, expect } from 'vitest';
import {
  BusinessDepartment,
  BUSINESS_DEPARTMENTS,
  calculateDepartmentMatch,
  calculateAllBusinessMatches,
  convertAnswersToProfile,
  generateRecommendationSummary,
  type BusinessProfile,
  type DepartmentMatch
} from '../scoring-algorithm';

describe('商管群演算法 - 資料庫驗證', () => {
  it('應該包含 7 個商管科系', () => {
    const departments = Object.values(BUSINESS_DEPARTMENTS);
    expect(departments).toHaveLength(7);

    const deptNames = departments.map(d => d.name);
    expect(deptNames).toContain('會計學系');
    expect(deptNames).toContain('財務金融學系');
    expect(deptNames).toContain('國際企業學系');
    expect(deptNames).toContain('行銷學系');
    expect(deptNames).toContain('經濟學系');
    expect(deptNames).toContain('企業管理學系');
    expect(deptNames).toContain('資訊管理學系');
  });

  it('每個科系的權重應該有意義的分配', () => {
    const departments = Object.values(BUSINESS_DEPARTMENTS);

    departments.forEach(dept => {
      const weightSum =
        dept.weights.math +
        dept.weights.logic +
        dept.weights.language +
        dept.weights.communication +
        dept.weights.creativity +
        dept.weights.leadership +
        dept.weights.it +
        dept.weights.globalVision;

      // 權重總和應該合理（我們使用相對權重，所以可以超過 100）
      expect(weightSum).toBeGreaterThan(50);

      // 每個權重應該是合理的數值
      Object.values(dept.weights).forEach(weight => {
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(50);
      });
    });
  });

  it('會計學系應該重視數學和邏輯', () => {
    const accounting = BUSINESS_DEPARTMENTS[BusinessDepartment.ACCOUNTING];

    expect(accounting.weights.math).toBeGreaterThanOrEqual(30);
    expect(accounting.weights.logic).toBeGreaterThanOrEqual(25);
    expect(accounting.thresholds.math).toBeGreaterThan(40);
    expect(accounting.thresholds.logic).toBeGreaterThan(40);
  });

  it('財金系應該重視數學和資訊能力', () => {
    const finance = BUSINESS_DEPARTMENTS[BusinessDepartment.FINANCE];

    expect(finance.weights.math).toBeGreaterThanOrEqual(35);
    expect(finance.weights.it).toBeGreaterThanOrEqual(15);
    expect(finance.weights.globalVision).toBeGreaterThanOrEqual(10);
  });

  it('國企系應該重視語文和國際視野', () => {
    const intlBusiness = BUSINESS_DEPARTMENTS[BusinessDepartment.INTERNATIONAL_BUSINESS];

    expect(intlBusiness.weights.language).toBeGreaterThanOrEqual(25);
    expect(intlBusiness.weights.globalVision).toBeGreaterThanOrEqual(25);
    expect(intlBusiness.thresholds.language).toBeGreaterThan(60);
  });

  it('行銷系應該重視溝通和創意', () => {
    const marketing = BUSINESS_DEPARTMENTS[BusinessDepartment.MARKETING];

    expect(marketing.weights.communication).toBeGreaterThanOrEqual(25);
    expect(marketing.weights.creativity).toBeGreaterThanOrEqual(25);
    expect(marketing.weights.math).toBeLessThan(25);
  });

  it('經濟系應該重視數學和邏輯', () => {
    const economics = BUSINESS_DEPARTMENTS[BusinessDepartment.ECONOMICS];

    expect(economics.weights.math).toBeGreaterThanOrEqual(30);
    expect(economics.weights.logic).toBeGreaterThanOrEqual(30);
    expect(economics.thresholds.math).toBeGreaterThan(60);
    expect(economics.thresholds.logic).toBeGreaterThan(60);
  });

  it('企管系應該重視領導和溝通', () => {
    const management = BUSINESS_DEPARTMENTS[BusinessDepartment.MANAGEMENT];

    expect(management.weights.leadership).toBeGreaterThanOrEqual(20);
    expect(management.weights.communication).toBeGreaterThanOrEqual(20);
  });

  it('資管系應該重視資訊能力', () => {
    const infoMgmt = BUSINESS_DEPARTMENTS[BusinessDepartment.INFORMATION_MANAGEMENT];

    expect(infoMgmt.weights.it).toBeGreaterThanOrEqual(35);
    expect(infoMgmt.weights.math).toBeGreaterThanOrEqual(25);
    expect(infoMgmt.weights.logic).toBeGreaterThanOrEqual(25);
  });
});

describe('商管群演算法 - 匹配度計算', () => {
  it('全能型學生應該在所有科系都有高匹配度', () => {
    const allStarProfile: BusinessProfile = {
      mathScore: 90,
      logicScore: 90,
      languageScore: 90,
      communicationScore: 90,
      creativityScore: 90,
      leadershipScore: 90,
      itScore: 90,
      globalVisionScore: 90
    };

    const matches = calculateAllBusinessMatches(allStarProfile);

    matches.forEach(match => {
      expect(match.matchScore).toBeGreaterThan(80);
      expect(match.riskLevel).toBe('low');
    });
  });

  it('數學弱但語文強的學生應該適合行銷系', () => {
    const languageStrongProfile: BusinessProfile = {
      mathScore: 40,
      logicScore: 50,
      languageScore: 85,
      communicationScore: 90,
      creativityScore: 85,
      leadershipScore: 70,
      itScore: 50,
      globalVisionScore: 60
    };

    const matches = calculateAllBusinessMatches(languageStrongProfile);
    const marketingMatch = matches.find(m => m.department === BusinessDepartment.MARKETING);

    expect(marketingMatch).toBeDefined();
    expect(marketingMatch!.matchScore).toBeGreaterThan(60);
    expect(marketingMatch!.strengths).toContain('語文能力符合需求');
    expect(marketingMatch!.strengths).toContain('創意思考符合需求');
  });

  it('數學和邏輯強的學生應該適合經濟系', () => {
    const mathStrongProfile: BusinessProfile = {
      mathScore: 95,
      logicScore: 90,
      languageScore: 60,
      communicationScore: 50,
      creativityScore: 60,
      leadershipScore: 50,
      itScore: 70,
      globalVisionScore: 60
    };

    const matches = calculateAllBusinessMatches(mathStrongProfile);
    const economicsMatch = matches.find(m => m.department === BusinessDepartment.ECONOMICS);

    expect(economicsMatch).toBeDefined();
    expect(economicsMatch!.matchScore).toBeGreaterThan(70);
    expect(economicsMatch!.strengths).toContain('數學能力符合需求');
    expect(economicsMatch!.strengths).toContain('邏輯思維符合需求');
  });

  it('低於門檻應該產生關注項目和風險', () => {
    const lowMathProfile: BusinessProfile = {
      mathScore: 30,
      logicScore: 70,
      languageScore: 70,
      communicationScore: 70,
      creativityScore: 70,
      leadershipScore: 70,
      itScore: 70,
      globalVisionScore: 70
    };

    const accountingMatch = calculateDepartmentMatch(
      lowMathProfile,
      BUSINESS_DEPARTMENTS[BusinessDepartment.ACCOUNTING]
    );

    expect(accountingMatch.concerns.some(c => c.includes('數學能力低於門檻'))).toBe(true);
    expect(accountingMatch.riskLevel).toBe('high');
  });

  it('應該正確計算加權分數', () => {
    const specificProfile: BusinessProfile = {
      mathScore: 80,
      logicScore: 70,
      languageScore: 60,
      communicationScore: 60,
      creativityScore: 60,
      leadershipScore: 60,
      itScore: 60,
      globalVisionScore: 60
    };

    const accountingMatch = calculateDepartmentMatch(
      specificProfile,
      BUSINESS_DEPARTMENTS[BusinessDepartment.ACCOUNTING]
    );

    // 會計系數學權重 35% 和邏輯權重 30%，所以應該有較高匹配度
    expect(accountingMatch.matchScore).toBeGreaterThan(65);
  });
});

describe('商管群演算法 - 排序和推薦', () => {
  it('匹配結果應該依匹配度排序', () => {
    const averageProfile: BusinessProfile = {
      mathScore: 60,
      logicScore: 60,
      languageScore: 60,
      communicationScore: 60,
      creativityScore: 60,
      leadershipScore: 60,
      itScore: 60,
      globalVisionScore: 60
    };

    const matches = calculateAllBusinessMatches(averageProfile);

    // 檢查是否按匹配度排序
    for (let i = 0; i < matches.length - 1; i++) {
      expect(matches[i].matchScore).toBeGreaterThanOrEqual(matches[i + 1].matchScore);
    }
  });

  it('應該產生有意義的推薦摘要', () => {
    const profile: BusinessProfile = {
      mathScore: 85,
      logicScore: 80,
      languageScore: 70,
      communicationScore: 65,
      creativityScore: 60,
      leadershipScore: 60,
      itScore: 65,
      globalVisionScore: 60
    };

    const matches = calculateAllBusinessMatches(profile);
    const summary = generateRecommendationSummary(matches);

    expect(summary).toContain('最推薦');
    expect(summary).toContain('匹配度');
    expect(summary.length).toBeGreaterThan(40);
  });

  it('低匹配度應該產生警告訊息', () => {
    const weakProfile: BusinessProfile = {
      mathScore: 30,
      logicScore: 30,
      languageScore: 30,
      communicationScore: 30,
      creativityScore: 30,
      leadershipScore: 30,
      itScore: 30,
      globalVisionScore: 30
    };

    const matches = calculateAllBusinessMatches(weakProfile);
    const summary = generateRecommendationSummary(matches);

    // 低匹配度應該建議謹慎評估
    expect(summary).toContain('謹慎評估');
  });
});

describe('商管群演算法 - 資料轉換', () => {
  it('應該正確轉換問卷答案為特質評分', () => {
    const answers = {
      math: 80,
      logic: 75,
      language: 70,
      communication: 65,
      creativity: 60,
      leadership: 55,
      it: 70,
      globalVision: 60
    };

    const profile = convertAnswersToProfile(answers);

    expect(profile.mathScore).toBe(80);
    expect(profile.logicScore).toBe(75);
    expect(profile.languageScore).toBe(70);
    expect(profile.communicationScore).toBe(65);
    expect(profile.creativityScore).toBe(60);
    expect(profile.leadershipScore).toBe(55);
    expect(profile.itScore).toBe(70);
    expect(profile.globalVisionScore).toBe(60);
  });

  it('缺少答案應該使用預設值 50', () => {
    const answers = {
      math: 80,
      logic: 75
      // 其他欄位缺少
    };

    const profile = convertAnswersToProfile(answers);

    expect(profile.mathScore).toBe(80);
    expect(profile.logicScore).toBe(75);
    expect(profile.languageScore).toBe(50); // 預設值
    expect(profile.communicationScore).toBe(50); // 預設值
  });
});

describe('商管群演算法 - 邊界情況', () => {
  it('滿分應該產生最高匹配度', () => {
    const perfectProfile: BusinessProfile = {
      mathScore: 100,
      logicScore: 100,
      languageScore: 100,
      communicationScore: 100,
      creativityScore: 100,
      leadershipScore: 100,
      itScore: 100,
      globalVisionScore: 100
    };

    const matches = calculateAllBusinessMatches(perfectProfile);

    matches.forEach(match => {
      expect(match.matchScore).toBe(100);
      expect(match.riskLevel).toBe('low');
    });
  });

  it('零分應該產生最低匹配度', () => {
    const zeroProfile: BusinessProfile = {
      mathScore: 0,
      logicScore: 0,
      languageScore: 0,
      communicationScore: 0,
      creativityScore: 0,
      leadershipScore: 0,
      itScore: 0,
      globalVisionScore: 0
    };

    const matches = calculateAllBusinessMatches(zeroProfile);

    matches.forEach(match => {
      expect(match.matchScore).toBeLessThan(30);
      expect(match.riskLevel).toBe('high');
    });
  });

  it('應該處理極端權重組合', () => {
    const extremeProfile: BusinessProfile = {
      mathScore: 100,
      logicScore: 100,
      languageScore: 0,
      communicationScore: 0,
      creativityScore: 0,
      leadershipScore: 0,
      itScore: 0,
      globalVisionScore: 0
    };

    const matches = calculateAllBusinessMatches(extremeProfile);

    // 數學和邏輯強但其他能力極弱的學生，在經濟系仍會有一定匹配度
    const economicsMatch = matches.find(m => m.department === BusinessDepartment.ECONOMICS);
    expect(economicsMatch!.matchScore).toBeGreaterThan(20);

    // 但在國企系、行銷系應該匹配度較低
    const intlBusinessMatch = matches.find(m => m.department === BusinessDepartment.INTERNATIONAL_BUSINESS);
    expect(intlBusinessMatch!.matchScore).toBeLessThan(50);
  });
});