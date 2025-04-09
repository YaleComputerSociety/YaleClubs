import React, { useState, useRef, useEffect } from "react";

interface SortButtonProps {
  sortOption: "followers" | "alphabetical";
  setSortOption: React.Dispatch<React.SetStateAction<"followers" | "alphabetical">>;
}

const SORT_OPTIONS: { label: string; value: "followers" | "alphabetical" }[] = [
  { label: "Followers", value: "followers" },
  { label: "A–Z", value: "alphabetical" },
];

const SortButton = ({ sortOption, setSortOption }: SortButtonProps) => {
  const [open, setOpen] = useState(false);
  const ButtonRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (ButtonRef.current && !ButtonRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectedLabel = SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label;

  return (
    <div ref={ButtonRef} className="relative">
      {/* Toggle Button */}
      <div
        className="px-2 py-2 rounded cursor-pointer w-[11rem] flex items-center justify-between h-10 md:h-11 hover:bg-gray-200 transition-colors duration-200 text-gray-700"
        onClick={() => setOpen((prev) => !prev)}
      >
       <span className="truncate">
          Sort by: <span className="text-blue-500">{selectedLabel}</span>
        </span>
        <span className="ml-2 text-xs">&#x25BC;</span>
      </div>

      {/* Button Items */}
      {open && (
        <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded shadow-lg z-10">
          {SORT_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
                sortOption === option.value ? "bg-gray-100 text-blue-600 font-medium" : "text-gray-700"
              }`}
              onClick={() => {
                setSortOption(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortButton;
