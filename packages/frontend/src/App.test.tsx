import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock hono/client
vi.mock('hono/client', () => ({
  hc: vi.fn(() => ({
    api: {
      tasks: {
        $get: vi.fn(() =>
          Promise.resolve({
            json: () => Promise.resolve({ tasks: [] }),
          })
        ),
      },
    },
  })),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title', async () => {
    render(<App />);
    expect(
      screen.getByText(/Monorepo PNPM Turbo - Frontend/i)
    ).toBeInTheDocument();
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  it('shows loading state initially', async () => {
    render(<App />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });
});
