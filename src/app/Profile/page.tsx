"use client";

import { useEffect, useState, useRef } from "react";
// import { usePathname } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import EventCard from "../../components/events/catalog/EventCard";
// import Catalog from "../../components/catalog/Catalog";
// import SearchControl from "@/components/search/SearchControl";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
//import SearchControlEvent from "@/components/events/catalog/SearchControlEvents";
//import Catalog from "@/components/events/catalog/Catalog";

import { FaPlus } from "react-icons/fa";
// import { MdLockOutline } from "react-icons/md";

import { IEvent } from "@/lib/models/Event";
import { IClub } from "@/lib/models/Club";
import ClubModal from "@/components/catalog/ClubModal";
import ClubCard from "@/components/catalog/ClubCard";

// const useSkeletonCount = () => {
//   const [skeletonCount, setSkeletonCount] = useState(8);

//   useEffect(() => {
//     const calculateSkeletons = () => {
//       const containerWidth = window.innerWidth - 40;
//       let itemsPerRow;
//       if (containerWidth < 640) itemsPerRow = 1;
//       else if (containerWidth < 768) itemsPerRow = 2;
//       else if (containerWidth < 1024) itemsPerRow = 3;
//       else itemsPerRow = 4;

//       const itemHeight = 256;
//       const viewportHeight = window.innerHeight;
//       const rowsThatFit = Math.ceil(viewportHeight / itemHeight);
//       const rowsToShow = rowsThatFit + 1;

//       setSkeletonCount(itemsPerRow * rowsToShow);
//     };

//     calculateSkeletons();
//     window.addEventListener("resize", calculateSkeletons);
//     return () => window.removeEventListener("resize", calculateSkeletons);
//   }, []);

//   return skeletonCount;
// };


export default function ProfilePage() {
  const [, setEvents] = useState<IEvent[]>([]);
  const [clubs, setClubs] = useState<IClub[]>([]);
  const [followedClubs2, setFollowedClubs2] = useState<IClub[]>([]);
  const [, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedClub, setSelectedClub] = useState<IClub | null>(null);

//   const [currentUpcomingEvents, setCurrentUpcomingEvents] = useState<IEvent[]>([]);
//   const [currentPastEvents, setCurrentPastEvents] = useState<IEvent[]>([]);

//   const [, setClubEvents] = useState<IEvent[]>([]);
  const [followingEvents, setFollowingEvents] = useState<IEvent[]>([]);
  
  const [followedClubs, setFollowedClubs] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  //const [featuredEvents, setFeaturedEvents] = useState<IEvent[]>([]);
//   const { isLoggedIn } = useAuth();
//   const pathname = usePathname();
//   const skeletonCount = useSkeletonCount();
  const [, setSelectedEvent] = useState<IEvent | null>(null);
  const handleClickEvent = (event: IEvent) => setSelectedEvent(event);

  const [, setIsMobile] = useState(false);

//    const [, setCurrentClubs] = useState<IClub[]>([]);



  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    // Set the initial value
    updateIsMobile();

    // Add event listener for changes
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);


   const [visibleClubs, ] = useState(50);
    const firstRef = useRef(true);
    const initialFollowedClubsRef = useRef<string[]>([]);
    const hasLoadedDataRef = useRef(false);

   const gridStyle = "grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-items-center";
  
    const handleCloseModal = () => setSelectedClub(null);
  
    useEffect(() => {
      if (followedClubs.length > 0 && firstRef.current) {
        initialFollowedClubsRef.current = followedClubs;
        firstRef.current = false;
      }
    }, [followedClubs]);
  
    useEffect(() => {
      if (!isLoading && clubs.length > 0) {
        hasLoadedDataRef.current = true;
      }
    }, [isLoading, clubs.length]);
  
    const initialFollowedClubs = initialFollowedClubsRef.current;

   const renderClubItem = (club: IClub) => (
    <ClubCard
      key={club._id}
      club={club}
      setFollowedClubs={setFollowedClubs}
      followedClubs={followedClubs}
      onClick={() => setSelectedClub(club)}
      initialFollowing={initialFollowedClubs.includes(club._id)}
    />
  );


  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);
        const [eventsResponse, clubsResponse] = await Promise.all([
          axios.get<IEvent[]>("/api/events/", {
            // headers: {
            //   "Content-Type": "application/json",
            // },
          }),
          axios.get<IClub[]>("/api/clubs"),
        ]);

        const yaleCollegeClubs = clubsResponse.data
          .filter((club) => club.school === "Yale College")
          .sort((a, b) => a.name.localeCompare(b.name));

        setEvents(eventsResponse.data);
        setClubs(yaleCollegeClubs);

        // Split and sort events
        // const now = new Date();
        // const upcoming = eventsResponse.data
        //   .filter((event) => new Date(event.start) >= now)
        //   .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        // const past = eventsResponse.data
        //   .filter((event) => event.clubs )
        //   .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

        // const clubMemberships = eventsResponse.data.
        //   .f


        //events from clubs that the user is an officer for
        // const clubsEv = eventsResponse.data
        //   .filter((event) => followedClubs.includes(event.clubs.any)))
        //   .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

        //events from clubs that the user follows
        const followingEv = eventsResponse.data
          .filter((event) => event.clubs && event.clubs.some(club => followedClubs.includes(club)))
          .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());


        //clubs the user is an officer for
        // const followedClubsList = yaleCollegeClubs
        //   .filter((club) => club && club.leaders)
        //    .sort((a, b) => a.name.localeCompare(b.name));
        
        //clubs followed by user
        const followedClubsList = clubs
          .filter((club) => club && followedClubs.includes(club.name))
           .sort((a, b) => a.name.localeCompare(b.name));

        setFollowedClubs2(followedClubsList);

        // setCurrentUpcomingEvents(upcoming);
        // setCurrentPastEvents(past);
        // setFeaturedEvents(getRandomThree(upcoming));

        //setClubEvents(clubsEv);
        setFollowingEvents(followingEv);

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


