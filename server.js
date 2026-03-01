require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `VAI TRÒ: Bạn là "AI Study Buddy", gia sư Socratic Việt Nam. 
NHIỆM VỤ: Không cho đáp án trực tiếp. Hãy đặt câu hỏi gợi mở để học sinh tự tư duy. 
PHONG CÁCH: Thân thiện, khích lệ, dùng tiếng Việt dễ hiểu.`;

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    // Hàm gọi AI với cơ chế thử lại nếu lỗi 429
    const callGroq = async (retryCount = 0) => {
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userMessage }
                ],
                model: "openai/gpt-oss-120b", // Model mạnh nhất bạn chọn
                temperature: 0.6,
            });
            return chatCompletion.choices[0].message.content;
        } catch (error) {
            if (error.status === 429 && retryCount < 2) {
                console.log(`Đang quá tải, thử lại lần ${retryCount + 1}...`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Đợi 2 giây
                return callGroq(retryCount + 1);
            }
            throw error;
        }
    };

    try {
        const reply = await callGroq();
        res.json({ reply: reply });
    } catch (error) {
        console.error("Lỗi:", error.message);
        res.status(500).json({ error: "Hệ thống đang bận, bạn đợi vài giây rồi hỏi lại nhé!" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server chạy thành công với GPT-OSS tại cổng ${PORT}`));
