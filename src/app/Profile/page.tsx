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

import { FaPlus } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";

import { IEvent } from "@/lib/models/Event";
import { IClub } from "@/lib/models/Club";
import ClubModal from "@/components/catalog/ClubModal";
import ClubCard from "@/components/catalog/ClubCard";

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
          axios.get<IEvent[]>("/api/events/", {
          }),
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
            (event) => event.clubs &&
              event.clubs.some((clubName) => officerClubsList.some((clubObj) => clubObj.name == clubName)))
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

        console.log(followedClubs);
        console.log(followingEv);
        console.log(officerClubsList);
        console.log(officerEventsList);
        console.log(netid);
        console.log(followedClubsList[0].leaders[0].email);
        console.log("followed clubs string list:");
        console.log(followedClubs);

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
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
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
      <main className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow">
          <div className="flex flex-col w-full px-5 md:px-20">
            <div className="mt-20 md:mt-24"></div>

            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 md:gap-0">
              <div className="flex-1 text-center md:text-left w-full">
                <h1 className="text-3xl font-bold text-black">Hello!</h1>
                <h2 className="text-xl mb-0 md:mb-4">
                  View the clubs and events of which you are an officer or follower.
                </h2>
              </div>
              {(officerClubs.length != 0 || followedClubs2.length == 0) && (
                <div className="flex items-center mb-4 md:mb-0">
                  <Link href="/CreateUpdateEvent">
                    <button className="flex items-center font-semibold justify-center gap-2 flex-row rounded-full text-xl drop-shadow-md transition duration-300 hover:shadow-lg bg-clubPurple hover:bg-clubBlurple text-white px-5 py-3">
                      <FaPlus /> Create Event
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {error && <div className="w-full p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

            <div>
              <h1 className="text-2xl font-bold mb-4"></h1>
            </div>

            {officerClubs.length > 0 && (
              <div>
                <h1 className="text-2xl font-bold mb-4">Your Club Memberships</h1>
                <div className={gridStyle}>
                  {officerClubs.slice(0, visibleClubs).map(renderClubItem)}
                  {selectedClub && (
                    <ClubModal
                      club={selectedClub}
                      onClose={handleCloseClubModal}
                      setFollowedClubs={setFollowedClubs}
                      followedClubs={followedClubs}
                      initialFollowing={followedClubs.includes(selectedClub._id)}
                      //initialFollowing={initialFollowedClubs.includes(selectedClub._id)}
                    />
                  )}
                </div>
                {visibleClubs < officerClubs.length && (
                  <div className="flex justify-center items-center mt-10">
                    <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold mb-4"></h1>
            </div>

            <div>
              {officerEvents.length > 0 && (
                <h1 className="text-2xl font-bold mb-4">Events for Your Club Memberships</h1>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {officerEvents.map((event) => (
                  <EventCard key={event._id} event={event} onClick={() => handleClickEvent(event)} />
                ))}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-4"></h1>
            </div>
            <div>
              {followedClubs2.length > 0 && <h1 className="text-2xl font-bold mb-4">Clubs You Follow</h1>}
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
                  <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-4"></h1>
            </div>
            <div>
              {followingEvents.length > 0 && <h1 className="text-2xl font-bold mb-4">Events for Followed Clubs</h1>}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {followingEvents.map((event) => (
                  <EventCard key={event._id} event={event} onClick={() => handleClickEvent(event)} />
                ))}
              </div>
            </div>

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
                <h1 className="text-2xl font-bold mb-4 text-center text-center">
                  Follow Clubs and View Events to Add Content to Your Profile
                </h1>
              )}

            {officerClubs.length == 0 &&
              officerEvents.length == 0 &&
              followedClubs2.length == 0 &&
              followingEvents.length == 0 && (
                <div className="flex justify-center items-center gap-x-4 my-6">
                  <Link href="/Events">
                    <button className="flex items-center font-semibold justify-center gap-2 flex-row rounded-full text-xl drop-shadow-md transition duration-300 hover:shadow-lg bg-clubPurple hover:bg-clubBlurple text-white px-5 py-3">
                      View Events
                    </button>
                  </Link>

                  <Link href="/Clubs">
                    <button className="flex items-center font-semibold justify-center gap-2 flex-row rounded-full text-xl drop-shadow-md transition duration-300 hover:shadow-lg bg-clubPurple hover:bg-clubBlurple text-white px-5 py-3">
                      View Clubs
                    </button>
                  </Link>
                </div>
              )}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
