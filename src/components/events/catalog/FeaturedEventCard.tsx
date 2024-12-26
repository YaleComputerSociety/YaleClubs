"use client";

import React from "react";
import { IEvent, Tag } from "@/lib/models/Event";
import Image from "next/image";
import { TagBlock } from "./TagBlock";

type FeaturedEventCardProps = {
  event: IEvent;
  onClick: () => void;
};

const FeaturedEventCard = ({ event, onClick }: FeaturedEventCardProps) => {
  return (
    <div
      className="border border-gray-200 rounded-xl px-4 py-3 flex flex-col gap-2 w-full h-full cursor-pointer transition-shadow max-w-full overflow-hidden"
      onClick={onClick}
    >
      <div className="flex flex-row gap-4">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="text-2xl md:text-2xl font-semibold line-clamp-1">{event.name}</div>

            <div className="flex gap-2 mt-1 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full">
              <TagBlock tag={Tag.FeaturedEvent} />
              {event.tags?.map((tag: Tag, index) => <TagBlock key={index} tag={tag} />)}
            </div>

            <div className="text-md font-semibold text-gray-600 mt-1 line-clamp-1 overflow-ellipsis">
              {event.clubs?.length ? event.clubs.join(" x ") : "No clubs listed"}
            </div>
          </div>

          <div className="flex flex-col text-sm text-gray-600 mt-2">
            <div className="truncate">{event.location}</div>

            <div className="truncate">
              {new Date(event.start).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>

            {event.registrationLink && (
              <a
                href={
                  event.registrationLink.startsWith("http")
                    ? event.registrationLink
                    : `https://${event.registrationLink}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline truncate"
              >
                Register Here
              </a>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <Image
            src={event.flyer && event.flyer.trim() !== "" ? event.flyer : "/assets/default-logo.png"}
            alt="Event Flyer"
            width={150}
            height={150}
            className="rounded-xl object-cover w-36 h-36"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default FeaturedEventCard;
