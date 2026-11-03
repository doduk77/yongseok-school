
(function () {
  'use strict';
  const KEY = 'yanado_pet_v05';
  const animals = [
    {id:'elephant',name:'코끼리',face:'🐘',tone:'#cbe5ff'},
    {id:'sheep',name:'양',face:'🐑',tone:'#fff0f9'},
    {id:'tiger',name:'호랑이',face:'🐯',tone:'#ffe4b8'},
    {id:'frog',name:'개구리',face:'🐸',tone:'#d7f9c4'},
    {id:'panda',name:'판다',face:'🐼',tone:'#f0e9ff'},
    {id:'dino',name:'공룡',face:'🦖',tone:'#c4f1df'},
    {id:'dog',name:'강아지',face:'🐶',tone:'#ffe7c5'},
    {id:'hamster',name:'햄스터',face:'🐹',tone:'#ffe7d8'},
    {id:'cat',name:'고양이',face:'🐱',tone:'#ffe4f1'},
    {id:'monkey',name:'원숭이',face:'🐵',tone:'#ffebcb'}
  ];
  const stages = [
    {name:'알',limit:0,icon:'🥚'},
    {name:'부화한 아기',limit:3,icon:'🐣'},
    {name:'어린이 펫',limit:15,icon:'⭐'},
    {name:'청소년 펫',limit:40,icon:'🌟'},
    {name:'멋진 성체',limit:80,icon:'👑'}
  ];
  const $ = id => document.getElementById(id);
  const safe = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data = null;
  try { data = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e) {}
  if (!data || typeof data !== 'object' || !animals.some(x => x.id === data.species)) data = null;
  else {
    data.food = Math.max(0, Number(data.food) || 0);
    data.fed = Math.max(0, Number(data.fed) || 0);
    data.earned = Math.max(0, Number(data.earned) || 0);
    data.tally = Object.assign({talk:0,word:0,crossword:0,quiz:0}, data.tally || {});
    data.seen = Object.assign({word:{},quiz:{},crossword:{},crosswordComplete:{}}, data.seen || {});
    data.log = Array.isArray(data.log) ? data.log.slice(-12) : [];
  }
  let selected = animals[0].id;
  function save() { if (!data) return; try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e) {} }
  function stageIndex() { let n=0; for(let i=0;i<stages.length;i++) if(data.fed>=stages[i].limit)n=i;return n; }
  function animal() { return animals.find(x=>x.id===data?.species) || animals[0]; }
  function announce(s){const el=$('petNotice');if(el)el.textContent=s;}
  function record(label){data.log.push(label);data.log=data.log.slice(-10);}
  function reward(n,label){
    if(!data || !Number.isFinite(n) || n<=0)return;
    data.food+=n;data.earned+=n;record('🍎 +'+n+' · '+label);save();render();
    announce(label+' 완료! 먹이 '+n+'개 획득 🥳');
  }
  function seenOnce(type,id){if(!data.seen[type])data.seen[type]={};const k=String(id || 'none').slice(0,160);if(data.seen[type][k])return false;data.seen[type][k]=1;return true;}
  function learned(info){
    if(!data || !info || !info.type) return;
    const type=info.type;
    if(type==='talk'){
      if(info.accepted===false)return;
      data.tally.talk++;
      if(data.tally.talk%2===0)reward(1,'생활 영어 대화 2회');else {save();render();}
    }else if(type==='quiz'){
      if(!seenOnce('quiz',info.id))return;
      data.tally.quiz++;
      reward(info.correct?2:1,info.correct?'대화 퀴즈 정답':'대화 퀴즈 학습');
    }else if(type==='word'){
      if(!seenOnce('word',info.id))return;
      data.tally.word++;
      if(data.tally.word%3===0)reward(1,'그림 단어 3개 학습');else {save();render();}
    }else if(type==='crossword'){
      if(!seenOnce('crossword',info.id))return;
      data.tally.crossword++;
      if(data.tally.crossword%2===0)reward(1,'가로세로 단어 2개 완성');else {save();render();}
    }else if(type==='crosswordComplete'){
      if(!seenOnce('crosswordComplete',info.id))return;
      reward(3,'가로세로 퍼즐 한 판 완성');
    }
  }
  function feed(amount){
    if(!data)return;
    const n=Math.min(Math.floor(amount)||1,data.food);
    if(n<1){announce('먹이가 부족해요. 회화·퀴즈·단어장·가로세로를 학습해 보세요.');return;}
    const before=stageIndex();data.food-=n;data.fed+=n;
    record('💚 먹이 '+n+'개 주기');save();render();
    if(stageIndex()>before)announce('🎉 축하해요! '+data.name+'가(이) '+stages[stageIndex()].name+' 단계로 성장했어요!');
    else announce(data.name+'에게 먹이 '+n+'개를 주었어요! ❤️');
    const avatar=$('petAvatar');if(avatar){avatar.classList.remove('pet-munch');void avatar.offsetWidth;avatar.classList.add('pet-munch');}
  }
  function render(){
    if(!data){const pre=$('petHomePreview');if(pre)pre.innerHTML='<strong>🥚 알에서 시작하는 나만의 펫</strong><p>처음 방문 시 10가지 귀여운 펫 중 하나를 골라보세요.</p>';return;}
    const a=animal(),index=stageIndex(),st=stages[index],next=stages[index+1],lower=st.limit;
    const pct=next?Math.max(0,Math.min(100,Math.round((data.fed-lower)/(next.limit-lower)*100))):100;
    const activeEmoji=index===0?'🥚':a.face;
    const avatar=$('petAvatar');
    if(avatar){avatar.textContent=activeEmoji;avatar.dataset.stage=String(index);avatar.style.background='radial-gradient(circle at 30% 20%,white,'+a.tone+')';}
    if($('petNickname'))$('petNickname').textContent=data.name;
    if($('petSpeciesLabel'))$('petSpeciesLabel').textContent=a.name+' · '+st.name;
    if($('petFood'))$('petFood').textContent=data.food;
    if($('petFed'))$('petFed').textContent=data.fed;
    if($('petEarned'))$('petEarned').textContent=data.earned;
    if($('petStage'))$('petStage').textContent=st.icon+' '+st.name;
    if($('petLevelBar'))$('petLevelBar').style.width=pct+'%';
    if($('petNext'))$('petNext').textContent=next?'다음 성장까지 먹이 '+Math.max(0,next.limit-data.fed)+'개':'최종 성장 달성! 👑';
    if($('petFeedBtn'))$('petFeedBtn').disabled=data.food<1;
    if($('petFeedFive'))$('petFeedFive').disabled=data.food<5;
    if($('petStats'))$('petStats').innerHTML=[
      ['💬','대화',data.tally.talk+'회'],['❓','퀴즈',data.tally.quiz+'문제'],
      ['📖','단어',data.tally.word+'개'],['🧩','퍼즐 단어',data.tally.crossword+'개']
    ].map(v=>'<div class="pet-stat"><span>'+v[0]+'</span><strong>'+v[2]+'</strong><small>'+v[1]+'</small></div>').join('');
    if($('petFeedLog'))$('petFeedLog').innerHTML=data.log.slice().reverse().slice(0,6).map(x=>'<li>'+safe(x)+'</li>').join('') || '<li>영어 공부를 시작하면 여기에 기록이 쌓여요.</li>';
    const preview=$('petHomePreview');
    if(preview)preview.innerHTML='<span class="preview-pet">'+activeEmoji+'</span><div><b>'+safe(data.name)+' · '+safe(st.name)+'</b><small>🍎 먹이 '+data.food+'개 · 총 먹이주기 '+data.fed+'회</small></div><button type="button" class="btn-main" id="openMyPet">펫에게 밥 주기 →</button>';
    $('openMyPet')?.addEventListener('click',()=>document.querySelector('[data-tab="pet"]')?.click());
  }
  function paintPicker(){
    const area=$('petChoices');if(!area)return;
    area.innerHTML='';
    animals.forEach(a=>{
      const btn=document.createElement('button');btn.type='button';
      btn.className='pet-option'+(a.id===selected?' selected':'');
      btn.style.setProperty('--pet-tint',a.tone);
      btn.innerHTML='<span class="pet-icon">'+a.face+'</span><strong>'+a.name+'</strong>';
      btn.setAttribute('aria-pressed',String(a.id===selected));
      btn.addEventListener('click',()=>{selected=a.id;paintPicker();});
      area.appendChild(btn);
    });
  }
  function maybeOnboard(){
    if(data){render();return;}
    const app=$('app'),dialog=$('petOnboard');if(!dialog || !app || app.hidden)return;
    paintPicker();dialog.hidden=false;document.body.classList.add('pet-dialog-open');
    $('petChooseBtn')?.focus();
  }
  function choosePet(){
    const chosen=animals.find(a=>a.id===selected)||animals[0];
    const name=($('petNameInput')?.value||'').trim().slice(0,18)||'나의 '+chosen.name;
    data={species:chosen.id,name,food:0,fed:0,earned:0,tally:{talk:0,word:0,crossword:0,quiz:0},seen:{word:{},quiz:{},crossword:{},crosswordComplete:{}},log:['🥚 '+chosen.name+' 알을 입양했어요']};
    save();$('petOnboard').hidden=true;document.body.classList.remove('pet-dialog-open');
    render();announce('알을 입양했어요! 영어를 공부하고 먹이를 모아 부화시켜 보세요.');
    document.querySelector('[data-tab="pet"]')?.click();
  }
  $('petChooseBtn')?.addEventListener('click',choosePet);
  $('petFeedBtn')?.addEventListener('click',()=>feed(1));
  $('petFeedFive')?.addEventListener('click',()=>feed(5));
  $('petNameSave')?.addEventListener('click',()=>{if(!data)return;const name=($('petRename')?.value||'').trim().slice(0,18);if(!name){announce('이름을 먼저 입력하세요.');return;}data.name=name;save();render();announce('펫 이름을 바꿨어요!');});
  window.addEventListener('yanado:learn',e=>learned(e.detail));
  window.addEventListener('yanado:unlock',maybeOnboard);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',maybeOnboard);
  else maybeOnboard();
  render();
  window.YANA_PET={getProgress:()=>data?{species:data.species,food:data.food,fed:data.fed,stage:stageIndex(),earned:data.earned}:null,maybeOnboard};
})();
