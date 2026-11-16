import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

const router = Router();

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET is not set");



const registerSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(60),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(1, "Password must be at least 8 characters"),
})

router.post("/register", async (req, res) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: result.error.issues[0].message })
    const { name, email, password } = result.data;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email is already registered" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
});

router.post("/login", async (req, res) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: result.error.issues[0].message })
    const { email, password } = result.data;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
})

router.get("/me", auth, (req, res) => res.json({ user: req.user }));

export default router;