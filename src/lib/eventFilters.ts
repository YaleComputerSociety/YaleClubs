// Type-only import: keeps mongoose (from the model file) out of client bundles that use this.
import type { IEvent } from "@/lib/models/Event";

/** Sorting and filtering for the Events page. Pure functions so they can be unit-tested. */

export const SORT_OPTIONS = {
  soonest: "Soonest first",
  latest: "Latest first",
  recent: "Recently added",
  name: "Name (A–Z)",
} as const;
export type SortOption = keyof typeof SORT_OPTIONS;

export const DATE_OPTIONS = {
  any: "Any date",
  today: "Today",
  week: "This week",
  weekend: "This weekend",
  month: "Next 30 days",
} as const;
export type DateOption = keyof typeof DATE_OPTIONS;

export const SOURCE_OPTIONS = {
  all: "All sources",
  yaleclubs: "YaleClubs",
  yaleconnect: "YaleConnect",
} as const;
export type SourceOption = keyof typeof SOURCE_OPTIONS;

export const WHERE_OPTIONS = ["On-Campus", "Off-Campus", "Virtual"] as const;
export const WHERE_LABELS: Record<(typeof WHERE_OPTIONS)[number], string> = {
  "On-Campus": "On campus",
  "Off-Campus": "Off campus",
  Virtual: "Virtual",
};

export interface EventFilterOptions {
  date: DateOption;
  source: SourceOption;
  /** Values from WHERE_OPTIONS; empty means any. */
  where: string[];
  /** Event types (e.g. "Social"); empty means any. */
  eventTypes: string[];
}

export const DEFAULT_FILTERS: EventFilterOptions = { date: "any", source: "all", where: [], eventTypes: [] };

type FilterableEvent = Pick<IEvent, "name" | "start" | "source" | "locationType" | "eventType"> & {
  createdAt?: Date | string;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/**
 * The [from, to) window for a date option, in the viewer's local time.
 * "This week" runs through Sunday; "This weekend" is the coming (or current) Saturday and Sunday.
 */
export function dateWindow(option: DateOption, now: Date = new Date()): [Date, Date] | null {
  const today = startOfDay(now);
  switch (option) {
    case "today":
      return [today, addDays(today, 1)];
    case "week": {
      const daysUntilMonday = (8 - today.getDay()) % 7 || 7; // getDay(): 0 = Sunday
      return [today, addDays(today, daysUntilMonday)];
    }
    case "weekend": {
      const day = today.getDay();
      const saturday = day === 0 ? addDays(today, -1) : addDays(today, 6 - day);
      return [day === 0 ? today : saturday, addDays(saturday, 2)];
    }
    case "month":
      return [today, addDays(today, 31)];
    default:
      return null;
  }
}

/** Events created on YaleClubs have no source (older documents) or "yaleclubs". */
const sourceOf = (event: FilterableEvent) => event.source ?? "yaleclubs";

export function filterEvents<T extends FilterableEvent>(
  events: T[],
  options: EventFilterOptions,
  now: Date = new Date(),
): T[] {
  const window = dateWindow(options.date, now);
  return events.filter((event) => {
    if (options.source !== "all" && sourceOf(event) !== options.source) return false;
    if (options.where.length && !(event.locationType && options.where.includes(event.locationType))) return false;
    if (options.eventTypes.length && !(event.eventType && options.eventTypes.includes(event.eventType))) return false;
    if (window) {
      const start = new Date(event.start).getTime();
      if (start < window[0].getTime() || start >= window[1].getTime()) return false;
    }
    return true;
  });
}

const time = (d?: Date | string) => (d ? new Date(d).getTime() : 0);

/**
 * Sorts a list of events. For past events, "soonest" means most recent first,
 * which matches how the past list was ordered before sorting existed.
 */
export function sortEvents<T extends FilterableEvent>(events: T[], sort: SortOption, past = false): T[] {
  const sorted = [...events];
  switch (sort) {
    case "latest":
      return sorted.sort((a, b) => (past ? time(a.start) - time(b.start) : time(b.start) - time(a.start)));
    case "recent":
      return sorted.sort((a, b) => time(b.createdAt) - time(a.createdAt));
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    default:
      return sorted.sort((a, b) => (past ? time(b.start) - time(a.start) : time(a.start) - time(b.start)));
  }
}

/** Distinct, sorted event types present in the data, for the "Type" filter. */
export function eventTypesIn(events: FilterableEvent[]): string[] {
  const types = new Set(events.map((e) => e.eventType).filter((t): t is string => Boolean(t)));
  return Array.from(types).sort((a, b) => a.localeCompare(b));
}
