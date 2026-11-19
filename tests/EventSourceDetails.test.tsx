import { render, screen } from "@testing-library/react";
import EventSourceDetails from "@/components/events/EventSourceDetails";
import { formatEventTimeRange, generateGoogleCalendarLink } from "@/lib/utils";

describe("EventSourceDetails", () => {
  it("shows YaleConnect details and topics", () => {
    render(
      <EventSourceDetails
        event={{
          source: "yaleconnect" as any,
          eventType: "Lecture, Talk, or Panel",
          locationType: "Virtual" as any,
          foodProvided: true,
          hostCategory: "Politics and Society (Yale College RSO)",
          topics: ["Global Affairs", "Community"],
          externalLink: "https://yaleconnect.yale.edu/x/rsvp?id=1",
        }}
      />,
    );
    expect(screen.getByText("Lecture, Talk, or Panel")).toBeInTheDocument();
    expect(screen.getByText("Virtual")).toBeInTheDocument();
    expect(screen.getByText("Food provided")).toBeInTheDocument();
    expect(screen.getByText("Politics and Society (Yale College RSO)")).toBeInTheDocument();
    expect(screen.getByText("Global Affairs")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "YaleConnect" })).toHaveAttribute(
      "href",
      "https://yaleconnect.yale.edu/x/rsvp?id=1",
    );
  });

  it("renders nothing for a regular YaleClubs event", () => {
    const { container } = render(<EventSourceDetails event={{ source: "yaleclubs" as any, topics: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("event time helpers", () => {
  const start = new Date(2026, 10, 7, 19, 0);
  const sameDayEnd = new Date(2026, 10, 7, 21, 0);

  it("formats a same-day range as two times", () => {
    const text = formatEventTimeRange(start, sameDayEnd);
    expect(text).toContain("–");
    expect(text).not.toMatch(/Nov/);
  });

  it("includes dates for multi-day events", () => {
    expect(formatEventTimeRange(start, new Date(2026, 11, 19, 12, 0))).toMatch(/Nov.*–.*Dec/);
  });

  it("falls back to the start time with no valid end", () => {
    expect(formatEventTimeRange(start)).not.toContain("–");
    expect(formatEventTimeRange(start, new Date(2026, 10, 7, 18, 0))).not.toContain("–");
  });

  it("uses the real end time in Google Calendar links", () => {
    const link = generateGoogleCalendarLink({ name: "x", start, end: sameDayEnd, location: "l" } as any);
    const dates = new URL(link).searchParams.get("dates")!;
    const [s, e] = dates.split("/");
    expect(Number(e.slice(9, 11)) - Number(s.slice(9, 11))).toBe(2); // 2 hours long
  });
});
