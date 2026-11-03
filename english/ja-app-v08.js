
(function(){
'use strict';
if(window.YANA_LANGUAGE!=='ja')return;
var D=window.YANA_JP_DATA;
if(!D){document.body.insertAdjacentHTML('beforeend','<p>학습 데이터를 불러오지 못했습니다. 새로고침해주세요.</p>');return;}
var $=id=>document.getElementById(id);
function petReward(type,id,correct,accepted){try{window.dispatchEvent(new CustomEvent('yanado:learn',{detail:{type,id:id===null?id:'ja|'+id,correct,accepted}}))}catch(e){}}
var esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
var DEFAULT={level:1,attempts:0,understood:0,quizzes:0,quizCorrect:0,known:[],turns:0};
var progress;
try{progress=Object.assign({},DEFAULT,JSON.parse(localStorage.getItem('yanado_ja_v08')||'{}'))}catch(e){progress=Object.assign({},DEFAULT)}
if(!Array.isArray(progress.known))progress.known=[];


var enVoice=null,VOICE_KEY='yanado_voice_gender_v07',voiceGender='female';
try{voiceGender=localStorage.getItem(VOICE_KEY)==='male'?'male':'female'}catch(e){}
const voiceNames={female:/kyoko|haruka|mizuki|sakura|nanami|female|woman|sayaka|aoi|megumi|akane|hikari/i,male:/otoya|ichiro|takumi|hiroshi|takeru|daichi|male|man|shinji|kenji/i};
function voices(){if(!window.speechSynthesis)return;const list=(window.speechSynthesis.getVoices()||[]).filter(v=>v.lang&&/^ja/i.test(v.lang));enVoice=list.find(v=>voiceNames[voiceGender].test(v.name))||list.find(v=>/natural|enhanced|premium/i.test(v.name))||list[0]||null}
if(window.speechSynthesis){voices();window.speechSynthesis.onvoiceschanged=voices}
function say(en){if(!('speechSynthesis' in window))return;voices();window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(en);u.lang='ja-JP';u.rate=Number(($('speakSpeed')||{}).value||1);u.pitch=voiceGender==='female'?1.06:.96;u.volume=1;if(enVoice)u.voice=enVoice;window.speechSynthesis.speak(u)}
function changeVoice(g){voiceGender=g==='male'?'male':'female';try{localStorage.setItem(VOICE_KEY,voiceGender)}catch(e){}if($('voiceGender'))$('voiceGender').value=voiceGender;if($('voiceGenderApp'))$('voiceGenderApp').value=voiceGender;voices()}
['voiceGender','voiceGenderApp'].forEach(id=>{if($(id)){$(id).value=voiceGender;$(id).addEventListener('change',e=>changeVoice(e.target.value))}});

function persist(){try{localStorage.setItem('yanado_ja_v08',JSON.stringify(progress))}catch(e){}$('badgeLevel').textContent='대화 Lv.'+progress.level}
function page(id){document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el.id===id));document.querySelectorAll('#topnav button').forEach(el=>el.classList.toggle('active',el.dataset.tab===id));if(id==='report')report();window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>page(b.dataset.tab)));
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>page(b.dataset.open)));
function populated(sel,all){D.TOPICS.forEach(t=>{var o=new Option(t.icon+' '+t.name,t.id);sel.add(o)});if(all)sel.selectedIndex=0}
populated($('guidedTopic'));populated($('freeTopic'));populated($('quizTopic'));
$('homeThemes').textContent=D.TOPICS.length.toLocaleString('ko-KR');$('homeEpisodes').textContent=D.totalEpisodes.toLocaleString('ko-KR');$('homeWords').textContent=D.WORDS.length.toLocaleString('ko-KR');
const scenes={hotel:['#bad5e0','#ffe5ba','🏨'],airport:['#bcd9ef','#eff9fd','✈️'],cafe:['#e5c9ac','#fff7d7','☕'],restaurant:['#edbead','#ffe8cf','🍽️'],shop:['#d7ceff','#fff2d3','🛍️'],city:['#c0e9e1','#d3eeff','🏙️'],home:['#ffe3ba','#d8f1e6','🏠'],health:['#d9f1e7','#c8e7f6','🏥'],work:['#d3e4fa','#eaf4ff','💼'],social:['#f2cfe7','#ffefcd','🤝'],outdoor:['#bee9bd','#e4f8fa','🌳']};
function stage(bgId,iconId,stageId,t,descId){var bg=$(bgId),s=scenes[t.scene]||scenes.city;bg.style.background='radial-gradient(ellipse at 25% 18%,'+s[1]+'bb,transparent 50%),linear-gradient(140deg,'+s[0]+','+s[1]+')';$(iconId).textContent=t.icon;$(descId).textContent=t.name}
const byWord=new Map(D.WORDS.map(x=>[x.word.toLowerCase(),x]));
const common={i:'나',you:'당신',we:'우리',they:'그들',my:'나의',your:'당신의',am:'~이다',is:'~이다',are:'~이다',to:'~로',the:'그',a:'하나의',an:'하나의',with:'~와 함께',for:'~을 위한',in:'~안에',at:'~에',on:'~위에',where:'어디',what:'무엇',when:'언제',why:'왜',how:'어떻게',do:'하다',does:'하다',can:'~할 수 있다',will:'~할 것이다',would:'~하시겠어요',please:'부탁합니다',yes:'네',no:'아니요',this:'이것',that:'저것',and:'그리고',from:'~로부터',some:'조금',have:'가지다',has:'가지다',want:'원하다',need:'필요하다',like:'좋아하다',could:'~할 수 있을까요'};

