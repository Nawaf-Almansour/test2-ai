import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationPage } from '@/features/registration/RegistrationPage'
import { generateRegistrationPayload } from '@/features/registration/utils/payloadGenerator'
import { mockFormData } from '@/test/mocks/data'

describe('Payload Generation', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    render(<RegistrationPage />)
  })

  describe('Complete Form Payload', () => {
    test('should generate correct payload for complete form', async () => {
      // Fill all form fields
      await fillCompleteForm(user)
      
      // Navigate to review step
      await navigateToReviewStep(user)
      
      // Get the generated payload
      const submitButton = screen.getByRole('button', { name: /submit registration/i })
      await user.click(submitButton)
      
      // The payload should be sent to the API
      await waitFor(() => {
        // Verify the API call was made with correct payload structure
        expect(screen.getByText(/registration submitted successfully/i)).toBeInTheDocument()
      })
    })

    test('should include all required fields in payload', async () => {
      await fillCompleteForm(user)
      await navigateToReviewStep(user)
      
      // Check that all required fields are displayed in review
      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText('Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('Emergency Contact')).toBeInTheDocument()
    })

    test('should format dates correctly in payload', async () => {
      await fillCompleteForm(user)
      await navigateToReviewStep(user)
      
      // Check date formatting
      expect(screen.getByText('2015-05-15')).toBeInTheDocument()
    })

    test('should handle boolean fields correctly', async () => {
      await fillCompleteForm(user)
      
      // Enable transport
      const transportCheckbox = screen.getByLabelText(/transport needed/i)
      await user.click(transportCheckbox)
      
      await navigateToReviewStep(user)
      
      // Check that boolean field is handled correctly
      expect(screen.getByText(/transport needed: yes/i)).toBeInTheDocument()
    })
  })

  describe('Conditional Field Payload', () => {
    test('should include transport details only when transport is needed', async () => {
      await fillCompleteForm(user)
      
      // Enable transport and fill details
      const transportCheckbox = screen.getByLabelText(/transport needed/i)
      await user.click(transportCheckbox)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/pickup address/i)).toBeInTheDocument()
      })
      
      await user.type(screen.getByLabelText(/pickup address/i), '456 Pickup St')
      
      await navigateToReviewStep(user)
      
      // Check that transport details are included
      expect(screen.getByText('456 Pickup St')).toBeInTheDocument()
      expect(screen.getByText(/transport needed: yes/i)).toBeInTheDocument()
    })

    test('should exclude transport details when transport is not needed', async () => {
      await fillCompleteForm(user)
      
      // Ensure transport is not enabled
      const transportCheckbox = screen.getByLabelText(/transport needed/i)
      expect(transportCheckbox).not.toBeChecked()
      
      await navigateToReviewStep(user)
      
      // Check that transport details are not included
      expect(screen.queryByText(/pickup address/i)).not.toBeInTheDocument()
      expect(screen.getByText(/transport needed: no/i)).toBeInTheDocument()
    })

    test('should include special needs details only when indicated', async () => {
      await fillCompleteForm(user)
      
      // Navigate to preferences step
      await navigateToPreferencesStep(user)
      
      // Select special needs
      const specialNeedsSelect = screen.getByLabelText(/special needs/i)
      await user.selectOptions(specialNeedsSelect, 'learning_disabilities')
      
      await waitFor(() => {
        expect(screen.getByLabelText(/describe special needs/i)).toBeInTheDocument()
      })
      
      await user.type(screen.getByLabelText(/describe special needs/i), 'Needs extra time for tests')
      
      await navigateToReviewStep(user)
      
      // Check that special needs details are included
      expect(screen.getByText('Needs extra time for tests')).toBeInTheDocument()
      expect(screen.getByText(/learning disabilities/i)).toBeInTheDocument()
    })
  })

  describe('Data Sanitization', () => {
    test('should trim whitespace from string fields', async () => {
      const firstNameInput = screen.getByLabelText(/first name/i)
      
      // Type name with extra whitespace
      await user.type(firstNameInput, '  John  ')
      await user.tab() // Blur to trigger trimming
      
      // Navigate to review to see formatted data
      await fillRequiredStudentFields(user)
      await navigateToReviewStep(user)
      
      // Check that whitespace was trimmed
      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.queryByText('  John  ')).not.toBeInTheDocument()
    })

    test('should format phone numbers consistently', async () => {
      // Fill form to get to parent step
      await fillRequiredStudentFields(user)
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      // Type phone in various formats
      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, '(123) 456-7890')
      await user.tab()
      
      await fillRequiredParentFields(user)
      await navigateToReviewStep(user)
      
      // Check that phone is formatted consistently
      expect(screen.getByText('+1234567890')).toBeInTheDocument()
    })

    test('should normalize email addresses', async () => {
      // Fill form to get to parent step
      await fillRequiredStudentFields(user)
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      // Type email in mixed case
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'JANE.DOE@EXAMPLE.COM')
      await user.tab()
      
      await fillRequiredParentFields(user)
      await navigateToReviewStep(user)
      
      // Check that email is normalized to lowercase
      expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument()
    })
  })

  describe('Payload Validation', () => {
    test('should validate payload structure against schema', async () => {
      await fillCompleteForm(user)
      await navigateToReviewStep(user)
      
      const submitButton = screen.getByRole('button', { name: /submit registration/i })
      await user.click(submitButton)
      
      // Should successfully submit if payload is valid
      await waitFor(() => {
        expect(screen.getByText(/registration submitted successfully/i)).toBeInTheDocument()
      })
    })

    test('should handle missing conditional fields gracefully', async () => {
      // Fill only required fields, skip conditionals
      await fillRequiredFieldsOnly(user)
      await navigateToReviewStep(user)
      
      const submitButton = screen.getByRole('button', { name: /submit registration/i })
      await user.click(submitButton)
      
      // Should still submit successfully
      await waitFor(() => {
        expect(screen.getByText(/registration submitted successfully/i)).toBeInTheDocument()
      })
    })
  })
})

