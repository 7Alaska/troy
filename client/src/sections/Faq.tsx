import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { faqs } from "../data";
import { Reveal } from "../components/Reveal";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight text-bone md:text-4xl">
            Questions, answered plainly.
          </h2>
        </Reveal>

        <div className="mt-12 max-w-[760px] border-t border-line">
          {faqs.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.question} className="border-b border-line">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                >
                  <span className="text-base font-medium text-bone md:text-lg">
                    {item.question}
                  </span>
                  <Plus
                    size={18}
                    weight="light"
                    className={`shrink-0 text-mute transition-transform duration-300 ${
                      open ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ${
                    open ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="max-w-[60ch] overflow-hidden text-sm leading-relaxed text-mute">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
