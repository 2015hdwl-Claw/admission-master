// Role XP System - 升學大師 v2.0 經驗值系統
// 目標：追蹤用戶在不同角色階段的成長，提供遊戲化學習體驗

import { createClient } from '@/lib/supabase/client'

// ====== 角色系統定義 ======

export type UserRole = 'Explorer' | 'Planner' | 'Guide'

export interface RoleLevel {
  level: number
  name: string
  xp_required: number
  xp_to_next: number
  benefits: string[]
}

export interface UserXPProgress {
  user_id: string
  current_role: UserRole
  current_level: number
  current_xp: number
  total_xp: number
  achievements: Achievement[]
  role_progress: Record<UserRole, RoleProgress>
}

export interface RoleProgress {
  role: UserRole
  unlocked: boolean
  current_level: number
  xp_earned: number
  completion_percentage: number
  started_at?: string
  completed_at?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  xp_reward: number
  unlocked_at: string
  category: 'discovery' | 'planning' | 'guidance' | 'milestone'
}

// ====== 角色等級定義 ======

const ROLE_LEVELS: Record<UserRole, RoleLevel[]> = {
  Explorer: [
    {
      level: 1,
      name: '新手探索者',
      xp_required: 0,
      xp_to_next: 100,
      benefits: ['基礎職群測驗', '6種升學管道介紹']
    },
    {
      level: 2,
      name: '進階探索者',
      xp_required: 100,
      xp_to_next: 250,
      benefits: ['職群深度探索', '個人化推薦']
    },
    {
      level: 3,
      name: '專家探索者',
      xp_required: 350,
      xp_to_next: 500,
      benefits: ['完整職群資料庫', '升學路徑模擬']
    },
    {
      level: 4,
      name: '探索大師',
      xp_required: 850,
      xp_to_next: 0,
      benefits: ['Guide 系統解鎖', '高級分析功能']
    }
  ],
  Planner: [
    {
      level: 1,
      name: '新手規劃師',
      xp_required: 0,
      xp_to_next: 150,
      benefits: ['能力中心基礎功能', '材料準備清單']
    },
    {
      level: 2,
      name: '進階規劃師',
      xp_required: 150,
      xp_to_next: 350,
      benefits: ['升學時間線規劃', '個人化策略建議']
    },
    {
      level: 3,
      name: '專家規劃師',
      xp_required: 500,
      xp_to_next: 700,
      benefits: ['申請文件審查', '面試準備模擬']
    },
    {
      level: 4,
      name: '規劃大師',
      xp_required: 1200,
      xp_to_next: 0,
      benefits: ['Guide 系統解鎖', '專家諮詢功能']
    }
  ],
  Guide: [
    {
      level: 1,
      name: '新手指導者',
      xp_required: 0,
      xp_to_next: 200,
      benefits: ['分享自己的經驗', '幫助學弟學妹']
    },
    {
      level: 2,
      name: '進階指導者',
      xp_required: 200,
      xp_to_next: 400,
      benefits: ['創建學習小組', '發表指導文章']
    },
    {
      level: 3,
      name: '專家指導者',
      xp_required: 600,
      xp_to_next: 800,
      benefits: ['指導權限解鎖', '社群管理功能']
    },
    {
      level: 4,
      name: '指導大師',
      xp_required: 1400,
      xp_to_next: 0,
      benefits: ['認證指導者', '專屬社群']
    }
  ]
}

// ====== 經驗值活動定義 ======

export interface XPActivity {
  id: string
  name: string
  description: string
  xp_reward: number
  category: 'discovery' | 'planning' | 'guidance' | 'daily' | 'milestone'
  role: UserRole
  max_daily?: number
}

