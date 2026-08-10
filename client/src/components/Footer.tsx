import { InstagramLogo, TiktokLogo, YoutubeLogo } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import logo from "../assets/logo-mark.png";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <img src={logo} alt="troy" className="h-20 w-auto md:h-24" />
            <p className="mt-4 max-w-[32ch] text-sm leading-relaxed text-mute">
              Matched wallpaper sets for MacBook and iPhone, shot in restrained tones.
            </p>
            <div className="mt-6 flex gap-4 text-mute">
              <a href="https://instagram.com" aria-label="Instagram" className="transition-colors hover:text-bone">
                <InstagramLogo size={18} weight="light" />
              </a>
              <a href="https://tiktok.com" aria-label="TikTok" className="transition-colors hover:text-bone">
                <TiktokLogo size={18} weight="light" />
              </a>
              <a href="https://youtube.com" aria-label="YouTube" className="transition-colors hover:text-bone">
                <YoutubeLogo size={18} weight="light" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-bone">Shop</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-mute">
              <li>
                <Link to="/#collections" className="transition-colors hover:text-bone">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-bone">Support</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-mute">
              <li>
                <Link to="/#faq" className="transition-colors hover:text-bone">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:hello@troy.shop" className="transition-colors hover:text-bone">
                  Contact
                </a>
              </li>
              <li>
                <Link to="/#faq" className="transition-colors hover:text-bone">
                  Licensing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-bone">Legal</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-mute">
              <li>
                <a href="#" className="transition-colors hover:text-bone">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-bone">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-bone">
                  Refunds
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-6 text-xs text-mute md:flex-row md:items-center">
          <p>Copyright 2026 troy. All rights reserved.</p>
          <p>Personal device use only.</p>
        </div>
      </div>
    </footer>
  );
}
