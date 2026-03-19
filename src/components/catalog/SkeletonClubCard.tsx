"use client";

const skeletonBlockStyle = "h-4 bg-gray-300/30 rounded";

const SkeletonClubCard = () => {
  return (
    <div className="relative w-full">
      <div className="bg-white rounded-xl flex flex-col justify-between w-full h-full shadow-md animate-pulse">
        <div className="flex flex-row gap-2 sm:gap-4 px-3 py-2 md:px-4 md:py-3">
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <div className="h-6 w-3/5 bg-gray-300/40 rounded"></div>

            <div className="mt-2 h-5 w-1/2 bg-gray-300/30 rounded"></div>

            <div className="mt-2 space-y-2">
              <div className={skeletonBlockStyle}></div>
              <div className={`${skeletonBlockStyle} w-4/5`}></div>
              <div className={`${skeletonBlockStyle} w-3/5`}></div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="rounded-xl flex-shrink-0 bg-gray-300/40 w-[60px] h-[60px] sm:w-[80px] sm:h-[80px]" />

            <div className="flex flex-col items-center">
              <div className="w-[60px] sm:w-[80.1px] h-8 my-2 bg-gray-300/40 rounded-md" />
              <div className="h-4 w-[50px] bg-gray-300/30 rounded" />
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-100 py-2 px-3 md:px-4 rounded-b-xl">
          <div className="flex items-center justify-center">
            <div className="h-4 w-3/5 bg-gray-300/40 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonClubCard;