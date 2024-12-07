"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import AuthWrapper from "../components/AuthWrapper";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Catalog from "../components/catalog/Catalog";
import { IClub } from "@/lib/models/Club";
import SearchControl from "@/components/search/SearchControl";

import { getCookie } from "cookies-next";
import jwt from "jsonwebtoken";
import SurveyBanner from "@/components/Survey";
import SearchWrapper from "@/components/search/SearchWrapper";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
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

  // token
  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      const decoded = jwt.decode(token.toString());
      console.log(decoded);
    }
  });

  return (
    <AuthWrapper>
      <main className="w-full">
        <section className="h-screen">
          <Header />
          <div className="flex flex-col w-full h-screen px-5 md:px-20">
            <div className="mt-20 md:mt-24"></div>
            <h1 className="text-3xl font-bold text-black">Browse Clubs</h1>
            <h2 className="text-xl mb-8">Finding Clubs has Never Been Easier.</h2>
            <SearchWrapper>
              <SearchControl clubs={clubs} setCurrentClubs={setCurrentClubs} setIsLoading={setIsLoading} />
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
