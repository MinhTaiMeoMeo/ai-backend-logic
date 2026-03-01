require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo 2 "bộ não" AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `VAI TRÒ: Bạn là "AI Study Buddy", một gia sư trí tuệ nhân tạo được huấn luyện theo phương pháp Socratic dành riêng cho học sinh Việt Nam. 
NHIỆM VỤ: Tuyệt đối không cung cấp đáp án ngay lập tức. Hãy đặt câu hỏi gợi mở, chia nhỏ vấn đề và khích lệ học sinh tự tìm ra lời giải. 
NGÔN NGỮ: Tiếng Việt tự nhiên, gần gũi.`;

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    try {
        // --- THỬ NGHIỆM 1: DÙNG GROQ (Ưu tiên vì tốc độ cực nhanh) ---
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMessage }
            ],
            model: "llama3-70b-8192", // Model miễn phí mạnh nhất của Groq
            temperature: 0.7,
        });
        
        console.log("Trả lời bằng: Groq (Llama 3)");
        return res.json({ reply: chatCompletion.choices[0].message.content, source: "Groq" });

    } catch (groqError) {
        console.warn("Groq lỗi hoặc hết lượt (429), đang chuyển sang Gemini...");

        try {
            // --- THỬ NGHIỆM 2: DÙNG GEMINI (Dự phòng khi Groq "ngất") ---
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash", // Bản Flash có quota cao hơn bản Pro
                systemInstruction: SYSTEM_PROMPT 
            });
            
            const result = await model.generateContent(userMessage);
            const response = await result.response;
            
            console.log("Trả lời bằng: Gemini");
            return res.json({ reply: response.text(), source: "Gemini" });

        } catch (geminiError) {
            console.error("Cả 2 AI đều quá tải:", geminiError.message);
            res.status(500).json({ error: "Cả Groq và Gemini đều đang bận. Vui lòng đợi 30 giây!" });
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server chạy tại cổng ${PORT}`));
