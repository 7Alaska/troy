import { useState, type FormEvent } from "react";
import { Reveal } from "../components/Reveal";

type Status = "idle" | "loading" | "success" | "error";

export function CtaBand() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section className="bg-panel py-24 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal className="flex flex-col items-start gap-8 border border-line bg-ink p-10 md:flex-row md:items-center md:justify-between md:p-14">
          <div>
            <h2 className="max-w-[24ch] text-2xl font-semibold tracking-tight text-bone md:text-3xl">
              Get new drops before they are public.
            </h2>
            <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-mute">
              One email a month. New collections, occasional discounts, nothing else.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full shrink-0 md:w-[380px]">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs text-mute">
                Email address
              </label>
              <div className="flex border border-line focus-within:border-frost/60">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-transparent px-4 py-3 text-sm text-bone placeholder:text-mute/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="shrink-0 border-l border-line bg-bone px-5 py-3 text-sm font-medium text-ink transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  {status === "loading" ? "Sending" : "Join the List"}
                </button>
              </div>
              {status === "success" && (
                <p className="text-xs text-frost">You are on the list. Check your inbox to confirm.</p>
              )}
              {status === "error" && <p className="text-xs text-red-400">{errorMessage}</p>}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
