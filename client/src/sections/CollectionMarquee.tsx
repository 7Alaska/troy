import { useEffect, useState } from "react";
import { Diamond } from "@phosphor-icons/react";
import { collections as fallback } from "../data";

export function CollectionMarquee() {
  const [names, setNames] = useState(fallback.map((c) => c.name));

  useEffect(() => {
    fetch("/api/collections")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        const rows = (data.collections ?? []) as { name: string }[];
        if (rows.length > 0) setNames(rows.map((r) => r.name));
      })
      .catch(() => undefined);
  }, []);

  const items = [...names, ...names];

  return (
    <section className="border-y border-line bg-ink py-6">
      <div className="no-scrollbar overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-10">
          {[...items, ...items].map((name, i) => (
            <div key={`${name}-${i}`} className="flex items-center gap-10 whitespace-nowrap">
              <span className="text-xl font-medium uppercase tracking-tight text-bone/90 md:text-2xl">
                {name}
              </span>
              <Diamond size={8} weight="fill" className="text-mute/50" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
