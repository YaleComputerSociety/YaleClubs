import React from "react";
import SearchBar from "./SearchBar";
import CategoryFilterButton from "./CategoryFilter";
import SchoolFilterButton from "./SchoolFilter";
import AffiliationFilterButton from "./AffiliationFilter";
import { IClub } from "@/lib/models/Club";

interface SearchControlProps {
  allGroups: IClub[];
  setFilteredGroups: React.Dispatch<React.SetStateAction<IClub[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAffiliations: string[];
  setSelectedAffiliations: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSchools: string[];
  setSelectedSchools: React.Dispatch<React.SetStateAction<string[]>>;
}

const SearchControl = ({
  allGroups,
  setFilteredGroups,
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  selectedSchools,
  setSelectedSchools,
  selectedAffiliations,
  setSelectedAffiliations,
}: SearchControlProps) => {
  return (
    <div className="flex flex-wrap gap-2 mx-24 max-w-[1000px]">
      <div className="flex-row basis-2/5 flex-shrink-0 flex-grow lg:basis-auto">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="scale-10">
          <CategoryFilterButton
            allGroups={allGroups}
            setFilteredGroups={setFilteredGroups}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
        </div>
        <div className="scale-10">
          <SchoolFilterButton
            allGroups={allGroups}
            setFilteredGroups={setFilteredGroups}
            selectedSchools={selectedSchools}
            setSelectedSchools={setSelectedSchools}
          />
        </div>
        <div className="scale-10">
          <AffiliationFilterButton
            allGroups={allGroups}
            setFilteredGroups={setFilteredGroups}
            selectedAffiliations={selectedAffiliations}
            setSelectedAffiliations={setSelectedAffiliations}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchControl;
