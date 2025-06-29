import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { purpose, episode, target, message, tone, platform, cta } = req.body;

    // APIキーはVercelの環境変数から安全に取得
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ message: 'API Key not configured.' });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // AIへのプロンプトを構築
    let prompt = `あなたはSNSマーケティングの専門家であり、女性の心を掴む文章生成のプロです。
以下の情報に基づいて、SNS投稿用の文章を生成してください。

---
投稿目的: ${purpose}
伝えたい内容・エピソード: ${episode}
`;

    if (target) prompt += `ターゲット: ${target}\n`;
    if (message) prompt += `伝えたい想い: ${message}\n`;
    if (tone) prompt += `文章のトーン: ${tone}\n`;
    if (platform) prompt += `投稿プラットフォーム: ${platform}\n`;
    if (cta) prompt += `最終的に取って欲しい行動: ${cta}\n`;

    prompt += `---
生成する文章は、ターゲットとプラットフォームの特性を最大限に活かし、読者の心に響くようにしてください。
特に、Instagramの投稿では改行を多めに、Xでは簡潔に、ブログでは詳細に、といったプラットフォームごとの最適な形式を考慮してください。
ハッシュタグは生成しないでください。`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.status(200).json({ generatedText: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ message: '文章生成中にエラーが発生しました。' });
    }
}