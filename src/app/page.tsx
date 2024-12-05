"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import AuthWrapper from "../components/AuthWrapper";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Catalog from "../components/catalog/Catalog";
import { IClub } from "@/lib/models/Club";
import Trie from "@/components/catalog/Trie";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [clubs, setClubs] = useState<IClub[]>([]);

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
            <Catalog clubs={clubs} isLoading={isLoading} />
            <Footer />
          </div>
        </section>
      </main>
    </AuthWrapper>
  );
}
