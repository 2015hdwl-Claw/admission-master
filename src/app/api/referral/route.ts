import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, referredBy, referralCode } = body;

    // Generate unique referral code
    const generateReferralCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    // Check if referral code exists and is valid
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('student_profiles')
        .select('id, referral_code')
        .eq('referral_code', referralCode)
        .single();

      if (referrer) {
        // Award XP to referrer
        // 暫時跳過 raw SQL 更新，使用簡單的方式
        const { data: referrerProfile } = await supabase
          .from('student_profiles')
          .select('warmth_points')
          .eq('id', (referrer as any).id)
          .single();

        if (referrerProfile) {
          const newWarmthPoints = ((referrerProfile as any).warmth_points || 0) + 50;
          await supabase
            .from('student_profiles')
            .update({ warmth_points: newWarmthPoints } as any)
            .eq('id', (referrer as any).id);
        }

        // Track referral
        await supabase
          .from('referrals')
          .insert({
            referrer_id: (referrer as any).id,
            referred_id: studentId,
            reward_given: true,
            reward_amount: 50
          } as any);
      }
    }

    // Create referral code for new user
    const newReferralCode = generateReferralCode();
    await supabase
      .from('student_profiles')
      .update({ referral_code: newReferralCode })
      .eq('id', studentId);

    return NextResponse.json({
      success: true,
      referralCode: newReferralCode,
      referralReward: referralCode ? 50 : 0 // Sign-up bonus if referred
    });

  } catch (error) {
    console.error('Referral processing failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process referral' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const referralCode = searchParams.get('code');

    if (!referralCode) {
      return NextResponse.json(
        { success: false, error: 'Referral code required' },
        { status: 400 }
      );
    }

    // Get referrer info
    const { data: referrer } = await supabase
      .from('student_profiles')
      .select('id, display_name, total_records, warmth_points')
      .eq('referral_code', referralCode)
      .single();

    if (!referrer) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Count successful referrals
    const { data: referralCount } = await supabase
      .from('referrals')
      .select('id', { count: 'exact' })
      .eq('referrer_id', referrer.id);

    return NextResponse.json({
      success: true,
      referrer: {
        displayName: referrer.display_name,
        achievements: referrer.total_records,
        points: referrer.warmth_points
      },
      totalReferrals: referralCount?.length || 0,
      rewardPerReferral: 50
    });

  } catch (error) {
    console.error('Referral lookup failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to lookup referral' },
      { status: 500 }
    );
  }
}
