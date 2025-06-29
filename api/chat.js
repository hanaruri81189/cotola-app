import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    console.log('Serverless Function api/chat.js received a request.'); // リクエスト受信ログ
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { currentText, userMessage } = req.body;

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        console.error('API Key is NOT configured in Vercel environment variables.'); // APIキー未設定ログ
        return res.status(500).json({ message: 'API Key not configured.' });
    }
    console.log('API Key successfully loaded.'); // APIキー読み込み成功ログ

    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log('GoogleGenerativeAI initialized.'); // GoogleGenerativeAI初期化ログ
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        console.log('Attempting to send message to Gemini API...'); // Gemini API呼び出し前ログ

        const chatHistory = [
            { role: "user", parts: [{ text: "以下の文章を修正してください。" }] },
            { role: "model", parts: [{ text: "はい、どのような修正をご希望ですか？" }] },
        ];

        // currentTextが空でなければ履歴に追加
        if (currentText && currentText.trim() !== '') {
            chatHistory.push({ role: "user", parts: [{ text: currentText }] });
        }

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: currentText }] }, // 現在の文章を最初のユーザー入力として扱う
            ],
            generationConfig: {
                maxOutputTokens: 2000,
                timeout: 30000,
            },
        });

        const result = await chat.sendMessage([{ text: userMessage }]);
        const response = await result.response;
        const text = response.text();
        console.log('Gemini API response received.'); // Gemini API応答受信ログ
        res.status(200).json({ modifiedText: text });
    } catch (error) {
        console.error('Gemini Chat API Error:', error);
        if (error.response) {
            console.error('Error details:', await error.response.text());
        }
        res.status(500).json({ message: '文章の修正中にエラーが発生しました。' });
    }
}