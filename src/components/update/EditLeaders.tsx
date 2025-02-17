import React, { useState } from "react";
import { IClubInput } from "@/lib/models/Club";
import Image from "next/image";

interface ClubLeader {
  email: string;
  name: string;
  year?: number;
  role?: string;
  netId?: string;
  profilePicture?: string;
}

const ClubLeadersSection: React.FC<{
  leaders: ClubLeader[];
  handleChange: (field: keyof IClubInput, value: ClubLeader[] | undefined) => void;
}> = ({ leaders, handleChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentLeader, setCurrentLeader] = useState<ClubLeader>({
    email: "",
    name: "",
    year: 0,
    role: "",
    netId: "",
    profilePicture: "",
  });

  const openModal = (leader?: ClubLeader, index?: number) => {
    if (leader && typeof index === "number") {
      setCurrentLeader(leader);
      setSelectedIndex(index);
      setIsEditing(true);
    } else {
      setCurrentLeader({
        email: "",
        name: "",
        year: 0,
        role: "",
        netId: "",
        profilePicture: "",
      });
      setIsEditing(false);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentLeader({
      email: "",
      name: "",
      year: 0,
      role: "",
      netId: "",
      profilePicture: "",
    });
    setSelectedIndex(null);
    setIsEditing(false);
    setError(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (!currentLeader.email) {
      setError("Email is mandatory");
      return;
    }
    if (!currentLeader.name) {
      setError("Name is mandatory");
      return;
    }
    const updatedLeaders = [...leaders];
    if (isEditing && typeof selectedIndex === "number") {
      updatedLeaders[selectedIndex] = currentLeader;
    } else {
      updatedLeaders.push(currentLeader);
    }
    handleChange("leaders", updatedLeaders);
    closeModal();
  };

  const handleDelete = (index: number) => {
    const updatedLeaders = leaders.filter((_, i) => i !== index);
    handleChange("leaders", updatedLeaders);
  };

  const moveLeader = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= leaders.length) return;
    const updatedLeaders = [...leaders];
    const [movedLeader] = updatedLeaders.splice(fromIndex, 1);
    updatedLeaders.splice(toIndex, 0, movedLeader);
    handleChange("leaders", updatedLeaders);
  };

  interface IconButtonProps {
    onClick: () => void;
    icon: string;
    alt: string;
    rotate?: boolean;
    className?: string;
  }

  const IconButton: React.FC<IconButtonProps> = ({ onClick, icon, alt, rotate = false, className = "" }) => (
    <button
      onClick={onClick}
      className={`p-1 rounded-lg hover:bg-gray-300 flex-shrink-0 ${className}`}
      aria-label={alt}
    >
      <Image src={icon} alt={alt} width={24} height={24} className={`w-4 h-4 ${rotate ? "rotate-180" : ""}`} />
    </button>
  );

  return (
    <div>
      <p className="block text-sm font-medium text-gray-700 mb-2">Board Members</p>
      <div className="mb-2 flex flex-col gap-2">
        {leaders.map((leader, index) => (
          <li
            key={index}
            className="flex flex-wrap items-center justify-between p-2 rounded-lg border bg-white w-full overflow-hidden"
          >
            <div className="flex flex-col flex-[2] min-w-0 truncate">
              <div className="font-medium">{leader.name || "Unnamed Board Member"}</div>
              {leader.role && <div className="text-sm text-gray-600">{leader.role}</div>}
              {leader.email && <div className="text-sm text-gray-600">{leader.email}</div>}
            </div>

            <div className="ml-auto flex space-x-1 flex-shrink-0 mix-w-[120px] justify-end overflow-hidden flex-1">
              {index > 0 && (
                <IconButton
                  onClick={() => moveLeader(index, index - 1)}
                  icon="/assets/up-arrow-svgrepo-com.svg"
                  alt="Move Up"
                />
              )}
              {index < leaders.length - 1 && (
                <IconButton
                  onClick={() => moveLeader(index, index + 1)}
                  icon="/assets/up-arrow-svgrepo-com.svg"
                  alt="Move Down"
                  rotate
                />
              )}
              <IconButton
                onClick={() => openModal(leader, index)}
                icon="/assets/edit-3-svgrepo-com.svg"
                alt="Edit"
                className="bg-gray-300 hover:bg-gray-400"
              />
              <IconButton
                onClick={() => handleDelete(index)}
                icon="/assets/cross-svgrepo-com (1).svg"
                alt="Delete"
                className="bg-red-500 hover:bg-red-600"
              />
            </div>
          </li>
        ))}
      </div>
      <button onClick={() => openModal()} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
        Add Board Member
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="bg-white rounded-lg p-6 shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{isEditing ? "Edit Leader" : "Add New Leader"}</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Name
                <input
                  type="text"
                  value={currentLeader.name}
                  onChange={(e) => setCurrentLeader({ ...currentLeader, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Peter Salovey"
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Email
                <input
                  type="email"
                  value={currentLeader.email}
                  onChange={(e) => setCurrentLeader({ ...currentLeader, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="peter.salovey@yale.edu"
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Role
                <input
                  type="text"
                  value={currentLeader.role}
                  onChange={(e) => setCurrentLeader({ ...currentLeader, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="President"
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Year
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={currentLeader.year || ""}
                  onChange={(e) => setCurrentLeader({ ...currentLeader, year: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="2027"
                />
              </label>
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={closeModal} className="py-2 px-4 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={handleSave} className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                {isEditing ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubLeadersSection;
