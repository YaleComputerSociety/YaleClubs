"use client";

import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

const SurveyBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    setIsVisible(false);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white transition-transform duration-500 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {isMobile ? (
        <div className="flex flex-col items-center justify-center px-6 py-2 text-center">
          <p className="text-lg font-semibold mt-1">We value your feedback!</p>
          <p className="mt-2 text-sm">Take a quick survey to help us improve.</p>
          <div className="flex items-center gap-4 mt-5 mb-4">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdWza7qy36fv--_etRTFof-uX7zogo9mrQPi4mg2uAkQBxDEw/viewform?usp=sf_link"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 text-sm font-semibold bg-white text-indigo-600 rounded-full hover:bg-gray-200"
            >
              Take Survey
            </a>
            <button onClick={handleClose} className="text-white text-xl hover:text-gray-300 focus:outline-none">
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-between px-10 py-24 md:px-20 md:py-12">
          <div className="text-center md:text-left text-lg md:text-xl font-semibold">
            <p>We value your feedback!</p>
            <p className="mt-2">Take a quick survey to help us improve.</p>
          </div>
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdWza7qy36fv--_etRTFof-uX7zogo9mrQPi4mg2uAkQBxDEw/viewform?usp=sf_link"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 text-lg font-semibold bg-white text-indigo-600 rounded-full hover:bg-gray-200"
            >
              Take Survey
            </a>
            <button onClick={handleClose} className="text-white text-2xl hover:text-gray-300 focus:outline-none">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyBanner;
