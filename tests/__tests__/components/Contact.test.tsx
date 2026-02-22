/**
 * Contact Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Contact } from '@/components/sections/Contact';

// Mock I18nProvider
jest.mock('@/components/providers/I18nProvider', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Toast
jest.mock('@/components/ui/Toast', () => ({
  showToast: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('Contact Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders contact form', () => {
    render(<Contact />);
    
    // Form should be visible
    const form = screen.getByRole('form', { name: /contact form/i });
    expect(form).toBeInTheDocument();
  });

  it('has name input field', () => {
    render(<Contact />);
    
    const nameInput = screen.getByLabelText(/contact_name/i) || screen.getByPlaceholderText(/name/i);
    expect(nameInput).toBeInTheDocument();
    if (nameInput) {
      expect(nameInput).toHaveAttribute('type', 'text');
    }
  });

  it('has email input field', () => {
    render(<Contact />);
    
    const emailInput = screen.getByLabelText(/contact_email/i) || screen.getByPlaceholderText(/email/i);
    expect(emailInput).toBeInTheDocument();
  });

  it('has message textarea', () => {
    render(<Contact />);
    
    const messageInput = screen.getByLabelText(/contact_message/i) || screen.getByPlaceholderText(/message/i);
    expect(messageInput).toBeInTheDocument();
  });

  it('updates form state when inputs change', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    
    const nameInput = screen.getByLabelText(/contact_name/i);
    await user.type(nameInput, 'Test User');
    
    expect(nameInput).toHaveValue('Test User');
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<Contact />);
    
    const nameInput = screen.getByLabelText(/contact_name/i);
    const emailInput = screen.getByLabelText(/contact_email/i);
    const messageInput = screen.getByLabelText(/contact_message/i);
    const submitButton = screen.getByRole('button', { name: /contact_submit/i });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(messageInput, 'Test message');
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8010/contact',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('shows error toast on submission failure', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<Contact />);

    const nameInput = screen.getByLabelText(/contact_name/i);
    const emailInput = screen.getByLabelText(/contact_email/i);
    const messageInput = screen.getByLabelText(/contact_message/i);
    const submitButton = screen.getByRole('button', { name: /contact_submit/i });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(messageInput, 'Test message');
    await user.click(submitButton);

    await waitFor(() => {
      const { showToast } = require('@/components/ui/Toast');
      expect(showToast).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        'error'
      );
    }, { timeout: 3000 });
  });
});

