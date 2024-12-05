import React from "react";

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
          <img src="/assets/website-icon.png" alt="Website" className="inline-block w-4 h-4" />
        </a>
      )}
      {member.linkedin && (
        <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
          <img src="/assets/linkedin-icon.png" alt="Linkedin" className="inline-block w-6 h-6" />
        </a>
      )}
      {member.github && (
        <a href={member.github} target="_blank" rel="noopener noreferrer">
          <img src="/assets/github-icon.png" alt="Github" className="inline-block w-4 h-4" />
        </a>
      )}
      {member.headshot && <img src={member.headshot} className="mt-5 aspect-square" />}
    </div>
  );
};

export default MemberCard;
