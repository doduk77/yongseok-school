/* 야나도 한다고 v0.6 - automatic local save + backup/restore, no numbered login */
(function () {
 'use strict';
 const LEARN='yanado_v03', PET='yanado_pet_v05', CHECKPOINT='yanado_checkpoint_v06', STAMP='yanado_last_backup_v06';
 const $=id=>document.getElementById(id);
 let lastSignature='';
 function get(key){try{const t=localStorage.getItem(key);return t?JSON.parse(t):null}catch(e){return null}}
 function put(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){return false}}
 function snapshot(){return {learning:get(LEARN),pet:get(PET)}}
 function validPet(p){
  if(p===null)return true;
  if(!p||typeof p!=='object'||Array.isArray(p))return false;
  if(!['elephant','rabbit','tiger','frog','panda','dino','dog','hamster','cat','monkey'].includes(p.species))return false;
  if(typeof p.name!=='string'||p.name.length>100)return false;
  return ['food','fed','earned'].every(k=>Number.isFinite(Number(p[k]))&&Number(p[k])>=0&&Number(p[k])<=10000000);
 }
 function validLearning(p){
  if(p===null)return true;
  if(!p||typeof p!=='object'||Array.isArray(p))return false;
  if(!Number.isFinite(Number(p.level))||Number(p.level)<0||Number(p.level)>100)return false;
  if(p.known!==undefined && (!Array.isArray(p.known)||p.known.length>5000||p.known.some(x=>typeof x!=='string'||x.length>90)))return false;
  return true;
 }
 function validData(p){return p && (p.learning!==null||p.pet!==null) && validPet(p.pet??null)&&validLearning(p.learning??null)}
 function notify(text,warning){const e=$('backupStatus');if(e){e.textContent=text;e.style.color=warning?'#b65459':'#246f65'}}
 function stamp(){
  let time='';try{time=localStorage.getItem(STAMP)||''}catch(e){}
  const e=$('backupLast');if(e)e.textContent=time?'마지막 파일 백업: '+new Date(time).toLocaleString('ko-KR'):'파일 백업 기록 없음 · 중요한 기록은 다운로드해 보관하세요.';
  const p=$('backupSavedPet'),data=get(PET);if(p)p.textContent=data?.species?('🐾 '+String(data.name||data.species).slice(0,24)+' · 먹이 '+(data.food||0)+'개 · 누적 '+(data.fed||0)+'개'):'🥚 아직 펫을 선택하지 않았습니다.';
 }
 function checkpoint(){
   const data=snapshot(),sign=JSON.stringify(data);
   if(sign===lastSignature||!validData(data))return;
   lastSignature=sign;
   put(CHECKPOINT,{format:'yanado-local-checkpoint-v06',modified:new Date().toISOString(),state:data});
   const s=$('backupAuto');if(s)s.textContent='이 브라우저에 자동 저장됨 · '+new Date().toLocaleTimeString('ko-KR');
   stamp();
 }
 function backup(){
   checkpoint();
   const state=snapshot();if(!validData(state)){notify('저장된 학습 기록이 아직 없습니다.',true);return;}
   const out={format:'yanado-study-pet-backup',version:1,created:new Date().toISOString(),...state};
   const file=new Blob([JSON.stringify(out,null,2)],{type:'application/json;charset=utf-8'});
   const url=URL.createObjectURL(file),anchor=document.createElement('a');
   anchor.href=url;anchor.download='야나도한다GO_전체기록_'+new Date().toISOString().slice(0,10)+'.json';
   document.body.appendChild(anchor);anchor.click();anchor.remove();
   setTimeout(()=>URL.revokeObjectURL(url),3000);
   try{localStorage.setItem(STAMP,new Date().toISOString())}catch(e){}
   stamp();notify('백업 파일 다운로드를 요청했습니다. 파일 앱 또는 다운로드 폴더에서 실제 저장 여부를 확인하세요.');
 }
 function apply(state){
   const previous={learning:localStorage.getItem(LEARN),pet:localStorage.getItem(PET)};
   try{
     if(!put('yanado_before_restore_v06',previous))throw Error('기존 데이터 임시 백업 실패');
     if(state.learning===null)localStorage.removeItem(LEARN);else if(!put(LEARN,state.learning))throw Error('학습 기록 저장 실패');
     if(state.pet===null)localStorage.removeItem(PET);else if(!put(PET,state.pet))throw Error('펫 기록 저장 실패');
     lastSignature='';checkpoint();
   }catch(err){
     if(previous.learning===null)localStorage.removeItem(LEARN);else localStorage.setItem(LEARN,previous.learning);
     if(previous.pet===null)localStorage.removeItem(PET);else localStorage.setItem(PET,previous.pet);
     throw err;
   }
 }
 async function restore(file){
   if(!file)return;
   if(file.size>2*1024*1024)throw Error('파일 크기는 2MB 이하여야 합니다.');
   let v;try{v=JSON.parse(await file.text())}catch(e){throw Error('백업 파일을 읽지 못했습니다.')}
   if(!v||v.format!=='yanado-study-pet-backup'||v.version!==1)throw Error('프로그램 백업 파일 형식이 아닙니다.');
   const state={learning:v.learning??null,pet:v.pet??null};
   if(!validData(state))throw Error('학습/펫 데이터가 올바르지 않습니다.');
   const name=state.pet?state.pet.name:'펫 없음';
   if(!confirm('현재 이 브라우저의 학습 기록과 펫 기록을 파일 내용으로 바꿀까요?\n\n백업 날짜: '+String(v.created||'알 수 없음').slice(0,30)+'\n펫: '+String(name).slice(0,40)+'\n\n중요: 현재 기록은 먼저 파일로 백업하는 것이 안전합니다.'))return;
   apply(state);notify('복원 완료. 다시 접속하면 저장된 펫과 진도가 표시됩니다.');
   location.reload();
 }
 function restoreCheckpoint(){
   const item=get(CHECKPOINT);
   if(!item||item.format!=='yanado-local-checkpoint-v06'||!validData(item.state)){notify('복구할 자동 저장본이 없습니다.',true);return}
   if(!confirm('이 브라우저에 남아 있는 자동 저장본('+String(item.modified||'날짜 없음')+')으로 되돌릴까요? 현재 기록은 변경됩니다.'))return;
   apply(item.state);location.reload();
 }
 function inject(){
   if($('backupPanel'))return;
   const report=$('report');if(!report)return;
   const panel=document.createElement('section');
   panel.className='backup-panel';panel.id='backupPanel';
   panel.innerHTML=
     '<h3>💾 나의 학습 기록 안전 보관</h3>'+
     '<p>번호 선택 없이 사용합니다. 같은 Chrome의 펫·학습 진도는 자동 저장되지만, 다른 기기와 자동 공유되지는 않습니다.</p>'+
     '<div class="backup-summary"><span id="backupSavedPet"></span><span id="backupAuto">이 브라우저에 저장 중</span></div>'+
     '<div class="backup-actions"><button type="button" class="btn-main" id="downloadBackup">📥 전체 기록 백업</button>'+
     '<button type="button" class="btn-soft" id="restoreBackup">📤 다른 기기에서 복원</button>'+
     '<button type="button" class="btn-soft" id="restoreCheckpoint">↩ 자동 저장본 복구</button></div>'+
     '<input type="file" accept=".json,application/json" id="backupInput" hidden>'+
     '<p class="tiny" id="backupLast"></p><p id="backupStatus" class="tiny" aria-live="polite"></p>'+
     '<p class="tiny">기기를 바꾸기 전에 백업 파일을 저장하세요. 새 기기에서 접속 후 ‘다른 기기에서 복원’으로 해당 파일을 선택하면 됩니다. 브라우저 데이터 삭제 시 이 기기의 자동 저장본도 삭제됩니다.</p>';
   const clear=$('clearProgress');if(clear)report.insertBefore(panel,clear);else report.appendChild(panel);
   $('downloadBackup').addEventListener('click',backup);
   $('restoreBackup').addEventListener('click',()=>$('backupInput').click());
   $('restoreCheckpoint').addEventListener('click',restoreCheckpoint);
   $('backupInput').addEventListener('change',async event=>{const f=event.target.files?.[0];if(!f)return;try{await restore(f)}catch(e){notify('복원 실패: '+e.message,true)}event.target.value='';});
   const header=document.querySelector('.header-actions');
   if(header&&!$('backupShortcut')){
     const link=document.createElement('button');link.type='button';link.className='btn-soft small';link.id='backupShortcut';link.textContent='💾 백업';
     link.addEventListener('click',()=>{document.querySelector('[data-tab="report"]')?.click();setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}),80)});
     header.insertBefore(link,header.firstChild);
   }
   const style=document.createElement('style');style.textContent=
     '.backup-panel{background:#fffdf5;border:2px solid #cde9e2;border-radius:20px;padding:20px;margin:20px 0;box-shadow:0 7px 18px #4585801c}'+
     '.backup-panel h3{margin:0 0 10px}.backup-panel p{line-height:1.5;color:#527078}'+
     '.backup-summary{display:flex;flex-direction:column;gap:5px;padding:12px;border-radius:12px;background:#e7f6ef;margin:12px 0;font-size:13px;font-weight:700}'+
     '.backup-actions{display:flex;flex-wrap:wrap;gap:8px}.backup-actions button{flex:1;min-width:145px}'+
     '@media(max-width:420px){#backupShortcut{font-size:11px;padding:6px;min-height:32px}.backup-panel{padding:14px}}';
   document.head.appendChild(style);
   checkpoint();stamp();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
 setInterval(checkpoint,12000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')checkpoint()});
 window.addEventListener('pagehide',checkpoint);
 window.YANA_BACKUP={backup,restore,checkpoint};
})();
