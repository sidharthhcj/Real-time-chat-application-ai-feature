import express from "express";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

let genAI;
function getGenAI() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

// 🔐 AUTH
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

/* ================= SMART REPLY ================= */
router.post("/smart-reply", auth, async (req, res) => {
  const { lastMessage } = req.body;
  if (!lastMessage) return res.json({ replies: [] });

  try {
    const model = getGenAI().getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const prompt = `
Give exactly 3 short friendly chat replies for:
"${lastMessage}"

Return each reply on new line.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const replies = text
      .split("\n")
      .map(r => r.replace(/^\d+[\).\s]*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    res.json({ replies });

  } catch (err) {
    console.error("GEMINI ERROR:", err.message);
    res.status(500).json({ error: "AI smart reply failed" });
  }
});

/* ================= SUMMARIZE CHAT ================= */
router.post("/summarize", auth, async (req, res) => {
  const { messages } = req.body;
  if (!messages || messages.length === 0) return res.json({ summary: "No messages to summarize." });

  try {
    const model = getGenAI().getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const chatLog = messages.map(m => `${m.sender}: ${m.message}`).join("\n");
    const prompt = `
Summarize this chat conversation in 2-3 concise sentences. Focus on key topics discussed:

${chatLog}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();

    res.json({ summary });

  } catch (err) {
    console.error("GEMINI SUMMARIZE ERROR:", err.message);
    res.status(500).json({ error: "AI summarize failed" });
  }
});

export default router;
