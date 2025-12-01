// --- 英文と日本語訳をセットで保持 ---
const SENTENCE_LIST = [
    { en: "The quick brown fox jumps over the lazy dog.", ja: "素早い茶色のキツネが怠け者の犬を飛び越える。" },
    { en: "This is an example of a simple sentence.", ja: "これは簡単な文の例です。" },
    { en: "I need to buy some milk and eggs.", ja: "牛乳と卵を買う必要があります。" },
    { en: "She has been waiting for an hour.", ja: "彼女は1時間待っています。" },
    { en: "They decided to go to the park together.", ja: "彼らは一緒に公園に行くことに決めました。" },
    // ... 必要に応じて追加
];

// --- 定数とDOM要素 ---
const targetSentenceElement = document.getElementById('targetSentence');
const translationElement = document.getElementById('translation');
const playButton = document.getElementById('playButton');
const recordButton = document.getElementById('recordButton');
const changeButton = document.getElementById('changeButton');
const recognitionResultElement = document.getElementById('recognitionResult');
const scoreResultElement = document.getElementById('scoreResult');

let TARGET_SENTENCE = "";
let TARGET_TRANSLATION = "";

// --- 正規化関数 ---
function normalizeText(text) {
    return text.toLowerCase().replace(/[.,!?;:'"()]/g, '').trim();
}

// --- 新しい英文をロード ---
function loadNewSentence() {
    if (SENTENCE_LIST.length === 0) {
        targetSentenceElement.textContent = "問題リストが空です。英文を追加してください。";
        translationElement.textContent = "";
        return;
    }
    const randomIndex = Math.floor(Math.random() * SENTENCE_LIST.length);
    TARGET_SENTENCE = SENTENCE_LIST[randomIndex].en;
    TARGET_TRANSLATION = SENTENCE_LIST[randomIndex].ja;
    targetSentenceElement.textContent = TARGET_SENTENCE;
    translationElement.textContent = TARGET_TRANSLATION;
    recognitionResultElement.textContent = '---';
    scoreResultElement.textContent = '0%';
    playButton.disabled = false;
    recordButton.disabled = false;
}

// --- スコア計算 ---
function calculateScore(recognizedText) {
    if (!recognizedText || TARGET_SENTENCE === "") return 0;
    const TARGET_WORDS = normalizeText(TARGET_SENTENCE).split(' ').filter(w => w.length > 0);
    const recognizedWords = normalizeText(recognizedText).split(' ').filter(w => w.length > 0);
    let matchedCount = 0;
    for (let i = 0; i < TARGET_WORDS.length; i++) {
        if (i < recognizedWords.length && TARGET_WORDS[i] === recognizedWords[i]) {
            matchedCount++;
        }
    }
    return Math.floor((matchedCount / TARGET_WORDS.length) * 100);
}

// --- 再生ボタン ---
playButton.addEventListener('click', () => {
    if (TARGET_SENTENCE === "") return;
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(TARGET_SENTENCE);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    } else {
        alert('お使いのブラウザは音声合成に対応していません。');
    }
});

// --- 録音ボタン ---
recordButton.addEventListener('click', () => {
    if (TARGET_SENTENCE === "") return;
    if (!('webkitSpeechRecognition' in window)) {
        alert('お使いのブラウザは音声認識に対応していません。Chromeをご利用ください。');
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recordButton.textContent = '🔴 録音中...';
    recordButton.disabled = true;
    playButton.disabled = true;
    changeButton.disabled = true;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        recognitionResultElement.textContent = transcript;
        scoreResultElement.textContent = calculateScore(transcript) + '%';
        recordButton.textContent = '🎙️ 録音開始';
        recordButton.disabled = false;
        playButton.disabled = false;
        changeButton.disabled = false;
    };

    recognition.onerror = (event) => {
        recognitionResultElement.textContent = `認識エラー: ${event.error}`;
        scoreResultElement.textContent = '0%';
        recordButton.textContent = '🎙️ 録音開始';
        recordButton.disabled = false;
        playButton.disabled = false;
        changeButton.disabled = false;
    };

    recognition.start();
});

// --- 問題チェンジ ---
changeButton.addEventListener('click', loadNewSentence);

// --- 初期ロード ---
window.onload = loadNewSentence;
