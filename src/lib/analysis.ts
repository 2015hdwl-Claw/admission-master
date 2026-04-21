import type { ScoreInput, ScoreAnalysis, RecommendedPathway, RecommendedDepartment } from '@/types';
import { ADMISSION_PATHWAYS } from '@/data/admission';

function getScoreLevel(total: number): 'top' | 'high' | 'mid' | 'base' {
  if (total >= 55) return 'top';
  if (total >= 45) return 'high';
  if (total >= 35) return 'mid';
  return 'base';
}

function getPercentile(total: number): number {
  if (total >= 65) return 99.5;
  if (total >= 60) return 98;
  if (total >= 55) return 95;
  if (total >= 50) return 90;
  if (total >= 45) return 80;
  if (total >= 40) return 65;
  if (total >= 35) return 50;
  if (total >= 30) return 35;
  if (total >= 25) return 20;
  return 10;
}

function analyzePathways(total: number): RecommendedPathway[] {
  const level = getScoreLevel(total);
  return ADMISSION_PATHWAYS
    .filter(p => p.slug !== 'tech-exam')
    .map(p => {
      const range = p.scoreRanges[level];
      const matchScore = Math.min(100, Math.max(20,
        total >= (range.total + 5) ? 95 :
        total >= range.total ? 80 :
        total >= (range.total - 5) ? 60 : 30
      ));
      return {
        name: p.name,
        slug: p.slug,
        matchScore,
        description: range.description
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

function suggestDepartments(total: number, scores: ScoreInput): RecommendedDepartment[] {
  const suggestions: RecommendedDepartment[] = [];
  const level = getScoreLevel(total);

  if (scores.math === 15 && scores.science >= 13) {
    suggestions.push(
      { university: '國立台灣大學', department: '電機工程學系', category: '工程學群', matchScore: 95, note: '數學自然頂標' },
      { university: '國立清華大學', department: '資訊工程學系', category: '工程學群', matchScore: 90, note: '數學自然頂標' },
      { university: '國立交通大學', department: '電子工程學系', category: '工程學群', matchScore: 88, note: '數學自然頂標' }
    );
  }

  if (scores.chinese >= 13 && scores.english >= 13) {
    suggestions.push(
      { university: '國立台灣大學', department: '法律學系', category: '法政學群', matchScore: 90, note: '國英頂標' },
      { university: '國立政治大學', department: '傳播學院', category: '傳播學群', matchScore: 85, note: '國英頂標' }
    );
  }

  if (scores.science >= 14 && scores.math >= 14) {
    suggestions.push(
      { university: '國立台灣大學', department: '醫學系', category: '醫學學群', matchScore: 98, note: '數理均滿級分，醫學系門檻' },
      { university: '國立陽明交通大學', department: '醫學系', category: '醫學學群', matchScore: 90, note: '醫學系第二志願' }
    );
  }

  if (total >= 45 && total < 55) {
    suggestions.push(
      { university: '國立成功大學', department: '建築學系', category: '設計學群', matchScore: 80, note: '成大建築，設計類熱門' },
      { university: '國立台灣師範大學', department: '英語學系', category: '外語學群', matchScore: 78, note: '師大英語，教育類熱門' },
      { university: '國立中央大學', department: '資訊工程學系', category: '工程學群', matchScore: 75, note: '中大資工' }
    );
  }

  if (total >= 35 && total < 45) {
    suggestions.push(
      { university: '國立中興大學', department: '農業科學院', category: '生命科學', matchScore: 70, note: '中興農學，全台頂尖' },
      { university: '國立中山大學', department: '企業管理學系', category: '商管學群', matchScore: 68, note: '中山企管' },
      { university: '國立中正大學', department: '電機工程學系', category: '工程學群', matchScore: 65, note: '中正電機' }
    );
  }

  if (total < 35) {
    suggestions.push(
      { university: '淡江大學', department: '資訊工程學系', category: '工程學群', matchScore: 60, note: '私立名校' },
      { university: '逢甲大學', department: '資訊工程學系', category: '工程學群', matchScore: 58, note: '私立資工熱門' },
      { university: '元智大學', department: '電機工程學系', category: '工程學群', matchScore: 55, note: '私立電機' }
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      { university: '國立台灣大學', department: '多種科系', category: '綜合', matchScore: 80, note: '高分全科系皆可嘗試' }
    );
  }

  return suggestions.slice(0, 6);
}

function generateSummary(total: number, scores: ScoreInput, pathways: RecommendedPathway[]): string {
  const topPathway = pathways[0];
  const level = getScoreLevel(total);

  const strengthLabels: string[] = [];
  if (scores.chinese >= 14) strengthLabels.push('國文');
  if (scores.english >= 14) strengthLabels.push('英文');
  if (scores.math >= 14) strengthLabels.push('數學');
  if (scores.science >= 14) strengthLabels.push('自然');
  if (scores.social >= 14) strengthLabels.push('社會');

  const strengthStr = strengthLabels.length > 0
    ? `你的強項是${strengthLabels.join('、')}。`
    : '各科表現均衡。';

  const levelDescriptions: Record<string, string> = {
    top: '你的成績非常優異，幾乎所有科系都在你的選擇範圍內！',
    high: '你的成績優秀，國立大學大多數科系都很有機會。',
    mid: '你的成績穩定，國立大學普通科系和私立名校都有不錯的機會。',
    base: '你的成績還有進步空間，專注提升弱科會讓你有更多選擇。'
  };

  return `${levelDescriptions[level]} ${strengthStr}根據你的分數，最推薦走「${topPathway.name}」管道，${topPathway.description}。繼續加油，升學路上一路順利！`;
}

export function analyzeScores(input: ScoreInput): ScoreAnalysis {
  const total = input.chinese + input.english + input.math + input.science + input.social;
  const average = total / 5;
  const percentile = getPercentile(total);
  const recommendedPathways = analyzePathways(total);
  const recommendedDepartments = suggestDepartments(total, input);
  const summary = generateSummary(total, input, recommendedPathways);

  return {
    scores: input,
    total,
    average,
    percentile,
    recommendedPathways,
    recommendedDepartments,
    summary
  };
}
