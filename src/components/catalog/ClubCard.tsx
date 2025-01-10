"use client";

import React, { useState, useEffect } from "react";
import { IClub } from "@/lib/models/Club";
import Image from "next/image";
import { getAdjustedNumMembers } from "@/lib/utils";
import FollowButton from "./Star.tsx";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

type ClubCardProps = {
  club: IClub;
  onClick: () => void;
};

const ClubCard = ({ club, onClick }: ClubCardProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        jwtDecode(token);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("not logged in:", err);
        setIsLoggedIn(false);
      }
    }
  }, []);

  return (
    <div
      className="border border-gray-200 rounded-xl px-3 py-2 md:px-4 md:py-3 flex flex-col gap-2 w-full cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-row gap-4">
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <div className="md:text-xl font-semibold line-clamp-1 md:line-clamp-2 overflow-hidden">{club.name}</div>
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
        <div>
          <FollowButton isLoggedIn={isLoggedIn} />
        </div>
      </div>
      <div className="text-sm md:text:lg text-gray-800 line-clamp-3">{club.description ?? "No description"}</div>

      {club.email || club.numMembers ? (
        <div className="flex flex-row items-center justify-between text-sm">
          {club.email && <div className="text-blue-500 truncate max-w-xs inline-block">{club.email}</div>}
          {club.numMembers ? (
            <div className="flex-shrink-0 text-right w-full">{getAdjustedNumMembers(club.numMembers)} members</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default ClubCard;
