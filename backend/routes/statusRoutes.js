import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import Status from "../models/Status.js";

const router = express.Router();

// Ensure upload directory exists
const uploadDir = "uploads/statuses";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
        cb(null, true);
    } else {
        cb(new Error("Only image files (jpg, png, gif, webp) are allowed"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// 🔐 AUTH middleware
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        return res.sendStatus(403);
    }
};

/* ================= UPLOAD STATUS ================= */
router.post("/", auth, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const status = await Status.create({
            user: req.userId,
            imageUrl: `/uploads/statuses/${req.file.filename}`,
            caption: req.body.caption || "",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });

        const populated = await status.populate("user", "username email");

        res.status(201).json(populated);
    } catch (err) {
        console.error("Status upload error:", err.message);
        res.status(500).json({ message: "Failed to upload status" });
    }
});

/* ================= GET ALL STATUSES (grouped by user) ================= */
router.get("/", auth, async (req, res) => {
    try {
        const statuses = await Status.find({ expiresAt: { $gt: new Date() } })
            .populate("user", "username email")
            .sort({ createdAt: -1 });

        // Group by user
        const grouped = {};
        statuses.forEach((s) => {
            const userId = s.user._id.toString();
            if (!grouped[userId]) {
                grouped[userId] = {
                    user: s.user,
                    statuses: [],
                };
            }
            grouped[userId].statuses.push({
                _id: s._id,
                imageUrl: s.imageUrl,
                caption: s.caption,
                createdAt: s.createdAt,
                expiresAt: s.expiresAt,
            });
        });

        // Convert to array, put current user's statuses first
        const result = Object.values(grouped);
        const myIndex = result.findIndex(
            (g) => g.user._id.toString() === req.userId
        );
        if (myIndex > 0) {
            const [mine] = result.splice(myIndex, 1);
            result.unshift(mine);
        }

        res.json(result);
    } catch (err) {
        console.error("Fetch statuses error:", err.message);
        res.status(500).json({ message: "Failed to fetch statuses" });
    }
});

/* ================= DELETE OWN STATUS ================= */
router.delete("/:id", auth, async (req, res) => {
    try {
        const status = await Status.findById(req.params.id);
        if (!status) return res.status(404).json({ message: "Status not found" });

        if (status.user.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Delete the image file
        const filePath = path.join(process.cwd(), status.imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Status.findByIdAndDelete(req.params.id);
        res.json({ message: "Status deleted" });
    } catch (err) {
        console.error("Delete status error:", err.message);
        res.status(500).json({ message: "Failed to delete status" });
    }
});

export default router;