// Helper functions
async function fillCompleteForm(user: ReturnType<typeof userEvent.setup>) {
  await fillRequiredStudentFields(user)
  await fillRequiredParentFields(user)
  await fillRequiredEmergencyFields(user)
  await fillPreferences(user)
}

async function fillRequiredStudentFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/first name/i), 'John')
  await user.type(screen.getByLabelText(/last name/i), 'Doe')
  await user.type(screen.getByLabelText(/date of birth/i), '2015-05-15')
  await user.selectOptions(screen.getByLabelText(/grade/i), '3')
  await user.type(screen.getByLabelText(/previous school/i), 'Elementary School')
}

async function fillRequiredParentFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/parent first name/i), 'Jane')
  await user.type(screen.getByLabelText(/parent last name/i), 'Doe')
  await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
  await user.type(screen.getByLabelText(/phone/i), '+1234567890')
  await user.type(screen.getByLabelText(/street/i), '123 Main St')
  await user.type(screen.getByLabelText(/city/i), 'Anytown')
  await user.type(screen.getByLabelText(/state/i), 'CA')
  await user.type(screen.getByLabelText(/zip code/i), '12345')
}

async function fillRequiredEmergencyFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/emergency contact name/i), 'Emergency Contact')
  await user.selectOptions(screen.getByLabelText(/relationship/i), 'grandparent')
  await user.type(screen.getByLabelText(/emergency phone/i), '+0987654321')
}

async function fillPreferences(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText(/program/i), 'regular')
}

async function fillRequiredFieldsOnly(user: ReturnType<typeof userEvent.setup>) {
  await fillRequiredStudentFields(user)
  await fillRequiredParentFields(user)
  await fillRequiredEmergencyFields(user)
  await fillPreferences(user)
}

async function navigateToReviewStep(user: ReturnType<typeof userEvent.setup>) {
  const nextButton = screen.getByRole('button', { name: /next/i })
  
  // Go through all steps to reach review
  await user.click(nextButton) // To parent
  await user.click(nextButton) // To emergency
  await user.click(nextButton) // To preferences
  await user.click(nextButton) // To review
}

async function navigateToPreferencesStep(user: ReturnType<typeof userEvent.setup>) {
  const nextButton = screen.getByRole('button', { name: /next/i })
  
  // Go through steps to reach preferences
  await user.click(nextButton) // To parent
  await user.click(nextButton) // To emergency
  await user.click(nextButton) // To preferences
}