import { IEvent } from "./models/Event";

export const getAdjustedNumMembers = (numMembers: number): string => {
  if (numMembers <= 15) {
    return "1 - 15";
  } else if (numMembers <= 30) {
    return "15 - 30";
  } else if (numMembers <= 50) {
    return "30 - 50";
  } else if (numMembers <= 100) {
    return "50 - 100";
  } else {
    return "100+";
  }
};

export const getAdjustedWebsite = (website: string | undefined): string => {
  if (!website) {
    return "No website";
  }
  return website.replace(/(^\w+:|^)\/\//, "");
};

export const dbDateToFrontendDate = (date: Date) => {
  const localDate = new Date(date);

  // Get the local time components
  const year = localDate.getFullYear();
  const month = (localDate.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
  const day = localDate.getDate().toString().padStart(2, "0");
  const hours = localDate.getHours().toString().padStart(2, "0");
  const minutes = localDate.getMinutes().toString().padStart(2, "0");

  // Format in the 'YYYY-MM-DDTHH:mm' format
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const getInstagramLink = (username: string | undefined): string => {
  if (!username) {
    return "";
  }

  const sanitizedUsername = username.startsWith("@") ? username.slice(1) : username;

  return `https://www.instagram.com/${sanitizedUsername}/`;
};

export const getModifiedInstagram = (username: string | undefined): string | undefined => {
  if (!username) {
    return undefined;
  }

  return username.startsWith("@") ? username : `@${username}`;
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
