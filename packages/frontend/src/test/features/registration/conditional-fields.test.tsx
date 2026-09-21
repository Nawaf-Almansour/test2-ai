import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationPage } from '@/features/registration/RegistrationPage'

describe('Conditional Field Logic', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    render(<RegistrationPage />)
  })

  describe('Transport Field Conditional Logic', () => {
    test('should show transport details when transport is needed', async () => {
      const transportCheckbox = screen.getByLabelText(/transport needed/i)
      
      // Initially transport details should not be visible
      expect(screen.queryByLabelText(/pickup address/i)).not.toBeInTheDocument()
      
      // Check the transport needed checkbox
      await user.click(transportCheckbox)
      
      // Now transport details should be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/pickup address/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/transport notes/i)).toBeInTheDocument()
      })
    })

    test('should hide transport details when transport is not needed', async () => {
      const transportCheckbox = screen.getByLabelText(/transport needed/i)
      
      // Check the transport needed checkbox first
      await user.click(transportCheckbox)
      
      // Verify transport details are visible
      await waitFor(() => {
        expect(screen.getByLabelText(/pickup address/i)).toBeInTheDocument()
      })
      
      // Uncheck the transport needed checkbox
      await user.click(transportCheckbox)
      
      // Transport details should be hidden again
      await waitFor(() => {
        expect(screen.queryByLabelText(/pickup address/i)).not.toBeInTheDocument()
        expect(screen.queryByLabelText(/transport notes/i)).not.toBeInTheDocument()
      })
    })

    test('should validate transport details when transport is needed', async () => {
      const transportCheckbox = screen.getByLabelText(/transport needed/i)
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      // Enable transport
      await user.click(transportCheckbox)
      
      // Try to submit without filling transport details
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/pickup address is required when transport is needed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Special Needs Conditional Logic', () => {
    test('should show special needs details when special needs are indicated', async () => {
      const specialNeedsSelect = screen.getByLabelText(/special needs/i)
      
      // Initially special needs details should not be visible
      expect(screen.queryByLabelText(/describe special needs/i)).not.toBeInTheDocument()
      
      // Select a special needs option
      await user.selectOptions(specialNeedsSelect, 'learning_disabilities')
      
      // Now special needs details should be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/describe special needs/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/accommodations needed/i)).toBeInTheDocument()
      })
    })

    test('should hide special needs details when no special needs are indicated', async () => {
      const specialNeedsSelect = screen.getByLabelText(/special needs/i)
      
      // Select a special needs option first
      await user.selectOptions(specialNeedsSelect, 'learning_disabilities')
      
      // Verify special needs details are visible
      await waitFor(() => {
        expect(screen.getByLabelText(/describe special needs/i)).toBeInTheDocument()
      })
      
      // Change back to no special needs
      await user.selectOptions(specialNeedsSelect, 'none')
      
      // Special needs details should be hidden
      await waitFor(() => {
        expect(screen.queryByLabelText(/describe special needs/i)).not.toBeInTheDocument()
        expect(screen.queryByLabelText(/accommodations needed/i)).not.toBeInTheDocument()
      })
    })

    test('should validate special needs description when special needs are indicated', async () => {
      const specialNeedsSelect = screen.getByLabelText(/special needs/i)
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      // Select special needs
      await user.selectOptions(specialNeedsSelect, 'physical_disabilities')
      
      // Try to submit without filling special needs description
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/special needs description is required when special needs are indicated/i)).toBeInTheDocument()
      })
    })
  })

  describe('Previous School Conditional Logic', () => {
    test('should show previous school details when grade is not kindergarten', async () => {
      const gradeSelect = screen.getByLabelText(/grade/i)
      
      // Initially previous school should be required but details may not be shown
      expect(screen.getByLabelText(/previous school/i)).toBeInTheDocument()
      
      // Select a grade higher than kindergarten
      await user.selectOptions(gradeSelect, '3')
      
      // Previous school details should be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/previous school address/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/last attended date/i)).toBeInTheDocument()
      })
    })

    test('should simplify previous school section for kindergarten', async () => {
      const gradeSelect = screen.getByLabelText(/grade/i)
      
      // Select kindergarten
      await user.selectOptions(gradeSelect, 'K')
      
      // Previous school details should be simplified
      await waitFor(() => {
        expect(screen.queryByLabelText(/previous school address/i)).not.toBeInTheDocument()
        expect(screen.queryByLabelText(/last attended date/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Emergency Contact Conditional Logic', () => {
    test('should show additional emergency contact when primary is not parent', async () => {
      const relationshipSelect = screen.getByLabelText(/relationship/i)
      
      // Initially additional emergency contact should not be visible
      expect(screen.queryByLabelText(/additional emergency contact/i)).not.toBeInTheDocument()
      
      // Select a relationship that's not parent
      await user.selectOptions(relationshipSelect, 'grandparent')
      
      // Additional emergency contact should be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/additional emergency contact name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/additional emergency contact phone/i)).toBeInTheDocument()
      })
    })

    test('should hide additional emergency contact when relationship is parent', async () => {
      const relationshipSelect = screen.getByLabelText(/relationship/i)
      
      // Select non-parent relationship first
      await user.selectOptions(relationshipSelect, 'grandparent')
      
      // Verify additional emergency contact is visible
      await waitFor(() => {
        expect(screen.getByLabelText(/additional emergency contact name/i)).toBeInTheDocument()
      })
      
      // Change back to parent
      await user.selectOptions(relationshipSelect, 'parent')
      
      // Additional emergency contact should be hidden
      await waitFor(() => {
        expect(screen.queryByLabelText(/additional emergency contact name/i)).not.toBeInTheDocument()
        expect(screen.queryByLabelText(/additional emergency contact phone/i)).not.toBeInTheDocument()
      })
    })
  })
})