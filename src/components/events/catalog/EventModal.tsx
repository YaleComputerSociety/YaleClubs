import React, { useEffect, useRef, useState } from "react";
import { Tag } from "@/lib/models/Event";
import { ClubLeader } from "@/lib/models/Club";
import Image from "next/image";
import Link from "next/link";
import { IEvent } from "@/lib/models/Event";
import { TagBlock } from "./TagBlock";
import { generateGoogleCalendarLink } from "@/lib/utils";
import { IClub } from "@/lib/models/Club";
import { useAuth } from "@/contexts/AuthContext";

type EventModalProps = {
  event: IEvent;
  associatedClubLeaders: ClubLeader[];
  onClose: () => void;
  associatedClubs: IClub[];
};

const EventModal = ({ event, associatedClubLeaders, onClose, associatedClubs }: EventModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [canEdit, setCanEdit] = useState(false);
  const { isLoggedIn, user } = useAuth();

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
    if (isLoggedIn && user) {
      try {
        const userEmail: string = user.email;

        const isBoardMember = associatedClubLeaders.some((leader) => leader.email === userEmail);
        setCanEdit(isBoardMember);
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, [associatedClubLeaders, user, isLoggedIn]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-10">
      <div ref={modalRef} className="bg-white rounded-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-xl font-bold text-white bg-black bg-opacity-60 rounded-full"
          >
            &times;
          </button>
          {canEdit && isLoggedIn ? (
            <Link href={`/CreateUpdateEvent?eventId=${event._id}`}>
              <button className="px-4 py-2 text-lg font-medium text-white bg-indigo-600 rounded shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Edit Event
              </button>
            </Link>
          ) : isLoggedIn ? (
            <button
              className="px-4 py-2 text-lg font-medium text-white bg-gray-400 rounded shadow cursor-not-allowed"
              disabled
            >
              Edit Event
            </button>
          ) : (
            <div></div>
          )}
        </div>

        <div className="flex justify-center py-8">
          <div className="relative w-full max-w-md aspect-square rounded-lg shadow-lg">
            <Image
              src={event.flyer || "/assets/default-background.png"}
              alt="Flyer"
              className="object-cover rounded-lg"
              fill
              priority
            />
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1 w-full">
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight break-words">{event.name}</h2>
              <div>{new Date(event.start).toLocaleString(undefined, { dateStyle: "medium" })}</div>
              <div>
                {event.location} | {new Date(event.start).toLocaleString(undefined, { timeStyle: "short" })}
              </div>
              <div className="flex flex-wrap gap-2 text-xs mt-2">
                {event.registrationLink && (
                  <Link href={event.registrationLink}>
                    <button className="bg-blue-500 p-2 rounded-lg text-white font-bold">Register for Event</button>
                  </Link>
                )}
                <Link href={generateGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer">
                  <button className="bg-violet-600 p-2 rounded-lg text-white font-bold">Add to Calendar</button>
                </Link>
              </div>
            </div>

            <div className="sm:flex-col gap-4 sm:gap-4 overflow-x-auto sm:overflow-x-visible flex">
              {associatedClubs.map((club, index) => (
                <div key={index} className="flex items-start gap-2 flex-shrink-0">
                  {club.logo ? (
                    <Image src={club.logo} className="rounded-lg" alt="Club Logo" width={36} height={36} />
                  ) : (
                    <Image
                      src={"/assets/default-logo.png"}
                      className="rounded-lg"
                      alt="Club Logo"
                      width={36}
                      height={36}
                    />
                  )}
                  <div className="text-sm sm:text-base text-gray-600 font-bold max-w-[125px]">{club.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-gray-500 text-sm sm:text-base mt-3 break-words">{event.description}</div>

          <div className="flex flex-wrap gap-2 mt-3">
            {event.tags?.map((tag: Tag, index) => <TagBlock key={index} tag={tag} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
