import React, { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  collapsible?: boolean;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar = ({ searchQuery, setSearchQuery, collapsible = false }: SearchBarProps) => {
  const [expanded, setExpanded] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const isMobile = window.innerWidth <= 700;
      if (collapsible !== isMobile) return;
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !document.querySelector("dialog[open]")
      ) {
        event.preventDefault();
        setExpanded(true);
        if (collapsible) requestAnimationFrame(() => inputRef.current?.focus());
        else inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, [collapsible]);
  return (
    <div className={collapsible ? `header-search ${expanded ? "expanded" : ""}` : "desktop-search"}>
      {collapsible && (
        <button
          ref={toggleRef}
          className="mobile-search-toggle"
          aria-label={expanded ? "Close search" : "Open search"}
          aria-expanded={expanded}
          aria-controls="mobile-club-search"
          onClick={() => {
            setExpanded(!expanded);
            if (!expanded) requestAnimationFrame(() => inputRef.current?.focus());
          }}
        >
          {expanded ? <X size={18} /> : <Search size={18} />}
        </button>
      )}
      <label className="search">
        <Search size={16} aria-hidden="true" />
        <span className="search-input-wrap">
          <input
            ref={inputRef}
            id={collapsible ? "mobile-club-search" : undefined}
            onKeyDown={(event) => {
              if (collapsible && event.key === "Escape") {
                setExpanded(false);
                toggleRef.current?.focus();
              }
            }}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search Communities"
            aria-label="Search communities"
            autoComplete="off"
          />
        </span>
        <kbd>⌘ + K</kbd>
      </label>
    </div>
  );
};

export default SearchBar;
