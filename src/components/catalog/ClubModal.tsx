import React, { useEffect, useRef } from "react";
import { IClub } from "@/lib/models/Club";

type ClubModalProps = {
  club: IClub;
  onClose: () => void;
};

const ClubModal = ({ club, onClose }: ClubModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close modal on pressing Escape key
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="relative bg-white rounded-lg max-w-3xl h-5/6">
      <img src={club.backgroundImage} alt="Club Background" className="w-full h-48 object-cover rounded-t-lg mb-4" />
        {/* <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          &times;
        </button> */}
        <h2 className="text-2xl font-bold mb-4">{club.name}</h2>
        <p className="text-gray-700 mb-4">{club.description}</p>
      </div>
    </div>
  );
};

export default ClubModal;
