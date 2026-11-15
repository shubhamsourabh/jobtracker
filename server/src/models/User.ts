import mongoose,{ Schema } from "mongoose"

export interface IUser {
    name: string,
    email: string,
    password: string
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 60 },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 6 characters"],
            select: false,
        },
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);