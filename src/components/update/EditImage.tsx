import { IClubInput } from "@/lib/models/Club";
import React, { useState, useRef, useMemo } from "react";
import Cropper from "react-easy-crop";
import Image from "next/image";

interface EditableImageSectionProps {
  formData: IClubInput;
  handleChange: (field: "logoFile" | "backgroundImageFile", value: File) => void;
  validationErrors: Record<keyof IClubInput, string>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const EditableImageSection: React.FC<EditableImageSectionProps> = ({ formData, handleChange, validationErrors }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState<"backgroundImageFile" | "logoFile">("logoFile");
  const [inputValue, setInputValue] = useState<File | string | undefined>(undefined);
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

  const blobUrl = useMemo(() => {
    if (inputValue instanceof File) {
      return URL.createObjectURL(inputValue);
    }
    return inputValue; // Use URL directly if it's already a string
  }, [inputValue]);

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
      setInputValue(file);
    } catch (error) {
      setModalError((error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const openModal = (field: "backgroundImage" | "logo") => {
    const fileField = field === "backgroundImage" ? "backgroundImageFile" : "logoFile";
    if (formData[fileField] !== undefined) {
      setCurrentField(fileField);
      setInputValue(formData[fileField]);
    } else {
      setCurrentField(fileField);
      setInputValue(formData[field] as string);
    }
    setModalError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError("");
    setInputValue(undefined);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleSave = async () => {
    if (inputValue && typeof inputValue === "string" && !inputValue.startsWith("data:") && !isValidUrl(inputValue)) {
      setModalError("Invalid URL format.");
      return;
    }

    try {
      const croppedImage = await cropImage(inputValue as File | string);
      handleChange(currentField, croppedImage);
      closeModal();
    } catch (error) {
      console.error("Error cropping image:", error);
      setModalError("Failed to process. Try uploading a new image.");
    }
  };

  const onCropComplete = (_: any, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const cropImage = async (input: File | string): Promise<File> => {
    const image = await createImage(input);
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

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Canvas toBlob failed"));
        resolve(new File([blob], "cropped-image.png", { type: "image/png" }));
      }, "image/png");
    });
  };

  const createImage = async (input: string | File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));

      if (typeof input === "string") {
        img.src = input;
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            img.src = reader.result;
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () => reject(new Error("FileReader error"));
        reader.readAsDataURL(input);
      }
    });
  };

  return (
    <div className="relative">
      <div className="relative w-full overflow-hidden flex items-center flex-col border-4">
        <div className="w-[768px] h-[242px] relative flex items-center">
          <Image
            src={
              formData.backgroundImageFile
                ? URL.createObjectURL(formData.backgroundImageFile)
                : formData.backgroundImage || "/assets/default-background.png"
            }
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
        <div className="relative w-48 h-48 rounded-3xl border-4 flex items-center justify-center">
          <Image
            src={
              formData.logoFile ? URL.createObjectURL(formData.logoFile) : formData.logo || "/assets/default-logo.png"
            }
            alt="Logo"
            className="object-cover rounded-3xl"
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
          <div className="bg-white p-4 rounded-xl w-xl flex flex-col gap-4">
            <h2 className="text-3xl font-semibold">
              Edit {currentField === "backgroundImageFile" ? "Background Image" : "Logo"}
            </h2>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />

            {modalError && <p className="text-red-500 mb-2">{modalError}</p>}

            {inputValue && (
              <div>
                <div className="relative w-full h-[300px] overflow-hidden">
                  {blobUrl !== undefined && (
                    <Cropper
                      image={blobUrl}
                      crop={crop}
                      zoom={zoom}
                      aspect={currentField === "backgroundImageFile" ? 768 / 240 : 30 / 30}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  )}
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
