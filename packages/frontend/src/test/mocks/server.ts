import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { mockRegistrationResponse, mockValidationError } from './data'

export const server = setupServer(
  // Registration endpoint
  http.post('http://localhost:3001/api/v1/registration-requests', async ({ request }) => {
    const requestData = await request.json() as any

    // Simulate validation errors
    if (requestData.student?.firstName === '') {
      return HttpResponse.json(mockValidationError, { status: 400 })
    }

    // Simulate duplicate detection
    if (requestData.email === 'duplicate@example.com') {
      return HttpResponse.json(
        {
          statusCode: 409,
          message: 'Registration request already exists',
          error: 'Conflict',
          details: {
            field: 'email',
            value: 'duplicate@example.com',
            existingId: 'existing-123'
          }
        },
        { status: 409 }
      )
    }

    // Success response
    return HttpResponse.json(
      {
        ...mockRegistrationResponse,
        ...requestData
      },
      { status: 201 }
    )
  }),

  // Health check endpoint
  http.get('http://localhost:3001/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  })
)
