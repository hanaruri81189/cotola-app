import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    console.log('Serverless Function api/chat.js received a request.');
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { currentText, userMessage, chatConversation } = req.body; // chatConversationを受け取る

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
        console.log('Attempting to send message to Gemini API using generateContent with history...');

        // 会話履歴をプロンプトに組み込む
        let conversationPrompt = '';
        if (chatConversation && chatConversation.length > 0) {
            conversationPrompt += "これまでの会話履歴：\n";
            chatConversation.forEach(chatItem => {
                conversationPrompt += `${chatItem.role === 'user' ? 'あなた' : 'AI'}: ${chatItem.text}\n`;
            });
            conversationPrompt += "\n";
        }

        // プロンプトを構築
        const prompt = `${conversationPrompt}現在の文章：\n${currentText}\n\n上記の文章に対して、以下の修正指示に従って修正してください。\n修正指示：${userMessage}\n\n修正後の文章のみを返してください。余計な説明や前置きは不要です。`;

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