import { useState, type FormEvent } from "react";
import { useAuth } from "./AuthContext";

export function AdminLogin() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    const message =
      mode === "signin"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);

    if (message) setError(message);
    else if (mode === "signup") {
      setInfo("Account created. If email confirmation is on, check your inbox, then sign in.");
      setMode("signin");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-ink px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md border border-line bg-panel p-8"
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-mute">troy admin</p>
        <h1 className="mt-3 text-2xl font-semibold text-bone">
          {mode === "signin" ? "Sign in" : "Create admin account"}
        </h1>
        <p className="mt-2 text-sm text-mute">
          First visit: create one account. Then manage collections and subscribers.
        </p>

        <label className="mt-8 block text-xs text-mute" htmlFor="admin-email">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border border-line bg-ink px-3 py-2.5 text-sm text-bone outline-none focus:border-frost/60"
        />

        <label className="mt-4 block text-xs text-mute" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border border-line bg-ink px-3 py-2.5 text-sm text-bone outline-none focus:border-frost/60"
        />

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {info && <p className="mt-4 text-sm text-frost">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-bone px-4 py-2.5 text-sm font-medium text-ink disabled:opacity-60"
        >
          {loading ? "Please wait" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          className="mt-4 w-full text-sm text-mute hover:text-bone"
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setError("");
            setInfo("");
          }}
        >
          {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
