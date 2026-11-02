import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { IClub } from "@/lib/models/Club";
import Image from "next/image";
import { getAdjustedNumMembers, getInstagramLink } from "@/lib/utils";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import FollowButton from "./FollowButton";
import {
  ArrowLeft,
  Maximize,
  Minimize,
  Pencil,
  Users,
  UserPlus,
  Clock,
  Globe,
  Mail,
  Instagram,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Copy,
} from "lucide-react";
import type { IEvent } from "@/lib/models/Event";
import DisplayFooter from "./DisplayFooter";
import { LabelList } from "./LabelList";
import { useAuth } from "@/contexts/AuthContext";

type ClubModalProps = {
  club: IClub;
  onClose: () => void;
  followedClubs: string[];
  setFollowedClubs: Dispatch<SetStateAction<string[]>>;
  initialFollowing: boolean;
};

const ClubModal = ({ club, onClose, followedClubs, setFollowedClubs, initialFollowing }: ClubModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const isSm = useMediaQuery({ maxWidth: 639 });
  const [canEdit, setCanEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { isLoggedIn, user } = useAuth();

  const isFollowing = followedClubs.includes(club._id.toString());

  const adjustedFollowers = club.followers
    ? String(club.followers + (isFollowing === initialFollowing ? 0 : isFollowing ? 1 : -1))
    : isFollowing
      ? "1"
      : "0";

  // console.table(club);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      try {
        const isBoardMember = club.leaders.some((leader) => leader.email === user?.email);
        setCanEdit(isBoardMember || user?.role === "admin");
      } catch (err) {
        console.error("You are not logged in", err);
      }
    }
  }, [club.leaders, isLoggedIn, user]);

  useEffect(() => {
    const payload = JSON.stringify({
      clubId: club._id.toString(),
      eventType: "modal_view",
    });
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [club._id]);

  const [expanded, setExpanded] = useState(false);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [eventsState, setEventsState] = useState("loading");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  useEffect(() => {
    let active = true;
    setEventsState("loading");
    fetch("/api/events")
      .then(async (response) => {
        if (!response.ok) throw new Error("Events unavailable");
        const data: IEvent[] = await response.json();
        if (active) {
          setEvents(
            data
              .filter(
                (event) => event.clubs.includes(club._id.toString()) && new Date(event.start).getTime() >= Date.now(),
              )
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
          );
          setEventsState("ready");
        }
      })
      .catch(() => {
        if (active) setEventsState("unavailable");
      });
    return () => {
      active = false;
    };
  }, [club._id]);

  const contacts = [
    ...(club.applyForm &&
    (!club.recruitmentEndDate || new Date(club.recruitmentEndDate).getTime() >= new Date().setHours(-24, 0, 0, 0))
      ? [{ label: "Application", href: club.applyForm, icon: <LinkIcon size={14} /> }]
      : []),
    { label: club.website, href: club.website, icon: <Globe size={14} /> },
    { label: club.email, href: club.email ? `mailto:${club.email}` : undefined, icon: <Mail size={14} /> },
    {
      label: club.instagram,
      href: club.instagram ? getInstagramLink(club.instagram) : undefined,
      icon: <Instagram size={14} />,
    },
    { label: "Calendar", href: club.calendarLink, icon: <Calendar size={14} /> },
    { label: "Mailing List", href: club.mailingListForm, icon: <LinkIcon size={14} /> },
  ].filter((contact) => contact.href);

  const editClub = () =>
    setErrorMessage(
      !isLoggedIn
        ? "You need to log in to edit this club."
        : !canEdit
          ? "You do not have permission to edit this club."
          : "You must be logged in on a computer to edit a club.",
    );

  return (
    <dialog
      ref={dialogRef}
      className={`club-dialog ${expanded ? "expanded" : "compact"}`}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-inner" ref={modalRef}>
        <div className="modal-body">
          <div className="modal-toolbar">
            <button className="icon-btn" onClick={onClose} aria-label="Back to all clubs" autoFocus>
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
          <div className="banner">
            <Image
              src={club.backgroundImage || "/assets/default-background.png"}
              alt=""
              width={1100}
              height={190}
              onError={(event) => {
                event.currentTarget.src = "/assets/default-background.png";
              }}
            />
          </div>
          <Image
            className="club-avatar"
            src={club.logo?.trim() || "/assets/default-logo.png"}
            alt="Club logo"
            width={64}
            height={64}
          />
          <div className="edit-row">
            {isLoggedIn && canEdit && !isSm ? (
              <Link className="edit-btn" href={`/update?clubId=${club._id.toString()}`}>
                <Pencil size={12} />
                Edit Club
              </Link>
            ) : (
              <button className="edit-btn" onClick={editClub}>
                <Pencil size={12} />
                {isLoggedIn ? "Edit Club" : "Log in to Edit"}
              </button>
            )}
          </div>
          {errorMessage && (
            <div className="modal-error" role="alert">
              {errorMessage}{" "}
              <button onClick={() => setErrorMessage("")} aria-label="Dismiss message">
                ×
              </button>
            </div>
          )}
          <div className="modal-cols">
            <div>
              <div className="club-head">
                <h2 id="modal-title">{club.name}</h2>
                <p>{club.description}</p>
                <LabelList club={club} className="pills" />
              </div>
              <section className="section plain">
                <h3>Upcoming Events</h3>
                {eventsState === "loading" ? (
                  <p className="no-events">Loading events…</p>
                ) : eventsState === "unavailable" ? (
                  <p className="no-events">
                    {isLoggedIn ? "Events are currently unavailable." : "Sign in to see upcoming events."}
                  </p>
                ) : events.length === 0 ? (
                  <p className="no-events">No upcoming events.</p>
                ) : (
                  events.map((event, index) => {
                    const date = new Date(event.start);
                    const previous = index > 0 ? new Date(events[index - 1].start) : null;
                    return (
                      <div key={event._id.toString()}>
                        {(!previous || previous.toDateString() !== date.toDateString()) && (
                          <div className="ev-date">
                            {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            <span>{date.toLocaleDateString("en-US", { weekday: "long" })}</span>
                          </div>
                        )}
                        <div className="ev">
                          <span className="ev-time">
                            {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </span>
                          <div>
                            <Link className="ev-title" href={`/Events/${event._id.toString()}`}>
                              {event.name}
                            </Link>
                            <div className="ev-loc">
                              <MapPin size={12} />
                              {event.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>
            </div>
            <aside>
              <section className="section">
                <h3>Profile</h3>
                <ul className="info-list">
                  {club.numMembers ? (
                    <li>
                      <Users size={14} />
                      {getAdjustedNumMembers(club.numMembers)} members
                    </li>
                  ) : null}
                  {club.recruitmentStatus && club.recruitmentStatus !== "No Selection" && (
                    <li>
                      <UserPlus size={14} />
                      {club.recruitmentStatus}
                    </li>
                  )}
                  {club.intensity && (
                    <li>
                      <Clock size={14} />
                      {club.intensity}
                    </li>
                  )}
                </ul>
                <p className="modal-followers">
                  {adjustedFollowers} follower{adjustedFollowers === "1" ? "" : "s"}
                </p>
                <FollowButton
                  isFollowing={isFollowing}
                  clubId={club._id.toString()}
                  followedClubs={followedClubs}
                  setFollowedClubs={setFollowedClubs}
                  className="follow-btn mt-4"
                />
              </section>
              <section className="section">
                <h3>Contacts</h3>
                <ul className="info-list">
                  {contacts.map((contact, index) => (
                    <li key={index}>
                      <a href={contact.href} target="_blank" rel="noopener noreferrer">
                        {contact.icon}
                        {contact.label} ↗
                      </a>
                      <button
                        className="icon-btn"
                        aria-label={`Copy ${contact.label}`}
                        onClick={() => {
                          void navigator.clipboard
                            .writeText(contact.href!.replace(/^mailto:/, ""))
                            .then(() => setErrorMessage("Copied to clipboard."))
                            .catch(() => setErrorMessage("Unable to copy this link."));
                        }}
                      >
                        <Copy size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
                {contacts.length === 0 && <p className="no-events">No contact details provided.</p>}
              </section>
              {club.leaders.length > 0 && (
                <section className="section">
                  <h3>Board Members</h3>
                  <ul className="board">
                    {club.leaders.map((leader, index) => (
                      <li key={index}>
                        <div className="board-name">
                          {leader.name}
                          {leader.year ? ` '${leader.year % 100}` : ""}
                          {leader.role && <span className="role">{leader.role}</span>}
                        </div>
                        {isLoggedIn && (
                          <a className="board-email" href={`mailto:${leader.email}`}>
                            {leader.email}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>
          </div>
        </div>
        <DisplayFooter />
      </div>
    </dialog>
  );
};

export default ClubModal;
