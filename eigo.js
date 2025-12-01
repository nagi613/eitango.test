// サンプル文
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
    }
    // 残り99文も同様に追加
];

const targetSentenceElement = document.getElementById('targetSentence');
const translationElement = document.getElementById('translation'); // 日本語訳
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
    const lang = langSelect.value;
    targetSentenceElement.textContent = TARGET_SENTENCE[lang]; // 選択言語の文を表示
    translationElement.textContent = TARGET_SENTENCE.jp; // 下に日本語訳
    updateWordMeaning();
    recognitionResultElement.textContent = '---';
    scoreResultElement.textContent = '0%';
    playButton.disabled = false;
    recordButton.disabled = false;
}

// 単語意味更新
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
langSelect.addEventListener('change', loadNewSentence);

// --- TTS再生 ---
playButton.addEventListener('click', () => {
    if (!TARGET_SENTENCE) return;
    if ('speechSynthesis' in window) {
        let text = TARGET_SENTENCE[langSelect.value]; // 選択した言語の文
        let utterance = new SpeechSynthesisUtterance(text);

        // 言語コードを切り替え
        switch(langSelect.value) {
            case 'en':
                utterance.lang = 'en-US';
                break;
            case 'zh':
                utterance.lang = 'zh-CN';
                break;
            case 'kr':
                utterance.lang = 'ko-KR';
                break;
            case 'ru':
                utterance.lang = 'ru-RU';
                break;
            case 'tl':
                utterance.lang = 'tl-PH'; // タガログ語
                break;
            default:
                utterance.lang = 'en-US';
        }

        window.speechSynthesis.speak(utterance);
    } else {
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

changeButton.addEventListener('click', loadNewSentence);
window.onload = loadNewSentence;
