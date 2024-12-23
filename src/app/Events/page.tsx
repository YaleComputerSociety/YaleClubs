import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const EventsPage = () => {
  return (
    <div>
      <Header />
      <h1>Events</h1>
      <Footer />
    </div>
  );
};

function EventsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsPage />
    </Suspense>
  );
}

export default EventsPageWrapper;
