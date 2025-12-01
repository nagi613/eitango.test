// --- 1. 英文と翻訳リスト（サンプル10個） ---
const SENTENCE_LIST = [
    {
        en: "The quick brown fox jumps over the lazy dog.",
        jp: "素早い茶色のキツネが怠け者の犬を飛び越える。",
        ru: "Быстрая коричневая лиса перепрыгивает через ленивую собаку.",
        zh: "敏捷的棕色狐狸跳过懒狗。",
        kr: "빠른 갈색 여우가 게으른 개를 뛰어넘는다."
    },
    {
        en: "This is an example of a simple sentence.",
        jp: "これは簡単な文の例です。",
        ru: "Это пример простого предложения.",
        zh: "这是一个简单句子的例子。",
        kr: "이것은 간단한 문장의 예입니다."
    },
    {
        en: "I need to buy some milk and eggs.",
        jp: "牛乳と卵を買う必要があります。",
        ru: "Мне нужно купить молоко и яйца.",
        zh: "我需要买一些牛奶和鸡蛋。",
        kr: "나는 우유와 계란을 사야 한다."
    },
    {
        en: "She has been waiting for an hour.",
        jp: "彼女は1時間待っています。",
        ru: "Она ждет уже час.",
        zh: "她已经等了一个小时。",
        kr: "그녀는 한 시간 동안 기다리고 있다."
    },
    {
        en: "They decided to go to the park together.",
        jp: "彼らは一緒に公園に行くことに決めました。",
        ru: "Они решили вместе пойти в парк.",
        zh: "他们决定一起去公园。",
        kr: "그들은 함께 공원에 가기로 결정했다."
    },
    {
        en: "Could you please pass me the salt?",
        jp: "塩を取っていただけますか？",
        ru: "Не могли бы вы передать мне соль?",
        zh: "请把盐递给我好吗？",
        kr: "소금 좀 건네주시겠어요?"
    },
    {
        en: "We are planning a trip to Kyoto next month.",
        jp: "私たちは来月京都への旅行を計画しています。",
        ru: "Мы планируем поездку в Киото в следующем месяце.",
        zh: "我们计划下个月去京都旅行。",
        kr: "우리는 다음 달에 교토 여행을 계획하고 있습니다."
    },
    {
        en: "The train arrived exactly on time.",
        jp: "電車はまさに時間通りに到着しました。",
        ru: "Поезд прибыл точно вовремя.",
        zh: "火车准时到达。",
        kr: "기차가 정확히 정시에 도착했다."
    },
    {
        en: "He works as a programmer in Tokyo.",
        jp: "彼は東京でプログラマーとして働いています。",
        ru: "Он работает программистом в Токио.",
        zh: "他在东京做程序员。",
        kr: "그는 도쿄에서 프로그래머로 일한다."
    },
    {
        en: "Learning a new language takes time and effort.",
        jp: "新しい言語を学ぶには時間と努力が必要です。",
        ru: "Изучение нового языка требует времени и усилий.",
        zh: "学习一门新语言需要时间和努力。",
        kr: "새 언어를 배우는 데는 시간과 노력이 필요하다."
    }
];

const targetSentenceElement = document.getElementById('targetSentence');
const translationElement = document.getElementById('translation');
const playButton = document.getElementById('playButton');
const recordButton = document.getElementById('recordButton');
const changeButton = document.getElementById('changeButton');
const recognitionResultElement = document.getElementById('recognitionResult');
const scoreResultElement = document.getElementById('scoreResult');
const langSelect = document.getElementById('lang');

let TARGET_SENTENCE = null;

// --- ユーティリティ関数 ---
function normalizeText(text) {
    return text.toLowerCase().replace(/[.,!?;:'"()]/g, '').trim();
}

// --- 問題ロード ---
function loadNewSentence() {
    const randomIndex = Math.floor(Math.random() * SENTENCE_LIST.length);
    TARGET_SENTENCE = SENTENCE_LIST[randomIndex];
    targetSentenceElement.textContent = TARGET_SENTENCE.en;
    updateTranslation();
    recognitionResultElement.textContent = '---';
    scoreResultElement.textContent = '0%';
    playButton.disabled = false;
    recordButton.disabled = false;
}

// --- 翻訳表示 ---
function updateTranslation() {
    if (!TARGET_SENTENCE) return;
    const lang = langSelect.value;
    translationElement.textContent = TARGET_SENTENCE[lang];
}

langSelect.addEventListener('change', updateTranslation);

// --- TTS再生 ---
playButton.addEventListener('click', () => {
    if (!TARGET_SENTENCE) return;
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(TARGET_SENTENCE.en);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    } else {
        alert('お使いのブラウザは音声合成に対応していません。');
    }
});

// --- STT録音 ---
recordButton.addEventListener('click', () => {
    if (!TARGET_SENTENCE) return;
    if (!('webkitSpeechRecognition' in window)) {
        alert('お使いのブラウザは音声認識に対応していません。');
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
        const TARGET_WORDS = normalizeText(TARGET_SENTENCE.en).split(' ');
        const recognizedWords = normalizeText(transcript).split(' ');
        let matched = 0;
        TARGET_WORDS.forEach((w, i) => { if (recognizedWords[i] === w) matched++; });
        scoreResultElement.textContent = Math.floor((matched / TARGET_WORDS.length) * 100) + '%';

        recordButton.textContent = '🎙️ 録音開始';
        recordButton.disabled = false;
        playButton.disabled = false;
        changeButton.disabled = false;
    };

    recognition.onerror = (event) => {
        recognitionResultElement.textContent = '認識エラー: ' + event.error;
        scoreResultElement.textContent = '0%';
        recordButton.textContent = '🎙️ 録音開始';
        recordButton.disabled = false;
        playButton.disabled = false;
        changeButton.disabled = false;
    };

    recognition.start();
});

changeButton.addEventListener('click', loadNewSentence);

window.onload = loadNewSentence;
