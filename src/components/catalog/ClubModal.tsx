import React, { useEffect, useRef } from "react";
import { IClub } from "@/lib/models/Club";
import Link from "next/link";
import Board from "./Board";
import Image from "next/image";
import { getAdjustedNumMembers } from "@/lib/utils";
import { useMediaQuery } from "react-responsive";
import ClubModalRightLabel from "./ClubModalRightLabel";

type ClubModalProps = {
  club: IClub;
  onClose: () => void;
};

const ClubModal = ({ club, onClose }: ClubModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="relative bg-white rounded-lg p-6 w-11/12 max-w-lg h-3/4">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-2xl text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">{club.name}</h2>
        <p className="text-gray-700 mb-4">{club.description}</p>
        <button className="absolute bottom-4 right-4 px-4 py-2 text-lg font-medium text-white bg-indigo-600 rounded shadow hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <Link href={`/Update?clubId=${club._id}`}>Edit Here</Link>
        </button>
        <img
          src={club.backgroundImage || "/assets/default-background.png"}
          alt="Club Background"
          className="w-full h-1/4 md:h-48 object-cover rounded-t-lg"
          width={768}
          height={192}
        />
        {isMobile && (
          <Image
            src={club.logo ?? "/assets/default-logo.png"}
            alt="Club Logo"
            width={100}
            height={100}
            className={`${club.logo ? "rounded-full" : ""} flex-shrink-0 border-2 border-white relative -top-[50px] mx-auto`}
          />
        )}
        <div className="flex flex-col overflow-y-auto overflow-x-hidden m-4 -mt-[50px] md:mt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col md:w-3/5">
              <div
                className={`text-center md:text-left ${club.name.length > 100 ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"} font-bold`}
              >
                {club.name}
              </div>
              {club.categories && club.categories.length > 0 && (
                <div className="flex gap-2 whitespace-nowrap w-full flex-wrap mt-4">
                  {club.categories.map((tag, index) => (
                    <span key={index} className="bg-[#eee] rounded px-2 py-1 text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {club.affiliations && club.affiliations.length > 0 ? (
                <div className="w-fit bg-[#fdf] rounded px-2 py-1 text-sm mt-4">{club.affiliations[0]}</div>
              ) : (
                <div className="text-gray-700 text-md mt-4">Unknown affiliation</div>
              )}
              <div className="text-gray-700 mt-4 text-sm sm:text-base">{club.description || "No description"}</div>
            </div>
            <div className="flex flex-col md:w-2/5 items-center">
              {!isMobile && (
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src={club.logo ?? "/assets/default-logo.png"}
                    alt="Club Logo"
                    width={100}
                    height={100}
                    className={`${club.logo ? "rounded-full" : ""} flex-shrink-0`}
                  />
                </div>
              )}
              <div className="flex flex-col w-full sm:w-3/4 md:w-full">
                <ClubModalRightLabel header="Website" content={club.website} link={club.website} />
                <ClubModalRightLabel header="Email" content={club.email} link={"mailto:" + club.email} />
                <ClubModalRightLabel
                  header="Membership"
                  content={`${club.numMembers ? getAdjustedNumMembers(club.numMembers) : "Unknown # of"} members`}
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
