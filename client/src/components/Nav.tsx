import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";
import logo from "../assets/logo-mark.png";
import { useAuth } from "../admin/AuthContext";
import { useTheme } from "../theme/ThemeProvider";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";

const links = [
  { label: "Collections", to: "/#collections" },
  { label: "FAQ", to: "/#faq" },
];

const ease = [0.16, 1, 0.3, 1] as const;

function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <AnimatedThemeToggler
      theme={theme}
      onThemeChange={setTheme}
      variant="circle"
      fromCarousel
      duration={450}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      className={`inline-flex size-9 items-center justify-center text-bone ${className}`}
    />
  );
}

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

  const mobileMenu =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="mobile-menu"
                className="fixed inset-0 z-[70] bg-ink md:hidden"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease }}
              >
                <div className="absolute inset-0 bg-ink" aria-hidden="true" />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex h-[72px] items-center justify-between px-6">
                    <Link
                      to="/"
                      className="block shrink-0"
                      aria-label="troy home"
                      onClick={() => setOpen(false)}
                    >
                      <img src={logo} alt="troy" className="logo-mark h-14 w-auto" />
                    </Link>
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="flex h-10 w-10 items-center justify-center text-bone"
                      onClick={() => setOpen(false)}
                    >
                      <span className="relative block h-3.5 w-5">
                        <span className="absolute left-0 top-1/2 block h-px w-full -translate-y-1/2 rotate-45 bg-bone" />
                        <span className="absolute left-0 top-1/2 block h-px w-full -translate-y-1/2 -rotate-45 bg-bone" />
                      </span>
                    </button>
                  </div>

                  <motion.nav
                    className="flex flex-1 flex-col justify-center gap-8 px-8 pb-16"
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={{
                      hidden: {},
                      show: {
                        transition: {
                          staggerChildren: reduce ? 0 : 0.07,
                          delayChildren: reduce ? 0 : 0.08,
                        },
                      },
                    }}
                  >
                    {links.map((link) => (
                      <motion.div
                        key={link.label}
                        variants={{
                          hidden: { opacity: 0, y: 24 },
                          show: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.45, ease }}
                      >
                        <Link
                          to={link.to}
                          className="text-3xl font-semibold tracking-tight text-bone"
                          onClick={() => setOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
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
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 24 },
                        show: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.45, ease }}
                    >
                      <Link
                        to="/#collections"
                        className="mt-4 inline-block w-fit border border-bone bg-bone px-6 py-3 text-sm font-medium text-ink"
                        onClick={() => setOpen(false)}
                      >
                        Shop Collections
                      </Link>
                    </motion.div>
                  </motion.nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <>
      <header className="nav-vt fixed inset-x-0 top-0 z-50 border-b border-line bg-ink">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 md:h-20 md:px-10">
          <Link to="/" className="relative z-[60] block shrink-0" aria-label="troy home">
            <img src={logo} alt="troy" className="logo-mark h-14 w-auto md:h-16" />
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm text-mute transition-colors hover:text-bone"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {user && (
              <Link
                to="/admin"
                className="border border-line px-4 py-2 text-sm text-mute transition-colors hover:border-bone/40 hover:text-bone"
              >
                Admin
              </Link>
            )}
            <Link
              to="/#collections"
              className="shrink-0 border border-bone bg-bone px-5 py-2 text-sm font-medium text-ink transition-transform active:scale-[0.98]"
            >
              Shop Collections
            </Link>
          </div>

          <div className="relative z-[60] flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center text-bone"
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
        </div>
      </header>
      {mobileMenu}
    </>
  );
}
