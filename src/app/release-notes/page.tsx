import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ReleaseNotes() {
  return (
    <div>
      <Header />
      <div className="pt-10 sm:pt-20 bg-primary_lightest dark:bg-transparent">Coming soon!</div>

      <Footer />
    </div>
    // <div className="pt-10 sm:pt-20 bg-primary_lightest dark:bg-transparent">
    //   <div className="flex flex-col justify-center mx-auto max-w-7xl px-5 sm:px-20">
    //     <h2 className="text-xl sm:text-4xl">YaleIMs Release Notes</h2>
    //     <p className="text-sm sm:text-md">January 21, 2025</p>
    //     <br></br>

    //     <section>
    //       <p className="text-sm sm:text-md">
    //         We are excited to announce the launch of YaleIMs, your new platform for tracking intramural sports
    //         schedules, scores, and odds. Whether you&apos;re playing, managing, or spectating, YaleIMs is here to keep
    //         you connected to your favorite games and teams. This release represents extensive design, development, and
    //         collaboration, and we are proud to share it with you.
    //       </p>
    //     </section>
    //     <br></br>

    //     <section>
    //       <h3 className="text-md sm:text-lg underline">Homepage</h3>
    //       <p className="text-sm sm:text-md">
    //         Your gateway to YaleIMs, the homepage offers an intuitive and visually engaging introduction to the
    //         platform. Designed by <strong>Asya Tarabar</strong> (with contribution from Lily Lin and Naomi Ling), the
    //         page provides a clear overview of where each of Yale’s 14 colleges stands, with detailed stats and dropdown
    //         options for all-time and prediction standings. Implementation was handled by{" "}
    //         <strong>Ephraim Akai-Nettey</strong>, <strong>Brian Di Bassinga</strong>, and <strong>Anna Xu</strong>,
    //         ensuring a smooth and responsive experience.
    //       </p>
    //     </section>
    //     <br></br>

    //     <section>
    //       <h3 className="text-md sm:text-lg underline">Scores Page</h3>
    //       <p className="text-sm sm:text-md">
    //         The scores page provides up-to-date game results in a sleek and functional interface. Designed
    //         collaboratively by <strong>Lily Lin</strong>, <strong>Naomi Ling</strong>, and <strong>Asya Tarabar</strong>
    //         , with additional contributions from <strong>Anna Xu</strong> and <strong>Ephraim Akai-Nettey</strong>, this
    //         page ensures easy access to past matches from the fall season. <strong>Kaitlyn Oikle</strong> implemented
    //         pagination to optimize performance and reduce excessive database reads, ensuring efficient functionality.
    //       </p>
    //     </section>
    //     <br></br>

    //     <section>
    //       <h3 className="text-md sm:text-lg underline">Schedules Page</h3>
    //       <p className="text-sm sm:text-md">
    //         Stay informed about upcoming games with the schedules page, designed primarily by <strong>Lily Lin</strong>.
    //         The frontend was developed by <strong>Anna Xu</strong>, while <strong>Kaitlyn Oikle</strong> added Google
    //         Calendar integration to help users sync games with their schedules. <strong>Daniel Morales</strong>{" "}
    //         implemented sign-up and unregister functionality, providing seamless participation management.
    //       </p>
    //     </section>
    //     <br></br>

    //     <section>
    //       <h3 className="text-md sm:text-lg underline">Profile Page</h3>
    //       <p className="text-sm sm:text-md">
    //         The profile page allows users to view their college’s upcoming games, games they’ve signed up for, and a
    //         personalized stats box. The design was a collaboration between <strong>Anna Xu</strong>,{" "}
    //         <strong>Lily Lin</strong>, <strong>Naomi Ling</strong>, and <strong>Asya Tarabar</strong>. Development and
    //         implementation were handled by <strong>Daniel Morales</strong>. The page uses the{" "}
    //         <a href="https://yalies.io/apidocs" target="_blank" rel="noreferrer" className="text-blue-500">
    //           Yalies API
    //         </a>{" "}
    //         for authentication, requiring users to log in with their Yale email. If you are unable to sign in, it may be
    //         because you’ve opted out of the Yale Facebook directory. This authentication system was developed by{" "}
    //         <strong>Anna Xu</strong> to ensure secure and reliable access.
    //       </p>
    //     </section>
    //     <br></br>

    //     <section>
    //       <h3 className="text-md sm:text-lg underline">Add-Scores Functionality</h3>
    //       <p className="text-sm sm:text-md">
    //         This feature allows administrators to submit and update game scores while handling interconnected updates to
    //         ranks, standings, and predictions. The Cloud Function, implemented by <strong>Kaitlyn Oikle</strong>, was
    //         designed to handle these complexities effectively. <strong>Ephraim Akai-Nettey</strong> contributed to rank
    //         updates, while <strong>Anna Xu</strong> and <strong>Diego Aspinwall</strong> ensured prediction outcomes
    //         were updated accurately. The interface, designed by <strong>Anna Xu</strong> and implemented by{" "}
    //         <strong>Kaitlyn Oikle</strong>, is secure, with admin-only access.
    //       </p>
    //     </section>
    //     <br></br>

    //     <section>
    //       <h3 className="text-md sm:text-lg underline">Odds Feature</h3>
    //       <p className="text-sm sm:text-md">
    //         The odds feature provides predictions based on historical game data. The prediction algorithm, based on the{" "}
    //         <a
    //           href="https://www.investopedia.com/money-line-bet-5217219"
    //           target="_blank"
    //           rel="noreferrer"
    //           className="text-blue-500"
    //         >
    //           Money Line
    //         </a>
    //         , was developed by <strong>Shankara Abbineni</strong>. The interface was designed by{" "}
    //         <strong>Lleyton Emery</strong> and implemented by <strong>Lleyton Emery</strong>,{" "}
    //         <strong>Diego Aspinwall</strong>, and <strong>Anna Xu</strong>. <strong>Diego Aspinwall</strong> developed
    //         cloud functions for adding, canceling, and viewing predictions, while <strong>Anna Xu</strong> created the
    //         prediction leaderboard and username functionality. Collaborative support from{" "}
    //       </p>
    //     </section>
    //     <br></br>

    //     <section>
    //       <h3 className="text-md sm:text-lg underline">Built with Modern Tools</h3>
    //       <p className="text-sm sm:text-md">
    //         YaleIMs is powered by Next.js, styled with Tailwind CSS, and hosted on Firebase, ensuring a fast,
    //         responsive, and reliable platform.
    //       </p>
    //     </section>
    //     <br></br>

    //     <section>
    //       <h3 className="text-md sm:text-lg underline">Acknowledgments</h3>
    //       <p className="text-sm sm:text-md">
    //         This release is the result of a dedicated team effort. Our thanks to everyone who contributed:
    //       </p>
    //       <ul className="list-disc list-inside text-sm sm:text-md pl-10">
    //         <li>
    //           <strong>Anna Xu</strong>: Team leader, coordinating efforts across all features.
    //         </li>
    //         <li>
    //           <strong>Asya Tarabar</strong>: Contributed to the design of the app, thoughtfully curating a cohesive and
    //           user-friendly, vibrant, and engaging experience.
    //         </li>
    //         <li>
    //           <strong>Brian Di Bassinga</strong>: Implemented the leaderboard cloud function and set up Firebase and the
    //           database infrastructure.
    //         </li>
    //         <li>
    //           <strong>Daniel Morales</strong>: Developed the profile page, including functionality for signing up and
    //           unregistering for games.
    //         </li>
    //         <li>
    //           <strong>Diego Aspinwall</strong>: Led the development of the Odds feature. Built cloud functions for
    //           adding, canceling, and viewing predictions in the odds feature.
    //         </li>
    //         <li>
    //           <strong>Ephraim Akai-Nettey</strong>: Implemented the homepage, contributed to the scores page, and
    //           developed rank updates for the add-scores functionality.
    //         </li>
    //         <li>
    //           <strong>Eric Yoon</strong>: Provided expertise and advice on the Yalies API.
    //         </li>
    //         <li>
    //           <strong>Ethan Mathieu</strong>: Offered high-level guidance and collaborative support for the odds
    //           feature.
    //         </li>
    //         <li>
    //           <strong>Kaitlyn Oikle</strong>: Implemented the schedules page, add-scores functionality, Google Calendar
    //           integration, and admin-only route protections.
    //         </li>
    //         <li>
    //           <strong>Lily Lin</strong>: Contributed to the design of the app, thoughtfully curating a cohesive and
    //           user-friendly, vibrant, and engaging experience.
    //         </li>
    //         <li>
    //           <strong>Lorenss Martinsons</strong>: Provided advice and guidance as the former Director of Development.
    //         </li>
    //         <li>
    //           <strong>Lleyton Emery</strong>: Designed and implemented the interface for the odds feature.
    //         </li>
    //         <li>
    //           <strong>Naomi Ling</strong>: Contributed to the design of the app, thoughtfully curating a cohesive and
    //           user-friendly, vibrant, and engaging experience.
    //         </li>
    //         <li>
    //           <strong>Shankara Abbineni</strong>: Developed the algorithm for likely odds predictions using the money
    //           line and past game data.
    //         </li>
    //       </ul>
    //     </section>
    //     <br></br>

    //     <section>
    //       <p className="text-sm sm:text-md">
    //         Thank you for being part of our journey. Your feedback is invaluable as we continue to improve YaleIMs.
    //         Enjoy exploring the platform!
    //       </p>
    //     </section>
    //     <br></br>
    //     <br></br>
    //     <br></br>
    //   </div>
    // </div>
  );
}
