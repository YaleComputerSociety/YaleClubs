import React, { useEffect, useState } from "react";
import FollowFilter from "./FollowFilter";
import SearchBar from "./SearchBar";
import FilterButton from "../Filter";
import { Affiliation, Category, IClub, School } from "@/lib/models/Club";
import Trie from "./Trie";
import { useAuth } from "@/contexts/AuthContext";

interface SearchControlProps {
  clubs: IClub[];
  setCurrentClubs: React.Dispatch<React.SetStateAction<IClub[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  followedClubs: string[];
  setSelectedClub: React.Dispatch<React.SetStateAction<IClub | null>>;
  users: IUsers[];

}

const SearchControl = ({
  clubs,
  users,
  setCurrentClubs,
  setIsLoading,
  followedClubs,
  setSelectedClub,

}: SearchControlProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("clubs"); // New state for Clubs/People selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSchools] = useState<string[]>([School.COLLEGE]);
  const [trie, setTrie] = useState<Trie | null>(null);
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);
  const [searchKeyToClubName, setSearchKeyToClubName] = useState<Record<string, string[]>>({});
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    setIsLoading(true);

    if (searchType === "clubs") {
      const newTrie = new Trie();
      const mapping: Record<string, string[]> = {};

      clubs.forEach((club) => {
        if (typeof club.name === "string") {
          const clubNameLower = club.name.toLowerCase().trim();
          newTrie.insert(clubNameLower, "");
          mapping[clubNameLower] = [club.name];
        }
        if (Array.isArray(club.aliases)) {
          club.aliases.forEach((alias) => {
            if (typeof alias === "string") {
              const aliasLower = alias.toLowerCase().trim();
              newTrie.insert(aliasLower, "");
              mapping[aliasLower] = [club.name];
            }
          });
        }
      });

      setTrie(newTrie);
      setSearchKeyToClubName(mapping);
    }

    setIsLoading(false);
  }, [clubs, searchType, setIsLoading]);

  useEffect(() => {
    if (!trie || (searchType === "clubs" && clubs.length === 0)) return;

    setIsLoading(true);

    if (searchType === "clubs") {
      let filteredBySearch = clubs;

      if (searchQuery.trim() !== "") {
        const queryWords = searchQuery
          .toLowerCase()
          .split(" ")
          .filter((word) => word.trim() !== "");
        const allSearchKeys = Object.keys(searchKeyToClubName);
        const matchingKeys = trie.getWordsWithPrefixes(queryWords, allSearchKeys);

        const matchingClubNames = Array.from(
          new Set(
            matchingKeys.flatMap((key) => {
              const clubNames = searchKeyToClubName[key.toLowerCase().trim()] || [];
              return clubNames.filter((name) => name.trim() !== "");
            }),
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
                  club.categories?.includes(category as Category) ||
                  club.affiliations?.includes(category as Affiliation),
              )
            : true,
        )
        .filter((club) => (showFollowedOnly ? followedClubs.includes(club._id) : true));

      const sortedFilteredClubs = filteredClubs.sort((a, b) => {
        if (b.followers !== a.followers) {
          return b.followers - a.followers;
        }
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), undefined, { sensitivity: "base" });
      });

      setCurrentClubs(sortedFilteredClubs);
    } else if (searchType === "people") {
      // Example: Filter people based on search query
      const foundUser = users.find((user) => user.name.toLowerCase() === searchQuery.toLowerCase().trim());

      if (foundUser) {
        // Find clubs that the user follows
        const userFollowedClubs = clubs.filter((club) => foundUser.followedClubs.includes(club._id));
        setCurrentClubs(userFollowedClubs);
      } else {
        setCurrentClubs([]); 
      }

      // console.log("Filtered People:", filteredPeople); // For debugging, replace with a state if needed
    }

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
    searchType, // Now reacts to the search type
    users, // Added people filtering
  ]);

  return (
    <div
      className="search-control flex flex-wrap sm:gap-2 items-center pb-4 pt-2 bg-gray-100 w-full px-5 md:px-20"
      style={{
        position: "sticky",
        top: `84px`,
        zIndex: 20,
      }}
    >
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchType={searchType} setSearchType={setSearchType} />
      <div className="flex gap-2 pt-4 sm:pt-0 sm:flex-wrap sm:flex-row sm:gap-4">
        {searchType === "clubs" && (
          <FilterButton
            selectedItems={selectedCategories}
            setSelectedItems={setSelectedCategories}
            allItems={[...Object.values(Category), ...Object.values(Affiliation)].sort()}
            label="Categories"
          />
        )}
        {isLoggedIn && searchType === "clubs" && <FollowFilter showFollowedOnly={showFollowedOnly} setShowFollowedOnly={setShowFollowedOnly} />}
      </div>
    </div>
  );
};

export default SearchControl;
