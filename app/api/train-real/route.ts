import { NextResponse } from 'next/server'

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward request to Python training service
    const response = await fetch(`${PYTHON_SERVICE_URL}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `Training service error: ${error}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Training API error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Training failed',
        hint: 'Make sure the Python training service is running on port 8000'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('modelId')

    if (!modelId) {
      return NextResponse.json({ error: 'modelId is required' }, { status: 400 })
    }

    // Get training status from Python service
    const response = await fetch(`${PYTHON_SERVICE_URL}/status/${modelId}`)

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `Status check failed: ${error}` },
        { status: response.status }
      )
    }

    const status = await response.json()
    return NextResponse.json(status)

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Status check failed' },
      { status: 500 }
    )
  }
}
