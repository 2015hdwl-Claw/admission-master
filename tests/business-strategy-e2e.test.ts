/**
 * 商管群策略 API 端到端測試
 * 驗證 scoring-algorithm.ts 與 API 整合的功能
 */

import { describe, test, expect } from '@jest/globals'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

describe('商管群策略 API 整合測試', () => {
  describe('GET /api/business-strategy', () => {
    test('應該返回商管科系列表和評分說明', async () => {
      const response = await fetch(`${API_URL}/api/business-strategy`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.availableDepartments).toBeInstanceOf(Array)
      expect(data.data.availableDepartments.length).toBe(7)
      expect(data.data.scoringInstructions).toBeDefined()
      expect(data.data.scoringInstructions.dimensions).toBeInstanceOf(Array)
      expect(data.data.scoringInstructions.dimensions.length).toBe(8)
    })

    test('應該包含所有7個商管科系', async () => {
      const response = await fetch(`${API_URL}/api/business-strategy`)
      const data = await response.json()
      const departments = data.data.availableDepartments

      const expectedDepts = [
        '會計學系', '財務金融學系', '國際企業學系',
        '行銷學系', '經濟學系', '企業管理學系', '資訊管理學系'
      ]

      expectedDepts.forEach(deptName => {
        const found = departments.some((d: any) => d.name === deptName)
        expect(found).toBe(true)
      })
    })
  })

  describe('POST /api/business-strategy', () => {
    const validProfile = {
      businessProfile: {
        mathScore: 80,
        logicScore: 85,
        languageScore: 75,
        communicationScore: 70,
        creativityScore: 65,
        leadershipScore: 60,
        itScore: 55,
        globalVisionScore: 50
      },
      grade: '高二',
      portfolioCount: 3
    }

    test('應該成功分析商管特質並返回推薦結果', async () => {
      const response = await fetch(`${API_URL}/api/business-strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validProfile)
      })

      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.allMatches).toBeInstanceOf(Array)
      expect(data.data.allMatches.length).toBe(7)
      expect(data.data.topRecommendation).toBeDefined()
      expect(data.data.riskAssessment).toBeDefined()
      expect(data.data.advice).toBeDefined()
      expect(data.data.summary).toBeDefined()
    })

    test('應該正確計算匹配度分數（0-100範圍）', async () => {
      const response = await fetch(`${API_URL}/api/business-strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validProfile)
      })

      const data = await response.json()

      data.data.allMatches.forEach((match: any) => {
        expect(match.matchScore).toBeGreaterThanOrEqual(0)
        expect(match.matchScore).toBeLessThanOrEqual(100)
        expect(match.riskLevel).toMatch(/^(low|medium|high)$/)
      })
    })

    test('應該按匹配度從高到低排序', async () => {
      const response = await fetch(`${API_URL}/api/business-strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validProfile)
      })

      const data = await response.json()
      const matches = data.data.allMatches

      for (let i = 0; i < matches.length - 1; i++) {
        expect(matches[i].matchScore).toBeGreaterThanOrEqual(matches[i + 1].matchScore)
      }
    })

    test('應該正確識別高數學能力的學生推薦會計系', async () => {
      const highMathProfile = {
        businessProfile: {
          mathScore: 90,
          logicScore: 85,
          languageScore: 70,
          communicationScore: 65,
          creativityScore: 60,
          leadershipScore: 55,
          itScore: 50,
          globalVisionScore: 45
        },
        grade: '高二',
        portfolioCount: 2
      }

      const response = await fetch(`${API_URL}/api/business-strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(highMathProfile)
      })

      const data = await response.json()
      const topMatch = data.data.allMatches[0]

      // 高數學能力應該推薦數學重要的科系（會計、財金、經濟）
      const expectedTop = ['會計學系', '財務金融學系', '經濟學系']
      expect(expectedTop).toContain(topMatch.department)
    })

    test('應該正確識別高語文能力的學生推薦國企系', async () => {
      const highLanguageProfile = {
        businessProfile: {
          mathScore: 60,
          logicScore: 65,
          languageScore: 90,
          communicationScore: 85,
          creativityScore: 75,
          leadershipScore: 70,
          itScore: 55,
          globalVisionScore: 80
        },
        grade: '高二',
        portfolioCount: 4
      }

      const response = await fetch(`${API_URL}/api/business-strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(highLanguageProfile)
      })

      const data = await response.json()
      const topMatch = data.data.allMatches[0]

      // 高語文能力應該推薦國際企業學系
      expect(topMatch.department).toBe('國際企業學系')
    })

    test('應該拒絕無效的分數範圍', async () => {
      const invalidProfile = {
        businessProfile: {
          mathScore: 150, // 超過100
          logicScore: 85,
          languageScore: 75,
          communicationScore: 70,
          creativityScore: 65,
          leadershipScore: 60,
          itScore: 55,
          globalVisionScore: 50
        },
        grade: '高二',
        portfolioCount: 3
      }

      const response = await fetch(`${API_URL}/api/business-strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidProfile)
      })

      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('必須介於 0-100 之間')
    })

    test('應該拒絕缺少商管資料的請求', async () => {
      const invalidRequest = {
        grade: '高二',
        portfolioCount: 3
      }

      const response = await fetch(`${API_URL}/api/business-strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRequest)
      })

      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('缺少商管特質評分資料')
    })
  })

  describe('整合測試：完整的商管分析流程', () => {
    test('應該完成從評分到推薦的完整流程', async () => {
      // 1. 獲取可用的科系列表
      const getResponse = await fetch(`${API_URL}/api/business-strategy`)
      const getData = await getResponse.json()
      expect(getData.success).toBe(true)

      // 2. 提交分析請求
      const analysisRequest = {
        businessProfile: {
          mathScore: 75,
          logicScore: 80,
          languageScore: 70,
          communicationScore: 72,
          creativityScore: 68,
          leadershipScore: 65,
          itScore: 60,
          globalVisionScore: 58
        },
        grade: '高二',
        portfolioCount: 3
      }

      const postResponse = await fetch(`${API_URL}/api/business-strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisRequest)
      })

      const postData = await postResponse.json()
      expect(postData.success).toBe(true)

      // 3. 驗證回應結構
      expect(postData.data.allMatches).toHaveLength(7)
      expect(postData.data.topRecommendation.department).toBeDefined()
      expect(postData.data.riskAssessment.lowRisk).toBeInstanceOf(Array)
      expect(postData.data.riskAssessment.mediumRisk).toBeInstanceOf(Array)
      expect(postData.data.riskAssessment.highRisk).toBeInstanceOf(Array)

      // 4. 驗證風險分佈合理性
      const totalDepts = postData.data.riskAssessment.lowRisk.length +
                        postData.data.riskAssessment.mediumRisk.length +
                        postData.data.riskAssessment.highRisk.length
      expect(totalDepts).toBe(7)

      // 5. 驗證建議具體性
      expect(postData.data.advice.immediate.length).toBeGreaterThan(0)
      expect(postData.data.advice.shortTerm.length).toBeGreaterThan(0)
      expect(postData.data.advice.longTerm.length).toBeGreaterThan(0)
    })
  })
})
