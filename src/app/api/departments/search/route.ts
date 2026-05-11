import { NextResponse } from 'next/server'
import { searchDepartments, calculateGapAnalysis, SearchFilter } from '@/lib/department-database'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      filter,
      studentSubjects,
      studentScores,
      certificates,
      includeGapAnalysis = false
    } = body

    const searchFilter: SearchFilter = {
      groupCode: filter?.groupCode,
      pathwayType: filter?.pathwayType,
      requiredSubjects: filter?.requiredSubjects,
      minAcceptanceRate: filter?.minAcceptanceRate,
      maxAverageScore: filter?.maxAverageScore,
      tags: filter?.tags
    }

    const departments = searchDepartments(searchFilter)

    let results
    if (includeGapAnalysis && studentSubjects) {
      results = departments.map(dept => ({
        ...dept,
        gapAnalysis: calculateGapAnalysis(
          dept,
          studentSubjects,
          studentScores || {},
          certificates || []
        )
      }))
    } else {
      results = departments
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results
    })

  } catch (error) {
    console.error('Department search error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search departments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Department search API is running",
    endpoints: {
      POST: {
        description: "Search departments with optional gap analysis",
        requestBody: {
          filter: "SearchFilter object",
          studentSubjects: "Array of subjects student is taking",
          studentScores: "Object with subject scores",
          certificates: "Array of certificates student has",
          includeGapAnalysis: "Boolean to include gap analysis"
        }
      }
    }
  })
}
