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
      <div className="flex flex-row-reverse gap-4 items-start">
        <div className="flex-shrink-0 self-stretch flex items-center">
          <Image
            src={event.flyer && event.flyer.trim() !== "" ? event.flyer : "/assets/default-logo.png"}
            alt="Event Flyer"
            width={200}
            height={200}
            className="rounded-xl object-cover w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36"
            priority
          />
        </div>

        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="text-2xl md:text-2xl font-semibold line-clamp-1">{event.name}</div>

            <div className="flex gap-2 mt-1 scrollbar-hide w-4/5 overflow-x-auto whitespace-nowrap">
              <TagBlock tag={Tag.FeaturedEvent} />
              {event.tags?.map((tag: Tag, index) => <TagBlock key={index} tag={tag} />)}
            </div>

            <div className="text-md font-semibold w-4/5 text-gray-600 mt-1 line-clamp-1 overflow-hidden">
              {event.clubs?.length ? event.clubs.join(" x ") : "No clubs listed"}
            </div>
          </div>

          <div className="flex flex-col text-sm text-gray-600 mt-4 overflow-hidden">
            <div className="truncate">{event.location}</div>

            <div className="truncate">
              {new Date(event.start).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* <div className="w-full rounded-lg bg-indigo-500 text-white text-center text-xs font-bold py-1 mt-3">Event</div> */}
    </div>
  );
};

export default FeaturedEventCard;
