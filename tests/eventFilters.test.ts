import { dateWindow, DEFAULT_FILTERS, eventTypesIn, filterEvents, sortEvents } from "@/lib/eventFilters";

// Wednesday, Nov 11 2026, 3:00 PM local time
const now = new Date(2026, 10, 11, 15, 0);
const at = (day: number, hour = 12) => new Date(2026, 10, day, hour, 0);

const ev = (name: string, start: Date, extra: Record<string, unknown> = {}) => ({ name, start, ...extra }) as any;

const events = [
  ev("Today talk", at(11, 18), {
    source: "yaleconnect",
    eventType: "Lecture, Talk, or Panel",
    locationType: "On-Campus",
  }),
  ev("Friday social", at(13, 20), { source: "yaleconnect", eventType: "Social", locationType: "Off-Campus" }),
  ev("Saturday game", at(14), { source: "yaleclubs" }),
  ev("Sunday webinar", at(15), {
    source: "yaleconnect",
    eventType: "Lecture, Talk, or Panel",
    locationType: "Virtual",
  }),
  ev("Next week meeting", at(18), {}), // older YaleClubs event with no source field
  ev("December show", new Date(2026, 11, 20, 19, 0), { source: "yaleconnect", eventType: "Performance" }),
];
const names = (list: any[]) => list.map((e) => e.name);

describe("dateWindow", () => {
  it("covers today, the rest of this week, and the weekend", () => {
    expect(dateWindow("today", now)).toEqual([at(11, 0), at(12, 0)]);
    expect(dateWindow("week", now)).toEqual([at(11, 0), at(16, 0)]); // through Sunday
    expect(dateWindow("weekend", now)).toEqual([at(14, 0), at(16, 0)]); // Sat + Sun
    expect(dateWindow("any", now)).toBeNull();
  });

  it("treats Sunday as part of the current weekend and week", () => {
    const sunday = at(15, 10);
    expect(dateWindow("weekend", sunday)).toEqual([at(15, 0), at(16, 0)]);
    expect(dateWindow("week", sunday)).toEqual([at(15, 0), at(16, 0)]);
  });
});

describe("filterEvents", () => {
  const f = (overrides: Partial<typeof DEFAULT_FILTERS>) =>
    names(filterEvents(events, { ...DEFAULT_FILTERS, ...overrides }, now));

  it("returns everything with default filters", () => {
    expect(f({})).toHaveLength(events.length);
  });

  it("filters by date", () => {
    expect(f({ date: "today" })).toEqual(["Today talk"]);
    expect(f({ date: "weekend" })).toEqual(["Saturday game", "Sunday webinar"]);
    expect(f({ date: "week" })).toEqual(["Today talk", "Friday social", "Saturday game", "Sunday webinar"]);
    expect(f({ date: "month" })).not.toContain("December show");
  });

  it("filters by source, treating events without one as YaleClubs", () => {
    expect(f({ source: "yaleclubs" })).toEqual(["Saturday game", "Next week meeting"]);
    expect(f({ source: "yaleconnect" })).toHaveLength(4);
  });

  it("filters by where and type, combined with other filters", () => {
    expect(f({ where: ["Virtual", "Off-Campus"] })).toEqual(["Friday social", "Sunday webinar"]);
    expect(f({ eventTypes: ["Lecture, Talk, or Panel"] })).toEqual(["Today talk", "Sunday webinar"]);
    expect(f({ eventTypes: ["Lecture, Talk, or Panel"], date: "weekend" })).toEqual(["Sunday webinar"]);
  });
});

describe("sortEvents", () => {
  const sample = [
    ev("b", at(14), { createdAt: at(1) }),
    ev("A", at(12), { createdAt: at(3) }),
    ev("c", at(13), { createdAt: at(2) }),
  ];

  it("sorts upcoming events", () => {
    expect(names(sortEvents(sample, "soonest"))).toEqual(["A", "c", "b"]);
    expect(names(sortEvents(sample, "latest"))).toEqual(["b", "c", "A"]);
    expect(names(sortEvents(sample, "recent"))).toEqual(["A", "c", "b"]);
    expect(names(sortEvents(sample, "name"))).toEqual(["A", "b", "c"]);
  });

  it("shows the most recent past events first by default", () => {
    expect(names(sortEvents(sample, "soonest", true))).toEqual(["b", "c", "A"]);
    expect(names(sortEvents(sample, "latest", true))).toEqual(["A", "c", "b"]);
  });

  it("does not modify the input", () => {
    const copy = [...sample];
    sortEvents(sample, "name");
    expect(sample).toEqual(copy);
  });
});

it("lists distinct event types", () => {
  expect(eventTypesIn(events)).toEqual(["Lecture, Talk, or Panel", "Performance", "Social"]);
});
