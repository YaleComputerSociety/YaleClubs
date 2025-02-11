import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div className="pt-10 sm:pt-20 bg-primary_lightest dark:bg-transparent">
        <div className="flex flex-col justify-center mx-auto max-w-7xl px-5 sm:px-20">
          <h2 className="text-xl sm:text-4xl">Privacy Policy</h2>
          <p className="text-sm sm:text-md">Last Updated: January 23, 2024</p>
          <br></br>

          <section>
            <h3 className="text-md sm:text-lg underline">Introduction</h3>
            <p className="text-sm sm:text-md">
              Yale Clubs is an app designed for the Yale community to display information about upcoming campus events.
              To provide this service, we collect and use limited data as described below.
            </p>
          </section>
          <br></br>

          <section>
            <h3 className="text-md sm:text-lg underline">Data We Collect</h3>
            <ul className="list-disc list-inside text-sm sm:text-md">
              <li className="pl-10">
                <strong>Yale CAS Sign-In:</strong> Used for account creation and login, providing us with your name and
                email address.
              </li>
              <li className="pl-10">
                <a className="font-bold text-blue-500" href="https://yalies.io/apidocs">
                  Yalies API:
                </a>{" "}
                We fetch your email detect which clubs you are in leadership positions of.
              </li>
              <li className="pl-10">
                <strong>Cookies:</strong> Used for login and session management.
              </li>
              <li className="pl-10">
                <strong>Analytics:</strong> Google Analytics collects anonymized browsing behavior to improve the app.
              </li>
            </ul>
          </section>
          <br></br>

          <section>
            <h3 className="text-md sm:text-lg underline">Data Sharing</h3>
            <p className="text-sm sm:text-md">We do not share your personal data with third parties except:</p>
            <ul className="list-disc list-inside text-sm sm:text-md">
              <li className="pl-10">To comply with legal requirements.</li>
              <li className="pl-10">For internal use, such as assigning users to teams within the app.</li>
              <li className="pl-10">As required by Google Analytics for anonymized data collection.</li>
            </ul>
          </section>
          <br></br>

          <section>
            <h3 className="text-md sm:text-lg underline">Your Rights</h3>
            <p className="text-sm sm:text-md">
              We do not persist any information associated with your account. There is no data to delete as everything
              is session based.
            </p>
          </section>
          <br></br>

          <section>
            <h3 className="text-md sm:text-lg underline">Cookies and Analytics</h3>
            <p className="text-sm sm:text-md">
              Cookies help manage sessions, and Google Analytics helps us improve the app by analyzing anonymous usage
              data. For more details, visit{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-blue-600">
                Google’s Privacy Policy
              </a>
              .
            </p>
          </section>
          <br></br>

          <section>
            <h3 className="text-md sm:text-lg underline">Contact Us</h3>
            <p className="text-sm sm:text-md">
              If you have questions about this Privacy Policy, contact us at{" "}
              <a href="mailto:yalecomputersociety@gmail.com">yalecomputersociety@gmail.com</a>.
            </p>
          </section>
          <br></br>

          <section>
            <h3 className="text-md sm:text-lg underline">Limited Use Agreement</h3>
            <p className="text-sm sm:text-md">
              This app complies with the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600"
              >
                Google API Services User Data Policy
              </a>
              , including Limited Use requirements.
            </p>
          </section>
          <br></br>
          <br></br>
        </div>
      </div>
      <Footer />
    </>
  );
}
