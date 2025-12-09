import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

// Mock @clerk/clerk-react
vi.mock("@clerk/clerk-react", () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  SignUpButton: ({ children }: { children: React.ReactNode }) => children,
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: () => null,
  UserButton: () => <div data-testid="user-button" />,
  useAuth: () => ({
    isSignedIn: true,
    getToken: vi.fn(() => Promise.resolve("mock-token")),
  }),
}));

// Mock hono/client
vi.mock("hono/client", () => ({
  hc: vi.fn(() => ({
    api: {
      tasks: {
        $get: vi.fn(() =>
          Promise.resolve({
            json: () => Promise.resolve({ tasks: [] }),
          }),
        ),
      },
    },
  })),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title", async () => {
    render(<App />);
    expect(screen.getByText(/Ghost Game/i)).toBeInTheDocument();

    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  it("shows signed in state", async () => {
    render(<App />);
    expect(screen.getByText(/You are signed in/i)).toBeInTheDocument();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });
});
