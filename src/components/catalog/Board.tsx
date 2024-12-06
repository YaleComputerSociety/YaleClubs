import { ClubLeader } from "@/lib/models/Club";
import React, { useEffect, useRef, useState } from "react";

export default function ScrollableLeaders({ leaders }: { leaders: ClubLeader[] }) {
  const [isScrolledToStart, setIsScrolledToStart] = useState(true);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setIsScrolledToStart(scrollLeft === 0);
    setIsScrolledToEnd(scrollLeft + clientWidth >= scrollWidth);
  };

  useEffect(() => {
    handleScroll();
  }, []);

  return (
    <>
      {leaders.length > 0 && (
        <div className="mt-4">
          <div className="text-xl font-bold">Board</div>
          <div className="relative">
            <div
              className="flex flex-row gap-4 mt-2 overflow-x-auto whitespace-nowrap scrollbar-hide"
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
                <div key={index} className="flex items-center rounded-lg border p-2 text-sm">
                  <div className="flex flex-col items-start">
                    <div className="flex flex-row justify-between w-full">
                      <div className="text-md font-semibold">{leader.name}</div>
                      {leader.year && <div className="">{"'" + (leader.year % 100)} </div>}
                    </div>
                    <div className="">{leader.email}</div>
                    <div className="">{leader.role}</div>
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
