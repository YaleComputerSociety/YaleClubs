import React, { Dispatch, SetStateAction } from "react";
import { useAuth } from "@/contexts/AuthContext";

type FollowButtonProps = {
  isFollowing: boolean;
  clubId: string;
  followedClubs: string[];
  setFollowedClubs: Dispatch<SetStateAction<string[]>>;
  className?: string;
};

const FollowButton: React.FC<FollowButtonProps> = ({
  className,
  isFollowing,
  clubId,
  followedClubs,
  setFollowedClubs,
}) => {
  const { isLoggedIn } = useAuth();

  const toggleStar = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      alert("Log in to follow clubs.");
      return;
    }

    try {
      const updatedClubs = isFollowing
        ? followedClubs.filter((id: string) => id !== clubId)
        : [...followedClubs, clubId];
      setFollowedClubs(updatedClubs);

      await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clubId, isFollowing: !isFollowing }),
      });
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  return (
    <button
      onClick={toggleStar}
      className={`${className} py-1 rounded-lg text-md focus:outline-none transition-transform duration-200 hover:scale-105 ${isFollowing ? "bg-[#eee] text-black font-normal" : "text-white bg-clubPurple font-semibold"}`}
    >
      {isFollowing ? "Following" : "+ Follow"}
    </button>
  );
};

export default FollowButton;
