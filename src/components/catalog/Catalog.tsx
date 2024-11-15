import React, { useEffect, useState, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import ClubCard from "./ClubCard";
import ClubModal from "./ClubModal";
import { IClub } from "@/lib/models/Club";
import SearchControl from "./SearchControl"; 

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
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const handleCloseModal = () => setSelectedClub(null);

    const fetchApiMessage = useCallback(async (pageNum: number = 1) => {
        try {
        setIsLoading(true);
        const response = await axios.get<IClub[]>(`/api/clubs?page=${pageNum}`);
        if (response.data.length === 0) {
            setHasMore(false);
        } else {
            setAllGroups((prevGroups) => (pageNum === 1 ? response.data : [...new Set([...prevGroups, ...response.data])]));
        }
        } catch (error) {
        console.error(error);
        } finally {
        setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (page === 1) {
        setAllGroups([]); // Clear previous data 
        } 
        fetchApiMessage(page);
    }, [fetchApiMessage, page]);

    // Filter clubs based on search query and selected categories
    useEffect(() => {
        // filter based on the search query
        const filteredBySearch =
            searchQuery === ""
                ? allGroups
                : allGroups.filter((club) => {
                    const query = searchQuery.toLowerCase();
                    const nameMatches = club.name.toLowerCase().includes(query);
                    return nameMatches;
                    });

        // filter based on the selected categories
        let filteredByCategories;
        if (selectedCategories.length > 0) {
            filteredByCategories = filteredBySearch.filter((club) =>
            selectedCategories.some((selectedCategory) => club.categories.includes(selectedCategory)),
        );
        } else {
            filteredByCategories = filteredBySearch;
        }

        // Sort
        const sortedFilteredGroups = filteredByCategories.sort((a, b) => a.name.localeCompare(b.name));

        setFilteredGroups(sortedFilteredGroups);
    }, [searchQuery, allGroups, selectedCategories]);


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
            allGroups={allGroups}
            setFilteredGroups={setFilteredGroups}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
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
