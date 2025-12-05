"use client";

import React, { useEffect, useRef, useState } from "react";
import Filter from "../Filter";
import FollowFilter from "./FollowFilter";
import { Affiliation, Category, Intensity, School, RecruitmentStatus } from "@/lib/models/Club";

type Props = {
  selectedSchools: string[];
  setSelectedSchools: React.Dispatch<React.SetStateAction<string[]>>;

  selectedAffiliations: string[];
  setSelectedAffiliations: React.Dispatch<React.SetStateAction<string[]>>;

  selectedIntensity: string[];
  setSelectedIntensity: React.Dispatch<React.SetStateAction<string[]>>;

  selectedApplicationStatus: string[];
  setSelectedApplicationStatus: React.Dispatch<React.SetStateAction<string[]>>;

  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;

  showFollowedOnly: boolean;
  setShowFollowedOnly: React.Dispatch<React.SetStateAction<boolean>>;

  isLoggedIn: boolean;
};

const FilterModal = ({
  selectedSchools,
  setSelectedSchools,
  selectedAffiliations,
  setSelectedAffiliations,
  selectedIntensity,
  setSelectedIntensity,
  selectedApplicationStatus,
  setSelectedApplicationStatus,
  selectedCategories,
  setSelectedCategories,
  showFollowedOnly,
  setShowFollowedOnly,
  isLoggedIn,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const activeCount =
    selectedSchools.length +
    selectedAffiliations.length +
    selectedIntensity.length +
    selectedApplicationStatus.length +
    selectedCategories.length +
    (showFollowedOnly ? 1 : 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) setIsOpen(false);
  };

  const clearAll = () => {
    setSelectedSchools([]);
    setSelectedAffiliations([]);
    setSelectedIntensity([]);
    setSelectedApplicationStatus([]);
    setSelectedCategories([]);
    setShowFollowedOnly(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 rounded-md border hover:bg-gray-100 flex items-center gap-2 text-sm"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-4 h-4 fill-current">
          <path d="M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z" />
        </svg>
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div ref={modalRef} onClick={onBackdropClick} className="fixed inset-0 z-50 bg-black/40">
          <div
            className="absolute top-[100px] left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white rounded-lg shadow-lg p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <div className="flex items-center gap-2">
                <button onClick={clearAll} className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded">
                  Clear all
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 rounded bg-violet-500 text-white text-sm hover:bg-violet-600"
                >
                  Done
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Filter
                  selectedItems={selectedSchools}
                  setSelectedItems={setSelectedSchools}
                  allItems={Object.values(School).sort()}
                  label="Schools"
                />
              </div>

              <div>
                <Filter
                  selectedItems={selectedAffiliations}
                  setSelectedItems={setSelectedAffiliations}
                  allItems={Object.values(Affiliation).sort()}
                  label="Affiliations"
                />
              </div>

              <div>
                <Filter
                  selectedItems={selectedIntensity}
                  setSelectedItems={setSelectedIntensity}
                  allItems={Object.values(Intensity).sort()}
                  label="Intensity"
                />
              </div>

              <div>
                <Filter
                  selectedItems={selectedApplicationStatus}
                  setSelectedItems={setSelectedApplicationStatus}
                  allItems={[...Object.values(RecruitmentStatus)].sort()}
                  label="Application Status"
                />
              </div>

              <div>
                <Filter
                  selectedItems={selectedCategories}
                  setSelectedItems={setSelectedCategories}
                  allItems={[...Object.values(Category)].sort()}
                  label="Categories"
                />
              </div>

              {isLoggedIn && (
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="text-sm text-gray-700">Show followed only</div>
                    <FollowFilter showFollowedOnly={showFollowedOnly} setShowFollowedOnly={setShowFollowedOnly} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterModal;
