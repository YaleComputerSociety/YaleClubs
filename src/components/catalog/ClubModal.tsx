import React, { useEffect, useRef, useState } from "react";
import { IClub } from "@/lib/models/Club";

type ClubModalProps = {
  club: IClub;
  onClose: () => void;
};

const ClubModal = ({ club, onClose }: ClubModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg max-w-3xl w-full mx-5 md:mx-auto h-5/6 overflow-hidden"
      >
        <img
          src={club.backgroundImage || "/assets/default-background.png"}
          alt="Club Background"
          className="w-full h-48 object-cover rounded-t-lg mb-4"
        />
        <div className="flex flex-col md:flex-row m-4 gap-8 h-[calc(100%-14rem)] overflow-y-auto">
          <div className="flex flex-col md:w-2/3">
            <div className={`${club.name.length > 100 ? "text-2xl" : "text-3xl"} font-bold`}>{club.name}</div>
            {club.categories.length > 0 && (
              <div className="flex gap-2 whitespace-nowrap w-full flex-wrap mt-4">
                {club.categories.map((tag, index) => (
                  <span key={index} className="bg-[#eee] rounded px-2 py-1 text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {club.affiliation ? (
              <div className="w-fit bg-[#fdf] rounded px-2 py-1 text-sm mt-4">{club.affiliation}</div>
            ) : (
              <div className="text-gray-700 text-md mt-4">Unknown affiliation</div>
            )}
            <div className="text-gray-700 mt-4">{club.description || "No description"}</div>
            {club.leaders.length > 0 && (
              <div className="mt-4">
                <div className="text-xl font-bold">Board</div>
                <div className="relative">
                  <div
                    className="flex flex-row gap-4 mt-2 overflow-x-auto whitespace-nowrap"
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                  >
                    {!isScrolledToStart && (
                      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-white pointer-events-none"></div>
                    )}
                    {!isScrolledToEnd && (
                      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-r from-transparent to-white pointer-events-none"></div>
                    )}

                    {club.leaders.map((leader, index) => (
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
          </div>
          <div className="flex flex-col">
            <div className="text-gray-700 mb-4">something</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubModal;
