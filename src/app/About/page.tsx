import Footer from "@/components/Footer";
import Header from "@/components/Header";
import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div>
      <div className="fixed top-0 z-50">
        <Header />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 mt-10">
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
          {/* Discover the vibrant community of clubs and organizations at Yale University. From academic societies and
          volunteer groups to sports teams and cultural clubs, there’s something here for everyone. Dive into
          opportunities that will inspire you, connect you, and help you grow. */}
          {/* <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Whether you’re looking to explore a new passion, develop your leadership skills, or make lifelong
            friendships, Yale’s clubs are the perfect place to start. Join us in building a community that’s as diverse
            and dynamic as the students who make it up.
          </p> */}
        </div>

        <div className="max-w-3xl text-center mt-10">
          <h2 className="text-3xl font-bold mb-6">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
                {member.website && (
                  <a href={member.website} target="_blank" rel="noopener noreferrer">
                    <img src="/assets/website-icon.png" alt="Website" className="inline-block w-4 h-4" />
                  </a>
                )}
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                    <img src="/assets/linkedin-icon.png" alt="Website" className="inline-block w-6 h-6" />
                  </a>
                )}
                {member.github && (
                  <a href={member.github} target="_blank" rel="noopener noreferrer">
                    <img src="/assets/github-icon.png" alt="Website" className="inline-block w-4 h-4" />
                  </a>
                )}
                {member.headshot && <img src={member.headshot} className="mt-5 aspect-square" />}
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
    role: "Team Lead",
    website: "https://addisongoolsbee.com",
    headshot: "assets/addison.jpg",
    linkedin: "https://www.linkedin.com/in/addisongoolsbee/",
    github: "https://github.com/addisongoolsbee",
  },
  {
    name: "Lauren Lee",
    role: "Developer",
    headshot: "assets/lauren.jpg",
    linkedin: "https://www.linkedin.com/in/laurenwylee/",
    github: "https://github.com/laurenwylee?",
  },
  {
    name: "Koray Akduman",
    role: "Developer",
    headshot: "assets/koray.jpeg",
    website: "https://korayakduman.com",
    linkedin: "https://www.linkedin.com/in/korayakduman/",
    github: "https://github.com/kakduman",
  },
  {
    name: "Grady Yu",
    role: "Developer",
    headshot: "assets/grady_yu.jpg",
    linkedin: "https://www.linkedin.com/in/gradyyu/",
    github: "https://github.com/Ragyudy",
  },
  {
    name: "Lucas Huang",
    role: "Developer",
    headshot: "assets/smile.jpg",
    website: "https://lucashua.ng/",
    linkedin: "https://www.linkedin.com/in/huangl16/",
    github: "",
  },
];

export default AboutPage;
