// Parent Service API
// Handles all parent-related operations including invitations, reports, and payments

import { supabase } from './supabase'

export interface ParentInvite {
  id: string
  student_id: string
  parent_id: string | null
  invite_code: string
  can_view_portfolio: boolean
  can_view_timeline: boolean
  can_view_achievements: boolean
  status: 'pending' | 'accepted' | 'revoked'
  created_at: string
  updated_at: string
  expires_at: string
}

export interface ParentProfile {
  id: string
  user_id: string | null
  student_id: string
  relationship: '父親' | '母親' | '監護人' | '其他'
  display_name: string | null
  phone: string | null
  notification_preferences: any
  language: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ParentReport {
  id: string
  student_id: string
  parent_id: string
  report_type: 'weekly' | 'monthly' | 'custom'
  content: any
  summary: string | null
  is_paid: boolean
  price: number
  payment_status: 'free' | 'pending' | 'paid' | 'failed'
  include_portfolio: boolean
  include_timeline: boolean
  include_achievements: boolean
  include_ai_insights: boolean
  share_token: string | null
  share_expires_at: string | null
  share_count: number
  last_viewed_at: string | null
  generated_at: string
  created_at: string
  updated_at: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string | null
  template_type: 'weekly' | 'monthly' | 'custom'
  sections: any
  styling: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ParentPayment {
  id: string
  report_id: string
  parent_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: 'line_pay' | 'credit_card' | 'bank_transfer' | 'offline' | null
  external_transaction_id: string | null
  metadata: any
  created_at: string
  updated_at: string
  completed_at: string | null
}

// ============================================
// Parent Invitation Functions
// ============================================

export async function createParentInvite(
  studentId: string,
  permissions: {
    can_view_portfolio?: boolean
    can_view_timeline?: boolean
    can_view_achievements?: boolean
  } = {}
): Promise<ParentInvite | null> {
  try {
    const { data, error } = await supabase
      .rpc('generate_invite_code')
      .then(async ({ data: inviteCode, error: codeError }) => {
        if (codeError) throw codeError
        
        return supabase
          .from('parent_invites')
          .insert({
            student_id: studentId,
            invite_code: inviteCode,
            can_view_portfolio: permissions.can_view_portfolio ?? true,
            can_view_timeline: permissions.can_view_timeline ?? true,
            can_view_achievements: permissions.can_view_achievements ?? true,
            status: 'pending',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single()
      })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating parent invite:', error)
    return null
  }
}

export async function getParentInvites(studentId: string): Promise<ParentInvite[]> {
  try {
    const { data, error } = await supabase
      .from('parent_invites')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting parent invites:', error)
    return []
  }
}

export async function validateInviteCode(inviteCode: string): Promise<ParentInvite | null> {
  try {
    const { data, error } = await supabase
      .from('parent_invites')
      .select('*')
      .eq('invite_code', inviteCode)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error validating invite code:', error)
    return null
  }
}

export async function acceptParentInvite(
  inviteCode: string,
  parentUserId: string,
  parentData: {
    relationship: '父親' | '母親' | '監護人' | '其他'
    display_name?: string
    phone?: string
  }
): Promise<ParentProfile | null> {
  try {
    const invite = await validateInviteCode(inviteCode)
    if (!invite) return null

    const { data: profile, error: profileError } = await supabase
      .from('parent_profiles')
      .insert({
        user_id: parentUserId,
        student_id: invite.student_id,
        relationship: parentData.relationship,
        display_name: parentData.display_name || null,
        phone: parentData.phone || null,
        is_active: true
      })
      .select()
      .single()

    if (profileError) throw profileError

    const { error: updateError } = await supabase
      .from('parent_invites')
      .update({
        parent_id: parentUserId,
        status: 'accepted'
      })
      .eq('invite_code', inviteCode)

    if (updateError) throw updateError

    return profile
  } catch (error) {
    console.error('Error accepting parent invite:', error)
    return null
  }
}

export async function revokeParentInvite(inviteId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('parent_invites')
      .update({ status: 'revoked' })
      .eq('id', inviteId)

    return !error
  } catch (error) {
    console.error('Error revoking parent invite:', error)
    return false
  }
}

// ============================================
// Parent Report Functions
// ============================================

export async function generateParentReport(
  studentId: string,
  parentId: string,
  reportType: 'weekly' | 'monthly' | 'custom',
  options: {
    include_portfolio?: boolean
    include_timeline?: boolean
    include_achievements?: boolean
    include_ai_insights?: boolean
  } = {}
): Promise<ParentReport | null> {
  try {
    // Get pricing information
    const { data: pricing } = await supabase
      .rpc('calculate_report_price', {
        p_parent_id: parentId,
        p_report_type: reportType
      })

    // Get report template
    const { data: template } = await supabase
      .from('report_templates')
      .select('*')
      .eq('template_type', reportType)
      .eq('is_active', true)
      .single()

    // Generate share token
    const shareToken = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const shareExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: report, error } = await supabase
      .from('parent_reports')
      .insert({
        student_id: studentId,
        parent_id: parentId,
        report_type: reportType,
        content: template?.sections || {},
        include_portfolio: options.include_portfolio ?? true,
        include_timeline: options.include_timeline ?? true,
        include_achievements: options.include_achievements ?? true,
        include_ai_insights: options.include_ai_insights ?? true,
        is_paid: pricing?.is_free ?? true,
        price: pricing?.price ?? 0,
        payment_status: pricing?.is_free ? 'free' : 'pending',
        share_token: shareToken,
        share_expires_at: shareExpiresAt,
        generated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return report
  } catch (error) {
    console.error('Error generating parent report:', error)
    return null
  }
}

export async function getParentReports(parentId: string): Promise<ParentReport[]> {
  try {
    const { data, error } = await supabase
      .from('parent_reports')
      .select('*')
      .eq('parent_id', parentId)
      .order('generated_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting parent reports:', error)
    return []
  }
}

export async function getReportByShareToken(shareToken: string): Promise<ParentReport | null> {
  try {
    const { data, error } = await supabase
      .from('parent_reports')
      .select('*')
      .eq('share_token', shareToken)
      .gte('share_expires_at', new Date().toISOString())
      .single()

    if (error) throw error

    // Update view count
    await supabase
      .from('parent_reports')
      .update({
        share_count: (data?.share_count || 0) + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', data?.id)

    return data
  } catch (error) {
    console.error('Error getting report by share token:', error)
    return null
  }
}

// ============================================
// Payment Functions
// ============================================

export async function createPayment(
  reportId: string,
  amount: number,
  paymentMethod: 'line_pay' | 'credit_card' | 'bank_transfer' | 'offline'
): Promise<ParentPayment | null> {
  try {
    const report = await supabase
      .from('parent_reports')
      .select('parent_id')
      .eq('id', reportId)
      .single()

    if (!report.data) return null

    const { data: payment, error } = await supabase
      .from('parent_payments')
      .insert({
        report_id: reportId,
        parent_id: report.data.parent_id,
        amount: amount,
        currency: 'TWD',
        status: 'pending',
        payment_method: paymentMethod
      })
      .select()
      .single()

    if (error) throw error
    return payment
  } catch (error) {
    console.error('Error creating payment:', error)
    return null
  }
}

export async function completePayment(
  paymentId: string,
  externalTransactionId?: string
): Promise<boolean> {
  try {
    const { data: payment } = await supabase
      .from('parent_payments')
      .select('report_id')
      .eq('id', paymentId)
      .single()

    // Update payment status
    await supabase
      .from('parent_payments')
      .update({
        status: 'completed',
        external_transaction_id: externalTransactionId || null,
        completed_at: new Date().toISOString()
      })
      .eq('id', paymentId)

    // Update report payment status
    if (payment?.report_id) {
      await supabase
        .from('parent_reports')
        .update({
          payment_status: 'paid',
          is_paid: true
        })
        .eq('id', payment.report_id)
    }

    return true
  } catch (error) {
    console.error('Error completing payment:', error)
    return false
  }
}

export async function getParentPaymentHistory(parentId: string): Promise<ParentPayment[]> {
  try {
    const { data, error } = await supabase
      .from('parent_payments')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting payment history:', error)
    return []
  }
}
