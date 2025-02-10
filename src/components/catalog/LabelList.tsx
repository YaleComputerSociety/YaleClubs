import { IClub } from "@/lib/models/Club";

type Props = {
  club: IClub;
  className?: string;
};

export const LabelList = ({ className, club }: Props) => {
  return (
    <>
      {(club.school ||
        (club.affiliations && club.affiliations.length > 0) ||
        (club.categories && club.categories.length > 0)) && (
        <div className={`${className} flex gap-2 whitespace-nowrap text-xs`}>
          {club.school && <span className="bg-[#eee] rounded px-2 py-1">{club.school}</span>}
          {[...(club.categories || []), ...(club.affiliations || [])]
            .sort((a, b) => a.localeCompare(b))
            .map((tag, index) => (
              <span key={index} className="bg-[#eee] rounded px-2 py-1">
                {tag}
              </span>
            ))}
        </div>
      )}
    </>
  );
};
