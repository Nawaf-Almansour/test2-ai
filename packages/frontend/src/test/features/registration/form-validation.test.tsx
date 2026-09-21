import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationPage } from '@/features/registration/RegistrationPage'
import { registrationSchema } from '@/features/registration/schemas/registrationSchema'
import { z } from 'zod'

describe('Registration Form Validation', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    render(<RegistrationPage />)
  })

  describe('Required Field Validation', () => {
    test('should validate required student fields', async () => {
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      // Try to submit without filling required fields
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument()
        expect(screen.getByText(/grade is required/i)).toBeInTheDocument()
      })
    })

    test('should validate required parent fields', async () => {
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/parent first name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/parent last name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/phone is required/i)).toBeInTheDocument()
      })
    })

    test('should validate required emergency contact fields', async () => {
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/emergency contact name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/relationship is required/i)).toBeInTheDocument()
        expect(screen.getByText(/emergency phone is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Email Validation', () => {
    test('should reject invalid email formats', async () => {
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })
    })

    test('should accept valid email formats', async () => {
      const emailInput = screen.getByLabelText(/email/i)
      
      await user.type(emailInput, 'valid@example.com')
      await user.tab() // Blur to trigger validation
      
      await waitFor(() => {
        expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Phone Validation', () => {
    test('should reject invalid phone formats', async () => {
      const phoneInput = screen.getByLabelText(/phone/i)
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.type(phoneInput, 'invalid-phone')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid phone format/i)).toBeInTheDocument()
      })
    })

    test('should accept valid phone formats', async () => {
      const phoneInput = screen.getByLabelText(/phone/i)
      
      await user.type(phoneInput, '+1234567890')
      await user.tab() // Blur to trigger validation
      
      await waitFor(() => {
        expect(screen.queryByText(/invalid phone format/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Date of Birth Validation', () => {
    test('should reject future dates', async () => {
      const dobInput = screen.getByLabelText(/date of birth/i)
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      
      await user.clear(dobInput)
      await user.type(dobInput, futureDate.toISOString().split('T')[0])
      await user.tab() // Blur to trigger validation
      
      await waitFor(() => {
        expect(screen.getByText(/date of birth cannot be in the future/i)).toBeInTheDocument()
      })
    })

    test('should reject dates too old for school enrollment', async () => {
      const dobInput = screen.getByLabelText(/date of birth/i)
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 20)
      
      await user.clear(dobInput)
      await user.type(dobInput, oldDate.toISOString().split('T')[0])
      await user.tab() // Blur to trigger validation
      
      await waitFor(() => {
        expect(screen.getByText(/student must be at least 5 years old/i)).toBeInTheDocument()
      })
    })
  })

  describe('Zip Code Validation', () => {
    test('should reject invalid zip code formats', async () => {
      const zipInput = screen.getByLabelText(/zip code/i)
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.type(zipInput, 'invalid')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid zip code format/i)).toBeInTheDocument()
      })
    })

    test('should accept valid zip code formats', async () => {
      const zipInput = screen.getByLabelText(/zip code/i)
      
      await user.type(zipInput, '12345')
      await user.tab() // Blur to trigger validation
      
      await waitFor(() => {
        expect(screen.queryByText(/invalid zip code format/i)).not.toBeInTheDocument()
      })
    })
  })
})