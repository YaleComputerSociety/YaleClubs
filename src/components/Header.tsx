import Link from "next/link";
import LogoSVG from "../../public/assets/logo";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

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
    <div className="w-full flex flex-row fixed z-10 justify-between py-5 px-5 md:px-[110px] bg-white">
      <Link href="/" className="flex flex-row items-center">
        <LogoSVG />
        <div className="ml-5 font-semibold text-[16px]">YaleClubs</div>
      </Link>

      {isMobile ? (
        <div className="relative">
          <button onClick={() => setIsMenuOpen((prev) => !prev)} className="text-2xl focus:outline-none">
            ☰
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full bg-white shadow-lg rounded-md p-10">
              <ul className="flex flex-col items-start gap-4">
                <li>
                  <Link href="/About" onClick={() => setIsMenuOpen(false)}>
                    About
                  </Link>
                </li>
                <li>
                  {isLoggedIn ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-md hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <Link
                      href="/api/auth/redirect"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-md hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap"
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
          <Link href="/About">
            <div className="text-md">About</div>
          </Link>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-md hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/api/auth/redirect"
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-md hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-300 whitespace-nowrap"
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
