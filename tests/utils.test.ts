import {
  getAdjustedNumMembers,
  getAdjustedWebsite,
  dbDateToFrontendDate,
  getInstagramLink,
  getModifiedInstagram,
  generateGoogleCalendarLink,
  objectToFormData,
} from "../src/lib/utils";

describe("getAdjustedNumMembers", () => {
  it("returns '1 - 15' for numbers <= 15", () => {
    expect(getAdjustedNumMembers(1)).toBe("1 - 15");
    expect(getAdjustedNumMembers(15)).toBe("1 - 15");
    expect(getAdjustedNumMembers(10)).toBe("1 - 15");
  });

  it("returns '15 - 30' for numbers between 16 and 30", () => {
    expect(getAdjustedNumMembers(16)).toBe("15 - 30");
    expect(getAdjustedNumMembers(30)).toBe("15 - 30");
    expect(getAdjustedNumMembers(25)).toBe("15 - 30");
  });

  it("returns '30 - 50' for numbers between 31 and 50", () => {
    expect(getAdjustedNumMembers(31)).toBe("30 - 50");
    expect(getAdjustedNumMembers(50)).toBe("30 - 50");
    expect(getAdjustedNumMembers(40)).toBe("30 - 50");
  });

  it("returns '50 - 100' for numbers between 51 and 100", () => {
    expect(getAdjustedNumMembers(51)).toBe("50 - 100");
    expect(getAdjustedNumMembers(100)).toBe("50 - 100");
    expect(getAdjustedNumMembers(75)).toBe("50 - 100");
  });

  it("returns '100+' for numbers > 100", () => {
    expect(getAdjustedNumMembers(101)).toBe("100+");
    expect(getAdjustedNumMembers(500)).toBe("100+");
    expect(getAdjustedNumMembers(1000)).toBe("100+");
  });
});

describe("getAdjustedWebsite", () => {
  it("returns 'No website' for undefined", () => {
    expect(getAdjustedWebsite(undefined)).toBe("No website");
  });

  it("returns 'No website' for empty string", () => {
    expect(getAdjustedWebsite("")).toBe("No website");
  });

  it("removes https:// from URL", () => {
    expect(getAdjustedWebsite("https://example.com")).toBe("example.com");
  });

  it("removes http:// from URL", () => {
    expect(getAdjustedWebsite("http://example.com")).toBe("example.com");
  });

  it("handles URLs without protocol", () => {
    expect(getAdjustedWebsite("example.com")).toBe("example.com");
  });

  it("preserves path and query params", () => {
    expect(getAdjustedWebsite("https://example.com/path?query=1")).toBe("example.com/path?query=1");
  });
});

describe("dbDateToFrontendDate", () => {
  it("formats date to YYYY-MM-DDTHH:mm format", () => {
    const date = new Date("2024-06-15T14:30:00");
    const result = dbDateToFrontendDate(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it("pads single digit months and days with zeros", () => {
    const date = new Date("2024-01-05T09:05:00");
    const result = dbDateToFrontendDate(date);
    expect(result).toContain("-01-");
    expect(result).toContain("-05T");
  });
});

describe("getInstagramLink", () => {
  it("returns empty string for undefined", () => {
    expect(getInstagramLink(undefined)).toBe("");
  });

  it("creates Instagram URL from username", () => {
    expect(getInstagramLink("yaleclubs")).toBe("https://www.instagram.com/yaleclubs/");
  });

  it("removes @ symbol from username", () => {
    expect(getInstagramLink("@yaleclubs")).toBe("https://www.instagram.com/yaleclubs/");
  });
});

describe("getModifiedInstagram", () => {
  it("returns undefined for undefined input", () => {
    expect(getModifiedInstagram(undefined)).toBeUndefined();
  });

  it("adds @ prefix if missing", () => {
    expect(getModifiedInstagram("yaleclubs")).toBe("@yaleclubs");
  });

  it("keeps @ prefix if already present", () => {
    expect(getModifiedInstagram("@yaleclubs")).toBe("@yaleclubs");
  });
});

describe("generateGoogleCalendarLink", () => {
  const mockEvent = {
    _id: "123",
    name: "Test Event",
    description: "Test Description",
    location: "Yale Campus",
    start: new Date("2024-06-15T14:00:00Z"),
    clubId: "club123",
    tags: [],
  };

  it("generates a valid Google Calendar URL", () => {
    const link = generateGoogleCalendarLink(mockEvent as any);
    expect(link).toContain("https://calendar.google.com/calendar/render");
    expect(link).toContain("action=TEMPLATE");
  });

  it("includes event name in URL", () => {
    const link = generateGoogleCalendarLink(mockEvent as any);
    expect(link).toContain("text=Test+Event");
  });

  it("includes location in URL", () => {
    const link = generateGoogleCalendarLink(mockEvent as any);
    expect(link).toContain("location=Yale+Campus");
  });

  it("includes description in URL", () => {
    const link = generateGoogleCalendarLink(mockEvent as any);
    expect(link).toContain("details=Test+Description");
  });

  it("includes registration link in details when present", () => {
    const eventWithRegistration = {
      ...mockEvent,
      registrationLink: "https://register.com",
    };
    const link = generateGoogleCalendarLink(eventWithRegistration as any);
    expect(link).toContain("Registration+Link");
  });
});

describe("objectToFormData", () => {
  it("converts simple object to FormData", () => {
    const obj = { name: "Test", value: 123 };
    const formData = objectToFormData(obj);

    expect(formData.get("name")).toBe("Test");
    expect(formData.get("value")).toBe("123");
  });

  it("ignores null and undefined values", () => {
    const obj = { name: "Test", empty: null, missing: undefined };
    const formData = objectToFormData(obj);

    expect(formData.get("name")).toBe("Test");
    expect(formData.get("empty")).toBeNull();
    expect(formData.get("missing")).toBeNull();
  });

  it("handles arrays of primitives", () => {
    const obj = { tags: ["a", "b", "c"] };
    const formData = objectToFormData(obj);

    expect(formData.get("tags[0]")).toBe("a");
    expect(formData.get("tags[1]")).toBe("b");
    expect(formData.get("tags[2]")).toBe("c");
  });

  it("serializes arrays of objects as JSON", () => {
    const obj = { items: [{ id: 1 }, { id: 2 }] };
    const formData = objectToFormData(obj);

    expect(formData.get("items")).toBe(JSON.stringify([{ id: 1 }, { id: 2 }]));
  });

  it("serializes nested objects as JSON", () => {
    const obj = { nested: { key: "value" } };
    const formData = objectToFormData(obj);

    expect(formData.get("nested")).toBe(JSON.stringify({ key: "value" }));
  });
});
