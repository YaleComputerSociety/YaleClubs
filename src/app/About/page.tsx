import Footer from "@/components/Footer";
import Header from "@/components/Header";
import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Yale Clubs 🎓</h1>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Discover the vibrant community of clubs and organizations at Yale University. From academic societies and
            volunteer groups to sports teams and cultural clubs, there’s something here for everyone. Dive into
            opportunities that will inspire you, connect you, and help you grow.
          </p>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Whether you’re looking to explore a new passion, develop your leadership skills, or make lifelong
            friendships, Yale’s clubs are the perfect place to start. Join us in building a community that’s as diverse
            and dynamic as the students who make it up.
          </p>
        </div>

        <div className="max-w-3xl text-center mt-10">
          <h2 className="text-3xl font-bold mb-6">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
                {member.website && (
                  <a href={member.website} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    {member.website}
                  </a>
                )}
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
  { name: "Addison Goolsbee", role: "Team Lead", website: "https://addisongoolsbee.com" },
  { name: "Lauren Lee", role: "Developer" },
  { name: "Koray Akduman", role: "Developer", website: "https://korayakduman.com" },
  { name: "Grady Yu", role: "Developer" },
];

export default AboutPage;
