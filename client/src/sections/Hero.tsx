import heroImage from "../assets/generated/hero-painting.jpg";
import { Reveal } from "../components/Reveal";

export function Hero() {
  return (
    <section id="top" className="relative min-h-[100dvh] overflow-hidden">
      <img
        src={heroImage}
        alt="Oil painting of a boat on dark water under a stormy sunset"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        decoding="async"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink/80"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col px-6 pt-24 pb-10 md:px-10 md:pb-14">
        <div className="flex flex-1 items-center justify-center text-center">
          <Reveal className="w-full max-w-3xl">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-bone md:text-5xl lg:text-6xl">
              Wallpapers for people
              <br />
              who notice details.
            </h1>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mx-auto w-full max-w-md text-center">
          <p className="text-base leading-relaxed text-bone/75">
            Matched sets for MacBook and iPhone, released in small drops.
          </p>
          <div className="mt-6">
            <a
              href="#collections"
              className="inline-block border border-bone bg-bone px-7 py-3 text-sm font-medium text-ink transition-transform active:scale-[0.98]"
            >
              Shop Collections
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
