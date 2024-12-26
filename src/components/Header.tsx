"use client";

import Link from "next/link";
import LogoSVG from "../../public/assets/logo";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { RxHamburgerMenu } from "react-icons/rx";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });

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
        console.log("Logout successful");
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="header w-full flex items-center fixed z-20 py-5 px-5 md:px-[110px] bg-white ">
      {/* Left: Logo */}
      <div className="flex flex-row items-center flex-grow">
        <Link href="/" className="flex flex-row items-center">
          <LogoSVG />
          <div className="ml-5 font-semibold text-xl">YaleClubs</div>
        </Link>
      </div>

      {/* Center: Catalog and Events */}
      {!isMobile && (
        <div className="flex gap-x-8 items-center">
          <Link href="/" className="text-md font-medium hover:text-indigo-600">
            Catalog
          </Link>
          <Link href="/Events" className="text-md font-medium hover:text-indigo-600">
            Events
          </Link>
        </div>
      )}

      {/* Right: Hamburger Menu */}
      <div className="flex items-center relative">
        <button onClick={() => setIsMenuOpen((prev) => !prev)} className="text-4xl ml-8 focus:outline-none">
          <RxHamburgerMenu size={35} />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 top-full bg-white rounded-md p-5 w-56 z-50">
            <ul className="flex flex-col items-start gap-4 list-none">
              {isMobile && (
                <>
                  <li>
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>
                      Catalog
                    </Link>
                  </li>
                  <li>
                    <Link href="/Events" onClick={() => setIsMenuOpen(false)}>
                      Events
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/About" onClick={() => setIsMenuOpen(false)}>
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="https://docs.google.com/forms/d/e/1FAIpQLSdBM9ccbynx2eQKVdCkpPDW-sIJArTWqUlMGGKuXz175iq0Og/viewform?usp=sf_link"
                  target="_blank"
                  onClick={() => setIsMenuOpen(false)}
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
                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    href="/api/auth/redirect"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full  hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
