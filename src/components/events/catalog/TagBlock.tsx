import { Tag } from "@/lib/models/Event";

interface TagProps {
  tag: Tag;
}

const tagColors: Record<Tag, string> = {
  [Tag.FeaturedEvent]: "bg-red-200 text-red-800",
  [Tag.FreeFood]: "bg-green-200 text-green-800",
  [Tag.LimitedCapacity]: "bg-yellow-200 text-yellow-800",
  [Tag.StartsPromptly]: "bg-red-200 text-red-800",
  [Tag.RegistrationRequired]: "bg-blue-200 text-blue-800",
  [Tag.Showcase]: "bg-purple-200 text-purple-800",
  [Tag.Performance]: "bg-purple-200 text-purple-800",
  [Tag.Athletics]: "bg-orange-200 text-orange-800",
  [Tag.CommunityService]: "bg-teal-200 text-teal-800",
  [Tag.CommunityBuilding]: "bg-teal-200 text-teal-800",
  [Tag.Speaker]: "bg-indigo-200 text-indigo-800",
  [Tag.Social]: "bg-pink-200 text-pink-800",
  [Tag.Party]: "bg-pink-200 text-pink-800",
  [Tag.GoodForBeginners]: "bg-gray-200 text-gray-800",
  [Tag.GoodForNewMembers]: "bg-gray-200 text-gray-800",
  [Tag.ProfessionalDevelopment]: "bg-blue-200 text-blue-800",
};

export const TagBlock = ({ tag }: TagProps) => {
  const tagColor = tagColors[tag] || "bg-gray-200 text-gray-800"; // Default color if no match
  return <span className={`rounded px-2 py-1 text-sm ${tagColor} w-fit line-clamp-1`}>{tag}</span>;
};
