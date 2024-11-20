// NEED TO DO's
// 1. id and name attributes for the labels and inputs so chrome doesn't freak out
"use client";

import React, { useEffect, useState } from "react";
import { IClub, IClubInput, ClubCategory, ClubAffiliation, ClubLeader } from "@/lib/models/Club";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import EditableImageSection from "@/components/update/EditImage";
import ClubLeadersSection from "@/components/update/EditLeaders";
import CategoriesDropdown from "@/components/update/ClubCategories";
import AffiliationDropdown from "@/components/update/ClubAffiliation";

const UpdatePage = () => {
  // const router = useRouter();
  const searchParams = useSearchParams();
  const [club, setClub] = useState<IClub | null>(null);
  const [formData, setFormData] = useState<IClubInput>({
    name: "", // done
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
  });
  const [isLoading, setIsLoading] = useState(true);

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
    value: string | number | ClubLeader[] | ClubAffiliation[] | undefined | ClubCategory[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Club Data:", formData);
  };

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
          <div className="px-2">
            <button className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500">
              <Link href={`/`}>Back</Link>
            </button>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-center">{formData.name}</h1>
          <EditableImageSection formData={formData} handleChange={handleChange} />
          <div className="grid grid-cols-3 gap-4 py-8">
            {/* Left Section */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 h-40 resize-none"
                  ></textarea>
                </label>
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
              </div>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UpdatePage;