function glossary(text){
 const str=String(text||''),found=[],seen=new Set();
 for(const [term,meaning] of [...(window.YANA_JP_GLOSS||new Map())].sort((a,b)=>b[0].length-a[0].length)){
  if(term.length<2||seen.has(term)||!str.includes(term))continue;
  found.push({en:term,ko:meaning});seen.add(term);
  if(found.length>=16)break;
 }
 for(const w of D.WORDS.slice().sort((a,b)=>b.word.length-a.word.length)){
   if(w.word.length<2||seen.has(w.word)||!str.includes(w.word))continue;
   seen.add(w.word);found.push({en:w.word,ko:w.ko});if(found.length>=25)break;
 }
 return found;
}
function renderGloss(id,lines){
 const out=new Map();lines.forEach(t=>glossary(t).forEach(w=>out.set(w.en,w.ko)));
 $(id).innerHTML='<div class="glosslist">'+[...out].map(k=>'<button class="glossword" type="button" data-pronounce="'+esc(k[0])+'">'+esc(k[0])+' · '+esc(k[1])+'</button>').join('')+'</div>';
 $(id).querySelectorAll('[data-pronounce]').forEach(b=>b.onclick=()=>say(b.dataset.pronounce));
}

function togglePressed(btn,yes){btn.classList.toggle('active',yes);btn.setAttribute('aria-pressed',String(yes))}
function bubble(who,en,ko){var div=document.createElement('div');div.className='bubble'+(who==='me'?' user':'');div.innerHTML='<span class="who">'+(who==='me'?'🙋 나':'👩‍🏫 영어 친구')+'</span><span class="eng">'+esc(en)+'</span>'+(ko?'<span class="ko" hidden>'+esc(ko)+'</span>':'');return div}
function renderChat(id,history,translated){var box=$(id);box.innerHTML='';history.forEach(m=>{var el=bubble(m.role,m.text,m.ko);if(translated)el.querySelectorAll('.ko').forEach(k=>k.hidden=false);box.appendChild(el)});box.scrollTop=box.scrollHeight}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}

function normalize(s){return String(s||'').normalize('NFKC').replace(/\s+/g,'').trim()}
function topicAt(id){return D.TOPICS.find(t=>t.id===id)||D.TOPICS[0]}
function cueFrom(text,state,t){
 const pairs=[
 [/妻|夫|家族|こども|子供|友達|ともだち|一緒|いっしょ/,'family','いいですね！一緒に何をしたいですか？','좋네요! 함께 무엇을 하고 싶으세요?'],
 [/食事|食べ|夕食|晩ご飯|ごはん|ご飯|パスタ|コーヒー|カフェ|ラーメン|レストラン/,'food','いいですね！何を食べたいですか？','좋아요! 무엇을 먹고 싶으세요?'],
 [/ホテル|へや|部屋|チェックイン|泊まり|とまる/,'hotel','ホテルには何泊する予定ですか？','호텔에서 몇 박 할 예정인가요?'],
 [/ひこうき|飛行機|空港|くうこう|フライト|搭乗/,'flight','到着してから何をする予定ですか？','도착하고 나서 무엇을 할 예정인가요?'],
 [/明日|あした|週末|しゅうまつ|来週|らいしゅう/,'future','誰と一緒に行きますか？','누구와 함께 가나요?'],
 [/昨日|きのう|先週|せんしゅう|した|でした/,'past','それは楽しかったですか？','그것은 즐거웠나요?'],
 [/仕事|しごと|会社|かいしゃ|会議|かいぎ/,'work','次はどんな仕事をしますか？','다음에는 어떤 일을 하나요?'],
 [/買い物|かいもの|シャツ|くつ|靴|お店|みせ/,'shopping','どんなものを探していますか？','어떤 물건을 찾고 있나요?'],
 [/駅|えき|バス|タクシー|でんしゃ|電車/,'transport','何時ごろ到着したいですか？','몇 시쯤 도착하고 싶나요?'],
 [/病院|びょういん|あたま|頭|いたい|痛い/,'health','いつからそのような状態ですか？','언제부터 그런 상태인가요?']
 ];
 for(const [re,key,question,ko] of pairs)if(re.test(text)&&!state.used.has(key)){state.used.add(key);return {text:question,ko}}
 return null;
}
var followups=[
 ['そのあと、何をしたいですか？','그다음에는 무엇을 하고 싶나요?'],
 ['もう少し詳しく教えてください。','조금 더 자세히 알려주세요.'],
 ['誰と一緒ですか？','누구와 함께인가요?'],
 ['いつ行く予定ですか？','언제 갈 계획인가요?'],
 ['一番好きなのは何ですか？','가장 좋아하는 것은 무엇인가요?'],
 ['明日は何をしますか？','내일은 무엇을 하나요?'],
 ['どうしてそう思いますか？','왜 그렇게 생각하나요?'],
 ['そのあとどうなりましたか？','그다음 어떻게 되었나요?'],
 ['どうすればもっと便利になりますか？','어떻게 하면 더 편리할까요?'],
 ['そのとき、どんな気持ちでしたか？','그때 어떤 기분이었나요?'],
 ['ほかにやってみたいことはありますか？','그밖에 해보고 싶은 것이 있나요?']
];
function nextTurn(state,text){
 const matched=cueFrom(text,state,state.topic);if(matched)return matched;
 if(state.turn<3){const item=state.topic.turns[state.turn];return {text:item.en,ko:item.ko}}
 const index=state.nextExtra++%followups.length;return {text:followups[index][0],ko:followups[index][1]};
}

function createSession(topic){return {topic,turn:0,nextExtra:0,used:new Set(),history:[],translated:false,glossVisible:false}}

