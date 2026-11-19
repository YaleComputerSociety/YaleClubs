"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import EventCard from "../../components/events/catalog/EventCard";
import EventModal from "../../components/events/catalog/EventModal";
import SkeletonClubCard from "@/components/catalog/SkeletonClubCard";
import Header from "@/components/catalog/DisplayHeader";
import "@/app/display.css";
import "@/app/supporting-pages.css";
import "./profile.css";
import SkeletonEventCard from "@/components/events/catalog/SkeletonEventCard";

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
  const [followedClubsDetails, setFollowedClubsDetails] = useState<IClub[]>([]);
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

  const [visibleClubs] = useState(50);

  const gridStyle = "club-grid profile-club-grid";

  const handleCloseClubModal = () => setSelectedClub(null);
  const handleCloseEventModal = () => setSelectedEvent(null);

  const renderClubItem = (club: IClub) => (
    <ClubCard
      key={club._id.toString()}
      club={club}
      setFollowedClubs={setFollowedClubs}
      followedClubs={followedClubs}
      onClick={() => setSelectedClub(club)}
      initialFollowing={followedClubs.includes(club._id.toString())}
    />
  );

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
        setError(null);

        const [eventsResponse, clubsResponse] = await Promise.all([
          axios.get<IEvent[]>("/api/events/"),
          axios.get<IClub[]>("/api/clubs"),
        ]);

        const yaleCollegeClubs = clubsResponse.data;

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
          .filter((club) => userData.user.followedClubs.includes(club._id.toString()))
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

        setFollowedClubsDetails(followedClubsList);
        setFollowingEvents(followingEv);
        setOfficerClubs(officerClubsList);
        setOfficerEvents(officerEventsList);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load events. Please try reloading the page.");
      }
    };
    const loadData = async () => {
      try {
        setIsLoading(true);

        const userData = await fetchUser();
        await fetchData(userData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (netid && email) {
      loadData();
    }
  }, [netid, email]);

  if (!isLoggedIn) {
    return (
      <div className="club-display supporting-page profile-page">
        <Header />
        <main className="supporting-content analytics-sign-in">
          <div className="analytics-sign-in-card profile-sign-in-card">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="profile-empty-icon">
                <MdLockOutline className="w-6 h-6" />
              </div>
              <h1 className="analytics-sign-in-title">Welcome to YaleClubs Profile</h1>
              <p className="profile-description">View and manage your clubs and events</p>
            </div>
            <div className="p-4 rounded-md text-center">
              <p className="text-gray-700">
                Please{" "}
                <a href={`/api/auth/redirect?from=${pathname}`} className="profile-login-link">
                  log in
                  <MdArrowForward className="w-4 h-4 ml-1" />
                </a>{" "}
                to view your profile
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const EventGridStyle = "profile-event-grid";
  const renderClubSkeletons = () => (
    <div className={`${gridStyle} py-5`}>
      {[...Array(3)].map((_, i) => (
        <SkeletonClubCard key={i} />
      ))}
    </div>
  );
  const renderEventSkeletons = () => (
    <div className={`${EventGridStyle} py-5`}>
      {[...Array(4)].map((_, i) => (
        <SkeletonEventCard key={i} />
      ))}
    </div>
  );

  return (
    <>
      <main className="club-display supporting-page profile-page">
        <Header />
        <div className="supporting-content">
          <div className="profile-content">
            <div className="profile-intro">
              <div className="profile-intro-row">
                <div className="profile-intro-copy">
                  <div className="profile-welcome">
                    <h1 className="supporting-title">Welcome Back!</h1>
                  </div>
                  <p className="profile-description">
                    Manage your clubs and discover exciting events in your community
                  </p>
                </div>
                {(officerClubs.length != 0 || followedClubsDetails.length == 0) && (
                  <div className="profile-create">
                    <CreateEventButton />
                  </div>
                )}
              </div>
            </div>

            {error && <div className="analytics-error profile-error">{error}</div>}

            {!isLoading &&
              officerClubs.length == 0 &&
              officerEvents.length == 0 &&
              followedClubsDetails.length == 0 &&
              followingEvents.length == 0 && (
                <div className="profile-empty">
                  <div className="max-w-md mx-auto">
                    <div className="profile-empty-icon">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <h3 className="profile-empty-title">Get Started</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Discover amazing clubs and events in your community. Follow clubs and attend events to personalize
                      your experience.
                    </p>
                    <div className="profile-empty-actions">
                      <Link href="/Events">
                        <button className="profile-action">
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

                      <Link href="/">
                        <button className="profile-action">
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

            <section className="profile-section">
              {isLoading || officerClubs.length > 0 ? (
                <div className="profile-section-heading">
                  <div className="profile-section-label">
                    <div className="profile-section-icon">
                      <HiUserGroup className="w-5 h-5" />
                    </div>
                    <h2 className="profile-section-title">Your Club Leaderships</h2>
                  </div>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
                  ) : (
                    <span className="profile-count">
                      {officerClubs.length} {officerClubs.length === 1 ? "Club" : "Clubs"}
                    </span>
                  )}
                </div>
              ) : null}
              {isLoading ? (
                renderClubSkeletons()
              ) : officerClubs.length > 0 ? (
                <>
                  <div className={gridStyle}>{officerClubs.slice(0, visibleClubs).map(renderClubItem)}</div>
                  {visibleClubs < officerClubs.length && (
                    <div className="flex justify-center items-center mt-10">
                      <div className="w-8 h-8 border-4 border-clubPurple/30 border-t-clubPurple rounded-full animate-spin"></div>
                    </div>
                  )}
                </>
              ) : null}
            </section>

            <section className="profile-section">
              {isLoading || officerEvents.length > 0 ? (
                <div className="profile-section-heading">
                  <div className="profile-section-label">
                    <div className="profile-section-icon">
                      <MdCalendarToday className="w-5 h-5" />
                    </div>
                    <h2 className="profile-section-title">Your Club&apos;s Events</h2>
                  </div>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
                  ) : (
                    <span className="profile-count">
                      {officerEvents.length} {officerEvents.length === 1 ? "Event" : "Events"}
                    </span>
                  )}
                </div>
              ) : null}
              {isLoading ? (
                renderEventSkeletons()
              ) : officerEvents.length > 0 ? (
                <div className="profile-event-grid">
                  {officerEvents.map((event) => (
                    <EventCard key={event._id.toString()} event={event} onClick={() => handleClickEvent(event)} />
                  ))}
                </div>
              ) : null}
            </section>

            {/* Followed Clubs Section */}
            <section className="profile-section">
              {isLoading || followedClubsDetails.length > 0 ? (
                <div className="profile-section-heading">
                  <div className="profile-section-label">
                    <div className="profile-section-icon">
                      <AiOutlineHeart className="w-5 h-5" />
                    </div>
                    <h2 className="profile-section-title">Clubs You Follow</h2>
                  </div>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
                  ) : (
                    <span className="profile-count">
                      {followedClubsDetails.length} {followedClubsDetails.length === 1 ? "Club" : "Clubs"}
                    </span>
                  )}
                </div>
              ) : null}
              {isLoading ? (
                renderClubSkeletons()
              ) : followedClubsDetails.length > 0 ? (
                <>
                  <div className={gridStyle}>{followedClubsDetails.slice(0, visibleClubs).map(renderClubItem)}</div>
                  {visibleClubs < followedClubsDetails.length && (
                    <div className="flex justify-center items-center mt-10">
                      <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                </>
              ) : null}
            </section>

            {/* Following Events Section */}
            <section className="profile-section">
              {isLoading || followingEvents.length > 0 ? (
                <div className="profile-section-heading">
                  <div className="profile-section-label">
                    <div className="profile-section-icon">
                      <BiCheckCircle className="w-5 h-5" />
                    </div>
                    <h2 className="profile-section-title">Events from Followed Clubs</h2>
                  </div>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
                  ) : (
                    <span className="profile-count">
                      {followingEvents.length} {followingEvents.length === 1 ? "Event" : "Events"}
                    </span>
                  )}
                </div>
              ) : null}
              {isLoading ? (
                renderEventSkeletons()
              ) : followingEvents.length > 0 ? (
                <div className="profile-event-grid">
                  {followingEvents.map((event) => (
                    <EventCard key={event._id.toString()} event={event} onClick={() => handleClickEvent(event)} />
                  ))}
                </div>
              ) : null}
            </section>

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

            {selectedClub && (
              <ClubModal
                club={selectedClub}
                onClose={handleCloseClubModal}
                setFollowedClubs={setFollowedClubs}
                followedClubs={followedClubs}
                initialFollowing={followedClubs.includes(selectedClub._id.toString())}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
