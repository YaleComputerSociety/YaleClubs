import React from "react";

type FollowFilterProps = {
  showFollowedOnly: boolean;
  setShowFollowedOnly: React.Dispatch<React.SetStateAction<boolean>>;
};

const FollowFilter: React.FC<FollowFilterProps> = ({ showFollowedOnly, setShowFollowedOnly }) => {
  return (
    <button
      onClick={() => setShowFollowedOnly((prev) => !prev)}
      className={`p-2 rounded ${
        showFollowedOnly
          ? "bg-blue-100 text-blue-500 hover:text-gray-500 hover:bg-gray-200"
          : "bg-gray-200 text-gray-600 hover:text-blue-400 hover:bg-blue-100"
      } transition-colors duration-200`}
    >
      Following
    </button>
  );
};

export default FollowFilter;
