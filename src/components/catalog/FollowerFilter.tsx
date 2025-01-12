import React, { useEffect, useState } from "react";
import { IClub } from "@/lib/models/Club";

interface FollowFilterButtonProps {
  allGroups: IClub[];
  setFilteredGroups: React.Dispatch<React.SetStateAction<IClub[]>>;
  followedClubs: string[];
}

const FollowFilterButton: React.FC<FollowFilterButtonProps> = ({ allGroups, setFilteredGroups, followedClubs }) => {
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);

  useEffect(() => {
    if (showFollowedOnly) {
      // Filter to show only followed clubs
      const filtered = allGroups.filter((club) => followedClubs.includes(club._id));
      setFilteredGroups(filtered);
    } else {
      // Show all clubs if the filter is inactive
      setFilteredGroups(allGroups);
    }
  }, [showFollowedOnly, allGroups, followedClubs, setFilteredGroups]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowFollowedOnly((prev) => !prev)}
        className={`px-4 py-2 border rounded ${
          showFollowedOnly ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        {showFollowedOnly ? "Showing Followed Clubs" : "Show Followed Only"}
      </button>
    </div>
  );
};

export default FollowFilterButton;
