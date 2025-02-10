import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { IClub } from "@/lib/models/Club";
import Image from "next/image";
import { getAdjustedNumMembers, getInstagramLink } from "@/lib/utils";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import FollowButton from "./FollowButton";
import { FiCopy } from "react-icons/fi";
import Board from "./Board";
import { LabelList } from "./LabelList";

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

  const token = Cookies.get("token");
  const isFollowing = followedClubs.includes(club._id);

  const adjustedFollowers = club.followers
    ? String(club.followers + (isFollowing === initialFollowing ? 0 : isFollowing ? 1 : -1))
    : isFollowing
      ? "1"
      : "0";

  // console.table(club);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<{ email: string }>(token);
        const userEmail = decoded.email;

        const admin_emails = [
          "lucas.huang@yale.edu",
          "addison.goolsbee@yale.edu",
          "francis.fan@yale.edu",
          "grady.yu@yale.edu",
          "lauren.lee.ll2243@yale.edu",
          "koray.akduman@yale.edu",
        ];

        const isBoardMember = club.leaders.some((leader) => leader.email === userEmail);
        setCanEdit(isBoardMember || admin_emails.includes(userEmail));
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, [club.leaders, token]);

  type RightLinkProps = {
    content: string;
    link: string | undefined;
    isEmail?: boolean;
  };

  const RightLink = ({ content, link, isEmail }: RightLinkProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      if (!link) return;
      navigator.clipboard.writeText(link).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset "copied" state after 2 seconds
      });
    };

    if (!link) return <div className="text-gray-500">No {content.toLowerCase()}</div>;

    return (
      <div className="flex items-center space-x-2 text-sm sm:text-base">
        <a
          href={isEmail ? "mailto:" + link : link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-clubPurple hover:text-clubBlurple"
        >
          {content}
        </a>
        <button
          onClick={handleCopy}
          className="text-clubPurple hover:text-clubBlurple focus:outline-none"
          aria-label="Copy link"
        >
          <FiCopy />
        </button>
        {copied && <span className="text-green-500 text-sm">Copied!</span>}
      </div>
    );
  };

  type RightLabelProps = {
    content: string;
  };

  const RightLabel = ({ content }: RightLabelProps) => {
    return <div className="text-gray-500 text-sm sm:text-base">{content}</div>;
  };

  const EditButton = ({ href, text, onClick, className }: any) =>
    href ? (
      <Link href={href}>
        <button className={className}>{text}</button>
      </Link>
    ) : (
      <button onClick={onClick} className={className}>
        {text}
      </button>
    );

  const editButtonStyle =
    "px-3 sm:px-4 py-1 text-base sm:text-lg font-medium rounded-xl shadow absolute top-3 right-3 z-50";

  const getButtonProps = () => {
    if (!isSm) {
      if (token) {
        if (canEdit) {
          return {
            href: `/update?clubId=${club._id}`,
            text: "Edit Club",
            className: `${editButtonStyle} bg-clubPurple text-white hover:bg-clubBlurple transition-all duration-300 hover:scale-105`,
          };
        }
        return {
          onClick: () => setErrorMessage("You do not have permission to edit this club."),
          text: "Edit Club",
          className: `${editButtonStyle} text-gray-500 bg-gray-300 cursor-not-allowed`,
        };
      }
      return {
        onClick: () => setErrorMessage("You need to log in to edit this club."),
        text: "Log in to Edit",
        className: `${editButtonStyle} text-gray-500 bg-gray-300 cursor-not-allowed`,
      };
    }
    return {
      onClick: () => setErrorMessage("You must be logged in on a computer to edit a club."),
      text: "Edit",
      className: `${editButtonStyle} text-gray-500 bg-gray-300 cursor-not-allowed`,
    };
  };

  const buttonProps = getButtonProps();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl max-w-3xl w-full lg:mx-auto h-5/6 max-h-[1000px] overflow-y-auto flex flex-col m-2 sm:m-0"
      >
        <div className="bg-white z-50 absolute top-4 left-4 h-5 w-5 rounded-full"></div>
        <Image
          onClick={onClose}
          src="/assets/icons/cancel.svg"
          alt="cancel"
          width={35}
          height={35}
          unoptimized
          className="cursor-pointer z-50 absolute top-2 left-2"
        />
        <EditButton {...buttonProps} />
        <div className="flex flex-col items-center w-full min-h-full">
          <div className="w-full h-[140px] sm:h-[30%] relative">
            <Image
              src={club.backgroundImage || "/assets/default-background.png"}
              alt="bg"
              className="object-cover h-full"
              width={768}
              height={768}
              onError={(e) => {
                e.currentTarget.src = "/assets/default-background.png";
              }}
            />
          </div>

          <div className="flex flex-col w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            <div className="flex flex-row w-full gap-4 sm:gap-20">
              <div className="flex flex-col w-full gap-2 flex-[3.5]">
                <div
                  className="text-2xl sm:text-3xl font-bold tracking-tight sm:relative sm:-top-1"
                  style={{ lineHeight: "1" }}
                >
                  {club.name}
                </div>
                <p className="text-lg sm:text-xl font-semibold text-gray-700 -mt-2">
                  {adjustedFollowers} follower{adjustedFollowers == "1" ? "" : "s"}{" "}
                </p>
                <p className="text-gray-700 mt-2 text-sm sm:text-base">{club.description}</p>
                {!isSm && <LabelList club={club} className="whitespace-nowrap flex-wrap sm:text-sm mt-4" />}
              </div>
              <div className="flex flex-col w-full gap-2 flex-1">
                <Image
                  src={club.logo ?? "/assets/default-logo.png"}
                  alt="Club Logo"
                  width={90}
                  height={90}
                  className={`${club.logo ? "rounded-xl" : ""} flex-shrink-0`}
                />
                <FollowButton
                  isFollowing={isFollowing}
                  clubId={club._id}
                  followedClubs={followedClubs}
                  setFollowedClubs={setFollowedClubs}
                  className="w-[90px] min-w-[90px] max-w-[90px] px-0"
                />
                <div className="flex flex-col mt-4 gap-2">
                  {club.applyForm &&
                    (club.recruitmentEndDate === undefined ||
                      new Date(club.recruitmentEndDate).getTime() >= new Date().setHours(-24, 0, 0, 0)) && (
                      <RightLink content="Application" link={club.applyForm} />
                    )}
                  <RightLink content="Website" link={club.website} />
                  <RightLink content="Email" link={club.email} isEmail />
                  {club.instagram && <RightLink content="Instagram" link={getInstagramLink(club.instagram)} />}
                  {club.calendarLink && <RightLink content="Calendar" link={club.calendarLink} />}
                  {club.mailingListForm && <RightLink content="Mailing List" link={club.mailingListForm} />}
                  {club.numMembers && <RightLabel content={getAdjustedNumMembers(club.numMembers) + " members"} />}
                </div>
              </div>
            </div>
            {isSm && <LabelList club={club} className="whitespace-nowrap flex-wrap mt-4" />}
            <Board isLoggedIn={token !== undefined} leaders={club.leaders} />
          </div>

          {errorMessage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg">
                <h2 className="text-lg font-semibold text-gray-800">Error</h2>
                <p className="mt-2 text-gray-600">{errorMessage}</p>
                <button
                  onClick={() => setErrorMessage("")}
                  className="mt-4 px-4 py-2 text-white bg-indigo-600 rounded shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubModal;
