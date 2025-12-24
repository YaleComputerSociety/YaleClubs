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
  const hasLoadedDataRef = useRef(false);

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
      key={club._id.toString()}
      club={club}
      setFollowedClubs={setFollowedClubs}
      followedClubs={followedClubs}
      onClick={() => setSelectedClub(club)}
      initialFollowing={initialFollowedClubs.includes(club._id.toString())}
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

  const gridStyle = "grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-items-center";

  const renderSkeletons = () => (
    <div className={`${gridStyle} py-5`}>
      {[...Array(12)].map((_, i) => (
        <SkeletonClubCard key={i} />
      ))}
    </div>
  );

  if (isLoading || !hasLoadedDataRef.current) {
    return renderSkeletons();
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
      {isLoading ? (
        <div className="flex justify-center items-center mt-10">
          <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No results found.</div>
      ) : (
        <div>
          <div className={gridStyle}>
            {clubs.slice(0, visibleClubs).map(renderClubItem)}
            {selectedClub && (
              <ClubModal
                club={selectedClub}
                onClose={handleCloseModal}
                setFollowedClubs={setFollowedClubs}
                followedClubs={followedClubs}
                initialFollowing={initialFollowedClubs.includes(selectedClub._id.toString())}
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
    </div>
  );
};

const skeletonBlockStyle = "h-4 bg-gray-300/30 rounded";

const SkeletonClubCard = () => (
  <div className="relative w-full max-w-2xl rounded-xl shadow-md animate-pulse flex flex-col justify-start border border-gray-300/30">
    <div className="flex flex-row gap-4 px-3 py-2 md:px-4 md:py-3">
      <div className="flex-1 min-w-0">
        <div className="h-5 bg-gray-300/40 rounded w-3/5 mb-2"></div>
        <div className={skeletonBlockStyle + "w-1/2 mb-2"}></div>
        <div className="space-y-2">
          <div className={skeletonBlockStyle + "w-full"}></div>
          <div className={skeletonBlockStyle + "w-4/5"}></div>
          <div className={skeletonBlockStyle + "w-3/5"}></div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] bg-gray-300/40 rounded-xl mb-2"></div>
        <div className="w-[60px] sm:w-[80.1px] h-4 sm:h-6 bg-gray-300/40 rounded"></div>
        <div className={skeletonBlockStyle + "w-[50px] mt-2"}></div>
      </div>
    </div>
    <div className="w-full py-2 px-3 md:px-4 bg-gray-200/30 rounded-b-xl">
      <div className="h-4 bg-gray-300/50 rounded w-3/5 mx-auto"></div>
    </div>
  </div>
);

export default Catalog;
