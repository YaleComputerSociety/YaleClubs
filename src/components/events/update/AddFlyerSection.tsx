import { IEventInput, Tag } from "@/lib/models/Event";
import React, { useState } from "react";
import Image from "next/image";

interface EditableImageSectionProps {
  formData: IEventInput;
  handleChange: (field: keyof IEventInput, value: string | Tag[] | undefined) => void;
}

const AddFlyerSection: React.FC<EditableImageSectionProps> = ({ formData, handleChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState<"flyer">("flyer");
  const [inputValue, setInputValue] = useState("");

  const openModal = (field: "flyer") => {
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
      {/* Logo */}
      <div className="relative w-48 h-48 rounded-lg shadow-lg">
        <Image
          src={formData.flyer || "/assets/default-logo.png"}
          alt="Flyer"
          className="object-cover rounded-lg"
          width={240}
          height={240}
          priority
        />
        <button
          onClick={() => openModal("flyer")}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:shadow-md flex flex-col justify-center"
          style={{ top: "0", right: "0" }}
        >
          <Image src="/assets/edit-3-svgrepo-com.svg" alt="Edit Icon" width={24} height={24} />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Upload a Flyer For Your Event</h2>
            <p>Please input a publicly-accessible URL.</p>
            <p className="mb-4 text-sm text-gray-500">Try uploading your image to imgur.com or postimages.org.</p>
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

export default AddFlyerSection;
