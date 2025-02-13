import { ClubLeader, IClubInput } from "@/lib/models/Club";
import React, { useState, useRef } from "react";
import Cropper from "react-easy-crop";
import Image from "next/image";

interface EditableImageSectionProps {
  formData: IClubInput;
  handleChange: (field: keyof IClubInput, value: string | number | ClubLeader[] | undefined) => void;
  validationErrors: Record<keyof IClubInput, string>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const EditableImageSection: React.FC<EditableImageSectionProps> = ({ formData, handleChange, validationErrors }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState<"backgroundImage" | "logo">("backgroundImage");
  const [inputValue, setInputValue] = useState("");
  const [modalError, setModalError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const isValidUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setModalError(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setModalError("Please upload an image file");
      return;
    }

    setIsUploading(true);
    setModalError("");

    try {
      const localUrl = await readFileAsDataURL(file);
      setInputValue(localUrl);
    } catch (error) {
      setModalError((error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const openModal = (field: "backgroundImage" | "logo") => {
    setCurrentField(field);
    setInputValue(formData[field] as string);
    setModalError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError("");
    setInputValue("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleSave = async () => {
    if (inputValue && !inputValue.startsWith("data:") && !isValidUrl(inputValue)) {
      setModalError("Invalid URL format.");
      return;
    }

    try {
      const croppedImage = await cropImage();
      handleChange(currentField, croppedImage);
      closeModal();
    } catch (error) {
      console.error("Error cropping image:", error);
      setModalError("Failed to process image.");
    }
  };

  const onCropComplete = (_: any, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const cropImage = async (): Promise<string> => {
    const image = await createImage(inputValue);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Failed to create canvas context");

    const { width, height }: any = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;

    if (croppedAreaPixels) {
      const { x, y, width, height } = croppedAreaPixels;
      ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    }

    return canvas.toDataURL("image/jpeg");
  };

  const createImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = url;
      if (!url.startsWith("data:")) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  return (
    <div className="relative">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              Edit {currentField === "backgroundImage" ? "Background Image" : "Logo"}
            </h2>

            <div className="mb-4">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-2"
                disabled={isUploading}
              >
                {isUploading ? "Processing..." : "Upload Image"}
              </button>
              <div className="text-sm text-gray-500">or</div>
            </div>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setModalError("");
              }}
              className="w-full border border-gray-300 rounded-lg p-2 mb-2"
              placeholder="Enter image URL"
            />

            {modalError && <p className="text-red-500 mb-2">{modalError}</p>}

            {inputValue && (
              <div>
                <div className="relative w-full h-[300px] overflow-hidden">
                  <Cropper
                    image={inputValue}
                    crop={crop}
                    zoom={zoom}
                    aspect={30 / 30}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className="flex items-center mt-4">
                  <label htmlFor="zoom-slider" className="mr-4 text-sm font-medium text-gray-700">
                    Zoom:
                  </label>
                  <input
                    id="zoom-slider"
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-4">
              <button onClick={closeModal} className="py-2 px-4 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={!inputValue || isUploading}
              >
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