const XP_ACTIVITIES: XPActivity[] = [
  // Discovery Activities
  {
    id: 'complete_quiz',
    name: '完成職群測驗',
    description: '第一次完成職群發現測驗',
    xp_reward: 50,
    category: 'discovery',
    role: 'Explorer'
  },
  {
    id: 'explore_3_groups',
    name: '探索3個職群',
    description: '深入探索至少3個不同職群',
    xp_reward: 30,
    category: 'discovery',
    role: 'Explorer'
  },
  {
    id: 'read_all_pathways',
    name: '閱讀所有升學管道',
    description: '完整閱讀6種升學管道的詳細介紹',
    xp_reward: 40,
    category: 'discovery',
    role: 'Explorer'
  },
  {
    id: 'first_discovery_complete',
    name: '完成第一次發現',
    description: '完成「第一次發現」頁面並了解適合的升學管道',
    xp_reward: 100,
    category: 'milestone',
    role: 'Explorer'
  },

  // Planning Activities
  {
    id: 'check_ability_center',
    name: '查看能力中心',
    description: '第一次查看Planner能力中心',
    xp_reward: 30,
    category: 'planning',
    role: 'Planner'
  },
  {
    id: 'add_material_item',
    name: '添加準備材料',
    description: '在材料準備清單中新增一項完成記錄',
    xp_reward: 15,
    category: 'planning',
    role: 'Planner'
  },
  {
    id: 'review_timeline',
    name: '查看升學時間線',
    description: '第一次查看升學路徑時間線',
    xp_reward: 25,
    category: 'planning',
    role: 'Planner'
  },
  {
    id: 'complete_preparation_step',
    name: '完成準備步驟',
    description: '完成個人申請準備的一個完整步驟',
    xp_reward: 50,
    category: 'milestone',
    role: 'Planner'
  },

  // Guidance Activities
  {
    id: 'help_peer',
    name: '幫助同學',
    description: '回答同學問題或提供升學建議',
    xp_reward: 20,
    category: 'guidance',
    role: 'Guide'
  },
  {
    id: 'share_experience',
    name: '分享經驗',
    description: '分享自己的申請或升學經驗',
    xp_reward: 40,
    category: 'guidance',
    role: 'Guide'
  },
  {
    id: 'create_study_group',
    name: '建立學習小組',
    description: '組織或參與升學準備學習小組',
    xp_reward: 60,
    category: 'milestone',
    role: 'Guide'
  },

  // Daily Activities
  {
    id: 'daily_login',
    name: '每日登入',
    description: '每天登入升學大師 v2.0',
    xp_reward: 10,
    category: 'daily',
    role: 'Explorer',
    max_daily: 1
  },
  {
    id: 'daily_explore',
    name: '每日探索',
    description: '每天查看職群或升學管道資訊',
    xp_reward: 5,
    category: 'daily',
    role: 'Explorer',
    max_daily: 3
  }
]

// ====== 核心系統功能 ======

export class RoleXPSystem {
  private supabase: any

  constructor() {
    this.supabase = createClient()
  }

