import React, { useState } from "react";

type FollowButtonProps = {
  isLoggedIn: boolean; // Prop to check if the user is logged in
};

const FollowButton: React.FC<FollowButtonProps> = ({ isLoggedIn }) => {
  const [isStarred, setIsStarred] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const toggleStar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent parent click events

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    setIsStarred((prev) => !prev);
  };

  const closeLoginPrompt = () => setShowLoginPrompt(false);

  return (
    <div>
      <button
        onClick={toggleStar}
        className={`text-2xl focus:outline-none ${isStarred ? "text-yellow-500" : "text-gray-400"}`}
      >
        {isStarred ? "⭐" : "☆"}
      </button>

      {showLoginPrompt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeLoginPrompt} 
        >
          <div className="bg-white rounded-lg p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <p className="mt-2 text-gray-600">Please log in to follow a club.</p>
            <button
              onClick={closeLoginPrompt}
              className="mt-4 px-4 py-2 text-white bg-indigo-600 rounded shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowButton;
