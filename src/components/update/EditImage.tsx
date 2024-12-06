import { ClubLeader, IClubInput } from "@/lib/models/Club";
import React, { useState } from "react";
import Image from "next/image";

interface EditableImageSectionProps {
  formData: IClubInput;
  handleChange: (field: keyof IClubInput, value: string | number | ClubLeader[] | undefined) => void;
}

const EditableImageSection: React.FC<EditableImageSectionProps> = ({ formData, handleChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const isMobile = window.innerWidth <= 768;
  const [currentField, setCurrentField] = useState<"backgroundImage" | "logo">("backgroundImage");
  const [inputValue, setInputValue] = useState("");

  const openModal = (field: "backgroundImage" | "logo") => {
    setCurrentField(field);
    setInputValue(formData[field] as string);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    handleChange(currentField, inputValue);
    closeModal();
  };

  return (
    <div className="relative">
      {/* Background Image */}
      <div className="relative h-64 w-full rounded-lg overflow-hidden">
        {formData.backgroundImage ? (
          <Image
            src={formData.backgroundImage}
            alt="Background"
            className="w-full h-full object-cover"
            width={1920} // Use appropriate resolution
            height={1080}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 via-blue-500 to-white-500"></div>
        )}
        <button
          onClick={() => openModal("backgroundImage")}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:shadow-md"
        >
          <Image src="/assets/edit-3-svgrepo-com.svg" alt="Edit Icon" width={24} height={24} />
        </button>
      </div>

      {/* Logo */}
      <div className="absolute -bottom-4 right-8">
        <div className="relative w-48 h-48 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white flex items-center justify-center">
          <Image
            src={formData.logo || "/assets/default-logo.png"}
            alt="Logo"
            className="object-cover rounded-lg"
            width={120}
            height={120}
            priority
          />
        </div>
        <button
          onClick={() => openModal("logo")}
          className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow hover:shadow-md"
        >
          <Image src="/assets/edit-3-svgrepo-com.svg" alt="Edit Icon" width={24} height={24} />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              Edit {currentField === "backgroundImage" ? "Background Image" : "Logo"}
            </h2>
            <p>Please input a publicly-accessible URL.</p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              placeholder="Enter image URL"
            />
            <div className="flex justify-end space-x-4">
              <button onClick={closeModal} className="py-2 px-4 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={handleSave} className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableImageSection;
