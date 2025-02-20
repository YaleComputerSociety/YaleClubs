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
import { FaTrash } from "react-icons/fa";
import axios from "axios";
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
        setCanEdit(isBoardMember || user.role === "admin");
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, [associatedClubLeaders, user, isLoggedIn]);

  const editButtonStyle = "px-3 py-1 text-base font-medium rounded-xl shadow";

  const EditDeleteButton = () => {
    return (
      <div className="absolute top-3 right-3 z-50">
        {canEdit && isLoggedIn && false && (
          <div className="flex flex-row space-x-3">
            <Link href={`/CreateUpdateEvent?eventId=${event._id}`}>
              <button
                className={`${editButtonStyle} bg-clubPurple text-white hover:bg-clubBlurple transition-all duration-300 hover:scale-105`}
              >
                Edit Event
              </button>
            </Link>
            <button
              className={`${editButtonStyle} text-white bg-red-600 rounded shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
                  try {
                    await axios.delete(`/api/events?id=${event._id}`, {
                      data: event,
                    });
                    onClose();
                    window.location.reload();
                  } catch (error) {
                    alert(`Failed to delete event: ${error instanceof Error ? error.message : "Unknown error"}`);
                    console.error("Error deleting event:", error);
                  }
                }
              }}
            >
              <div className="flex flex-row items-center space-x-2">
                <span>Delete</span>
                <FaTrash />
              </div>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl w-full max-w-lg h-[85dvh] max-h-[1000px] overflow-y-auto"
      >
        <div className="bg-white z-50 absolute top-4 left-4 h-5 w-5 rounded-full"></div>
        <Image
          onClick={onClose}
          src="/assets/icons/cancel.svg"
          alt="cancel"
          width={35}
          height={35}
          unoptimized
          className="cursor-pointer z-50 absolute top-2 left-2"
        />

        <EditDeleteButton />

        <div className="relative w-full aspect-square shadow-lg">
          <Image
            src={event.flyer || "/assets/default-background.png"}
            alt="Flyer"
            className="object-cover"
            fill
            priority
          />
        </div>

        <div className="max-w-lg mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1 w-full">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight break-words relative -top-1">
                {event.name}
              </div>
              <div className="flex flex-row flex-wrap gap-x-6 font-semibold text-gray-700">
                <div>
                  {new Date(event.start).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div>{new Date(event.start).toLocaleString(undefined, { timeStyle: "short" })}</div>
                <div>{event.location}</div>
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
                      className="rounded-md"
                      alt="Club Logo"
                      width={40}
                      height={40}
                    />
                  )}
                  <div className="text-sm sm:text-sm text-gray-700 max-w-[125px]" style={{ lineHeight: "1.2" }}>
                    {club.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-gray-700 text-sm sm:text-base mt-3 break-words">{event.description}</div>

          <div className="flex flex-wrap gap-2 mt-3">
            {event.tags?.map((tag: Tag, index) => <TagBlock key={index} tag={tag} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
