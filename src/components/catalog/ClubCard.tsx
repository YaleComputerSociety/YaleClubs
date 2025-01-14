import React from "react";
import { IClub } from "@/lib/models/Club";
import Image from "next/image";
import { getAdjustedNumMembers } from "@/lib/utils";

type ClubCardProps = {
  club: IClub;
  onClick: () => void;
};

const ClubCard = ({ club, onClick }: ClubCardProps) => {
  const isNew = () => {
    if (!club.updatedAt) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // return new Date(club.updatedAt) > thirtyDaysAgo;
    // change this to return false for now
    return false;
  };

  const getApplicationStatus = () => {
    const statuses = [
      "Applications Open • Due Feb 1",
      "Applications Opening Soon • Jan 15",
      "Applications Closed • Next Cycle in Fall",
      "Applications Under Review",
    ];
    return statuses[club.name.length % statuses.length];
  };

  // can change this later
  const isFeatured: boolean = false;

  const applicationStatus = getApplicationStatus();
  const hasApplicationStatus = applicationStatus !== null;

  return (
    <div className="relative">
      <div
        className={`border border-gray-200 rounded-xl px-3 py-2 md:px-4 md:py-3 flex flex-col gap-2 w-full cursor-pointer hover:border-gray-300 transition-colors ${
          hasApplicationStatus ? "rounded-b-none border-b-0" : ""
        }`}
        onClick={onClick}
      >
        {isNew() && (
          <div className="absolute top-0 right-0">
            <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-3 py-1 rounded-bl-xl shadow-md">
              <span className="text-xs font-semibold">New</span>
            </div>
          </div>
        )}
        {isFeatured && (
          <div className="absolute top-0 left-0">
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-br-xl shadow-md">
              <span className="text-xs font-semibold">Featured</span>
            </div>
          </div>
        )}
        <div className="flex flex-row gap-4">
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="md:text-xl font-semibold line-clamp-1 md:line-clamp-2 overflow-hidden">{club.name}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 overflow-auto whitespace-nowrap text-ellipsis scrollbar-hide">
              {club.school && <span className="bg-[#acf] rounded px-2 py-1 text-xs">{club.school}</span>}
              {club.categories?.map((tag, index) => (
                <span key={index} className="bg-[#eee] rounded px-2 py-1 text-xs">
                  {tag}
                </span>
              ))}
              {club.affiliations?.map((tag, index) => (
                <span key={index} className="bg-[#feb] rounded px-2 py-1 text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <Image
            src={club.logo && club.logo.trim() !== "" ? club.logo : "/assets/default-logo.png"}
            alt="Club Logo"
            width={100}
            height={100}
            className="rounded-2xl flex-shrink-0 w-16 md:w-[70px] h-16 md:h-[70px]"
            priority
          />
        </div>
        <div className="text-sm md:text:lg text-gray-800 line-clamp-3">{club.description ?? "No description"}</div>

        <div className="flex flex-row items-center justify-between text-sm mt-2">
          <div className="flex items-center gap-2">
            {club.email && <div className="text-blue-500 truncate max-w-xs inline-block">{club.email}</div>}
          </div>
          {club.numMembers ? (
            <div className="flex-shrink-0 text-right w-full">{getAdjustedNumMembers(club.numMembers)} members</div>
          ) : null}
        </div>
      </div>

      {hasApplicationStatus && (
        <div className="w-full border border-gray-200 border-t-0 rounded-b-xl overflow-hidden">
          <div className="w-full bg-purple-50 py-2 px-3 md:px-4">
            <div className="flex items-center justify-center">
              <span className="text-purple-800 text-sm font-medium">{applicationStatus}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubCard;

// need to add the following:
// - new?
// - how many following?
// - following functionality
// - featured?
// - what stage in application season they are?
