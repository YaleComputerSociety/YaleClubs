"use client";

import { useState, useEffect } from "react";

const SurveyBanner = () => {
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
    localStorage.clear();
    const isClosed = localStorage.getItem("surveyBannerClosed");
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
    localStorage.setItem("surveyBannerClosed", "true");
  };

  return (
    <div
      className={`fixed ${isMobile ? "py-4" : "py-5"} top-0 left-0 right-0 z-50 bg-indigo-600 text-white transition-transform duration-500 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {isMobile ? (
        <div className="flex flex-col items-center justify-center px-0 py-0 text-center">
          <p>
            We value your feedback! Take a quick{" "}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdBM9ccbynx2eQKVdCkpPDW-sIJArTWqUlMGGKuXz175iq0Og/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              survey
            </a>{" "}
            to help us improve.{" "}
          </p>
          <button onClick={handleClose} className="text-white hover:text-gray-300 focus:outline-none">
            &times;
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-10 py-2">
          {/* Centered message */}
          <div className="text-center flex-grow">
            <p>
              We value your feedback! Take a quick{" "}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdBM9ccbynx2eQKVdCkpPDW-sIJArTWqUlMGGKuXz175iq0Og/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                survey
              </a>{" "}
              to help us improve.
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="text-white text-l hover:text-gray-300 focus:outline-none ml-4"
            aria-label="Close banner"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default SurveyBanner;
