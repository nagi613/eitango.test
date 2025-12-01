const SENTENCE_LIST = [
  { en:"I need to buy some milk and eggs.", jp:"牛乳と卵を買う必要があります。", zh:"我需要买一些牛奶和鸡蛋。", kr:"나는 우유와 계란을 사야 한다.", ru:"Мне нужно купить молоко и яйца.", tl:"Kailangan kong bumili ng gatas at itlog.", words:{"I":"私","need":"必要","buy":"買う","milk":"牛乳","eggs":"卵"}} ,
  { en:"She has been waiting for an hour.", jp:"彼女は1時間待っています。", zh:"她已经等了一个小时。", kr:"그녀는 한 시간 동안 기다리고 있다.", ru:"Она ждет уже час.", tl:"Matagal na siyang naghihintay ng isang oras.", words:{"She":"彼女","has":"持っている","been":"〜している","waiting":"待っている","hour":"時間"}} ,
  { en:"Could you please pass me the salt?", jp:"塩を取っていただけますか？", zh:"请把盐递给我好吗？", kr:"소금 좀 건네주시겠어요?", ru:"Не могли бы вы передать мне соль?", tl:"Pakiabot mo naman sa akin ang asin.", words:{"Could":"〜できますか","you":"あなた","please":"お願いします","pass":"渡す","me":"私に","salt":"塩"}} ,
  // ...残り97文も同様に追加
];

// DOM要素取得
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

// テキスト正規化
function normalizeText(text){
    return text.toLowerCase().replace(/[.,!?;:'"()]/g,'').trim();
}

// 新しい文をロード
function loadNewSentence(){
    const randomIndex = Math.floor(Math.random() * SENTENCE_LIST.length);
    TARGET_SENTENCE = SENTENCE_LIST[randomIndex];
    targetSentenceElement.textContent = TARGET_SENTENCE.en;
    updateTranslation();
    updateWordMeaning();
    recognitionResultElement.textContent = '---';
    scoreResultElement.textContent = '0%';
    playButton.disabled = false;
    recordButton.disabled = false;
}

// 翻訳更新
function updateTranslation(){
    if(!TARGET_SENTENCE) return;
    const lang = langSelect.value;
    translationElement.textContent = TARGET_SENTENCE[lang];
}

// 単語意味表示（日本語）
function updateWordMeaning(){
    if(!TARGET_SENTENCE) return;
    const words = TARGET_SENTENCE.words;
    wordMeaningElement.innerHTML = '';
    for(const key in words){
        const span = document.createElement('span');
        span.textContent = `${key}: ${words[key]} `;
        span.style.marginRight = '10px';
        wordMeaningElement.appendChild(span);
    }
}

// 言語選択変更
langSelect.addEventListener('change', updateTranslation);

// TTS再生
playButton.addEventListener('click', () => {
    if(!TARGET_SENTENCE) return;
    if('speechSynthesis' in window){
        const utterance = new SpeechSynthesisUtterance(TARGET_SENTENCE.en);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    } else {
        alert('お使いのブラウザは音声合成に対応していません。');
    }
});

// STT録音
recordButton.addEventListener('click', () => {
    if(!TARGET_SENTENCE) return;
    if(!('webkitSpeechRecognition' in window)){
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

    recognition.onresult = (event)=>{
        const transcript = event.results[0][0].transcript;
        recognitionResultElement.textContent = transcript;
        const targetWords = normalizeText(TARGET_SENTENCE.en).split(' ');
        const recognizedWords = normalizeText(transcript).split(' ');
        let matched = 0;
        targetWords.forEach((w,i)=>{ if(recognizedWords[i]===w) matched++; });
        scoreResultElement.textContent = Math.floor((matched/targetWords.length)*100) + '%';

        recordButton.textContent = '🎙️ 録音開始';
        recordButton.disabled = false;
        playButton.disabled = false;
        changeButton.disabled = false;
    };

    recognition.onerror = (event)=>{
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
