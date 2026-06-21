import { ApplicationStatus, IApplication } from "@/lib/models/Application";
import { ClubLeader, IClub } from "@/lib/models/Club";
import {
  buildStatusUpdateNotifications,
  sendApplicationNotifications,
} from "@/lib/applicationNotifications";

export async function updateApplicationStatus(
  application: IApplication,
  verifiedEmail: string,
  status: ApplicationStatus,
  reviewerNote?: string,
): Promise<IApplication> {
  application.status = status;
  application.reviewerEmail = verifiedEmail;
  if (reviewerNote !== undefined) {
    application.reviewerNote = reviewerNote;
  }
  await application.save();

  await sendApplicationNotifications(
    buildStatusUpdateNotifications(
      application.clubName,
      application.applicantEmail,
      status,
      application.reviewerNote,
    ),
  );

  return application;
}

export async function assertLeaderOrAdmin(
  club: IClub,
  verifiedEmail: string,
  isAdmin: boolean,
): Promise<boolean> {
  if (isAdmin) return true;
  return club.leaders.some((leader: ClubLeader) => leader.email === verifiedEmail);
}
