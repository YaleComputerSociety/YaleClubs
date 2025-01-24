import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-8">
        <div className="flex gap-5 flex-col sm:flex-row ">
          {/* Logo Section */}
          <div className="basis-1/3 text-black">
            <Link href="/" className="flex flex-row items-cente">
              <Image src="/assets/logo.svg" alt="Logo" width={35} height={35} unoptimized />
              <div className="ml-5 font-semibold text-xl">YaleClubs</div>
            </Link>
            <h2 className="text-xs mt-3">
              a{" "}
              <a className=" underline" href="https://yalecomputersociety.org/" target="_blank">
                yale computer society (y/cs)
              </a>
            </h2>
            <p>
              <span className="text-xs">
                and{" "}
                <a href="https://designatyale.com/" className=" underline">
                  design at yale (day)
                </a>{" "}
                product
              </span>
            </p>
          </div>

          <div className="basis-2/3 grid grid-cols-3 text-sm sm:text-md">
            {/* Explore Section */}
            <div>
              <h3 className="text-lg font-bold text-black">Explore</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <Link href="/Events" className="hover:underline">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:underline">
                    Catalog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Section */}
            <div>
              <h3 className="text-lg font-bold text-black ">Support</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <Link href="/faq" className="hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="https://yaleclubs.canny.io" className="hover:underline" target="_blank">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>

            {/* About Section */}
            <div>
              <h3 className="text-lg font-bold text-black">About</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <Link href="/about" className="hover:underline">
                    Team
                  </Link>
                </li>
                <li>
                  <Link href="/release-notes" className="hover:underline">
                    Release Notes
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/YaleComputerSociety/yaleclubs"
                    target="_blank"
                    className="hover:underline"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-right text-black">
          <p className="text-md">YaleClubs © {new Date().getFullYear()}</p>
        </div>
      </div>
      <br></br>
      <div className="text-center text-xs w-4/5 mx-auto text-gray-300 ">
        Yale is a registered trademark of Yale University. This website is student run and is maintained, hosted, and
        operated independently of Yale University. The activities on this website are not supervised or endorsed by Yale
        and information contained on this website does not necessarily reflect the opinions or official positions of the
        University. Furthermore, the information in this website is not guaranteed to be correct, complete, or
        up-to-date and is user-generated and thus not necessarily the opinion of the Yale Computer Society. YaleClubs
        retains full editorial control over the content on its platform.
      </div>
    </footer>
  );
}
