
(function(){
'use strict';
var D=window.YANA_DATA;
if(!D){document.body.insertAdjacentHTML('beforeend','<p>학습 데이터를 불러오지 못했습니다. 새로고침해주세요.</p>');return;}
var $=id=>document.getElementById(id);
var esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
var DEFAULT={level:1,attempts:0,understood:0,quizzes:0,quizCorrect:0,known:[],turns:0};
var progress;
try{progress=Object.assign({},DEFAULT,JSON.parse(localStorage.getItem('yanado_v03')||'{}'))}catch(e){progress=Object.assign({},DEFAULT)}
if(!Array.isArray(progress.known))progress.known=[];
var enVoice=null;
function voices(){if(!window.speechSynthesis)return;var list=speechSynthesis.getVoices()||[];enVoice=list.find(v=>v.lang.toLowerCase()==='en-us' && /natural|enhanced|premium/i.test(v.name))||list.find(v=>v.lang.toLowerCase()==='en-us')||list.find(v=>v.lang.startsWith('en'))||null}
if(window.speechSynthesis){voices();speechSynthesis.onvoiceschanged=voices}
function say(en){if(!('speechSynthesis' in window))return;voices();speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(en);u.lang='en-US';u.rate=Number(($('speakSpeed')||{}).value||1);u.pitch=1;u.volume=1;if(enVoice)u.voice=enVoice;speechSynthesis.speak(u)}
function persist(){try{localStorage.setItem('yanado_v03',JSON.stringify(progress))}catch(e){}$('badgeLevel').textContent='대화 Lv.'+progress.level}
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
function glossary(text){var parts=(String(text).toLowerCase().match(/[a-z]+/g)||[]),out=[],seen=new Set();parts.forEach(w=>{var entry=byWord.get(w),ko=entry?entry.ko:common[w];if(ko&&!seen.has(w)){seen.add(w);out.push({en:w,ko})}});return out}
function renderGloss(id,lines){var out=new Map();lines.forEach(t=>glossary(t).forEach(w=>out.set(w.en,w.ko)));$(id).innerHTML='<div class="glosslist">'+[...out].map(k=>'<button class="glossword" type="button" data-pronounce="'+esc(k[0])+'">'+esc(k[0])+' · '+esc(k[1])+'</button>').join('')+'</div>';$(id).querySelectorAll('[data-pronounce]').forEach(b=>b.onclick=()=>say(b.dataset.pronounce))}
function togglePressed(btn,yes){btn.classList.toggle('active',yes);btn.setAttribute('aria-pressed',String(yes))}
function bubble(who,en,ko){var div=document.createElement('div');div.className='bubble'+(who==='me'?' user':'');div.innerHTML='<span class="who">'+(who==='me'?'🙋 나':'👩‍🏫 영어 친구')+'</span><span class="eng">'+esc(en)+'</span>'+(ko?'<span class="ko" hidden>'+esc(ko)+'</span>':'');return div}
function renderChat(id,history,translated){var box=$(id);box.innerHTML='';history.forEach(m=>{var el=bubble(m.role,m.text,m.ko);if(translated)el.querySelectorAll('.ko').forEach(k=>k.hidden=false);box.appendChild(el)});box.scrollTop=box.scrollHeight}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function normalize(s){return String(s).toLowerCase().replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim()}
function topicAt(id){return D.TOPICS.find(t=>t.id===id)||D.TOPICS[0]}
function cueFrom(text,state,t){var norm=normalize(text),pairs=[
{r:/\b(wife|husband|spouse|partner|family|kids?|children|friend|friends)\b/,key:'company',q:'That sounds nice! What would you like to do together?',ko:'좋네요! 함께 무엇을 하고 싶으세요?'},
{r:/\b(dinner|lunch|breakfast|eat|food|restaurant|pizza|burger|meal)\b/,key:'food',q:'Sounds good! What kind of food would you like?',ko:'좋네요! 어떤 음식을 드시고 싶으세요?'},
{r:/\b(hotel|room|stay|check.?in|check.?out)\b/,key:'hotel',q:'I see. How long are you planning to stay there?',ko:'그렇군요. 그곳에서 얼마나 머무를 계획인가요?'},
{r:/\b(airport|plane|flight|fly|flying|airline)\b/,key:'flight',q:'Nice! What are you planning to do after you arrive?',ko:'좋아요! 도착한 뒤 무엇을 할 계획인가요?'},
{r:/\b(tomorrow|weekend|next week|next monday)\b/,key:'future',q:'Good plan! Who are you going with?',ko:'좋은 계획이네요! 누구와 함께 가시나요?'},
{r:/\b(yesterday|last night|last week|went|did)\b/,key:'past',q:'Interesting! Did you enjoy it?',ko:'재미있네요! 즐거우셨나요?'},
{r:/\b(shop|shopping|buy|store|mall|shirt|shoes)\b/,key:'shopping',q:'Are you looking for something specific?',ko:'특별히 찾으시는 것이 있나요?'},
{r:/\b(sick|hurt|fever|headache|pain|tired)\b/,key:'health',q:'Sorry to hear that. How long have you felt this way?',ko:'그렇군요. 언제부터 그러셨나요?'},
{r:/\b(work|office|meeting|project|busy)\b/,key:'work',q:'What is the most important thing you need to do next?',ko:'다음으로 해야 할 가장 중요한 일은 무엇인가요?'},
{r:/\b(bus|station|subway|train|taxi|street)\b/,key:'travel',q:'What time do you need to get there?',ko:'몇 시까지 거기에 도착해야 하나요?'},
{r:/\b(restroom|toilet|bathroom)\b/,key:'restroom',q:'Would you like me to tell you the quickest way?',ko:'가장 빠른 길을 알려드릴까요?'}
];for(var i=0;i<pairs.length;i++){var p=pairs[i];if(p.r.test(norm) && !state.used.has(p.key)){state.used.add(p.key);return {text:p.q,ko:p.ko}}}return null}
var followups=[
['What would you like to do next?','다음에는 무엇을 하고 싶으세요?'],
['Can you tell me a little more about that?','그것에 관해 조금 더 이야기해 주시겠어요?'],
['Who will be with you?','누가 함께할 예정인가요?'],
['When would you like to do that?','언제 그렇게 하고 싶으세요?'],
['What do you like most about it?','그 점에서 무엇이 가장 좋으세요?'],
['Do you have a plan for tomorrow?','내일 계획이 있으세요?'],
['Why do you think so?','왜 그렇게 생각하세요?'],
['What happened after that?','그 뒤에는 무슨 일이 있었나요?'],
['What would make it easier for you?','어떻게 하면 더 쉬워질까요?'],
['How did you feel about it?','그 일에 대해 어떤 기분이었나요?'],
['Would you like to try something different?','다른 것을 시도해 보고 싶으세요?']
];
function nextTurn(s,text){var special=cueFrom(text,s,s.topic);if(special)return special;
if(s.turn<3){var item=s.topic.turns[s.turn];return {text:item.en,ko:item.ko}}
var ix=s.nextExtra++%followups.length;return {text:followups[ix][0],ko:followups[ix][1]}}
function createSession(topic){return {topic,turn:0,nextExtra:0,used:new Set(),history:[],translated:false,glossVisible:false}}
function scoreReply(text){var n=normalize(text),words=n.split(' ').filter(Boolean);if(!words.length)return {okay:false,reason:'말씀해 주세요.'};var okay=words.length>=2||/\b(yes|no|sure|okay|thanks|please|here)\b/.test(n);return {okay,reason:okay?'대화에 응답했습니다. 의미 평가는 규칙 기반 추정입니다.':'짧은 대답도 괜찮아요. 조금 더 알려주세요.'}}
function markTurn(text){var r=scoreReply(text);progress.attempts++;progress.turns++;if(r.okay)progress.understood++;if(progress.attempts%8===0){var score=progress.understood/Math.max(1,progress.attempts);if(score>=.78)progress.level=Math.min(8,progress.level+1);else if(score<.38)progress.level=Math.max(1,progress.level-1)}persist();return r}
function chooseTopic(sel){var t=topicAt($(sel).value);return t}
var g=createSession(D.TOPICS[0]),f=createSession(D.TOPICS[0]);
function beginGuided(t){g=createSession(t);stage('guidedBg','guidedIcon','guidedStage',t,'guidedScenario');g.history.push({role:'bot',text:t.turns[0].en,ko:t.turns[0].ko});renderChat('guidedHistory',g.history,false);$('guidedProgress').textContent='질문 1 / 계속 대화 가능';$('guidedLevel').textContent='Lv.'+progress.level;$('guidedGlossBox').hidden=true;$('guidedTipBox').hidden=true;$('guidedStatus').textContent='질문을 듣고 자유롭게 답하세요. 문법이 조금 틀려도 괜찮습니다.';$('guidedInput').value='';togglePressed($('guidedTranslate'),false);togglePressed($('guidedGloss'),false)}
$('guidedTopic').onchange=()=>beginGuided(chooseTopic('guidedTopic'));
$('randomGuided').onclick=()=>{$('guidedTopic').value=D.TOPICS[Math.floor(Math.random()*D.TOPICS.length)].id;beginGuided(chooseTopic('guidedTopic'))};
$('restartGuided').onclick=()=>beginGuided(chooseTopic('guidedTopic'));
function guidedSend(){var text=$('guidedInput').value.trim();if(!text)return;g.history.push({role:'me',text});var result=markTurn(text);g.turn++;var next=nextTurn(g,text);g.history.push({role:'bot',text:next.text,ko:next.ko});renderChat('guidedHistory',g.history,g.translated);$('guidedProgress').textContent='대화 '+g.turn+'회 진행 · 자유롭게 계속 가능';$('guidedLevel').textContent='Lv.'+progress.level;$('guidedStatus').textContent=result.reason;$('guidedInput').value='';if(!g.glossVisible){}else renderGloss('guidedGlossBox',g.history.slice(-6).map(m=>m.text));say(next.text)}
$('guidedSend').onclick=guidedSend;$('guidedInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();guidedSend()}});
$('guidedTranslate').onclick=()=>{g.translated=!g.translated;renderChat('guidedHistory',g.history,g.translated);togglePressed($('guidedTranslate'),g.translated)};
$('guidedGloss').onclick=()=>{g.glossVisible=!g.glossVisible;$('guidedGlossBox').hidden=!g.glossVisible;if(g.glossVisible)renderGloss('guidedGlossBox',g.history.slice(-6).map(m=>m.text));togglePressed($('guidedGloss'),g.glossVisible)};
$('guidedTip').onclick=()=>{var el=$('guidedTipBox');el.hidden=!el.hidden;if(!el.hidden){var recent=g.history.filter(x=>x.role==='me').slice(-1)[0];var text=recent?recent.text:'';el.textContent=/\byesterday\b/i.test(text)?'💡 어제 있었던 일은 보통 과거형으로 이야기합니다. 예: I went there yesterday.':/\b(now|right now)\b/i.test(text)?'💡 지금 하는 행동은 현재진행형을 자주 씁니다. 예: I am waiting now.':'💡 문법보다 먼저 뜻이 통하는지 확인하세요. 상대방의 질문에 짧게 답해도 괜찮습니다.'}};
$('guidedReplay').onclick=()=>{var last=[...g.history].reverse().find(m=>m.role==='bot');if(last)say(last.text)};
function listenMic(id,status){var SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$(status).textContent='이 브라우저에서 음성 인식이 지원되지 않습니다. 텍스트로 입력할 수 있습니다.';return}var r=new SR();r.lang='en-US';r.interimResults=false;r.maxAlternatives=1;r.onresult=e=>{$(id).value=e.results[0][0].transcript;$(status).textContent='음성을 받아 적었습니다. 확인 후 보내주세요.'};r.onerror=e=>$(status).textContent='마이크 오류: '+e.error+'. 텍스트로 입력하세요.';try{r.start();$(status).textContent='🎤 영어를 듣고 있습니다...'}catch(e){$(status).textContent='마이크 사용에 실패했습니다.'}}
$('guidedMic').onclick=()=>listenMic('guidedInput','guidedStatus');
function beginFree(t){f=createSession(t);stage('freeBg','freeIcon','freeStage',t,'freeScenario');f.history.push({role:'bot',text:'Hello! Let us talk about '+t.name+'. '+t.turns[0].en,ko:'안녕하세요! 상황에 맞춰 대화해 봐요. '+t.turns[0].ko});renderChat('freeHistory',f.history,false);$('freeInput').value='';$('freeStatus').textContent='서버 없는 무료 연습 모드입니다. 추가 정보가 있으면 관련 질문을 이어갑니다.';$('freeGlossBox').hidden=true;togglePressed($('freeTranslate'),false);togglePressed($('freeGloss'),false)}
$('freeTopic').onchange=()=>beginFree(chooseTopic('freeTopic'));
$('freeRandom').onclick=()=>{$('freeTopic').value=D.TOPICS[Math.floor(Math.random()*D.TOPICS.length)].id;beginFree(chooseTopic('freeTopic'))};
$('freeReset').onclick=()=>beginFree(chooseTopic('freeTopic'));
$('freeEndpoint').disabled=true;$('freeEndpoint').placeholder='0원 고정: 외부 유료 API 연결 차단';
$('freeSaveEndpoint').disabled=true;$('freeSaveEndpoint').textContent='무료 기본 모드 사용';
$('freeMode').textContent='월 0원 · 브라우저 대화 연습';
function freeSend(){var text=$('freeInput').value.trim();if(!text)return;f.history.push({role:'me',text});var result=markTurn(text);f.turn++;var next=nextTurn(f,text);f.history.push({role:'bot',text:next.text,ko:next.ko});renderChat('freeHistory',f.history,f.translated);$('freeInput').value='';$('freeStatus').textContent='대화 '+f.turn+'회째 · '+result.reason;if(f.glossVisible)renderGloss('freeGlossBox',f.history.slice(-6).map(x=>x.text));say(next.text)}
$('freeSend').onclick=freeSend;$('freeInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();freeSend()}});
$('freeMic').onclick=()=>listenMic('freeInput','freeStatus');
$('freeTranslate').onclick=()=>{f.translated=!f.translated;renderChat('freeHistory',f.history,f.translated);togglePressed($('freeTranslate'),f.translated)};
$('freeGloss').onclick=()=>{f.glossVisible=!f.glossVisible;$('freeGlossBox').hidden=!f.glossVisible;if(f.glossVisible)renderGloss('freeGlossBox',f.history.slice(-6).map(m=>m.text));togglePressed($('freeGloss'),f.glossVisible)};
$('freeReplay').onclick=()=>{var last=[...f.history].reverse().find(m=>m.role==='bot');if(last)say(last.text)};
// Quiz modes: each combination of theme, 3 utterances and 24 setting permutations is selectable.
var quizSeed=0,currentQuiz=null;
function makeQuiz(){var t=$('quizTopic').value==='all'?D.TOPICS[Math.floor(Math.random()*D.TOPICS.length)]:chooseTopic('quizTopic');var itemIndex=(quizSeed+Math.floor(Math.random()*3))%3;var item=t.turns[itemIndex];var variant=D.VARIANTS[(quizSeed+Math.floor(Math.random()*D.VARIANTS.length))%D.VARIANTS.length];var other=D.TOPICS.filter(x=>x.id!==t.id);var d1=other[(quizSeed*7+3)%other.length].turns[(itemIndex+1)%3].sample;var d2=other[(quizSeed*11+9)%other.length].turns[(itemIndex+2)%3].sample;var answers=[item.sample,d1,d2];if(new Set(answers).size<3){answers[1]='I have no idea about your question.';answers[2]='This is a beautiful purple moon.'}var correct=answers[0];answers=answers.map((a,i)=>({a,correct:i===0})).sort(()=>Math.random()-.5);currentQuiz={t,item,variant,answers,done:false};$('quizContext').textContent=t.name+' · '+variant.time+' · '+variant.company;$('quizQuestion').textContent=item.en;$('quizEmoji').textContent=t.icon;stage('quizBg','quizEmoji','quizScene',t,'quizContext');$('quizContext').textContent=t.name+' · '+variant.time+' · '+variant.company;$('quizFeedback').hidden=true;$('quizAnswers').innerHTML='';answers.forEach((x,i)=>{var b=document.createElement('button');b.className='option';b.innerHTML='<span class="letter">'+String.fromCharCode(65+i)+'</span>'+esc(x.a);b.onclick=()=>{if(currentQuiz.done)return;currentQuiz.done=true;progress.quizzes++;if(x.correct)progress.quizCorrect++;persist();document.querySelectorAll('#quizAnswers button').forEach((button,k)=>button.classList.toggle(answers[k].correct?'correct':k===i?'wrong':'unused',true));$('quizFeedback').hidden=false;$('quizFeedback').textContent=x.correct?'✅ 자연스러운 대답입니다. '+item.ko:'💡 이 상황에서는 "'+correct+'"처럼 대답할 수 있습니다. '+item.ko};$('quizAnswers').appendChild(b)});$('quizProgress').textContent='문제 '+(quizSeed+1)+' · 테마별 변형'}
$('quizNext').onclick=()=>{quizSeed++;makeQuiz()};$('quizTopic').onchange=()=>{quizSeed++;makeQuiz()};
// Vocabulary
var pageWords=0,unknownOnly=false,visibleWords=[];
var groups=[...new Set(D.WORDS.map(w=>w.group))];groups.forEach(g=>$('wordGroup').add(new Option(g,g)));
function wordFilter(){var query=$('wordSearch').value.trim().toLowerCase(),group=$('wordGroup').value;visibleWords=D.WORDS.filter(w=>(group==='all'||w.group===group)&&(!unknownOnly||!progress.known.includes(w.word))&&(!query||w.word.toLowerCase().includes(query)||w.ko.includes(query)));pageWords=0;renderWords()}
function renderWords(){var count=Math.min(visibleWords.length,(pageWords+1)*45),area=$('wordGrid');area.innerHTML='';visibleWords.slice(0,count).forEach(w=>{var card=document.createElement('div');card.className='wordcard';card.innerHTML='<div class="wordicon" aria-hidden="true">'+esc(w.icon)+'</div><strong>'+esc(w.word.toLowerCase())+'</strong><span class="meaning" hidden>'+esc(w.ko)+'</span><div class="wordactions"><button class="minibtn meaningbtn">뜻 보기</button><button class="minibtn voicebtn">🔊</button><button class="minibtn knownbtn'+(progress.known.includes(w.word)?' known':'')+'">'+(progress.known.includes(w.word)?'✓ 암기':'○ 암기')+'</button></div>';card.querySelector('.meaningbtn').onclick=()=>{var meaning=card.querySelector('.meaning');meaning.hidden=!meaning.hidden;card.querySelector('.meaningbtn').textContent=meaning.hidden?'뜻 보기':'뜻 숨기기'};card.querySelector('.voicebtn').onclick=()=>say(w.word.toLowerCase());card.querySelector('.knownbtn').onclick=()=>{if(progress.known.includes(w.word))progress.known=progress.known.filter(x=>x!==w.word);else progress.known.push(w.word);persist();renderWords()};area.appendChild(card)});$('wordCount').textContent=count+' / '+visibleWords.length+'개';$('wordMore').hidden=count>=visibleWords.length}
$('wordSearch').addEventListener('input',wordFilter);$('wordGroup').onchange=wordFilter;$('wordUnknown').onclick=()=>{unknownOnly=!unknownOnly;$('wordUnknown').textContent=unknownOnly?'전체 단어 보기':'모르는 단어만';wordFilter()};$('wordMore').onclick=()=>{pageWords++;renderWords()};
// Crossword: deterministic puzzle IDs, 20+ placed words required for a playable board.
var PNUM=200,puzzle=null,selected=null;
for(var n=1;n<=PNUM;n++)$('puzzleNumber').add(new Option('퍼즐 '+n,n));
function rng(seed){var x=seed|0;return function(){x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
function shuffle(list,random){for(var i=list.length-1;i>0;i--){var j=Math.floor(random()*(i+1));var t=list[i];list[i]=list[j];list[j]=t}return list}
function buildPuzzle(num){var pool=D.WORDS.filter(w=>/^[A-Z]{3,11}$/.test(w.word));var size=29,best=null;
for(var round=0;round<18;round++){
var r=rng(num*31337+round*9089+773);
var entries=shuffle([...pool],r).slice(0,52);
entries.sort((a,b)=>b.word.length-a.word.length);
var grid=Array.from({length:size},()=>Array(size).fill(''));
var placed=[],first=entries.shift(),sr=14,sc=Math.floor((size-first.word.length)/2);
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
if(best.placed.length<20)return null;
var numbering=new Map(),count=0;
best.placed.sort((a,b)=>a.row-b.row||a.col-b.col);
best.placed.forEach(w=>{var id=w.row+','+w.col;if(!numbering.has(id))numbering.set(id,++count);w.number=numbering.get(id)});
best.numbering=numbering;return best}
function focusCell(p,i){var row=p.row+(p.dir==='down'?i:0),col=p.col+(p.dir==='across'?i:0);return $('puzzleGrid').querySelector('[data-position="'+row+','+col+'"]')}
function selectWord(p,index){selected=p;document.querySelectorAll('#puzzleClues .clue').forEach(b=>b.classList.toggle('active',b.dataset.word===p.word));document.querySelectorAll('#puzzleGrid input').forEach(el=>el.classList.remove('chosen'));for(var i=0;i<p.word.length;i++){var x=focusCell(p,i);if(x)x.classList.add('chosen')}var cell=focusCell(p,index||0);if(cell){cell.focus();cell.select()}}
function renderPuzzle(num){puzzle=buildPuzzle(num);var msg=$('puzzleMessage');if(!puzzle){$('puzzleGrid').innerHTML='';$('puzzleClues').innerHTML='';$('puzzleInfo').textContent='재생성 필요';msg.textContent='20단어 이상을 배치하지 못했습니다. 다른 번호를 선택해 주세요.';return}var coords=[];for(var y=0;y<puzzle.size;y++)for(var x=0;x<puzzle.size;x++)if(puzzle.grid[y][x])coords.push([y,x]);var minY=Math.min(...coords.map(v=>v[0])),maxY=Math.max(...coords.map(v=>v[0])),minX=Math.min(...coords.map(v=>v[1])),maxX=Math.max(...coords.map(v=>v[1]));var cols=maxX-minX+1;var board=$('puzzleGrid');board.innerHTML='';board.style.gridTemplateColumns='repeat('+cols+',var(--crossSize, 29px))';var byPos=new Map();
puzzle.placed.forEach(w=>{for(var i=0;i<w.word.length;i++){var key=(w.row+(w.dir==='down'?i:0))+','+(w.col+(w.dir==='across'?i:0));if(!byPos.has(key))byPos.set(key,[]);byPos.get(key).push({p:w,i})}});
for(var y=minY;y<=maxY;y++)for(var x=minX;x<=maxX;x++){var wrap=document.createElement('div');wrap.className='crosscell';if(!puzzle.grid[y][x])wrap.classList.add('black');else{var input=document.createElement('input');input.type='text';input.maxLength=1;input.autocomplete='off';input.autocorrect='off';input.spellcheck=false;input.autocapitalize='characters';input.inputMode='text';input.dataset.position=y+','+x;input.setAttribute('aria-label','퍼즐 '+(y+1)+','+(x+1));var candidates=byPos.get(y+','+x)||[];input.addEventListener('focus',()=>{if(!selected||!candidates.some(c=>c.p===selected))selected=candidates[0]?.p||selected;if(selected)selectWordHighlight(selected)});input.addEventListener('click',()=>{if(!selected||!candidates.some(c=>c.p===selected)){selected=candidates[0]?.p;selectWordHighlight(selected)}else if(candidates.length>1){var other=candidates.find(c=>c.p!==selected);if(other){selected=other.p;selectWordHighlight(selected)}}});input.addEventListener('input',()=>{var s=input.value.replace(/[^a-zA-Z]/g,'').toUpperCase();input.value=s.slice(-1);if(!input.value)return;var active=candidates.find(c=>c.p===selected)||candidates[0];if(active){selected=active.p;selectWordHighlight(selected);var next=focusCell(selected,active.i+1);if(next){next.focus();next.select()}}});input.addEventListener('keydown',e=>{var active=candidates.find(c=>c.p===selected)||candidates[0];if(!active)return;if(e.key==='Backspace'&&!input.value){var previous=focusCell(active.p,active.i-1);if(previous){previous.focus();previous.value='';e.preventDefault()}}if(e.key==='ArrowRight'||e.key==='ArrowDown'){var next=focusCell(active.p,active.i+1);if(next){next.focus();e.preventDefault()}}if(e.key==='ArrowLeft'||e.key==='ArrowUp'){var prev=focusCell(active.p,active.i-1);if(prev){prev.focus();e.preventDefault()}}});wrap.appendChild(input);var numHere=puzzle.numbering.get(y+','+x);if(numHere){var numEl=document.createElement('span');numEl.className='crossnum';numEl.textContent=numHere;wrap.appendChild(numEl)}}board.appendChild(wrap)}
var clueWrap=$('puzzleClues');clueWrap.innerHTML='';['across','down'].forEach(dir=>{var panel=document.createElement('div');panel.className='cluepanel';panel.innerHTML='<h3>'+(dir==='across'?'가로':'세로')+' ('+puzzle.placed.filter(x=>x.dir===dir).length+')</h3>';puzzle.placed.filter(x=>x.dir===dir).sort((a,b)=>a.number-b.number).forEach(w=>{var b=document.createElement('button');b.className='clue';b.dataset.word=w.word;b.textContent=w.number+'. '+w.ko+' ('+w.word.length+'글자)';b.onclick=()=>selectWord(w,0);panel.appendChild(b)});clueWrap.appendChild(panel)});
$('puzzleInfo').textContent='실제 교차 단어 '+puzzle.placed.length+'개';msg.textContent='정답을 입력하면 같은 단어의 다음 칸으로 자동 이동합니다.';selected=puzzle.placed[0];selectWordHighlight(selected)}
function selectWordHighlight(p){if(!p)return;document.querySelectorAll('#puzzleClues .clue').forEach(b=>b.classList.toggle('active',b.dataset.word===p.word));document.querySelectorAll('#puzzleGrid input').forEach(el=>el.classList.remove('chosen'));for(var i=0;i<p.word.length;i++){var cell=focusCell(p,i);if(cell)cell.classList.add('chosen')}}
$('puzzleNumber').onchange=()=>renderPuzzle(Number($('puzzleNumber').value));$('puzzleNext').onclick=()=>{$('puzzleNumber').value=1+Math.floor(Math.random()*PNUM);renderPuzzle(Number($('puzzleNumber').value))};
$('puzzleCheck').onclick=()=>{if(!puzzle)return;var ok=0,all=0;document.querySelectorAll('#puzzleGrid input').forEach(el=>{var [r,c]=el.dataset.position.split(',').map(Number);var right=el.value.toUpperCase()===puzzle.grid[r][c];el.classList.toggle('correct',right);ok+=right?1:0;all++});$('puzzleMessage').textContent='맞힌 칸 '+ok+' / '+all+' · '+(ok===all?'축하합니다!':'노란색 문제가 아닌 칸을 다시 확인해 보세요.')};
function report(){var items=[['총 대화',progress.turns+'회'],['응답 연습',progress.attempts+'회'],['대화 응답률 (휴리스틱)',progress.attempts?Math.round(progress.understood/progress.attempts*100)+'%':'—'],['대화 퀴즈',progress.quizzes?Math.round(progress.quizCorrect/progress.quizzes*100)+'%':'—'],['기억한 단어',progress.known.length+'개'],['학습 난이도','Lv.'+progress.level]];$('reportStats').innerHTML=items.map(x=>'<div class="stat"><strong>'+esc(x[1])+'</strong><span>'+esc(x[0])+'</span></div>').join('');$('reportDetails').innerHTML='<h3>현재 난이도 Lv.'+progress.level+' / 8</h3><div class="progressbar"><span style="width:'+(progress.level/8*100)+'%"></span></div><p>지금 버전은 긴 답변과 의미 관련 단서 등을 활용하는 <b>연습용 규칙 기반 수준</b>입니다. 실제 미국인 화자의 의사 이해도를 판정하거나 CEFR 등급을 인증하지 않습니다.</p><p>무료 모델이나 정식 AI 서버를 연결하면 추가 발언에 대한 의미 이해와 문법 팁의 정확도를 높일 수 있습니다. 현재 연결된 외부 과금 API는 없습니다.</p>'}
$('clearProgress').onclick=()=>{if(confirm('이 기기의 학습 기록을 초기화할까요?')){progress=Object.assign({},DEFAULT);persist();report();wordFilter()}};
beginGuided(D.TOPICS[0]);beginFree(D.TOPICS[0]);makeQuiz();wordFilter();renderPuzzle(1);persist();
})();
