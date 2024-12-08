import React, { useEffect, useRef, useState } from "react";
import { IClub } from "@/lib/models/Club";
import Board from "./Board";
import Image from "next/image";
import { getAdjustedNumMembers } from "@/lib/utils";
import { useMediaQuery } from "react-responsive";
import ClubModalRightLabel from "./ClubModalRightLabel";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

type ClubModalProps = {
  club: IClub;
  onClose: () => void;
};

const ClubModal = ({ club, onClose }: ClubModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const isSm = useMediaQuery({ maxWidth: 640 });
  const isMd = useMediaQuery({ maxWidth: 768 });
  const [canEdit, setCanEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const token = Cookies.get("token");

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
        className="relative bg-white rounded-lg max-w-3xl w-full mx-4 md:mx-auto h-5/6 max-h-[1000px] overflow-hidden flex flex-col"
      >
        <div
          onClick={onClose}
          className="absolute top-2 left-2 p-[0.3rem] px-[0.5rem] pt-[0.2rem] font-bold text-2xl rounded-full text-white bg-black bg-opacity-60 leading-none"
        >
          &times;
        </div>
        <Image
          src={club.backgroundImage || "/assets/default-background.png"}
          alt="bg"
          className="w-full h-1/4 md:h-[210px] object-cover rounded-t-lg"
          width={768}
          height={768}
          onError={(e) => {
            e.currentTarget.src = "/assets/default-background.png";
          }}
        />
        {isMd && (
          <Image
            src={club.logo ?? "/assets/default-logo.png"}
            alt="Club Logo"
            width={100}
            height={100}
            className={`${club.logo ? "rounded-2xl" : ""} flex-shrink-0 border-2 border-white relative -top-[50px] mx-auto`}
          />
        )}
        {!isSm ? (
          <>
            {token ? (
              canEdit ? (
                <Link href={`/Update?clubId=${club._id}`}>
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

        <div className="flex flex-col overflow-y-auto overflow-x-hidden m-4 md:m-8 -mt-[50px] md:mt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col md:w-3/5">
              <div
                className={`text-center md:text-left ${club.name.length > 100 ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"} font-bold`}
              >
                {club.name}
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
                <ClubModalRightLabel header="Website" content={club.website} link={club.website} />
                <ClubModalRightLabel header="Email" content={club.email} link={"mailto:" + club.email} />
                <ClubModalRightLabel
                  header="Membership"
                  content={club.numMembers ? getAdjustedNumMembers(club.numMembers) + "members" : undefined}
                />
                <ClubModalRightLabel header="Instagram" content={club.instagram} />
                <ClubModalRightLabel
                  header="Application Form"
                  content={club.applyForm ? "Application Form Link" : undefined}
                  link={club.applyForm}
                />
                <ClubModalRightLabel
                  header="Mailing List"
                  content={club.mailingListForm ? "Mailing List Link" : undefined}
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
  );
};

export default ClubModal;
