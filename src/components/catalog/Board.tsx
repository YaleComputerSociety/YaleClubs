import { ClubLeader } from "@/lib/models/Club";
import React, { useEffect, useRef, useState } from "react";

export default function ScrollableLeaders({ leaders, isLoggedIn }: { leaders: ClubLeader[]; isLoggedIn: boolean }) {
  const [isScrolledToStart, setIsScrolledToStart] = useState(true);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const buffer = 1; // Small buffer to handle rounding inconsistencies

    setIsScrolledToStart(scrollLeft === 0);
    setIsScrolledToEnd(scrollLeft + clientWidth >= scrollWidth - buffer);
  };

  useEffect(() => {
    handleScroll();
  }, []);

  return (
    <>
      {leaders.length > 0 && (
        <div className="mt-4">
          <div className="text-lg font-bold">Board Members</div>
          <div className="relative">
            <div
              className="flex flex-row gap-2 sm:gap-3 mt-2 overflow-x-auto whitespace-nowrap scrollbar-hide"
              ref={scrollContainerRef}
              onScroll={handleScroll}
            >
              {!isScrolledToStart && (
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-white pointer-events-none"></div>
              )}
              {!isScrolledToEnd && (
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-r from-transparent to-white pointer-events-none"></div>
              )}

              {leaders.map((leader, index) => (
                <div
                  key={index}
                  className="flex items-center rounded-lg border-gray-200 border-2 text-xs sm:text-sm px-2 py-1"
                >
                  <div className="flex flex-col items-start">
                    <div className="flex flex-row justify-between w-full text-gray-800">
                      <div className="text-md font-semibold max-w-[160px] truncate pr-2 ">{leader.name}</div>
                      {(leader.year?.valueOf() || 0) > 0 && <div>{" '" + (leader.year ? leader.year % 100 : "")} </div>}
                    </div>
                    <div className="text-gray-700">{leader.role}</div>
                    {isLoggedIn && <div className="max-w-[180px] truncate text-gray-500">{leader.email}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
