"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import AuthWrapper from "../components/AuthWrapper";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Catalog from "../components/catalog/Catalog";
import { IClub } from "@/lib/models/Club";
import Trie from "@/components/catalog/Trie";
import SearchControl from "@/components/catalog/SearchControl";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [clubs, setClubs] = useState<IClub[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<IClub[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedAffiliations, setSelectedAffiliations] = useState<string[]>([]);
  const [clubTrie, setClubTrie] = useState<Trie | null>(null);

  useEffect(() => {
    const fetchApiMessage = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<IClub[]>("/api/clubs");
        console.log("API message:", response.data);
        setClubs(response.data);

        const newTrie = new Trie();
        response.data.forEach((club) => newTrie.insert(club.name));
        setClubTrie(newTrie);
      } catch (error) {
        console.error("Error fetching API message:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApiMessage();
  }, []);

  // Filter clubs based on search query and selected categories
  useEffect(() => {
    if (!clubTrie || clubs.length === 0) {
      return;
    }

    let filteredBySearch = clubs;

    if (searchQuery.trim() !== "") {
      const queryWords = searchQuery
        .toLowerCase()
        .split(" ")
        .filter((word) => word.trim() !== "");

      let matchingNames = clubTrie.getWordsWithPrefixes(queryWords, clubs);
      matchingNames = matchingNames
        .filter((name) => name !== undefined && name !== null)
        .map((name) => name.toLowerCase());
      //  console.log("Matching Names:", matchingNames);

      filteredBySearch = clubs.filter((club) => {
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
        selectedSchools.some((selectedSchool) => club.school?.includes?.(selectedSchool)),
      );
    } else {
      filteredBySchools = filteredByCategories;
    }

    let filteredByAffiliations;
    if (selectedAffiliations.length > 0) {
      filteredByAffiliations = filteredBySchools.filter((club) =>
        selectedAffiliations.some((selectedAffiliations) => club.affiliations?.includes?.(selectedAffiliations)),
      );
    } else {
      filteredByAffiliations = filteredBySchools;
    }

    // Sort
    // const sortedFilteredGroups = filteredBySchools.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredGroups(filteredByAffiliations);
  }, [searchQuery, clubs, selectedCategories, selectedAffiliations, selectedSchools, clubTrie]);

  return (
    <AuthWrapper>
      <main className="w-full">
        <section className="h-screen overflow-y-scroll">
          <div className="flex flex-col w-full min-h-screen">
            <Header />
            <div className="mt-40"></div>
            <h1 className="mx-24 text-3xl font-bold text-black">Browse Clubs</h1>
            <h2 className="mx-24 text-xl mb-8">Finding Clubs has Never Been Easier.</h2>
            <SearchControl
              allClubs={clubs}
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
            <Catalog clubs={filteredGroups} isLoading={isLoading} />
            <Footer />
          </div>
        </section>
      </main>
    </AuthWrapper>
  );
}
