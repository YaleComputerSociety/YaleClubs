import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  const [suggestion, setSuggestion] = useState(0);
  const [focused, setFocused] = useState(false);
  const suggestions = [
    "Search Communities",
    "Try Yale Club Swim",
    "Try Yale Computer Society",
    "Find your next community",
  ];
  useEffect(() => {
    if (searchQuery || focused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setSuggestion((current) => (current + 1) % 4), 3500);
    return () => window.clearInterval(timer);
  }, [searchQuery, focused]);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !document.querySelector("dialog[open]")
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);
  return (
    <label className="search">
      <Search size={16} aria-hidden="true" />
      <span className="search-input-wrap">
        {!searchQuery && !focused && (
          <span key={suggestion} className="search-suggestion" aria-hidden="true">
            {suggestions[suggestion]}
          </span>
        )}
        <input
          ref={inputRef}
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={focused ? "Search Communities" : ""}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label="Search communities"
          autoComplete="off"
        />
      </span>
      <kbd>⌘ + K</kbd>
    </label>
  );
};

export default SearchBar;
