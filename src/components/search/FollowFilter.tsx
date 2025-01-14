import React from "react";

type FollowFilterProps = {
  showFollowedOnly: boolean;
  setShowFollowedOnly: React.Dispatch<React.SetStateAction<boolean>>;
};

const FollowFilter: React.FC<FollowFilterProps> = ({ showFollowedOnly, setShowFollowedOnly }) => {
  return (
    <label className="flex items-center text-gray-600 space-x-2">
      <span>Followed</span>
      <input
        type="checkbox"
        checked={showFollowedOnly}
        onChange={(e) => setShowFollowedOnly(e.target.checked)}
        className="w-6 h-6  focus:from-indigo-500 to-blue-500 border-gray-300 rounded"
      />
    </label>
  );
};

export default FollowFilter;