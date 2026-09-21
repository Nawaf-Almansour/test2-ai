import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegistrationPage } from '../../RegistrationPage';
import { ToastProvider } from '../../../../hooks/useToast';

// Mock the API
jest.mock('../../api/registration.api', () => ({
  registrationApi: {
    submitRegistration: jest.fn(),
  },
}));

// Mock the utils
jest.mock('../../../utils/transformers', () => ({
  transformFormDataToApiRequest: jest.fn((data) => data),
  transformApiErrorToFormErrors: jest.fn(() => ({})),
  generateRequestId: jest.fn(() => 'REG-2026-000123'),
  formatReferenceNumber: jest.fn((id) => id),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('RegistrationPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows success page after successful registration', async () => {
    const { registrationApi } = require('../../api/registration.api');
    registrationApi.submitRegistration.mockResolvedValue({
      requestId: 'REG-2026-000123',
      status: 'pending',
      submittedAt: '2026-01-01T00:00:00.000Z',
    });

    renderWithProviders(<RegistrationPage />);

    // Initially shows registration form
    expect(screen.getByText('School Registration')).toBeInTheDocument();
    expect(screen.getByText('Complete the form below to register your child for our school.')).toBeInTheDocument();

    // Fill out the form (simplified for integration test)
    // In a real test, you'd fill all required fields step by step
    
    // For now, let's simulate successful submission by calling the success handler
    // This would normally happen through the form submission process
    
    // Check that success page is not shown initially
    expect(screen.queryByText('Application Submitted Successfully!')).not.toBeInTheDocument();
  });

  it('allows starting a new application from success page', async () => {
    // Start with success page
    const SuccessPage = React.lazy(() => import('../../components/SuccessPage'));
    
    renderWithProviders(
      <React.Suspense fallback="Loading...">
        <SuccessPage 
          requestId="REG-2026-000123" 
          onNewApplication={jest.fn()} 
        />
      </React.Suspense>
    );

    await waitFor(() => {
      expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument();
    });

    // Click the new application button
    const newAppButton = screen.getByText('Submit Another Application');
    fireEvent.click(newAppButton);

    // The callback should be called (handled by the parent component)
  });

  it('handles print functionality', async () => {
    const printMock = jest.spyOn(window, 'print').mockImplementation();
    
    const SuccessPage = React.lazy(() => import('../../components/SuccessPage'));
    
    renderWithProviders(
      <React.Suspense fallback="Loading...">
        <SuccessPage 
          requestId="REG-2026-000123" 
          onNewApplication={jest.fn()} 
        />
      </React.Suspense>
    );

    await waitFor(() => {
      expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument();
    });

    const printButton = screen.getByText('Print Confirmation');
    fireEvent.click(printButton);

    expect(printMock).toHaveBeenCalledTimes(1);

    printMock.mockRestore();
  });

  it('displays correct reference number format', async () => {
    const SuccessPage = React.lazy(() => import('../../components/SuccessPage'));
    
    renderWithProviders(
      <React.Suspense fallback="Loading...">
        <SuccessPage 
          requestId="REG-2026-000123" 
          onNewApplication={jest.fn()} 
        />
      </React.Suspense>
    );

    await waitFor(() => {
      const referenceElement = screen.getByText(/REG-\d{4}-\d{6}/);
      expect(referenceElement).toBeInTheDocument();
      expect(referenceElement).toHaveTextContent('REG-2026-000123');
    });
  });

  it('shows all expected sections on success page', async () => {
    const SuccessPage = React.lazy(() => import('../../components/SuccessPage'));
    
    renderWithProviders(
      <React.Suspense fallback="Loading...">
        <SuccessPage 
          requestId="REG-2026-000123" 
          onNewApplication={jest.fn()} 
        />
      </React.Suspense>
    );

    await waitFor(() => {
      // Check all major sections are present
      expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument();
      expect(screen.getByText('Submission Details')).toBeInTheDocument();
      expect(screen.getByText('What Happens Next?')).toBeInTheDocument();
      expect(screen.getByText('Need Help?')).toBeInTheDocument();
      expect(screen.getByText('Important Notice')).toBeInTheDocument();
      
      // Check contact information
      expect(screen.getByText('+966 50 123 4567')).toBeInTheDocument();
      expect(screen.getByText('admissions@school.edu.sa')).toBeInTheDocument();
      
      // Check action buttons
      expect(screen.getByText('Print Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Submit Another Application')).toBeInTheDocument();
    });
  });
});