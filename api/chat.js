import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    console.log('Serverless Function api/chat.js received a request.');
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { currentText, userMessage } = req.body;

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        console.error('API Key is NOT configured in Vercel environment variables.');
        return res.status(500).json({ message: 'API Key not configured.' });
    }
    console.log('API Key successfully loaded.');

    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log('GoogleGenerativeAI initialized.');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        console.log('Attempting to send message to Gemini API using generateContent...');

        // プロンプトを構築
        const prompt = `現在の文章：
${currentText}

上記の文章に対して、以下の修正指示に従って修正してください。
修正指示：${userMessage}

修正後の文章のみを返してください。余計な説明や前置きは不要です。`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('Gemini API response received.');
        res.status(200).json({ modifiedText: text });
    } catch (error) {
        console.error('Gemini Chat API Error:', error);
        if (error.response) {
            console.error('Error details:', await error.response.text());
        }
        res.status(500).json({ message: '文章の修正中にエラーが発生しました。' });
    }
}