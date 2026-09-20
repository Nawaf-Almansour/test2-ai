import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuccessPage } from '../SuccessPage';

describe('SuccessPage', () => {
  const mockOnNewApplication = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders success message with reference number', () => {
    render(
      <SuccessPage 
        requestId="REG-2026-000123" 
        onNewApplication={mockOnNewApplication} 
      />
    );

    expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument();
    expect(screen.getByText('REG-2026-000123')).toBeInTheDocument();
    expect(screen.getByText(/Please save this reference number for your records/)).toBeInTheDocument();
  });

  it('displays submission details', () => {
    render(
      <SuccessPage 
        requestId="REG-2026-000123" 
        onNewApplication={mockOnNewApplication} 
      />
    );

    expect(screen.getByText('Submission Details')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Under Review')).toBeInTheDocument();
  });

  it('shows contact information', () => {
    render(
      <SuccessPage 
        requestId="REG-2026-000123" 
        onNewApplication={mockOnNewApplication} 
      />
    );

    expect(screen.getByText('Need Help?')).toBeInTheDocument();
    expect(screen.getByText('+966 50 123 4567')).toBeInTheDocument();
    expect(screen.getByText('admissions@school.edu.sa')).toBeInTheDocument();
  });

  it('calls onNewApplication when button is clicked', () => {
    render(
      <SuccessPage 
        requestId="REG-2026-000123" 
        onNewApplication={mockOnNewApplication} 
      />
    );

    const newAppButton = screen.getByText('Submit Another Application');
    fireEvent.click(newAppButton);

    expect(mockOnNewApplication).toHaveBeenCalledTimes(1);
  });

  it('displays "what happens next" information', () => {
    render(
      <SuccessPage 
        requestId="REG-2026-000123" 
        onNewApplication={mockOnNewApplication} 
      />
    );

    expect(screen.getByText('What Happens Next?')).toBeInTheDocument();
    expect(screen.getByText(/Our admissions team will review your application/)).toBeInTheDocument();
    expect(screen.getByText(/You will receive a confirmation email/)).toBeInTheDocument();
  });

  it('shows important notice about admission', () => {
    render(
      <SuccessPage 
        requestId="REG-2026-000123" 
        onNewApplication={mockOnNewApplication} 
      />
    );

    expect(screen.getByText('Important Notice')).toBeInTheDocument();
    expect(screen.getByText(/This registration request does not guarantee admission/)).toBeInTheDocument();
  });

  it('has print functionality', () => {
    // Mock window.print
    const printSpy = jest.spyOn(window, 'print').mockImplementation();

    render(
      <SuccessPage 
        requestId="REG-2026-000123" 
        onNewApplication={mockOnNewApplication} 
      />
    );

    const printButton = screen.getByText('Print Confirmation');
    fireEvent.click(printButton);

    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
  });
});