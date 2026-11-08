"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Affiliation, Category, Intensity, School, RecruitmentStatus, IClub } from "@/lib/models/Club";
import "./FilterSidebar.css";

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
  clubs: IClub[];
  resultCount: number;
  onClose: () => void;
};

function FilterGroup({
  title,
  options,
  selected,
  setSelected,
  counts,
}: {
  title: string;
  options: string[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  counts?: Record<string, number>;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.filter((option, index) => index < 6 || selected.includes(option));
  return (
    <details className="filter-group" open>
      <summary>
        {title}
        <Image src="/assets/filters/chevron.svg" alt="" width={24} height={24} />
      </summary>
      <div className="filter-options">
        {visible.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(event) => {
                const checked = event.target.checked;
                setSelected((previous) =>
                  checked ? [...previous, option] : previous.filter((item) => item !== option),
                );
              }}
            />
            <span>
              {option}
              {counts && (
                <>
                  {" "}
                  <small>{counts[option] || 0}</small>
                </>
              )}
            </span>
          </label>
        ))}
        {options.length > 6 && (
          <button className="filter-see-all" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show fewer options" : "See all options"}
          </button>
        )}
      </div>
    </details>
  );
}

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
  clubs,
  resultCount,
  onClose,
}: Props) => {
  const counts = Object.fromEntries(
    Object.values(Category).map((category) => [
      category,
      clubs.filter((club) => club.categories?.includes(category)).length,
    ]),
  );
  const clearAll = () => {
    setSelectedSchools([]);
    setSelectedAffiliations([]);
    setSelectedIntensity([]);
    setSelectedApplicationStatus([]);
    setSelectedCategories([]);
    setShowFollowedOnly(false);
  };
  return (
    <aside id="browse-filters" className="filter-sidebar" aria-label="Club filters">
      <div className="filter-sidebar-toggle">
        <button onClick={onClose} aria-label="Hide filters" aria-expanded="true" aria-controls="browse-filters">
          <Image src="/assets/filters/sidebar.svg" alt="" width={24} height={24} />
        </button>
      </div>
      <div className="filter-sidebar-heading">
        <div>
          <h2>Filters</h2>
          <p>
            Showing {resultCount} of {clubs.length} clubs
          </p>
        </div>
        <button onClick={clearAll}>Clear all</button>
      </div>
      <FilterGroup
        title="Category"
        options={Object.values(Category).sort()}
        selected={selectedCategories}
        setSelected={setSelectedCategories}
        counts={counts}
      />
      <FilterGroup
        title="Application Status"
        options={Object.values(RecruitmentStatus)
          .filter((status) => status !== RecruitmentStatus.NOSELECTION)
          .sort()}
        selected={selectedApplicationStatus}
        setSelected={setSelectedApplicationStatus}
      />
      <FilterGroup
        title="Intensity"
        options={Object.values(Intensity)}
        selected={selectedIntensity}
        setSelected={setSelectedIntensity}
      />
      <FilterGroup
        title="Affiliations"
        options={Object.values(Affiliation).sort()}
        selected={selectedAffiliations}
        setSelected={setSelectedAffiliations}
      />
      <FilterGroup
        title="Schools"
        options={Object.values(School).sort()}
        selected={selectedSchools}
        setSelected={setSelectedSchools}
      />
      {isLoggedIn && (
        <label className="filter-followed">
          <input
            type="checkbox"
            checked={showFollowedOnly}
            onChange={(event) => setShowFollowedOnly(event.target.checked)}
          />
          Show followed only
        </label>
      )}
    </aside>
  );
};

export default FilterModal;
