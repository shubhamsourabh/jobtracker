import type { Types } from "mongoose";

export const APPLICATION_STATUS = ["applied", "company_responded", "interview", "offer", "rejected", "withdrawn", "no_reply"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUS)[number];

export interface IApplication {
    company: string;
    role: string;
    status: ApplicationStatus;
    dateApplied: Date;
    owner: Types.ObjectId;
    referral?: string;
    followUpDate?: Date;
}