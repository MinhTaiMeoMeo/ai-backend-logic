require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Model rẻ và nhanh nhất hiện nay
            messages: [{ role: "user", content: userMessage }],
        });
        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi kết nối AI rồi!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));