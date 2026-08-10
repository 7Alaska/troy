import heroImage from "../assets/background.png";
import { Reveal } from "../components/Reveal";

export function Hero() {
  return (
    <section id="top" className="relative min-h-0 flex-1 overflow-hidden">
      <img
        src={heroImage}
        alt="Astronaut standing in dark water before a towering wave under a golden sky"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        decoding="async"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col px-6 pt-24 pb-8 md:px-10 md:pb-10">
        <div className="flex flex-1 items-center justify-center text-center">
          <Reveal className="w-full max-w-3xl">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
              Wallpapers for people
              <br />
              who notice details.
            </h1>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mx-auto w-full max-w-md text-center">
          <p className="text-base leading-relaxed text-white/75">
            Matched sets for MacBook and iPhone, released in small drops.
          </p>
          <div className="mt-5">
            <a
              href="#collections"
              className="inline-block border border-white bg-white px-7 py-3 text-sm font-medium text-black transition-transform active:scale-[0.98]"
            >
              Shop Collections
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
