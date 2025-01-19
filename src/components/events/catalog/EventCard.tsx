"use client";

import React from "react";
import Image from "next/image";
import { IEvent, Tag } from "@/lib/models/Event";
import { TagBlock } from "./TagBlock";

type EventCardProps = {
  event: IEvent;
  onClick: () => void;
};

const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <div className="w-60 p-4 flex flex-col cursor-pointer  rounded-lg" onClick={onClick}>
      {/* Main Image Section */}
      <div className="h-60 w-full relative mb-4 border border-gray-100 rounded-lg">
        <Image
          src={event.flyer && event.flyer.trim() !== "" ? event.flyer : "/assets/default-background.png"}
          alt="Event Flyer"
          fill
          className="rounded-xl object-cover"
          priority
        />
      </div>

      {/* Content Section - now matches image width */}
      <div className="flex flex-col gap-y-1 w-full">
        <div className="text-2xl font-semibold line-clamp-1">{event.name}</div>

        <div className="text-md font-bold text-gray-600 line-clamp-1">
          {event.clubs?.length ? event.clubs.join(" x ") : "No clubs listed"}
        </div>
        <div className="flex gap-2 w-full scrollbar-hide overflow-x-auto whitespace-nowrap">
          {event.tags?.map((tag: Tag, index) => <TagBlock key={index} tag={tag} />)}
        </div>
        {/* 
        <div className="text-sm text-gray-600 text-right mt-auto">
          <div className="truncate">{event.location}</div>
          <div className="truncate">
            {new Date(event.start).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default EventCard;
