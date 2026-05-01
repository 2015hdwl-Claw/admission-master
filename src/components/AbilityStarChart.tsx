'use client'

import React, { useEffect, useRef } from 'react'
import type { Database } from '@/lib/supabase/database.types'
type AbilityRecord = Database['public']['Tables']['ability_records']['Row']

interface AbilityStarChartProps {
  records: AbilityRecord[]
  size?: number
}

interface StarDimension {
  name: string
  score: number
  maxScore: number
  color: string
}

// 8 個能力維度
const DIMENSIONS = [
  { name: '專業技能', key: 'professional', color: '#6366f1' },     // indigo
  { name: '競賽表現', key: 'competition', color: '#10b981' },       // green
  { name: '專題製作', key: 'project', color: '#f59e0b' },           // amber
  { name: '服務學習', key: 'service', color: '#ec4899' },           // pink
  { name: '領導力', key: 'leadership', color: '#8b5cf6' },          // violet
  { name: '創意力', key: 'creativity', color: '#06b6d4' },          // cyan
  { name: '國際視野', key: 'global', color: '#f97316' },            // orange
  { name: '實作能力', key: 'practical', color: '#84cc16' },         // lime
]

export default function AbilityStarChart({ records, size = 400 }: AbilityStarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 計算各維度分數
  const calculateDimensionScores = (): StarDimension[] => {
    const scores: Record<string, number> = {}
    const maxScores: Record<string, number> = {}

    // 初始化
    DIMENSIONS.forEach(dim => {
      scores[dim.key] = 0
      maxScores[dim.key] = 1 // 避免除以0
    })

    // 計算各類型記錄的分數
    records.forEach(record => {
      const bonus = (record as any).bonus_percent || 0

      // 依據類別和學習歷程代碼分配分數
      switch (record.portfolio_code) {
        case 'A': // 專業證照
          scores.professional += bonus
          maxScores.professional = Math.max(maxScores.professional, bonus)
          break
        case 'B': // 競賽表現
          scores.competition += bonus
          maxScores.competition = Math.max(maxScores.competition, bonus)
          break
        case 'C': // 專題製作
          scores.project += bonus
          maxScores.project = Math.max(maxScores.project, bonus)

          // 專題可能涉及創意力和實作能力
          if (record.category === '專題') {
            scores.creativity += bonus * 0.5
            scores.practical += bonus * 0.5
            maxScores.creativity = Math.max(maxScores.creativity, bonus * 0.5)
            maxScores.practical = Math.max(maxScores.practical, bonus * 0.5)
          }
          break
        case 'D': // 其他表現
          // 依類別細分
          if (record.category === '服務學習' || record.category === '志工') {
            scores.service += bonus
            maxScores.service = Math.max(maxScores.service, bonus)
          } else if (record.category === '社團' || record.category === '幹部') {
            scores.leadership += bonus
            maxScores.leadership = Math.max(maxScores.leadership, bonus)
          } else if (record.category === '國際' || record.category === '外交') {
            scores.global += bonus
            maxScores.global = Math.max(maxScores.global, bonus)
          } else {
            scores.practical += bonus * 0.3
            maxScores.practical = Math.max(maxScores.practical, bonus * 0.3)
          }
          break
      }
    })

    return DIMENSIONS.map(dim => ({
      name: dim.name,
      score: scores[dim.key],
      maxScore: maxScores[dim.key],
      color: dim.color
    }))
  }

  // 繪製星形圖
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const dimensions = calculateDimensionScores()
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 60

    // 繪製背景網格（五邊形）
    const levels = 5
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level
      ctx.beginPath()
      for (let i = 0; i <= dimensions.length; i++) {
        const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2
        const x = centerX + Math.cos(angle) * levelRadius
        const y = centerY + Math.sin(angle) * levelRadius

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // 繪製軸線
    dimensions.forEach((_, index) => {
      const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // 計算實際數據的多邊形頂點
    const dataPoints = dimensions.map((dim, index) => {
      const normalizedScore = dim.maxScore > 0 ? (dim.score / dim.maxScore) : 0
      const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2
      const distance = radius * Math.max(0.1, normalizedScore) // 最小 10% 保持可見
      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance
      }
    })

    // 繪製數據多邊形（填充）
    ctx.beginPath()
    dataPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.closePath()
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)'
    ctx.fill()

    // 繪製數據多邊形（邊線）
    ctx.beginPath()
    dataPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.closePath()
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 2
    ctx.stroke()

    // 繪製數據點
    dataPoints.forEach((point, index) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = dimensions[index].color
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // 繪製標籤
    ctx.font = '12px Arial'
    ctx.fillStyle = '#374151'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    dimensions.forEach((dim, index) => {
      const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2
      const labelRadius = radius + 30
      const x = centerX + Math.cos(angle) * labelRadius
      const y = centerY + Math.sin(angle) * labelRadius

      // 繪製維度名稱
      ctx.fillText(dim.name, x, y)

      // 繪製分數
      const normalizedScore = dim.maxScore > 0 ? (dim.score / dim.maxScore) : 0
      const scoreText = `${normalizedScore.toFixed(1)}`
      ctx.font = 'bold 10px Arial'
      ctx.fillStyle = dim.color
      ctx.fillText(scoreText, x, y + 12)
      ctx.font = '12px Arial'
      ctx.fillStyle = '#374151'
    })

  }, [records, size])

  const dimensions = calculateDimensionScores()
  const totalScore = dimensions.reduce((sum, dim) => sum + dim.score, 0)
  const averageScore = dimensions.length > 0
    ? dimensions.reduce((sum, dim) => {
        const normalized = dim.maxScore > 0 ? (dim.score / dim.maxScore) : 0
        return sum + normalized
      }, 0) / dimensions.length
    : 0

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="bg-white rounded-lg shadow-sm"
        />

        {/* 中央總分顯示 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-white/90 rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">
              {averageScore.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">平均分數</div>
          </div>
        </div>
      </div>

      {/* 維度說明 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
        {dimensions.map(dim => {
          const normalized = dim.maxScore > 0 ? (dim.score / dim.maxScore) : 0
          return (
            <div key={dim.name} className="text-center">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: dim.color }}
              />
              <div className="text-xs text-gray-600">{dim.name}</div>
              <div className="text-sm font-semibold" style={{ color: dim.color }}>
                {normalized.toFixed(1)}
              </div>
            </div>
          )
        })}
      </div>

      {/* 總結統計 */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <div className="font-medium">總加分分數: {totalScore.toFixed(1)}%</div>
        <div className="text-xs mt-1">基於 {records.length} 筆能力記錄</div>
      </div>
    </div>
  )
}
