import { useState } from "react";
import { Link } from "react-router-dom";
import { List, X } from "@phosphor-icons/react";
import logo from "../assets/logo-mark.png";
import { useAuth } from "../admin/AuthContext";

const links = [
  { label: "Collections", href: "#collections" },
  { label: "All Access", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 md:h-20 md:px-10">
        <a href="#top" className="block shrink-0" aria-label="troy home">
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
          className="text-bone md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} weight="light" /> : <List size={22} weight="light" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-ink px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-5">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-base text-mute transition-colors hover:text-bone"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {user && (
              <Link
                to="/admin"
                className="text-base text-frost"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            )}
            <a
              href="#collections"
              className="mt-2 inline-block border border-bone bg-bone px-5 py-2.5 text-center text-sm font-medium text-ink"
              onClick={() => setOpen(false)}
            >
              Shop Collections
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
