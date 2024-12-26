import React, { useEffect, useRef, useState } from "react";
import { Tag } from "@/lib/models/Event";
import { ClubLeader } from "@/lib/models/Club";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";
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
  const isSm = useMediaQuery({ maxWidth: 640 });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg max-w-3xl w-full mx-4 md:mx-auto h-auto max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <div
          onClick={onClose}
          className="absolute top-2 left-2 p-[0.3rem] px-[0.5rem] pt-[0.2rem] font-bold text-2xl rounded-full text-white bg-black bg-opacity-60 leading-none cursor-pointer"
        >
          &times;
        </div>

        <Image
          src={event.flyer ?? "/assets/default-logo.png"}
          alt="Event Flyer"
          width={200}
          height={200}
          className="rounded-xl object-contain mx-auto max-h-[300px] max-w-full"
          priority
        />

        {!isSm && token && (
          <Link href={`/CreateUpdateEvent?eventId=${event._id}`}>
            <button
              // disabled={false}
              // disabled={!canEdit}
              className={`absolute top-4 right-4 px-4 py-2 text-lg font-medium text-white bg-indigo-600 rounded shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                !canEdit ? "bg-gray-400 cursor-not-allowed" : ""
              }`}
            >
              Edit Event
            </button>
          </Link>
        )}

        <div className="flex flex-col overflow-y-auto overflow-x-hidden m-4 md:m-8">
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex flex-col md:w-3/5">
              <div className={`text-center md:text-left text-2xl md:text-3xl font-bold`}>{event.name}</div>
              <div className="flex gap-2 mt-1 scrollbar-hide flex-wrap">
                {event.tags?.map((tag: Tag, index) => <TagBlock key={index} tag={tag} />)}
              </div>

              <div className="text-md font-bold text-gray-600 mt-1 line-clamp-3 overflow-ellipsis">
                {event.clubs?.length ? event.clubs.join(" x ") : "No clubs listed"}
              </div>
              <div className="text-gray-700 mt-3 text-sm sm:text-base">{event.description}</div>
            </div>

            <div className="flex flex-col md:w-2/5 items-center relative">
              <div className="flex flex-col w-full sm:w-3/4 md:w-full">
                <ModalRightLabel
                  header="Time"
                  content={new Date(event.start).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                />
                <ModalRightLabel header="Location" content={event.location} />
                <ModalRightLabel
                  header="Registration Link"
                  content={event.registrationLink}
                  link={event.registrationLink}
                />
                <br></br>
                <ModalRightLabel
                  header={""}
                  content={"Add to Google Calendar"}
                  link={generateGoogleCalendarLink(event)}
                />
                <ModalRightLabel header={""} content={"Report Event"} link={event.registrationLink} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
