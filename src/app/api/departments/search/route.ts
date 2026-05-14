import { NextResponse } from 'next/server'
import { searchDepartments, calculateGapForDepartment, getDepartmentsByGroup } from '@/lib/department-data'
import type { StudentProfile } from '@/types/department'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      query,
      groupCode,
      profile,
      includeGapAnalysis = false,
      pathwayType,
    } = body

    let results
    if (query && typeof query === 'string') {
      results = searchDepartments(query)
    } else if (groupCode) {
      results = getDepartmentsByGroup(groupCode)
    } else {
      results = []
    }

    if (includeGapAnalysis && profile && pathwayType) {
      const userProfile: StudentProfile = {
        grade: profile.grade || 12,
        groupCode: profile.groupCode || '05',
        gradePercentile: profile.gradePercentile || 0,
        certificates: profile.certificates || [],
        competitions: profile.competitions || [],
        hasProject: profile.hasProject || false,
      }
      results = results.map(dept => ({
        ...dept,
        gapAnalysis: calculateGapForDepartment(dept, pathwayType, userProfile),
      }))
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    })

  } catch (error) {
    console.error('Department search error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search departments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Department search API is running',
  })
}
