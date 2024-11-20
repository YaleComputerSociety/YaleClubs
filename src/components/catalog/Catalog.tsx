import React, { useEffect, useState, useMemo, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import ClubCard from "./ClubCard";
import ClubModal from "./ClubModal";
import { IClub } from "@/lib/models/Club";

interface CatalogProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const Catalog = ({ page, setPage }: CatalogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [allGroups, setAllGroups] = useState<IClub[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<IClub[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedClub, setSelectedClub] = useState<IClub | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCloseModal = () => setSelectedClub(null);

  const fetchApiMessage = useCallback(async (pageNum: number = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get<IClub[]>(`/api/clubs?page=${pageNum}`);
      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setAllGroups((prevGroups) => [...prevGroups, ...response.data]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setAllGroups([]); // Clear groups when visiting page to reload everything
    setPage(1); // Reset page number when visiting
    fetchApiMessage(1); // Fetch the first page on load
  }, [fetchApiMessage, setPage]);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredGroups(allGroups);
    } else {
      setFilteredGroups(
        allGroups.filter((club) => {
          const query = searchQuery.toLowerCase();
          const nameMatches = club.name
            .toLowerCase()
            .split(" ")
            .some((word) => word.startsWith(query));
          const categoryMatches = (club.categories ?? []).some((category) => category.toLowerCase().startsWith(query));
          return nameMatches || categoryMatches;
        }),
      );
    }
  }, [searchQuery, allGroups]);

  const renderClubItem = (club: IClub) => <ClubCard key={club._id} club={club} onClick={() => setSelectedClub(club)} />;
  renderClubItem.displayName = "RenderClubItem";

  const renderItem = useMemo(() => renderClubItem, []);

  const loadMoreData = () => {
    console.log("Loading more data...");
    setPage((prevPage) => prevPage + 1);
    fetchApiMessage(page + 1);
  };

  return (
    <div>
      <div className="px-5 ml-20 mt-16">
        <h1 className="text-3xl font-bold">Browse Clubs</h1>
        <h2 className="text-xl mb-8">Shopping has never been easier.</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Searching.."
          className="w-full px-4 py-2 border rounded-full text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading && page === 1 ? (
        <div className="mx-auto">
          <div className="text-gray-300"></div> {/* Loader while fetching the first page */}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={filteredGroups.length}
          next={loadMoreData}
          hasMore={hasMore}
          loader={<div className="text-gray-300">Loading...</div>}
          endMessage={<p style={{ textAlign: "center" }}>No more clubs to display.</p>}
        >
          <div className="grid gap-8 mx-10 xl:mx-20 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-items-center">
            {filteredGroups.map(renderItem)}
            {selectedClub && <ClubModal club={selectedClub} onClose={handleCloseModal} />}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Catalog;
