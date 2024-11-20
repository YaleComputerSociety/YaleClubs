import React, { useEffect, useRef } from "react";
import { IClub } from "@/lib/models/Club";
import Link from "next/link";
import Board from "./Board";
import Image from "next/image";
import { getAdjustedNumMembers } from "@/lib/utils";

type ClubModalProps = {
  club: IClub;
  onClose: () => void;
};

const ClubModal = ({ club, onClose }: ClubModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

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
          className="w-full h-48 object-cover rounded-t-lg mb-4"
        />
        <div className="flex flex-col md:flex-row m-4 gap-4 h-[calc(100%-14rem)] overflow-y-auto">
          <div className="flex flex-col md:w-3/5">
            <div className={`${club.name.length > 100 ? "text-2xl" : "text-3xl"} font-bold`}>{club.name}</div>
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
            <div className="text-gray-700 mt-4">{club.description || "No description"}</div>
            <Board leaders={club.leaders} />
          </div>
          <div className="flex flex-col w-2/5">
            <div className="flex flex-col items-center gap-4">
              <Image
                src={club.logo ?? "/assets/default-logo.png"}
                alt="Club Logo"
                width={100}
                height={100}
                className={`${club.logo ? "rounded-full" : ""} flex-shrink-0`}
              />
              <div className="flex-shrink-0 text-right">
                {club.numMembers ? getAdjustedNumMembers(club.numMembers) : "Unknown # of"} members
              </div>
            </div>
            <div className="flex flex-col">
              {club.website && (
                <div className="flex flex-row justify-between gap-2 text-sm mt-4 font-semibold">
                  <div className="text-gray-500">Website</div>
                  <a className="text-blue-500" href={"https://" + club.website}>
                    {club.website}
                  </a>
                </div>
              )}
              {club.email && (
                <div className="flex flex-row justify-between gap-2 text-sm mt-4 font-semibold">
                  <div className="text-gray-500">Email</div>
                  <a className="text-blue-500" href={"mailto:" + club.email}>
                    {club.email}
                  </a>
                </div>
              )}
              {club.instagram && (
                <div className="flex flex-row justify-between gap-2 text-sm mt-4 font-semibold">
                  <div className="text-gray-500">Instagram</div>
                  <div className="text-gray-500">{club.instagram}</div>
                </div>
              )}
              {club.applyForm && (
                <div className="flex flex-row justify-between gap-2 text-sm mt-4 font-semibold">
                  <div className="text-gray-500">Application</div>
                  <a className="text-blue-500" href={"https://" + club.applyForm}>
                    Application Form
                  </a>
                </div>
              )}
              {club.mailingListForm && (
                <div className="flex flex-row justify-between gap-2 text-sm mt-4 font-semibold">
                  <div className="text-gray-500">Mailing List</div>
                  <a className="text-blue-500" href={club.mailingListForm}>
                    Mailing List
                  </a>
                </div>
              )}
              {club.calendarLink && (
                <div className="flex flex-row justify-between gap-2 text-sm mt-4 font-semibold">
                  <div className="text-gray-500">Calendar</div>
                  <a className="text-blue-500" href={club.calendarLink}>
                    Calendar Link
                  </a>
                </div>
              )}
              {club.meeting && (
                <div className="flex flex-row justify-between gap-2 text-sm mt-4 font-semibold">
                  <div className="text-gray-500">Meeting</div>
                  <div className="text-gray-500">{club.meeting}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubModal;
