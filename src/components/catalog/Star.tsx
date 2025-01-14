import React, { Dispatch, SetStateAction } from "react";

type FollowButtonProps = {
  isLoggedIn: boolean;
  isFollowing: boolean;
  netid: string;
  clubId: string;
  followedClubs: string[];
  setFollowedClubs: Dispatch<SetStateAction<string[]>>;
  setFollowingChanged: Dispatch<SetStateAction<boolean>>;
};

const FollowButton: React.FC<FollowButtonProps> = ({
  isLoggedIn,
  isFollowing,
  netid,
  clubId,
  followedClubs,
  setFollowedClubs,
  setFollowingChanged,
}) => {
  const toggleStar = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      alert("Please log in to follow this club.");
      return;
    }

    try {
      const updatedClubs = isFollowing
        ? followedClubs.filter((id: string) => id !== clubId)
        : [...followedClubs, clubId];
      setFollowedClubs(updatedClubs);
      setFollowingChanged(!isFollowing);

      await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ netid, clubId, isFollowing: !isFollowing }),
      });
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  return (
    <button
      onClick={toggleStar}
      className={`text-2xl focus:outline-none ${isFollowing ? "text-yellow-500" : "text-gray-400"}`}
    >
      {isFollowing ? "⭐" : "☆"}
    </button>
  );
};

export default FollowButton;
