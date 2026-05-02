/**
 * 簡單的錯誤監控和日誌系統
 * 追蹤用戶行為和系統錯誤
 */

export interface ErrorLog {
  timestamp: string
  type: 'error' | 'warning' | 'info'
  page: string
  action: string
  message: string
  userId?: string
  userAgent?: string
}

export interface UserActionLog {
  timestamp: string
  page: string
  action: string
  details?: Record<string, any>
}

/**
 * 記錄用戶行為
 */
export function logUserAction(page: string, action: string, details?: Record<string, any>) {
  const log: UserActionLog = {
    timestamp: new Date().toISOString(),
    page,
    action,
    details
  }

  // 在開發環境輸出到 console
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 User Action:', log)
  }

  // 在生產環境發送到 analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      page_type: page,
      ...details
    })
  }

  // TODO: 將來可以發送到後端 API 或日誌服務
  // await sendToLogService(log)
}

/**
 * 記錄系統錯誤
 */
export function logError(error: Error | string, page: string, action: string) {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    type: 'error',
    page,
    action,
    message: typeof error === 'string' ? error : error.message,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
  }

  // 在開發環境輸出到 console
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', errorLog)
  }

  // 在生產環境發送到 analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'error', {
      page_type: page,
      action: action,
      error_message: errorLog.message
    })
  }

  // TODO: 發送到錯誤追蹤服務
  // await sendToErrorTracking(errorLog)
}

/**
 * 追蹤頁面瀏覽
 */
export function trackPageView(page: string) {
  logUserAction(page, 'page_view')

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_title: page,
      page_location: window.location.href
    })
  }
}

/**
 * 追蹤功能使用
 */
export function trackFeatureUsage(feature: string, details?: Record<string, any>) {
  logUserAction('feature_usage', feature, details)

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', feature, details)
  }
}

/**
 * 追蹤轉換目標
 */
export function trackConversion(goal: string, value?: number) {
  logUserAction('conversion', goal, { value })

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      goal,
      value
    })
  }
}
