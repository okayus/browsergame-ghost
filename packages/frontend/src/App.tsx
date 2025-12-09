import { hc } from "hono/client";
import { useCallback, useEffect, useState } from "react";
import type { AppType } from "../../backend/src/index";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const client = hc<AppType>(API_BASE_URL);
      const response = await client.api.tasks.$get();
      const data = await response.json();
      setMessage(`Fetched ${data.tasks.length} tasks from backend.`);
    } catch (err) {
      setError(`Failed to fetch tasks from backend.\n${err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="min-h-screen bg-ghost-bg p-8 font-sans text-ghost-text">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-ghost-primary-light">Ghost Game</h1>

        <div className="mb-8 rounded-lg bg-ghost-surface p-6">
          <h2 className="mb-4 text-xl font-semibold text-ghost-text-bright">
            Backend API Response:
          </h2>
          {loading && <p className="text-ghost-text-muted animate-pulse">Loading...</p>}
          {error && <p className="text-ghost-danger">{error}</p>}
          {message && <p className="text-lg text-ghost-success">{message}</p>}
        </div>

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
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
