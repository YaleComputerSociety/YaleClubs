import React, { useEffect, useState } from "react";
import ClubCard from "./ClubCard";
import ClubModal from "./ClubModal";
import { IClub } from "@/lib/models/Club";
import axios from "axios";

interface CatalogProps {
  clubs: IClub[];
  isLoading: boolean;
}

const Catalog = ({ clubs, isLoading }: CatalogProps) => {
  const [selectedClub, setSelectedClub] = useState<IClub | null>(null);
  const [followedClubs, setFollowedClubs] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get<{ followedClubs: string[] }>("/users");
        setFollowedClubs(response.data.followedClubs);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, []);

  const handleCloseModal = () => setSelectedClub(null);

  const renderClubItem = (club: IClub) => (
    <ClubCard
      key={club._id}
      club={club}
      setFollowedClubs={setFollowedClubs}
      followedClubs={followedClubs}
      onClick={() => setSelectedClub(club)}
    />
  );
  renderClubItem.displayName = "RenderClubItem";

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
            {clubs.map(renderClubItem)}
            {selectedClub && <ClubModal club={selectedClub} onClose={handleCloseModal} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
