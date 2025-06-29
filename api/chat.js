import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { currentText, userMessage } = req.body;

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ message: 'API Key not configured.' });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // ここもgemini-2.5-flashを使用

    try {
        const chat = model.startChat({
            history: [
                { role: "user", parts: "以下の文章を修正してください。" },
                { role: "model", parts: "はい、どのような修正をご希望ですか？" },
                { role: "user", parts: currentText },
            ],
            generationConfig: {
                maxOutputTokens: 2000, // 出力トークン数の上限を設定
            },
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();
        res.status(200).json({ modifiedText: text });
    } catch (error) {
        console.error('Gemini Chat API Error:', error);
        res.status(500).json({ message: '文章の修正中にエラーが発生しました。' });
    }
}