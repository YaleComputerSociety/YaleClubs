"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, forwardRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { casSignInHref } from "@/lib/devLogin";
import { clearYaleMojiCache, yalemojiBackgroundStyle } from "@/lib/yalemojiCache";
import { YALEMOJI_CREATE_URL, type YaleMojiAvatar } from "@/lib/yalemojiTypes";
import YaleMojiIdentity from "@/components/yalemoji/YaleMojiIdentity";
import YaleMojiLink from "@/components/yalemoji/YaleMojiLink";
import { useYaleMoji } from "@/components/yalemoji/useYaleMoji";
import Banner from "./Banner";
import { CgProfile } from "react-icons/cg";

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Button } from "@heroui/react";

const ProfileButtonFace = forwardRef<
  HTMLButtonElement,
  { avatar: YaleMojiAvatar | null; onError: () => void } & Record<string, any>
>(function ProfileButtonFace({ avatar, onError, className, style, ...props }, ref) {
  const face = avatar
    ? "h-11 w-11 min-w-11 overflow-hidden rounded-[9px] bg-clubBlurple p-0 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
    : "h-11 w-11 min-w-11 rounded-full px-0 text-lg shadow-md hover:bg-clubBlurple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300";

  return (
    <Button
      {...props}
      ref={ref}
      aria-label="Profile menu"
      variant="bordered"
      className={`${className ?? ""} ${face}`}
      style={avatar ? { ...style, ...yalemojiBackgroundStyle(avatar.background_url, 44) } : style}
    >
      {avatar ? (
        <Image
          src={avatar.png_url}
          alt=""
          width={44}
          height={44}
          unoptimized
          className="pointer-events-none h-full w-full object-contain"
          onError={onError}
        />
      ) : (
        <CgProfile size={28} />
      )}
    </Button>
  );
});

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const { isLoggedIn, logout, user } = useAuth();
  const { avatar, showPrompt, hideAvatar } = useYaleMoji(isLoggedIn ? user?.netid : undefined);
  const menuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const signInHref = casSignInHref(pathname);

  const links = [
    { href: "/", label: "Clubs" },
    { href: "/Events", label: "Events" },
    { href: "/about", label: "About" },
    ...(isLoggedIn ? [{ href: "/analytics", label: "Analytics" }] : []),
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();

    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        clearYaleMojiCache();
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

  const yalemojiIdentity =
    avatar || showPrompt ? (
      <YaleMojiIdentity variant="menu" avatar={avatar} showPrompt={showPrompt} onError={hideAvatar} />
    ) : undefined;

  const accountMenu = (onSignOut: () => void, itemClassName: string) => (
    <Dropdown>
      <DropdownTrigger>
        <ProfileButtonFace avatar={avatar} onError={hideAvatar} />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Link Actions"
        className="bg-white rounded-lg shadow-md p-2"
        topContent={yalemojiIdentity}
      >
        <DropdownItem key="profile" className={itemClassName}>
          <Link href="/Profile">Profile</Link>
        </DropdownItem>
        <DropdownItem key="signout" className={itemClassName} onPress={onSignOut}>
          Sign Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <div
      style={{ marginTop: `${bannerHeight}px` }}
      className="w-full flex flex-col fixed z-50 transition-[margin-top] duration-1000"
    >
      <Banner onHeightChange={(height) => setBannerHeight(height)} />
      <div className="flex flex-row w-full justify-between p-[22px] md:px-20 bg-background">
        <Link href="/" className="flex flex-row items-center">
          <Image src="/assets/logo.svg" alt="Logo" width={30} height={30} className="w-[30px] h-[30px]" unoptimized />
          <div className="ml-3 font-semibold text-xl">YaleClubs</div>
        </Link>

        {isMobile ? (
          <div className="relative" ref={menuRef}>
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
                  {isLoggedIn && (
                    <li>
                      <Link href="/analytics" onClick={() => setIsMenuOpen(false)}>
                        Analytics
                      </Link>
                    </li>
                  )}
                  {isLoggedIn && showPrompt && (
                    <li>
                      <YaleMojiLink
                        href={YALEMOJI_CREATE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMenuOpen(false)}
                        className="whitespace-nowrap text-center text-clubPurple"
                      >
                        Make your Yalemoji
                      </YaleMojiLink>
                    </li>
                  )}
                  <li>
                    {isLoggedIn ? (
                      accountMenu(() => {
                        logout().then(() => {
                          setIsMenuOpen(false);
                        });
                      }, "px-2 py-2 text-lg")
                    ) : (
                      <a
                        href={signInHref}
                        onClick={() => setIsMenuOpen(false)}
                        className={authButton + " bg-clubPurple text-white"}
                      >
                        Sign In
                      </a>
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
            {isLoggedIn && showPrompt && (
              <YaleMojiLink
                href={YALEMOJI_CREATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-clubPurple px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-clubBlurple"
              >
                Make your Yalemoji
              </YaleMojiLink>
            )}
            {isLoggedIn ? (
              accountMenu(handleLogout, "hover:text-clubPurple px-2 py-2 text-lg")
            ) : (
              <a href={signInHref} className={authButton + " bg-clubPurple text-white"}>
                Sign In
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
