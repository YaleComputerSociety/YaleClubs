"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import AuthWrapper from "../components/AuthWrapper";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Catalog from "../components/catalog/Catalog";
import { IClub } from "@/lib/models/Club";
import SearchControl from "@/components/search/SearchControl";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [clubs, setClubs] = useState<IClub[]>([]);
  const [currentClubs, setCurrentClubs] = useState<IClub[]>([]);

  useEffect(() => {
    const fetchApiMessage = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<IClub[]>("/api/clubs");
        console.log("API message:", response.data);
        setClubs(response.data);
      } catch (error) {
        console.error("Error fetching API message:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApiMessage();
  }, []);

  return (
    <AuthWrapper>
      <main className="w-full">
        <section className="h-screen overflow-y-scroll">
          <div className="flex flex-col w-full min-h-screen">
            <Header />
            <div className="mt-40"></div>
            <h1 className="mx-24 text-3xl font-bold text-black">Browse Clubs</h1>
            <h2 className="mx-24 text-xl mb-8">Finding Clubs has Never Been Easier.</h2>
            <SearchControl clubs={clubs} setCurrentClubs={setCurrentClubs} />
            <Catalog clubs={currentClubs} isLoading={isLoading} />
            <Footer />
          </div>
        </section>
      </main>
    </AuthWrapper>
  );
}
