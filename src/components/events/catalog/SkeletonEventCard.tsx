"use client";

const SkeletonEventCard = () => {
  const skeletonBlockStyle = "h-4 bg-gray-300/30 rounded";

  return (
    <div className="flex flex-col cursor-pointer rounded-lg">
      <div className="aspect-square shadow-md animate-pulse relative mb-4 border border-gray-100 bg-gray-300/30 rounded-lg" />
      <div className="flex flex-col gap-y-1">
        <div className={`${skeletonBlockStyle} line-clamp-1 w-1/2`} />
        <div className={`${skeletonBlockStyle} line-clamp-1`} />

        <div className="flex flex-col gap-y-1 text-sm mb-2">
          <div className={`${skeletonBlockStyle} w-1/3`} />
          <div className={`${skeletonBlockStyle} w-2/3`} />
        </div>
        <div className={`${skeletonBlockStyle} w-2/3`} />
      </div>
    </div>
  );
};

export default SkeletonEventCard;
