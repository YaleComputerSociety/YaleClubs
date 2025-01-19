import React, { useState, useEffect, useRef } from "react";
import ClubCard from "./ClubCard";
import ClubModal from "./ClubModal";
import { IClub } from "@/lib/models/Club";

interface CatalogProps {
  clubs: IClub[];
  isLoading: boolean;
  followedClubs: string[] | [];
  setFollowedClubs: React.Dispatch<React.SetStateAction<string[] | []>>;
}

const Catalog = ({ clubs, isLoading, followedClubs, setFollowedClubs }: CatalogProps) => {
  const [selectedClub, setSelectedClub] = useState<IClub | null>(null);
  const [visibleClubs, setVisibleClubs] = useState(50); // Initial number of clubs to show
  const firstRef = useRef(true);

  const handleCloseModal = () => setSelectedClub(null);

  const initialFollowedClubsRef = useRef<string[]>([]);

  useEffect(() => {
    if (followedClubs.length > 0 && firstRef.current) {
      initialFollowedClubsRef.current = followedClubs;
      firstRef.current = false;
    }
  }, [followedClubs]);

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
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setVisibleClubs((prev) => Math.min(prev + 50, clubs.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [clubs.length]);

  return (
    <div className="mt-1 md:mt-4">
      {isLoading ? (
        <div className="flex justify-center items-center mt-10">
          <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No results found.</div>
      ) : (
        <div>
          <div className="grid gap-5 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-items-center">
            {clubs.slice(0, visibleClubs).map(renderClubItem)}
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
          {visibleClubs < clubs.length && (
            <div className="flex justify-center items-center mt-10">
              <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}
      {selectedClub && <ClubModal club={selectedClub} onClose={handleCloseModal} />}
    </div>
  );
};

export default Catalog;
