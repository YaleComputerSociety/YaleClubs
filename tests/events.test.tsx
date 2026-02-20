// Mock IEvent interface to avoid mongoose import issues
interface IEvent {
  _id: string;
  name: string;
  description?: string;
  location?: string;
  start: Date;
  clubId: string;
  tags: string[];
}

// Extracted utility functions from the Events page for testing
function getRandomThree(array: IEvent[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
}

function calculateSkeletonCount(windowWidth: number, windowHeight: number): number {
  const containerWidth = windowWidth - 40;
  let itemsPerRow;
  if (containerWidth < 640) itemsPerRow = 1;
  else if (containerWidth < 768) itemsPerRow = 2;
  else if (containerWidth < 1024) itemsPerRow = 3;
  else itemsPerRow = 4;

  const itemHeight = 256;
  const rowsThatFit = Math.ceil(windowHeight / itemHeight);
  const rowsToShow = rowsThatFit + 1;

  return itemsPerRow * rowsToShow;
}

function filterYaleCollegeClubs(clubs: any[]): any[] {
  return clubs
    .filter((club) => club.school === "Yale College")
    .sort((a, b) => a.name.localeCompare(b.name));
}

function splitEventsByTime(events: IEvent[], now: Date) {
  const upcoming = events
    .filter((event) => new Date(event.start) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const past = events
    .filter((event) => new Date(event.start) < now)
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

  return { upcoming, past };
}

describe("getRandomThree", () => {
  const createMockEvent = (id: string, name: string): IEvent => ({
    _id: id,
    name,
    description: `Description for ${name}`,
    location: "Test Location",
    start: new Date(),
    clubId: "club123",
    tags: [],
  });

  it("returns exactly 3 events when array has more than 3 events", () => {
    const events = [
      createMockEvent("1", "Event 1"),
      createMockEvent("2", "Event 2"),
      createMockEvent("3", "Event 3"),
      createMockEvent("4", "Event 4"),
      createMockEvent("5", "Event 5"),
    ];
    const result = getRandomThree(events);
    expect(result).toHaveLength(3);
  });

  it("returns all events when array has exactly 3 events", () => {
    const events = [
      createMockEvent("1", "Event 1"),
      createMockEvent("2", "Event 2"),
      createMockEvent("3", "Event 3"),
    ];
    const result = getRandomThree(events);
    expect(result).toHaveLength(3);
  });

  it("returns all events when array has fewer than 3 events", () => {
    const events = [createMockEvent("1", "Event 1"), createMockEvent("2", "Event 2")];
    const result = getRandomThree(events);
    expect(result).toHaveLength(2);
  });

  it("returns empty array when input is empty", () => {
    const result = getRandomThree([]);
    expect(result).toHaveLength(0);
  });

  it("returns 1 event when array has only 1 event", () => {
    const events = [createMockEvent("1", "Event 1")];
    const result = getRandomThree(events);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(events[0]);
  });

  it("does not mutate the original array", () => {
    const events = [
      createMockEvent("1", "Event 1"),
      createMockEvent("2", "Event 2"),
      createMockEvent("3", "Event 3"),
      createMockEvent("4", "Event 4"),
    ];
    const originalLength = events.length;
    const originalFirstEvent = events[0];

    getRandomThree(events);

    expect(events).toHaveLength(originalLength);
    expect(events[0]).toBe(originalFirstEvent);
  });

  it("returns valid events from the original array", () => {
    const events = [
      createMockEvent("1", "Event 1"),
      createMockEvent("2", "Event 2"),
      createMockEvent("3", "Event 3"),
      createMockEvent("4", "Event 4"),
    ];
    const result = getRandomThree(events);

    result.forEach((event) => {
      expect(events).toContainEqual(event);
    });
  });
});

describe("calculateSkeletonCount", () => {
  describe("mobile screens (< 640px)", () => {
    it("calculates correct skeleton count for small mobile screen", () => {
      const result = calculateSkeletonCount(375, 667); // iPhone SE dimensions
      expect(result).toBeGreaterThan(0);
      // With 1 item per row, 667px height / 256px item height = ~3 rows that fit, +1 = 4 rows
      expect(result).toBe(4); // 1 item per row * 4 rows
    });

    it("calculates correct skeleton count for large mobile screen", () => {
      const result = calculateSkeletonCount(414, 896); // iPhone 11 Pro Max dimensions
      expect(result).toBeGreaterThan(0);
      // 896px / 256px = ~4 rows that fit, +1 = 5 rows
      expect(result).toBe(5); // 1 item per row * 5 rows
    });
  });

  describe("tablet screens (640px - 767px)", () => {
    it("calculates correct skeleton count for small tablet", () => {
      const result = calculateSkeletonCount(640, 800);
      expect(result).toBeGreaterThan(0);
      // containerWidth = 640 - 40 = 600, which is < 640, so 1 item per row
      // 800px / 256px = ~4 rows, +1 = 5 rows
      expect(result).toBe(5); // 1 item per row * 5 rows
    });

    it("calculates correct skeleton count for iPad dimensions", () => {
      const result = calculateSkeletonCount(768, 1024);
      expect(result).toBeGreaterThan(0);
      // containerWidth = 768 - 40 = 728, which is < 768, so 2 items per row
      // 1024px / 256px = 4 rows, +1 = 5 rows
      expect(result).toBe(10); // 2 items per row * 5 rows
    });
  });

  describe("medium screens (768px - 1023px)", () => {
    it("calculates correct skeleton count for medium tablet", () => {
      const result = calculateSkeletonCount(800, 1024);
      expect(result).toBeGreaterThan(0);
      // containerWidth = 800 - 40 = 760, which is >= 640 and < 768, so 2 items per row
      // 1024px / 256px = 4 rows, +1 = 5 rows
      expect(result).toBe(10); // 2 items per row * 5 rows
    });

    it("calculates correct skeleton count for small laptop", () => {
      const result = calculateSkeletonCount(1000, 768);
      expect(result).toBeGreaterThan(0);
      // containerWidth = 1000 - 40 = 960, which is >= 768 and < 1024, so 3 items per row
      // 768px / 256px = 3 rows, +1 = 4 rows
      expect(result).toBe(12); // 3 items per row * 4 rows
    });
  });

  describe("large screens (>= 1024px)", () => {
    it("calculates correct skeleton count for desktop screen", () => {
      const result = calculateSkeletonCount(1920, 1080);
      expect(result).toBeGreaterThan(0);
      // 4 items per row, 1080px / 256px = ~5 rows, +1 = 6 rows
      expect(result).toBe(24); // 4 items per row * 6 rows
    });

    it("calculates correct skeleton count for large desktop", () => {
      const result = calculateSkeletonCount(2560, 1440);
      expect(result).toBeGreaterThan(0);
      // 4 items per row, 1440px / 256px = ~6 rows, +1 = 7 rows
      expect(result).toBe(28); // 4 items per row * 7 rows
    });

    it("calculates correct skeleton count for 4K screen", () => {
      const result = calculateSkeletonCount(3840, 2160);
      expect(result).toBeGreaterThan(0);
      // 4 items per row, 2160px / 256px = ~9 rows, +1 = 10 rows
      expect(result).toBe(40); // 4 items per row * 10 rows
    });
  });

  describe("edge cases", () => {
    it("handles very small window dimensions", () => {
      const result = calculateSkeletonCount(320, 480);
      expect(result).toBeGreaterThan(0);
    });

    it("handles very large window dimensions", () => {
      const result = calculateSkeletonCount(5120, 2880); // 5K display
      expect(result).toBeGreaterThan(0);
    });

    it("handles square dimensions", () => {
      const result = calculateSkeletonCount(1000, 1000);
      expect(result).toBeGreaterThan(0);
      // containerWidth = 1000 - 40 = 960, which is >= 768 and < 1024, so 3 items per row
      // 1000px / 256px = ~4 rows, +1 = 5 rows
      expect(result).toBe(15); // 3 items per row * 5 rows
    });
  });
});

describe("filterYaleCollegeClubs", () => {
  const createMockClub = (name: string, school: string) => ({
    _id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    school,
  });

  it("filters only Yale College clubs", () => {
    const clubs = [
      createMockClub("Yale CS", "Yale College"),
      createMockClub("Law Society", "Law School"),
      createMockClub("Drama Club", "Yale College"),
      createMockClub("Med Students", "School of Medicine"),
    ];

    const result = filterYaleCollegeClubs(clubs);
    expect(result).toHaveLength(2);
    expect(result.every((club) => club.school === "Yale College")).toBe(true);
  });

  it("sorts clubs alphabetically by name", () => {
    const clubs = [
      createMockClub("Zulu Club", "Yale College"),
      createMockClub("Alpha Club", "Yale College"),
      createMockClub("Beta Club", "Yale College"),
    ];

    const result = filterYaleCollegeClubs(clubs);
    expect(result[0].name).toBe("Alpha Club");
    expect(result[1].name).toBe("Beta Club");
    expect(result[2].name).toBe("Zulu Club");
  });

  it("returns empty array when no Yale College clubs exist", () => {
    const clubs = [
      createMockClub("Law Society", "Law School"),
      createMockClub("Med Students", "School of Medicine"),
    ];

    const result = filterYaleCollegeClubs(clubs);
    expect(result).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    const result = filterYaleCollegeClubs([]);
    expect(result).toHaveLength(0);
  });

  it("handles clubs with same name prefix correctly", () => {
    const clubs = [
      createMockClub("Computer Science Club", "Yale College"),
      createMockClub("Computer Club", "Yale College"),
      createMockClub("Computing Society", "Yale College"),
    ];

    const result = filterYaleCollegeClubs(clubs);
    expect(result[0].name).toBe("Computer Club");
    expect(result[1].name).toBe("Computer Science Club");
    expect(result[2].name).toBe("Computing Society");
  });
});

describe("splitEventsByTime", () => {
  const createMockEvent = (id: string, name: string, startDate: Date): IEvent => ({
    _id: id,
    name,
    description: `Description for ${name}`,
    location: "Test Location",
    start: startDate,
    clubId: "club123",
    tags: [],
  });

  describe("upcoming events", () => {
    it("filters events that start in the future", () => {
      const now = new Date("2024-06-15T12:00:00Z");
      const events = [
        createMockEvent("1", "Past Event", new Date("2024-06-14T12:00:00Z")),
        createMockEvent("2", "Future Event 1", new Date("2024-06-16T12:00:00Z")),
        createMockEvent("3", "Future Event 2", new Date("2024-06-17T12:00:00Z")),
      ];

      const { upcoming } = splitEventsByTime(events, now);
      expect(upcoming).toHaveLength(2);
      expect(upcoming.every((event) => new Date(event.start) >= now)).toBe(true);
    });

    it("sorts upcoming events in ascending order by start time", () => {
      const now = new Date("2024-06-15T12:00:00Z");
      const events = [
        createMockEvent("1", "Event C", new Date("2024-06-18T12:00:00Z")),
        createMockEvent("2", "Event A", new Date("2024-06-16T12:00:00Z")),
        createMockEvent("3", "Event B", new Date("2024-06-17T12:00:00Z")),
      ];

      const { upcoming } = splitEventsByTime(events, now);
      expect(upcoming[0]._id).toBe("2"); // Event A (June 16)
      expect(upcoming[1]._id).toBe("3"); // Event B (June 17)
      expect(upcoming[2]._id).toBe("1"); // Event C (June 18)
    });

    it("includes events starting exactly at current time", () => {
      const now = new Date("2024-06-15T12:00:00Z");
      const events = [createMockEvent("1", "Current Event", new Date("2024-06-15T12:00:00Z"))];

      const { upcoming } = splitEventsByTime(events, now);
      expect(upcoming).toHaveLength(1);
    });
  });

  describe("past events", () => {
    it("filters events that started in the past", () => {
      const now = new Date("2024-06-15T12:00:00Z");
      const events = [
        createMockEvent("1", "Past Event 1", new Date("2024-06-13T12:00:00Z")),
        createMockEvent("2", "Past Event 2", new Date("2024-06-14T12:00:00Z")),
        createMockEvent("3", "Future Event", new Date("2024-06-16T12:00:00Z")),
      ];

      const { past } = splitEventsByTime(events, now);
      expect(past).toHaveLength(2);
      expect(past.every((event) => new Date(event.start) < now)).toBe(true);
    });

    it("sorts past events in descending order by start time", () => {
      const now = new Date("2024-06-15T12:00:00Z");
      const events = [
        createMockEvent("1", "Event A", new Date("2024-06-11T12:00:00Z")),
        createMockEvent("2", "Event B", new Date("2024-06-13T12:00:00Z")),
        createMockEvent("3", "Event C", new Date("2024-06-12T12:00:00Z")),
      ];

      const { past } = splitEventsByTime(events, now);
      expect(past[0]._id).toBe("2"); // Event B (June 13) - most recent
      expect(past[1]._id).toBe("3"); // Event C (June 12)
      expect(past[2]._id).toBe("1"); // Event A (June 11) - oldest
    });

    it("excludes events starting exactly at current time", () => {
      const now = new Date("2024-06-15T12:00:00Z");
      const events = [createMockEvent("1", "Current Event", new Date("2024-06-15T12:00:00Z"))];

      const { past } = splitEventsByTime(events, now);
      expect(past).toHaveLength(0);
    });
  });

  describe("edge cases", () => {
    it("handles empty event array", () => {
      const now = new Date("2024-06-15T12:00:00Z");
      const { upcoming, past } = splitEventsByTime([], now);
      expect(upcoming).toHaveLength(0);
      expect(past).toHaveLength(0);
    });

    it("handles all events in the future", () => {
      const now = new Date("2024-06-15T12:00:00Z");
      const events = [
        createMockEvent("1", "Future Event 1", new Date("2024-06-16T12:00:00Z")),
        createMockEvent("2", "Future Event 2", new Date("2024-06-17T12:00:00Z")),
      ];

      const { upcoming, past } = splitEventsByTime(events, now);
      expect(upcoming).toHaveLength(2);
      expect(past).toHaveLength(0);
    });

    it("handles all events in the past", () => {
      const now = new Date("2024-06-15T12:00:00Z");
      const events = [
        createMockEvent("1", "Past Event 1", new Date("2024-06-13T12:00:00Z")),
        createMockEvent("2", "Past Event 2", new Date("2024-06-14T12:00:00Z")),
      ];

      const { upcoming, past } = splitEventsByTime(events, now);
      expect(upcoming).toHaveLength(0);
      expect(past).toHaveLength(2);
    });

    it("handles events with same start time", () => {
      const now = new Date("2024-06-15T12:00:00Z");
      const sameTime = new Date("2024-06-16T12:00:00Z");
      const events = [
        createMockEvent("1", "Event A", sameTime),
        createMockEvent("2", "Event B", sameTime),
        createMockEvent("3", "Event C", sameTime),
      ];

      const { upcoming } = splitEventsByTime(events, now);
      expect(upcoming).toHaveLength(3);
    });

    it("handles events spanning multiple months", () => {
      const now = new Date("2024-06-15T12:00:00Z");
      const events = [
        createMockEvent("1", "May Event", new Date("2024-05-20T12:00:00Z")),
        createMockEvent("2", "June Event", new Date("2024-06-20T12:00:00Z")),
        createMockEvent("3", "July Event", new Date("2024-07-20T12:00:00Z")),
      ];

      const { upcoming, past } = splitEventsByTime(events, now);
      expect(past).toHaveLength(1);
      expect(upcoming).toHaveLength(2);
    });

    it("handles events spanning multiple years", () => {
      const now = new Date("2024-06-15T12:00:00Z");
      const events = [
        createMockEvent("1", "Last Year Event", new Date("2023-12-20T12:00:00Z")),
        createMockEvent("2", "This Year Event", new Date("2024-12-20T12:00:00Z")),
        createMockEvent("3", "Next Year Event", new Date("2025-01-20T12:00:00Z")),
      ];

      const { upcoming, past } = splitEventsByTime(events, now);
      expect(past).toHaveLength(1);
      expect(upcoming).toHaveLength(2);
    });
  });
});
