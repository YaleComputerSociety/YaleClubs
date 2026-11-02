"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Compass, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function DisplayHeader() {
  const { isLoggedIn, logout } = useAuth();
  const pathname = usePathname();
  return (
    <header className="nav">
      <div className="nav-inner">
        <nav className="nav-left" aria-label="Primary">
          <Link className="nav-logo" href="/" aria-label="YaleClubs home">
            ♣
          </Link>
          <Link
            className={`nav-link ${pathname === "/" ? "active" : ""}`}
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <Compass size={16} />
            Discover
          </Link>
          <Link
            className={`nav-link ${pathname.startsWith("/Events") ? "active" : ""}`}
            href="/Events"
            aria-current={pathname.startsWith("/Events") ? "page" : undefined}
          >
            <Calendar size={16} />
            Events
          </Link>
        </nav>
        <nav className="nav-right" aria-label="Account">
          {isLoggedIn && (
            <Link className="nav-link secondary-link" href="/analytics">
              Analytics
            </Link>
          )}
          <Link className="nav-link secondary-link" href="/about">
            About
          </Link>
          {isLoggedIn ? (
            <>
              <Link className="icon-btn" href="/Profile" aria-label="Profile">
                <UserCircle size={24} />
              </Link>
              <button className="nav-link" onClick={() => void logout()}>
                Sign Out
              </button>
            </>
          ) : (
            <a className="nav-link" href="/api/auth/redirect">
              Sign In
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
