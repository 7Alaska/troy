import { processSteps } from "../data";
import { Reveal } from "../components/Reveal";

export function HowItWorks() {
  return (
    <section className="bg-panel py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight text-bone md:text-4xl">
            From browsing to set, in three moves.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_1fr_1fr] md:gap-8">
          {processSteps.map((step, i) => (
            <Reveal key={step.index} delay={i * 0.08}>
              <div className="border-t border-line pt-6">
                <span className="font-mono text-sm text-frost">{step.index}</span>
                <h3 className="mt-4 text-xl font-medium text-bone">{step.title}</h3>
                <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-mute">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
