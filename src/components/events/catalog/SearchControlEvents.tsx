import React, { useEffect, useState } from "react";
import SearchBar from "@/components/search/SearchBar";
import Filter from "@/components/search/Filter";
import { IClub } from "@/lib/models/Club";
import { IEvent } from "@/lib/models/Event";
import Trie from "@/components/search/Trie";
import { Tag } from "@/lib/models/Event";

interface SearchControlProps {
  clubsForFilter: IClub[];
  events: IEvent[];
  setCurrentEvents: React.Dispatch<React.SetStateAction<IEvent[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchControlEvent = ({ events, clubsForFilter, setCurrentEvents, setIsLoading }: SearchControlProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [trie, setTrie] = useState<Trie | null>(null);

  // Initialize Trie with event names once
  useEffect(() => {
    setIsLoading(true);
    const newTrie = new Trie();
    events.forEach((event) => newTrie.insert(event.name, ""));
    setTrie(newTrie);
    setIsLoading(false);
  }, [events, setIsLoading]);

  // Filter events based on search query, tags, and clubs
  useEffect(() => {
    if (!trie || events.length === 0) return;
    console.log("working!");
    console.log("searchQuery", searchQuery);
    setIsLoading(true);

    // Filter by search query
    let filteredBySearch = events;
    if (searchQuery.trim() !== "") {
      const queryWords = searchQuery
        .toLowerCase()
        .split(" ")
        .filter((word) => word.trim() !== "");

      let matchingNames = trie.getWordsWithPrefixes(
        queryWords,
        events.map((event) => event.name),
      );
      matchingNames = matchingNames
        .filter((name) => name !== undefined && name !== null)
        .map((name) => name.toLowerCase());

      filteredBySearch = events.filter((event) => matchingNames.includes(event.name.toLowerCase().trim()));
    }

    // Filter by clubs and tags
    const filteredEvents = filteredBySearch
      .filter((event) =>
        selectedClubs.length > 0 ? selectedClubs.some((club) => event.clubs?.includes?.(club)) : true,
      )
      .filter((event) =>
        selectedTags.length > 0 ? selectedTags.some((tag) => event.tags?.includes(tag as Tag)) : true,
      );

    setCurrentEvents(filteredEvents);
    setIsLoading(false);
  }, [searchQuery, selectedTags, selectedClubs, trie, setCurrentEvents, setIsLoading]);

  return (
    <div className="search-control flex flex-wrap gap-2 max-w-[1400px] flex-col items-center sm:flex-row pb-4">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Filter
        selectedItems={selectedClubs}
        setSelectedItems={setSelectedClubs}
        allItems={clubsForFilter.map((club) => club.name)}
        label="Clubs"
        showInput={true}
      />
      <Filter
        selectedItems={selectedTags}
        setSelectedItems={setSelectedTags}
        // so you don't have Featured Event as a drop down.
        allItems={Object.values(Tag).slice(1)}
        label="Tags"
      />
    </div>
  );
};

export default SearchControlEvent;
