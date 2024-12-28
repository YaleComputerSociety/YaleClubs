"use client";

import React from "react";
import { IEvent, Tag } from "@/lib/models/Event";
import { TagBlock } from "./TagBlock";

type EventCardProps = {
  event: IEvent;
  onClick: () => void;
};

const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <div
      className="border border-gray-200 rounded-xl px-4 py-3 flex flex-col gap-2 w-full h-full cursor-pointer transition-shadow"
      onClick={onClick}
    >
      <div>
        <div className="text-2xl md:text-2xl font-semibold line-clamp-1">{event.name}</div>
        <div className="flex gap-2 w-full mt-1 scrollbar-hide overflow-x-auto whitespace-nowrap ">
          {event.tags?.map((tag: Tag, index) => <TagBlock key={index} tag={tag} />)}
        </div>

        <div className="text-md font-bold text-gray-600 mt-1 line-clamp-1 overflow-ellipsis">
          {event.clubs?.length ? event.clubs.join(" x ") : "No clubs listed"}
        </div>
      </div>

      <div className="text-sm text-gray-600 mt-auto">
        <div className="flex items-center justify-between">
          <div className="font-medium"></div>
          <div className="truncate">{event.location}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-medium"></div>
          <div className="truncate">
            {new Date(event.start).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
