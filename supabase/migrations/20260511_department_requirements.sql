-- 科系入學要求資料表
CREATE TABLE department_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_code TEXT NOT NULL,
    department_code TEXT NOT NULL,
    academic_year INTEGER NOT NULL,
    admission_group TEXT NOT NULL,

    -- 成績門檻
    min_total_score NUMERIC(5,2),
    min_chinese_score NUMERIC(4,2),
    min_english_score NUMERIC(4,2),
    min_math_score NUMERIC(4,2),
    min_science_score NUMERIC(4,2),
    min_social_score NUMERIC(4,2),

    -- 加權比例
    chinese_weight NUMERIC(3,2) DEFAULT 1.00,
    english_weight NUMERIC(3,2) DEFAULT 1.00,
    math_weight NUMERIC(3,2) DEFAULT 1.00,
    science_weight NUMERIC(3,2) DEFAULT 1.00,
    social_weight NUMERIC(3,2) DEFAULT 1.00,

    -- 額外要求
    required_subjects TEXT[],
    recommended_subjects TEXT[],
    minimum_grade_requirement JSONB,
    special_conditions TEXT[],

    -- 錄取數據
    last_year_lowest_rank INTEGER,
    last_year_lowest_score NUMERIC(5,2),
    estimated_acceptance_rate NUMERIC(4,2),

    -- 中繼資料
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(university_code, department_code, academic_year, admission_group)
);

-- 建立索引
CREATE INDEX idx_department_requirements_university ON department_requirements(university_code);
CREATE INDEX idx_department_requirements_department ON department_requirements(department_code);
CREATE INDEX idx_department_requirements_year ON department_requirements(academic_year);
CREATE INDEX idx_department_requirements_group ON department_requirements(admission_group);

-- 啟用 RLS
ALTER TABLE department_requirements ENABLE ROW LEVEL SECURITY;

-- 公開讀取權限
CREATE POLICY "Anyone can view department requirements" ON department_requirements
    FOR SELECT USING (true);

-- 更新時間觸發器
CREATE TRIGGER update_department_requirements_modtime
    BEFORE UPDATE ON department_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
