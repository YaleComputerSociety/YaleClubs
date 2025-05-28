import Link from "next/link";
import { FaPlus } from "react-icons/fa";

export default function CreateEventButton() {
  return (
    <Link href="/CreateUpdateEvent">
      <button className="group flex items-center font-semibold justify-center gap-3 flex-row rounded-full text-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-clubPurple to-clubBlurple hover:from-clubBlurple hover:to-clubPurple text-white px-8 py-4">
        <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
        Create Event
      </button>
    </Link>
  );
}
