import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

type Stats = {
  totals: { collections: number; published: number; subscribers: number };
  recentSubscribers: { id: string; email: string; created_at: string }[];
};

export function AdminDashboard() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Failed to load stats (${res.status})`);
        setStats(data);
      })
      .catch((err) =>
        setError(
          err instanceof Error && err.message
            ? err.message.includes("pattern") || err.message.includes("fetch")
              ? "Cannot reach API. Is the server running on port 4000?"
              : err.message
            : "Failed to load stats",
        ),
      );
  }, [accessToken]);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!stats) return <p className="text-sm text-mute">Loading overview...</p>;

  const cards = [
    { label: "Collections", value: stats.totals.collections },
    { label: "Published", value: stats.totals.published },
    { label: "Subscribers", value: stats.totals.subscribers },
  ];

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="mt-1 text-sm text-mute">Live counts from Supabase.</p>
        </div>
        <Link
          to="/admin/collections"
          className="border border-bone bg-bone px-4 py-2 text-sm font-medium text-ink"
        >
          Manage collections
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="border border-line bg-panel p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-mute">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 border border-line bg-panel">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-medium">Recent subscribers</h2>
        </div>
        {stats.recentSubscribers.length === 0 ? (
          <p className="px-5 py-6 text-sm text-mute">No subscribers yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {stats.recentSubscribers.map((sub) => (
              <li key={sub.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span>{sub.email}</span>
                <span className="text-mute">
                  {new Date(sub.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
