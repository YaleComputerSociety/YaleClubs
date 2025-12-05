"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FormField } from "@/lib/types/applications";
import { Send, ArrowLeft } from "lucide-react";

export default function ApplicationFormPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn } = useAuth();

  const clubId = params.id as string;
  const [clubName, setClubName] = useState<string>("");
  const [formFields] = useState<FormField[]>([
    {
      id: "field_1",
      type: "essay",
      label: "Why do you want to join this club?",
      required: true,
      placeholder: "Share your motivation and interests...",
      maxLength: 5000,
    },
    {
      id: "field_2",
      type: "file",
      label: "Portfolio or Resume (Optional)",
      required: false,
    },
  ]);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/api/auth/redirect");
      return;
    }

    // In a real app, fetch the form for this club:
    // const response = await axios.get(`/api/applications/forms/${clubId}`);
    // setFormFields(response.data.fields);

    // Mock club name mapping
    const clubNames: { [key: string]: string } = {
      club1: "Computer Science Club",
      club2: "Photography Club",
      club3: "Debate Society",
    };

    setClubName(clubNames[clubId] || "Club Application");
  }, [clubId, isLoggedIn, router]);

  const handleTextChange = (fieldId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleFileChange = (fieldId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileNames((prev) => ({
        ...prev,
        [fieldId]: file.name,
      }));
      // In a real app, you would upload the file here
      setResponses((prev) => ({
        ...prev,
        [fieldId]: `file:///${file.name}`,
      }));
    }
  };

  const validateForm = () => {
    for (const field of formFields) {
      if (field.required && !responses[field.id]) {
        alert(`Please complete: ${field.label}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, this would POST to your API:
      // await axios.post("/api/applications/submit", {
      //   clubId,
      //   responses: formFields.map((field) => ({
      //     fieldId: field.id,
      //     value: responses[field.id] || "",
      //   })),
      // });

      setSubmitted(true);
      setTimeout(() => {
        router.push("/applications/student");
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  if (submitted) {
    return (
      <main className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center pt-32 pb-20 px-5">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your application to {clubName}. The club leaders will review it and get back to you soon.
            </p>
            <p className="text-sm text-gray-500">Redirecting to your applications...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-grow pt-32 pb-20 px-5 md:px-20">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-clubPurple hover:text-clubPurple font-semibold mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          {/* Form Container */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{clubName}</h1>
            <p className="text-gray-600 mb-8">Submit your application below. All fields marked with * are required.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === "essay" && (
                    <>
                      <textarea
                        value={responses[field.id] || ""}
                        onChange={(e) => handleTextChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        required={field.required}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clubPurple focus:border-transparent resize-none"
                        rows={6}
                      />
                      {field.maxLength && (
                        <p className="text-xs text-gray-500">
                          {(responses[field.id] || "").length} / {field.maxLength} characters
                        </p>
                      )}
                    </>
                  )}

                  {field.type === "file" && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-clubPurple transition cursor-pointer bg-gray-50">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(field.id, e)}
                        className="hidden"
                        id={`file_${field.id}`}
                        required={field.required}
                        accept="*/*"
                      />
                      <label htmlFor={`file_${field.id}`} className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <p className="text-gray-700 font-medium">
                            {fileNames[field.id] || "Click to upload or drag and drop"}
                          </p>
                          <p className="text-sm text-gray-500">SVG, PNG, JPG, PDF, ZIP or any file</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              ))}

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-clubPurple to-clubTaro text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Tips for Your Application</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Be authentic and genuine in your responses</li>
              <li>✓ Proofread before submitting</li>
              <li>✓ Highlight relevant experience or skills</li>
              <li>✓ You can track your application status in &quot;My Applications&quot;</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
