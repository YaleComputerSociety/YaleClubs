"use client";

import React, { Dispatch, SetStateAction } from "react";
import { IClub, RecruitmentStatus } from "@/lib/models/Club";
import Image from "next/image";
import FollowButton from "./FollowButton";
import { LabelList } from "./LabelList";

type ClubCardProps = {
  club: IClub;
  onClick: () => void;
  followedClubs: string[];
  setFollowedClubs: Dispatch<SetStateAction<string[]>>;
  initialFollowing: boolean;
};

const ClubCard = ({ club, onClick, followedClubs, setFollowedClubs, initialFollowing }: ClubCardProps) => {
  const isFollowing = followedClubs.includes(club._id);

  const adjustedFollowers = club.followers
    ? String(club.followers + (isFollowing === initialFollowing ? 0 : isFollowing ? 1 : -1))
    : isFollowing
      ? "1"
      : "0";

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

          if (localDate.getTime() + 24 * 60 * 60 * 1000 < now.getTime()) {
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

          if (endlocalDate && endlocalDate.getTime() + 24 * 60 * 60 * 1000 < now.getTime()) {
            return "Applications Closed";
          }

          if (localDate.getTime() + 24 * 60 * 60 * 1000 < now.getTime()) {
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
    <div className="relative w-full">
      <div
        className={`bg-white rounded-xl flex flex-col justify-between w-full cursor-pointer h-full shadow-md  `}
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
        <div className="flex flex-row gap-2 sm:gap-4 px-3 py-2 md:px-4 md:py-3 ">
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="md:text-xl font-semibold line-clamp-1 md:line-clamp-2 overflow-hidden break-all">
                  {club.name}
                </div>
              </div>
            </div>
            <LabelList club={club} className="mt-2 scrollbar-hide overflow-x-auto" />
            <div className="text-xs sm:text-sm md:text:lg text-gray-800 line-clamp-3 mt-2">
              {club.description ?? "No description"}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={club.logo && club.logo.trim() !== "" ? club.logo : "/assets/default-logo.png"}
              alt="Club Logo"
              width={100}
              height={100}
              className="rounded-xl flex-shrink-0 object-cover w-[60px] h-[60px] sm:w-[80px] sm:h-[80px]"
            />
            <div className="flex flex-col items-center">
              <FollowButton
                isFollowing={isFollowing}
                clubId={club._id}
                followedClubs={followedClubs}
                setFollowedClubs={setFollowedClubs}
                className="w-[60px] sm:w-[80.1px] my-2 text-xs sm:text-sm"
              />
              <div className="text-xs sm:text-sm text-gray-500">
                {adjustedFollowers} follower{adjustedFollowers == "1" ? "" : "s"}{" "}
              </div>
            </div>
          </div>
        </div>
        {hasApplicationStatus && (
          <div className="w-full overflow-hidden cursor-pointer" onClick={onClick}>
            <div className="w-full bg-purple-50 py-2 px-3 md:px-4 rounded-b-xl">
              <div className="flex items-center justify-center">
                <span className="line-clamp-1 text-purple-800 text-xs sm:text-sm font-medium">{applicationStatus}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubCard;
