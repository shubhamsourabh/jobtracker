import { Router } from "express";
import auth from "../middleware/auth.js";
import { z } from "zod";
import { APPLICATION_STATUS } from "../types/application.js";
import { Application } from "../models/Application.js";
import mongoose from "mongoose";
import type { QueryFilter } from "mongoose";
import { IApplication } from "../types/application.js";


const router = Router();
router.use(auth);

const createSchema = z.object({
    company: z.string().trim().min(1),
    role: z.string().trim().min(1),
    status: z.enum(APPLICATION_STATUS).optional(),
    dateApplied: z.coerce.date(),
    referral: z.string().trim().optional(),
    followUpDate: z.coerce.date().optional(),
});

const updateSchema = createSchema.partial();

const querySchema = z.object({
    q: z.string().trim().optional(),
    status: z.enum(APPLICATION_STATUS).optional(),
});


router.post("/", async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return res.status(400).json({ message: `${issue.path.join(".")}: ${issue.message}` })
    }
    try {
        const application = await Application.create({
            ...parsed.data,
            owner: req.user._id,
        });
        res.status(201).json(application);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
})

router.get("/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid id" });
    }
    try {
        const application = await Application.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.json(application);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
})

router.put("/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid id" });
    }
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return res.status(400).json({ message: `${issue.path.join(".")}: ${issue.message}` })
    }
    try {
        const application = await Application.findOneAndUpdate({
            _id: req.params.id,
            owner: req.user._id,
        }, parsed.data, { returnDocument: "after", runValidators: true })
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.json(application);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
})

router.delete("/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid id" });
    }
    try {
        const application = await Application.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
})

router.get("/", async (req, res) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return res.status(400).json({ message: `${issue.path.join(".")}: ${issue.message}` })
    }

    const filter: QueryFilter<IApplication> = { owner: req.user._id };
    if (typeof parsed.data.q === "string" && parsed.data.q) {
        const escaped = parsed.data.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.company = { $regex: escaped, $options: "i" };
    }
    if (parsed.data.status) filter.status = parsed.data.status;
    try {
        const applications = await Application.find(filter).sort({ dateApplied: -1 });
        return res.json(applications);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
})



export default router;