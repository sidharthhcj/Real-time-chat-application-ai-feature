import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import Message from "./models/Message.js";
import aiRoutes from "./routes/aiRoutes.js";
import statusRoutes from "./routes/statusRoutes.js";


/* ================= APP & SERVER ================= */
const app = express();
const server = http.createServer(app);

/* ================= CORS ================= */
const allowedOrigins = [
 "http://localhost:5173",
 "https://real-time-chat-application-ai-featu.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors()); 
app.use(express.json());

// Serve uploaded files (status images)
app.use("/uploads", express.static("uploads"));

/* ================= ROUTES ================= */
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/status", statusRoutes);
/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

/* ================= SOCKET AUTH ================= */
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

/* ================= SOCKET EVENTS ================= */
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.userId);

  onlineUsers.set(socket.userId, socket.id);

  const getSocketId = (userId) => onlineUsers.get(userId);

  // join private room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });

  // send message
  socket.on("send-message", async ({ roomId, message, receiver }) => {
    try {
      await Message.create({
        sender: socket.userId,
        receiver,
        content: message,
        roomId,
      });

      socket.to(roomId).emit("receive-message", {
        message,
        sender: socket.userId,
        roomId,
      });
    } catch (err) {
      socket.emit("error", { message: "Failed to save message" });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    console.log("❌ Socket disconnected:", socket.userId);
  });
});

/* ================= DB & SERVER START ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server + Socket running");
    });
  })
  .catch((err) => console.error(err));
