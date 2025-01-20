"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import AuthWrapper from "../components/AuthWrapper";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Catalog from "../components/catalog/Catalog";
import { IClub } from "@/lib/models/Club";
import SearchControl from "@/components/search/SearchControl";

// import SearchWrapper from "@/components/search/SearchWrapper";

// import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [clubs, setClubs] = useState<IClub[]>([]);
  const [currentClubs, setCurrentClubs] = useState<IClub[]>([]);
  const [followedClubs, setFollowedClubs] = useState<string[]>([]);
  const token = Cookies.get("token");
  let netid = "";

  if (token) {
    try {
      netid = jwtDecode<{ netid: string }>(token).netid;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  useEffect(() => {
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
    <AuthWrapper>
      <main className=" flex flex-col min-h-screen">
        <div className="flex-grow">
          <Header />
          <div className="flex flex-col w-full px-5 md:px-20">
            <div className="mt-20 md:mt-24"></div>
            <h1 className="text-3xl font-bold text-black">Browse Clubs</h1>
            <h2 className="text-xl mb-4 md:mb-8">Finding Clubs has Never Been Easier.</h2>
            {/* <SearchWrapper> */}
            <SearchControl
              clubs={clubs}
              setCurrentClubs={setCurrentClubs}
              setIsLoading={setIsLoading}
              followedClubs={followedClubs}
            />
            {/* </SearchWrapper> */}
            <Catalog
              clubs={currentClubs}
              isLoading={isLoading}
              followedClubs={followedClubs}
              setFollowedClubs={setFollowedClubs}
            />
          </div>
        </div>
        <Footer />
      </main>
    </AuthWrapper>
  );
}