//   if (false) {
//     return (
//       <div className="min-h-screen">
//         <Header />
//         <main className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
//           <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
//             <div className="flex flex-col items-center text-center space-y-4">
//               <div className="p-3 bg-violet-100 rounded-full">
//                 <MdLockOutline className="w-8 h-8 text-violet-600" />
//               </div>
//               <h1 className="text-2xl font-bold text-gray-900">Welcome to YaleClubs Events</h1>
//               <p className="text-lg text-gray-600">Discover and join exciting events happening around our campus</p>
//             </div>
//             <div className="p-4 rounded-md text-center">
//               <p className="text-gray-700">
//                 Please{" "}
//                 <a
//                   href={`/api/auth/redirect?from=${pathname}`}
//                   className="inline-flex items-center font-semibold text-violet-600 hover:text-violet-500 transition-colors"
//                 >
//                   log in
//                   <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
//                   </svg>
//                 </a>{" "}
//                 to view and participate in events
//               </p>
//             </div>
//           </div>
//         </main>
//         <Footer />
//       </div>
//     );
//   }

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
                <h2 className="text-xl mb-0 md:mb-4">View the clubs and events of which you are an officer or follower.</h2>
              </div>
              <div className="flex items-center mb-4 md:mb-0">
                <Link href="/CreateUpdateEvent">
                  <button className="flex items-center font-semibold justify-center gap-2 flex-row rounded-full text-xl drop-shadow-md transition duration-300 hover:shadow-lg bg-clubPurple hover:bg-clubBlurple text-white px-5 py-3">
                    <FaPlus /> Create Event
                  </button>
                </Link>
              </div>
            </div>

            {error && <div className="w-full p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
            
            <div>
              <h1 className="text-2xl font-bold mb-4">Events for Your Club Memberships</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {followingEvents.map((event) => (
                  <EventCard key={event._id} event={event} onClick={() => handleClickEvent(event)} />
                ))}
              </div>
            </div>

             <div>
                <h1 className="text-2xl font-bold mb-4">Clubs You Follow</h1>
                <div className={gridStyle}>
                    {followedClubs2.slice(0, visibleClubs).map(renderClubItem)}
                    {selectedClub && (
                    <ClubModal
                        club={selectedClub}
                        onClose={handleCloseModal}
                        setFollowedClubs={setFollowedClubs}
                        followedClubs={followedClubs}
                        initialFollowing={initialFollowedClubs.includes(selectedClub._id)}
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
              <h1 className="text-2xl font-bold mb-4">Events for Followed Clubs</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {followingEvents.map((event) => (
                  <EventCard key={event._id} event={event} onClick={() => handleClickEvent(event)} />
                ))}
              </div>
            </div>
           


          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
