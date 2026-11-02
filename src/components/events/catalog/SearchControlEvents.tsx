import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Filter from "@/components/Filter";
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
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !document.querySelector("dialog[open]")
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
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

    // Filter by clubs and tags
    const filteredEvents = filteredBySearch
      .filter((event) =>
        selectedClubs.length > 0 ? selectedClubs.some((club) => event.clubs?.includes?.(club)) : true,
      )
      .filter((event) =>
        selectedTags.length > 0 ? selectedTags.some((tag) => event.tags?.includes(tag as Tag)) : true,
      );

    // Split filtered events into upcoming and past
    const upcoming = filteredEvents
      .filter((event) => new Date(event.start) >= now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const past = filteredEvents
      .filter((event) => new Date(event.start) < now)
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

    setCurrentUpcomingEvents(upcoming);
    setCurrentPastEvents(past);
    setIsSearching(false);
  }, [
    searchQuery,
    selectedTags,
    selectedClubs,
    trie,
    setCurrentUpcomingEvents,
    setCurrentPastEvents,
    events,
    clubsForFilter,
  ]);

  return (
    <div className="events-search-controls">
      <div className="events-search-row">
        <label className="events-search-field">
          <span className="events-search-icon">
            <Image src="/assets/events-header/search.svg" alt="" width={14} height={14} />
          </span>
          <input
            ref={searchRef}
            type="search"
            placeholder="Search events"
            aria-label="Search events"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <button
          className="events-lucky"
          disabled={events.length === 0}
          onClick={() => {
            const upcoming = events.filter((event) => new Date(event.start).getTime() >= Date.now());
            const candidates = upcoming.length ? upcoming : events;
            if (candidates.length)
              router.push(`/Events/${candidates[Math.floor(Math.random() * candidates.length)]._id.toString()}`);
          }}
        >
          I’m feeling lucky
        </button>
      </div>
      <div className="flex flex-wrap gap-2 sm:flex-row sm:gap-4 justify-start">
        <Filter
          selectedItems={selectedClubs}
          setSelectedItems={setSelectedClubs}
          allItems={clubsForFilter.map((club) => club.name)}
          label="Clubs"
          aliasMapping={aliasMap}
        />
        <Filter
          selectedItems={selectedTags}
          setSelectedItems={setSelectedTags}
          allItems={Object.values(Tag).slice(1)}
          label="Tags"
        />
      </div>
    </div>
  );
};

export default SearchControlEvent;
