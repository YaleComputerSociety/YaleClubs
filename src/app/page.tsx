"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import AuthWrapper from "../components/AuthWrapper";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Catalog from "../components/catalog/Catalog";
import { IClub } from "@/lib/models/Club";
import { IEvent } from "@/lib/models/Event";
import SearchControl from "@/components/search/SearchControl";

import SurveyBanner from "@/components/Survey";
import SearchWrapper from "@/components/search/SearchWrapper";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [clubs, setClubs] = useState<IClub[]>([]);
  const [topEvents, setTopEvents] = useState<IEvent[]>([]);
  const [currentClubs, setCurrentClubs] = useState<IClub[]>([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<IClub[]>("/api/clubs");
        setClubs(response.data);
      } catch (error) {
        console.error("Error fetching API message:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTopEvents = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<IEvent[]>("/api/events");
        setTopEvents(response.data.slice(0, 2));
      } catch (error) {
        console.error("Error fetching API message:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubs().then(() => fetchTopEvents());
  }, []);

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
              <SearchControl clubs={clubs} setCurrentClubs={setCurrentClubs} setIsLoading={setIsLoading} />
            </SearchWrapper>
            <Catalog clubs={currentClubs} topEvents={topEvents} isLoading={isLoading} />
            <Footer />
          </div>
        </section>
        <SurveyBanner />
      </main>
    </AuthWrapper>
  );
}
