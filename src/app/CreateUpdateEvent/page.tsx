"use client";

import React, { useEffect, useState, Suspense } from "react";
import { dbDateToFrontendDate } from "@/lib/utils";

import { IEvent, IEventInput, Tag } from "@/lib/models/Event";
import Header from "@/components/Header";
import AddFlyerSection from "@/components/events/update/AddFlyerSection";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Footer from "@/components/Footer";
import Filter from "@/components/Filter";
import { getCookie } from "cookies-next";
import { useSearchParams } from "next/navigation";
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  LOCATION_MIN_LENGTH,
  LOCATION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  MAX_NUMBER_OF_EVENTS_PER_MONTH,
} from "@/components/events/constants";
import Link from "next/link";
import { IClub } from "@/lib/models/Club";

const CreateUpdateEventPage = () => {
  const searchParams = useSearchParams();
  const [updatingAlreadyMadeEvent, setUpdatingAlreadyMadeEvent] = useState(false);
  const [, setEvent] = useState<IEvent | null>(null);
  const [clubs, setClubs] = useState<IClub[]>([]);
  const [availeHostClubs, setAvailHostClubs] = useState<string[]>([]);
  const [numberOfEventsLeft, setNumberOfEventsLeft] = useState(MAX_NUMBER_OF_EVENTS_PER_MONTH);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<IEventInput>({
    name: "",
    description: "",
    clubs: [],
    start: new Date(),
    location: "",
    registrationLink: "",
    flyer: "",
    tags: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);

  const [userEmail, setUserEmail] = useState<string | null>(null);

  // const admin_emails = [
  //   "lucas.huang@yale.edu",
  //   "addison.goolsbee@yale.edu",
  //   "francis.fan@yale.edu",
  //   "grady.yu@yale.edu",
  //   "lauren.lee.ll2243@yale.edu",
  //   "ethan.mathieu@yale.edu",
  // ];

  const validateInput = React.useCallback(
    (field: keyof IEventInput, value: string | Tag[] | Date | string[] | undefined): string => {
      switch (field) {
        case "name":
          if (value instanceof Date) return "Name must be a string.";
          if (value === undefined) return "Name is required.";
          if (!value) return "Name is required.";
          if (value.length < NAME_MIN_LENGTH) return `Name must be at least ${NAME_MIN_LENGTH} characters.`;
          if (value.length > NAME_MAX_LENGTH) return `Name must be at most ${NAME_MAX_LENGTH} characters.`;
          return "";
        case "description":
          if (value instanceof Date) return "Description must be a string.";
          if (value === undefined) return "Description is required.";
          if (value.length < DESCRIPTION_MIN_LENGTH)
            return `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters.`;
          if (value.length > DESCRIPTION_MAX_LENGTH)
            return `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.`;
          return "";
        case "clubs":
          if (value === undefined) return "Must provide a club";
          if (value instanceof Array && value.length == 0) return "Must provide a club";
          return "";
        case "location":
          if (value instanceof Date) return "Location must be a string.";
          if (value === undefined) return "Location is required.";
          if (value.length < LOCATION_MIN_LENGTH) return `Location must be at least ${LOCATION_MIN_LENGTH} characters.`;
          if (value.length > LOCATION_MAX_LENGTH) return `Location must be at most ${LOCATION_MAX_LENGTH} characters.`;
          return "";
        case "registrationLink": {
          if (!value) return "";
          const urlRegex = /^https?:\/\/([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(\/[^\s]*)?$/;
          if (typeof value === "string" && !urlRegex.test(value)) return "URL must start with http:// or https://.";
          return "";
        }
        case "flyer":
          return "";
        case "tags":
          return "";
        default:
          return "";
      }
    },
    [],
  );

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch("/api/events");
        const allEvents: IEvent[] = await response.json();
        const eventId = searchParams.get("eventId");

        if (eventId) {
          setUpdatingAlreadyMadeEvent(true);
          const specificEvent = allEvents.find((event: IEvent) => event._id === eventId);
          if (specificEvent) {
            const eventInput: IEventInput = {
              name: specificEvent.name || "",
              description: specificEvent.description || "",
              clubs: specificEvent.clubs || "",
              start: specificEvent.start || new Date(),
              location: specificEvent.location || "",
              registrationLink: specificEvent.registrationLink || "",
              flyer: specificEvent.flyer || "",
              tags: specificEvent.tags || [],
              createdBy: specificEvent.createdBy || "",
            };
            setEvent(specificEvent);
            setFormData(eventInput);
            setSelectedClubs(eventInput.clubs);
            setSelectedTags(eventInput.tags?.map((tag) => tag.toString()) ?? []);
          }
        }
      } catch {
        console.error("Failed to fetch events.");
      }
    };

    const fetchClubData = async () => {
      try {
        const response = await axios.get<IClub[]>("/api/clubs");
        const clubs = response.data;
        setClubs(clubs);
      } catch {
        console.error("Failed to fetch clubs.");
      }
    };

    // Get user email first, then fetch data in parallel
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode<{ email: string; netid: string }>(token);
      const email = decoded.netid === "efm28" ? "ethan.mathieu@yale.edu" : decoded.email;
      setUserEmail(email);

      Promise.all([fetchEventData(), fetchClubData()])
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [searchParams]);

  useEffect(() => {
    if (clubs.length > 0 && userEmail) {
      const availableClubs = clubs
        .filter((club) => club.leaders.map((leader) => leader.email).includes(userEmail))
        .map((club) => club.name);
      setAvailHostClubs(availableClubs);
    }
  }, [clubs, userEmail]);

  useEffect(() => {
    const fetchEventsCount = async () => {
      try {
        const response = await axios.get<IEvent[]>("/api/events");
        const allEvents = response.data;
        const oneMonthAgo = new Date(formData.start);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        // first event is the considered the anchor event that dictates if you have events left
        const eventsInLastMonth = allEvents.filter((event) => {
          const eventDate = new Date(event.start);
          return eventDate >= oneMonthAgo && event.clubs.some((club) => selectedClubs[0] === club);
        });

        setNumberOfEventsLeft(Math.max(MAX_NUMBER_OF_EVENTS_PER_MONTH - eventsInLastMonth.length, 0));
      } catch {
        console.error("Failed to fetch events count.");
      }
    };

    if (selectedClubs.length > 0) {
      fetchEventsCount();
    } else {
      setNumberOfEventsLeft(MAX_NUMBER_OF_EVENTS_PER_MONTH);
    }
  }, [selectedClubs, formData.start]);

  const handleChange = React.useCallback(
    (field: keyof IEventInput, value: string | Date | Tag[] | string[] | undefined) => {
      const error = validateInput(field as keyof IEventInput, value !== undefined ? value : "");
      setValidationErrors((prev) => ({ ...prev, [field]: error }));
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [validateInput],
  );

  const handleSave = () => {
    const errors = Object.keys(formData).reduce(
      (acc, field) => {
        const value = formData[field as keyof IEventInput];
        const error = validateInput(field as keyof IEventInput, value !== undefined ? String(value) : "");
        if (error) acc[field] = error;
        return acc;
      },
      {} as Record<string, string>,
    );

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      console.error("Form has validation errors:", errors);
      alert("Please fill out all required fields and adhere to all form field length requirements.");
      return;
    }

    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof IEventInput];
      if (typeof value === "string" && value.trim() === "") {
        delete formData[key as keyof IEventInput];
      }
      if (typeof value === "number" && value === 0) {
        delete formData[key as keyof IEventInput];
      }
    });

    const token = getCookie("token");
    if ((token && numberOfEventsLeft > 0) || (token && updatingAlreadyMadeEvent)) {
      const url = updatingAlreadyMadeEvent ? `/api/events?id=${searchParams.get("eventId")}` : `/api/events`;
      fetch(url, {
        method: updatingAlreadyMadeEvent ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (response.status === 200) {
            window.location.href = "/Events";
          } else {
            alert("Failed to create/update event - check form for errors");
          }
        })
        .catch((error) => {
          console.error("Error updating event:", error);
          alert("Failed to create/update event - check form for errors");
        });
    } else {
      alert("Out of events for that club");
    }
  };

  useEffect(() => {
    const dateTimeInput = document.querySelector('input[type="datetime-local"]');
    dateTimeInput?.addEventListener("change", (e) => {
      const value = (e.target as HTMLInputElement)?.value;
      handleChange("start", value);
    });

    return () => {
      dateTimeInput?.removeEventListener("change", () => {});
    };
  }, [handleChange]);

  useEffect(() => {
    handleChange("clubs", selectedClubs);
  }, [selectedClubs, handleChange]);

  useEffect(() => {
    handleChange("tags", selectedTags);
  }, [selectedTags, handleChange]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex py-6 justify-center mt-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-100 rounded-lg shadow-md p-8 w-full max-w-6xl h-full">
          <div className="flex items-center justify-between px-0 mb-4 mt">
            <Link href={`/Events`}>
              <button className="text-gray-400 py-2 px-4 rounded-lg">Back</button>
            </Link>
            <div className="flex items-center space-x-4 justify-center flex-grow">
              <h1 className="text-3xl font-bold text-center pb-2">
                {updatingAlreadyMadeEvent ? "Edit" : "Create"} an Event
              </h1>
            </div>
            <div className="w-16"></div>
          </div>
          <div className="flex items-center justify-center text-lg">Event Flyer</div>

          <div className="flex items-center justify-center m-4">
            <AddFlyerSection formData={formData} handleChange={handleChange} />
          </div>

          <div className="flex items-center justify-center m-3 text-gray-500">
            Note: Events with a flyer have a higher chance of being featured!
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="text-red-600 m-0">*</div>
                <input
                  type="text"
                  value={formData.name ?? ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Event Name"
                />
              </label>
              {validationErrors.name && <p className="text-red-500">{validationErrors.name}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-red-600 m-0">*</div>
                <Filter
                  selectedItems={selectedClubs}
                  setSelectedItems={setSelectedClubs}
                  allItems={availeHostClubs}
                  label="Hosting club(s)"
                />
                {validationErrors.clubs && <p className="text-red-500">{validationErrors.clubs}</p>}
              </div>
              <div>
                <div className="m-6"></div>
                <Filter
                  selectedItems={selectedTags}
                  setSelectedItems={setSelectedTags}
                  allItems={Object.values(Tag).slice(1)}
                  label="Tags"
                />
              </div>
            </div>
            <div>
              <div className="text-red-600 m-0">*</div>
              <textarea
                value={formData.description ?? ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Event Description"
                rows={9}
              ></textarea>
              {validationErrors.description && <p className="text-red-500">{validationErrors.description}</p>}
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <div className="text-red-600">*</div>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2 [&::-webkit-datetime-edit-day-field]:disabled:text-gray-300 [&::-webkit-datetime-edit-month-field]:disabled:text-gray-300 [&::-webkit-datetime-edit-year-field]:disabled:text-gray-300 [&::-webkit-datetime-edit-hour-field]:disabled:text-gray-300 [&::-webkit-datetime-edit-minute-field]:disabled:text-gray-300"
                  aria-label="Date and time"
                  type="datetime-local"
                  min={dbDateToFrontendDate(new Date())}
                  onChange={(e) => {
                    const selectedDate = new Date(e.target.value);
                    const now = new Date();
                    if (selectedDate < now) {
                      e.target.value = dbDateToFrontendDate(now);
                      handleChange("start", now);
                    } else {
                      console.log(e.target.value);
                      const utcDate = new Date(selectedDate.getTime());
                      handleChange("start", utcDate);
                    }
                  }}
                  value={dbDateToFrontendDate(new Date(formData.start))}
                />
                {validationErrors.start && <p className="text-red-500">{validationErrors.start}</p>}
              </div>
              <div>
                <div className="text-red-600 m-0">*</div>

                <input
                  type="text"
                  value={formData.location ?? ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Location"
                ></input>
                {validationErrors.location && <p className="text-red-500">{validationErrors.location}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={formData.registrationLink ?? ""}
                  onChange={(e) => handleChange("registrationLink", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Registration Link"
                ></input>
                {validationErrors.registrationLink && (
                  <p className="text-red-500">{validationErrors.registrationLink}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4 mt-2 flex items-center gap-2 justify-end">
            {!updatingAlreadyMadeEvent && selectedClubs.length != 0 && (
              <p>
                Your club only has{" "}
                <span
                  className={`${numberOfEventsLeft === 0 || numberOfEventsLeft === 1 ? "font-bold text-red-500" : "font-bold"}`}
                >
                  {numberOfEventsLeft}
                </span>{" "}
                event(s) left this month.
              </p>
            )}
            <button onClick={handleSave} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
              Submit
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function EventsUpdatePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateUpdateEventPage />
    </Suspense>
  );
}

export default EventsUpdatePageWrapper;
