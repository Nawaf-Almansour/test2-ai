import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationPage } from '@/features/registration/RegistrationPage'

describe('Error State Handling', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    render(<RegistrationPage />)
  })

  describe('Network Error Handling', () => {
    test('should handle network timeout errors', async () => {
      // Fill complete form
      await fillCompleteForm(user)
      await navigateToReviewStep(user)
      
      // Mock network timeout
      const submitButton = screen.getByRole('button', { name: /submit registration/i })
      
      // Simulate network timeout by making the request fail
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/network timeout occurred/i)).toBeInTheDocument()
        expect(screen.getByText(/please check your connection and try again/i)).toBeInTheDocument()
      })
    })

    test('should handle server unavailable errors', async () => {
      await fillCompleteForm(user)
      await navigateToReviewStep(user)
      
      const submitButton = screen.getByRole('button', { name: /submit registration/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/server is currently unavailable/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })
    })

    test('should handle CORS errors gracefully', async () => {
      await fillCompleteForm(user)
      await navigateToReviewStep(user)
      
      const submitButton = screen.getByRole('button', { name: /submit registration/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/cross-origin request blocked/i)).toBeInTheDocument()
      })
    })
  })

  describe('Validation Error Handling', () => {
    test('should display field-specific validation errors', async () => {
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      // Try to submit with empty form
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/emergency contact name is required/i)).toBeInTheDocument()
      })
    })

    test('should highlight fields with validation errors', async () => {
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.click(submitButton)
      
      await waitFor(() => {
        const firstNameInput = screen.getByLabelText(/first name/i)
        expect(firstNameInput).toHaveClass('error')
        
        const emailInput = screen.getByLabelText(/email/i)
        expect(emailInput).toHaveClass('error')
      })
    })

    test('should clear validation errors when field is corrected', async () => {
      const submitButton = screen.getByRole('button', { name: /submit/i })
      const firstNameInput = screen.getByLabelText(/first name/i)
      
      // Trigger validation error
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
        expect(firstNameInput).toHaveClass('error')
      })
      
      // Fix the error
      await user.type(firstNameInput, 'John')
      await user.tab() // Blur to trigger validation
      
      await waitFor(() => {
        expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument()
        expect(firstNameInput).not.toHaveClass('error')
      })
    })

    test('should handle server-side validation errors', async () => {
      // Fill form with data that will trigger server validation error
      await fillCompleteForm(user)
      await navigateToReviewStep(user)
      
      // Change email to trigger validation error
      const emailInput = screen.getByLabelText(/email/i)
      await user.clear(emailInput)
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /submit registration/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })
    })
  })

  describe('Duplicate Submission Handling', () => {
    test('should handle duplicate registration errors', async () => {
      await fillCompleteForm(user)
      await navigateToReviewStep(user)
      
      // Use email that will trigger duplicate error
      const emailInput = screen.getByLabelText(/email/i)
      await user.clear(emailInput)
      await user.type(emailInput, 'duplicate@example.com')
      
      const submitButton = screen.getByRole('button', { name: /submit registration/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/registration request already exists/i)).toBeInTheDocument()
        expect(screen.getByText(/a registration with this email has already been submitted/i)).toBeInTheDocument()
      })
    })

    test('should provide options for duplicate submissions', async () => {
      await fillCompleteForm(user)
      await navigateToReviewStep(user)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.clear(emailInput)
      await user.type(emailInput, 'duplicate@example.com')
      
      const submitButton = screen.getByRole('button', { name: /submit registration/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /contact support/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /start new registration/i })).toBeInTheDocument()
      })
    })
  })

  describe('Form State Recovery', () => {
    test('should preserve form data after validation errors', async () => {
      // Fill some fields
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      
      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      })
      
      // Check that filled data is preserved
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
    })

    test('should allow retry after error correction', async () => {
      await fillCompleteForm(user)
      await navigateToReviewStep(user)
      
      // Trigger an error
      const submitButton = screen.getByRole('button', { name: /submit registration/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeInTheDocument()
      })
      
      // Retry submission
      await user.click(screen.getByRole('button', { name: /retry/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/registration submitted successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Message Display', () => {
    test('should show appropriate error messages for different error types', async () => {
      await fillCompleteForm(user)
      await navigateToReviewStep(user)
      
      const submitButton = screen.getByRole('button', { name: /submit registration/i })
      
      // Test different error scenarios
      const errorScenarios = [
        {
          trigger: async () => {
            // Simulate validation error
            const emailInput = screen.getByLabelText(/email/i)
            await user.clear(emailInput)
            await user.type(emailInput, 'invalid')
          },
          expectedMessage: /invalid email format/i
        },
        {
          trigger: async () => {
            // Simulate network error
            await user.click(submitButton)
          },
          expectedMessage: /error occurred/i
        }
      ]
      
      for (const scenario of errorScenarios) {
        await scenario.trigger()
        
        await waitFor(() => {
          expect(screen.getByText(scenario.expectedMessage)).toBeInTheDocument()
        })
        
        // Clear error for next test
        if (screen.getByRole('button', { name: /dismiss/i })) {
          await user.click(screen.getByRole('button', { name: /dismiss/i }))
        }
      }
    })

    test('should show error context and helpful suggestions', async () => {
      await fillCompleteForm(user)
      await navigateToReviewStep(user)
      
      const submitButton = screen.getByRole('button', { name: /submit registration/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/error occurred while submitting your registration/i)).toBeInTheDocument()
        expect(screen.getByText(/please try again or contact support if the problem persists/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility in Error States', () => {
    test('should announce errors to screen readers', async () => {
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.click(submitButton)
      
      await waitFor(() => {
        const errorRegion = screen.getByRole('alert')
        expect(errorRegion).toBeInTheDocument()
        expect(errorRegion).toHaveAttribute('aria-live', 'polite')
      })
    })

    test('should focus first error field after validation', async () => {
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.click(submitButton)
      
      await waitFor(() => {
        const firstNameInput = screen.getByLabelText(/first name/i)
        expect(firstNameInput).toHaveFocus()
      })
    })

    test('should provide error descriptions for form inputs', async () => {
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.click(submitButton)
      
      await waitFor(() => {
        const firstNameInput = screen.getByLabelText(/first name/i)
        expect(firstNameInput).toHaveAttribute('aria-describedby')
        expect(firstNameInput).toHaveAttribute('aria-invalid', 'true')
      })
    })
  })
})

// Helper functions (reuse from previous test file)
async function fillCompleteForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/first name/i), 'John')
  await user.type(screen.getByLabelText(/last name/i), 'Doe')
  await user.type(screen.getByLabelText(/date of birth/i), '2015-05-15')
  await user.selectOptions(screen.getByLabelText(/grade/i), '3')
  await user.type(screen.getByLabelText(/previous school/i), 'Elementary School')
  
  const nextButton = screen.getByRole('button', { name: /next/i })
  await user.click(nextButton)
  
  await user.type(screen.getByLabelText(/parent first name/i), 'Jane')
  await user.type(screen.getByLabelText(/parent last name/i), 'Doe')
  await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
  await user.type(screen.getByLabelText(/phone/i), '+1234567890')
  await user.type(screen.getByLabelText(/street/i), '123 Main St')
  await user.type(screen.getByLabelText(/city/i), 'Anytown')
  await user.type(screen.getByLabelText(/state/i), 'CA')
  await user.type(screen.getByLabelText(/zip code/i), '12345')
  
  await user.click(nextButton)
  
  await user.type(screen.getByLabelText(/emergency contact name/i), 'Emergency Contact')
  await user.selectOptions(screen.getByLabelText(/relationship/i), 'grandparent')
  await user.type(screen.getByLabelText(/emergency phone/i), '+0987654321')
  
  await user.click(nextButton)
  
  await user.selectOptions(screen.getByLabelText(/program/i), 'regular')
}

async function navigateToReviewStep(user: ReturnType<typeof userEvent.setup>) {
  const nextButton = screen.getByRole('button', { name: /next/i })
  await user.click(nextButton) // To review
}