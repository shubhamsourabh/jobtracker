export const APPLICATION_STATUS = [
  "applied",
  "company_responded",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
  "no_reply",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUS)[number];

export type Application = {
  _id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  dateApplied: string;
  referral?: string;
  followUpDate?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
};
   