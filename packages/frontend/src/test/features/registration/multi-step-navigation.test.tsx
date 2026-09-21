import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationPage } from '@/features/registration/RegistrationPage'

describe('Multi-Step Navigation', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    render(<RegistrationPage />)
  })

  describe('Step Navigation', () => {
    test('should start on student information step', () => {
      expect(screen.getByText(/student information/i)).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /step 1/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    })

    test('should navigate to parent information step', async () => {
      const nextButton = screen.getByRole('button', { name: /next/i })
      
      // Fill required student fields
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/date of birth/i), '2015-05-15')
      await user.selectOptions(screen.getByLabelText(/grade/i), '3')
      
      // Click next to go to parent step
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/parent information/i)).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /step 2/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/parent first name/i)).toBeInTheDocument()
      })
    })

    test('should navigate to emergency contact step', async () => {
      const nextButton = screen.getByRole('button', { name: /next/i })
      
      // Fill student information
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/date of birth/i), '2015-05-15')
      await user.selectOptions(screen.getByLabelText(/grade/i), '3')
      
      // Go to parent step
      await user.click(nextButton)
      
      // Fill parent information
      await waitFor(() => {
        expect(screen.getByLabelText(/parent first name/i)).toBeInTheDocument()
      })
      await user.type(screen.getByLabelText(/parent first name/i), 'Jane')
      await user.type(screen.getByLabelText(/parent last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
      await user.type(screen.getByLabelText(/phone/i), '+1234567890')
      
      // Go to emergency contact step
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/emergency contact/i)).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /step 3/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/emergency contact name/i)).toBeInTheDocument()
      })
    })

    test('should navigate to preferences step', async () => {
      const nextButton = screen.getByRole('button', { name: /next/i })
      
      // Complete student, parent, and emergency contact steps
      await completeAllPreviousSteps(user)
      
      // Go to preferences step
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/preferences/i)).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /step 4/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/program/i)).toBeInTheDocument()
      })
    })

    test('should navigate to review step', async () => {
      const nextButton = screen.getByRole('button', { name: /next/i })
      
      // Complete all previous steps
      await completeAllPreviousSteps(user)
      await user.click(nextButton) // Go to preferences
      
      // Fill preferences
      await waitFor(() => {
        expect(screen.getByLabelText(/program/i)).toBeInTheDocument()
      })
      await user.selectOptions(screen.getByLabelText(/program/i), 'regular')
      
      // Go to review step
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/review and submit/i)).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /step 5/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /submit registration/i })).toBeInTheDocument()
      })
    })
  })

  describe('Step Validation', () => {
    test('should prevent navigation to next step with invalid current step', async () => {
      const nextButton = screen.getByRole('button', { name: /next/i })
      
      // Try to go to next step without filling required fields
      await user.click(nextButton)
      
      // Should stay on student step and show validation errors
      expect(screen.getByText(/student information/i)).toBeInTheDocument()
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    })

    test('should allow navigation back to previous steps', async () => {
      const nextButton = screen.getByRole('button', { name: /next/i })
      
      // Complete student step and go to parent step
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/date of birth/i), '2015-05-15')
      await user.selectOptions(screen.getByLabelText(/grade/i), '3')
      await user.click(nextButton)
      
      // Go back to student step
      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)
      
      await waitFor(() => {
        expect(screen.getByText(/student information/i)).toBeInTheDocument()
        expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      })
    })

    test('should maintain form data when navigating between steps', async () => {
      const nextButton = screen.getByRole('button', { name: /next/i })
      const backButton = screen.getByRole('button', { name: /back/i })
      
      // Fill student step
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/date of birth/i), '2015-05-15')
      await user.selectOptions(screen.getByLabelText(/grade/i), '3')
      
      // Go to parent step
      await user.click(nextButton)
      
      // Go back to student step
      await user.click(backButton)
      
      // Data should be preserved
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
        expect(screen.getByDisplayValue('2015-05-15')).toBeInTheDocument()
        expect(screen.getByDisplayValue('3')).toBeInTheDocument()
      })
    })
  })

  describe('Step Indicators', () => {
    test('should show correct step indicators', async () => {
      const nextButton = screen.getByRole('button', { name: /next/i })
      
      // Initially first step should be active
      expect(screen.getByTestId('step-1')).toHaveClass('active')
      expect(screen.getByTestId('step-2')).not.toHaveClass('active')
      
      // Complete first step and go to second
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/date of birth/i), '2015-05-15')
      await user.selectOptions(screen.getByLabelText(/grade/i), '3')
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('step-1')).toHaveClass('completed')
        expect(screen.getByTestId('step-2')).toHaveClass('active')
      })
    })

    test('should allow direct navigation to completed steps', async () => {
      const nextButton = screen.getByRole('button', { name: /next/i })
      
      // Complete first step and go to second
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/date of birth/i), '2015-05-15')
      await user.selectOptions(screen.getByLabelText(/grade/i), '3')
      await user.click(nextButton)
      
      // Click on completed step 1 to go back
      const step1Indicator = screen.getByTestId('step-1')
      await user.click(step1Indicator)
      
      await waitFor(() => {
        expect(screen.getByText(/student information/i)).toBeInTheDocument()
        expect(screen.getByTestId('step-1')).toHaveClass('active')
      })
    })
  })

  describe('Progress Tracking', () => {
    test('should show correct progress percentage', async () => {
      const nextButton = screen.getByRole('button', { name: /next/i })
      
      // Initially should show 20% (1 of 5 steps)
      expect(screen.getByText('20%')).toBeInTheDocument()
      
      // Complete first step
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/date of birth/i), '2015-05-15')
      await user.selectOptions(screen.getByLabelText(/grade/i), '3')
      await user.click(nextButton)
      
      await waitFor(() => {
        // Should show 40% (2 of 5 steps)
        expect(screen.getByText('40%')).toBeInTheDocument()
      })
    })
  })
})

// Helper function to complete all previous steps
async function completeAllPreviousSteps(user: ReturnType<typeof userEvent.setup>) {
  const nextButton = screen.getByRole('button', { name: /next/i })
  
  // Complete student step
  await user.type(screen.getByLabelText(/first name/i), 'John')
  await user.type(screen.getByLabelText(/last name/i), 'Doe')
  await user.type(screen.getByLabelText(/date of birth/i), '2015-05-15')
  await user.selectOptions(screen.getByLabelText(/grade/i), '3')
  await user.click(nextButton)
  
  // Complete parent step
  await waitFor(() => {
    expect(screen.getByLabelText(/parent first name/i)).toBeInTheDocument()
  })
  await user.type(screen.getByLabelText(/parent first name/i), 'Jane')
  await user.type(screen.getByLabelText(/parent last name/i), 'Doe')
  await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
  await user.type(screen.getByLabelText(/phone/i), '+1234567890')
  await user.type(screen.getByLabelText(/street/i), '123 Main St')
  await user.type(screen.getByLabelText(/city/i), 'Anytown')
  await user.type(screen.getByLabelText(/state/i), 'CA')
  await user.type(screen.getByLabelText(/zip code/i), '12345')
  await user.click(nextButton)
  
  // Complete emergency contact step
  await waitFor(() => {
    expect(screen.getByLabelText(/emergency contact name/i)).toBeInTheDocument()
  })
  await user.type(screen.getByLabelText(/emergency contact name/i), 'Emergency Contact')
  await user.selectOptions(screen.getByLabelText(/relationship/i), 'grandparent')
  await user.type(screen.getByLabelText(/emergency phone/i), '+0987654321')
  await user.click(nextButton)
}