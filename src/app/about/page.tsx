import Footer from "@/components/Footer";
import Header from "@/components/Header";
import React from "react";
import MemberCard from "@/components/about/MemberCard";

const AboutPage: React.FC = () => {
  return (
    <div>
      <div className="fixed top-0 z-50">
        <Header />
      </div>
      <div className="flex flex-col items-center min-h-screen p-6 mt-[10svh] gap-[5svh]">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Yale Clubs 🎓</h1>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            YaleClubs provides a streamlined platform to explore student organizations at Yale University. Whether you
            are a first-year seeking your niche or looking for activities to balance academics, YaleClubs connects you
            to student reviews, organization descriptions, and club details—all in one place.
          </p>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            YaleClubs is a project of the{" "}
            <a
              href={"https://yalecomputersociety.org/"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              Yale Computer Society
            </a>
          </p>
        </div>

        <div className="max-w-6xl text-center mt-10">
          <h2 className="text-3xl font-bold mb-6">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white p-6 rounded-lg shadow-md">
                <MemberCard member={member}></MemberCard>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const teamMembers = [
  {
    name: "Addison Goolsbee",
    role: "CEO",
    website: "https://addisongoolsbee.com",
    headshot: "/assets/people/addison.jpg",
    linkedin: "https://www.linkedin.com/in/addisongoolsbee/",
    github: "https://github.com/addisongoolsbee",
  },
  {
    name: "Lauren Lee",
    role: "Developer",
    headshot: "/assets/people/lauren.jpg",
    linkedin: "https://www.linkedin.com/in/laurenwylee/",
    github: "https://github.com/laurenwylee",
  },
  {
    name: "Koray Akduman",
    role: "Developer",
    headshot: "/assets/people/koray.jpg",
    website: "https://korayakduman.com",
    linkedin: "https://www.linkedin.com/in/korayakduman/",
    github: "https://github.com/kakduman",
  },
  {
    name: "Grady Yu",
    role: "Developer",
    headshot: "/assets/people/grady.jpg",
    linkedin: "https://www.linkedin.com/in/gradyyu/",
    github: "https://github.com/Ragyudy",
  },
  {
    name: "Lucas Huang",
    role: "Developer",
    headshot: "/assets/people/lucas.jpg",
    website: "https://lucashua.ng/",
    linkedin: "https://www.linkedin.com/in/huangl16/",
    github: "https://github.com/Quintec",
  },
  {
    name: "Francis Fan",
    role: "Developer",
    headshot: "/assets/people/francis.jpg",
    website: "https://francis-fan05.onrender.com/",
    linkedin: "https://www.linkedin.com/in/francis-fan-51293a236/",
    github: "https://github.com/francisfan0",
  },
  {
    name: "Ethan Mathieu",
    role: "Developer",
    headshot: "/assets/people/ethan.jpg",
    website: "https://ethanmathieu.com/",
    linkedin: "https://www.linkedin.com/in/ethan-mathieu/",
    github: "https://github.com/emath12",
  },
  {
    name: "Alyssa Quarles",
    role: "Developer",
    headshot: "/assets/people/alyssa.png",
    linkedin: "https://www.linkedin.com/in/alyssa-quarles-65735b316/",
    github: "https://github.com/AlyssaQuarles1",
  },
  {
    name: "Marie Bong",
    role: "Marketing Lead",
    headshot: "/assets/people/marie.jpg",
    linkedin: "https://www.linkedin.com/in/mariebong/",
  },
  {
    name: "Michelle Zheng",
    role: "Marketing",
    headshot: "/assets/people/michy.jpg",
    linkedin: "https://www.linkedin.com/in/mzheng8/",
  },
  {
    name: "Amanda Huang",
    role: "Marketing",
    headshot: "/assets/people/amanda.jpg",
    linkedin: "https://linkedin.com/in/amandaminhuang/",
  },
  {
    name: "Lily Lin",
    role: "UX Designer",
    headshot: "/assets/people/lily.jpg",
    linkedin: "https://linkedin.com/in/zhiyu-lily-lin/",
  },
  {
    name: "Aditya Das",
    role: "UX Designer",
    headshot: "/assets/people/aditya.jpg",
    linkedin: "https://linkedin.com/in/aditya-das-me/",
  },
  {
    name: "Kris Aziabor",
    role: "UX Designer",
    headshot: "/assets/people/kris.jpg",
    linkedin: "https://linkedin.com/in/krisaziabor/",
  },
  {
    name: "Mateo Balbarin",
    role: "Marketing Ops",
    headshot: "/assets/people/matteo.jpg",
    linkedin: "https://linkedin.com/in/mateo-balbarin-849395237/",
    github: "https://github.com/mateo1442/",
  },
  {
    name: "Michael Chu",
    role: "Ideas Man",
    headshot: "/assets/people/michael.jpg",
    linkedin: "https://linkedin.com/in/michael-chu-a28034203/",
  },
];

export default AboutPage;
