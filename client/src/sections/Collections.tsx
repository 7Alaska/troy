import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Reveal } from "../components/Reveal";

type CollectionCard = {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail: string;
  mockup: string;
  price: number;
};

export function Collections() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CollectionCard[]>([]);

  useEffect(() => {
    fetch("/api/collections")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        const rows = (data.collections ?? []) as Array<{
          id: string;
          slug: string;
          name: string;
          description: string;
          image_url: string;
          thumbnail_url?: string | null;
          mockup_url?: string | null;
          price: number;
        }>;
        setItems(
          rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            name: row.name,
            description: row.description,
            thumbnail: row.thumbnail_url || row.image_url,
            mockup: row.mockup_url || row.image_url,
            price: row.price,
          })),
        );
      })
      .catch(() => undefined);
  }, []);

  function scrollByCard(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 24 : 320;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <section id="collections" className="bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mute">
            {items.length} Collections
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-bone md:text-5xl">
            Pick your set.
          </h2>
        </Reveal>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-2 md:px-10"
      >
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/collections/${item.slug}`}
            data-card
            className="group w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[280px] lg:w-[300px]"
          >
            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="relative aspect-[3/4] overflow-hidden bg-panel">
                <img
                  src={item.thumbnail}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-xl"
                  loading="lazy"
                />
                <div className="relative z-10 flex h-full items-center justify-center p-7 md:p-9">
                  <img
                    src={item.mockup}
                    alt={`${item.name} wallpaper collection`}
                    className="max-h-full w-full object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-bone">
                {item.name}
              </p>
              <p className="mt-1.5 text-sm text-mute">
                &euro;{Number(item.price).toFixed(0)}
              </p>
            </div>
          </Link>
        ))}
        <div className="w-2 shrink-0 md:w-4" aria-hidden="true" />
      </div>

      {items.length > 0 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous collections"
            onClick={() => scrollByCard(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-bone transition-colors hover:border-bone/50 hover:bg-panel"
          >
            <CaretLeft size={18} weight="light" />
          </button>
          <button
            type="button"
            aria-label="Next collections"
            onClick={() => scrollByCard(1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-bone transition-colors hover:border-bone/50 hover:bg-panel"
          >
            <CaretRight size={18} weight="light" />
          </button>
        </div>
      )}
    </section>
  );
}