  /**
   * 獲取用戶的XP進度
   */
  async getUserXPProgress(userId: string): Promise<UserXPProgress | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_xp_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user XP progress:', error)
        return null
      }

      return data as UserXPProgress
    } catch (error) {
      console.error('Error in getUserXPProgress:', error)
      return null
    }
  }

  /**
   * 初始化用戶XP進度（新用戶）
   */
  async initializeUserXP(userId: string): Promise<UserXPProgress> {
    const initialProgress: UserXPProgress = {
      user_id: userId,
      current_role: 'Explorer',
      current_level: 1,
      current_xp: 0,
      total_xp: 0,
      achievements: [],
      role_progress: {
        Explorer: {
          role: 'Explorer',
          unlocked: true,
          current_level: 1,
          xp_earned: 0,
          completion_percentage: 0,
          started_at: new Date().toISOString()
        },
        Planner: {
          role: 'Planner',
          unlocked: false,
          current_level: 0,
          xp_earned: 0,
          completion_percentage: 0
        },
        Guide: {
          role: 'Guide',
          unlocked: false,
          current_level: 0,
          xp_earned: 0,
          completion_percentage: 0
        }
      }
    }

    const { data, error } = await this.supabase
      .from('user_xp_progress')
      .insert(initialProgress)
      .select()
      .single()

    if (error) {
      console.error('Error initializing user XP:', error)
      throw error
    }

    return data as UserXPProgress
  }

  /**
   * 獲得經驗值
   */
  async gainXP(userId: string, activityId: string, quantity: number = 1): Promise<{ success: boolean; newXP: number; levelUp?: boolean }> {
    try {
      // 獲取活動定義
      const activity = XP_ACTIVITIES.find(a => a.id === activityId)
      if (!activity) {
        return { success: false, newXP: 0 }
      }

      // 檢查每日限制
      if (activity.max_daily) {
        const today = new Date().toISOString().split('T')[0]
        const { data: dailyLog, error: logError } = await this.supabase
          .from('xp_activity_log')
          .select('*')
          .eq('user_id', userId)
          .eq('activity_id', activityId)
          .eq('date', today)
          .limit(1)

        if (!logError && dailyLog && dailyLog.length > 0) {
          const currentCount = dailyLog[0].count || 0
          if (currentCount >= activity.max_daily) {
            return { success: false, newXP: 0 }
          }

          // 更新計數
          await this.supabase
            .from('xp_activity_log')
            .update({ count: currentCount + 1 })
            .eq('user_id', userId)
            .eq('activity_id', activityId)
            .eq('date', today)
        } else {
          // 創建日誌記錄
          await this.supabase
            .from('xp_activity_log')
            .insert({
              user_id: userId,
              activity_id: activityId,
              date: today,
              count: 1
            })
        }
      }

      // 獲取當前進度
      let progress = await this.getUserXPProgress(userId)
      if (!progress) {
        progress = await this.initializeUserXP(userId)
      }

      const xpGained = activity.xp_reward * quantity
      const newXP = progress.current_xp + xpGained
      const totalXP = progress.total_xp + xpGained

      // 檢查是否升級
      const roleLevels = ROLE_LEVELS[progress.current_role]
      const currentLevelData = roleLevels.find(l => l.level === progress.current_level)
      const nextLevelData = roleLevels.find(l => l.level === progress.current_level + 1)

      let levelUp = false
      let newLevel = progress.current_level

      if (nextLevelData && newXP >= nextLevelData.xp_required) {
        newLevel = nextLevelData.level
        levelUp = true

        // 解鎖下一角色
        if (newLevel === 4) {
          const nextRole: UserRole = progress.current_role === 'Explorer' ? 'Planner' :
                                progress.current_role === 'Planner' ? 'Guide' : 'Guide'
          progress.role_progress[nextRole] = {
            role: nextRole,
            unlocked: true,
            current_level: 1,
            xp_earned: 0,
            completion_percentage: 0,
            started_at: new Date().toISOString()
          }
        }
      }

      // 更新角色進度
      progress.role_progress[progress.current_role].current_level = newLevel
      progress.role_progress[progress.current_role].xp_earned += xpGained
      progress.role_progress[progress.current_role].completion_percentage =
        Math.min(100, (progress.role_progress[progress.current_role].xp_earned / 1400) * 100)

      // 更新用戶進度
      const { error: updateError } = await this.supabase
        .from('user_xp_progress')
        .update({
          current_level: newLevel,
          current_xp: newXP,
          total_xp: totalXP,
          role_progress: progress.role_progress,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating user XP:', updateError)
        return { success: false, newXP: 0 }
      }

      // 記錄XP獲得歷史
      await this.supabase
        .from('xp_history')
        .insert({
          user_id: userId,
          activity_id: activityId,
          activity_name: activity.name,
          xp_gained: xpGained,
          role: progress.current_role,
          created_at: new Date().toISOString()
        })

      return {
        success: true,
        newXP,
        levelUp
      }
    } catch (error) {
      console.error('Error in gainXP:', error)
      return { success: false, newXP: 0 }
    }
  }

  /**
   * 解鎖新角色
   */
  async unlockRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const progress = await this.getUserXPProgress(userId)
      if (!progress) {
        return false
      }

      // 檢查是否可以解鎖
      if (role === 'Planner') {
        const explorerProgress = progress.role_progress.Explorer
        if (explorerProgress.current_level < 4) {
          return false
        }
      } else if (role === 'Guide') {
        const plannerProgress = progress.role_progress.Planner
        if (!plannerProgress.unlocked || plannerProgress.current_level < 4) {
          return false
        }
      }

      // 解鎖角色
      progress.role_progress[role] = {
        role: role,
        unlocked: true,
        current_level: 1,
        xp_earned: 0,
        completion_percentage: 0,
        started_at: new Date().toISOString()
      }

      const { error } = await this.supabase
        .from('user_xp_progress')
        .update({
          current_role: role,
          current_level: 1,
          role_progress: progress.role_progress,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      return !error
    } catch (error) {
      console.error('Error in unlockRole:', error)
      return false
    }
  }

  /**
   * 獲取用戶當前等級資訊
   */
  async getCurrentLevelInfo(userId: string): Promise<{ level: RoleLevel | null; progress: UserXPProgress | null }> {
    try {
      const progress = await this.getUserXPProgress(userId)
      if (!progress) {
        return { level: null, progress: null }
      }

      const roleLevels = ROLE_LEVELS[progress.current_role]
      const level = roleLevels.find(l => l.level === progress.current_level) || null

      return { level, progress }
    } catch (error) {
      console.error('Error in getCurrentLevelInfo:', error)
      return { level: null, progress: null }
    }
  }

  /**
   * 獲取可用活動列表
   */
  getAvailableActivities(role?: UserRole): XPActivity[] {
    if (role) {
      return XP_ACTIVITIES.filter(a => a.role === role)
    }
    return XP_ACTIVITIES
  }

  /**
   * 檢查成就解鎖狀態
   */
  async checkAchievement(userId: string, achievementId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .limit(1)

      if (error || !data || data.length === 0) {
        return false
      }

      return true
    } catch (error) {
      console.error('Error in checkAchievement:', error)
      return false
    }
  }

  /**
   * 解鎖成就
   */
  async unlockAchievement(userId: string, achievement: Achievement): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          achievement_name: achievement.name,
          achievement_description: achievement.description,
          unlocked_at: new Date().toISOString()
        })

      // 同時獲得成就獎勵XP
      await this.gainXP(userId, `achievement_${achievement.id}`, 1)

      return !error
    } catch (error) {
      console.error('Error in unlockAchievement:', error)
      return false
    }
  }

  /**
   * 獲取排行榜
   */
  async getLeaderboard(role?: UserRole, limit: number = 10): Promise<any[]> {
    try {
      let query = this.supabase
        .from('user_xp_progress')
        .select('user_id, current_role, current_level, total_xp')
        .order('total_xp', { ascending: false })
        .limit(limit)

      if (role) {
        query = query.eq('current_role', role)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching leaderboard:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getLeaderboard:', error)
      return []
    }
  }
}

