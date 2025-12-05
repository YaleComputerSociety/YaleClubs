"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ApplicationSubmission } from "@/lib/types/applications";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";

export default function StudentApplicationsPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  const [applications, setApplications] = useState<ApplicationSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationSubmission | null>(null);

  // Check auth
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/api/auth/redirect");
      return;
    }

    if (user?.role === "admin" || user?.role === "board") {
      router.push("/applications/admin");
      return;
    }
  }, [isLoggedIn, user, router]);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // In a real app: const response = await axios.get("/api/applications/student");
        // setApplications(response.data);

        // Mock data for demo
        setApplications([
          {
            id: "app1",
            formId: "form1",
            clubId: "club1",
            studentNetId: user?.netid || "student123",
            studentEmail: user?.email || "student@yale.edu",
            responses: [
              {
                fieldId: "field_1",
                value: "I am passionate about computer science and technology.",
              },
              {
                fieldId: "field_2",
                fileUrl: "https://example.com/portfolio.pdf",
              },
            ],
            status: "accepted",
            submittedAt: new Date("2024-11-15"),
            reviewedAt: new Date("2024-11-20"),
            reviewedBy: "admin",
            notes: "Great candidate!",
          },
          {
            id: "app2",
            formId: "form2",
            clubId: "club2",
            studentNetId: user?.netid || "student123",
            studentEmail: user?.email || "student@yale.edu",
            responses: [
              {
                fieldId: "field_1",
                value: "Photography is my passion and I want to explore it more.",
              },
              {
                fieldId: "field_2",
                fileUrl: "https://example.com/portfolio.pdf",
              },
            ],
            status: "pending",
            submittedAt: new Date("2024-12-01"),
          },
          {
            id: "app3",
            formId: "form3",
            clubId: "club3",
            studentNetId: user?.netid || "student123",
            studentEmail: user?.email || "student@yale.edu",
            responses: [
              {
                fieldId: "field_1",
                value: "I enjoy public speaking and debate.",
              },
              {
                fieldId: "field_2",
                fileUrl: "https://example.com/portfolio.pdf",
              },
            ],
            status: "rejected",
            submittedAt: new Date("2024-10-20"),
            reviewedAt: new Date("2024-10-25"),
            reviewedBy: "board_member",
            notes: "Limited debate experience",
          },
        ]);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn && user?.role !== "admin" && user?.role !== "board") {
      fetchApplications();
    }
  }, [isLoggedIn, user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="text-green-600" size={20} />;
      case "rejected":
        return <XCircle className="text-red-600" size={20} />;
      case "pending":
        return <Clock className="text-yellow-600" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-grow pt-32 pb-20 px-5 md:px-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Applications</h1>
            <p className="text-lg text-gray-600">Track your club applications and view decisions</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Accepted</p>
              <p className="text-3xl font-bold text-green-600">
                {applications.filter((a) => a.status === "accepted").length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {applications.filter((a) => a.status === "pending").length}
              </p>
            </div>
          </div>

          {/* Applications List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Applications</h2>
                {isLoading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : applications.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    You haven&apos;t applied to any clubs yet. Browse clubs and click &quot;Apply&quot; to get started!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {applications.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition ${
                          selectedApp?.id === app.id
                            ? "border-clubPurple bg-clubPurple bg-opacity-10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">CS Club</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Applied: {new Date(app.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusIcon(app.status)}
                        </div>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            app.status,
                          )}`}
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-2">
              {selectedApp ? (
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                  {/* Header */}
                  <div className="border-b pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">CS Club Application</h2>
                        <p className="text-sm text-gray-600 mt-1">
                          Applied: {new Date(selectedApp.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {getStatusIcon(selectedApp.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                              selectedApp.status,
                            )}`}
                          >
                            {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Your Responses */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Application</h3>
                    <div className="space-y-4">
                      {selectedApp.responses.map((response, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-semibold text-gray-600 mb-2">Question {index + 1}</p>
                          {response.value && <p className="text-gray-800 whitespace-pre-wrap">{response.value}</p>}
                          {response.fileUrl && (
                            <a
                              href={response.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-clubPurple hover:underline font-medium inline-block mt-2"
                            >
                              📎 View Uploaded File
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decision */}
                  {selectedApp.status !== "pending" && selectedApp.reviewedAt && (
                    <div
                      className={`rounded-lg p-4 ${
                        selectedApp.status === "accepted"
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">
                        {selectedApp.status === "accepted"
                          ? "🎉 Congratulations! You've been accepted!"
                          : "Thank you for applying!"}
                      </p>
                      {selectedApp.notes && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Feedback:</strong> {selectedApp.notes}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        Decision made on {new Date(selectedApp.reviewedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {selectedApp.status === "pending" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="font-semibold text-yellow-900">⏳ Your application is under review</p>
                      <p className="text-sm text-yellow-800 mt-2">
                        The club leaders will review your application and get back to you soon.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Select an application to view details</p>
                </div>
              )}
            </div>
          </div>

          {/* Apply Button */}
          <div className="mt-12 bg-gradient-to-r from-clubPurple to-clubTaro rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Want to apply to more clubs?</h3>
            <p className="text-lg mb-6">Browse our club catalog and start your applications today</p>
            <button
              onClick={() => router.push("/")}
              className="px-8 py-3 bg-white text-clubPurple font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Browse Clubs
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
