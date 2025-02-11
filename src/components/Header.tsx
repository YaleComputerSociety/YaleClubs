"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  const pathname = usePathname();

  const links = [
    { href: "/", label: "Clubs" },
    { href: "/Events", label: "Events" },
    { href: "/about", label: "About" },
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    // Set the initial value
    updateIsMobile();

    // Add event listener for changes
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const authButton =
    "px-6 py-2 text-white bg-clubPurple rounded-full shadow-md hover:bg-clubBlurple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap";

  return (
    <div className="w-full flex flex-col fixed z-50 transition-[margin-top] duration-1000">
      <div className="flex flex-row w-full justify-between p-[22px] md:px-20 bg-background">
        <Link href="/" className="flex flex-row items-center">
          <Image src="/assets/logo.svg" alt="Logo" width={35} height={35} unoptimized />
          <div className="ml-2 font-semibold text-xl">YaleClubs</div>
        </Link>

        {isMobile ? (
          <div className="relative">
            <button onClick={() => setIsMenuOpen((prev) => !prev)} className="text-4xl focus:outline-none">
              ☰
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full bg-white shadow-lg rounded-md p-4 mt-2">
                <ul className="flex flex-col items-center gap-4 font-semibold text-lg">
                  <li>
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>
                      Clubs
                    </Link>
                  </li>
                  <li>
                    <Link href="/Events" onClick={() => setIsMenuOpen(false)}>
                      Events
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" onClick={() => setIsMenuOpen(false)}>
                      About
                    </Link>
                  </li>
                  <li>
                    {isLoggedIn ? (
                      <button
                        onClick={() => {
                          logout().then(() => {
                            setIsMenuOpen(false);
                          });
                        }}
                        className={authButton}
                      >
                        Sign Out
                      </button>
                    ) : (
                      <Link href="/api/auth/redirect" onClick={() => setIsMenuOpen(false)} className={authButton}>
                        Sign In
                      </Link>
                    )}
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden sm:flex flex-row items-center gap-x-12 text-xl font-semibold">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className="relative">
                <div
                  className={`${pathname === href ? "underline underline-offset-4" : ""} hover:text-clubPurple duration-300 transition-colors`}
                >
                  {label}
                </div>
              </Link>
            ))}
            {isLoggedIn ? (
              <button onClick={handleLogout} className={authButton}>
                Sign Out
              </button>
            ) : (
              <Link href="/api/auth/redirect" className={authButton}>
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
