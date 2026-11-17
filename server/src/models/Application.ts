import { Schema, model } from "mongoose";
import { APPLICATION_STATUS, IApplication } from "../types/application.js";

const applicationSchema = new Schema<IApplication>(
    {
        company: { type: String, required: true, trim: true },
        role: { type: String, required: true, trim: true },
        status: { type: String, enum: APPLICATION_STATUS, default: "applied" },
        dateApplied: { type: Date, required: true },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        referral: { type: String, trim: true },
        followUpDate: { type: Date },
    },
    { timestamps: true }
);

export const Application = model("Application", applicationSchema);