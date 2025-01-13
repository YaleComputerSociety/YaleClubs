"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import AuthWrapper from "../components/AuthWrapper";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Catalog from "../components/catalog/Catalog";
import { IClub } from "@/lib/models/Club";
import SearchControl from "@/components/search/SearchControl";

import SurveyBanner from "@/components/Survey";
import SearchWrapper from "@/components/search/SearchWrapper";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [clubs, setClubs] = useState<IClub[]>([]);
  const [currentClubs, setCurrentClubs] = useState<IClub[]>([]);
  // const [netid, setNetid] = useState<string | null>(null);
  const [followedClubs, setFollowedClubs] = useState<string[]>([]);

  useEffect(() => {
    const fetchFollowedClubs = async (netid: string): Promise<string[]> => {
      try {
        const response = await axios.get<string[]>(`/api/user/followed-clubs?netid=${netid}`);
        return response.data; // Directly use the array returned by the API
      } catch (err) {
        console.error("Error fetching followed clubs:", err);
        return [];
      }
    };

    const initialize = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const decoded = jwtDecode<{ netid: string }>(token);
          // setNetid(decoded.netid);

          const followedClubs = await fetchFollowedClubs(decoded.netid); // Directly assign the array
          console.log("Followed Clubs:", followedClubs);
          setFollowedClubs(followedClubs); // Update the state with the array
        } catch (err) {
          console.error("Invalid token:", err);
          // setNetid(null);
        }
      }

      const fetchApiMessage = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get<IClub[]>("/api/clubs");
          setClubs(response.data);
        } catch (error) {
          console.error("Error fetching API message:", error);
        } finally {
          setTimeout(() => setIsLoading(false), 2); // delay because setClubs is async
        }
      };

      await fetchApiMessage();
    };

    initialize();
  }, [setFollowedClubs, setClubs, setIsLoading]);

  return (
    <AuthWrapper>
      <main className="w-full">
        <section className="h-screen">
          <Header />
          <div className="flex flex-col w-full h-screen px-5 md:px-20">
            <div className="mt-20 md:mt-24"></div>
            <h1 className="text-3xl font-bold text-black">Browse Clubs</h1>
            <h2 className="text-xl mb-4 md:mb-8">Finding Clubs has Never Been Easier.</h2>
            <SearchWrapper>
              <SearchControl
                clubs={clubs}
                setCurrentClubs={setCurrentClubs}
                setIsLoading={setIsLoading}
                followedClubs={followedClubs}
              />
            </SearchWrapper>
            <Catalog clubs={currentClubs} isLoading={isLoading} />
            <Footer />
          </div>
        </section>
        <SurveyBanner />
      </main>
    </AuthWrapper>
  );
}
