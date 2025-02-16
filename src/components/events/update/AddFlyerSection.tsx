import React, { useState } from "react";
import Cropper from "react-easy-crop";
import Image from "next/image";
import { IEventInput, Tag } from "@/lib/models/Event";
import { MAX_IMAGE_HEIGHT, MAX_IMAGE_WIDTH } from "../constants";

interface EditableImageSectionProps {
  formData: IEventInput;
  handleChange: (field: keyof IEventInput, value: string | Tag[] | undefined) => void;
}

const AddFlyerSection: React.FC<EditableImageSectionProps> = ({ formData, handleChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  const openModal = () => {
    setInputValue(formData.flyer || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorMessage(""); // Clear error message
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

  const handleSave = async () => {
    try {
      const croppedImage = await cropImage();
      handleChange("flyer", croppedImage);
      closeModal();
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = url;
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  return (
    <div className="relative">
      <div className="relative w-48 h-48 rounded-lg shadow-lg">
        <Image
          src={formData.flyer || "/assets/default-background.png"}
          alt="Flyer"
          className="object-cover rounded-lg"
          fill
          priority
        />
        <button
          onClick={openModal}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:shadow-md flex flex-col justify-center"
        >
          <Image src="/assets/edit-3-svgrepo-com.svg" alt="Edit Icon" width={24} height={24} />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-h-[90vh] relative overflow-hidden">
            <h2 className="text-lg font-semibold mb-4">Upload or Crop Your Flyer</h2>
            <p>Please input a publicly-accessible URL.</p>
            <p className="mb-4 text-sm text-gray-500">
              Try uploading your image to imgur.com or postimages.org. Learn how to get a link from Imgur{" "}
              <a
                className={"font-bold underline text-violet-500"}
                href={"/assets/How to Upload Images.pdf"}
                target="_blank"
                rel="noopener noreferrer"
              >
                here.
              </a>
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-2"
              placeholder="Enter image URL"
            />

            {errorMessage && <p className="text-red-500 text-sm mb-2">{errorMessage}</p>}

            {inputValue && (
              <div>
                <div className="relative w-full h-[300px] overflow-hidden">
                  <Cropper
                    image={inputValue}
                    crop={crop}
                    zoom={zoom}
                    aspect={MAX_IMAGE_WIDTH / MAX_IMAGE_HEIGHT}
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

            <div className="flex justify-end mt-4 space-x-4">
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
