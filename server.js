require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' })); // Tăng giới hạn để nhận ảnh Base64

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `VAI TRÒ: Bạn là "AI Study Buddy", gia sư Socratic Việt Nam. 
NHIỆM VỤ: Phân tích hình ảnh hoặc văn bản người dùng gửi. Tuyệt đối không cho đáp án. 
Hãy đặt câu hỏi gợi mở để học sinh tự giải bài. Dùng LaTeX cho công thức.`;

app.post("/chat", async (req, res) => {
    const { message, image } = req.body;

    try {
        let messages = [{ role: "system", content: SYSTEM_PROMPT }];
        
        if (image) {
            // Nếu có ảnh, sử dụng model Vision của Groq
            messages.push({
                role: "user",
                content: [
                    { type: "text", text: message || "Hãy giúp mình bài tập trong ảnh này." },
                    { type: "image_url", image_url: { url: image } }
                ]
            });
        } else {
            messages.push({ role: "user", content: message });
        }

        const completion = await groq.chat.completions.create({
            messages: messages,
            model: image ? "llama-3.2-90b-vision-preview" : "openai/gpt-oss-120b",
            temperature: 0.5,
        });

        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi phân tích ảnh hoặc quá tải lượt dùng!" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server Hybrid Vision Live tại ${PORT}`));

