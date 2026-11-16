import type { Request, Response, NextFunction } from "express";
import secret from "../config/env.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

interface TokenPayload {
    id: string;
}

function isTokenPayload(value: unknown): value is TokenPayload {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as { id?: unknown }).id === "string"
    );
}

export default async function auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        res.status(401).json({ message: "Not authenticated" });
        return;
    }

    if (!secret) {
        res.status(500).json({ message: "Server misconfigured" });
        return;
    }

    try {
        const payload: unknown = jwt.verify(token, secret);
        if (!isTokenPayload(payload)) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        const user = await User.findById(payload.id);
        if (!user) {
            res.status(401).json({ message: "User no longer exists" });
            return;
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });

    }
}