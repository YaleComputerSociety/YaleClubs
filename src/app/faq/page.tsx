"use client";

import Dropdown from "@/components/faq/Dropdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function FAQ() {
  const sections = [
    {
      title: "About Us",
      faqs: [
        {
          question: "What is YaleClubs?",
          answer:
            "YaleClubs is a platform for Yale students to learn more about the clubs and organizations on campus.",
        },
        {
          question: "Who runs YaleClubs?",
          answer: "YaleClubs is run by a small team of volunteers within the Yale Computer Society.",
          links: [
            { label: "Team", url: "/about" },
            {
              label: "Yale Computer Society",
              url: "https://yalecomputersociety.org/",
            },
          ],
        },
        {
          question: "What is the problem with club finding currently / Why YaleClubs?",
          answer: "Other resources are difficult to traverse and lack updated information for unoffical clubs at Yale",
        },
      ],
    },
    {
      title: "Using YaleClubs",
      faqs: [
        {
          question: "Who can use YaleClubs?",
          answer:
            "The YaleClubs catalog of organizations is a publicly accessibl, however only Yale students can view the associated events. ",
        },
        {
          question: "Where can I submit feedback or bugs?",
          answer:
            "If you have a suggestion or find a bug, please submit our general feedback form. We'll be in touch as soon as possible.",
          links: [{ label: "General Feedback Form", url: "https://yaleclubs.canny.io/" }],
        },
        {
          question: "How can I contribute?",
          answer:
            "The YaleClubs website is open-source and available at our Github repository. If you'd like to join the team, apply to the Yale Computer Society.",
          links: [
            {
              label: "Github Repository",
              url: "https://github.com/YaleComputerSociety/yaleims",
            },
            {
              label: "Yale Computer Society",
              url: "https://yalecomputersociety.org/join",
            },
          ],
        },
        {
          question: "Do you have a privacy policy?",
          answer: "You can find our privacy policy here.",
          links: [{ label: "Privacy Policy", url: "/privacy-policy" }],
        },
      ],
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen py-8 px-4 sm:px-10">
        <div className="max-w-3xl mx-auto mt-10">
          <h1 className="text-lg sm:text-3xl font-bold text-center mb-2 sm:mb-6">Frequently Asked Questions</h1>
          <p className="text-center mb-3">
            Have another question?{" "}
            <Link className="text-blue-500" href="https://yaleims.canny.io" target="_blank">
              Contact us
            </Link>
            .
          </p>
          {sections.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-lg sm:text-2xl font-semibold mb-4">{section.title}</h2>
              <div className="space-y-4 ml-5">
                {section.faqs.map((faq, i) => (
                  <Dropdown key={i} question={faq.question} answer={faq.answer} links={faq.links || []} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
