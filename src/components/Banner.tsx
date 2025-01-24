"use client";

import { useState, useEffect, useRef } from "react";

interface BannerProps {
  onHeightChange: (height: number) => void;
}

const Banner: React.FC<BannerProps> = ({ onHeightChange }) => {
  const BANNER_DELAY = 5000;
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    // Set the initial value
    updateIsMobile();

    // Add event listener for changes
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => {
      // Cleanup event listener
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, []);

  useEffect(() => {
    const isClosed = localStorage.getItem("bannerClosed");
    if (!isClosed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        if (bannerRef.current) {
          onHeightChange(bannerRef.current.offsetHeight);
        }
      }, BANNER_DELAY);

      return () => clearTimeout(timer);
    }
    return () => {}; // Return empty cleanup function for closed banner case
  }, [onHeightChange]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("bannerClosed", "true");
    onHeightChange(0);
  };

  return (
    <div
      ref={bannerRef}
      className={`fixed p-2 sm:p-0 top-0 left-0 right-0 z-50 bg-clubPurple text-white transition-transform duration-1000 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {isMobile ? (
        <div className="flex justify-center gap-5 px-5 py-0 text-l">
          <p>
            <a href="https://yaleclubs.canny.io" target="_blank" rel="noopener noreferrer" className="underline">
              We want your feedback! Take a quick survey to help us improve.
            </a>
          </p>
          <button onClick={handleClose} className="text-white hover:text-gray-300 focus:outline-none px-2 text-4xl">
            &times;
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-0 py-2">
          <div className="text-center flex-grow text-xl">
            <p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdBM9ccbynx2eQKVdCkpPDW-sIJArTWqUlMGGKuXz175iq0Og/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                We want your feedback! Take a quick <span className="underline">survey</span> to help us improve.
              </a>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 focus:outline-none text-4xl px-2 sm:mr-4"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default Banner;
