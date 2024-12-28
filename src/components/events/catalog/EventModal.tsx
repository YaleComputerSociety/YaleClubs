"use client";

import React, { useEffect, useRef, useState } from "react";
import { Tag } from "@/lib/models/Event";
import { ClubLeader } from "@/lib/models/Club";
import Image from "next/image";
import ModalRightLabel from "@/components/ModalRightLabel";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { IEvent } from "@/lib/models/Event";
import { TagBlock } from "./TagBlock";
import { generateGoogleCalendarLink } from "@/lib/utils";

type EventModalProps = {
  event: IEvent;
  associatedClubLeaders: ClubLeader[];
  onClose: () => void;
};

const EventModal = ({ event, associatedClubLeaders, onClose }: EventModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [canEdit, setCanEdit] = useState(false);
  const token = Cookies.get("token");

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
          "ethan.mathieu@yale.edu",
        ];

        const isBoardMember = associatedClubLeaders.some((leader) => leader.email === userEmail);
        setCanEdit(isBoardMember || admin_emails.includes(userEmail));
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, [associatedClubLeaders, token]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div
        ref={modalRef}
        className="text-left relative bg-white rounded-lg max-w-md w-full mx-auto h-auto max-h-[90vh] overflow-y-auto  flex-col p-4"
      >
        <div className="flex flex-row justify-between absolute top-2 left-2 w-full px-4 mb-8">
          <div
            onClick={onClose}
            className="w-8 h-8 py-1 flex items-center justify-center text-xl font-bold text-white bg-black bg-opacity-60 rounded-full cursor-pointer"
          >
            &times;
          </div>

          {token && (
            <Link href={`/CreateUpdateEvent?eventId=${event._id}`}>
              <button
                className={`px-4 py-2 text-lg font-medium text-white bg-indigo-600 rounded shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  !canEdit ? "bg-gray-400 cursor-not-allowed" : ""
                }`}
              >
                Edit Event
              </button>
            </Link>
          )}
        </div>

        <div className="flex items-center justify-center">
          <Image
            src={event.flyer ?? "/assets/default-logo.png"}
            alt="Event Flyer"
            width={200}
            height={200}
            className="rounded-xl object-contain max-h-[300px] max-w-full mt-10 mb-4"
            priority
          />
        </div>

        <div className="w-full flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold text-left">{event.name}</h2>
            <div className="flex gap-2 mt-2 flex-wrap justify-start">
              {event.tags?.map((tag: Tag, index) => <TagBlock key={index} tag={tag} />)}
            </div>
          </div>

          <div className="text-md font-bold text-gray-600">
            {event.clubs?.length ? event.clubs.join(" x ") : "No clubs listed"}
          </div>

          <div className="text-gray-700 text-left text-sm sm:text-base">{event.description}</div>

          <div className="flex flex-col justify-start gap-4 w-full">
            <ModalRightLabel
              header="Time"
              content={new Date(event.start).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            />
            <ModalRightLabel header="Location" content={event.location} isSm={true} />
            <ModalRightLabel
              header="Registration Link"
              content={event.registrationLink}
              link={event.registrationLink}
              isSm={true}
            />
            <ModalRightLabel
              header=""
              content="Add to Google Calendar"
              link={generateGoogleCalendarLink(event)}
              isSm={true}
            />
            <ModalRightLabel header="" content="Report Event" link={event.registrationLink} isSm={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;