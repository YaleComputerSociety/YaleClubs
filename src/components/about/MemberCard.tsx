import React from "react";
import Image from "next/image";

interface MemberCardProps {
  member: Member;
}

type Member = {
  name: string;
  role: string;
  website?: string | undefined;
  linkedin?: string;
  github?: string;
  headshot?: string;
};

const MemberCard = ({ member }: MemberCardProps) => {
  if (!member) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
      <p className="text-gray-600">{member.role}</p>
      {member.website && (
        <a href={member.website} target="_blank" rel="noopener noreferrer">
          <Image src="/assets/website-icon.png" alt="Website" width={16} height={16} className="inline-block" />
        </a>
      )}
      {member.linkedin && (
        <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
          <Image src="/assets/linkedin-icon.png" alt="linkedIn" width={25} height={25} className="inline-block" />
        </a>
      )}
      {member.github && (
        <a href={member.github} target="_blank" rel="noopener noreferrer">
          <Image src="/assets/github-icon.png" alt="GitHub" width={16} height={16} className="inline-block" />
        </a>
      )}
      {member.headshot && (
        <Image
          src={member.headshot}
          alt="Member Headshot"
          className="mt-5 aspect-square w-full"
          width={500}
          height={500}
        />
      )}
    </div>
  );
};

export default MemberCard;
