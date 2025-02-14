import React, { useState } from "react";

const dummyFollowers = [
  { id: 1, name: "Alice Johnson", clubs: ["Drama Club", "Tech Society"], events: ["Hackathon", "Open Mic Night"] },
  { id: 2, name: "Bob Smith", clubs: ["Photography Club"], events: ["Art Expo", "Music Fest"] },
];

const FollowersList = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold">Followers</h3>
      <div className="flex flex-wrap gap-2 mt-2">
        {dummyFollowers.map((user) => (
          <button key={user.id} onClick={() => setSelectedUser(user)} className="text-blue-500 hover:underline">
            {user.name}
          </button>
        ))}
      </div>

      {selectedUser && <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
};

interface User {
  id: number;
  name: string;
  clubs: string[];
  events: string[];
}

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-sm">
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="mt-2">Clubs: {user.clubs.join(", ")}</p>
        <p className="mt-1">Events: {user.events.join(", ")}</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default FollowersList;
