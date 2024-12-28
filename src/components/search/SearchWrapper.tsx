import React, { useEffect, useState, useRef } from "react";

const SearchWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [searchControlHeight, setSearchControlHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const searchControlTopRef = useRef<number>(0); // Store the top value

  useEffect(() => {
    const updateHeights = () => {
      const searchControlElement = document.querySelector(".search-control");
      const headerElement = document.querySelector(".header");
      setSearchControlHeight(searchControlElement?.clientHeight || 0);
      setHeaderHeight(headerElement?.clientHeight || 0);
    };

    // Set initial heights
    updateHeights();

    // Update heights on window resize
    window.addEventListener("resize", updateHeights);
    return () => window.removeEventListener("resize", updateHeights);
  }, []);

  useEffect(() => {
    // Get the top position only once during the first render
    if (searchControlTopRef.current === 0) {
      const searchControlElement = document.querySelector(".search-control");
      searchControlTopRef.current = searchControlElement?.getBoundingClientRect().top || 0;
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const searchControlHeight = document.querySelector(".search-control")?.getBoundingClientRect().top || 0;

      setIsSticky(
        searchControlHeight <= headerHeight + 10 && window.scrollY > searchControlTopRef.current - headerHeight - 10,
      );
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headerHeight]);

  return (
    <>
      <div
        className={`${isSticky ? "fixed left-0 w-full z-40 bg-white shadow px-5 md:py-2 md:px-20" : ""}`}
        style={{ top: `${headerHeight}px` }}
      >
        {children}
      </div>
      {isSticky && <div style={{ marginTop: `${searchControlHeight}px` }} />}
    </>
  );
};

export default SearchWrapper;
