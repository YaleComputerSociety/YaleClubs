"use client";

import { useState } from "react";
import { ApplicationSubmission, FormField } from "@/lib/types/applications";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";

interface ApplicationReviewProps {
  application: ApplicationSubmission;
  fields: FormField[];
  onApprove: (id: string, notes: string) => void;
  onReject: (id: string, notes: string) => void;
}

export default function ApplicationReview({ application, fields, onApprove, onReject }: ApplicationReviewProps) {
  const [notes, setNotes] = useState(application.notes || "");
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = async () => {
    setActionLoading(true);
    await onApprove(application.id, notes);
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    await onReject(application.id, notes);
    setActionLoading(false);
  };

  const getFieldLabel = (fieldId: string) => {
    return fields.find((f) => f.id === fieldId)?.label || "Unknown Field";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{application.studentEmail}</h2>
            <p className="text-sm text-gray-600 mt-1">NetID: {application.studentNetId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Submitted: {new Date(application.submittedAt).toLocaleDateString()}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                application.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : application.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Responses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Application Responses</h3>
        {application.responses.map((response, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">{getFieldLabel(response.fieldId)}</h4>
            {response.value ? <p className="text-gray-700 whitespace-pre-wrap break-words">{response.value}</p> : null}
            {response.fileUrl ? (
              <a
                href={response.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-clubPurple hover:underline font-medium mt-2 inline-block"
              >
                📎 View Uploaded File
              </a>
            ) : null}
          </div>
        ))}
      </div>

      {/* Review Section */}
      {application.status === "pending" && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900">Review Decision</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare size={16} className="inline mr-2" />
              Review Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for your records..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clubPurple resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={18} />
              Approve Application
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle size={18} />
              Reject Application
            </button>
          </div>
        </div>
      )}

      {/* Previously Reviewed */}
      {application.status !== "pending" && application.reviewedAt && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-700">
            <strong>Decision:</strong> {application.status === "accepted" ? "✓ Approved" : "✗ Rejected"} by{" "}
            {application.reviewedBy || "Unknown"} on {new Date(application.reviewedAt).toLocaleDateString()}
          </p>
          {application.notes && (
            <p className="text-sm text-gray-700 mt-2">
              <strong>Notes:</strong> {application.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
