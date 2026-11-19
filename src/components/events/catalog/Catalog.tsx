import { useState } from "react";
import EventCard from "./EventCard";
import FeaturedEventCard from "./FeaturedEventCard";
import { IEvent } from "@/lib/models/Event";
import EventModal from "./EventModal";
import { IClub } from "@/lib/models/Club";
import Carousel from "./Carousel";

interface EventCatalogProps {
  clubs: IClub[];
  upcomingEvents: IEvent[];
  pastEvents: IEvent[];
  featuredEvents: IEvent[];
  isLoading: boolean;
  showFeatured: boolean;
  skeletonCount: number;
  isMobile: boolean;
}

const SkeletonCard = () => (
  <div className="bg-white/5 rounded-lg p-4 h-64 animate-pulse">
    <div className="w-full h-32 bg-gray-300/20 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-300/20 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300/20 rounded w-1/2 mb-4"></div>
    <div className="flex gap-2">
      <div className="h-6 bg-gray-300/20 rounded w-24"></div>
      <div className="h-6 bg-gray-300/20 rounded w-24"></div>
    </div>
  </div>
);

const SkeletonFeatured = () => (
  <div className="bg-white/5 rounded-lg p-6 h-96 animate-pulse">
    <div className="w-full h-48 bg-gray-300/20 rounded-lg mb-4"></div>
    <div className="h-6 bg-gray-300/20 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-300/20 rounded w-1/2 mb-4"></div>
    <div className="flex gap-3">
      <div className="h-8 bg-gray-300/20 rounded w-32"></div>
      <div className="h-8 bg-gray-300/20 rounded w-32"></div>
    </div>
  </div>
);

const Catalog = ({
  upcomingEvents,
  pastEvents,
  featuredEvents,
  clubs,
  isLoading,
  showFeatured,
  skeletonCount,
  isMobile,
}: EventCatalogProps) => {
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  const handleClickEvent = (event: IEvent) => setSelectedEvent(event);
  const handleCloseModal = () => setSelectedEvent(null);

  if (isLoading) {
    return (
      <div className="events-catalog">
        <div className="flex flex-col gap-8">
          {showFeatured && (
            <div className="w-full">
              <SkeletonFeatured />
            </div>
          )}
          <div>
            <h2 className="events-section-title">Upcoming Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(skeletonCount)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="events-section-title">Past Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(skeletonCount)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="events-catalog">
      <div className="flex flex-col gap-8">
        {upcomingEvents.length > 0 ? (
          <>
            {showFeatured && !isMobile && (
              <Carousel items={featuredEvents} ItemComponent={FeaturedEventCard} onItemClick={handleClickEvent} />
            )}

            <div>
              <h2 className="events-section-title">Upcoming Events</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event._id.toString()} event={event} onClick={() => handleClickEvent(event)} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>
            <h2 className="events-section-title">Upcoming Events</h2>
            <p className="events-empty-message">
              No upcoming events found -- if you are a club officer, click the{" "}
              <a href="/CreateUpdateEvent">Create Event</a> button!
            </p>
          </div>
        )}

        {pastEvents.length > 0 ? (
          <div>
            <h2 className="events-section-title">Past Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-60">
              {pastEvents.map((event) => (
                <EventCard key={event._id.toString()} event={event} onClick={() => handleClickEvent(event)} />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="events-section-title">Past Events</h2>

            <p className="events-empty-message">No past events found.</p>
          </div>
        )}

        {selectedEvent && (
          <EventModal
            associatedClubLeaders={clubs
              .filter((club) => selectedEvent.clubs?.includes(club.name))
              .flatMap((club) => club.leaders)}
            event={selectedEvent}
            onClose={handleCloseModal}
            associatedClubs={clubs.filter((club) => selectedEvent.clubs?.includes(club.name))}
          />
        )}
      </div>
    </div>
  );
};

export default Catalog;
