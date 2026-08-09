import { testimonials } from "../data";
import { Reveal } from "../components/Reveal";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export function Testimonials() {
  return (
    <section className="bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight text-bone md:text-4xl">
            What people set their screens to.
          </h2>
        </Reveal>
      </div>

      <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 md:px-10">
        {testimonials.map((item) => (
          <figure
            key={item.name}
            className="w-[82vw] shrink-0 snap-start border border-line bg-panel p-8 md:w-[420px]"
          >
            <blockquote className="text-lg leading-relaxed text-bone">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-line bg-panel-2 font-mono text-xs text-mute">
                {initials(item.name)}
              </div>
              <figcaption className="text-sm text-mute">
                <span className="text-bone">{item.name}</span>, {item.role}
              </figcaption>
            </div>
          </figure>
        ))}
        <div className="w-px shrink-0 md:w-0" aria-hidden="true" />
      </div>
    </section>
  );
}
