import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, DownloadSimple, LockSimple, ShoppingBag } from "@phosphor-icons/react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
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
  const [activeIndex, setActiveIndex] = useState(0);

  const isFree = useMemo(
    () => collection != null && Number(collection.price) <= 0,
    [collection],
  );

  const images = useMemo(() => {
    const all = collection?.collection_images ?? [];
    const withoutThumb = all.filter((img) => !img.is_thumbnail);
    return withoutThumb.length > 0 ? withoutThumb : all;
  }, [collection]);
  const activeImage = images[activeIndex] ?? images[0];
  const backdrop = activeImage?.image_url || collection?.image_url;
  const mockup = collection?.mockup_url || collection?.image_url;

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
        setActiveIndex(0);
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
      <main className="pt-[72px] md:pt-20">
        <div className="border-b border-line px-6 py-4 md:px-10">
          <Link
            to="/#collections"
            className="inline-flex items-center gap-2 text-sm text-mute transition-colors hover:text-bone"
          >
            <ArrowLeft size={16} weight="light" />
            All collections
          </Link>
        </div>

        {loading && (
          <p className="px-6 py-20 text-sm text-mute md:px-10">Loading collection…</p>
        )}

        {error && (
          <div className="px-6 py-20 md:px-10">
            <p className="text-lg text-bone">{error}</p>
            <Link to="/" className="mt-4 inline-block text-sm text-frost">
              Back home
            </Link>
          </div>
        )}

        {collection && !loading && !error && (
          <section className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(140px,0.38fr)_minmax(280px,0.7fr)]">
            <div className="relative min-h-[52vh] overflow-hidden border-b border-line lg:min-h-[calc(100dvh-5rem)] lg:border-b-0 lg:border-r">
              <img
                src={backdrop}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
              />
              <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
              <div className="relative z-10 flex h-full min-h-[52vh] items-center justify-center p-8 md:p-12 lg:min-h-[calc(100dvh-5rem)]">
                <img
                  src={mockup}
                  alt={`${collection.name} on laptop`}
                  className="max-h-[70vh] w-full max-w-xl object-contain drop-shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto border-b border-line p-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-b-0 lg:border-r lg:p-0">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative h-24 w-36 shrink-0 overflow-hidden border border-transparent lg:h-auto lg:w-full lg:flex-1 lg:min-h-[72px] ${
                    activeIndex === index ? "border-bone/50 lg:border-bone/40" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`${collection.name} preview ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            <div className="flex flex-col justify-center px-6 py-10 md:px-10 lg:px-12 lg:py-16">
              <h1 className="text-3xl font-semibold tracking-tight text-bone md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                {collection.name}
                {images.length > 0 ? ` — ${images.length} Wallpapers` : ""}
              </h1>

              <p className="mt-4 text-xl text-bone">
                {isFree ? "Free" : `€${Number(collection.price).toFixed(2).replace(".", ",")}`}
              </p>

              {collection.description && (
                <p className="mt-4 max-w-md text-sm leading-relaxed text-mute">
                  {collection.description}
                </p>
              )}

              <div className="mt-8 space-y-3">
                {isFree || unlocked ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleDownload}
                    className="flex w-full items-center justify-center gap-2 bg-bone px-5 py-3.5 text-sm font-medium text-ink transition-transform active:scale-[0.99] disabled:opacity-60"
                  >
                    <DownloadSimple size={16} weight="bold" />
                    {busy ? "Working…" : "Download all"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setShowPay(true)}
                    className="flex w-full items-center justify-center gap-2 bg-bone px-5 py-3.5 text-sm font-medium text-ink transition-transform active:scale-[0.99] disabled:opacity-60"
                  >
                    <ShoppingBag size={16} weight="bold" />
                    Add to cart
                  </button>
                )}

                {!isFree && !unlocked && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setShowPay(true)}
                    className="flex w-full items-center justify-center gap-2 border border-line bg-panel px-5 py-3.5 text-sm font-medium text-bone transition-colors hover:border-bone/40 disabled:opacity-60"
                  >
                    <LockSimple size={16} weight="bold" />
                    Buy now — €{Number(collection.price).toFixed(2).replace(".", ",")}
                  </button>
                )}
              </div>

              <ul className="mt-8 space-y-2 text-sm italic text-mute">
                <li>{images.length || "Multiple"} Wallpapers</li>
                <li>Instant Download</li>
                <li>MacBook &amp; iPhone</li>
                <li>High Quality</li>
              </ul>

              {status && <p className="mt-6 text-sm text-frost">{status}</p>}

              {showPay && !unlocked && (
                <form onSubmit={confirmPurchase} className="mt-8 space-y-3 border-t border-line pt-6">
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
                    className="w-full border border-line bg-panel px-3 py-2.5 text-sm text-bone outline-none focus:border-bone/40"
                    placeholder="you@email.com"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full bg-bone px-5 py-3 text-sm font-medium text-ink disabled:opacity-60"
                  >
                    {busy
                      ? "Confirming…"
                      : `Pay €${Number(collection.price).toFixed(2).replace(".", ",")}`}
                  </button>
                </form>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
