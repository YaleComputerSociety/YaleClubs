import Link from "next/link";

import LogoSVG from "../../public/assets/logo";

const Header = () => {
  return (
    <div className="w-full flex flex-row fixed z-10 justify-between py-5 ph:px-5 px-10 md:px-[110px] bg-white">
      <Link href="/" className="flex flex-row items-center">
        <LogoSVG />
        <div className="ml-5 font-semibold text-[16px]">YaleClubs</div>
      </Link>

      <div className="flex flex-row items-center justify-center">
        <div className="ph:hidden sm:flex flex-row items-center gap-x-11 ">
          <Link href="/About">
            <div className="text-md">About</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
