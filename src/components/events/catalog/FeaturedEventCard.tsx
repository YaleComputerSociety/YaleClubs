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
    <div className="relative w-full h-96 rounded-xl overflow-hidden cursor-pointer group" onClick={onClick}>
      <Image
        src={event?.flyer && event?.flyer.trim() !== "" ? event?.flyer : "/assets/default-background.png"}
        alt="Event Flyer"
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        priority
      />

      <>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </>
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="text-3xl font-bold text-white  line-clamp-2">{event.name}</div>

        <div className="text-lg font-semibold text-gray-200 mline-clamp-1 mb-2">
          {event.clubs?.length ? event.clubs.join(" x ") : "No clubs listed"}
        </div>

        <div className="flex flex-col text-sm text-white mb-2">
          <div className="truncate">{event.location}</div>
          <div className="truncate">
            {new Date(event.start).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
        </div>
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide whitespace-nowrap">
          {event.tags?.map((tag: Tag, index) => <TagBlock key={index} tag={tag} />)}
        </div>
      </div>
    </div>
  );
};

export default FeaturedEventCard;
