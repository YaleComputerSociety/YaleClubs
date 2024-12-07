import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import FilterButton from "./Filter";
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

  // Initialize Trie with club names
  useEffect(() => {
    setIsLoading(true);
    const newTrie = new Trie();
    clubs.forEach((club) => newTrie.insert(club.name, ""));
    setTrie(newTrie);
    setIsLoading(false);
  }, [clubs, setIsLoading]);

  // Filter clubs based on search query, categories, schools, and affiliations
  useEffect(() => {
    if (!trie || clubs.length === 0) return;

    setIsLoading(true);

    // Filter by search query
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

      filteredBySearch = clubs.filter((club) => matchingNames.includes(club.name.toLowerCase().trim()));
    }

    // Filter by categories
    const filteredByCategories =
      selectedCategories.length > 0
        ? filteredBySearch.filter((club) =>
            selectedCategories.some((selectedCategory) =>
              club.categories ? club.categories.includes(selectedCategory as Category) : false,
            ),
          )
        : filteredBySearch;

    // Filter by schools
    const filteredBySchools =
      selectedSchools.length > 0
        ? filteredByCategories.filter((club) =>
            selectedSchools.some((selectedSchool) => club.school?.includes?.(selectedSchool)),
          )
        : filteredByCategories;

    // Filter by affiliations
    const filteredByAffiliations =
      selectedAffiliations.length > 0
        ? filteredBySchools.filter((club) =>
            selectedAffiliations.some((selectedAffiliation) =>
              club.affiliations?.includes?.(selectedAffiliation as Affiliation),
            ),
          )
        : filteredBySchools;

    // Update the current clubs
    setCurrentClubs(filteredByAffiliations);
    setIsLoading(false);
  }, [
    searchQuery,
    selectedCategories,
    selectedSchools,
    selectedAffiliations,
    trie,
    clubs,
    setCurrentClubs,
    setIsLoading,
  ]);

  // Render the component
  return (
    <div className="flex flex-wrap gap-2 max-w-[1400px] flex-col items-center sm:flex-row mb-4">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="scale-10">
        <FilterButton
          selectedItems={selectedCategories}
          setSelectedItems={setSelectedCategories}
          allItems={Object.values(Category)}
          label="Categories"
        />
      </div>
      <div className="scale-10">
        <FilterButton
          selectedItems={selectedSchools}
          setSelectedItems={setSelectedSchools}
          allItems={Object.values(School)}
          label="Schools"
        />
      </div>
      <div className="scale-10">
        <FilterButton
          selectedItems={selectedAffiliations}
          setSelectedItems={setSelectedAffiliations}
          allItems={Object.values(Affiliation)}
          label="Affiliations"
        />
      </div>
    </div>
  );
};

export default SearchControl;
