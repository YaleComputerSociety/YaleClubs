"use client";

import { useState, useEffect } from "react";

const Banner = () => {
  const BANNER_DELAY = 5000;
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    localStorage.clear(); // MAKE SURE TO COMMENT THIS OUT WHEN COMMITTING
    const isClosed = localStorage.getItem("bannerClosed");
    if (!isClosed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, BANNER_DELAY);

      return () => clearTimeout(timer);
    }
    return;
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("bannerClosed", "true");
  };

  return (
    <div
      className={`fixed ${isMobile ? "py-4" : "py-5"} top-0 left-0 right-0 z-50 bg-indigo-600 text-white transition-transform duration-500 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {isMobile ? (
        <div className="flex justify-center gap-5 px-5 py-0 text-l">
          <p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdBM9ccbynx2eQKVdCkpPDW-sIJArTWqUlMGGKuXz175iq0Og/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              We want your feedback! Take a quick survey to help us improve.
            </a>
          </p>
          <button onClick={handleClose} className="text-white hover:text-gray-300 focus:outline-none px-2 text-4xl">
            &times;
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-0 py-2">
          {/* Centered message */}
          <div className="text-center flex-grow text-xl">
            <p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdBM9ccbynx2eQKVdCkpPDW-sIJArTWqUlMGGKuXz175iq0Og/viewform"
                target="_blank"
                rel="noopener noreferrer"
              >
                We want your feedback! Take a quick <span className="underline">survey</span> to help us improve.
              </a>
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 focus:outline-none px-2 text-4xl mr-4"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default Banner;
