import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        caption: {
            type: String,
            default: "",
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // MongoDB TTL index — auto-deletes when expiresAt is reached
        },
    },
    { timestamps: true }
);

export default mongoose.model("Status", statusSchema);
