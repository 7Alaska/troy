import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, DownloadSimple, LockSimple } from "@phosphor-icons/react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { Reveal } from "../components/Reveal";
import {
  downloadImages,
  getDownloadToken,
  saveDownloadToken,
} from "../lib/downloads";

type CollectionImage = {
  id: string;
  image_url: string;
  sort_order: number;
  is_thumbnail: boolean;
};

type CollectionDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  thumbnail_url?: string | null;
  mockup_url?: string | null;
  image_url: string;
  collection_images: CollectionImage[];
};

export function CollectionPage() {
  const { slug = "" } = useParams();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [showPay, setShowPay] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const isFree = useMemo(
    () => collection != null && Number(collection.price) <= 0,
    [collection],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/collections/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load collection.");
        if (cancelled) return;
        const next = data.collection as CollectionDetail;
        setCollection(next);
        const token = getDownloadToken(next.slug);
        if (Number(next.price) <= 0 || token) setUnlocked(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load collection.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function confirmPurchase(event: FormEvent) {
    event.preventDefault();
    if (!collection) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/collections/${collection.slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, confirmPayment: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed.");
      if (data.downloadToken) saveDownloadToken(collection.slug, data.downloadToken);
      setUnlocked(true);
      setShowPay(false);
      setStatus("Payment confirmed. You can download the set.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    if (!collection) return;
    setBusy(true);
    setStatus(null);
    try {
      if (!unlocked && !isFree) {
        setShowPay(true);
        return;
      }

      let token = getDownloadToken(collection.slug) || "";
      if (isFree && !token) {
        const res = await fetch(`/api/collections/${collection.slug}/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not unlock downloads.");
        if (data.downloadToken) {
          saveDownloadToken(collection.slug, data.downloadToken);
          token = data.downloadToken;
        }
        setUnlocked(true);
      }

      const res = await fetch(
        `/api/collections/${collection.slug}/download?token=${encodeURIComponent(token)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Download unavailable.");
      await downloadImages(data.images ?? []);
      setStatus("Download started.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-ink">
      <Nav />
      <main className="mx-auto max-w-[1400px] px-6 pb-24 pt-28 md:px-10 md:pt-32">
        <Link
          to="/#collections"
          className="inline-flex items-center gap-2 text-sm text-mute transition-colors hover:text-bone"
        >
          <ArrowLeft size={16} weight="light" />
          All collections
        </Link>

        {loading && (
          <p className="mt-16 text-sm text-mute">Loading collection…</p>
        )}

        {error && (
          <div className="mt-16">
            <p className="text-lg text-bone">{error}</p>
            <Link to="/" className="mt-4 inline-block text-sm text-frost">
              Back home
            </Link>
          </div>
        )}

        {collection && !loading && !error && (
          <>
            <Reveal className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-mute">
                  Collection
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-bone md:text-5xl">
                  {collection.name}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-mute">
                  {collection.description}
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-panel p-6 md:p-8">
                <p className="text-sm text-mute">
                  {collection.collection_images.length} wallpaper
                  {collection.collection_images.length === 1 ? "" : "s"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-bone">
                  {isFree ? "Free" : `€${Number(collection.price).toFixed(0)}`}
                </p>
                <p className="mt-2 text-sm text-mute">
                  {isFree
                    ? "Download the full set instantly."
                    : "Pay once, then download the full set."}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {isFree || unlocked ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 border border-bone bg-bone px-5 py-2.5 text-sm font-medium text-ink transition-transform active:scale-[0.98] disabled:opacity-60"
                    >
                      <DownloadSimple size={16} weight="bold" />
                      {busy ? "Working…" : "Download all"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setShowPay(true)}
                      className="inline-flex items-center gap-2 border border-bone bg-bone px-5 py-2.5 text-sm font-medium text-ink transition-transform active:scale-[0.98] disabled:opacity-60"
                    >
                      <LockSimple size={16} weight="bold" />
                      Buy for €{Number(collection.price).toFixed(0)}
                    </button>
                  )}
                </div>

                {status && <p className="mt-4 text-sm text-frost">{status}</p>}

                {showPay && !unlocked && (
                  <form onSubmit={confirmPurchase} className="mt-6 space-y-3 border-t border-line pt-6">
                    <p className="text-sm text-mute">
                      Checkout is stubbed until payments are connected. Confirm to unlock downloads.
                    </p>
                    <label className="block text-sm text-mute" htmlFor="checkout-email">
                      Email for receipt
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-line bg-ink px-3 py-2.5 text-sm text-bone outline-none focus:border-bone/40"
                      placeholder="you@email.com"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full border border-bone bg-bone px-5 py-2.5 text-sm font-medium text-ink disabled:opacity-60"
                    >
                      {busy
                        ? "Confirming…"
                        : `Pay €${Number(collection.price).toFixed(0)}`}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collection.collection_images.map((image, index) => (
                <Reveal key={image.id} delay={Math.min(index * 0.04, 0.2)}>
                  <figure className="overflow-hidden rounded-2xl border border-line bg-panel">
                    <img
                      src={image.image_url}
                      alt={`${collection.name} wallpaper ${index + 1}`}
                      className="aspect-[3/4] w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
