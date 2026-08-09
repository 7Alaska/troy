import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import type { SubscriberRow } from "../lib/supabase";

export function AdminSubscribers() {
  const { accessToken } = useAuth();
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    fetch("/api/admin/subscribers", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load subscribers");
        setSubscribers(data.subscribers ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [accessToken]);

  if (error) return <p className="text-sm text-red-400">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Subscribers</h1>
      <p className="mt-1 text-sm text-mute">{subscribers.length} total</p>

      <div className="mt-6 border border-line bg-panel">
        {subscribers.length === 0 ? (
          <p className="px-5 py-6 text-sm text-mute">No emails yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {subscribers.map((sub) => (
              <li key={sub.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span>{sub.email}</span>
                <span className="text-mute">
                  {new Date(sub.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
