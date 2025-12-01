// --- 1. 英文リスト ---
const SENTENCE_LIST = [
    "The quick brown fox jumps over the lazy dog.",
    "This is an example of a simple sentence.",
    "I need to buy some milk and eggs.",
    "She has been waiting for an hour.",
    "They decided to go to the park together.",
    "Could you please pass me the salt?",
    "We are planning a trip to Kyoto next month.",
    "The train arrived exactly on time.",
    "He works as a programmer in Tokyo.",
    "Learning a new language takes time and effort.",
    "What time does the movie start tonight?",
    "It was a beautiful sunny day.",
    "Please send me the report by tomorrow morning.",
    "Do you have any questions about the project?",
    "I am looking forward to seeing you soon."
];

// --- 定数とDOM要素 ---
const targetSentenceElement = document.getElementById('targetSentence');
const playButton = document.getElementById('playButton');
const recordButton = document.getElementById('recordButton');
const changeButton = document.getElementById('changeButton');
const recognitionResultElement = document.getElementById('recognitionResult');
const scoreResultElement = document.getElementById('scoreResult');

let TARGET_SENTENCE = "";

// --- テキスト正規化 ---
function normalizeText(text) {
    return text.toLowerCase().replace(/[.,!?;:'"()]/g, '').trim();
}

// --- 新しい問題ロード ---
function loadNewSentence() {
    if (SENTENCE_LIST.length === 0) {
        targetSentenceElement.textContent = "問題リストが空です。英文を追加してください。";
        return;
    }
    const randomIndex = Math.floor(Math.random() * SENTENCE_LIST.length);
    TARGET_SENTENCE = SENTENCE_LIST[randomIndex];
    
    targetSentenceElement.textContent = TARGET_SENTENCE;
    
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

// --- 英文再生 (TTS) ---
playButton.addEventListener('click', () => {
    if (TARGET_SENTENCE === "") return;

    playButton.classList.add('active');

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(TARGET_SENTENCE);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);

        utterance.onend = () => {
            playButton.classList.remove('active');
        };
    } else {
        alert('お使いのブラウザは音声合成に対応していません。');
        playButton.classList.remove('active');
    }
});

// --- 録音・認識 (STT) ---
recordButton.addEventListener('click', () => {
    if (TARGET_SENTENCE === "") return;

    if (!('webkitSpeechRecognition' in window)) {
        alert('お使いのブラウザは音声認識に対応していません。Google Chromeなどをご利用ください。');
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US'; 
    recognition.interimResults = false;
    recognition.continuous = false; 

    recordButton.textContent = '🔴 録音中...（話してください）';
    recordButton.disabled = true;
    playButton.disabled = true;
    changeButton.disabled = true;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        recognitionResultElement.textContent = transcript;

        const score = calculateScore(transcript);
        scoreResultElement.textContent = `${score}%`;

        recordButton.textContent = '🎙️ 録音開始';
        recordButton.disabled = false;
        playButton.disabled = false;
        changeButton.disabled = false;
    };

    recognition.onerror = (event) => {
        recognitionResultElement.textContent = `認識エラーが発生しました: ${event.error}`;
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

// --- 初回ロード ---
window.onload = loadNewSentence;
