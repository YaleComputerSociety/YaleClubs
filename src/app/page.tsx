"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Catalog from "../components/catalog/Catalog";
import { IClub } from "@/lib/models/Club";
import SearchControl from "@/components/search/SearchControl";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [clubs, setClubs] = useState<IClub[]>([]);

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
    <main className=" flex flex-col min-h-screen">
      <div className="flex-grow">
        <Header />
        <div className="bg-background flex flex-col w-full px-5 md:px-20">
          <div className="mt-20 md:mt-24"></div>
          <div className="flex flex-col md:flex-row justify-between items-start w-full mt-4 space-y-3 md:space-y-0 md:space-x-12 mb-4">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-black">Browse Clubs</h1>
              <h2 className="text-xl">Finding Clubs has Never Been Easier.</h2>
            </div>
            <Link
              href="/Events"
              className="relative w-full md:w-auto px-4 py-4  text-lg font-bold text-white bg-gradient-to-r from-clubPurple to-clubTaro transition duration-300 hover:scale-105"
            >
              Check out our events page!
            </Link>
          </div>
        </div>
        <SearchControl
          clubs={clubs}
          setCurrentClubs={setCurrentClubs}
          setIsLoading={setIsLoading}
          followedClubs={followedClubs}
          setSelectedClub={setSelectedClub}
        />
        <div className="flex flex-col w-full px-5 md:px-20">
          <Catalog
            clubs={currentClubs}
            isLoading={isLoading}
            followedClubs={followedClubs}
            setFollowedClubs={setFollowedClubs}
            selectedClub={selectedClub}
            setSelectedClub={setSelectedClub}
          />
        </div>
      </div>
      <Footer />
    </main>
  );
}
