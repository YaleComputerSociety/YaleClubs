import React, { useEffect, useState } from "react";
import FollowFilter from "./FollowFilter";

import FilterButton from "../Filter";
import { Affiliation, Category, IClub, School } from "@/lib/models/Club";
import Trie from "./Trie";
import { useAuth } from "@/contexts/AuthContext";
// import SortDirectionToggle from "./SortDirectionToggle";

import SortButton from "./SortButton";

interface SearchControlProps {
  clubs: IClub[];

  setCurrentClubs: React.Dispatch<React.SetStateAction<IClub[]>>;

  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  followedClubs: string[];
  setSelectedClub: React.Dispatch<React.SetStateAction<IClub | null>>;
}

const SearchControl = ({
  clubs,
  setCurrentClubs,
  setIsLoading,
  followedClubs,
  setSelectedClub,
}: SearchControlProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSchools] = useState<string[]>([School.COLLEGE]);
  const [trie, setTrie] = useState<Trie | null>(null);
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);
  const [searchKeyToClubName, setSearchKeyToClubName] = useState<Record<string, string[]>>({});
  const { isLoggedIn } = useAuth();
  const [sortOption, setSortOption] = useState<"followers" | "alphabetical">("followers");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");


  // Initialize Trie with club names and aliases along with a mapping for lookups.
  useEffect(() => {
    setIsLoading(true);
    const newTrie = new Trie();
    const mapping: Record<string, string[]> = {};

    clubs.forEach((club) => {
      // Insert the club name
      if (typeof club.name === "string") {
        const clubNameLower = club.name.toLowerCase().trim();
        newTrie.insert(clubNameLower, "");
        // If already exists, push the club name to the array.
        if (mapping[clubNameLower]) {
          mapping[clubNameLower].push(club.name);
        } else {
          mapping[clubNameLower] = [club.name];
        }
      }
      // Insert aliases, if any
      if (Array.isArray(club.aliases)) {
        club.aliases.forEach((alias) => {
          if (typeof alias === "string") {
            const aliasLower = alias.toLowerCase().trim();
            newTrie.insert(aliasLower, "");
            if (mapping[aliasLower]) {
              mapping[aliasLower].push(club.name);
            } else {
              mapping[aliasLower] = [club.name];
            }
          }
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

      // Map each matching key back to the club names (flattening the arrays and deduplicating).
      const matchingClubNames = Array.from(
        // Set lets us deduplicate the club aliases before converting back to an array
        new Set(
          matchingKeys
            .filter((key) => typeof key === "string" && key.trim() !== "")
            .flatMap((key) => {
              const clubNames = searchKeyToClubName[key.toLowerCase().trim()] || [];
              // Filter out any empty aliases before returning them
              return clubNames.filter((name) => name.trim() !== "");
            })
            .map((name) => name.toLowerCase().trim()),
        ),
      );

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
      )
      .filter((club) => (showFollowedOnly ? followedClubs.includes(club._id) : true));

      const sortedFilteredClubs = [...filteredClubs].sort((a, b) => {
        if (sortOption === "followers") {
          const followerDiff = a.followers - b.followers;
          if (followerDiff !== 0) {
            return sortDirection === "asc" ? followerDiff : -followerDiff;
          }

          const nameDiff = a.name.toLowerCase().localeCompare(b.name.toLowerCase(), undefined, {
            sensitivity: "base",
          });
          return nameDiff;
        }

        if (sortOption === "alphabetical") {
          const nameDiff = a.name.toLowerCase().localeCompare(b.name.toLowerCase(), undefined, {
            sensitivity: "base",
          });
          return sortDirection === "asc" ? nameDiff : -nameDiff;
        }

        return 0;
      });





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
    searchKeyToClubName,
    sortOption,
    sortDirection,
  ]);

  return (
    <div
      className="search-control flex flex-wrap sm:gap-2 items-center pb-4 pt-2 bg-gray-100 w-full px-5 md:px-20"
      style={{
        position: "sticky",
        top: `84px`, // Adjust "80px" based on Header's height
        zIndex: 20,
      }}
    >
      <div className="flex w-full sm:w-[32rem]">
        <div className="flex-grow">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clubs..."
            className="h-10 w-full px-4 border border-gray-300 rounded-l-md focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
        </div>
        <div className="w-[7rem]">
          <SortButton
            sortOption={sortOption}
            sortDirection={sortDirection}
            setSortOption={setSortOption}
            setSortDirection={setSortDirection}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4 sm:pt-0 sm:flex-wrap sm:flex-row sm:gap-4">
        <FilterButton
          selectedItems={selectedCategories}
          setSelectedItems={setSelectedCategories}
          allItems={[...Object.values(Category), ...Object.values(Affiliation)].sort()}
          label="Categories"
        />


        {isLoggedIn && <FollowFilter showFollowedOnly={showFollowedOnly} setShowFollowedOnly={setShowFollowedOnly} />}
        <button
          className="text-blue-500 hover:text-blue-700 hidden md:inline-block"
          onClick={() => {
            const collegeClubs = clubs.filter((club) => club.school?.includes(School.COLLEGE));
            if (collegeClubs.length > 0) {
              const randomClub = collegeClubs[Math.floor(Math.random() * collegeClubs.length)];
              setSelectedClub(randomClub); // Set the randomly selected club
            }
          }}
        >
          I&apos;m feeling lucky
        </button>
      </div>
    </div>
  );
};

export default SearchControl;
