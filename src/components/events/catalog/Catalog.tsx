import React, { useState } from "react";
import EventCard from "./EventCard";
import FeaturedEventCard from "./FeaturedEventCard";
import { IEvent } from "@/lib/models/Event";
import EventModal from "./EventModal";
import { IClub } from "@/lib/models/Club";

interface CatalogProps {
  clubs: IClub[];
  events: IEvent[];
  isLoading: boolean;
}

const Catalog = ({ events, clubs, isLoading }: CatalogProps) => {
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  const handleClickEvent = (event: IEvent) => setSelectedEvent(event);

  const handleCloseModal = () => setSelectedEvent(null);

  return (
    <div className="mt-1 md:mt-4">
      {isLoading ? (
        <div className="flex justify-center items-center mt-10">
          <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No results found.</div>
      ) : (
        <div className="grid gap-5 md:gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FeaturedEventCard event={events[0]} onClick={() => handleClickEvent(events[0])} />
            </div>

            <div className="flex flex-col gap-4">
              {events.slice(1, 2).map((event) => (
                <EventCard key={event._id} event={event} onClick={() => handleClickEvent(event)} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {events.slice(2).map((event) => (
              <EventCard key={event._id} event={event} onClick={() => handleClickEvent(event)} />
            ))}

            {selectedEvent && (
              <EventModal
                associatedClubLeaders={clubs
                  .filter((club) => {
                    return selectedEvent.clubs?.includes(club.name);
                  })
                  .flatMap((club) => club.leaders)}
                event={selectedEvent}
                onClose={handleCloseModal}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
