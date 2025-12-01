// DOM要素
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

// ランダムに文を表示
function loadNewSentence() {
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
    const wordStr = Object.entries(words).map(([w, m]) => `${w}: ${m}`).join(' ');
    wordMeaningsElement.textContent = wordStr;
}

langSelect.addEventListener('change', updateSentence);
changeButton.addEventListener('click', loadNewSentence);

// 音声再生
playButton.addEventListener('click', () => {
    if (!TARGET_SENTENCE) return;
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(TARGET_SENTENCE[langSelect.value]);
        // 言語設定
        const voices = speechSynthesis.getVoices();
        switch(langSelect.value){
            case 'en': utterance.lang='en-US'; break;
            case 'zh': utterance.lang='zh-CN'; break;
            case 'kr': utterance.lang='ko-KR'; break;
            case 'ru': utterance.lang='ru-RU'; break;
            case 'tl': utterance.lang='fil-PH'; break;
        }
        speechSynthesis.speak(utterance);
    }
});

// 初期表示
window.onload = loadNewSentence;
