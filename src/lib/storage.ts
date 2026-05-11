// 資料庫同步機制 - 升學大師 v2.0 存儲系統
// 目標：整合本地存儲與 Supabase 資料庫，提供離線可用與自動同步功能

const STORAGE_PREFIX = 'admission-master:';
const SYNC_QUEUE_KEY = 'sync_queue';

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    // 自動加入同步佇列
    addToSyncQueue(key);
  } catch {
    // localStorage might be full or unavailable
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ====== 同步佇列管理 ======

interface SyncOperation {
  id: string
  key: string
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  retry_count: number
}

interface SyncQueue {
  operations: SyncOperation[]
  last_sync: number
}

function getSyncQueue(): SyncQueue {
  return loadFromStorage<SyncQueue>(SYNC_QUEUE_KEY, {
    operations: [],
    last_sync: 0
  });
}

function saveSyncQueue(queue: SyncQueue): void {
  saveToStorage(SYNC_QUEUE_KEY, queue);
}

function addToSyncQueue(key: string, action: 'create' | 'update' | 'delete' = 'update', data?: any): void {
  const queue = getSyncQueue();
  const operation: SyncOperation = {
    id: generateId(),
    key,
    action,
    data,
    timestamp: Date.now(),
    retry_count: 0
  };

  // 避免重複的操作（相同key的最新操作會取代舊的）
  queue.operations = queue.operations.filter(op => op.key !== key);
  queue.operations.push(operation);
  saveSyncQueue(queue);
}

// ====== 資料庫同步功能 ======

export interface DatabaseSyncOptions {
  supabase: any
  userId: string
  onSyncComplete?: (success: boolean, operations: number) => void
  onError?: (error: Error) => void
}

export class DatabaseSyncManager {
  private supabase: any
  private userId: string
  private isSyncing: boolean = false

  constructor(options: DatabaseSyncOptions) {
    this.supabase = options.supabase
    this.userId = options.userId
  }

  /**
   * 執行完整的同步流程
   */
  async sync(): Promise<{ success: boolean; synced: number; failed: number }> {
    if (this.isSyncing) {
      return { success: false, synced: 0, failed: 0 }
    }

    this.isSyncing = true
    const queue = getSyncQueue()
    let synced = 0
    let failed = 0

    try {
      // 依時間順序處理操作
      const sortedOperations = queue.operations.sort((a, b) => a.timestamp - b.timestamp)

      for (const operation of sortedOperations) {
        try {
          await this.syncOperation(operation)
          synced++

          // 移除成功同步的操作
          queue.operations = queue.operations.filter(op => op.id !== operation.id)
        } catch (error) {
          console.error(`Failed to sync operation ${operation.id}:`, error)
          operation.retry_count++

          // 移除重試次數過多的操作
          if (operation.retry_count > 3) {
            queue.operations = queue.operations.filter(op => op.id !== operation.id)
            failed++
          }
        }
      }

      // 更新最後同步時間
      queue.last_sync = Date.now()
      saveSyncQueue(queue)

      return { success: true, synced, failed }
    } catch (error) {
      console.error('Sync failed:', error)
      return { success: false, synced, failed }
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * 同步單個操作
   */
  private async syncOperation(operation: SyncOperation): Promise<void> {
    switch (operation.action) {
      case 'create':
      case 'update':
        await this.syncCreateOrUpdate(operation.key, operation.data)
        break
      case 'delete':
        await this.syncDelete(operation.key)
        break
    }
  }

  /**
   * 同步建立或更新操作
   */
  private async syncCreateOrUpdate(key: string, data: any): Promise<void> {
    // 根據不同的key類型同步到不同的表格
    if (key === 'student_profile') {
      await this.syncUserProfile(data)
    } else if (key.startsWith('ability_')) {
      await this.syncAbilityRecord(key, data)
    } else if (key === 'learning_portfolio') {
      await this.syncLearningPortfolio(data)
    }
  }

  /**
   * 同步刪除操作
   */
  private async syncDelete(key: string): Promise<void> {
    // 根據key類型刪除對應資料
    if (key.startsWith('ability_')) {
      const { error } = await this.supabase
        .from('ability_records')
        .delete()
        .eq('id', key.replace('ability_', ''))

      if (error) throw error
    }
  }

  /**
   * 同步用戶資料
   */
  private async syncUserProfile(data: any): Promise<void> {
    const { error } = await this.supabase
      .from('student_profiles')
      .upsert({
        user_id: this.userId,
        group_code: data.group_code,
        grade: data.grade,
        school_name: data.school_name,
        target_pathways: data.target_pathways || [],
        target_schools: data.target_schools || [],
        total_records: data.total_records || 0,
        total_bonus_percent: data.total_bonus_percent || 0,
        partner_ids: data.partner_ids || [],
        warmth_points: data.warmth_points || 0,
        parent_ids: data.parent_ids || [],
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  }

  /**
   * 同步能力記錄
   */
  private async syncAbilityRecord(key: string, data: any): Promise<void> {
    const recordId = key.replace('ability_', '')

    const { error } = await this.supabase
      .from('ability_records')
      .upsert({
        id: recordId,
        student_id: this.userId,
        category: data.category,
        title: data.title,
        description: data.description,
        occurred_date: data.occurred_date,
        semester: data.semester,
        portfolio_code: data.portfolio_code,
        scoring_value: data.scoring_value,
        process_description: data.process_description,
        reflection: data.reflection,
        evidence_url: data.evidence_url,
        cert_level: data.cert_level,
        cert_number: data.cert_number,
        competition_level: data.competition_level,
        competition_award: data.competition_award,
        capstone_type: data.capstone_type,
        capstone_duration: data.capstone_duration,
        tags: data.tags || [],
        verified: data.verified || false,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  }

  /**
   * 同步學習歷程檔案
   */
  private async syncLearningPortfolio(data: any): Promise<void> {
    const { error } = await this.supabase
      .from('learning_portfolios')
      .upsert({
        student_id: this.userId,
        title: data.title,
        content: data.content,
        version: data.version || 1,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  }

  /**
   * 從資料庫載入並合併到本地存儲
   */
  async loadFromDatabase(): Promise<void> {
    try {
      // 載入用戶資料
      const { data: profile } = await this.supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', this.userId)
        .single()

      if (profile) {
        saveToStorage('student_profile', profile)
      }

      // 載入能力記錄
      const { data: abilities } = await this.supabase
        .from('ability_records')
        .select('*')
        .eq('student_id', this.userId)

      if (abilities) {
        abilities.forEach((ability: any) => {
          const key = `ability_${ability.id}`
          saveToStorage(key, ability)
        })
      }

      // 載入XP進度
      const { data: xpProgress } = await this.supabase
        .from('user_xp_progress')
        .select('*')
        .eq('user_id', this.userId)
        .single()

      if (xpProgress) {
        saveToStorage('user_xp_progress', xpProgress)
      }

      // 清空同步佇列
      const queue = getSyncQueue()
      queue.operations = []
      queue.last_sync = Date.now()
      saveSyncQueue(queue)
    } catch (error) {
      console.error('Error loading from database:', error)
    }
  }

  /**
   * 檢查同步狀態
   */
  getSyncStatus(): {
    pendingOperations: number
    lastSync: Date
    isSyncing: boolean
  } {
    const queue = getSyncQueue()
    return {
      pendingOperations: queue.operations.length,
      lastSync: new Date(queue.last_sync),
      isSyncing: this.isSyncing
    }
  }

  /**
   * 強制立即同步
   */
  async forceSync(): Promise<{ success: boolean; synced: number; failed: number }> {
    return await this.sync()
  }
}

// ====== 導出函數 ======

export async function createSyncManager(supabase: any, userId: string): Promise<DatabaseSyncManager> {
  return new DatabaseSyncManager({
    supabase,
    userId
  })
}

export async function syncDataToDatabase(supabase: any, userId: string): Promise<boolean> {
  const syncManager = await createSyncManager(supabase, userId)
  const result = await syncManager.sync()
  return result.success
}

export async function loadDataFromDatabase(supabase: any, userId: string): Promise<void> {
  const syncManager = await createSyncManager(supabase, userId)
  await syncManager.loadFromDatabase()
}

export function getSyncStatus() {
  const syncManager = new DatabaseSyncManager({
    supabase: null,
    userId: ''
  })
  return syncManager.getSyncStatus()
}

// ====== 離線檢測 ======

export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine
}

// 監聽網路狀態變化
export function setupNetworkListener(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // 返回清理函數
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

// 網路恢復時自動同步
export function setupAutoSync(supabase: any, userId: string): () => void {
  const cleanup = setupNetworkListener(async (online) => {
    if (online && typeof window !== 'undefined') {
      const syncManager = new DatabaseSyncManager({ supabase, userId })
      await syncManager.sync()
    }
  })

  return cleanup
}
