import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Maximize,
  Minimize,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Share2,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import type { IEvent } from "@/lib/models/Event";
import type { ClubLeader, IClub } from "@/lib/models/Club";
import { generateGoogleCalendarLink } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import DisplayFooter from "@/components/catalog/DisplayFooter";
import "@/app/display.css";
import "./event-modal.css";

type EventModalProps = {
  event: IEvent;
  associatedClubLeaders: ClubLeader[];
  onClose: () => void;
  associatedClubs: IClub[];
};

const EventModal = ({ event, associatedClubLeaders, onClose, associatedClubs }: EventModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState(false);
  const { isLoggedIn, user } = useAuth();
  const canEdit =
    isLoggedIn &&
    user &&
    (user.role === "admin" || associatedClubLeaders.some((leader) => leader.email === user.email));
  const start = new Date(event.start);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="club-display">
      <dialog
        ref={dialogRef}
        className={`club-dialog event-dialog ${expanded ? "expanded" : "compact"}`}
        aria-labelledby="event-modal-title"
        onCancel={(e) => {
          e.preventDefault();
          onClose();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-inner">
          <div className="modal-body">
            <div className="modal-toolbar">
              <button className="icon-btn" onClick={onClose} aria-label="Back to all events" autoFocus>
                <ArrowLeft size={18} />
              </button>
              <button
                className="icon-btn modal-expand"
                onClick={() => setExpanded(!expanded)}
                aria-label={expanded ? "Restore window size" : "Expand modal"}
              >
                {expanded ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
            <div className="event-heading">
              <div className="club-head">
                <h2 id="event-modal-title">{event.name}</h2>
              </div>
              {canEdit && (
                <div className="event-edit-row">
                  <Link className="edit-btn" href={`/CreateUpdateEvent?eventId=${event._id.toString()}`}>
                    <Pencil size={12} />
                    Edit Event
                  </Link>
                  <button
                    className="edit-btn event-delete"
                    onClick={async () => {
                      if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone."))
                        return;
                      try {
                        await axios.delete(`/api/events?id=${event._id.toString()}`, { data: event });
                        onClose();
                        window.location.reload();
                      } catch (error) {
                        alert(`Failed to delete event: ${error instanceof Error ? error.message : "Unknown error"}`);
                      }
                    }}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              )}
            </div>
            <div className="modal-cols event-modal-cols">
              <div>
                <div className="event-flyer">
                  <Image
                    src={event.flyer?.trim() || "/assets/default-background.png"}
                    alt={`${event.name} flyer`}
                    width={900}
                    height={900}
                    priority
                  />
                </div>
                <div className="club-head">
                  <p className="event-description">{event.description}</p>
                  {event.tags && event.tags.length > 0 && (
                    <div className="pills">
                      {event.tags.map((tag) => (
                        <span key={tag} className="pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <aside>
                <section className="section">
                  <h3>Event details</h3>
                  <ul className="info-list">
                    <li>
                      <Calendar size={14} />
                      <span>
                        {start.toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </li>
                    <li>
                      <Clock size={14} />
                      <span>{start.toLocaleTimeString(undefined, { timeStyle: "short" })}</span>
                    </li>
                    <li>
                      <MapPin size={14} />
                      <span>{event.location}</span>
                    </li>
                  </ul>
                  <div className="event-actions">
                    {event.registrationLink && (
                      <Link className="event-action event-action-primary" href={event.registrationLink}>
                        <ExternalLink size={14} />
                        Register for Event
                      </Link>
                    )}
                    <Link
                      className="event-action"
                      href={generateGoogleCalendarLink(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Calendar size={14} />
                      Add to Calendar
                    </Link>
                    <button
                      className="event-action"
                      onClick={async () => {
                        const shareUrl = `${window.location.origin}/Events/${event._id.toString()}`;
                        const title = `${event.name} | YaleClubs`;
                        const text = `${new Date(event.start).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} • ${event.location}`;

                        // Try Web Share API with image file support (use flyer directly to avoid OG fetch)
                        try {
                          const imgUrl =
                            event.flyer && event.flyer.trim() !== "" ? event.flyer : "/assets/default-background.png";
                          const res = await fetch(imgUrl, { cache: "no-store" });
                          if (res.ok) {
                            const blob = await res.blob();
                            const fileName = `event-${event._id.toString()}${blob.type === "image/jpeg" ? ".jpg" : ".png"}`;
                            // Some browsers require a concrete content-type
                            const file = new File([blob], fileName, { type: blob.type || "image/png" });

                            const canShareFiles =
                              typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
                            if (canShareFiles && typeof navigator.share === "function") {
                              // Pass the link via the url field only to avoid duplicate links in some apps
                              await navigator.share({ title, text, url: shareUrl, files: [file] });
                              return;
                            }
                          }
                        } catch (err) {
                          console.warn("Image share not supported or failed, falling back to link share.", err);
                        }

                        // Fallback to link-only share
                        try {
                          if (navigator.share && typeof navigator.share === "function") {
                            await navigator.share({ title, text, url: shareUrl });
                            return;
                          }
                        } catch (err) {
                          console.error("Link share failed, falling back to clipboard.", err);
                        }
                      }}
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                  </div>
                </section>
                <section className="section">
                  <h3>Hosted by</h3>
                  <ul className="event-hosts">
                    {associatedClubs.map((club) => (
                      <li key={club._id.toString()}>
                        <Image src={club.logo?.trim() || "/assets/default-logo.png"} alt="" width={40} height={40} />
                        <span>{club.name}</span>
                      </li>
                    ))}
                  </ul>
                  {associatedClubs.length === 0 && <p className="no-events">No hosting clubs listed.</p>}
                </section>
              </aside>
            </div>
          </div>
          <DisplayFooter />
        </div>
      </dialog>
    </div>
  );
};

export default EventModal;
