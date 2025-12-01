const targetSentenceElement = document.getElementById('targetSentence');
const translationElement = document.getElementById('translation');
const wordMeaningsElement = document.getElementById('wordMeanings');
const playButton = document.getElementById('playButton');
const recordButton = document.getElementById('recordButton');
const changeButton = document.getElementById('changeButton');
const recognitionResultElement = document.getElementById('recognitionResult');
const scoreResultElement = document.getElementById('scoreResult');
const langSelect = document.getElementById('lang');

let TARGET_SENTENCE = null;

// 正規化
function normalizeText(text){
    return text.toLowerCase().replace(/[.,!?;:'"()]/g,'').trim();
}

// 文と翻訳、単語意味更新
function loadNewSentence(){
    const randomIndex = Math.floor(Math.random() * SENTENCE_LIST.length);
    TARGET_SENTENCE = SENTENCE_LIST[randomIndex];
    updateDisplay();
}

function updateDisplay(){
    if(!TARGET_SENTENCE) return;
    targetSentenceElement.textContent = TARGET_SENTENCE[langSelect.value];
    translationElement.textContent = TARGET_SENTENCE.jp;
    updateWordMeanings();
    recognitionResultElement.textContent = '---';
    scoreResultElement.textContent = '0%';
    playButton.disabled = false;
    recordButton.disabled = false;
}

function updateWordMeanings(){
    if(!TARGET_SENTENCE) return;
    const lang = langSelect.value;
    const words = TARGET_SENTENCE.words[lang];
    let html = '';
    for(const [word, meaning] of Object.entries(words)){
        html += `<span class="word">${word}: ${meaning}</span> `;
    }
    wordMeaningsElement.innerHTML = html;
}

// 言語変更時
langSelect.addEventListener('change', updateDisplay);

// TTS
playButton.addEventListener('click', () => {
    if(!TARGET_SENTENCE) return;
    if('speechSynthesis' in window){
        const lang = langSelect.value;
        const utterance = new SpeechSynthesisUtterance(TARGET_SENTENCE[lang]);
        switch(lang){
            case 'en': utterance.lang='en-US'; break;
            case 'zh': utterance.lang='zh-CN'; break;
            case 'kr': utterance.lang='ko-KR'; break;
            case 'ru': utterance.lang='ru-RU'; break;
            case 'tl': utterance.lang='fil-PH'; break;
        }
        window.speechSynthesis.speak(utterance);
    } else { alert('音声合成に対応していません'); }
});

// STT
recordButton.addEventListener('click', ()=>{
    if(!TARGET_SENTENCE) return;
    if(!('webkitSpeechRecognition' in window)){
        alert('音声認識に対応していません');
        return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recordButton.textContent='🔴 録音中...';
    recordButton.disabled=true;
    playButton.disabled=true;
    changeButton.disabled=true;

    recognition.onresult = (event)=>{
        const transcript = event.results[0][0].transcript;
        recognitionResultElement.textContent = transcript;

        const TARGET_WORDS = normalizeText(TARGET_SENTENCE.en).split(' ');
        const recognizedWords = normalizeText(transcript).split(' ');
        let matched=0;
        TARGET_WORDS.forEach((w,i)=>{if(recognizedWords[i]===w) matched++;});
        scoreResultElement.textContent=Math.floor((matched/TARGET_WORDS.length)*100)+'%';

        recordButton.textContent='🎙️ 録音開始';
        recordButton.disabled=false;
        playButton.disabled=false;
        changeButton.disabled=false;
    };

    recognition.onerror=(event)=>{
        recognitionResultElement.textContent='認識エラー: '+event.error;
        scoreResultElement.textContent='0%';
        recordButton.textContent='🎙️ 録音開始';
        recordButton.disabled=false;
        playButton.disabled=false;
        changeButton.disabled=false;
    };

    recognition.start();
});

changeButton.addEventListener('click', loadNewSentence);

window.onload=loadNewSentence;
