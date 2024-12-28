import React, { useState } from "react";
import ClubCard from "./ClubCard";
import ClubModal from "./ClubModal";
import { IClub } from "@/lib/models/Club";
import { IEvent } from "@/lib/models/Event";
import FeaturedEventCard from "../events/catalog/FeaturedEventCard";
import EventModal from "../events/catalog/EventModal";

interface CatalogProps {
  featuredEvents?: IEvent[];
  clubs: IClub[];
  isLoading: boolean;
}

const Catalog = ({ clubs, featuredEvents, isLoading }: CatalogProps) => {
  const [selectedClub, setSelectedClub] = useState<IClub | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  const handleCloseModal = () => setSelectedClub(null);
  const handleCloseEventModal = () => setSelectedEvent(null);

  const handleClickEvent = (event: IEvent) => setSelectedEvent(event);

  const renderClubItem = (club: IClub) => <ClubCard key={club._id} club={club} onClick={() => setSelectedClub(club)} />;
  renderClubItem.displayName = "RenderClubItem";

  return (
    <div className="mt-1 md:mt-4">
      {isLoading ? (
        <div className="flex justify-center items-center mt-10">
          <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : isLoading === false && clubs.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No results found.</div>
      ) : (
        <div>
          {featuredEvents?.length === 1 ? (
            <div className="mb-7">
              <FeaturedEventCard
                key={featuredEvents[0]._id}
                event={featuredEvents[0]}
                onClick={() => handleClickEvent(featuredEvents[0])}
              />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-1 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-2 justify-items-center mb-7">
              {featuredEvents?.map((event) => (
                <FeaturedEventCard key={event._id} event={event} onClick={() => handleClickEvent(event)} />
              ))}
            </div>
          )}

          <div className="grid gap-5 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-items-center">
            {clubs.map(renderClubItem)}
          </div>
        </div>
      )}

      {/* Modals Rendered Outside of the Layout */}
      {selectedEvent && (
        <EventModal
          associatedClubLeaders={clubs
            .filter((club) => selectedEvent.clubs?.includes(club.name))
            .flatMap((club) => club.leaders)}
          event={selectedEvent}
          onClose={handleCloseEventModal}
        />
      )}
      {selectedClub && <ClubModal club={selectedClub} onClose={handleCloseModal} />}
    </div>
  );
};

export default Catalog;
