import React, { useEffect, useState, useRef } from "react";
import SearchBar from "./SearchBar";
import FilterButton from "./Filter";
import { Affiliation, Category, IClub, School } from "@/lib/models/Club";
import Trie from "./Trie";
import { IEvent } from "@/lib/models/Event";

interface SearchControlProps {
  clubs: IClub[];
  featuredEvents: IEvent[];
  setCurrentClubs: React.Dispatch<React.SetStateAction<IClub[]>>;
  setFeaturedEvents: React.Dispatch<React.SetStateAction<IEvent[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchControl = ({
  clubs,
  setCurrentClubs,
  featuredEvents,
  setFeaturedEvents,
  setIsLoading,
}: SearchControlProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([School.COLLEGE]);
  const [trie, setTrie] = useState<Trie | null>(null);

  const featuredEventsRef = useRef<IEvent[]>([...featuredEvents]);

  // Initialize Trie with club names
  useEffect(() => {
    setIsLoading(true);
    const newTrie = new Trie();
    clubs.forEach((club) => newTrie.insert(club.name, ""));
    setTrie(newTrie);
    setIsLoading(false);
  }, [clubs, setIsLoading]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFeaturedEvents(featuredEventsRef.current);
    } else {
      setFeaturedEvents([]);
    }
  }, [searchQuery, setFeaturedEvents]);

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
      );

    setCurrentClubs(filteredClubs);
    setIsLoading(false);
  }, [searchQuery, selectedCategories, selectedSchools, trie, clubs, setCurrentClubs, setIsLoading]);

  return (
    <div className="search-control flex flex-wrap gap-2 max-w-[1400px] flex-col items-center sm:flex-row pb-4">
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
    </div>
  );
};

export default SearchControl;