function scoreReply(text,question,topic,sample){
 const evaluated=window.YANA_JP_EVAL?.evaluate({question,answer:text,topic,sample});
 if(evaluated)return {okay:evaluated.accepted,kind:evaluated.kind,reason:evaluated.detail,title:evaluated.title,example:evaluated.example,disclaimer:evaluated.disclaimer};
 return {okay:false,kind:'unclear',title:'🟠 추가 확인 필요',reason:'현재 대답 평가를 사용할 수 없습니다. 질문을 다시 확인해 주세요.',example:sample||'',disclaimer:'브라우저 규칙 기반 추정'};
}
function showEvaluation(id,result){
 const e=$(id);if(!e)return;
 e.hidden=false;e.className='meaning-eval '+(result.kind||'unclear');
 e.innerHTML='<strong>'+esc(result.title)+'</strong><p>'+esc(result.reason)+'</p>'
 +(result.example?'<small>💬 대답 예시: <b>'+esc(result.example)+'</b></small>':'')
 +'<small class="evaluation-note">'+esc(result.disclaimer||'규칙 기반 추정')+'</small>';
}
function markTurn(text,question,topic,sample){
 var r=scoreReply(text,question,topic,sample);
 progress.attempts++;progress.turns++;
 if(r.okay)progress.understood++;
 if(!Array.isArray(progress.lastEight))progress.lastEight=[];
 progress.lastEight.push(r.okay?1:0);if(progress.lastEight.length>8)progress.lastEight.shift();
 if(progress.lastEight.length===8){
    let n=progress.lastEight.reduce((a,b)=>a+b,0);
    if(n>=7 && progress.level<8){progress.level++;progress.lastEight=[]}
    else if(n<=3 && progress.level>1){progress.level--;progress.lastEight=[]}
 }
 persist();petReward('talk',null,null,r.okay);
 return r;
}

function chooseTopic(sel){var t=topicAt($(sel).value);return t}
var g=createSession(D.TOPICS[0]),f=createSession(D.TOPICS[0]);
function beginGuided(t){g=createSession(t);stage('guidedBg','guidedIcon','guidedStage',t,'guidedScenario');g.history.push({role:'bot',text:t.turns[0].en,ko:t.turns[0].ko});renderChat('guidedHistory',g.history,false);$('guidedProgress').textContent='질문 1 / 계속 대화 가능';$('guidedLevel').textContent='Lv.'+progress.level;$('guidedGlossBox').hidden=true;$('guidedTipBox').hidden=true;$('guidedStatus').textContent='질문을 듣고 자유롭게 답하세요. 문법이 조금 틀려도 괜찮습니다.';$('guidedInput').value='';togglePressed($('guidedTranslate'),false);togglePressed($('guidedGloss'),false)}
$('guidedTopic').onchange=()=>beginGuided(chooseTopic('guidedTopic'));
$('randomGuided').onclick=()=>{$('guidedTopic').value=D.TOPICS[Math.floor(Math.random()*D.TOPICS.length)].id;beginGuided(chooseTopic('guidedTopic'))};
$('restartGuided').onclick=()=>beginGuided(chooseTopic('guidedTopic'));

function guidedSend(){
 const text=$('guidedInput').value.trim();if(!text)return;
 const last=[...g.history].reverse().find(m=>m.role==='bot');
 const sample=g.topic.turns[Math.min(g.turn,2)]?.sample||'';
 const result=markTurn(text,last?.text||'',g.topic,sample);
 g.history.push({role:'me',text});
 showEvaluation('guidedEvaluation',result);
 if(result.okay){
   g.turn++;const next=nextTurn(g,text);g.history.push({role:'bot',text:next.text,ko:next.ko});
   say(next.text);
 }
 renderChat('guidedHistory',g.history,g.translated);
 $('guidedProgress').textContent='대화 '+g.turn+'회 진행 · 계속 대화 가능';
 $('guidedLevel').textContent='Lv.'+progress.level;
 $('guidedStatus').textContent=result.okay?'좋아요! 다음 대화로 이어갑니다.':'같은 질문을 다시 듣고 답해 보세요.';
 $('guidedInput').value='';
 if(g.glossVisible)renderGloss('guidedGlossBox',g.history.slice(-6).map(m=>m.text));
}
$('guidedSend').onclick=guidedSend;$('guidedInput').addEventListener('keydown',e=>{if(e.isComposing||e.keyCode===229)return;if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();guidedSend()}});
$('guidedTranslate').onclick=()=>{g.translated=!g.translated;renderChat('guidedHistory',g.history,g.translated);togglePressed($('guidedTranslate'),g.translated)};
$('guidedGloss').onclick=()=>{g.glossVisible=!g.glossVisible;$('guidedGlossBox').hidden=!g.glossVisible;if(g.glossVisible)renderGloss('guidedGlossBox',g.history.slice(-6).map(m=>m.text));togglePressed($('guidedGloss'),g.glossVisible)};
$('guidedTip').onclick=()=>{var el=$('guidedTipBox');el.hidden=!el.hidden;if(!el.hidden){var recent=g.history.filter(x=>x.role==='me').slice(-1)[0];var text=recent?recent.text:'';el.textContent=/昨日|きのう/.test(text)?'💡 일본어는 과거의 동작에 〜ました를 자주 씁니다. 예: 昨日ホテルに行きました。':/今|いま/.test(text)?'💡 진행 중인 동작은 〜ています를 자주 씁니다. 예: 今、待っています。':'💡 일본어는 현재·미래를 같은 기본형으로 말하기도 합니다. 明日・来週 같은 시간 표현을 함께 사용하세요.'}};
$('guidedReplay').onclick=()=>{var last=[...g.history].reverse().find(m=>m.role==='bot');if(last)say(last.text)};
function listenMic(id,status){var SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$(status).textContent='이 브라우저에서 음성 인식이 지원되지 않습니다. 텍스트로 입력할 수 있습니다.';return}var r=new SR();r.lang='ja-JP';r.interimResults=false;r.maxAlternatives=1;r.onresult=e=>{$(id).value=e.results[0][0].transcript;$(status).textContent='음성을 받아 적었습니다. 확인 후 보내주세요.'};r.onerror=e=>$(status).textContent='마이크 오류: '+e.error+'. 텍스트로 입력하세요.';try{r.start();$(status).textContent='🎤 일본어를 듣고 있습니다...'}catch(e){$(status).textContent='마이크 사용에 실패했습니다.'}}
$('guidedMic').onclick=()=>listenMic('guidedInput','guidedStatus');
function beginFree(t){f=createSession(t);stage('freeBg','freeIcon','freeStage',t,'freeScenario');f.history.push({role:'bot',text:'こんにちは。今日は「'+t.name+'」について話しましょう。 '+t.turns[0].en,ko:'안녕하세요! 상황에 맞춰 대화해 봐요. '+t.turns[0].ko});renderChat('freeHistory',f.history,false);$('freeInput').value='';$('freeStatus').textContent='서버 없는 무료 연습 모드입니다. 추가 정보가 있으면 관련 질문을 이어갑니다.';$('freeGlossBox').hidden=true;togglePressed($('freeTranslate'),false);togglePressed($('freeGloss'),false)}
$('freeTopic').onchange=()=>beginFree(chooseTopic('freeTopic'));
$('freeRandom').onclick=()=>{$('freeTopic').value=D.TOPICS[Math.floor(Math.random()*D.TOPICS.length)].id;beginFree(chooseTopic('freeTopic'))};
$('freeReset').onclick=()=>beginFree(chooseTopic('freeTopic'));
$('freeEndpoint').disabled=true;$('freeEndpoint').placeholder='0원 고정: 외부 유료 API 연결 차단';
$('freeSaveEndpoint').disabled=true;$('freeSaveEndpoint').textContent='무료 기본 모드 사용';
$('freeMode').textContent='월 0원 · 브라우저 대화 연습';

