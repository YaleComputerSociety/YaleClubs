import React, { useState, useRef, useEffect } from "react";
import { IClubInput, RecruitmentStatus } from "@/lib/models/Club";

interface RecruitmentDropdownProps {
  selectedRecruitment: RecruitmentStatus;
  handleChange: (field: keyof IClubInput, value: string | RecruitmentStatus | undefined) => void;
}

const RecruitmentStatusDropdown: React.FC<RecruitmentDropdownProps> = ({ selectedRecruitment, handleChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Recruitment Status
        <div
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="border border-gray-300 rounded-lg px-4 py-2 cursor-pointer bg-white"
        >
          {selectedRecruitment ? (
            <span>{selectedRecruitment}</span>
          ) : (
            <span className="text-gray-400">Select recruitment status</span>
          )}
        </div>
      </label>

      {isDropdownOpen && (
        <div className="absolute max-h-60 w-full overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
          {Object.values(RecruitmentStatus).map((status) => (
            <div
              key={status}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-200`}
              onClick={() => {
                handleChange("recruitmentStatus", status);
                setIsDropdownOpen(false);
              }}
            >
              {status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruitmentStatusDropdown;
