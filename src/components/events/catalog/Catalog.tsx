import React, { useState } from "react";
import EventCard from "./EventCard";
import FeaturedEventCard from "./FeaturedEventCard";
import { IEvent } from "@/lib/models/Event";
import EventModal from "./EventModal";
import { IClub } from "@/lib/models/Club";
import Carousel from "./Carousel";

interface CatalogProps {
  clubs: IClub[];
  events: IEvent[];
  isLoading: boolean;
}

const Catalog = ({ events, clubs, isLoading }: CatalogProps) => {
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  const handleClickEvent = (event: IEvent) => setSelectedEvent(event);

  const handleCloseModal = () => setSelectedEvent(null);

  const featuredEvents = events.slice(0, 2);
  const otherEvents = events.slice(2);

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center mt-10">
          <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No Upcoming Events found - if you&apos;re a club leader click Create Event to get started!
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* <div>
            {featuredEvents.map((event) => (
              <FeaturedEventCard key={event._id} event={event} onClick={() => handleClickEvent(event)} />
            ))}
          </div> */}

          <Carousel items={featuredEvents} ItemComponent={FeaturedEventCard} />

          <div>
            <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>
            <div className="flex flex-wrap gap-3 justify-start">
              {otherEvents.map((event) => (
                <EventCard key={event._id} event={event} onClick={() => handleClickEvent(event)} />
              ))}
            </div>
          </div>

          {selectedEvent && (
            <EventModal
              associatedClubLeaders={clubs
                .filter((club) => selectedEvent.clubs?.includes(club.name))
                .flatMap((club) => club.leaders)}
              event={selectedEvent}
              onClose={handleCloseModal}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Catalog;
