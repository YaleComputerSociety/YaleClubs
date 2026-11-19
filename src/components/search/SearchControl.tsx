import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";
import DisplayHeader from "../catalog/DisplayHeader";
import FilterModal from "./FilterModal";
import { Affiliation, Category, IClub, School } from "@/lib/models/Club";
import Trie from "./Trie";
import Image from "next/image";
import { ArrowUp, SlidersHorizontal } from "lucide-react";
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const mobileDialogRef = useRef<HTMLDialogElement>(null);
  const mobileFilterToggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = mobileDialogRef.current;
    if (!dialog || !mobileFiltersOpen) return;
    const trigger = mobileFilterToggleRef.current;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const media = window.matchMedia("(min-width: 701px)");
    const closeOnDesktop = () => {
      if (media.matches) setMobileFiltersOpen(false);
    };
    media.addEventListener("change", closeOnDesktop);
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      media.removeEventListener("change", closeOnDesktop);
      trigger?.focus();
    };
  }, [mobileFiltersOpen]);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const browseLayoutRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<{ element: HTMLElement; top: number; footerHeight?: number } | null>(null);

  const toggleDesktopFilters = (open: boolean) => {
    const layout = browseLayoutRef.current;
    if (layout && window.innerWidth > 700) {
      const headerBottom = document.querySelector(".nav")?.getBoundingClientRect().bottom ?? 56;
      const footer = document.querySelector<HTMLElement>(".global-footer");
      const footerRect = footer?.getBoundingClientRect();
      const footerVisible = footerRect && footerRect.bottom > headerBottom && footerRect.top < window.innerHeight;
      const anchor = footerVisible
        ? footer
        : Array.from(layout.querySelectorAll<HTMLElement>(".club-grid .club-card")).find((card) => {
            const rect = card.getBoundingClientRect();
            return rect.bottom > headerBottom && rect.top < window.innerHeight;
          });
      scrollAnchorRef.current = anchor
        ? {
            element: anchor,
            top: anchor.getBoundingClientRect().top,
            footerHeight: footerVisible ? footerRect.height : undefined,
          }
        : null;
      // Reserve the old height before reflow so the browser cannot clamp the
      // scroll position against a shorter footer when we are at the page bottom.
      if (footerVisible && footer && footerRect.height > 0) {
        footer.style.setProperty("--browse-footer-min-height", `${footerRect.height}px`);
      }
    }
    setFiltersOpen(open);
  };

  // Keep a visible footer in place; otherwise preserve the visible club as the grid reflows.
  useLayoutEffect(() => {
    const anchor = scrollAnchorRef.current;
    scrollAnchorRef.current = null;
    if (!anchor?.element.isConnected) return;
    if (anchor.footerHeight && anchor.footerHeight > 0) {
      const height = Math.max(anchor.footerHeight, anchor.element.getBoundingClientRect().height);
      anchor.element.style.setProperty("--browse-footer-min-height", `${height}px`);
    }
    const delta = anchor.element.getBoundingClientRect().top - anchor.top;
    if (delta) window.scrollTo({ top: window.scrollY + delta, behavior: "instant" });
  }, [filtersOpen]);
  useEffect(() => {
    const footer = document.querySelector<HTMLElement>(".global-footer");
    const resetFooterHeight = () => footer?.style.removeProperty("--browse-footer-min-height");
    window.addEventListener("resize", resetFooterHeight);
    return () => {
      window.removeEventListener("resize", resetFooterHeight);
      resetFooterHeight();
    };
  }, []);
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

  const filterPanel = (mobile: boolean) => (
    <FilterModal
      mobile={mobile}
      clubs={clubs}
      resultCount={resultCount}
      onClose={() => {
        if (mobile) {
          setMobileFiltersOpen(false);
          return;
        }
        toggleDesktopFilters(false);
        requestAnimationFrame(() => filterToggleRef.current?.focus({ preventScroll: true }));
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
  );

  return (
    <>
      <DisplayHeader>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} collapsible />
      </DisplayHeader>
      <div ref={browseLayoutRef} className={`browse-layout ${filtersOpen ? "filters-visible" : "filters-hidden"}`}>
        {filtersOpen && <div className="filter-sidebar-slot">{filterPanel(false)}</div>}
        {!filtersOpen && (
          <div className="collapsed-filter-rail">
            <div className="collapsed-filter-control">
              <button
                ref={filterToggleRef}
                className="filter-reopen"
                onClick={() => toggleDesktopFilters(true)}
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
          <div className="browse-intro">
            <h1>Browse Clubs</h1>
            <p>Finding Your Communities Has Never Been Easier.</p>
          </div>
          <div className="mobile-browse-tools">
            <button ref={mobileFilterToggleRef} onClick={() => setMobileFiltersOpen(true)} aria-haspopup="dialog">
              <SlidersHorizontal size={18} /> Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </button>
          </div>
          <div className="search-control flex flex-wrap items-center w-full">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div>
              <button
                className="lucky"
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
      <dialog
        ref={mobileDialogRef}
        className="mobile-filter-dialog"
        aria-label="Club filters"
        onCancel={() => setMobileFiltersOpen(false)}
      >
        {mobileFiltersOpen && filterPanel(true)}
      </dialog>
    </>
  );
};

export default SearchControl;