function freeSend(){
 const text=$('freeInput').value.trim();if(!text)return;
 const last=[...f.history].reverse().find(m=>m.role==='bot');
 const sample=f.topic.turns[Math.min(f.turn,2)]?.sample||'';
 const result=markTurn(text,last?.text||'',f.topic,sample);
 f.history.push({role:'me',text});
 showEvaluation('freeEvaluation',result);
 if(result.okay){
   f.turn++;const next=nextTurn(f,text);f.history.push({role:'bot',text:next.text,ko:next.ko});
   say(next.text);
 }
 renderChat('freeHistory',f.history,f.translated);
 $('freeInput').value='';
 $('freeStatus').textContent='대화 '+f.turn+'회 · '+(result.okay?'다음 질문으로 이어갑니다.':'같은 질문을 다른 표현으로 답해 보세요.');
 if(f.glossVisible)renderGloss('freeGlossBox',f.history.slice(-6).map(x=>x.text));
}
$('freeSend').onclick=freeSend;$('freeInput').addEventListener('keydown',e=>{if(e.isComposing||e.keyCode===229)return;if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();freeSend()}});
$('freeMic').onclick=()=>listenMic('freeInput','freeStatus');
$('freeTranslate').onclick=()=>{f.translated=!f.translated;renderChat('freeHistory',f.history,f.translated);togglePressed($('freeTranslate'),f.translated)};
$('freeGloss').onclick=()=>{f.glossVisible=!f.glossVisible;$('freeGlossBox').hidden=!f.glossVisible;if(f.glossVisible)renderGloss('freeGlossBox',f.history.slice(-6).map(m=>m.text));togglePressed($('freeGloss'),f.glossVisible)};
$('freeReplay').onclick=()=>{var last=[...f.history].reverse().find(m=>m.role==='bot');if(last)say(last.text)};
// Quiz modes: each combination of theme, 3 utterances and 24 setting permutations is selectable.
var quizSeed=0,currentQuiz=null;

function makeQuiz(){
 const t=$('quizTopic').value==='all'?D.TOPICS[Math.floor(Math.random()*D.TOPICS.length)]:chooseTopic('quizTopic');
 const itemIndex=(quizSeed+Math.floor(Math.random()*3))%3;
 const item=t.turns[itemIndex];
 const variant=D.VARIANTS[(quizSeed+Math.floor(Math.random()*D.VARIANTS.length))%D.VARIANTS.length];
 const other=D.TOPICS.filter(x=>x.id!==t.id);
 let distractor1=other[(quizSeed*7+3)%other.length].turns[(itemIndex+1)%3].sample;
 let distractor2=other[(quizSeed*11+9)%other.length].turns[(itemIndex+2)%3].sample;
 let answers=[item.sample,distractor1,distractor2];
 if(new Set(answers).size<3){
   const choices=[...new Set(D.TOPICS.flatMap(x=>x.turns.map(y=>y.sample)))];
   answers=[item.sample];
   for(let j=0;j<choices.length && answers.length<3;j++){
     const candidate=choices[(j+quizSeed*13)%choices.length];
     if(!answers.includes(candidate))answers.push(candidate);
   }
 }
 answers=answers.map((a,i)=>({a,correct:i===0,ko:D.QUIZ_KO?.get(a)||'번역이 등록되지 않았습니다. 단어 뜻 버튼으로 확인해 주세요.'})).sort(()=>Math.random()-.5);
 currentQuiz={t,item,variant,answers,done:false,petId:t.id+'|'+itemIndex+'|'+variant.time+'|'+variant.company+'|'+variant.mood};
 $('quizQuestion').textContent=item.en;
 $('quizQuestionKo').textContent=item.ko;
 $('quizQuestionKo').hidden=true;
 $('quizTranslateQuestion').setAttribute('aria-pressed','false');
 $('quizWordPanel').hidden=true;
 $('quizWords').setAttribute('aria-pressed','false');
 $('quizEmoji').textContent=t.icon;
 stage('quizBg','quizEmoji','quizScene',t,'quizContext');
 $('quizContext').textContent=t.name+' · '+variant.time+' · '+variant.company;
 $('quizFeedback').hidden=true;
 const area=$('quizAnswers');area.innerHTML='';
 answers.forEach((x,i)=>{
   const row=document.createElement('div');row.className='quiz-answer-row';
   const b=document.createElement('button');b.type='button';b.className='option quiz-answer-choice';
   b.innerHTML='<span class="letter">'+String.fromCharCode(65+i)+'</span>'+esc(x.a);
   b.onclick=()=>{
     if(currentQuiz.done)return;
     currentQuiz.done=true;progress.quizzes++;if(x.correct)progress.quizCorrect++;persist();
     petReward('quiz',currentQuiz.petId,x.correct);
     document.querySelectorAll('#quizAnswers .quiz-answer-choice').forEach((node,k)=>node.classList.toggle(answers[k].correct?'correct':k===i?'wrong':'unused',true));
     $('quizFeedback').hidden=false;
     $('quizFeedback').textContent=x.correct?'✅ 자연스러운 대답입니다. '+item.ko:'💡 이 상황에서는 "'+item.sample+'"처럼 대답할 수 있습니다. '+item.ko;
   };
   const listen=document.createElement('button');listen.className='btn-soft quiz-mini-action';listen.type='button';listen.textContent='🔊';listen.title='답 '+String.fromCharCode(65+i)+' 듣기';listen.setAttribute('aria-label',listen.title);listen.onclick=()=>say(x.a);
   const tr=document.createElement('button');tr.className='btn-soft quiz-mini-action';tr.type='button';tr.textContent='🇰🇷';tr.title='답 '+String.fromCharCode(65+i)+' 번역';tr.setAttribute('aria-label',tr.title);
   const ko=document.createElement('p');ko.className='quiz-korean quiz-answer-ko';ko.hidden=true;ko.textContent=x.ko;
   tr.onclick=()=>{ko.hidden=!ko.hidden;tr.setAttribute('aria-pressed',String(!ko.hidden))};
   row.append(b,listen,tr,ko);area.appendChild(row);
 });
 $('quizProgress').textContent='문제 '+(quizSeed+1)+' · 테마별 변형';
}
$('quizSpeakQuestion').onclick=()=>{if(currentQuiz)say(currentQuiz.item.en)};
$('quizTranslateQuestion').onclick=()=>{
 const p=$('quizQuestionKo');p.hidden=!p.hidden;
 $('quizTranslateQuestion').setAttribute('aria-pressed',String(!p.hidden));
};
$('quizWords').onclick=()=>{
 const p=$('quizWordPanel');p.hidden=!p.hidden;
 $('quizWords').setAttribute('aria-pressed',String(!p.hidden));
 if(!p.hidden && currentQuiz)renderGloss('quizWordPanel',[currentQuiz.item.en,...currentQuiz.answers.map(x=>x.a)]);
};
$('quizNext').onclick=()=>{quizSeed++;makeQuiz()};$('quizTopic').onchange=()=>{quizSeed++;makeQuiz()};
// Vocabulary
var pageWords=0,unknownOnly=false,visibleWords=[];
var groups=[...new Set(D.WORDS.map(w=>w.group))];groups.forEach(g=>$('wordGroup').add(new Option(D.GROUP_KO?.[g]||g,g)));
function wordFilter(){var query=$('wordSearch').value.trim().toLowerCase(),group=$('wordGroup').value;visibleWords=D.WORDS.filter(w=>(group==='all'||w.group===group)&&(!unknownOnly||!progress.known.includes(w.word))&&(!query||w.word.toLowerCase().includes(query)||w.ko.includes(query)));pageWords=0;renderWords()}

