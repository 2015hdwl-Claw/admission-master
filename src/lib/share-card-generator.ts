// Canvas-based Share Card Generator for 繪馬式 Design
// Generates 1280x720 IG Story format share cards with QR codes

import { createClient } from './supabase/client'

export interface ShareCardOptions {
  type: 'achievement' | 'weekly' | 'department' | 'goal'
  studentName?: string // Optional, defaults to anonymous
  goal?: string
  achievement?: string
  department?: string
  shareToken?: string
  theme?: 'default' | 'gradient' | 'minimal'
}

export class ShareCardGenerator {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private readonly width = 1280
  private readonly height = 720

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('ShareCardGenerator can only be used in the browser')
    }

    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get canvas context')
    this.ctx = ctx
  }

  async generateCard(options: ShareCardOptions): Promise<Blob> {
    const { type, theme = 'default' } = options

    // Draw background
    this.drawBackground(theme)

    // Draw content based on type
    switch (type) {
      case 'achievement':
        await this.drawAchievementCard(options)
        break
      case 'weekly':
        await this.drawWeeklyCard(options)
        break
      case 'department':
        await this.drawDepartmentCard(options)
        break
      case 'goal':
        await this.drawGoalCard(options)
        break
    }

    // Draw branding
    this.drawBranding()

    // Convert to blob
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to generate blob'))
      }, 'image/png')
    })
  }

  private drawBackground(theme: string) {
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height)

    switch (theme) {
      case 'gradient':
        gradient.addColorStop(0, '#667eea')
        gradient.addColorStop(1, '#764ba2')
        break
      case 'minimal':
        gradient.addColorStop(0, '#f5f7fa')
        gradient.addColorStop(1, '#c3cfe2')
        break
      default:
        gradient.addColorStop(0, '#4f46e5')
        gradient.addColorStop(0.5, '#7c3aed')
        gradient.addColorStop(1, '#ec4899')
    }

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  private async drawAchievementCard(options: ShareCardOptions) {
    const { studentName = '匿名學生', achievement = '完成了一項學習歷程' } = options

    // Title
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 48px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('🎉 成就達成！', this.width / 2, 150)

    // Student name
    this.ctx.font = 'bold 36px Arial'
    this.ctx.fillText(studentName, this.width / 2, 220)

    // Achievement
    this.ctx.font = '28px Arial'
    this.ctx.fillText(achievement, this.width / 2, 280)

    // Decorative elements
    this.drawDecorations()
  }

  private async drawWeeklyCard(options: ShareCardOptions) {
    const { studentName = '匿名學生' } = options

    // Title
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 48px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('📊 本週學習成果', this.width / 2, 150)

    // Student name
    this.ctx.font = 'bold 36px Arial'
    this.ctx.fillText(studentName, this.width / 2, 220)

    // Summary
    this.ctx.font = '28px Arial'
    this.ctx.fillText('持續累積學習歷程素材', this.width / 2, 280)
    this.ctx.fillText('為升學備審做準備！', this.width / 2, 330)

    this.drawDecorations()
  }

  private async drawDepartmentCard(options: ShareCardOptions) {
    const { studentName = '匿名學生', department = '探索了新的科系' } = options

    // Title
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 48px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('🔍 科系探索', this.width / 2, 150)

    // Student name
    this.ctx.font = 'bold 36px Arial'
    this.ctx.fillText(studentName, this.width / 2, 220)

    // Department
    this.ctx.font = '28px Arial'
    this.ctx.fillText(department, this.width / 2, 280)

    this.drawDecorations()
  }

  private async drawGoalCard(options: ShareCardOptions) {
    const { studentName = '匿名學生', goal = '我的升學目標' } = options

    // Title
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 48px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('🎯 我的目標', this.width / 2, 150)

    // Student name
    this.ctx.font = 'bold 36px Arial'
    this.ctx.fillText(studentName, this.width / 2, 220)

    // Goal
    this.ctx.font = '28px Arial'
    this.ctx.fillText(`「${goal}」`, this.width / 2, 280)

    this.drawDecorations()
  }

  private drawDecorations() {
    // Add some decorative circles
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    this.ctx.beginPath()
    this.ctx.arc(100, 100, 80, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.beginPath()
    this.ctx.arc(this.width - 100, this.height - 100, 120, 0, Math.PI * 2)
    this.ctx.fill()
  }

  private drawBranding() {
    // Bottom bar
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    this.ctx.fillRect(0, this.height - 100, this.width, 100)

    // App name
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 24px Arial'
    this.ctx.textAlign = 'left'
    this.ctx.fillText('升學大師 v4', 40, this.height - 55)

    // Tagline
    this.ctx.font = '18px Arial'
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    this.ctx.fillText('連結你的努力與夢想', 40, this.height - 25)

    // QR code placeholder (in real implementation, generate actual QR code)
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(this.width - 140, this.height - 80, 60, 60)
    this.ctx.strokeStyle = '#000000'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(this.width - 140, this.height - 80, 60, 60)

    // QR code text
    this.ctx.fillStyle = '#000000'
    this.ctx.font = '12px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('QR Code', this.width - 110, this.height - 45)
  }

  getDataURL(): string {
    return this.canvas.toDataURL('image/png')
  }
}

// Client-side helper function
export async function generateShareCard(options: ShareCardOptions): Promise<string> {
  try {
    const generator = new ShareCardGenerator()
    const blob = await generator.generateCard(options)

    // Convert blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error generating share card:', error)
    throw error
  }
}