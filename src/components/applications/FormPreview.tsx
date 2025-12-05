"use client";

import { useState } from "react";
import { FormField } from "@/lib/types/applications";

interface FormPreviewProps {
  fields: FormField[];
  clubName: string;
}

export default function FormPreview({ fields, clubName }: FormPreviewProps) {
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [fileName, setFileName] = useState<{ [key: string]: string }>({});

  const handleTextChange = (fieldId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleFileChange = (fieldId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName((prev) => ({
        ...prev,
        [fieldId]: file.name,
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{clubName} Application</h2>
        <p className="text-gray-600">Please complete all required fields below</p>
      </div>

      {fields.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No fields configured for this form yet.</p>
        </div>
      ) : (
        <form className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "essay" && (
                <textarea
                  value={responses[field.id] || ""}
                  onChange={(e) => handleTextChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clubPurple focus:border-transparent resize-none"
                  rows={6}
                />
              )}

              {field.type === "file" && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-clubPurple transition cursor-pointer bg-gray-50">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(field.id, e)}
                    className="hidden"
                    id={`file_${field.id}`}
                    accept="*/*"
                  />
                  <label htmlFor={`file_${field.id}`} className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-gray-700 font-medium">
                        {fileName[field.id] || "Click to upload or drag and drop"}
                      </p>
                      <p className="text-sm text-gray-500">SVG, PNG, JPG, PDF or ZIP</p>
                    </div>
                  </label>
                </div>
              )}

              {field.type === "essay" && field.maxLength && (
                <p className="text-xs text-gray-500">
                  {(responses[field.id] || "").length} / {field.maxLength} characters
                </p>
              )}
            </div>
          ))}

          <div className="pt-6">
            <button
              type="submit"
              disabled={true}
              className="w-full px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
            >
              Submit (Preview Mode - Not Functional)
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
