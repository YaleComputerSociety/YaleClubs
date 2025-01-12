import React, { useState, useEffect } from "react";

type FollowButtonProps = {
  isLoggedIn: boolean;
  clubId: string;
  netid: string;
  onFollowersUpdate?: (newFollowers: number) => void; 
};

const FollowButton: React.FC<FollowButtonProps> = ({ isLoggedIn, clubId, netid, onFollowersUpdate }) => {
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchFollowStatus = async () => {
      try {
        const response = await fetch(`/api/follow?netid=${netid}&clubId=${clubId}`);
        const data = await response.json();
        setIsStarred(data.isFollowing);
      } catch (error) {
        console.error("Error fetching follow status:", error);
      }
    };

    fetchFollowStatus();
  }, [isLoggedIn, netid, clubId]);

  const toggleStar = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      alert("Please log in to follow this club.");
      return;
    }

    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ netid, clubId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsStarred(data.isFollowing);
        if (onFollowersUpdate) {
          onFollowersUpdate(data.followers); 
        }
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  return (
    <button
      onClick={toggleStar}
      className={`text-2xl focus:outline-none ${isStarred ? "text-yellow-500" : "text-gray-400"}`}
    >
      {isStarred ? "⭐" : "☆"}
    </button>
  );
};

export default FollowButton;
