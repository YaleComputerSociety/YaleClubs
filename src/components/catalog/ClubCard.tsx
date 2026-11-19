"use client";

import { Dispatch, SetStateAction } from "react";
import { IClub, RecruitmentStatus } from "@/lib/models/Club";
import Image from "next/image";
import FollowButton from "./FollowButton";
import { LabelList } from "./LabelList";

type ClubCardProps = {
  club: IClub;
  onClick: () => void;
  followedClubs: string[];
  setFollowedClubs: Dispatch<SetStateAction<string[]>>;
  initialFollowing: boolean;
};

const ClubCard = ({ club, onClick, followedClubs, setFollowedClubs }: ClubCardProps) => {
  const isFollowing = followedClubs.includes(club._id.toString());

  return (
    <article className="club-card" onClick={onClick}>
      <div className="card-top">
        <h2 className="card-title">
          <button
            className="card-open"
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
          >
            {club.name}
          </button>
        </h2>
        <Image
          src={club.logo?.trim() || "/assets/default-logo.png"}
          alt=""
          width={36}
          height={36}
          className="logo-sq"
        />
      </div>
      <div className="card-tags">
        <LabelList club={club} />
      </div>
      <p className="card-desc">{club.description || "No description"}</p>
      <div className="card-foot">
        <div className="card-membership">
          {club.recruitmentStatus === RecruitmentStatus.APPENDS && (
            <span className="status">
              <Image src="/assets/club-status/open.svg" alt="" width={10} height={10} />
              Open
            </span>
          )}
          {/* Temporarily show all clubs as accepting members. */}
          <span className="accepting">
            <Image src="/assets/club-status/accepting.svg" alt="" width={10} height={10} />
            Accepting Members
          </span>
        </div>
        <FollowButton
          isFollowing={isFollowing}
          clubId={club._id.toString()}
          followedClubs={followedClubs}
          setFollowedClubs={setFollowedClubs}
          className="follow-btn"
        />
      </div>
    </article>
  );
};

export default ClubCard;
