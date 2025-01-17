"use client";

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { IClub, RecruitmentStatus } from "@/lib/models/Club";
import Image from "next/image";
import FollowButton from "./FollowButton";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

type ClubCardProps = {
  club: IClub;
  onClick: () => void;
  followedClubs: string[];
  setFollowedClubs: Dispatch<SetStateAction<string[]>>;
  initialFollowing: boolean;
};

const ClubCard = ({ club, onClick, followedClubs, setFollowedClubs, initialFollowing }: ClubCardProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [netid, setNetid] = useState<string | null>(null);

  const isFollowing = followedClubs.includes(club._id);

  const adjustedFollowers = club.followers
    ? String(club.followers + (isFollowing === initialFollowing ? 0 : isFollowing ? 1 : -1))
    : isFollowing
      ? "1"
      : "0";

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<{ netid: string }>(token);
        setIsLoggedIn(true);
        setNetid(decoded.netid);
      } catch (err) {
        console.error("Invalid token:", err);
        setIsLoggedIn(false);
        setNetid(null);
      }
    }
  }, []);

  const isNew = () => {
    if (!club.updatedAt) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return false;
  };

  const getApplicationStatus = () => {
    if (!club.recruitmentStatus || club.recruitmentStatus === RecruitmentStatus.NOSELECTION) {
      return null;
    }

    switch (club.recruitmentStatus) {
      case RecruitmentStatus.APPCLOSED:
        return "Applications Closed";
      case RecruitmentStatus.APPENDS:
        if (club.recruitmentEndDate) {
          const date = new Date(club.recruitmentEndDate);
          const now = new Date();

          const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

          const formattedDate = localDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          if (date < now) {
            return "Applications Closed";
          }

          return `Applications Close ${formattedDate}`;
        }
        return "Applications Closing Soon";
      case RecruitmentStatus.APPOPENS:
        if (club.recruitmentStartDate) {
          const date = new Date(club.recruitmentStartDate);
          const endDate = club.recruitmentEndDate ? new Date(club.recruitmentEndDate) : null;
          const now = new Date();

          const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

          const formattedDate = localDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          const endlocalDate = endDate ? new Date(endDate.getTime() + date.getTimezoneOffset() * 60000) : null;

          const endformattedDate = endlocalDate
            ? endlocalDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "";

          if (endDate && endDate < now) {
            return "Applications Closed";
          }

          if (date < now) {
            if (endDate) {
              return `Applications Close ${endformattedDate}`;
            }
            return "Applications Open";
          }

          return `Applications Open ${formattedDate}`;
        }
        return "Applications Opening Soon";
      default:
        return null;
    }
  };

  const isFeatured: boolean = false;
  const applicationStatus = getApplicationStatus();
  const hasApplicationStatus = applicationStatus !== null;

  return (
    <div className="relative w-full max-w-2xl">
      <div
        className={`border border-gray-200 rounded-xl px-3 py-2 md:px-4 md:py-3 flex flex-col gap-2 w-full cursor-pointer hover:border-gray-300 transition-colors ${
          hasApplicationStatus ? "rounded-b-none border-b-0" : "h-full"
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
            <div className="mt-2 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
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
            <div className="text-sm md:text:lg text-gray-800 line-clamp-3 mt-2">
              {club.description ?? "No description"}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={club.logo && club.logo.trim() !== "" ? club.logo : "/assets/default-logo.png"}
              alt="Club Logo"
              width={100}
              height={100}
              className="rounded-xl flex-shrink-0 w-16 md:w-[70px] h-16 md:h-[70px]"
            />
            <div className="flex flex-col items-center">
              <FollowButton
                isLoggedIn={isLoggedIn}
                isFollowing={isFollowing}
                netid={netid || ""}
                clubId={club._id}
                followedClubs={followedClubs}
                setFollowedClubs={setFollowedClubs}
              />
              <div className="text-sm text-gray-500">
                {adjustedFollowers} follower{adjustedFollowers == "1" ? "" : "s"}{" "}
              </div>
            </div>
          </div>
        </div>

        {/* {club.email || club.numMembers ? (
          <div className="flex flex-row items-center justify-between text-sm">
            {club.email && <div className="text-blue-500 truncate max-w-xs inline-block">{club.email}</div>}
            {club.numMembers ? (
              <div className="flex-shrink-0 text-right w-full">{getAdjustedNumMembers(club.numMembers)} members</div>
            ) : null}
          </div>
        ) : null} */}
      </div>
      {hasApplicationStatus && (
        <div
          className="w-full border border-gray-200 border-t-0 rounded-b-xl overflow-hidden cursor-pointer"
          onClick={onClick}
        >
          <div className="w-full bg-purple-50 py-2 px-3 md:px-4">
            <div className="flex items-center justify-center">
              <span className="line-clamp-1 text-purple-800 text-sm font-medium">{applicationStatus}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubCard;
