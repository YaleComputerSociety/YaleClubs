"use client";

import React from "react";
import { IClub } from "@/lib/models/Club";
import Image from "next/image";
import { getAdjustedNumMembers } from "@/lib/utils";

type ClubCardProps = {
  club: IClub;
  onClick: () => void;
};

const ClubCard = ({ club, onClick }: ClubCardProps) => {
  const categories = club.categories || ["tag1", "tag2", "tag3"]; // Use categories from API if available
  //   const [logoUri, setLogoUri] = useState(null);

  // useEffect(() => {
  //     const fetchLogoUri = async () => {
  //         try {
  //             const response = await axios.get(`/api/clubs/logo/${item._id}`);
  //             const base64ImageData = response.data;
  //             const uri = `data:image/jpeg;base64,${base64ImageData}`;
  //             setLogoUri(uri);
  //         } catch (error) {
  //             console.error('Error fetching logo:', error);
  //             // Use a default logo URI in case of an error
  //             setLogoUri('/default-logo.png');
  //         }
  //     };
  //     if (item.logo) {
  //         fetchLogoUri();
  //     }
  // }, [item.logo, item._id]);

  return (
    <div className="border border-gray-200 rounded-xl p-6 flex flex-col gap-4 max-w-lg w-full" onClick={onClick}>
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <div className="text-3xl font-semibold line-clamp-2 overflow-hidden">{club.name}</div>
          <div className="mt-3 flex gap-2 overflow-auto whitespace-nowrap text-ellipsis scrollbar-hide">
            {categories.map((tag, index) => (
              <span key={index} className="bg-[#eee] rounded px-2 py-1 text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Image
          src={club.logo ?? "/assets/default-logo.png"}
          alt="Club Logo"
          width={100}
          height={100}
          className={`${club.logo ? "rounded-full" : ""} flex-shrink-0`}
        />
      </div>

      <div className="text-base text-gray-800 line-clamp-3">{club.description ?? "No description"}</div>

      <div className="flex flex-row items-center justify-between">
        {club.email && (
          <a href={`mailto:${club.email}`} className="text-blue-500 underline truncate max-w-xs inline-block">
            {club.email}
          </a>
        )}
        {club.numMembers && (
          <div className="flex-shrink-0 text-right">{getAdjustedNumMembers(club.numMembers)} members</div>
        )}
      </div>
    </div>
  );
};

export default ClubCard;
