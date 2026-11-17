import { Router } from "express";
import auth from "../middleware/auth.js";
import { z } from "zod";
import { APPLICATION_STATUS } from "../types/application.js";
import { Application } from "../models/Application.js";
import mongoose from "mongoose";


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

router.get("/", async (req, res) => {
    try {
        const applications = await Application.find({ owner: req.user._id }).sort({ dateApplied: -1 });
        res.json(applications);
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
export default router;