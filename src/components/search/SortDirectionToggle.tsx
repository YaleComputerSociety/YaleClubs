import React from "react";

interface SortDirectionToggleProps {
  sortDirection: "asc" | "desc";
  setSortDirection: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
}

const SortDirectionToggle = ({ sortDirection, setSortDirection }: SortDirectionToggleProps) => {
  const handleToggle = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <button
      onClick={handleToggle}
      title={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
      className="w-10 h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
    >
      <svg
        className={`w-6 h-6 text-gray-700 transform transition-transform duration-200 ${
          sortDirection === "asc" ? "rotate-180" : ""
        }`}
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 3v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};

export default SortDirectionToggle;


