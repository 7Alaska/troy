import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/collections", label: "Collections", end: false },
  { to: "/admin/subscribers", label: "Subscribers", end: false },
];

export function AdminShell() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-ink text-bone">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm font-semibold tracking-tight">troy admin</p>
            <p className="text-xs text-mute">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-mute hover:text-bone">
              View site
            </a>
            <button
              type="button"
              onClick={() => signOut()}
              className="border border-line px-3 py-1.5 text-sm text-mute hover:border-bone/40 hover:text-bone"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-6 px-6 pb-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? "text-bone" : "text-mute hover:text-bone"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
