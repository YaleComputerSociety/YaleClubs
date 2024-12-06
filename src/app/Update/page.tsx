// NEED TO DO's
// 1. id and name attributes for the labels and inputs so chrome doesn't freak out
"use client";

import React, { useEffect, useState } from "react";
import { IClub, IClubInput, Category, Affiliation, ClubLeader, Intensity, School } from "@/lib/models/Club";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import EditableImageSection from "@/components/update/EditImage";
import ClubLeadersSection from "@/components/update/EditLeaders";
import CategoriesDropdown from "@/components/update/ClubCategories";
import AffiliationDropdown from "@/components/update/ClubAffiliation";
import IntensityDropdown from "@/components/update/IntensityDropdown";
import SchoolDropdown from "@/components/update/SchoolDropdown";
import Image from "next/image";

const UpdatePage = () => {
  const searchParams = useSearchParams();
  const [club, setClub] = useState<IClub | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<IClubInput>({
    name: "", // done
    subheader: "",
    description: "", // done
    categories: [], // maybe look at to change
    leaders: [], // done
    logo: "", // done
    backgroundImage: "", // done
    numMembers: 0, // done
    website: "", // done
    email: "", // done
    instagram: "", // done
    applyForm: "", // done
    mailingListForm: "", // done
    meeting: "", // done
    calendarLink: "", // done
    affiliations: [], // done
    intensity: Intensity.CASUAL,
    howToJoin: "",
    school: School.COLLEGE,
  });
  const [isLoading, setIsLoading] = useState(true);

  const validateInput = (field: keyof IClubInput, value: string): string => {
    switch (field) {
      case "name":
        if (!value) return "Name is required.";
        if (value.length < 3) return "Name must be at least 3 characters.";
        if (value.length > 100) return "Name must not exceed 100 characters.";
        return "";
      case "email":
        if (!value) return "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format.";
        if (value.length > 100) return "Email must not exceed 100 characters.";
        return "";
      case "website":
        if (!value) return "";
        if (!/^(https?:\/\/)?([\w.-]+\.)+[a-z]{2,6}(\/[\w.-]*)*\/?$/.test(value)) return "Invalid URL format.";
        if (value.length > 200) return "Website URL must not exceed 200 characters.";
        return "";
      case "numMembers":
        if (!value) return "";
        if (Number(value) < 0) return "Number of members cannot be negative.";
        if (Number(value) > 100000) return "Number of members must not exceed 100,000.";
        return "";
      case "instagram":
        if (!value) return "";
        if (!/^@[\w.]+$/.test(value)) return "Instagram handle must start with '@'.";
        if (value.length > 50) return "Instagram handle must not exceed 50 characters.";
        return "";
      case "subheader":
        if (value && value.length > 150) return "Subheader must not exceed 150 characters.";
        return "";
      case "description":
        if (value && value.length > 1000) return "Description must not exceed 1000 characters.";
        return "";
      case "applyForm":
        if (value && value.length > 200) return "Application form must not exceed 200 characters.";
        return "";
      case "mailingListForm":
        if (value && value.length > 200) return "Mailing list form must not exceed 200 characters.";
        return "";
      case "calendarLink":
        if (value && value.length > 200) return "Calendary link must not exceed 200 characters.";
        return "";
      case "meeting":
        if (value && value.length > 200) return `${field} must not exceed 200 characters.`;
        return "";
      case "howToJoin":
        if (value && value.length > 500) return "How to join must not exceed 500 characters.";
        return "";
      case "backgroundImage":
      case "logo":
        if (value && value.length > 300) return `${field} URL must not exceed 300 characters.`;
        return "";
      default:
        return "";
    }
  };

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const response = await fetch("/api/clubs");
        const allClubs: IClub[] = await response.json();

        const clubId = searchParams.get("clubId");
        if (clubId) {
          const specificClub = allClubs.find((club: IClub) => club._id === clubId);
          if (specificClub) {
            const clubInput: IClubInput = {
              name: specificClub.name || "",
              subheader: specificClub.subheader || "",
              description: specificClub.description || "",
              categories: specificClub.categories || [],
              leaders: specificClub.leaders || [],
              logo: specificClub.logo || "",
              backgroundImage: specificClub.backgroundImage || "",
              numMembers: specificClub.numMembers || 0,
              website: specificClub.website || "",
              email: specificClub.email || "",
              instagram: specificClub.instagram || "",
              applyForm: specificClub.applyForm || "",
              mailingListForm: specificClub.mailingListForm || "",
              meeting: specificClub.meeting || "",
              calendarLink: specificClub.calendarLink || "",
              affiliations: specificClub.affiliations || [],
              intensity: Intensity[specificClub.intensity as keyof typeof Intensity] || Intensity.CASUAL,
              howToJoin: specificClub.howToJoin || "",
              school: specificClub.school || School.COLLEGE,
            };
            setClub(specificClub);
            setFormData(clubInput);
          }
        }
      } catch (error) {
        console.error("Error fetching club data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubData();
  }, [searchParams]);

  const handleChange = (
    field: keyof IClubInput,
    value: string | number | ClubLeader[] | Affiliation[] | undefined | Category[] | School | Intensity,
  ) => {
    const error = validateInput(field as keyof IClubInput, value !== undefined ? String(value) : "");
    setValidationErrors((prev) => ({ ...prev, [field]: error }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const errors = Object.keys(formData).reduce(
      (acc, field) => {
        const value = formData[field as keyof IClubInput];
        const error = validateInput(field as keyof IClubInput, value !== undefined ? String(value) : "");
        if (error) acc[field] = error;
        return acc;
      },
      {} as Record<string, string>,
    );

    setValidationErrors(errors);

    if (Object.values(errors).some((error) => error)) {
      console.error("Form has validation errors:", errors);
      return;
    }

    console.log("Club Data:", formData);
  };

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen h-screen">
        <Header />
        <main className="flex-grow bg-gray-100 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-xl font-semibold text-gray-700">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex flex-col min-h-screen h-screen">
        <Header />
        <main className="flex-grow bg-gray-100 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Link href="/" className="text-xl font-semibold text-blue-600 hover:text-blue-500">
              <p>Having trouble finding the club</p>
              <p>Go back to the home page.</p>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header />
      <main className="flex-grow flex py-6 justify-center mt-12">
        <div className="bg-gray-100 rounded-lg shadow-md p-2 w-full max-w-6xl h-full">
          <div className="flex items-center justify-between px-2 mb-4">
            <button className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500">
              <Link href={`/`}>Back</Link>
            </button>
            <div className="flex items-center space-x-4 justify-center flex-grow">
              <h1 className="text-3xl font-bold text-center">{formData.name}</h1>
              <button onClick={() => toggleModal()} className="bg-white p-2 rounded-full shadow hover:shadow-md">
                <Image src="/assets/edit-3-svgrepo-com.svg" alt="Edit Icon" width={16} height={16} />
              </button>
            </div>
            <div className="w-16"></div>
          </div>

          <EditableImageSection formData={formData} handleChange={handleChange} />
          <div className="grid grid-cols-3 gap-4 py-8">
            {/* Left Section */}
            <div className="space-y-2">
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subheader
                    <input
                      type="text"
                      value={formData.subheader}
                      onChange={(e) => handleChange("subheader", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      placeholder="Subheader"
                    />
                  </label>
                  {validationErrors.subheader && <p className="text-red-500">{validationErrors.subheader}</p>}
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 h-60 resize-none"
                  ></textarea>
                </label>
                {validationErrors.description && <p className="text-red-500">{validationErrors.description}</p>}
              </div>
              <div className="space-y-0">
                <CategoriesDropdown
                  selectedCategories={formData.categories || []}
                  additionalCategories={formData.categories || []}
                  handleChange={handleChange}
                />
              </div>
              <div className="space-y-0">
                <AffiliationDropdown selectedAffiliation={formData.affiliations || []} handleChange={handleChange} />
              </div>
            </div>

            {/* Center Section */}
            <div className="space-y-2">
              <ClubLeadersSection leaders={formData.leaders || []} handleChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Membership
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.numMembers || ""}
                    onChange={(e) => handleChange("numMembers", parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="Enter number of members"
                  />
                </label>
                {validationErrors.numMembers && <p className="text-red-500">{validationErrors.numMembers}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Form
                  <input
                    type="text"
                    value={formData.applyForm}
                    onChange={(e) => handleChange("applyForm", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="Link to application form"
                  />
                </label>
                {validationErrors.applyForm && <p className="text-red-500">{validationErrors.applyForm}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mailing List Form
                  <input
                    type="text"
                    value={formData.mailingListForm}
                    onChange={(e) => handleChange("mailingListForm", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="Link to mailing list form"
                  />
                </label>
                {validationErrors.mailingListForm && <p className="text-red-500">{validationErrors.mailingListForm}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How to join
                  <input
                    type="text"
                    value={formData.howToJoin}
                    onChange={(e) => handleChange("howToJoin", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="How to join"
                  />
                </label>
                {validationErrors.howToJoin && <p className="text-red-500">{validationErrors.howToJoin}</p>}
              </div>
            </div>

            {/* Right Section */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => handleChange("instagram", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="@username"
                  />
                </label>
                {validationErrors.instagram && <p className="text-red-500">{validationErrors.instagram}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="email@domain.com"
                  />
                </label>
                {validationErrors.email && <p className="text-red-500">{validationErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="website.com"
                  />
                </label>
                {validationErrors.website && <p className="text-red-500">{validationErrors.website}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calendar Link
                  <input
                    type="url"
                    value={formData.calendarLink}
                    onChange={(e) => handleChange("calendarLink", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="calendarlink.com"
                  />
                </label>
                {validationErrors.calendarLink && <p className="text-red-500">{validationErrors.calendarLink}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting
                  <input
                    type="text"
                    value={formData.meeting}
                    onChange={(e) => handleChange("meeting", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="Tuesdays from 4:00-6:00 PM on Cross Campus"
                  />
                </label>
                {validationErrors.meeting && <p className="text-red-500">{validationErrors.meeting}</p>}
              </div>
              <IntensityDropdown selectedIntensity={formData.intensity as Intensity} handleChange={handleChange} />
              <SchoolDropdown selectedSchool={formData.school as School} handleChange={handleChange} />
            </div>
          </div>

          {/* Save Button */}
          <div className="mb-4 flex justify-end">
            <div className="px-2">
              <button onClick={handleSave} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                Submit
              </button>
            </div>
          </div>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-semibold mb-4">Edit Club Name</h2>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                />
                {validationErrors.name && <p className="text-red-500">{validationErrors.name}</p>}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={toggleModal}
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleSave();
                      toggleModal();
                    }}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UpdatePage;
