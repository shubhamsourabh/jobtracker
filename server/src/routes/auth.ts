import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

const router = Router();

const registerSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(60),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

router.post("/register", async (req, res) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error.issues[0].message)
    const { name, email, password } = result.data;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message:"Email is already registered" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
});

export default router;