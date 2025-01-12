import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import CategoryFilterButton from "./CategoryFilter";
import SchoolFilterButton from "./SchoolFilter";
import AffiliationFilterButton from "./AffiliationFilter";
import { IClub } from "@/lib/models/Club";
import FollowFilterButton from "./FollowerFilter";

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
  netid: string;
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
  netid,
}: SearchControlProps) => {
  const [followedClubs, setFollowedClubs] = useState<string[]>([]);

  useEffect(() => {
    // Fetch followed clubs based on netid
    const fetchFollowedClubs = async () => {
      try {
        const response = await fetch(`/api/followed-clubs?netid=${netid}`);
        const data = await response.json();
        setFollowedClubs(data.followedClubs || []);
      } catch (error) {
        console.error("Error fetching followed clubs:", error);
      }
    };

    fetchFollowedClubs();
  }, [netid]);

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex-row basis-2/5 flex-shrink-0 flex-grow lg:basis-auto lg:flex-grow-0 mb-8">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="scale-10">
          <CategoryFilterButton
            // allGroups={allGroups}
            setFilteredGroups={setFilteredGroups}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
        </div>
        <div className="scale-10">
          <SchoolFilterButton
            setFilteredGroups={setFilteredGroups}
            selectedSchools={selectedSchools}
            setSelectedSchools={setSelectedSchools}
          />
        </div>
        <div className="scale-10">
          <AffiliationFilterButton
            setFilteredGroups={setFilteredGroups}
            selectedAffiliations={selectedAffiliations}
            setSelectedAffiliations={setSelectedAffiliations}
          />
        </div>
        <div className="scale-10">
          <FollowFilterButton
            allGroups={allGroups}
            setFilteredGroups={setFilteredGroups}
            followedClubs={followedClubs}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchControl;