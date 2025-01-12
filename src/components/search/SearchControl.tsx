import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import FilterButton from "./Filter";
import { Affiliation, Category, IClub, School } from "@/lib/models/Club";
import Trie from "./Trie";

interface SearchControlProps {
  clubs: IClub[];
  setCurrentClubs: React.Dispatch<React.SetStateAction<IClub[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  followedClubs: string[];
}

const ResetButton = ({ onReset }: { onReset: () => void }) => {
  return (
    <button onClick={onReset} className="bg-[#f66] text-white px-4 rounded">
      Reset
    </button>
  );
};

const SearchControl = ({ clubs, setCurrentClubs, setIsLoading, followedClubs }: SearchControlProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([School.COLLEGE]);
  const [trie, setTrie] = useState<Trie | null>(null);
  const [showFollowedOnly, setShowFollowedOnly] = useState<string[]>([]);

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

      let matchingNames = trie.getWordsWithPrefixes(
        queryWords,
        clubs.map((club) => club.name),
      );
      matchingNames = matchingNames
        .filter((name) => name !== undefined && name !== null)
        .map((name) => name.toLowerCase());

      filteredBySearch = clubs.filter((club) => matchingNames.includes(club.name.toLowerCase().trim()));
    }

    const filteredClubs = filteredBySearch
      .filter((club) =>
        selectedSchools.length > 0 ? selectedSchools.some((school) => club.school?.includes?.(school)) : true,
      )
      .filter((club) =>
        selectedCategories.length > 0
          ? selectedCategories.some(
              (category) =>
                club.categories?.includes(category as Category) || club.affiliations?.includes(category as Affiliation),
            )
          : true,
      )
      .filter(
        (club) => (showFollowedOnly.includes("Followed") ? followedClubs?.includes(club._id) : true), // Followed filter
      );
    // .filter((club) => (showFollowedOnly ? followedClubs?.includes(club._id) : true));

    const sortedFilteredClubs = filteredClubs.sort((a, b) => a.name.localeCompare(b.name));

    setCurrentClubs(sortedFilteredClubs);
    setIsLoading(false);
  }, [
    searchQuery,
    selectedCategories,
    selectedSchools,
    trie,
    clubs,
    setCurrentClubs,
    setIsLoading,
    followedClubs,
    showFollowedOnly,
  ]);

  return (
    <div className="search-control flex flex-wrap gap-2 max-w-[1400px] flex-col items-center sm:flex-row pb-4 [&>*]:h-9 sm:[&>*]:h-11">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <FilterButton
        selectedItems={selectedSchools}
        setSelectedItems={setSelectedSchools}
        allItems={Object.values(School)}
        label="Schools"
      />
      <FilterButton
        selectedItems={selectedCategories}
        setSelectedItems={setSelectedCategories}
        allItems={[...Object.values(Category), ...Object.values(Affiliation)].sort()}
        label="Categories"
      />
      <FilterButton
        selectedItems={showFollowedOnly}
        setSelectedItems={setShowFollowedOnly}
        allItems={["Followed"]}
        label="Followed"
      />
      <ResetButton
        onReset={() => {
          setSearchQuery("");
          setSelectedCategories([]);
          setSelectedSchools([]);
        }}
      />
    </div>
  );
};

export default SearchControl;
