/**
 * 升學大師 v5.0 - 商管群演算法使用範例
 *
 * 這個檔案展示如何使用商管群匹配度演算法
 */

import {
  calculateAllBusinessMatches,
  calculateDepartmentMatch,
  convertAnswersToProfile,
  generateRecommendationSummary,
  BUSINESS_DEPARTMENTS,
  BusinessDepartment,
  type BusinessProfile,
  type DepartmentMatch
} from '../scoring-algorithm';

// ============================================
// 範例 1: 基礎使用 - 全能型學生
// ============================================

function example1_AllRoundStudent() {
  console.log('🎓 範例 1: 全能型學生');
  console.log('=====================================');

  const allRoundProfile: BusinessProfile = {
    mathScore: 85,
    logicScore: 80,
    languageScore: 75,
    communicationScore: 70,
    creativityScore: 70,
    leadershipScore: 65,
    itScore: 70,
    globalVisionScore: 65
  };

  const matches = calculateAllBusinessMatches(allRoundProfile);

  // 顯示前 3 名推薦
  console.log('\n🏆 推薦科系排名：');
  matches.slice(0, 3).forEach((match, index) => {
    console.log(`\n${index + 1}. ${match.name}（匹配度 ${match.matchScore}%）`);
    console.log(`   風險等級：${match.riskLevel}`);
    console.log(`   優勢：${match.strengths.join('、')}`);
  });

  // 顯示推薦摘要
  console.log('\n📋 推薦摘要：');
  console.log(generateRecommendationSummary(matches));
}

// ============================================
// 範例 2: 數理強但語文弱的學生
// ============================================

function example2_MathStrongStudent() {
  console.log('\n\n🎓 範例 2: 數理強但語文弱的學生');
  console.log('=====================================');

  const mathStrongProfile: BusinessProfile = {
    mathScore: 95,
    logicScore: 90,
    languageScore: 45,
    communicationScore: 50,
    creativityScore: 55,
    leadershipScore: 50,
    itScore: 70,
    globalVisionScore: 55
  };

  const matches = calculateAllBusinessMatches(mathStrongProfile);

  // 分析最推薦的科系
  const topMatch = matches[0];
  console.log(`\n🎯 最推薦：${topMatch.name}（匹配度 ${topMatch.matchScore}%）`);

  // 查看經濟系的詳細分析
  const economicsMatch = calculateDepartmentMatch(
    mathStrongProfile,
    BUSINESS_DEPARTMENTS[BusinessDepartment.ECONOMICS]
  );

  console.log('\n📊 經濟學系詳細分析：');
  console.log(`匹配度：${economicsMatch.matchScore}%`);
  console.log(`風險等級：${economicsMatch.riskLevel}`);
  console.log(`優勢：${economicsMatch.strengths.join('、')}`);
  console.log(`關注：${economicsMatch.concerns.join('、')}`);
  console.log(`建議：${economicsMatch.recommendations.join('、')}`);
}

// ============================================
// 範例 3: 語文和溝通強的學生
// ============================================

function example3_LanguageStrongStudent() {
  console.log('\n\n🎓 範例 3: 語文和溝通強的學生');
  console.log('=====================================');

  const languageStrongProfile: BusinessProfile = {
    mathScore: 50,
    logicScore: 55,
    languageScore: 90,
    communicationScore: 95,
    creativityScore: 80,
    leadershipScore: 75,
    itScore: 55,
    globalVisionScore: 70
  };

  const matches = calculateAllBusinessMatches(languageStrongProfile);

  // 查看行銷系和國企系的匹配度
  const marketingMatch = matches.find(m => m.department === BusinessDepartment.MARKETING);
  const intlBusinessMatch = matches.find(m => m.department === BusinessDepartment.INTERNATIONAL_BUSINESS);

  console.log('\n📊 適合科系分析：');
  console.log(`\n行銷學系：${marketingMatch!.matchScore}%（${marketingMatch!.riskLevel}風險）`);
  console.log(`  優勢：${marketingMatch!.strengths.join('、')}`);

  console.log(`\n國際企業學系：${intlBusinessMatch!.matchScore}%（${intlBusinessMatch!.riskLevel}風險）`);
  console.log(`  優勢：${intlBusinessMatch!.strengths.join('、')}`);
}

// ============================================
// 範例 4: 從問卷答案轉換
// ============================================

function example4_FromQuestionnaire() {
  console.log('\n\n🎓 範例 4: 從問卷答案轉換');
  console.log('=====================================');

  // 模擬問卷答案（實際應該從前端表單取得）
  const questionnaireAnswers = {
    math: 75,
    logic: 70,
    language: 80,
    communication: 85,
    creativity: 65,
    leadership: 60,
    it: 70,
    globalVision: 55
  };

  // 轉換為特質評分
  const profile = convertAnswersToProfile(questionnaireAnswers);

  console.log('\n📋 學生特質評分：');
  console.log(`數學能力：${profile.mathScore}`);
  console.log(`邏輯思維：${profile.logicScore}`);
  console.log(`語文能力：${profile.languageScore}`);
  console.log(`溝通表達：${profile.communicationScore}`);
  console.log(`創意思考：${profile.creativityScore}`);
  console.log(`領導能力：${profile.leadershipScore}`);
  console.log(`資訊能力：${profile.itScore}`);
  console.log(`國際視野：${profile.globalVisionScore}`);

  // 計算匹配度
  const matches = calculateAllBusinessMatches(profile);
  console.log('\n🎯 推薦結果：');
  console.log(generateRecommendationSummary(matches));
}

// ============================================
// 範例 5: 風險評估範例
// ============================================

function example5_RiskAssessment() {
  console.log('\n\n🎓 範例 5: 風險評估範例');
  console.log('=====================================');

  const lowMathProfile: BusinessProfile = {
    mathScore: 30,
    logicScore: 65,
    languageScore: 70,
    communicationScore: 75,
    creativityScore: 70,
    leadershipScore: 65,
    itScore: 60,
    globalVisionScore: 60
  };

  console.log('\n⚠️  數學能力弱的學生分析：');

  // 測試對數學要求高的科系
  const accountingMatch = calculateDepartmentMatch(
    lowMathProfile,
    BUSINESS_DEPARTMENTS[BusinessDepartment.ACCOUNTING]
  );

  const marketingMatch = calculateDepartmentMatch(
    lowMathProfile,
    BUSINESS_DEPARTMENTS[BusinessDepartment.MARKETING]
  );

  console.log(`\n會計學系（數學要求高）：`);
  console.log(`匹配度：${accountingMatch.matchScore}% - ${accountingMatch.riskLevel}風險`);
  console.log(`關注項目：${accountingMatch.concerns.join('、')}`);

  console.log(`\n行銷學系（數學要求低）：`);
  console.log(`匹配度：${marketingMatch.matchScore}% - ${marketingMatch.riskLevel}風險`);
  console.log(`優勢：${marketingMatch.strengths.join('、')}`);
}

// ============================================
// 執行所有範例
// ============================================

export function runAllExamples() {
  console.log('🚀 升學大師 v5.0 - 商管群演算法使用範例');
  console.log('================================================');

  example1_AllRoundStudent();
  example2_MathStrongStudent();
  example3_LanguageStrongStudent();
  example4_FromQuestionnaire();
  example5_RiskAssessment();

  console.log('\n\n✅ 所有範例執行完成！');
}

// 如果直接執行這個檔案，運行所有範例
// 在 Next.js 環境中不使用 import.meta.main
// runAllExamples();