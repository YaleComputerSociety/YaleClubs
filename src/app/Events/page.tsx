"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthWrapper from "@/components/AuthWrapper";
import SearchWrapper from "@/components/search/SearchWrapper";
import SearchControlEvent from "@/components/events/catalog/SearchControlEvents";
import { IEvent } from "@/lib/models/Event";
import { useState } from "react";
import Catalog from "@/components/events/catalog/Catalog";
import axios from "axios";
import { IClub } from "@/lib/models/Club";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";

export default function EventsPage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [currentEvents, setCurrentEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clubs, setClubs] = useState<IClub[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<IEvent[]>("/api/events");
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching API message:", error);
      } finally {
        setIsLoading(false);
      }
    };

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

    fetchEvents().then(() => fetchClubs());
  }, []);

  return (
    <AuthWrapper>
      <main className="w-full">
        <section className="h-screen">
          <Header />
          <div className="flex flex-col w-full h-screen px-5 md:px-20">
            <div className="mt-20 md:mt-24"></div>
            <div className=" flex flex-col md:flex-row lg:flex-row items-center justify-between">
              <SearchWrapper>
                <SearchControlEvent
                  clubsForFilter={clubs}
                  events={events}
                  setCurrentEvents={setCurrentEvents}
                  setIsLoading={setIsLoading}
                />
              </SearchWrapper>
              <Link href="/CreateUpdateEvent">
                <button className="flex mb-3 items-center font-semibold  justify-center gap-2 flex-row rounded-full text-xl drop-shadow-md transition hover:shadow-lg  hover:bg-violet-500 bg-violet-600 text-white px-5 py-3">
                  <FaPlus /> Create Event
                </button>
              </Link>
            </div>

            <Catalog clubs={clubs} events={currentEvents} isLoading={isLoading} />
            <Footer />
          </div>
        </section>
        {/* <SurveyBanner /> */}
      </main>
    </AuthWrapper>
  );
}
