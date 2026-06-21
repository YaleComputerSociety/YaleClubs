import { ApplicationStatus } from "@/lib/models/Application";
import { EmailMessage, sendBatchEmails } from "@/lib/email";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  [ApplicationStatus.SUBMITTED]: "Submitted",
  [ApplicationStatus.IN_REVIEW]: "In Review",
  [ApplicationStatus.ACCEPTED]: "Accepted",
  [ApplicationStatus.REJECTED]: "Rejected",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getBaseUrl(): string {
  return process.env.BASE_URL ?? "https://yaleclubs.io";
}

export function buildNewApplicationNotifications(
  clubName: string,
  clubId: string,
  applicantEmail: string,
  applicantName: string | undefined,
  leaderEmails: string[],
): EmailMessage[] {
  const reviewUrl = `${getBaseUrl()}/applications/review/${clubId}`;
  const displayName = applicantName?.trim() || applicantEmail;

  return leaderEmails.map((email) => ({
    to: [email],
    subject: `New application for ${clubName}`,
    html: `<p><strong>${escapeHtml(displayName)}</strong> (${escapeHtml(applicantEmail)}) submitted an application for ${escapeHtml(clubName)}.</p><p><a href="${reviewUrl}">Review applications</a></p>`,
  }));
}

export function buildStatusUpdateNotifications(
  clubName: string,
  applicantEmail: string,
  status: ApplicationStatus,
  reviewerNote?: string,
): EmailMessage[] {
  const statusLabel = STATUS_LABEL[status];
  const noteHtml = reviewerNote?.trim()
    ? `<p>Note from reviewer: ${escapeHtml(reviewerNote.trim())}</p>`
    : "";

  return [
    {
      to: [applicantEmail],
      subject: `Application update for ${clubName}`,
      html: `<p>Your application to <strong>${escapeHtml(clubName)}</strong> is now <strong>${statusLabel}</strong>.</p>${noteHtml}`,
    },
  ];
}

export async function sendApplicationNotifications(messages: EmailMessage[]): Promise<void> {
  const result = await sendBatchEmails(messages);
  if (!result.success) {
    console.error(`Failed to send ${messages.length} application notification(s); sent ${result.sentCount}.`);
  }
}
