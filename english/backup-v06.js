/* 야나도 한다고 v0.6 - 무료 학습·펫 백업 및 다른 기기로 복원 */
(function(){
'use strict';
const BASE='yanado_v03',PET='yanado_pet_v05',STAMP='yanado_last_backup_v06';
const $=id=>document.getElementById(id);
function read(key){try{const s=localStorage.getItem(key);return s?JSON.parse(s):null}catch(e){return null}}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function message(t,warning){const el=$('backupStatus');if(el){el.textContent=t;el.classList.toggle('backup-warning',!!warning)}}
function stamp(){const e=$('backupLast');if(!e)return;let prev=null;try{prev=localStorage.getItem(STAMP)}catch(e){}e.textContent=prev?'마지막 백업: '+new Date(prev).toLocaleString('ko-KR'):'백업한 기록이 없습니다. 중요한 기록은 파일로 보관해 주세요.'}
function backup(){
 const learning=read(BASE),pet=read(PET);
 if(!learning&&!pet){message('아직 저장할 학습 기록이나 펫이 없습니다.',true);return}
 const data={format:'yanado-study-pet-backup',version:1,created:new Date().toISOString(),learning,pet};
 const json=JSON.stringify(data,null,2);
 const blob=new Blob([json],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=url;a.download='야나도한다GO_학습펫백업_'+new Date().toISOString().slice(0,10)+'.json';
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),5000);
 try{localStorage.setItem(STAMP,new Date().toISOString())}catch(e){}
 stamp();message('백업 파일 저장을 요청했습니다. 다운로드/파일 앱에서 실제 저장 여부를 확인하세요.');
}
function validate(obj){
 if(!obj||obj.format!=='yanado-study-pet-backup'||obj.version!==1)throw Error('「야나도 한다고」 백업 파일 형식이 아닙니다.');
 if(!obj.learning&&!obj.pet)throw Error('학습 정보가 비어 있습니다.');
 if(obj.learning!==null&&obj.learning!==undefined){
  if(typeof obj.learning!=='object'||Array.isArray(obj.learning)||!Number.isFinite(Number(obj.learning.level||1)))throw Error('학습 데이터가 올바르지 않습니다.');
  if(obj.learning.known!==undefined&&(!Array.isArray(obj.learning.known)||obj.learning.known.length>3000||obj.learning.known.some(w=>typeof w!=='string'||w.length>70)))throw Error('단어 기록을 확인해 주세요.');
 }
 if(obj.pet!==null&&obj.pet!==undefined){
  if(typeof obj.pet!=='object'||Array.isArray(obj.pet)||!['elephant','rabbit','tiger','frog','panda','dino','dog','hamster','cat','monkey'].includes(obj.pet.species))throw Error('펫 데이터가 올바르지 않습니다.');
  for(const k of ['fed','food','earned'])if(!Number.isFinite(Number(obj.pet[k]))||Number(obj.pet[k])<0||Number(obj.pet[k])>1e7)throw Error('펫의 먹이 수량이 올바르지 않습니다.');
 }
}
async function restore(file){
 if(!file)return;
 if(file.size>2*1024*1024)throw Error('파일이 너무 큽니다. 2MB 이하 백업 파일을 선택해 주세요.');
 const text=await file.text();let obj;try{obj=JSON.parse(text)}catch(e){throw Error('JSON 백업 파일을 읽을 수 없습니다.')}
 validate(obj);
 const species=obj.pet?obj.pet.species:'없음';
 const name=obj.pet?String(obj.pet.name||species).slice(0,30):'없음';
 const level=obj.learning?obj.learning.level||1:'없음';
 if(!confirm('기존 이 기기의 학습·펫 기록이 백업 파일 내용으로 바뀝니다.\n\n불러올 펫: '+name+'\n대화 레벨: '+level+'\n백업일: '+(obj.created||'기록 없음')+'\n\n현재 기록을 먼저 백업했나요?'))return;
 const previous={learning:localStorage.getItem(BASE),pet:localStorage.getItem(PET)};
 try{
  localStorage.setItem('yanado_before_restore_v06',JSON.stringify(previous));
  if(obj.learning!==undefined){if(obj.learning===null)localStorage.removeItem(BASE);else localStorage.setItem(BASE,JSON.stringify(obj.learning))}
  if(obj.pet!==undefined){if(obj.pet===null)localStorage.removeItem(PET);else localStorage.setItem(PET,JSON.stringify(obj.pet))}
 }catch(e){
  try{if(previous.learning===null)localStorage.removeItem(BASE);else localStorage.setItem(BASE,previous.learning);
      if(previous.pet===null)localStorage.removeItem(PET);else localStorage.setItem(PET,previous.pet)}catch(_){}
  throw Error('기록을 복원하지 못했습니다. 브라우저 저장 공간을 확인하세요.');
 }
 message('복원 완료. 페이지를 새로 열어 기록을 표시합니다.');
 location.reload();
}
function onReady(){
 $('downloadBackup')?.addEventListener('click',backup);
 $('restoreBackup')?.addEventListener('click',()=>$('backupInput')?.click());
 $('backupInput')?.addEventListener('change',async e=>{
  const f=e.target.files?.[0];if(!f)return;
  try{await restore(f)}catch(err){message('복원 실패: '+err.message,true)}
  e.target.value='';
 });
 stamp();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',onReady);else onReady();
window.YANA_BACKUP={backup,restore};
})();
