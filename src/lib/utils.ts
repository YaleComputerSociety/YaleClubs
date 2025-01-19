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