function renderWords(){
 const count=Math.min(visibleWords.length,(pageWords+1)*45),area=$('wordGrid');
 area.innerHTML='';
 visibleWords.slice(0,count).forEach(w=>{
  const card=document.createElement('div');card.className='wordcard';
  const showVisual=($('wordVisual')?.value||'simple')!=='text';
  const pict=D.VISUALS?.get(w.word)||null;
  const iconHTML=showVisual
    ?'<div class="wordicon'+(!pict?' wordmonogram':'')+'" aria-hidden="true">'+(pict?esc(pict):esc(w.word.slice(0,2)))+'</div>'
    :'';
  card.innerHTML=iconHTML+'<strong>'+esc(w.word.toLowerCase())+'</strong><span class="meaning" hidden>'+esc(w.ko)+'</span><div class="wordactions"><button class="minibtn meaningbtn">뜻 보기</button><button class="minibtn voicebtn">🔊</button><button class="minibtn knownbtn'+(progress.known.includes(w.word)?' known':'')+'">'+(progress.known.includes(w.word)?'✓ 암기':'○ 암기')+'</button></div>';
  card.querySelector('.meaningbtn').onclick=()=>{
   const meaning=card.querySelector('.meaning');meaning.hidden=!meaning.hidden;
   card.querySelector('.meaningbtn').textContent=meaning.hidden?'뜻 보기':'뜻 숨기기';
   if(!meaning.hidden)petReward('word',w.word);
  };
  card.querySelector('.voicebtn').onclick=()=>{say(w.word.toLowerCase());petReward('word',w.word)};
  card.querySelector('.knownbtn').onclick=()=>{
   const adding=!progress.known.includes(w.word);
   if(!adding)progress.known=progress.known.filter(x=>x!==w.word);
   else progress.known.push(w.word);
   persist();if(adding)petReward('word',w.word);renderWords();
  };
  area.appendChild(card);
 });
 $('wordCount').textContent=count+' / '+visibleWords.length+'개';
 $('wordMore').hidden=count>=visibleWords.length;
}
$('wordSearch').addEventListener('input',wordFilter);$('wordGroup').onchange=wordFilter;$('wordUnknown').onclick=()=>{unknownOnly=!unknownOnly;$('wordUnknown').textContent=unknownOnly?'전체 단어 보기':'모르는 단어만';wordFilter()};$('wordMore').onclick=()=>{pageWords++;renderWords()};
$('wordVisual').onchange=renderWords;
// Crossword: deterministic puzzle IDs, 20+ placed words required for a playable board.
var PNUM=400,puzzle=null,selected=null;
const CROSS_LANG='ja',HINT_STORE='yanado_crossword_hints_v09';
let storedHints=[];try{const raw=JSON.parse(localStorage.getItem(HINT_STORE)||'[]');if(Array.isArray(raw))storedHints=raw.slice(-5000).filter(x=>typeof x==='string')}catch(e){}
const revealedWords=new Set(storedHints);
function selectedHintId(w){return CROSS_LANG+'|'+($('puzzleDifficulty')?.value||'medium')+'|'+String($('puzzleNumber')?.value||'1')+'|'+w.word+'|'+w.dir+'|'+w.row+'|'+w.col}
function noteRevealedWord(w){
 revealedWords.add(selectedHintId(w));
 try{localStorage.setItem(HINT_STORE,JSON.stringify([...revealedWords].slice(-5000)))}catch(e){}
}
let previousSelectedHint=null;
function updateSelectedClue(w){
 const id=w?selectedHintId(w):null;
 if(id!==previousSelectedHint){
  previousSelectedHint=id;
  const notice=$('puzzleWordMessage');
  if(notice){notice.textContent='선택한 낱말을 입력하고 채점하거나 정답을 확인하세요.';if(notice.parentElement)delete notice.parentElement.dataset.result}
 }
 const label=$('puzzleSelectedWord');if(!label)return;
 label.textContent=w?(w.dir==='across'?'가로 ':'세로 ')+w.number+'번 · '+w.ko+' ('+[...w.word].length+'글자)':'가로·세로 힌트에서 낱말을 선택하세요.';
}
for(var n=1;n<=PNUM;n++)$('puzzleNumber').add(new Option('퍼즐 '+n,n));
function rng(seed){var x=seed|0;return function(){x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
function shuffle(list,random){for(var i=list.length-1;i>0;i--){var j=Math.floor(random()*(i+1));var t=list[i];list[i]=list[j];list[j]=t}return list}
function buildPuzzle(num){var difficulty=$('puzzleDifficulty')?.value||'medium';var minLen=difficulty==='easy'?3:difficulty==='hard'?7:4;var maxLen=difficulty==='easy'?5:difficulty==='hard'?11:8;var pattern=new RegExp('^[ぁ-ゟァ-ヿー]{'+minLen+','+maxLen+'}$','u');
var used=new Set();
var pool=D.WORDS.filter(w=>{if(!pattern.test(w.word)||used.has(w.word))return false;used.add(w.word);return true});var size=difficulty==='hard'?37:29,best=null;
for(var round=0;round<30;round++){
var r=rng(num*31337+round*9089+773+(difficulty==='easy'?111111:difficulty==='hard'?333333:222222));
var entries=shuffle([...pool],r).slice(0,80);
entries.sort((a,b)=>b.word.length-a.word.length);
var grid=Array.from({length:size},()=>Array(size).fill(''));
var placed=[],first=entries.shift(),sr=Math.floor(size/2),sc=Math.floor((size-first.word.length)/2);
for(var i=0;i<first.word.length;i++)grid[sr][sc+i]=first.word[i];
placed.push({word:first.word,ko:first.ko,dir:'across',row:sr,col:sc});
for(var entry of entries){var w=entry.word,candidates=[];
for(var anchor of placed){for(var a=0;a<w.length;a++)for(var b=0;b<anchor.word.length;b++){
if(w[a]!==anchor.word[b])continue;var dir=anchor.dir==='across'?'down':'across';
var y=dir==='down'?anchor.row-a:anchor.row+(anchor.dir==='down'?b:0);
var x=dir==='across'?anchor.col-a:anchor.col+(anchor.dir==='across'?b:0);
var overlaps=0,valid=true;
for(var k=-1;k<=w.length;k++){var yy=y+(dir==='down'?k:0),xx=x+(dir==='across'?k:0);
if(yy<0||xx<0||yy>=size||xx>=size){valid=false;break}
var old=grid[yy][xx];if(k===-1||k===w.length){if(old){valid=false;break}continue}
if(old&&old!==w[k]){valid=false;break}
if(old){overlaps++;continue}
var neighbors=dir==='down'?[[0,1],[0,-1]]:[[1,0],[-1,0]];
if(neighbors.some(v=>grid[yy+v[0]]&&grid[yy+v[0]][xx+v[1]])){valid=false;break}
}if(valid&&overlaps>0)candidates.push({y,x,dir,overlaps})
}}
if(candidates.length){candidates.sort((a,b)=>b.overlaps-a.overlaps);var chosen=candidates[Math.floor(r()*Math.min(3,candidates.length))];for(var k=0;k<w.length;k++)grid[chosen.y+(chosen.dir==='down'?k:0)][chosen.x+(chosen.dir==='across'?k:0)]=w[k];placed.push({word:w,ko:entry.ko,dir:chosen.dir,row:chosen.y,col:chosen.x})}
if(placed.length>=23)break
}
if(!best||placed.length>best.placed.length)best={grid,placed,size};
if(placed.length>=20)break
}
if(!best||best.placed.length<20)return null;
var numbering=new Map(),count=0;
best.placed.sort((a,b)=>a.row-b.row||a.col-b.col);
best.placed.forEach(w=>{var id=w.row+','+w.col;if(!numbering.has(id))numbering.set(id,++count);w.number=numbering.get(id)});
best.numbering=numbering;return best}
function focusCell(p,i){var row=p.row+(p.dir==='down'?i:0),col=p.col+(p.dir==='across'?i:0);return $('puzzleGrid').querySelector('[data-position="'+row+','+col+'"]')}
function selectWord(p,index){selected=p;updateSelectedClue(p);document.querySelectorAll('#puzzleClues .clue').forEach(b=>b.classList.toggle('active',b.dataset.word===p.word));document.querySelectorAll('#puzzleGrid input').forEach(el=>el.classList.remove('chosen'));for(var i=0;i<p.word.length;i++){var x=focusCell(p,i);if(x)x.classList.add('chosen')}var cell=focusCell(p,index||0);if(cell){cell.focus();cell.select()}}
function renderPuzzle(num){
 selected=null;
 const panel=$('puzzleWordMessage'),box=panel?.parentElement;
 if(panel)panel.textContent='힌트를 누르고 낱말을 입력하세요. 하나만 채점하거나 정답을 볼 수 있습니다.';
 if(box)delete box.dataset.result;
 updateSelectedClue(null);
 puzzle=buildPuzzle(num);var msg=$('puzzleMessage');if(!puzzle){$('puzzleGrid').innerHTML='';$('puzzleClues').innerHTML='';$('puzzleInfo').textContent='재생성 필요';msg.textContent='20단어 이상을 배치하지 못했습니다. 다른 번호를 선택해 주세요.';return}var coords=[];for(var y=0;y<puzzle.size;y++)for(var x=0;x<puzzle.size;x++)if(puzzle.grid[y][x])coords.push([y,x]);var minY=Math.min(...coords.map(v=>v[0])),maxY=Math.max(...coords.map(v=>v[0])),minX=Math.min(...coords.map(v=>v[1])),maxX=Math.max(...coords.map(v=>v[1]));var cols=maxX-minX+1;var board=$('puzzleGrid');board.innerHTML='';board.style.gridTemplateColumns='repeat('+cols+',var(--crossSize, 29px))';var byPos=new Map();
puzzle.placed.forEach(w=>{for(var i=0;i<w.word.length;i++){var key=(w.row+(w.dir==='down'?i:0))+','+(w.col+(w.dir==='across'?i:0));if(!byPos.has(key))byPos.set(key,[]);byPos.get(key).push({p:w,i})}});
for(var y=minY;y<=maxY;y++)for(var x=minX;x<=maxX;x++){var wrap=document.createElement('div');wrap.className='crosscell';if(!puzzle.grid[y][x])wrap.classList.add('black');else{var input=document.createElement('input');input.type='text';input.maxLength=2;input.autocomplete='off';input.autocorrect='off';input.spellcheck=false;input.autocapitalize='off';input.inputMode='text';input.dataset.position=y+','+x;input.setAttribute('aria-label','일본어 가로세로 '+(y+1)+','+(x+1));input.setAttribute('lang','ja');var candidates=byPos.get(y+','+x)||[];input.addEventListener('focus',()=>{if(!selected||!candidates.some(c=>c.p===selected))selected=candidates[0]?.p||selected;if(selected)selectWordHighlight(selected)});input.addEventListener('click',()=>{if(!selected||!candidates.some(c=>c.p===selected)){selected=candidates[0]?.p;selectWordHighlight(selected)}else if(candidates.length>1){var other=candidates.find(c=>c.p!==selected);if(other){selected=other.p;selectWordHighlight(selected)}}});input.addEventListener('input',(event)=>{if(event.isComposing)return;var s=(input.value||'').normalize('NFKC').replace(/[^ぁ-ゟァ-ヿー]/gu,'');input.value=[...s].slice(-1).join('');if(!input.value)return;var active=candidates.find(c=>c.p===selected)||candidates[0];if(active){selected=active.p;selectWordHighlight(selected);var next=focusCell(selected,active.i+1);if(next){next.focus();next.select()}}});input.addEventListener('keydown',e=>{var active=candidates.find(c=>c.p===selected)||candidates[0];if(!active)return;if(e.key==='Backspace'&&!input.value){var previous=focusCell(active.p,active.i-1);if(previous){previous.focus();previous.value='';e.preventDefault()}}if(e.key==='ArrowRight'||e.key==='ArrowDown'){var next=focusCell(active.p,active.i+1);if(next){next.focus();e.preventDefault()}}if(e.key==='ArrowLeft'||e.key==='ArrowUp'){var prev=focusCell(active.p,active.i-1);if(prev){prev.focus();e.preventDefault()}}});wrap.appendChild(input);var numHere=puzzle.numbering.get(y+','+x);if(numHere){var numEl=document.createElement('span');numEl.className='crossnum';numEl.textContent=numHere;wrap.appendChild(numEl)}}board.appendChild(wrap)}
var clueWrap=$('puzzleClues');clueWrap.innerHTML='';['across','down'].forEach(dir=>{var panel=document.createElement('div');panel.className='cluepanel';panel.innerHTML='<h3>'+(dir==='across'?'가로':'세로')+' ('+puzzle.placed.filter(x=>x.dir===dir).length+')</h3>';puzzle.placed.filter(x=>x.dir===dir).sort((a,b)=>a.number-b.number).forEach(w=>{var b=document.createElement('button');b.className='clue';b.dataset.word=w.word;b.textContent=w.number+'. '+w.ko+' ('+w.word.length+'글자)';b.onclick=()=>selectWord(w,0);panel.appendChild(b)});clueWrap.appendChild(panel)});
$('puzzleInfo').textContent='실제 교차 단어 '+puzzle.placed.length+'개';msg.textContent='ひらがな・カタカナ를 입력하면 다음 칸으로 이동합니다. 일본어 키보드를 사용하세요.';selected=puzzle.placed[0];selectWordHighlight(selected)}
function selectWordHighlight(p){if(!p)return;updateSelectedClue(p);document.querySelectorAll('#puzzleClues .clue').forEach(b=>b.classList.toggle('active',b.dataset.word===p.word));document.querySelectorAll('#puzzleGrid input').forEach(el=>el.classList.remove('chosen'));for(var i=0;i<p.word.length;i++){var cell=focusCell(p,i);if(cell)cell.classList.add('chosen')}}
$('puzzleNumber').onchange=()=>renderPuzzle(Number($('puzzleNumber').value));
$('puzzleDifficulty').onchange=()=>renderPuzzle(Number($('puzzleNumber').value));$('puzzleNext').onclick=()=>{$('puzzleNumber').value=1+Math.floor(Math.random()*PNUM);renderPuzzle(Number($('puzzleNumber').value))};

function selectedWordCells(w){return [...w.word].map((_,i)=>focusCell(w,i))}
function charValue(v){
 const txt=String(v||'').trim();
 return CROSS_LANG==='ja'?txt.normalize('NFKC'):txt.toUpperCase();
}
function wordRewardId(w){
 return ($('puzzleDifficulty')?.value||'medium')+'|'+String($('puzzleNumber')?.value||1)+'|'+w.word+'|'+w.dir+'|'+w.row+'|'+w.col;
}
function tellWordResult(message,result){
 const node=$('puzzleWordMessage');
 if(node){node.textContent=message;if(node.parentElement)node.parentElement.dataset.result=result}
}
$('puzzleWordCheck').onclick=()=>{
 if(!puzzle||!selected){tellWordResult('먼저 가로 또는 세로에서 낱말을 선택해 주세요.','wrong');return}
 const letters=[...selected.word],cells=selectedWordCells(selected);
 const filled=cells.filter(cell=>cell&&charValue(cell.value)).length;
 const matched=letters.filter((letter,i)=>cells[i]&&charValue(cells[i].value)===letter).length;
 cells.forEach((cell,i)=>{
  if(!cell)return;
  const good=charValue(cell.value)===letters[i];
  cell.classList.toggle('correct',good);
  cell.classList.toggle('word-wrong',!!charValue(cell.value)&&!good);
 });
 if(matched===letters.length){
   tellWordResult('✅ '+selected.number+'번 정답입니다! '+selected.ko+' = '+selected.word,'correct');
   if(!revealedWords.has(selectedHintId(selected)))petReward('crossword',wordRewardId(selected));
 }else if(!filled){
   tellWordResult('✏️ '+selected.number+'번 낱말을 먼저 입력해 주세요. 힌트: '+selected.ko,'wrong');
 }else{
   tellWordResult('🟠 '+selected.number+'번 · '+letters.length+'글자 중 '+matched+'글자가 맞았습니다. 나머지를 다시 확인해 보세요.','wrong');
 }
};
$('puzzleWordReveal').onclick=()=>{
 if(!puzzle||!selected){tellWordResult('먼저 낱말을 선택해 주세요.','wrong');return}
 noteRevealedWord(selected);
 tellWordResult('👁 '+selected.number+'번 정답: '+selected.word+' · '+selected.ko+' (정답을 본 낱말은 먹이 보상에서 제외됩니다.)','revealed');
};

$('puzzleCheck').onclick=()=>{if(!puzzle)return;var ok=0,all=0;
document.querySelectorAll('#puzzleGrid input').forEach(el=>{var [r,c]=el.dataset.position.split(',').map(Number);var right=el.value.normalize('NFKC')===puzzle.grid[r][c];el.classList.toggle('correct',right);ok+=right?1:0;all++});
var puzzleId=($('puzzleDifficulty')?.value||'medium')+'|'+String($('puzzleNumber').value||1);
puzzle.placed.forEach(w=>{var solved=[...w.word].every((char,i)=>{var el=focusCell(w,i);return !!el&&el.value.trim().normalize('NFKC')===char});if(solved&&!revealedWords.has(selectedHintId(w)))petReward('crossword',puzzleId+'|'+w.word+'|'+w.dir+'|'+w.row+'|'+w.col)});
if(ok===all&&all>0&&!puzzle.placed.some(w=>revealedWords.has(selectedHintId(w))))petReward('crosswordComplete',puzzleId);
$('puzzleMessage').textContent='맞힌 칸 '+ok+' / '+all+' · '+(ok===all?'축하합니다!':'정답이 아닌 칸을 다시 확인해 보세요.')};
function report(){var items=[['총 대화',progress.turns+'회'],['응답 연습',progress.attempts+'회'],['대화 응답률 (휴리스틱)',progress.attempts?Math.round(progress.understood/progress.attempts*100)+'%':'—'],['대화 퀴즈',progress.quizzes?Math.round(progress.quizCorrect/progress.quizzes*100)+'%':'—'],['기억한 단어',progress.known.length+'개'],['학습 난이도','Lv.'+progress.level]];$('reportStats').innerHTML=items.map(x=>'<div class="stat"><strong>'+esc(x[1])+'</strong><span>'+esc(x[0])+'</span></div>').join('');$('reportDetails').innerHTML='<h3>현재 난이도 Lv.'+progress.level+' / 8</h3><div class="progressbar"><span style="width:'+(progress.level/8*100)+'%"></span></div><p>지금 버전은 긴 답변과 의미 관련 단서 등을 활용하는 <b>연습용 규칙 기반 수준</b>입니다. 실제 일본인 화자의 이해도를 정확히 판단하거나 공인 일본어 능력시험 등급을 인증하지 않습니다.</p><p>일본어 문맥 이해와 문법 교정은 현재 규칙 기반입니다. 실제 의미 기반 AI 연동은 추후 필요합니다. 현재 연결된 외부 과금 API는 없습니다.</p>'}
$('clearProgress').onclick=()=>{if(confirm('이 기기의 학습 기록을 초기화할까요?')){progress=Object.assign({},DEFAULT);persist();report();wordFilter()}};
beginGuided(D.TOPICS[0]);beginFree(D.TOPICS[0]);makeQuiz();wordFilter();renderPuzzle(1);persist();
(function addJapaneseKanaPad(){
 const parent=$('puzzleViewport')?.parentElement;if(!parent)return;
 const area=document.createElement('section');area.id='japaneseKanaPad';area.className='ja-kana-panel';
 const title=document.createElement('p');title.className='tiny';title.textContent='🇯🇵 일본어 글자 패드 · 단어를 선택한 후 글자를 누르면 다음 칸으로 이동해요.';area.appendChild(title);
 const nav=document.createElement('div');nav.className='ja-kana-nav';area.appendChild(nav);
 let mode='hira';
 const keypad=document.createElement('div');keypad.className='ja-kana-grid';
 function transform(ch){return mode==='kata'&&/[ぁ-ゖ]/u.test(ch)?String.fromCharCode(ch.charCodeAt(0)+0x60):ch}
 function makeKeys(){
  keypad.innerHTML='';
  const letters=Array.from('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉゃゅょっー');
  for(const base of letters){
   const b=document.createElement('button');b.className='ja-kana-key';b.type='button';b.textContent=transform(base);
   b.addEventListener('click',()=>{
      const active=document.activeElement,all=selected?[...selected.word].map((_,i)=>focusCell(selected,i)):[],
            field=(all.includes(active)?active:all.find(x=>x&&!x.value))||all[0];
      if(!field)return;
      const targetScript=/[ァ-ヿ]/u.test(selected.word)?'kata':'hira';
      const ch=targetScript==='kata'&&/[ぁ-ゖ]/u.test(base)?String.fromCharCode(base.charCodeAt(0)+0x60):base;
      field.value=ch;field.dispatchEvent(new Event('input',{bubbles:true}));
   });keypad.appendChild(b);
  }
 }
 for(const [label,v] of [['ひらがな','hira'],['カタカナ','kata']]){
  const b=document.createElement('button');b.type='button';b.className='btn-soft small';b.textContent=label;
  b.onclick=()=>{mode=v;makeKeys()};nav.appendChild(b);
 }
 area.appendChild(keypad);parent.appendChild(area);makeKeys();
})();

})();
