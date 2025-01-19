import { ClubLeader, IClubInput } from "@/lib/models/Club";
import React, { useState } from "react";
import Image from "next/image";

interface EditableImageSectionProps {
  formData: IClubInput;
  handleChange: (field: keyof IClubInput, value: string | number | ClubLeader[] | undefined) => void;
  validationErrors: Record<keyof IClubInput, string>;
}

const EditableImageSection: React.FC<EditableImageSectionProps> = ({ formData, handleChange, validationErrors }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState<"backgroundImage" | "logo">("backgroundImage");
  const [inputValue, setInputValue] = useState("");
  const [modalError, setModalError] = useState("");

  // Simple URL validator
  const isValidUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const openModal = (field: "backgroundImage" | "logo") => {
    setCurrentField(field);
    // Load current value into the text field
    setInputValue(formData[field] as string);
    // Clear any previous error
    setModalError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError("");
  };

  const handleSave = () => {
    // 1) Check length
    if (inputValue && inputValue.length > 600) {
      setModalError("URL must not exceed 600 characters.");
      return;
    }
    // 2) Check format
    if (inputValue && !isValidUrl(inputValue)) {
      setModalError("Invalid URL format.");
      return;
    }

    // If no errors, save and close
    handleChange(currentField, inputValue);
    closeModal();
  };

  return (
    <div className="relative">
      {/* Background Image */}
      <div className="relative h-64 w-full rounded-lg overflow-hidden flex items-center flex-col">
        <div className="w-[920px] h-[252px] relative flex items-center">
          <Image
            src={formData.backgroundImage || "/assets/default-background.png"}
            alt="Background"
            className="object-cover"
            width={1920}
            height={1080}
          />
          <button
            onClick={() => openModal("backgroundImage")}
            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:shadow-md"
          >
            <Image src="/assets/edit-3-svgrepo-com.svg" alt="Edit Icon" width={24} height={24} />
          </button>
        </div>
      </div>
      {validationErrors?.backgroundImage && <p className="text-red-500 mt-2">{validationErrors.backgroundImage}</p>}

      {/* Logo */}
      <div className="absolute -bottom-6 right-16">
        <div className="relative w-48 h-48 rounded-lg shadow-lg bg-white flex items-center justify-center">
          <Image
            src={formData.logo || "/assets/default-logo.png"}
            alt="Logo"
            className="object-cover rounded-lg"
            width={240}
            height={240}
            priority
          />
        </div>
        <button
          onClick={() => openModal("logo")}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:shadow-md flex flex-col justify-center"
        >
          <Image src="/assets/edit-3-svgrepo-com.svg" alt="Edit Icon" width={24} height={24} />
        </button>
      </div>
      {validationErrors?.logo && <p className="text-red-500 mt-2 text-right pr-16">{validationErrors.logo}</p>}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              Edit {currentField === "backgroundImage" ? "Background Image" : "Logo"}
            </h2>
            <p>Please input a publicly-accessible URL.</p>
            <p className="mb-4 text-sm text-gray-500">Try uploading your image to imgur.com or postimages.org.</p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setModalError(""); // Clear error while typing
              }}
              className="w-full border border-gray-300 rounded-lg p-2 mb-2"
              placeholder="Enter image URL"
            />

            {/* Display any modal-specific error */}
            {modalError && <p className="text-red-500 mb-2">{modalError}</p>}

            <div className="flex justify-end space-x-4 mt-4">
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
