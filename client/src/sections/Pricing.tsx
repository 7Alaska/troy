import { Check } from "@phosphor-icons/react";
import { pricing } from "../data";
import { Reveal } from "../components/Reveal";

export function Pricing() {
  return (
    <section id="pricing" className="bg-panel py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight text-bone md:text-4xl">
            Buy one set, or the whole archive.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.3fr]">
          {pricing.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08}>
              <div
                className={`flex h-full flex-col border p-8 md:p-10 ${
                  tier.highlighted ? "border-frost/40 bg-panel-2" : "border-line bg-ink"
                }`}
              >
                <p className="text-sm font-medium text-mute">{tier.name}</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-tight text-bone">
                    &euro;{tier.price}
                  </span>
                  <span className="text-sm text-mute">{tier.period}</span>
                </div>
                <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-mute">
                  {tier.description}
                </p>

                <ul className="mt-8 flex flex-col gap-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-bone/90">
                      <Check size={16} weight="light" className="mt-0.5 shrink-0 text-frost" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="mailto:hello@troy.shop"
                  className={`mt-10 inline-block border px-6 py-3 text-center text-sm font-medium transition-transform active:scale-[0.98] ${
                    tier.highlighted
                      ? "border-bone bg-bone text-ink"
                      : "border-line bg-transparent text-bone hover:border-bone/40"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
