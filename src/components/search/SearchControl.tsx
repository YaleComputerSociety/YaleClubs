import React, { useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";
import FilterModal from "./FilterModal";
import { Affiliation, Category, IClub, School } from "@/lib/models/Club";
import Trie from "./Trie";
import Image from "next/image";
import { ArrowUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SearchControlProps {
  children: React.ReactNode;
  resultCount: number;
  clubs: IClub[];

  setCurrentClubs: React.Dispatch<React.SetStateAction<IClub[]>>;

  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  followedClubs: string[];
  setSelectedClub: React.Dispatch<React.SetStateAction<IClub | null>>;
}

const SearchControl = ({
  clubs,
  children,
  resultCount,
  setCurrentClubs,
  setIsLoading,
  followedClubs,
  setSelectedClub,
}: SearchControlProps) => {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([School.COLLEGE]);
  const [selectedAffiliations, setSelectedAffiliations] = useState<string[]>([]);
  const [selectedIntensity, setSelectedIntensity] = useState<string[]>([]);
  const [selectedApplicationStatus, setSelectedApplicationStatus] = useState<string[]>([]);
  const [trie, setTrie] = useState<Trie | null>(null);
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);
  const [searchKeyToClubName, setSearchKeyToClubName] = useState<Record<string, string[]>>({});
  const { isLoggedIn } = useAuth();

  const [showBackToTop, setShowBackToTop] = useState(false);
  const filterToggleRef = useRef<HTMLButtonElement>(null);
  const activeCount =
    selectedSchools.length +
    selectedCategories.length +
    selectedAffiliations.length +
    selectedIntensity.length +
    selectedApplicationStatus.length +
    Number(showFollowedOnly);
  useEffect(() => {
    let previousY = window.scrollY;
    let upwardDistance = 0;
    const onScroll = () => {
      const y = window.scrollY;
      upwardDistance = y < previousY ? upwardDistance + previousY - y : 0;
      if (y < 300 || y > previousY) setShowBackToTop(false);
      else if (upwardDistance > 40) setShowBackToTop(true);
      previousY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      .filter(
        (club) =>
          selectedAffiliations.length === 0 ||
          selectedAffiliations.some((affiliation) => club.affiliations?.includes(affiliation as Affiliation)),
      )
      .filter((club) => selectedIntensity.length === 0 || selectedIntensity.includes(club.intensity || ""))
      .filter(
        (club) =>
          selectedApplicationStatus.length === 0 || selectedApplicationStatus.includes(club.recruitmentStatus || ""),
      )
      .filter((club) => (showFollowedOnly ? followedClubs.includes(club._id.toString()) : true));

    const sortedFilteredClubs = filteredClubs.sort((a, b) => {
      if (b.followers !== a.followers) {
        return b.followers - a.followers;
      }
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), undefined, { sensitivity: "base" });
    });

    setCurrentClubs(sortedFilteredClubs);
    setIsLoading(false);
  }, [
    searchQuery,
    selectedCategories,
    selectedSchools,
    selectedAffiliations,
    selectedIntensity,
    selectedApplicationStatus,
    trie,
    clubs,
    setCurrentClubs,
    setIsLoading,
    followedClubs,
    showFollowedOnly,
    searchKeyToClubName,
  ]);

  return (
    <div className={`browse-layout ${filtersOpen ? "filters-visible" : "filters-hidden"}`}>
      {filtersOpen && (
        <div className="filter-sidebar-slot">
          <FilterModal
            clubs={clubs}
            resultCount={resultCount}
            onClose={() => {
              setFiltersOpen(false);
              requestAnimationFrame(() => filterToggleRef.current?.focus());
            }}
            selectedSchools={selectedSchools}
            setSelectedSchools={setSelectedSchools}
            selectedAffiliations={selectedAffiliations}
            setSelectedAffiliations={setSelectedAffiliations}
            selectedIntensity={selectedIntensity}
            setSelectedIntensity={setSelectedIntensity}
            selectedApplicationStatus={selectedApplicationStatus}
            setSelectedApplicationStatus={setSelectedApplicationStatus}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            showFollowedOnly={showFollowedOnly}
            setShowFollowedOnly={setShowFollowedOnly}
            isLoggedIn={isLoggedIn}
          />
        </div>
      )}
      {!filtersOpen && (
        <div className="collapsed-filter-rail">
          <div className="collapsed-filter-control">
            <button
              ref={filterToggleRef}
              className="filter-reopen"
              onClick={() => setFiltersOpen(true)}
              aria-expanded="false"
              aria-controls="browse-filters"
              aria-label={`Show filters${activeCount ? `, ${activeCount} active` : ""}`}
            >
              <Image src="/assets/filters/sidebar.svg" alt="" width={24} height={24} />
              {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
            </button>
          </div>
        </div>
      )}
      <div className="browse-results">
        <div className="search-control flex flex-wrap items-center w-full">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <div>
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
        {children}
      </div>
      {showBackToTop && (
        <button
          className="browse-back-to-top"
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            });
            setShowBackToTop(false);
          }}
        >
          <ArrowUp size={18} aria-hidden="true" />
          Back to top
        </button>
      )}
    </div>
  );
};

export default SearchControl;
