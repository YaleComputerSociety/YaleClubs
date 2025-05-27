"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Banner from "./Banner";
import { CgProfile } from "react-icons/cg";

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Button } from "@heroui/button";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
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
        window.location.href = "/";
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const authButton =
    "px-6 py-2 rounded-full shadow-md hover:bg-clubBlurple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap";

  return (
    <div
      style={{ marginTop: `${bannerHeight}px` }}
      className="w-full flex flex-col fixed z-50 transition-[margin-top] duration-1000"
    >
      <Banner onHeightChange={(height) => setBannerHeight(height)} />
      <div className="flex flex-row w-full justify-between p-[22px] md:px-20 bg-background">
        <Link href="/" className="flex flex-row items-center">
          <Image src="/assets/logo.svg" alt="Logo" width={30} height={30} unoptimized />
          <div className="ml-3 font-semibold text-xl">YaleClubs</div>
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
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            className="w-11 h-11 px-6 py-6 text-lg rounded-full shadow-md hover:bg-clubBlurple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap"
                            variant="bordered"
                          >
                            <div>
                              <CgProfile size={35}></CgProfile>
                            </div>
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Link Actions" className="bg-white rounded-lg shadow-md p-2">
                          <DropdownItem key="profile" className="px-2 py-2 text-lg">
                            <Link href="/Profile">Profile</Link>
                          </DropdownItem>
                          <DropdownItem
                            key="signout"
                            className="px-2 py-2 text-lg"
                            onPress={() => {
                              logout().then(() => {
                                setIsMenuOpen(false);
                              });
                            }}
                          >
                            Sign Out
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    ) : (
                      <Link
                        href="/api/auth/redirect"
                        onClick={() => setIsMenuOpen(false)}
                        className={authButton + " bg-clubPurple text-white"}
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
          <div className="hidden sm:flex flex-row items-center gap-x-12 text-xl font-semibold">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className="relative">
                <div
                  className={`${pathname === href ? "underline underline-offset-4 text-clubPurple" : ""} hover:text-clubPurple duration-300 transition-colors`}
                >
                  {label}
                </div>
              </Link>
            ))}
            {isLoggedIn ? (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="w-11 h-11 px-6 py-6 text-lg rounded-full shadow-md hover:bg-clubBlurple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap"
                    variant="bordered"
                  >
                    <div>
                      <CgProfile size={35}></CgProfile>
                    </div>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Link Actions" className="bg-white rounded-lg shadow-md p-2">
                  <DropdownItem key="profile" className="px-2 py-2 text-lg">
                    <Link href="/Profile">Profile</Link>
                  </DropdownItem>
                  <DropdownItem key="signout" className="px-2 py-2 text-lg" onPress={handleLogout}>
                    Sign Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Link href="/api/auth/redirect" className={authButton + " bg-clubPurple text-white"}>
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
