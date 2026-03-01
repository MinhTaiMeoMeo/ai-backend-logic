require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        // Sử dụng model chuẩn để tránh lỗi 404 như trong log cũ của bạn
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Lỗi:", error);
        res.status(500).json({ error: "AI đang bận một chút, thử lại nhé!" });
    }
});

// Quan trọng: Phải ưu tiên process.env.PORT cho Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server chạy tại cổng ${PORT}`));
