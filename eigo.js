const SENTENCE_LIST = [
    {
        en:"I need to buy some milk and eggs.",
        jp:"牛乳と卵を買う必要があります。",
        zh:"我需要买一些牛奶和鸡蛋。",
        kr:"나는 우유와 계란을 사야 한다.",
        ru:"Мне нужно купить молоко и яйца.",
        tl:"Kailangan kong bumili ng gatas at itlog.",
        words:{
            en:{I:"私", need:"必要", buy:"買う", milk:"牛乳", eggs:"卵"},
            zh:{我:"私", 需要:"必要", 买:"買う", 牛奶:"牛乳", 鸡蛋:"卵"},
            kr:{나는:"私", 필요:"必要", 사다:"買う", 우유:"牛乳", 계란:"卵"},
            ru:{Мне:"私", нужно:"必要", купить:"買う", молоко:"牛乳", яйца:"卵"},
            tl:{Kailangan:"私", bumili:"必要", gatas:"牛乳", itlog:"卵"}
        }
    },
    {
        en:"She has been waiting for an hour.",
        jp:"彼女は1時間待っています。",
        zh:"她已经等了一个小时。",
        kr:"그녀는 한 시간 동안 기다리고 있다.",
        ru:"Она ждет уже час.",
        tl:"Matagal na siyang naghihintay ng isang oras.",
        words:{
            en:{She:"彼女", has:"持っている", been:"〜している", waiting:"待っている", hour:"時間"},
            zh:{她:"彼女", 已经:"〜している", 等:"待っている", 小时:"時間"},
            kr:{그녀는:"彼女", 기다리다:"待つ", 시간:"時間"},
            ru:{Она:"彼女", ждет:"待っている", час:"時間"},
            tl:{siya:"彼女", naghihintay:"待っている", oras:"時間"}
        }
    }
    // ここに残り98文を同じ形式で追加
];

// DOM
const targetSentenceElement = document.getElementById('targetSentence');
const translationElement = document.getElementById('translation');
const wordMeaningElement = document.getElementById('wordMeaning');
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

// 文ロード
function loadNewSentence(){
    const randomIndex = Math.floor(Math.random()*SENTENCE_LIST.length);
    TARGET_SENTENCE = SENTENCE_LIST[randomIndex];
    targetSentenceElement.textContent = TARGET_SENTENCE.en;
    updateTranslation();
    updateWordMeaning();
    recognitionResultElement.textContent = '---';
    scoreResultElement.textContent = '0%';
    playButton.disabled = false;
    recordButton.disabled = false;
}

// 翻訳
function updateTranslation(){
    if(!TARGET_SENTENCE) return;
    const lang = langSelect.value;
    translationElement.textContent = TARGET_SENTENCE[lang];
    updateWordMeaning();
}

// 単語意味更新（左：選択言語、右：日本語）
function updateWordMeaning(){
    if(!TARGET_SENTENCE) return;
    const lang = langSelect.value;
    const words = TARGET_SENTENCE.words[lang];
    wordMeaningElement.innerHTML = '';
    for(const word in words){
        const span = document.createElement('span');
        span.textContent = `${word}: ${words[word]} `;
        span.style.marginRight = '10px';
        wordMeaningElement.appendChild(span);
    }
}

// 言語切替
langSelect.addEventListener('change', updateTranslation);

// TTS
playButton.addEventListener('click', ()=>{
    if(!TARGET_SENTENCE) return;
    if('speechSynthesis' in window){
        const utterance = new SpeechSynthesisUtterance(TARGET_SENTENCE.en);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }else{
        alert('お使いのブラウザは音声合成に対応していません。');
    }
});

// STT
recordButton.addEventListener('click', ()=>{
    if(!TARGET_SENTENCE) return;
    if(!('webkitSpeechRecognition' in window)){
        alert('お使いのブラウザは音声認識に対応していません。');
        return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang='en-US';
    recognition.interimResults=false;
    recognition.continuous=false;

    recordButton.textContent='🔴 録音中...';
    recordButton.disabled=true;
    playButton.disabled=true;
    changeButton.disabled=true;

    recognition.onresult=(event)=>{
        const transcript = event.results[0][0].transcript;
        recognitionResultElement.textContent=transcript;
        const targetWords = normalizeText(TARGET_SENTENCE.en).split(' ');
        const recognizedWords = normalizeText(transcript).split(' ');
        let matched=0;
        targetWords.forEach((w,i)=>{ if(recognizedWords[i]===w) matched++; });
        scoreResultElement.textContent=Math.floor((matched/targetWords.length)*100)+'%';

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

changeButton.addEventListener('click',loadNewSentence);
window.onload=loadNewSentence;
