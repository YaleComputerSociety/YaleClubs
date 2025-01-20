import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

type FollowButtonProps = {
  isFollowing: boolean;
  clubId: string;
  followedClubs: string[];
  setFollowedClubs: Dispatch<SetStateAction<string[]>>;
};

const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  clubId,
  followedClubs,
  setFollowedClubs,
}) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = Cookies.get("token");
    if (t) {
      try {
        jwtDecode<{ netid: string }>(t);
        setToken(t);
      } catch (err) {
        console.error("Invalid token:", err);
        setToken(null);
      }
    }
  }, []);

  const toggleStar = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!token) {
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
          Authorization: "Bearer " + token,
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
      className={`mr-1 py-1 rounded-lg text-md font-semibold focus:outline-none text-blue-400 transition-transform duration-200 hover:scale-110 ${isFollowing ? "text-sm md:text-base" : ""}`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;
