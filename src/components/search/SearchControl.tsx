import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import CategoryFilterButton from "./CategoryFilter";
import SchoolFilterButton from "./SchoolFilter";
import AffiliationFilterButton from "./AffiliationFilter";
import { Affiliation, Category, IClub, School } from "@/lib/models/Club";
import Trie from "./Trie";

interface SearchControlProps {
  clubs: IClub[];
  setCurrentClubs: React.Dispatch<React.SetStateAction<IClub[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchControl = ({ clubs, setCurrentClubs, setIsLoading }: SearchControlProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([School.COLLEGE]);
  const [selectedAffiliations, setSelectedAffiliations] = useState<string[]>([]);
  const [trie, setTrie] = useState<Trie | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const newTrie = new Trie();
    clubs.forEach((club) => newTrie.insert(club.name, ""));
    setTrie(newTrie);
    setIsLoading(false);
  }, [clubs, setIsLoading]);

  // Filter clubs based on search query and selected categories
  useEffect(() => {
    if (!trie || clubs.length === 0) {
      return;
    }

    setIsLoading(true);
    let filteredBySearch = clubs;

    if (searchQuery.trim() !== "") {
      const queryWords = searchQuery
        .toLowerCase()
        .split(" ")
        .filter((word) => word.trim() !== "");

      let matchingNames = trie.getWordsWithPrefixes(queryWords, clubs);
      matchingNames = matchingNames
        .filter((name) => name !== undefined && name !== null)
        .map((name) => name.toLowerCase());

      filteredBySearch = clubs.filter((club) => {
        const isMatch = matchingNames.includes(club.name.toLowerCase().trim());
        return isMatch;
      });
    }

    // filter based on the selected categories
    let filteredByCategories;
    if (selectedCategories.length > 0) {
      filteredByCategories = filteredBySearch.filter((club) =>
        selectedCategories.some((selectedCategory) =>
          club.categories ? club.categories.includes(selectedCategory as Category) : false,
        ),
      );
    } else {
      filteredByCategories = filteredBySearch;
    }
    // filter based on selected schools
    let filteredBySchools;
    if (selectedSchools.length > 0) {
      filteredBySchools = filteredByCategories.filter((club) =>
        selectedSchools.some((selectedSchool) => club.school?.includes?.(selectedSchool)),
      );
    } else {
      filteredBySchools = filteredByCategories;
    }

    let filteredByAffiliations;
    if (selectedAffiliations.length > 0) {
      filteredByAffiliations = filteredBySchools.filter((club) =>
        selectedAffiliations.some((selectedAffiliations) =>
          club.affiliations?.includes?.(selectedAffiliations as Affiliation),
        ),
      );
    } else {
      filteredByAffiliations = filteredBySchools;
    }

    // Sort
    // const sortedFilteredGroups = filteredBySchools.sort((a, b) => a.name.localeCompare(b.name));

    setCurrentClubs(filteredByAffiliations);
    setIsLoading(false);
  }, [
    searchQuery,
    selectedCategories,
    selectedAffiliations,
    selectedSchools,
    trie,
    clubs,
    setCurrentClubs,
    setIsLoading,
  ]);

  return (
    <div className="flex flex-wrap gap-2 max-w-[1400px] flex-col items-center md:flex-row mb-4">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="scale-10">
        <CategoryFilterButton selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} />
      </div>
      <div className="scale-10">
        <SchoolFilterButton selectedSchools={selectedSchools} setSelectedSchools={setSelectedSchools} />
      </div>
      <div className="scale-10">
        <AffiliationFilterButton
          selectedAffiliations={selectedAffiliations}
          setSelectedAffiliations={setSelectedAffiliations}
        />
      </div>
    </div>
  );
};

export default SearchControl;
