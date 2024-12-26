import { IEvent } from "./models/Event";

export const getAdjustedNumMembers = (numMembers: number): string => {
  if (numMembers <= 10) {
    return "1 - 10";
  } else if (numMembers <= 25) {
    return "10 - 25";
  } else if (numMembers <= 50) {
    return "25-50";
  } else if (numMembers <= 100) {
    return "50-100";
  } else {
    return "100+";
  }
};

export const dbDateToFrontendDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function formatDateTime(date: Date | string): string {
  const validDate = date instanceof Date ? date : new Date(date);

  if (isNaN(validDate.getTime())) {
    throw new Error("Invalid date format. Ensure 'start' is a valid date.");
  }

  const isoString = validDate.toISOString();
  return isoString.replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generateGoogleCalendarLink(event: IEvent): string {
  const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";

  const startDate = new Date(event.start);
  const endDate = new Date(startDate);
  // one hour long event by default -- maybe we have custom end times in the future.
  endDate.setHours(startDate.getHours() + 1);

  const params = new URLSearchParams({
    text: event.name,
    details: event.description || "",
    location: event.location || "",
    dates: formatDateTime(event.start) + "/" + formatDateTime(endDate),
  });

  if (event.registrationLink) {
    params.set("details", `${event.description || ""}\nRegistration Link: ${event.registrationLink}`);
  }

  return `${baseUrl}&${params.toString()}`;
}
