import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { mockRegistrationResponse, mockValidationError } from './data'

export const server = setupServer(
  // Registration endpoint
  rest.post('http://localhost:3001/api/v1/registration-requests', (req, res, ctx) => {
    const requestData = req.body as any
    
    // Simulate validation errors
    if (requestData.student?.firstName === '') {
      return res(
        ctx.status(400),
        ctx.json(mockValidationError)
      )
    }
    
    // Simulate duplicate detection
    if (requestData.email === 'duplicate@example.com') {
      return res(
        ctx.status(409),
        ctx.json({
          statusCode: 409,
          message: 'Registration request already exists',
          error: 'Conflict',
          details: {
            field: 'email',
            value: 'duplicate@example.com',
            existingId: 'existing-123'
          }
        })
      )
    }
    
    // Success response
    return res(
      ctx.status(201),
      ctx.json({
        ...mockRegistrationResponse,
        ...requestData
      })
    )
  }),
  
  // Health check endpoint
  rest.get('http://localhost:3001/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      })
    )
  })
)