import React, { useEffect, useRef } from "react";
import { IClub } from "@/lib/models/Club";

type ClubModalProps = {
  club: IClub;
  onClose: () => void;
};

const ClubModal = ({ club, onClose }: ClubModalProps) => {
  console.log(club);
  const modalRef = useRef<HTMLDivElement>(null);

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
            <div className={`${club.name.length > 100 ? "text-2xl" : "text-3xl"} font-bold mb-4`}>{club.name}</div>
            <div className="flex gap-2 whitespace-nowrap w-full flex-wrap">
              {club.categories.length > 0 &&
                club.categories.map((tag, index) => (
                  <span key={index} className="bg-[#eee] rounded px-2 py-1 text-sm">
                    {tag}
                  </span>
                ))}
            </div>
            {club.affiliation && (
              <div className="w-fit bg-[#fdf] rounded px-2 py-1 text-sm mt-4">{club.affiliation}</div>
            )}
            <div className="text-gray-700 mt-4">{club.description}</div>
            {club.leaders.length > 0 && (
              <div className="mt-4">
                <div className="text-lg font-bold">Board</div>
                {club.leaders.map((leader, index) => (
                  <div key={index} className="flex gap-4 items-center mt-2">
                    <div>
                      <div className="text-lg font-semibold">{leader.name}</div>
                    </div>
                  </div>
                ))}
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
