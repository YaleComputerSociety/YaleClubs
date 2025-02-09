import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { IClub } from "@/lib/models/Club";
import Image from "next/image";
import { getAdjustedNumMembers } from "@/lib/utils";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import FollowButton from "./FollowButton";
import { FiCopy } from "react-icons/fi";
import Board from "./Board";

type ClubModalProps = {
  club: IClub;
  onClose: () => void;
  followedClubs: string[];
  setFollowedClubs: Dispatch<SetStateAction<string[]>>;
  initialFollowing: boolean;
};

const ClubModal = ({ club, onClose, followedClubs, setFollowedClubs, initialFollowing }: ClubModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const isSm = useMediaQuery({ maxWidth: 640 });
  // const isMd = useMediaQuery({ maxWidth: 768 });
  const [canEdit, setCanEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  console.log(errorMessage);

  const token = Cookies.get("token");
  const isFollowing = followedClubs.includes(club._id);

  const adjustedFollowers = club.followers
    ? String(club.followers + (isFollowing === initialFollowing ? 0 : isFollowing ? 1 : -1))
    : isFollowing
      ? "1"
      : "0";

  console.table(club);

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

  const LabelList = () => {
    return (
      <>
        {(club.school ||
          (club.affiliations && club.affiliations.length > 0) ||
          (club.categories && club.categories.length > 0)) && (
          <div className="flex gap-2 whitespace-nowrap w-full flex-wrap mt-4">
            {club.school && <span className="bg-[#acf] rounded px-2 py-1 text-sm">{club.school}</span>}
            {club.categories?.map((tag, index) => (
              <span key={index} className="bg-[#eee] rounded px-2 py-1 text-sm">
                {tag}
              </span>
            ))}
            {club.affiliations?.map((tag, index) => (
              <span key={index} className="bg-[#feb] rounded px-2 py-1 text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </>
    );
  };

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
      <div className="flex items-center space-x-2">
        <a
          href={isEmail ? "mailto:" + link : link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          {content}
        </a>
        <button
          onClick={handleCopy}
          className="text-blue-500 hover:text-blue-700 focus:outline-none"
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
    return <div className="text-gray-500">{content}</div>;
  };

  const EditButton = ({ href, text, onClick, disabled, className }: any) =>
    href ? (
      <Link href={href}>
        <button className={className}>{text}</button>
      </Link>
    ) : (
      <button onClick={onClick} disabled={disabled} className={className}>
        {text}
      </button>
    );

  const editButtonStyle = "px-4 py-2 text-lg font-medium rounded shadow";

  const getButtonProps = () => {
    if (!isSm) {
      if (token) {
        if (canEdit) {
          return {
            href: `/update?clubId=${club._id}`,
            text: "Edit Club",
            className: `${editButtonStyle} bg-clubPurple text-white hover:bg-clubBlurple transform-[bg] transition-300`,
          };
        }
        return {
          onClick: () => setErrorMessage("You do not have permission to edit this club."),
          text: "Edit Club",
          className: "px-4 py-2 text-lg font-medium text-gray-500 bg-gray-300 rounded shadow cursor-not-allowed",
          disabled: true,
        };
      }
      return {
        onClick: () => setErrorMessage("You need to log in to edit this club."),
        text: "Log in to Edit",
        className: "px-4 py-2 text-lg font-medium text-gray-500 bg-gray-300 rounded shadow cursor-pointer",
      };
    }
    return {
      onClick: () => setErrorMessage("You must be logged in on a computer to edit a club."),
      text: "Edit Club",
      className: "px-2 py-1 text-sm font-medium text-gray-500 bg-gray-300 rounded shadow cursor-not-allowed",
      disabled: true,
    };
  };

  const buttonProps = getButtonProps();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl max-w-3xl w-full lg:mx-auto h-5/6 max-h-[1000px] overflow-y-auto flex flex-col"
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

        <div className="flex flex-col items-center w-full min-h-full">
          <div className="w-full h-[36%] bg-red-300 relative">
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

          <div className="flex flex-row w-full gap-10 p-6">
            <div className="flex flex-col w-full gap-2 flex-[3]">
              <h1 className="text-3xl uppercase font-bold tracking-tight">{club.name}</h1>
              <p className="text-lg font-semibold">
                {adjustedFollowers} follower{adjustedFollowers == "1" ? "" : "s"}{" "}
              </p>
              <p className="text-gray-700 mt-2">{club.description}</p>
              <LabelList />
              <div className="mt-8"></div>
              <EditButton {...buttonProps} />
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
                className="w-[90px] px-0"
              />
              <div className="flex flex-col mt-4 gap-2">
                {club.applyForm &&
                  (club.recruitmentEndDate === undefined ||
                    new Date(club.recruitmentEndDate).getTime() >= new Date().setHours(-24, 0, 0, 0)) && (
                    <RightLink content="Application Form" link={club.applyForm} />
                  )}
                <RightLink content="Website" link={club.website} />
                <RightLink content="Email" link={club.email} isEmail />
                {club.instagram && <RightLink content="Instagram" link={club.instagram} />}
                {club.calendarLink && <RightLink content="Calendar" link={club.calendarLink} />}
                {club.mailingListForm && <RightLink content="Mailing List" link={club.mailingListForm} />}
                {club.numMembers && <RightLabel content={getAdjustedNumMembers(club.numMembers) + " members"} />}
              </div>
              <Board isLoggedIn={token !== undefined} leaders={club.leaders} />
            </div>
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

          {/*

          <div className="flex flex-col overflow-y-auto overflow-x-hidden px-4 md:px-6 pb-4 md:pb-6 -mt-[50px] md:mt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col md:w-3/5">
                <div
                  className={`text-center md:text-left ${club.name.length > 100 ? "text-xl md:text-2xl" : "text-2xl md:text-2xl"} font-bold`}
                >
                  {club.name}
                  <div className="flex flex-row items-center text-base gap-2 mt-1">
                    <div className="text-gray-500">
                      {adjustedFollowers} follower{adjustedFollowers == "1" ? "" : "s"}{" "}
                    </div>
                    •
                    <FollowButton
                      isFollowing={isFollowing}
                      clubId={club._id}
                      followedClubs={followedClubs}
                      setFollowedClubs={setFollowedClubs}
                    />
                  </div>
                </div>
                {club.school && (
                  <div className="flex gap-2 whitespace-nowrap w-full flex-wrap mt-4">
                    <span className="bg-[#acf] rounded px-2 py-1 text-sm">{club.school}</span>
                  </div>
                )}
                {((club.affiliations && club.affiliations.length > 0) ||
                  (club.categories && club.categories.length > 0)) && (
                  <div className="flex gap-2 whitespace-nowrap w-full flex-wrap mt-4">
                    {club.categories?.map((tag, index) => (
                      <span key={index} className="bg-[#eee] rounded px-2 py-1 text-sm">
                        {tag}
                      </span>
                    ))}
                    {club.affiliations?.map((tag, index) => (
                      <span key={index} className="bg-[#feb] rounded px-2 py-1 text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-gray-700 mt-4 text-sm sm:text-base">{club.description || "No description"}</div>
              </div>
              <div className="flex flex-col md:w-2/5 items-center">
                {!isMd && (
                  <div className="flex flex-col items-center gap-4">
                    <Image
                      src={club.logo ? club.logo : "/assets/default-logo.png"}
                      alt="Club Logo"
                      width={100}
                      height={100}
                      className={`${club.logo ? "rounded-2xl" : ""} flex-shrink-0`}
                    />
                  </div>
                )}
                <div className="flex flex-col w-full sm:w-3/4 md:w-full">
                  <ClubModalRightLabel
                    header="Website"
                    content={getAdjustedWebsite(club.website)}
                    link={club.website}
                  />
                  <ClubModalRightLabel header="Email" content={club.email} link={"mailto:" + club.email} />
                  <ClubModalRightLabel
                    header="Membership"
                    content={club.numMembers ? getAdjustedNumMembers(club.numMembers) + " members" : undefined}
                  />
                  <ClubModalRightLabel
                    header="Instagram"
                    content={getModifiedInstagram(club.instagram)}
                    link={getInstagramLink(club.instagram)}
                  />
                  <ClubModalRightLabel
                    header="Application Form"
                    content={club.applyForm ? "Application Form" : undefined}
                    link={club.applyForm}
                  />
                  <ClubModalRightLabel
                    header="Mailing List"
                    content={club.mailingListForm ? "Mailing List" : undefined}
                    link={club.mailingListForm}
                  />
                  <ClubModalRightLabel
                    header="Calendar"
                    content={club.calendarLink ? "Calendar Link" : undefined}
                    link={club.calendarLink}
                  />
                  <ClubModalRightLabel header="Meeting" content={club.meeting} />
                </div>
              </div>
            </div>
            <Board isLoggedIn={token !== undefined} leaders={club.leaders} />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ClubModal;
