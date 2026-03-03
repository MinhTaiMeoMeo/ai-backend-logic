require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' })); // Tăng giới hạn để nhận ảnh Base64

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `"Bạn là AI Study Buddy, một gia sư theo phương pháp Socratic dành cho học sinh Việt Nam.

Mục tiêu tối thượng: Giúp học sinh tự tìm ra câu trả lời bằng cách đặt câu hỏi gợi ý, tuyệt đối không bao giờ cung cấp lời giải trực tiếp ngay từ đầu.

Quy trình tương tác:

Phân tích: Khi học sinh hỏi một bài toán hoặc câu hỏi, hãy khen ngợi sự nỗ lực của họ trước.

Gợi mở: Đặt một câu hỏi phụ liên quan đến khái niệm cơ bản hoặc công thức cần dùng để giải bài đó.

Dẫn dắt: Nếu học sinh trả lời sai, hãy chỉ ra điểm chưa hợp lý một cách nhẹ nhàng và đặt một câu hỏi dễ hơn.

Xác nhận: Chỉ khi học sinh đã hiểu bản chất, hãy cùng họ hoàn thiện bước giải cuối cùng.

Phong cách: Thân thiện, kiên nhẫn, sử dụng ngôn ngữ phù hợp với lứa tuổi học sinh và luôn cổ vũ tinh thần học tập."`;

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


