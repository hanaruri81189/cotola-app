// script.js - アプリに動きをつける魔法の呪文

// HTMLの要素を、JavaScriptで操作できるように準備します。
const generationForm = document.getElementById('generation-form');
const generatedText = document.getElementById('generated-text');
const copyBtn = document.getElementById('copy-btn'); // コピーボタンの要素を取得
const snsCopyBtn = document.getElementById('sns-copy-btn'); // SNS用コピーボタンの要素を取得
const currentCharCount = document.getElementById('current-char-count'); // 文字数表示要素を取得
const thinkingCat = document.getElementById('thinking-cat'); // 考え中の猫の画像要素を取得
const historyList = document.getElementById('history-list'); // 履歴リストの要素を取得
const clearHistoryBtn = document.getElementById('clear-history-btn'); // 履歴クリアボタンの要素を取得

// チャット関連の要素を取得
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');

// チャットの会話履歴を保存する配列
let chatConversation = [];

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

// 履歴をローカルストレージから読み込み、表示する関数
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('cotolaHistory') || '[]');
    historyList.innerHTML = ''; // 一度クリア

    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">まだ履歴はありません。</p>';
        return;
    }

    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        historyItem.innerHTML = `
            <div class="history-content">
                <p>${item.content.substring(0, 100)}...</p>
                <small>${new Date(item.timestamp).toLocaleString()}</small>
            </div>
            <button class="load-history-btn" data-index="${index}">読み込む</button>
            <button class="delete-history-btn" data-index="${index}">削除</button>
        `;
        historyList.prepend(historyItem); // 新しいものを上に追加
    });

    // 読み込みボタンと削除ボタンにイベントリスナーを追加
    document.querySelectorAll('.load-history-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            const history = JSON.parse(localStorage.getItem('cotolaHistory') || '[]');
            generatedText.value = history[index].content;
            updateCharCount();
        });
    });

    document.querySelectorAll('.delete-history-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const indexToDelete = parseInt(e.target.dataset.index);
            let history = JSON.parse(localStorage.getItem('cotolaHistory') || '[]');
            history.splice(indexToDelete, 1); // 該当インデックスのアイテムを削除
            localStorage.setItem('cotolaHistory', JSON.stringify(history));
            loadHistory(); // 履歴を再読み込み
        });
    });
}

// 履歴を保存する関数
function saveHistory(content) {
    let history = JSON.parse(localStorage.getItem('cotolaHistory') || '[]');
    history.push({ content: content, timestamp: new Date().toISOString() });
    // 最新10件のみ保持
    if (history.length > 10) {
        history = history.slice(history.length - 10);
    }
    localStorage.setItem('cotolaHistory', JSON.stringify(history));
    loadHistory(); // 履歴を再読み込み
}

// 履歴を全てクリアするイベントリスナー
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('全ての生成履歴を削除してもよろしいですか？')) {
        localStorage.removeItem('cotolaHistory');
        loadHistory();
    }
});

// チャットメッセージを表示する関数
function displayChatMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.innerHTML = `<b>${sender === 'user' ? 'あなた' : 'AI'}:</b> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // 最新のメッセージが見えるようにスクロール

    // 会話履歴に追加
    chatConversation.push({ role: sender, text: message });
}

// 「文章を生成する」ボタンが押されたときに実行する処理
generationForm.addEventListener('submit', async (event) => { // asyncを追加
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

    // 生成中のメッセージと猫の画像を表示
    generatedText.value = "文章を生成中...少々お待ちくださいね。";
    thinkingCat.classList.remove('hidden');

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                purpose: purpose.value,
                episode,
                target,
                message,
                tone: tone ? tone.value : '',
                platform: platform ? platform.value : '',
                cta
            }),
        });

        const data = await response.json();

        if (response.ok) {
            generatedText.value = data.generatedText;
            saveHistory(data.generatedText); // 生成成功時に履歴を保存

            // 新しい文章が生成されたらチャット履歴をリセット
            chatConversation = [];
            chatMessages.innerHTML = ''; // チャット表示もクリア
        } else {
            generatedText.value = `エラーが発生しました: ${data.message || '不明なエラー'}`;
            generatedText.style.color = "#e74c3c";
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        generatedText.value = "ネットワークエラーが発生しました。インターネット接続を確認してください。";
        generatedText.style.color = "#e74c3c";
    } finally {
        updateCharCount();
        // 生成完了後、猫の画像を非表示にする
        thinkingCat.classList.add('hidden');
    }
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

// チャット送信ボタンのイベントリスナー
sendChatBtn.addEventListener('click', async () => {
    const userMessage = chatInput.value.trim();
    if (userMessage === '') return; // メッセージが空の場合は何もしない

    displayChatMessage('user', userMessage); // ユーザーのメッセージを表示
    chatInput.value = ''; // 入力欄をクリア

    const currentText = generatedText.value; // 現在の生成済み文章を取得

    // 生成中のメッセージと猫の画像を表示
    generatedText.value = "AIが修正案を考えています...少々お待ちくださいね。";
    thinkingCat.classList.remove('hidden');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentText: currentText,
                userMessage: userMessage,
                chatConversation: chatConversation // 会話履歴を送信
            }),
        });

        const data = await response.json();

        if (response.ok) {
            generatedText.value = data.modifiedText; // 修正された文章をテキストエリアに表示
            displayChatMessage('ai', data.modifiedText); // AIの返答をチャットに表示
            saveHistory(data.modifiedText); // 修正された文章も履歴に保存
        } else {
            const errorMessage = `エラーが発生しました: ${data.message || '不明なエラー'}`;
            generatedText.value = errorMessage;
            generatedText.style.color = "#e74c3c";
            displayChatMessage('ai', errorMessage); // エラーメッセージをチャットに表示
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        const errorMessage = "ネットワークエラーが発生しました。インターネット接続を確認してください。";
        generatedText.value = errorMessage;
        generatedText.style.color = "#e74c3c";
        displayChatMessage('ai', errorMessage); // エラーメッセージをチャットに表示
    } finally {
        updateCharCount();
        thinkingCat.classList.add('hidden'); // 猫の画像を非表示にする
    }
});

// ページ読み込み時に履歴をロード
loadHistory();

// 初期表示時の文字数を更新
updateCharCount();