import React, { useEffect, useState } from "react";
import ClubCard from "./ClubCard";
import ClubModal from "./ClubModal";
import { IClub } from "@/lib/models/Club";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface CatalogProps {
  clubs: IClub[];
  isLoading: boolean;
}

const Catalog = ({ clubs, isLoading }: CatalogProps) => {
  const [selectedClub, setSelectedClub] = useState<IClub | null>(null);
  const [followedClubs, setFollowedClubs] = useState<string[]>([]);

  const token = Cookies.get("token");
  let netid = "";

  if (token) {
    try {
      netid = jwtDecode<{ netid: string }>(token).netid;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // get /users&netid
        const response = await axios.get("/api/users", {
          params: { netid: netid },
        });

        setFollowedClubs(response.data.user.followedClubs);
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
            {selectedClub && (
              <ClubModal
                club={selectedClub}
                onClose={handleCloseModal}
                setFollowedClubs={setFollowedClubs}
                followedClubs={followedClubs}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
