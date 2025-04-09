import React, { useState, useRef, useEffect } from "react";

interface SortButtonProps {
  sortOption: "followers" | "alphabetical";
  sortDirection: "asc" | "desc";
  setSortOption: React.Dispatch<React.SetStateAction<"followers" | "alphabetical">>;
  setSortDirection: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
}

const SORT_OPTIONS = [
  { label: "Fo ↓", value: { option: "followers", direction: "desc" } },
  { label: "Fo ↑", value: { option: "followers", direction: "asc" } },
  { label: "A–Z", value: { option: "alphabetical", direction: "asc" } },
  { label: "Z–A", value: { option: "alphabetical", direction: "desc" } },
];

const SortButton = ({
  sortOption,
  sortDirection,
  setSortOption,
  setSortDirection,
}: SortButtonProps) => {
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

  const selectedLabel =
    SORT_OPTIONS.find(
      (opt) =>
        opt.value.option === sortOption && opt.value.direction === sortDirection
    )?.label ?? "Sort";

  return (
    <div ref={ButtonRef} className="relative">
      {/* Toggle Button */}
     <div
        className="px-3 h-10 w-full w-[6.5rem] flex items-center justify-between border border-l-0 border-gray-300 bg-white rounded-r-md cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="truncate text-sm">
          <span className="text-gray-600">Sort:</span>{" "}
          <span className="text-blue-500">{selectedLabel}</span>
        </span>
        <span className="ml-1 text-xs">&#x25BC;</span>
      </div>


      {/* Dropdown Items */}
      {open && (
        <div className="absolute mt-2 w-full w-[7rem] bg-white border border-gray-300 rounded shadow-lg z-10">
          {SORT_OPTIONS.map((option) => {
            const isSelected =
              sortOption === option.value.option &&
              sortDirection === option.value.direction;

            return (
              <div
                key={`${option.value.option}-${option.value.direction}`}
                className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
                  isSelected
                    ? "bg-gray-100 text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  setSortOption(option.value.option);
                  setSortDirection(option.value.direction);
                  setOpen(false);
                }}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SortButton;
