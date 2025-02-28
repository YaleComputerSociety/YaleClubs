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
    <div onClick={onClick} className="flex flex-col cursor-pointer rounded-lg">
      <div className="aspect-square relative mb-4 border border-gray-100 rounded-lg">
        <Image
          src={event.flyer && event.flyer.trim() !== "" ? event.flyer : "/assets/default-background.png"}
          alt="Event Flyer"
          fill
          className="rounded-xl object-cover"
          priority
        />
        {event.frequency != null ? (
          <div className="absolute bottom-0 right-0 p-4">
            <Image
              src="/assets/icon.png"
              alt="Icon"
              className="object-cover rounded-lg"
              width={50}
              height={50}
              priority
            />
          </div>
        ) : (
          <div></div>
        )}
      </div>

      <div className="flex flex-col gap-y-1">
        <div className="text-lg font-semibold line-clamp-1">{event.name}</div>
        <div className="text-sm font-bold text-gray-600 line-clamp-1">
          {event.clubs?.length ? event.clubs.join(" x ") : "No clubs listed"}
        </div>

        <div className="flex flex-col text-sm mb-2">
          <div className="truncate">{event.location}</div>
          <div className="truncate">
            {event.frequency != null && event.frequency.length != 0
              ? new Date(event.start).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : new Date(event.start).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
          </div>
        </div>
        <div className="flex gap-1 scrollbar-hide overflow-x-auto">
          {event.tags?.slice(0, 2).map((tag: Tag, index) => <TagBlock key={index} tag={tag} />)}
        </div>
      </div>
    </div>
  );
};
export default EventCard;
