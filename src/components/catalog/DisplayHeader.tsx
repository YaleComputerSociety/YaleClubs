"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Calendar, Compass, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function DisplayHeader({ children }: { children?: React.ReactNode }) {
  const { isLoggedIn, logout } = useAuth();
  const pathname = usePathname();
  const profileMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      const menu = profileMenuRef.current;
      if (menu && !menu.contains(event.target as Node)) menu.open = false;
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      const menu = profileMenuRef.current;
      if (event.key === "Escape" && menu?.open) {
        menu.open = false;
        menu.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);
  return (
    <div className="nav-spacer">
      <header className="nav">
        <div className="nav-inner">
          <nav className="nav-left" aria-label="Primary">
            <Link className="nav-logo" href="/" aria-label="YaleClubs home">
              <Image className="nav-brand-mark" src="/assets/logo.svg" alt="" width={22} height={23} unoptimized />
            </Link>
            <Link
              className={`nav-link ${pathname === "/" ? "active" : ""}`}
              href="/"
              aria-label="Discover"
              aria-current={pathname === "/" ? "page" : undefined}
            >
              <Compass size={16} />
              <span className="nav-label">Discover</span>
            </Link>
            <Link
              className={`nav-link ${pathname.startsWith("/Events") ? "active" : ""}`}
              href="/Events"
              aria-label="Events"
              aria-current={pathname.startsWith("/Events") ? "page" : undefined}
            >
              <Calendar size={16} />
              <span className="nav-label">Events</span>
            </Link>
          </nav>
          <nav className="nav-right" aria-label="Account">
            {isLoggedIn && (
              <Link
                className={`nav-link secondary-link ${pathname === "/analytics" ? "active" : ""}`}
                href="/analytics"
                aria-current={pathname === "/analytics" ? "page" : undefined}
              >
                Analytics
              </Link>
            )}
            <Link
              className={`nav-link secondary-link ${pathname === "/about" ? "active" : ""}`}
              href="/about"
              aria-current={pathname === "/about" ? "page" : undefined}
            >
              About
            </Link>
            {children}
            {isLoggedIn ? (
              <details className="profile-menu" ref={profileMenuRef}>
                <summary className="icon-btn" aria-label="Profile menu">
                  <UserCircle size={24} />
                </summary>
                <div className="profile-menu-items">
                  <Link
                    href="/Profile"
                    onClick={() => {
                      if (profileMenuRef.current) profileMenuRef.current.open = false;
                    }}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      if (profileMenuRef.current) profileMenuRef.current.open = false;
                      void logout();
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </details>
            ) : (
              <a className="nav-link" href="/api/auth/redirect">
                Sign In
              </a>
            )}
          </nav>
        </div>
      </header>
    </div>
  );
}
