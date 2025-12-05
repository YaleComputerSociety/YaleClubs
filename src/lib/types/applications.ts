// Types for application forms and submissions

export interface FormField {
  id: string;
  type: "essay" | "file";
  label: string;
  required: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface ApplicationForm {
  id: string;
  clubId: string;
  clubName: string;
  fields: FormField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationSubmission {
  id: string;
  formId: string;
  clubId: string;
  studentNetId: string;
  studentEmail: string;
  responses: {
    fieldId: string;
    value: string; // For text responses
    fileUrl?: string; // For file uploads
  }[];
  status: "pending" | "accepted" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}
