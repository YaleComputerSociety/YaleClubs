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

const ResetButton = ({ onReset }: { onReset: () => void }) => {
  return (
    <button onClick={onReset} className="bg-[#f66] text-white px-4 rounded">
      Reset
    </button>
  );
};

const SearchControl = ({ clubs, setCurrentClubs, setIsLoading }: SearchControlProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([School.COLLEGE]);
  const [trie, setTrie] = useState<Trie | null>(null);
  // This mapping will let us relate any search key (name or alias) back to its club name.
  const [searchKeyToClubName, setSearchKeyToClubName] = useState<Record<string, string>>({});

  // Initialize Trie with club names and aliases along with a mapping for lookups.
  useEffect(() => {
    setIsLoading(true);
    const newTrie = new Trie();
    const mapping: Record<string, string> = {};

    clubs.forEach((club) => {
      // Insert the club name
      const clubNameLower = club.name.toLowerCase().trim();
      newTrie.insert(clubNameLower, "");
      mapping[clubNameLower] = club.name;
      // Insert aliases, if any
      if (club.aliases) {
        club.aliases.forEach((alias) => {
          const aliasLower = alias.toLowerCase().trim();
          newTrie.insert(aliasLower, "");
          // Map the alias to the club's actual name
          mapping[aliasLower] = club.name;
        });
      }
    });

    setTrie(newTrie);
    setSearchKeyToClubName(mapping);
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

      // Instead of only sending club names, we now pass all keys (names and aliases)
      const allSearchKeys = Object.keys(searchKeyToClubName);
      const matchingKeys = trie.getWordsWithPrefixes(queryWords, allSearchKeys);

      // Remove any undefined/null, then map each search key back to the club name
      const matchingClubNames = matchingKeys
        .filter((key) => key !== undefined && key !== null)
        .map((key) => searchKeyToClubName[key.toLowerCase().trim()])
        // Deduplicate
        .filter((value, index, self) => self.indexOf(value) === index)
        .map((name) => name.toLowerCase().trim());

      filteredBySearch = clubs.filter((club) => matchingClubNames.includes(club.name.toLowerCase().trim()));
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
      );

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
    searchKeyToClubName,
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
