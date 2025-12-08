// --- DOM要素とグローバル変数の定義 ---
const targetSentenceElement = document.getElementById('targetSentence');
const translationElement = document.getElementById('translation');
const wordMeaningsElement = document.getElementById('wordMeanings');
const langSelect = document.getElementById('lang');
const playButton = document.getElementById('playButton');
const recordButton = document.getElementById('recordButton');
const changeButton = document.getElementById('changeButton');
const recognitionResultElement = document.getElementById('recognitionResult');
const scoreResultElement = document.getElementById('scoreResult');

let TARGET_SENTENCE = null;

// Web Speech API の初期化と互換性チェック
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (!SpeechRecognition) {
    recordButton.disabled = true;
    recordButton.textContent = '❌ 非対応';
} else {
    recognition.interimResults = false; 
    recognition.continuous = false;     
    recognition.maxAlternatives = 1;    
}


// --- 既存の表示・切り替え関数 ---

// ランダムに文を表示
function loadNewSentence() {
    // SENTENCE_LISTはeigobook.jsからロードされている前提
    if (!window.SENTENCE_LIST || SENTENCE_LIST.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * SENTENCE_LIST.length);
    TARGET_SENTENCE = SENTENCE_LIST[randomIndex];
    updateSentence();
    translationElement.textContent = TARGET_SENTENCE.jp;
    recognitionResultElement.textContent = '---';
    scoreResultElement.textContent = '0%';
}

function updateSentence() {
    if (!TARGET_SENTENCE) return;
    const lang = langSelect.value;
    targetSentenceElement.textContent = TARGET_SENTENCE[lang];

    const words = TARGET_SENTENCE.words[lang];
    // 単語とその意味を整形して表示。CSSで強調するために<b>タグを使用。
    const wordStr = Object.entries(words).map(([w, m]) => `<b>${w}</b>: ${m}`).join(' / ');
    wordMeaningsElement.innerHTML = wordStr;
}


// --- 音声再生機能 ---
playButton.addEventListener('click', () => {
    if (!TARGET_SENTENCE) return;
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(TARGET_SENTENCE[langSelect.value]);
        
        // 言語コードの設定（Web Speech API用）
        switch(langSelect.value){
            case 'en': utterance.lang='en-US'; break;
            case 'zh': utterance.lang='zh-CN'; break;
            case 'kr': utterance.lang='ko-KR'; break;
            case 'ru': utterance.lang='ru-RU'; break;
            case 'tl': utterance.lang='fil-PH'; break; // Tagalog
            default: utterance.lang='en-US'; 
        }
        
        // すでに再生中の場合はキャンセル
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        speechSynthesis.speak(utterance);
    }
});


// --- 音声認識機能 ---

function setRecognitionLang(lang) {
    if (recognition) {
        // 認識言語コードを設定
        switch (lang) {
            case 'en': recognition.lang = 'en-US'; break;
            case 'zh': recognition.lang = 'cmn-Hans-CN'; break; 
            case 'kr': recognition.lang = 'ko-KR'; break;
            case 'ru': recognition.lang = 'ru-RU'; break;
            case 'tl': recognition.lang = 'fil-PH'; break; 
            default: recognition.lang = 'en-US';
        }
    }
}

recordButton.addEventListener('click', () => {
    if (!TARGET_SENTENCE || !recognition || recordButton.disabled) return;

    const lang = langSelect.value;
    setRecognitionLang(lang); // 認識言語を設定

    recordButton.textContent = '🔴 録音中...';
    recordButton.disabled = true;
    recognitionResultElement.textContent = '話してください...';
    scoreResultElement.textContent = '0%';
    
    // 録音が終わっていない可能性があるため、一度停止してから開始
    recognition.stop();
    recognition.start(); 
});

// 認識結果の処理
if (recognition) {
    recognition.onresult = (event) => {
        const recognizedText = event.results[0][0].transcript;
        recognitionResultElement.textContent = recognizedText;
        
        // スコア計算と表示
        const score = calculateScore(recognizedText);
        scoreResultElement.textContent = `${score}%`;
    };

    // エラー時の処理
    recognition.onerror = (event) => {
        recognitionResultElement.textContent = `エラーが発生しました: ${event.error}`;
        scoreResultElement.textContent = '0%';
    };
    
    // 認識が終了した後の処理（成功・エラー問わず）
    recognition.onend = () => {
        recordButton.textContent = '🎙️ 録音開始';
        recordButton.disabled = false;
    };
}


// --- スコアリング機能（レーベンシュタイン距離） ---

/** 2つの文字列間の編集距離（レーベンシュタイン距離）を計算する */
function levenshteinDistance(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = (s1[i - 1] === s2[j - 1]) ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,        // 削除
                dp[i][j - 1] + 1,        // 挿入
                dp[i - 1][j - 1] + cost  // 置換
            );
        }
    }
    return dp[m][n];
}


/** 認識結果とターゲット文を比較してスコア（パーセンテージ）を計算する */
function calculateScore(recognizedText) {
    if (!TARGET_SENTENCE) return 0;

    const lang = langSelect.value;
    const targetText = TARGET_SENTENCE[lang];

    // 比較のために、句読点や記号を除去し、小文字化します
    const cleanTarget = targetText.toLowerCase().trim().replace(/[.,!?;:']/g, '');
    const cleanRecognized = recognizedText.toLowerCase().trim().replace(/[.,!?;:']/g, '');

    if (cleanTarget.length === 0 || cleanRecognized.length === 0) {
        return 0;
    }

    const distance = levenshteinDistance(cleanTarget, cleanRecognized);
    const maxLength = Math.max(cleanTarget.length, cleanRecognized.length);
    
    // 類似度を計算: 1 - (距離 / 最大長)
    const similarity = 1 - (distance / maxLength);
    
    let score = Math.round(similarity * 100);
    
    return Math.max(0, score);
}

// --- イベントリスナーと初期表示 ---
langSelect.addEventListener('change', updateSentence);
changeButton.addEventListener('click', loadNewSentence);

// 初期表示
window.onload = loadNewSentence;