// ====== 導出函數 ======

export async function getUserRoleLevel(userId: string): Promise<{ role: UserRole; level: number; name: string } | null> {
  const xpSystem = new RoleXPSystem()
  const { level, progress } = await xpSystem.getCurrentLevelInfo(userId)

  if (!level || !progress) {
    return null
  }

  return {
    role: progress.current_role,
    level: level.level,
    name: level.name
  }
}

export async function addXPToUser(userId: string, activityId: string, quantity: number = 1): Promise<boolean> {
  const xpSystem = new RoleXPSystem()
  const result = await xpSystem.gainXP(userId, activityId, quantity)
  return result.success
}

export async function checkRoleUnlock(userId: string, role: UserRole): Promise<boolean> {
  const xpSystem = new RoleXPSystem()
  return await xpSystem.unlockRole(userId, role)
}

export async function getActivityList(role?: UserRole): Promise<XPActivity[]> {
  const xpSystem = new RoleXPSystem()
  return xpSystem.getAvailableActivities(role)
}

// ====== 成就定義 ======

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_discovery',
    name: '第一次發現',
    description: '完成「第一次發現」頁面',
    xp_reward: 100,
    unlocked_at: '',
    category: 'discovery'
  },
  {
    id: 'quiz_master',
    name: '測驗大師',
    description: '完成職群測驗並獲得高相關度結果',
    xp_reward: 150,
    unlocked_at: '',
    category: 'milestone'
  },
  {
    id: 'pathway_explorer',
    name: '管道探索者',
    description: '深入探索至少3種升學管道',
    xp_reward: 120,
    unlocked_at: '',
    category: 'discovery'
  },
  {
    id: 'material_ready',
    name: '材料準備完成',
    description: '完成所有必要的申請材料準備',
    xp_reward: 200,
    unlocked_at: '',
    category: 'planning'
  },
  {
    id: 'timeline_master',
    name: '時間掌握者',
    description: '完成所有升學時間線的重要節點',
    xp_reward: 180,
    unlocked_at: '',
    category: 'planning'
  },
  {
    id: 'helpful_peer',
    name: '熱心同學',
    description: '幫助5位同學解答升學問題',
    xp_reward: 150,
    unlocked_at: '',
    category: 'guidance'
  },
  {
    id: 'guide_unlock',
    name: '指導者覺醒',
    description: '解鎖Guide角色系統',
    xp_reward: 300,
    unlocked_at: '',
    category: 'milestone'
  }
]

export default RoleXPSystem