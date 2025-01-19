"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Banner from "./Banner";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    // Set the initial value
    updateIsMobile();

    // Add event listener for changes
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  useEffect(() => {
    const token = document.cookie.includes("token=");
    setIsLoggedIn(token);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        setIsLoggedIn(false);
        window.location.reload();
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const authButton =
    "px-6 py-2 text-sm font-medium text-white bg-clubPurple rounded-full shadow-md hover:bg-clubBlurple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap";

  return (
    <div
      style={{ marginTop: `${bannerHeight}px` }}
      className="w-full flex flex-col fixed z-50 transition-[margin-top] duration-1000"
    >
      <Banner onHeightChange={(height) => setBannerHeight(height)} />
      <div className="flex flex-row w-full justify-between p-5 md:px-20 bg-background">
        <Link href="/" className="flex flex-row items-center">
          <Image src="/assets/logo.svg" alt="Logo" width={35} height={35} unoptimized />
          <div className="ml-5 font-semibold text-xl">YaleClubs</div>
        </Link>

      {isMobile ? (
        <div className="relative">
          <button onClick={() => setIsMenuOpen((prev) => !prev)} className="text-4xl focus:outline-none">
            ☰
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full bg-white shadow-lg rounded-md p-10">
              <ul className="flex flex-col items-start gap-4">
                <li>
                  <Link href="/Events" onClick={() => setIsMenuOpen(false)}>
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/Catalog" onClick={() => setIsMenuOpen(false)}>
                    Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/About" onClick={() => setIsMenuOpen(false)}>
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdBM9ccbynx2eQKVdCkpPDW-sIJArTWqUlMGGKuXz175iq0Og/viewform?usp=sf_link"
                    target="_blank"
                  >
                    Feedback
                  </Link>
                </li>
                <li>
                  {isLoggedIn ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-clubTaro to-clubTaro rounded-full shadow-md hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <Link
                      href="/api/auth/redirect"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-clubTaro to-clubTaro rounded-full shadow-md hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap"
                    >
                      Sign In
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden sm:flex flex-row items-center gap-x-11">
          <Link href="/Events">
            <div className="text-md">Events</div>
          </Link>
          <Link href="/Catalog">
            <div className="text-md">Catalog</div>
          </Link>
          <Link href="/About">
            <div className="text-md">About</div>
          </Link>
          <Link
            href="https://docs.google.com/forms/d/e/1FAIpQLSdBM9ccbynx2eQKVdCkpPDW-sIJArTWqUlMGGKuXz175iq0Og/viewform?usp=sf_link"
            target="_blank"
          >
            Feedback
          </Link>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-clubTaro to-clubTaro rounded-full shadow-md hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/api/auth/redirect"
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-clubTaro to-clubTaro rounded-full shadow-md hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
