// V4 Type Definitions

export interface GroupKnowledge {
  id?: string;
  group_code: string;
  group_name: string;
  description: string;
  certificate_types?: any[];
  structural_advantages?: string[];
  structural_challenges?: string[];
  key_certificates?: string[];
  key_competitions?: string[];
  career_paths?: any[];
  cross_group_opportunities?: string[];
  annual_quota?: number;
  popular_pathways?: string[];
  [key: string]: any; // Allow additional properties
}
