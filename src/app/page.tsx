"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import AuthWrapper from "../components/AuthWrapper";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Catalog from "../components/catalog/Catalog";
import { IClub } from "@/lib/models/Club";

export default function Home() {
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchApiMessage = async () => {
      try {
        const response = await axios.get<IClub[]>("/api/clubs");
        console.log("API message:", response.data);
      } catch (error) {
        console.error("Error fetching API message:", error);
      }
    };
    fetchApiMessage();
  }, []);

  return (
    <AuthWrapper>
      <main className="w-full">
        <section
          // onScroll={handleScroll}
          className="h-screen overflow-y-scroll"
          style={{ maxHeight: "100vh" }}
        >
          <div className="flex flex-col w-full min-h-screen">
            <Header />
            <div className="mt-10">
              {/* <Catalog  /> */}
              <Catalog page={page} setPage={setPage} />
            </div>
            <Footer />
          </div>
        </section>
      </main>
    </AuthWrapper>
  );
}
