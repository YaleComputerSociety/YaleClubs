"use client";

import { IEvent } from "@/lib/models/Event";

type EventLocationProps = {
  event: {
    location: IEvent["location"];
    locationHidden?: boolean | undefined;
    externalLink?: string | undefined;
  };
  className?: string;
};

/**
 * Shows an event's location. YaleConnect hides some locations from its public feed;
 * for those we link to the event's YaleConnect page, where signed-in students can see it.
 */
const EventLocation = ({ event, className }: EventLocationProps) => {
  if (event.locationHidden && event.externalLink) {
    return (
      <a
        href={event.externalLink}
        target="_blank"
        rel="noopener noreferrer"
        // Cards open a modal on click; don't trigger that when following the link.
        onClick={(e) => e.stopPropagation()}
        className={`underline underline-offset-2 hover:opacity-80 ${className ?? ""}`}
      >
        View location on YaleConnect ↗
      </a>
    );
  }
  return <div className={className}>{event.location}</div>;
};

export default EventLocation;
