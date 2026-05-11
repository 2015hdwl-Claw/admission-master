export interface DepartmentRequirements {
  id: string;
  university_code: string;
  department_code: string;
  academic_year: number;
  admission_group: string;

  min_total_score?: number;
  min_chinese_score?: number;
  min_english_score?: number;
  min_math_score?: number;
  min_science_score?: number;
  min_social_score?: number;

  chinese_weight: number;
  english_weight: number;
  math_weight: number;
  science_weight: number;
  social_weight: number;

  required_subjects?: string[];
  recommended_subjects?: string[];
  minimum_grade_requirement?: Record<string, any>;
  special_conditions?: string[];

  last_year_lowest_rank?: number;
  last_year_lowest_score?: number;
  estimated_acceptance_rate?: number;

  created_at: string;
  updated_at: string;
}

export interface DepartmentRequirementFilter {
  university_code?: string;
  department_code?: string;
  academic_year?: number;
  admission_group?: string;
  min_total_score?: number;
}

export interface WeightedScoreCalculation {
  total_score: number;
  weighted_total: number;
  subject_scores: Record<string, number>;
  weighted_subjects: Record<string, number>;
}
