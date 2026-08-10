import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import logo from "../assets/logo-mark.png";
import { useAuth } from "../admin/AuthContext";

const links = [
  { label: "Collections", href: "#collections" },
  { label: "FAQ", href: "#faq" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const reduce = useReducedMotion();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 md:h-20 md:px-10">
        <a href="#top" className="relative z-[60] block shrink-0" aria-label="troy home">
          <img src={logo} alt="troy" className="h-14 w-auto md:h-16" />
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-mute transition-colors hover:text-bone"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user && (
            <Link
              to="/admin"
              className="border border-line px-4 py-2 text-sm text-mute transition-colors hover:border-bone/40 hover:text-bone"
            >
              Admin
            </Link>
          )}
          <a
            href="#collections"
            className="shrink-0 border border-bone bg-bone px-5 py-2 text-sm font-medium text-ink transition-transform active:scale-[0.98]"
          >
            Shop Collections
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="relative z-[60] flex h-10 w-10 items-center justify-center text-bone md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3.5 w-5">
            <motion.span
              className="absolute left-0 top-0 block h-px w-full origin-center bg-bone"
              animate={
                reduce
                  ? undefined
                  : open
                    ? { y: 6.5, rotate: 45 }
                    : { y: 0, rotate: 0 }
              }
              transition={{ duration: 0.35, ease }}
            />
            <motion.span
              className="absolute left-0 top-1/2 block h-px w-full -translate-y-1/2 bg-bone"
              animate={reduce ? undefined : { opacity: open ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="absolute bottom-0 left-0 block h-px w-full origin-center bg-bone"
              animate={
                reduce
                  ? undefined
                  : open
                    ? { y: -6.5, rotate: -45 }
                    : { y: 0, rotate: 0 }
              }
              transition={{ duration: 0.35, ease }}
            />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-50 bg-ink md:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease }}
          >
            <motion.nav
              className="flex h-full flex-col justify-center gap-8 px-8"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: reduce ? 0 : 0.08 },
                },
              }}
            >
              {links.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="text-3xl font-semibold tracking-tight text-bone"
                  onClick={() => setOpen(false)}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.45, ease }}
                >
                  {link.label}
                </motion.a>
              ))}
              {user && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.45, ease }}
                >
                  <Link
                    to="/admin"
                    className="text-3xl font-semibold tracking-tight text-frost"
                    onClick={() => setOpen(false)}
                  >
                    Admin
                  </Link>
                </motion.div>
              )}
              <motion.a
                href="#collections"
                className="mt-4 inline-block w-fit border border-bone bg-bone px-6 py-3 text-sm font-medium text-ink"
                onClick={() => setOpen(false)}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.45, ease }}
              >
                Shop Collections
              </motion.a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
