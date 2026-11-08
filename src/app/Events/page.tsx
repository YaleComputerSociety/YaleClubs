"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

import EventsHeader from "@/components/events/EventsHeader";
import "./events-top.css";
import Footer from "@/components/catalog/DisplayFooter";
import SearchControlEvent from "@/components/events/catalog/SearchControlEvents";
import Catalog from "@/components/events/catalog/Catalog";

import { MdLockOutline } from "react-icons/md";

import { IEvent } from "@/lib/models/Event";
import { IClub } from "@/lib/models/Club";
import CreateEventButton from "@/components/events/update/CreateEventButton";

const useSkeletonCount = () => {
  const [skeletonCount, setSkeletonCount] = useState(8);

  useEffect(() => {
    const calculateSkeletons = () => {
      const containerWidth = window.innerWidth - 40;
      let itemsPerRow;
      if (containerWidth < 640) itemsPerRow = 1;
      else if (containerWidth < 768) itemsPerRow = 2;
      else if (containerWidth < 1024) itemsPerRow = 3;
      else itemsPerRow = 4;

      const itemHeight = 256;
      const viewportHeight = window.innerHeight;
      const rowsThatFit = Math.ceil(viewportHeight / itemHeight);
      const rowsToShow = rowsThatFit + 1;

      setSkeletonCount(itemsPerRow * rowsToShow);
    };

    calculateSkeletons();
    window.addEventListener("resize", calculateSkeletons);
    return () => window.removeEventListener("resize", calculateSkeletons);
  }, []);

  return skeletonCount;
};

function getRandomThree(array: IEvent[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
}

export default function EventsPage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [clubs, setClubs] = useState<IClub[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [currentUpcomingEvents, setCurrentUpcomingEvents] = useState<IEvent[]>([]);
  const [currentPastEvents, setCurrentPastEvents] = useState<IEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<IEvent[]>([]);
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const skeletonCount = useSkeletonCount();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    // Set the initial value
    updateIsMobile();

    // Add event listener for changes
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);
        const [eventsResponse, clubsResponse] = await Promise.all([
          axios.get<IEvent[]>("/api/events/", {
            headers: {
              "Content-Type": "application/json",
            },
          }),
          axios.get<IClub[]>("/api/clubs"),
        ]);

        const yaleCollegeClubs = clubsResponse.data
          .filter((club) => club.school === "Yale College")
          .sort((a, b) => a.name.localeCompare(b.name));

        setEvents(eventsResponse.data);
        setClubs(yaleCollegeClubs);

        // Split and sort events
        const now = new Date();
        const upcoming = eventsResponse.data
          .filter((event) => new Date(event.start) >= now)
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        const past = eventsResponse.data
          .filter((event) => new Date(event.start) < now)
          .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

        setCurrentUpcomingEvents(upcoming);
        setCurrentPastEvents(past);
        setFeaturedEvents(getRandomThree(upcoming));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load events. Please try reloading the page.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        {/* <Header /> */}
        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-violet-100 rounded-full">
                <MdLockOutline className="w-8 h-8 text-violet-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to YaleClubs Events</h1>
              <p className="text-lg text-gray-600">Discover and join exciting events happening around our campus</p>
            </div>
            <div className="p-4 rounded-md text-center">
              <p className="text-gray-700">
                Please{" "}
                <a
                  href={`/api/auth/redirect?from=${pathname}`}
                  className="inline-flex items-center font-semibold text-violet-600 hover:text-violet-500 transition-colors"
                >
                  log in
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>{" "}
                to view and participate in events
              </p>
            </div>
          </div>
        </main>
        <div className="club-display page-footer">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex flex-col min-h-screen bg-white">
        <EventsHeader />
        <div className="flex-grow">
          <div className="flex flex-col w-full px-5 md:px-20">
            <section className="events-top" aria-label="Find events">
              <div className="events-intro">
                <div className="events-intro-copy">
                  <h1>Events</h1>
                </div>
                <div className="events-create">
                  <CreateEventButton />
                </div>
              </div>

              <div className="flex flex-col md:flex-row lg:flex-row items-center justify-between mb-0 md:mb-6">
                <SearchControlEvent
                  clubsForFilter={clubs}
                  events={events}
                  setCurrentUpcomingEvents={setCurrentUpcomingEvents}
                  setCurrentPastEvents={setCurrentPastEvents}
                />
              </div>
            </section>

            {error && <div className="w-full p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

            <div className="w-full">
              <Catalog
                clubs={clubs}
                featuredEvents={featuredEvents}
                upcomingEvents={currentUpcomingEvents}
                pastEvents={currentPastEvents}
                isLoading={isInitialLoading}
                showFeatured={currentUpcomingEvents.length + currentPastEvents.length === events.length}
                skeletonCount={skeletonCount}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>
        <div className="club-display page-footer">
          <Footer />
        </div>
      </main>
    </>
  );
}
