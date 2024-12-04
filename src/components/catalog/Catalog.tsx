import React, { useEffect, useState, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import ClubCard from "./ClubCard";
import ClubModal from "./ClubModal";
import { IClub } from "@/lib/models/Club";
import SearchControl from "./SearchControl";
import Trie from "./Trie";

interface CatalogProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const Catalog = ({ page, setPage }: CatalogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [allClubs, setallClubs] = useState<IClub[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<IClub[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedClub, setSelectedClub] = useState<IClub | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedAffiliations, setSelectedAffiliations] = useState<string[]>([]);
  const [clubTrie, setClubTrie] = useState<Trie | null>(null);

  const handleCloseModal = () => setSelectedClub(null);

  const fetchApiMessage = useCallback(async (pageNum: number = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get<IClub[]>(`/api/clubs?page=${pageNum}`);
      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        const updatedClubs = pageNum === 1 ? response.data : [...new Set([...allClubs, ...response.data])];
        setallClubs(updatedClubs);

        // Rebuild the Trie when new clubs are fetched
        const newTrie = new Trie();
        updatedClubs.forEach((club) => newTrie.insert(club.name));
        setClubTrie(newTrie);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (page === 1) {
      setallClubs([]); // Clear previous data
    }
    fetchApiMessage(page);
  }, [fetchApiMessage, page]);

  // Filter clubs based on search query and selected categories
  useEffect(() => {
    if (!clubTrie || allClubs.length === 0) {
      console.warn("Trie or allClubs not initialized yet");
      return;
    }

   let filteredBySearch = allClubs;

   if (searchQuery.trim() !== "") {
     const queryWords = searchQuery
       .toLowerCase()
       .split(" ")
       .filter((word) => word.trim() !== "");

     let matchingNames = clubTrie.getWordsWithPrefixes(queryWords, allClubs);
     matchingNames = matchingNames.map((name) => name.toLowerCase());
    //  console.log("Matching Names:", matchingNames);

    filteredBySearch = allClubs.filter((club) => {
    // const clubName = club.name.toLowerCase().trim();
    const isMatch = matchingNames.includes(club.name.toLowerCase().trim());
    // console.log(`Club: ${clubName}, Match Found: ${isMatch}`);
    return isMatch;
});

   }


    // filter based on the selected categories
    let filteredByCategories;
    if (selectedCategories.length > 0) {
      filteredByCategories = filteredBySearch.filter((club) =>
        selectedCategories.some((selectedCategory) => club.categories.includes(selectedCategory)),
      );
    } else {
      filteredByCategories = filteredBySearch;
    }
    // filter based on selected schools
    let filteredBySchools;
    if (selectedSchools.length > 0) {
      filteredBySchools = filteredByCategories.filter((club) =>
        // change to school
        selectedSchools.some((selectedSchools) => club.affiliations.includes(selectedSchools)),
      );
    } else {
      filteredBySchools = filteredByCategories;
    }

    let filteredByAffiliations;
    if (selectedAffiliations.length > 0) {
      filteredByAffiliations = filteredBySchools.filter((club) =>
        selectedAffiliations.some((selectedAffiliations) => club.affiliations.includes(selectedAffiliations)),
      );
    } else {
      filteredByAffiliations = filteredBySchools;
    }

    // Sort
    // const sortedFilteredGroups = filteredBySchools.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredGroups(filteredByAffiliations);
  }, [searchQuery, allClubs, selectedCategories, selectedAffiliations, selectedSchools, clubTrie]);

  const renderClubItem = (club: IClub) => <ClubCard key={club._id} club={club} onClick={() => setSelectedClub(club)} />;
  renderClubItem.displayName = "RenderClubItem";

  const loadMoreData = () => {
    console.log("Loading more data...");
    setPage((prevPage) => prevPage + 1);
    fetchApiMessage(page + 1);
  };

  return (
    <div className="px-5 mx-20 mt-16">
      <h1 className="text-3xl font-bold">Browse Clubs</h1>
      <h2 className="text-xl mb-8">Finding Clubs has Never Been Easier.</h2>

      <SearchControl
        allClubs={allClubs}
        setFilteredGroups={setFilteredGroups}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedSchools={selectedSchools}
        setSelectedSchools={setSelectedSchools}
        selectedAffiliations={selectedAffiliations}
        setSelectedAffiliations={setSelectedAffiliations}
      />

      {isLoading && page === 1 ? (
        <div className="text-center text-gray-500 mt-10">Loading...</div>
      ) : !isLoading && filteredGroups.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No results found.</div>
      ) : (
        <InfiniteScroll
          dataLength={filteredGroups.length}
          next={loadMoreData}
          hasMore={hasMore}
          // loader={<div className="text-gray-300">Loading...</div>}
          // endMessage={<p style={{ textAlign: "center" }}>No more clubs to display.</p>}
        >
          <div className="grid gap-8  grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-items-center;">
            {filteredGroups.map(renderClubItem)}
            {selectedClub && <ClubModal club={selectedClub} onClose={handleCloseModal} />}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Catalog;
