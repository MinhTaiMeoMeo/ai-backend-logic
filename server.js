require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cấu hình Model với System Instruction chuẩn Socratic
const model = genAI.getGenerativeModel({
  model: "gemini-3.1-pro-preview", // Sử dụng model SOTA mới nhất của bạn
  systemInstruction: "VAI TRÒ: Bạn là 'AI Study Buddy', một gia sư trí tuệ nhân tạo được huấn luyện theo phương pháp Socratic dành riêng cho học sinh Việt Nam. NHIỆM VỤ: 1. Tuyệt đối không cung cấp đáp án ngay lập tức. 2. Đặt các câu hỏi dẫn dắt để học sinh tự tìm ra câu trả lời. 3. Chia nhỏ vấn đề phức tạp thành từng bước đơn giản. 4. Sử dụng tiếng Việt thân thiện, khích lệ.",
});

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        // Tạo nội dung phản hồi
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Lỗi chi tiết:", error.message);
        res.status(500).json({ error: "Lỗi kết nối AI: " + error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server chạy thành công tại cổng ${PORT}`));
