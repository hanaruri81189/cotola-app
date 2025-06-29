// script.js - アプリに動きをつける魔法の呪文

// HTMLの要素を、JavaScriptで操作できるように準備します。
const generationForm = document.getElementById('generation-form');
const generatedText = document.getElementById('generated-text');
const copyBtn = document.getElementById('copy-btn'); // コピーボタンの要素を取得
const snsCopyBtn = document.getElementById('sns-copy-btn'); // SNS用コピーボタンの要素を取得
const currentCharCount = document.getElementById('current-char-count'); // 文字数表示要素を取得

// アコーディオンの要素を取得
const accordionHeaders = document.querySelectorAll('.accordion-header');

// 各アコーディオンヘッダーにクリックイベントリスナーを追加
accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const accordionItem = header.closest('.accordion-item');
        const accordionContent = header.nextElementSibling; // ヘッダーの次の要素がコンテンツ

        // activeクラスをトグルして開閉を制御
        accordionItem.classList.toggle('active');
        accordionContent.classList.toggle('active');
    });
});

// 文字数カウンターを更新する関数
function updateCharCount() {
    currentCharCount.textContent = generatedText.value.length;
}

// 生成されたテキストエリアの入力イベントを監視して文字数を更新
generatedText.addEventListener('input', updateCharCount);

