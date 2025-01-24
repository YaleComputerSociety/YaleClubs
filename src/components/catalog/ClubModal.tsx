import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { IClub } from "@/lib/models/Club";
import Board from "./Board";
import Image from "next/image";
import { getAdjustedNumMembers, getAdjustedWebsite, getInstagramLink, getModifiedInstagram } from "@/lib/utils";
import { useMediaQuery } from "react-responsive";
import ClubModalRightLabel from "./ClubModalRightLabel";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import FollowButton from "./FollowButton";

type ClubModalProps = {
  club: IClub;
  onClose: () => void;
  followedClubs: string[];
  setFollowedClubs: Dispatch<SetStateAction<string[]>>;
  initialFollowing: boolean;
};

const ClubModal = ({ club, onClose, followedClubs, setFollowedClubs, initialFollowing }: ClubModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const isSm = useMediaQuery({ maxWidth: 640 });
  const isMd = useMediaQuery({ maxWidth: 768 });
  const [canEdit, setCanEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const token = Cookies.get("token");
  const isFollowing = followedClubs.includes(club._id);

  const adjustedFollowers = club.followers
    ? String(club.followers + (isFollowing === initialFollowing ? 0 : isFollowing ? 1 : -1))
    : isFollowing
      ? "1"
      : "0";

  console.table(club);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<{ email: string }>(token);
        const userEmail = decoded.email;

        const admin_emails = [
          "lucas.huang@yale.edu",
          "addison.goolsbee@yale.edu",
          "francis.fan@yale.edu",
          "grady.yu@yale.edu",
          "lauren.lee.ll2243@yale.edu",
          "koray.akduman@yale.edu",
        ];

        const isBoardMember = club.leaders.some((leader) => leader.email === userEmail);
        setCanEdit(isBoardMember || admin_emails.includes(userEmail));
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, [club.leaders, token]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl max-w-4xl w-full lg:px-28 mx-4 lg:mx-auto h-5/6 max-h-[1000px] overflow-hidden flex flex-col"
      >
        <Image
          onClick={onClose}
          src="/assets/icons/cancel.svg"
          alt="cancel"
          width={35}
          height={35}
          unoptimized
          className="absolute top-2 left-2 cursor-pointer z-50"
        />

        <div className="flex flex-col items-center mt-8 overflow-y-auto w-full">
          <div className="w-full h-[36%] bg-red-300 relative">
            <Image
              src={club.backgroundImage || "/assets/default-background.png"}
              alt="bg"
              className="object-cover h-full"
              width={768}
              height={768}
              onError={(e) => {
                e.currentTarget.src = "/assets/default-background.png";
              }}
            />
            <Image
              src={club.logo ?? "/assets/default-logo.png"}
              alt="Club Logo"
              width={150}
              height={150}
              className={`${club.logo ? "rounded-2xl" : ""} flex-shrink-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-xl`}
            />
          </div>

          {!isSm ? (
            <>
              {token ? (
                canEdit ? (
                  <Link href={`/update?clubId=${club._id}`}>
                    <button className="absolute top-4 right-4 px-4 py-2 text-lg font-medium text-white bg-indigo-600 rounded shadow hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      Edit Club
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => setErrorMessage("You do not have permission to edit this club.")}
                    className="absolute top-4 right-4 px-4 py-2 text-lg font-medium text-gray-500 bg-gray-300 rounded shadow cursor-not-allowed"
                  >
                    Edit Club
                  </button>
                )
              ) : (
                <button
                  onClick={() => setErrorMessage("You need to log in to edit this club.")}
                  className="absolute top-4 right-4 px-4 py-2 text-lg font-medium text-gray-500 bg-gray-300 rounded shadow cursor-pointer"
                >
                  Log in to Edit
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => setErrorMessage("You must be logged in on a computer to edit a club.")}
              className="absolute top-3 right-3 px-2 py-1 text-sm font-medium text-gray-500 bg-gray-300 rounded shadow cursor-not-allowed"
            >
              Edit Club
            </button>
          )}

          {errorMessage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg">
                <h2 className="text-lg font-semibold text-gray-800">Error</h2>
                <p className="mt-2 text-gray-600">{errorMessage}</p>
                <button
                  onClick={() => setErrorMessage("")}
                  className="mt-4 px-4 py-2 text-white bg-indigo-600 rounded shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col overflow-y-auto overflow-x-hidden px-4 md:px-6 pb-4 md:pb-6 -mt-[50px] md:mt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col md:w-3/5">
                <div
                  className={`text-center md:text-left ${club.name.length > 100 ? "text-xl md:text-2xl" : "text-2xl md:text-2xl"} font-bold`}
                >
                  {club.name}
                  <div className="flex flex-row items-center text-base gap-2 mt-1">
                    <div className="text-gray-500">
                      {adjustedFollowers} follower{adjustedFollowers == "1" ? "" : "s"}{" "}
                    </div>
                    •
                    <FollowButton
                      isFollowing={isFollowing}
                      clubId={club._id}
                      followedClubs={followedClubs}
                      setFollowedClubs={setFollowedClubs}
                    />
                  </div>
                </div>
                {club.school && (
                  <div className="flex gap-2 whitespace-nowrap w-full flex-wrap mt-4">
                    <span className="bg-[#acf] rounded px-2 py-1 text-sm">{club.school}</span>
                  </div>
                )}
                {((club.affiliations && club.affiliations.length > 0) ||
                  (club.categories && club.categories.length > 0)) && (
                  <div className="flex gap-2 whitespace-nowrap w-full flex-wrap mt-4">
                    {club.categories?.map((tag, index) => (
                      <span key={index} className="bg-[#eee] rounded px-2 py-1 text-sm">
                        {tag}
                      </span>
                    ))}
                    {club.affiliations?.map((tag, index) => (
                      <span key={index} className="bg-[#feb] rounded px-2 py-1 text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-gray-700 mt-4 text-sm sm:text-base">{club.description || "No description"}</div>
              </div>
              <div className="flex flex-col md:w-2/5 items-center">
                {!isMd && (
                  <div className="flex flex-col items-center gap-4">
                    <Image
                      src={club.logo ? club.logo : "/assets/default-logo.png"}
                      alt="Club Logo"
                      width={100}
                      height={100}
                      className={`${club.logo ? "rounded-2xl" : ""} flex-shrink-0`}
                    />
                  </div>
                )}
                <div className="flex flex-col w-full sm:w-3/4 md:w-full">
                  <ClubModalRightLabel
                    header="Website"
                    content={getAdjustedWebsite(club.website)}
                    link={club.website}
                  />
                  <ClubModalRightLabel header="Email" content={club.email} link={"mailto:" + club.email} />
                  <ClubModalRightLabel
                    header="Membership"
                    content={club.numMembers ? getAdjustedNumMembers(club.numMembers) + " members" : undefined}
                  />
                  <ClubModalRightLabel
                    header="Instagram"
                    content={getModifiedInstagram(club.instagram)}
                    link={getInstagramLink(club.instagram)}
                  />
                  <ClubModalRightLabel
                    header="Application Form"
                    content={club.applyForm ? "Application Form" : undefined}
                    link={club.applyForm}
                  />
                  <ClubModalRightLabel
                    header="Mailing List"
                    content={club.mailingListForm ? "Mailing List" : undefined}
                    link={club.mailingListForm}
                  />
                  <ClubModalRightLabel
                    header="Calendar"
                    content={club.calendarLink ? "Calendar Link" : undefined}
                    link={club.calendarLink}
                  />
                  <ClubModalRightLabel header="Meeting" content={club.meeting} />
                </div>
              </div>
            </div>
            <Board leaders={club.leaders} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubModal;
