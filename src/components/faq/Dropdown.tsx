import { useState, useRef } from "react";
import { SlArrowRight } from "react-icons/sl";
import { SlArrowDown } from "react-icons/sl";

interface Link {
  label: string;
  url: string;
}

interface DropdownProps {
  question: string;
  answer: string;
  links?: Link[];
}

export default function Dropdown({ question, answer, links }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Function to replace labels in the answer with links
  const getLinkedAnswer = () => {
    let modifiedAnswer = answer;
    if (links) {
      links.forEach(({ label, url }) => {
        const regex = new RegExp(`(${label})`, "gi");
        modifiedAnswer = modifiedAnswer.replace(
          regex,
          `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>`,
        );
      });
    }
    return modifiedAnswer;
  };

  return (
    <div className="border-b border-gray-400 border-1 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-sm sm:text-md font-medium hover:text-blue-500 focus:outline-none"
      >
        {question}
        {isOpen ? (
          <SlArrowDown className="text-lg transition-transform" />
        ) : (
          <SlArrowRight className="text-lg transition-transform" />
        )}
      </button>
      <div
        ref={contentRef}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "h-auto opacity-100" : "h-0 opacity-0"
        }`}
        style={{
          height: isOpen ? `${contentRef.current?.scrollHeight || 0}px` : "0px",
        }}
      >
        <div className="mt-2 text-sm">
          <p dangerouslySetInnerHTML={{ __html: getLinkedAnswer() }} />
        </div>
      </div>
    </div>
  );
}
