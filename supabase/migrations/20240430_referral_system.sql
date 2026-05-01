-- Phase 4: Viral Mechanics - Referral System

-- Add referral code to student_profiles
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  reward_given BOOLEAN DEFAULT FALSE,
  reward_amount INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_student_referral_code ON student_profiles(referral_code);

-- Add share tracking
CREATE TABLE IF NOT EXISTS share_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  share_type TEXT NOT NULL,
  platform TEXT,
  share_url TEXT,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard for school competition
CREATE TABLE IF NOT EXISTS school_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  total_students INTEGER DEFAULT 0,
  total_achievements INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  ranking INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
