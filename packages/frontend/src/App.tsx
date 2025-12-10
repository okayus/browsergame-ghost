import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { hc } from "hono/client";
import { useCallback, useEffect, useState } from "react";
import type { AppType } from "../../backend/src/index";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const { isSignedIn, getToken } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchGhosts = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const client = hc<AppType>(API_BASE_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const response = await client.api.master.ghosts.$get();
      const data = await response.json();
      setMessage(`Fetched ${data.ghosts.length} ghost species from backend.`);
    } catch (err) {
      setError(`Failed to fetch ghost species from backend.\n${err}`);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchGhosts();
  }, [fetchGhosts]);

  return (
    <div className="min-h-screen bg-ghost-bg p-8 font-sans text-ghost-text">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-ghost-primary-light">Ghost Game</h1>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="rounded-lg bg-ghost-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ghost-primary-light"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="rounded-lg border border-ghost-primary px-4 py-2 text-sm font-medium text-ghost-primary-light transition-colors hover:bg-ghost-primary/20"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </SignedIn>
          </div>
        </header>

        <SignedIn>
          <div className="mb-8 rounded-lg bg-ghost-surface p-6">
            <h2 className="mb-4 text-xl font-semibold text-ghost-text-bright">
              Backend API Response:
            </h2>
            {loading && <p className="text-ghost-text-muted animate-pulse">Loading...</p>}
            {error && <p className="text-ghost-danger">{error}</p>}
            {message && <p className="text-lg text-ghost-success">{message}</p>}
          </div>
        </SignedIn>

        <SignedOut>
          <div className="mb-8 rounded-lg bg-ghost-surface p-6 text-center">
            <h2 className="mb-4 text-xl font-semibold text-ghost-text-bright">
              Welcome to Ghost Game
            </h2>
            <p className="text-ghost-text-muted">Sign in to start your adventure!</p>
          </div>
        </SignedOut>

        <div className="rounded-lg bg-ghost-surface p-6">
          <h3 className="mb-4 text-lg font-semibold text-ghost-text-bright">Technologies:</h3>
          <ul className="space-y-2 text-ghost-text-muted">
            <li className="flex items-center gap-2">
              <span className="text-ghost-accent-light">React 19</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ghost-warning">Vite</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ghost-secondary-light">TypeScript</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ghost-success">Vitest</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ghost-primary-light">Tailwind CSS</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ghost-info">Cloudflare Pages</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ghost-secondary-light">Clerk Auth</span>
            </li>
          </ul>
        </div>

        {isSignedIn && (
          <p className="mt-4 text-center text-sm text-ghost-text-muted">You are signed in!</p>
        )}
      </div>
    </div>
  );
}

export default App;
