import React, { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/search/SearchBar";
import Filter from "@/components/Filter";
import SelectFilter from "@/components/SelectFilter";
import {
  DATE_OPTIONS,
  DateOption,
  DEFAULT_FILTERS,
  eventTypesIn,
  filterEvents,
  SORT_OPTIONS,
  SortOption,
  sortEvents,
  SOURCE_OPTIONS,
  SourceOption,
  WHERE_LABELS,
  WHERE_OPTIONS,
} from "@/lib/eventFilters";
import { IClub } from "@/lib/models/Club";
import { IEvent } from "@/lib/models/Event";
import Trie from "@/components/search/Trie";
import { Tag } from "@/lib/models/Event";

interface SearchControlProps {
  clubsForFilter: IClub[];
  events: IEvent[];
  setCurrentUpcomingEvents: React.Dispatch<React.SetStateAction<IEvent[]>>;
  setCurrentPastEvents: React.Dispatch<React.SetStateAction<IEvent[]>>;
}

const SearchControlEvent = ({
  events,
  clubsForFilter,
  setCurrentUpcomingEvents,
  setCurrentPastEvents,
}: SearchControlProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("soonest");
  const [date, setDate] = useState<DateOption>(DEFAULT_FILTERS.date);
  const [source, setSource] = useState<SourceOption>(DEFAULT_FILTERS.source);
  const [selectedWhere, setSelectedWhere] = useState<string[]>([]); // labels, e.g. "On campus"
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [resultCount, setResultCount] = useState<number | null>(null);

  // Clubs filter: our clubs plus hosts that only appear on imported (YaleConnect) events.
  const clubNamesForFilter = useMemo(() => {
    const names = new Set(clubsForFilter.map((club) => club.name));
    events.forEach((event) => event.clubs?.forEach((name) => names.add(name)));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [clubsForFilter, events]);
  const eventTypes = useMemo(() => eventTypesIn(events), [events]);

  const filtersActive =
    searchQuery.trim() !== "" ||
    selectedTags.length > 0 ||
    selectedClubs.length > 0 ||
    date !== DEFAULT_FILTERS.date ||
    source !== DEFAULT_FILTERS.source ||
    selectedWhere.length > 0 ||
    selectedTypes.length > 0;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedClubs([]);
    setDate(DEFAULT_FILTERS.date);
    setSource(DEFAULT_FILTERS.source);
    setSelectedWhere([]);
    setSelectedTypes([]);
  };
  const [trie, setTrie] = useState<Trie | null>(null);
  const [, setIsSearching] = useState(false);
  const [aliasMap, setAliasMap] = useState<Record<string, string[]>>({});
  // Initialize Trie with event names once
  useEffect(() => {
    const newTrie = new Trie();

    events.forEach((event) => newTrie.insert(event.name, event.name));

    clubsForFilter.forEach((club) => {
      if (typeof club.name === "string") {
        const clubNameLower = club.name.toLowerCase().trim();

        newTrie.insert(clubNameLower, clubNameLower);
      }
    });

    setTrie(newTrie);
  }, [events, clubsForFilter]);

  useEffect(() => {
    const mapping: Record<string, string[]> = aliasMap;

    clubsForFilter.forEach((club: IClub) => {
      // Insert the club name
      if (Array.isArray(club.aliases)) {
        club.aliases.forEach((alias) => {
          trie?.insert(alias, alias);
          if (typeof alias === "string") {
            const aliasLower = alias.toLowerCase().trim();
            if (mapping[aliasLower]) {
              mapping[aliasLower].push(club.name);
            } else {
              mapping[aliasLower] = [club.name];
            }
          }
        });
      }
    });

    setAliasMap(mapping);
  }, [clubsForFilter, aliasMap, trie]);

  // Filter events based on search query, tags, and clubs
  useEffect(() => {
    if (!trie || events.length === 0) return;

    setIsSearching(true);
    const now = new Date();
    // Filter by search query
    let filteredBySearch = events;
    if (searchQuery.trim() !== "") {
      const queryWords = searchQuery
        .toLowerCase()
        .split(" ")
        .filter((word) => word.trim() !== "");

      let matchingNames = trie.getWordsWithPrefixes(queryWords, [
        ...events.map((event) => event.name).filter((name): name is string => name !== undefined),
        ...clubsForFilter.map((club) => club.name).filter((name): name is string => name !== undefined),
        ...clubsForFilter
          .flatMap((club) => club?.aliases ?? [])
          .filter((alias): alias is string => alias !== undefined),
      ]);

      matchingNames = matchingNames
        .filter((name) => name !== undefined && name !== null)
        .map((name) => name.toLowerCase());

      filteredBySearch = events.filter((event) => {
        const eventNameMatch = matchingNames.includes(event.name.toLowerCase().trim());
        const clubNameMatch = event.clubs?.some((clubName) => {
          // Check direct club name match
          if (matchingNames.includes(clubName.toLowerCase().trim())) return true;

          // Check aliases for each club
          const club = clubsForFilter.find((c) => c.name === clubName);
          return club?.aliases?.some((alias) => matchingNames.includes(alias.toLowerCase().trim())) || false;
        });
        return eventNameMatch || clubNameMatch;
      });
    }

    // Filter by date, source, where and type
    const whereValues = WHERE_OPTIONS.filter((value) => selectedWhere.includes(WHERE_LABELS[value]));
    const filteredByOptions = filterEvents(
      filteredBySearch,
      { date, source, where: whereValues, eventTypes: selectedTypes },
      now,
    );

    // Filter by clubs and tags
    const filteredEvents = filteredByOptions
      .filter((event) =>
        selectedClubs.length > 0 ? selectedClubs.some((club) => event.clubs?.includes?.(club)) : true,
      )
      .filter((event) =>
        selectedTags.length > 0 ? selectedTags.some((tag) => event.tags?.includes(tag as Tag)) : true,
      );

    // Split filtered events into upcoming and past, then sort each
    const upcoming = sortEvents(
      filteredEvents.filter((event) => new Date(event.start) >= now),
      sort,
    );
    const past = sortEvents(
      filteredEvents.filter((event) => new Date(event.start) < now),
      sort,
      true,
    );

    setResultCount(upcoming.length);
    setCurrentUpcomingEvents(upcoming);
    setCurrentPastEvents(past);
    setIsSearching(false);
  }, [
    searchQuery,
    selectedTags,
    selectedClubs,
    sort,
    date,
    source,
    selectedWhere,
    selectedTypes,
    trie,
    setCurrentUpcomingEvents,
    setCurrentPastEvents,
    events,
    clubsForFilter,
  ]);

  return (
    <div className="search-control w-full flex flex-col sm:flex-row flex-wrap gap-2 items-center pb-4">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="flex flex-wrap gap-2 sm:flex-row sm:gap-4 justify-start">
        <SelectFilter label="Sort" value={sort} options={SORT_OPTIONS} onChange={setSort} defaultValue="soonest" />
        <SelectFilter
          label="Date"
          value={date}
          options={DATE_OPTIONS}
          onChange={setDate}
          defaultValue={DEFAULT_FILTERS.date}
        />
        <Filter
          selectedItems={selectedClubs}
          setSelectedItems={setSelectedClubs}
          allItems={clubNamesForFilter}
          label="Clubs"
          aliasMapping={aliasMap}
        />
        <Filter
          selectedItems={selectedTags}
          setSelectedItems={setSelectedTags}
          allItems={Object.values(Tag).slice(1)}
          label="Tags"
        />
        {eventTypes.length > 0 && (
          <Filter
            selectedItems={selectedTypes}
            setSelectedItems={setSelectedTypes}
            allItems={eventTypes}
            label="Type"
          />
        )}
        <Filter
          selectedItems={selectedWhere}
          setSelectedItems={setSelectedWhere}
          allItems={WHERE_OPTIONS.map((value) => WHERE_LABELS[value])}
          label="Where"
        />
        <SelectFilter
          label="Source"
          value={source}
          options={SOURCE_OPTIONS}
          onChange={setSource}
          defaultValue={DEFAULT_FILTERS.source}
        />
      </div>
      {filtersActive && (
        <div className="flex items-center gap-3 text-sm text-gray-600 sm:ml-2">
          {resultCount !== null && (
            <span>
              {resultCount} upcoming {resultCount === 1 ? "event" : "events"}
            </span>
          )}
          <button onClick={clearFilters} className="text-violet-600 font-semibold hover:text-violet-500">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchControlEvent;
