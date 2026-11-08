// Type-only import: keeps mongoose (from the model file) out of this component at runtime.
import type { EventLocationType, IEvent } from "@/lib/models/Event";

type DetailFields =
  | "source"
  | "eventType"
  | "locationType"
  | "foodProvided"
  | "hostCategory"
  | "topics"
  | "externalLink";

type EventSourceDetailsProps = {
  // Accepts a full event or a plain object with just these fields (each may be undefined).
  event: { [K in DetailFields]?: IEvent[K] | undefined };
};

const LOCATION_TYPE_LABELS: Record<`${EventLocationType}`, string> = {
  "On-Campus": "On campus",
  "Off-Campus": "Off campus",
  Virtual: "Virtual",
};

/**
 * Extra details that imported events carry (currently YaleConnect): event type, where it is,
 * food, the host's category and topics. Renders nothing for events without them.
 */
const EventSourceDetails = ({ event }: EventSourceDetailsProps) => {
  const rows: [string, string][] = [];
  if (event.eventType) rows.push(["Type", event.eventType]);
  if (event.locationType) rows.push(["Where", LOCATION_TYPE_LABELS[event.locationType] ?? event.locationType]);
  if (event.foodProvided) rows.push(["Food", "Food provided"]);
  if (event.hostCategory) rows.push(["Host category", event.hostCategory]);

  const topics = event.topics ?? [];
  const fromYaleConnect = event.source === "yaleconnect";
  if (!rows.length && !topics.length && !fromYaleConnect) return null;

  return (
    <div className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-700">
      {rows.length > 0 && (
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="font-semibold text-gray-500">{label}</dt>
              <dd className="break-words">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {topics.map((topic) => (
            <span key={topic} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
              {topic}
            </span>
          ))}
        </div>
      )}

      {fromYaleConnect && (
        <p className="mt-3 text-xs text-gray-500">
          Imported from{" "}
          {event.externalLink ? (
            <a href={event.externalLink} target="_blank" rel="noopener noreferrer" className="underline">
              YaleConnect
            </a>
          ) : (
            "YaleConnect"
          )}
          . Details may change; check YaleConnect for the latest.
        </p>
      )}
    </div>
  );
};

export default EventSourceDetails;
