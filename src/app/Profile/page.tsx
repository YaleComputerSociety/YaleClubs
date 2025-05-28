"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import EventCard from "../../components/events/catalog/EventCard";
import EventModal from "../../components/events/catalog/EventModal";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { IEvent } from "@/lib/models/Event";
import { IClub } from "@/lib/models/Club";
import ClubModal from "@/components/catalog/ClubModal";
import ClubCard from "@/components/catalog/ClubCard";
import CreateEventButton from "@/components/events/update/CreateEventButton";

import { HiUserGroup } from "react-icons/hi";
import { MdCalendarToday, MdArrowForward, MdLockOutline } from "react-icons/md";
import { AiOutlineHeart } from "react-icons/ai";
import { BiCheckCircle } from "react-icons/bi";

export default function ProfilePage() {
  const [, setEvents] = useState<IEvent[]>([]);
  const [clubs, setClubs] = useState<IClub[]>([]);
  const [followedClubs2, setFollowedClubs2] = useState<IClub[]>([]);
  const [, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedClub, setSelectedClub] = useState<IClub | null>(null);

  const [followingEvents, setFollowingEvents] = useState<IEvent[]>([]);
  const [followedClubs, setFollowedClubs] = useState<string[]>([]);
  const [officerEvents, setOfficerEvents] = useState<IEvent[]>([]);
  const [officerClubs, setOfficerClubs] = useState<IClub[]>([]);

  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const handleClickEvent = (event: IEvent) => setSelectedEvent(event);

  const [, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();

    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  const [visibleClubs] = useState(50);
  const hasLoadedDataRef = useRef(false);

  const gridStyle = "grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-items-center";

  const handleCloseClubModal = () => setSelectedClub(null);
  const handleCloseEventModal = () => setSelectedEvent(null);

  useEffect(() => {
    if (!isLoading && clubs.length > 0) {
      hasLoadedDataRef.current = true;
    }
  }, [isLoading, clubs.length]);

  const renderClubItem = (club: IClub) => (
    <ClubCard
      key={club._id}
      club={club}
      setFollowedClubs={setFollowedClubs}
      followedClubs={followedClubs}
      onClick={() => setSelectedClub(club)}
      initialFollowing={followedClubs.includes(club._id)}
    />
  );

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
    const fetchData = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);
        const [eventsResponse, clubsResponse] = await Promise.all([
          axios.get<IEvent[]>("/api/events/", {}),
          axios.get<IClub[]>("/api/clubs"),
        ]);

        const yaleCollegeClubs = clubsResponse.data
          .filter((club) => club.school === "Yale College")
          .sort((a, b) => a.name.localeCompare(b.name));

        setEvents(eventsResponse.data);
        setClubs(yaleCollegeClubs);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load events. Please try reloading the page.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  const { user } = useAuth();
  const netid = user?.netid;
  const email = user?.email;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/users", {
          params: { netid: netid },
        });
        return response.data; // Return the user data
      } catch (e) {
        console.error("Error fetching user:", e);
        return null;
      }
    };

    const fetchData = async (userData: any) => {
      if (!userData) return;

      try {
        setIsInitialLoading(true);
        setError(null);

        const [eventsResponse, clubsResponse] = await Promise.all([
          axios.get<IEvent[]>("/api/events/"),
          axios.get<IClub[]>("/api/clubs"),
        ]);

        const yaleCollegeClubs = clubsResponse.data
          .filter((club) => club.school === "Yale College")
          .sort((a, b) => a.name.localeCompare(b.name));

        setFollowedClubs(userData.user.followedClubs);

        setEvents(eventsResponse.data);
        setClubs(yaleCollegeClubs);

        const officerClubsList = yaleCollegeClubs
          //.filter((club) => club.leaders.some((leader) => leader.netId == netid))
          .filter((club) => club.leaders.some((leader) => leader.email == email))
          .sort((a, b) => a.name.localeCompare(b.name));

        const officerEventsList = eventsResponse.data
          .filter(
            (event) =>
              event.clubs &&
              event.clubs.some((clubName) => officerClubsList.some((clubObj) => clubObj.name == clubName)),
          )
          .filter((event) => new Date(event.start).getTime() > new Date().getTime())
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        // Clubs the user follows
        const followedClubsList = yaleCollegeClubs
          .filter((club) => userData.user.followedClubs.includes(club._id))
          .filter((club) => !officerClubsList.includes(club))
          .sort((a, b) => a.name.localeCompare(b.name));

        const followingEv = eventsResponse.data
          .filter(
            (event) =>
              event.clubs &&
              event.clubs.some((clubName) => followedClubsList.some((clubObj) => clubObj.name == clubName)),
          )
          .filter((event) => new Date(event.start).getTime() > new Date().getTime())
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        setFollowedClubs2(followedClubsList);
        setFollowingEvents(followingEv);
        setOfficerClubs(officerClubsList);
        setOfficerEvents(officerEventsList);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load events. Please try reloading the page.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    const loadData = async () => {
      const userData = await fetchUser();
      await fetchData(userData);
    };

    if (netid) {
      loadData();
    }
  }, [netid]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-violet-100 rounded-full">
                <MdLockOutline className="w-8 h-8 text-violet-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to YaleClubs Profile</h1>
              <p className="text-lg text-gray-600">View and manage your clubs and events</p>
            </div>
            <div className="p-4 rounded-md text-center">
              <p className="text-gray-700">
                Please{" "}
                <a
                  href={`/api/auth/redirect?from=${pathname}`}
                  className="inline-flex items-center font-semibold text-violet-600 hover:text-violet-500 transition-colors"
                >
                  log in
                  <MdArrowForward className="w-4 h-4 ml-1" />
                </a>{" "}
                to view your profile
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <main className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Header />
        <div className="flex-grow mt-10">
          <div className="flex flex-col w-full px-5 md:px-20 max-w-7xl mx-auto">
            <div className="mt-16 md:mt-20 mb-12">
              <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6 md:gap-8">
                <div className="flex-1 text-center md:text-left w-full">
                  <div className="relative">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-clubPurple to-clubBlurple bg-clip-text text-transparent mb-4">
                      Welcome Back!
                    </h1>
                    <div className="absolute -bottom-2 left-0 md:left-0 right-0 md:right-auto h-1 bg-gradient-to-r from-clubPurple to-clubBlurple rounded-full w-24 mx-auto md:mx-0"></div>
                  </div>
                  <p className="text-lg md:text-xl text-gray-600 mt-6 leading-relaxed">
                    Manage your clubs and discover exciting events in your community
                  </p>
                </div>
                {(officerClubs.length != 0 || followedClubs2.length == 0) && (
                  <div className="flex items-center">
                    <CreateEventButton />
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="w-full p-4 mb-8 text-red-700 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                {error}
              </div>
            )}

            {officerClubs.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-clubPurple to-clubBlurple rounded-xl flex items-center justify-center">
                      <HiUserGroup className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Your Club Leaderships</h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-clubPurple/30 to-transparent"></div>
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {officerClubs.length} {officerClubs.length === 1 ? "Club" : "Clubs"}
                  </span>
                </div>
                <div className={gridStyle}>
                  {officerClubs.slice(0, visibleClubs).map(renderClubItem)}
                  {selectedClub && (
                    <ClubModal
                      club={selectedClub}
                      onClose={handleCloseClubModal}
                      setFollowedClubs={setFollowedClubs}
                      followedClubs={followedClubs}
                      initialFollowing={followedClubs.includes(selectedClub._id)}
                    />
                  )}
                </div>
                {visibleClubs < officerClubs.length && (
                  <div className="flex justify-center items-center mt-10">
                    <div className="w-8 h-8 border-4 border-clubPurple/30 border-t-clubPurple rounded-full animate-spin"></div>
                  </div>
                )}
              </section>
            )}

            {officerEvents.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <MdCalendarToday className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Your Club&apos;s Events</h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent"></div>
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {officerEvents.length} {officerEvents.length === 1 ? "Event" : "Events"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {officerEvents.map((event) => (
                    <EventCard key={event._id} event={event} onClick={() => handleClickEvent(event)} />
                  ))}
                </div>
              </section>
            )}

            {/* Followed Clubs Section */}
            {followedClubs2.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <AiOutlineHeart className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Clubs You Follow</h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-rose-500/30 to-transparent"></div>
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {followedClubs2.length} {followedClubs2.length === 1 ? "Club" : "Clubs"}
                  </span>
                </div>
                <div className={gridStyle}>
                  {followedClubs2.slice(0, visibleClubs).map(renderClubItem)}
                  {selectedClub && (
                    <ClubModal
                      club={selectedClub}
                      onClose={handleCloseClubModal}
                      setFollowedClubs={setFollowedClubs}
                      followedClubs={followedClubs}
                      initialFollowing={followedClubs.includes(selectedClub._id)}
                    />
                  )}
                </div>
                {visibleClubs < followedClubs2.length && (
                  <div className="flex justify-center items-center mt-10">
                    <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
                  </div>
                )}
              </section>
            )}

            {/* Following Events Section */}
            {followingEvents.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <BiCheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Events from Followed Clubs</h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-500/30 to-transparent"></div>
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {followingEvents.length} {followingEvents.length === 1 ? "Event" : "Events"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {followingEvents.map((event) => (
                    <EventCard key={event._id} event={event} onClick={() => handleClickEvent(event)} />
                  ))}
                </div>
              </section>
            )}

            {selectedEvent && (
              <EventModal
                associatedClubLeaders={clubs
                  .filter((club) => selectedEvent.clubs?.includes(club.name))
                  .flatMap((club) => club.leaders)}
                event={selectedEvent}
                onClose={handleCloseEventModal}
                associatedClubs={clubs.filter((club) => selectedEvent.clubs?.includes(club.name))}
              />
            )}

            {officerClubs.length == 0 &&
              officerEvents.length == 0 &&
              followedClubs2.length == 0 &&
              followingEvents.length == 0 && (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-r from-clubPurple to-clubBlurple rounded-full flex items-center justify-center mx-auto mb-8">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Get Started</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Discover amazing clubs and events in your community. Follow clubs and attend events to personalize
                      your experience.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                      <Link href="/Events">
                        <button className="group flex items-center font-semibold justify-center gap-2 flex-row rounded-2xl text-lg drop-shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-r from-clubPurple to-clubBlurple text-white px-8 py-4 w-full sm:w-auto">
                          <svg
                            className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          View Events
                        </button>
                      </Link>

                      <Link href="/Clubs">
                        <button className="group flex items-center font-semibold justify-center gap-2 flex-row rounded-2xl text-lg border-2 border-clubPurple text-clubPurple hover:bg-clubPurple hover:text-white transition-all duration-300 hover:shadow-lg hover:scale-105 px-8 py-4 w-full sm:w-auto">
                          <svg
                            className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          View Clubs
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