// 「文章を生成する」ボタンが押されたときに実行する処理
generationForm.addEventListener('submit', (event) => {
    // フォームのデフォルトの送信動作（ページのリロード）を防ぎます。
    event.preventDefault();

    // フォームから各入力値を取得します。
    const purpose = document.querySelector('input[name="purpose"]:checked');
    const episode = document.getElementById('episode').value.trim();
    const target = document.getElementById('target').value.trim();
    const message = document.getElementById('message').value.trim();
    const tone = document.querySelector('input[name="tone"]:checked');
    const cta = document.getElementById('cta').value.trim();
    const platform = document.querySelector('input[name="platform"]:checked');

    // 必須項目のバリデーション（入力チェック）
    if (!purpose) {
        generatedText.value = "⚠️ 投稿の目的を選んでくださいね。";
        generatedText.style.color = "#e74c3c"; // エラーメッセージの色
        updateCharCount(); // 文字数も更新
        return; // ここで処理を終了
    }
    if (episode === '') {
        generatedText.value = "⚠️ 伝えたい内容・エピソードを入力してくださいね。";
        generatedText.style.color = "#e74c3c"; // エラーメッセージの色
        updateCharCount(); // 文字数も更新
        return; // ここで処理を終了
    }

    // エラーメッセージの色を元に戻す
    generatedText.style.color = "#5c5454";

    // ここから文章生成のシミュレーションロジック
    let generatedContent = ``;

    // 投稿目的を基にした導入
    let introText = '';
    let introEmoji = '';
    switch (purpose.value) {
        case '認知拡大・発見':
            introText = `あなたに届けたい言葉`;
            introEmoji = `✨`;
            break;
        case '興味・関心':
            introText = `心に響くメッセージ`;
            introEmoji = `💖`;
            break;
        case '行動促進':
            introText = `次の一歩を踏み出そう`;
            introEmoji = `🚀`;
            break;
        case '教育・価値提供':
            introText = `知って得するヒント`;
            introEmoji = `💡`;
            break;
        case '販売・プロモーション':
            introText = `特別なお知らせ`;
            introEmoji = `🎁`;
            break;
        case 'コミュニティ活性化':
            introText = `みんなで語り合おう`;
            introEmoji = `🗣️`;
            break;
    }

    // 伝えたい内容・エピソードを核にする
    let mainBody = `${episode}`;

    // ターゲットが入力されていれば、それに応じたメッセージを追加
    if (target !== '') {
        mainBody = `（${target}のあなたへ）\n\n` + mainBody;
    }

    // 伝えたい想いが入力されていれば、それを強調
    if (message !== '') {
        mainBody += `\n\n✨${message}✨`;
    }

    // トーンに応じた調整
    if (tone) {
        switch (tone.value) {
            case '優しい・癒し系':
                mainBody = mainBody.replace(/！/g, '♪').replace(/\?/g, '？').replace(/です。/g, 'です〜。').replace(/ます。/g, 'ますね。') + '\n\n心がふんわり温かくなるような、優しい気持ちでお届けしました。';
                introEmoji = introEmoji.replace(/✨/g, '🌸').replace(/💖/g, '🌷');
                break;
            case '元気・ポジティブ':
                mainBody = mainBody.replace(/。/g, '！').replace(/です。/g, 'です！').replace(/ます。/g, 'ます！') + '\n\nさあ、あなたも一歩踏み出しましょう！';
                introEmoji = introEmoji.replace(/✨/g, '🌟').replace(/💖/g, '💪');
                break;
            case '知的・専門的':
                mainBody = mainBody.replace(/！/g, '.').replace(/？/g, '.').replace(/です。/g, 'です。').replace(/ます。/g, 'ます。') + '\n\nこの情報が、あなたの課題解決の一助となれば幸いです。';
                introEmoji = introEmoji.replace(/✨/g, '💡').replace(/💖/g, '📊');
                break;
            case '親しみやすい・カジュアル':
                mainBody = mainBody.replace(/です。/g, 'だよ！').replace(/ます。/g, 'ますね！') + '\n\n気軽にコメントしてね！';
                introEmoji = introEmoji.replace(/✨/g, '😊').replace(/💖/g, '🙌');
                break;
            case '情熱的・感動的':
                mainBody = mainBody.replace(/。/g, '！！').replace(/です。/g, 'です！！').replace(/ます。/g, 'ます！！') + '\n\nあなたの情熱が、きっと未来を切り開きます！';
                introEmoji = introEmoji.replace(/✨/g, '🔥').replace(/💖/g, '😭');
                break;
            case 'シンプル・簡潔':
                mainBody = mainBody.replace(/。/g, '.').replace(/です。/g, '.').replace(/ます。/g, '.').replace(/\n\n/g, '\n');
                introEmoji = ''; // シンプル・簡潔では絵文字なし
                break;
        }
    }

    // プラットフォームに応じた調整
    if (platform) {
        switch (platform.value) {
            case 'Instagram (フィード/リール)':
                // Instagramは改行を多めに、読みやすく
                generatedContent = `${introEmoji}${introText}】\n\n` + mainBody.replace(/。/g, '。\n\n').replace(/！/g, '！\n\n').replace(/？/g, '？\n\n');
                break;
            case 'Instagram ストーリーズ':
                // ストーリーズは短く、価値提供にフォーカス
                generatedContent = `${introEmoji}${introText}】\n\n` + mainBody.split('\n')[0] + '\n\n💡今日の学び💡\n' + mainBody.split('\n').slice(1).join('\n').substring(0, 80) + '...\n\nタップして詳細を見る！'; // 最初の行と、その後の80文字程度を抜粋
                break;
            case 'X (旧Twitter)':
                // Xは短く簡潔に
                generatedContent = `${introEmoji}${introText}】\n\n` + mainBody.substring(0, 120) + '...'; // 120文字程度に制限
                break;
            case 'Threads':
                // ThreadsはXより少し長め、会話的
                generatedContent = `${introEmoji}${introText}】\n\n` + mainBody.substring(0, 200) + '...\n\n#Threadsで語ろう';
                break;
            case 'LINE公式アカウント':
                // LINEはパーソナルに、明確なCTA
                generatedContent = `${introEmoji}${introText}】\n\n` + `いつもありがとうございます！\n\n` + mainBody + `\n\n【限定情報】\n今すぐチェック！`;
                break;
            case 'Note (ブログ)':
            case 'Ameblo (ブログ)':
                // ブログは長文、見出しを意識し、introTextを直接見出しに
                generatedContent = `## ${introText}\n\n` + mainBody.replace(/\n\n/g, '\n\n### ') + '\n\n最後までお読みいただきありがとうございます。';
                break;
            case 'メルマガ':
                // メルマガはよりパーソナルに、構造化
                generatedContent = `${introEmoji}${introText}】\n\n` + `〇〇様\n\nいつもお世話になっております。\n\n` + mainBody + `\n\n今後ともよろしくお願いいたします。`;
                break;
            default:
                // プラットフォームが選択されていない場合、または上記以外の場合
                generatedContent = `${introEmoji}${introText}】\n\n` + mainBody;
                break;
        }
    } else {
        // プラットフォームが選択されていない場合
        generatedContent = `${introEmoji}${introText}】\n\n` + mainBody;
    }

    // 最後にCTAを追加
    if (cta !== '') {
        generatedContent += `\n\n👉${cta}`;
    }
    // CTAがなければ、目的に応じたデフォルトのCTAを提案（プラットフォーム調整後に実行）
    else {
        switch (purpose.value) {
            case '認知拡大・発見':
                generatedContent += `\n\nもっと知りたい方は、ぜひプロフィールをチェックしてくださいね！`;
                break;
            case '興味・関心':
                generatedContent += `\n\n共感したら、ぜひコメントで教えてくださいね！`;
                break;
            case '行動促進':
                generatedContent += `\n\n詳細はこちらからどうぞ！`;
                break;
            case '教育・価値提供':
                generatedContent += `\n\nこの情報が役に立ったら、いいねや保存をお願いします！`;
                break;
            case '販売・プロモーション':
                generatedContent += `\n\n今すぐチェックして、あなたの未来を変えましょう！`;
                break;
            case 'コミュニティ活性化':
                generatedContent += `\n\nあなたの意見も聞かせてくださいね！`;
                break;
        }
    }

    // 出来上がった文章を、画面に表示します。
    generatedText.value = generatedContent; // textContentではなくvalueに設定
    updateCharCount(); // 文字数を更新
});

