import { ClubLeader } from "@/lib/models/Club";

export default function ScrollableLeaders({ leaders, isLoggedIn }: { leaders: ClubLeader[]; isLoggedIn: boolean }) {
  return (
    <>
      {leaders.length > 0 && (
        <div className="my-4">
          <div className="text-lg font-bold mb-2">Board Members</div>
          <div className="flex flex-col gap-2">
            {leaders.map((leader, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <div className="flex flex-col items-start">
                  <div className="flex flex-row justify-between w-full">
                    <div className="text-md font-semibold max-w-[160px] truncate pr-2">{leader.name}</div>
                    {(leader.year?.valueOf() || 0) > 0 && <div>{" '" + (leader.year ? leader.year % 100 : "")} </div>}
                  </div>
                  <div>{leader.role}</div>
                  {isLoggedIn && <div className="text-gray-500 max-w-[180px] truncate">{leader.email}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
