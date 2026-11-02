"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DisplayHeader from "../components/catalog/DisplayHeader";
import Footer from "../components/catalog/DisplayFooter";
import Catalog from "../components/catalog/Catalog";
import { IClub } from "@/lib/models/Club";
import SearchControl from "@/components/search/SearchControl";
import { useAuth } from "@/contexts/AuthContext";
import "./display.css";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [clubs, setClubs] = useState<IClub[]>([]);

  const [sortAZ, setSortAZ] = useState(false);
  const [currentClubs, setCurrentClubs] = useState<IClub[]>([]);
  const [followedClubs, setFollowedClubs] = useState<string[]>([]);
  const [selectedClub, setSelectedClub] = useState<IClub | null>(null);
  const { user } = useAuth();
  const netid = user?.netid;
  useEffect(() => {
    const fetchApiMessage = async () => {
      try {
        const clubsResponse = await axios.get<IClub[]>("/api/clubs");

        setClubs(clubsResponse.data);
      } catch (error) {
        console.error("Error fetching API data:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 2); // delay because setClubs is async
      }
    };

    fetchApiMessage();
  }, [setFollowedClubs, setClubs, setIsLoading]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // get /users&netid
        const response = await axios.get("/api/users", {
          params: { netid: netid },
        });

        setFollowedClubs(response.data.user.followedClubs);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 500) {
          console.error("Server error:", error);
        }
      }
    };

    fetchUser();
  }, [netid]);

  return (
    <main className="club-display flex flex-col min-h-screen">
      <div className="flex-grow">
        <DisplayHeader />
        <SearchControl
          clubs={clubs}
          resultCount={currentClubs.length}
          setCurrentClubs={setCurrentClubs}
          setIsLoading={setIsLoading}
          followedClubs={followedClubs}
          setSelectedClub={setSelectedClub}
        >
          <div className="display-catalog">
            <div className="meta-row">
              <span>
                Showing {currentClubs.length} of {clubs.length} clubs
              </span>
              <button className="sort" onClick={() => setSortAZ(!sortAZ)}>
                Sort: {sortAZ ? "A–Z" : "Recommended"} ↓
              </button>
            </div>
            <Catalog
              clubs={sortAZ ? [...currentClubs].sort((a, b) => a.name.localeCompare(b.name)) : currentClubs}
              isLoading={isLoading}
              followedClubs={followedClubs}
              setFollowedClubs={setFollowedClubs}
              selectedClub={selectedClub}
              setSelectedClub={setSelectedClub}
            />
          </div>
        </SearchControl>
      </div>
      <Footer />
    </main>
  );
}
