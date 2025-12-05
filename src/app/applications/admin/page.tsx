"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FormBuilder from "@/components/applications/FormBuilder";
import FormPreview from "@/components/applications/FormPreview";
import ApplicationReview from "@/components/applications/ApplicationReview";
import { FormField, ApplicationSubmission } from "@/lib/types/applications";
import { Save, Eye, EyeOff, FileText, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  // State for form building
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [clubName, setClubName] = useState<string>("");
  const [userClubs, setUserClubs] = useState<{ id: string; name: string }[]>([]);
  const [savedForms, setSavedForms] = useState<{ [key: string]: FormField[] }>({});

  // State for application review
  const [selectedApplication, setSelectedApplication] = useState<ApplicationSubmission | null>(null);
  const [applications, setApplications] = useState<ApplicationSubmission[]>([]);

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"forms" | "applications">("forms");

  // Check auth
  useEffect(() => {
    if (!isLoggedIn || (user?.role !== "admin" && user?.role !== "board")) {
      router.push("/");
    }
  }, [isLoggedIn, user, router]);

  // Mock user clubs for demo
  useEffect(() => {
    // In a real app, this would fetch clubs where the user is an admin/board member
    setUserClubs([
      { id: "club1", name: "Computer Science Club" },
      { id: "club2", name: "Photography Club" },
      { id: "club3", name: "Debate Society" },
    ]);
  }, []);

  // Load form when club is selected
  const handleClubSelect = (clubId: string, name: string) => {
    setSelectedClub(clubId);
    setClubName(name);
    setFormFields(savedForms[clubId] || []);
    setShowPreview(false);
  };

  // Save form
  const handleSaveForm = async () => {
    if (!selectedClub) {
      alert("Please select a club first");
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, this would POST to your API
      // await axios.post("/api/applications/forms", {
      //   clubId: selectedClub,
      //   fields: formFields,
      // });

      setSavedForms((prev) => ({
        ...prev,
        [selectedClub]: formFields,
      }));

      setSuccessMessage("Form saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Error saving form");
    } finally {
      setIsSaving(false);
    }
  };

  // Mock handler for approving applications
  const handleApproveApplication = async (appId: string, notes: string) => {
    try {
      // In a real app: await axios.patch(`/api/applications/${appId}`, { status: "accepted", notes });
      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId
            ? {
                ...app,
                status: "accepted",
                reviewedAt: new Date(),
                reviewedBy: user?.netid || "admin",
                notes,
              }
            : app,
        ),
      );
      setSelectedApplication(null);
      setSuccessMessage("Application approved!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Error approving application");
    }
  };

  const handleRejectApplication = async (appId: string, notes: string) => {
    try {
      // In a real app: await axios.patch(`/api/applications/${appId}`, { status: "rejected", notes });
      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId
            ? {
                ...app,
                status: "rejected",
                reviewedAt: new Date(),
                reviewedBy: user?.netid || "admin",
                notes,
              }
            : app,
        ),
      );
      setSelectedApplication(null);
      setSuccessMessage("Application rejected!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Error rejecting application");
    }
  };

  // Mock applications data
  const mockApplications: ApplicationSubmission[] = [
    {
      id: "app1",
      formId: "form1",
      clubId: "club1",
      studentNetId: "jsmith123",
      studentEmail: "john.smith@yale.edu",
      responses: [
        {
          fieldId: "field_1",
          value:
            "I am passionate about computer science and want to contribute to the club by helping with web development projects.",
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
      id: "app2",
      formId: "form1",
      clubId: "club1",
      studentNetId: "jdoe456",
      studentEmail: "jane.doe@yale.edu",
      responses: [
        {
          fieldId: "field_1",
          value: "I have experience with machine learning and would love to work on AI projects with the club.",
        },
        {
          fieldId: "field_2",
          fileUrl: "https://example.com/resume.pdf",
        },
      ],
      status: "accepted",
      submittedAt: new Date("2024-11-28"),
      reviewedAt: new Date("2024-12-02"),
      reviewedBy: "admin",
      notes: "Strong background in ML",
    },
  ];

  if (!isLoggedIn) {
    return null;
  }

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-grow pt-32 pb-20 px-5 md:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Application Management</h1>
            <p className="text-lg text-gray-600">Create forms, manage applications, and make decisions</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("forms")}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === "forms"
                  ? "border-clubPurple text-clubPurple"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="inline mr-2" size={18} />
              Form Builder
            </button>
            <button
              onClick={() => {
                setActiveTab("applications");
                setApplications(mockApplications);
              }}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === "applications"
                  ? "border-clubPurple text-clubPurple"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <CheckCircle className="inline mr-2" size={18} />
              Review Applications
            </button>
          </div>

          {/* Form Builder Tab */}
          {activeTab === "forms" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form Builder */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
                {/* Club Selection */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Select Club</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userClubs.map((club) => (
                      <button
                        key={club.id}
                        onClick={() => handleClubSelect(club.id, club.name)}
                        className={`p-4 rounded-lg border-2 font-semibold transition ${
                          selectedClub === club.id
                            ? "border-clubPurple bg-clubPurple bg-opacity-10 text-clubPurple"
                            : "border-gray-200 text-gray-700 hover:border-clubPurple"
                        }`}
                      >
                        {club.name}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedClub && (
                  <>
                    <div className="border-t pt-8">
                      <FormBuilder fields={formFields} onFieldsChange={setFormFields} />
                    </div>

                    {/* Save Button */}
                    <div className="mt-8 flex gap-4">
                      <button
                        onClick={handleSaveForm}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-clubPurple text-white font-semibold rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
                      >
                        <Save size={18} />
                        {isSaving ? "Saving..." : "Save Form"}
                      </button>

                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                      >
                        {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                        {showPreview ? "Hide Preview" : "Show Preview"}
                      </button>
                    </div>
                  </>
                )}

                {!selectedClub && (
                  <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 text-lg">Select a club to start building a form</p>
                  </div>
                )}
              </div>

              {/* Preview Panel */}
              {showPreview && selectedClub && (
                <div className="lg:col-span-1">
                  <div className="sticky top-32 bg-gray-100 rounded-lg p-6 max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
                    <FormPreview fields={formFields} clubName={clubName} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Applications List */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Applications</h2>
                <div className="space-y-2">
                  {applications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No applications yet</p>
                  ) : (
                    applications.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApplication(app)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition ${
                          selectedApplication?.id === app.id
                            ? "border-clubPurple bg-clubPurple bg-opacity-10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="font-semibold text-gray-900 text-sm">{app.studentEmail}</p>
                        <p className="text-xs text-gray-600 mt-1">{new Date(app.submittedAt).toLocaleDateString()}</p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                            app.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : app.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {app.status}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Application Details */}
              <div className="lg:col-span-2">
                {selectedApplication ? (
                  <ApplicationReview
                    application={selectedApplication}
                    fields={
                      formFields.length > 0
                        ? formFields
                        : mockApplications[0].responses.map((_, i) => ({
                            id: `field_${i + 1}`,
                            type: "essay" as const,
                            label: `Question ${i + 1}`,
                            required: true,
                          }))
                    }
                    onApprove={handleApproveApplication}
                    onReject={handleRejectApplication}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <p className="text-gray-500 text-lg">Select an application to review</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