// コピーボタンのクリックイベントリスナー
copyBtn.addEventListener('click', () => {
    // 生成されたテキストを取得
    const textToCopy = generatedText.value; // valueから取得

    // クリップボードにコピー
    navigator.clipboard.writeText(textToCopy).then(() => {
        // コピー成功時のフィードバック
        copyBtn.textContent = 'コピーしました！';
        setTimeout(() => {
            copyBtn.textContent = 'コピーする';
        }, 2000); // 2秒後に元に戻す
    }).catch(err => {
        console.error('コピーに失敗しました: ', err);
        copyBtn.textContent = 'コピー失敗';
        setTimeout(() => {
            copyBtn.textContent = 'コピーする';
        }, 2000); // 2秒後に元に戻す
    });
});

// SNS用コピーボタンのクリックイベントリスナー
snsCopyBtn.addEventListener('click', () => {
    // 生成されたテキストを取得
    let textToCopy = generatedText.value;

    // 空白行（改行が2つ以上続く場合）の最初の改行に半角スペースを挿入
    // \n\n -> \n \n
    // 正規表現で「改行に続いて改行がある場合」を検出し、その改行の後に半角スペースを挿入
    textToCopy = textToCopy.replace(/\n(?=\n)/g, '\n ');

    // クリップボードにコピー
    navigator.clipboard.writeText(textToCopy).then(() => {
        // コピー成功時のフィードバック
        snsCopyBtn.textContent = 'SNS用コピーしました！';
        setTimeout(() => {
            snsCopyBtn.textContent = 'SNS用コピー';
        }, 2000); // 2秒後に元に戻す
    }).catch(err => {
        console.error('SNS用コピーに失敗しました: ', err);
        snsCopyBtn.textContent = 'SNS用コピー失敗';
        setTimeout(() => {
            snsCopyBtn.textContent = 'コピーする';
        }, 2000); // 2秒後に元に戻す
    });
});

// 初期表示時の文字数を更新
updateCharCount();