import React, { useState, useEffect, useRef } from "react";
import ClubCard from "./ClubCard";
import ClubModal from "./ClubModal";
import { IClub } from "@/lib/models/Club";

interface CatalogProps {
  clubs: IClub[];
  isLoading: boolean;
  followedClubs: string[] | [];
  setFollowedClubs: React.Dispatch<React.SetStateAction<string[] | []>>;
  selectedClub: IClub | null;
  setSelectedClub: React.Dispatch<React.SetStateAction<IClub | null>>;
}

const Catalog = ({
  clubs,
  isLoading,
  followedClubs,
  setFollowedClubs,
  selectedClub,
  setSelectedClub,
}: CatalogProps) => {
  const [visibleClubs, setVisibleClubs] = useState(50);
  const firstRef = useRef(true);
  const initialFollowedClubsRef = useRef<string[]>([]);
  const initialLoadCompletedRef = useRef(false);

  const handleCloseModal = () => setSelectedClub(null);

  useEffect(() => {
    if (followedClubs.length > 0 && firstRef.current) {
      initialFollowedClubsRef.current = followedClubs;
      firstRef.current = false;
    }
  }, [followedClubs]);

  useEffect(() => {
    if (!isLoading && !initialLoadCompletedRef.current) {
      initialLoadCompletedRef.current = true;
    }
  }, [isLoading]);

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

  const renderSkeletons = () => (
    <div className="grid gap-5 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-items-center py-5">
      {[...Array(6)].map((_, i) => (
        <SkeletonClubCard key={i} />
      ))}
    </div>
  );

  if (!initialLoadCompletedRef.current) {
    return renderSkeletons();
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-gray-500 text-lg">No results found.</p>
      </div>
    );
  }

  return (
    <div className="mt-1 md:mt-4">
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
    </div>
  );
};

const SkeletonClubCard = () => (
  <div className="relative w-full max-w-2xl rounded-xl shadow-md animate-pulse flex flex-col justify-between border border-gray-300/30">
    <div className="flex flex-row gap-4 px-3 py-2 md:px-4 md:py-3">
      <div className="flex-1 min-w-0">
        <div className="h-5 bg-gray-300/40 rounded w-3/5 mb-2"></div>
        <div className="h-4 bg-gray-300/30 rounded w-1/2 mb-2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300/30 rounded w-full"></div>
          <div className="h-4 bg-gray-300/30 rounded w-4/5"></div>
          <div className="h-4 bg-gray-300/30 rounded w-3/5"></div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-[80px] h-[80px] bg-gray-300/40 rounded-xl mb-2"></div>
        <div className="w-[80.1px] h-6 bg-gray-300/40 rounded"></div>
        <div className="h-4 bg-gray-300/30 rounded w-[50px] mt-2"></div>
      </div>
    </div>
    <div className="w-full py-2 px-3 md:px-4 bg-gray-200/30 rounded-b-xl">
      <div className="h-4 bg-gray-300/50 rounded w-3/5 mx-auto"></div>
    </div>
  </div>
);

export default Catalog;
