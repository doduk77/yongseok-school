/* 야나도 한다고 v0.6 - 1~10 profile slots with optional Cloudflare sync.
 * No server endpoint is configured by default; local storage remains usable.
 * Never put a password, token or API secret into this public script.
 */
(function(){
'use strict';
const SLOT_SESSION='yanado_slot_v06',TOKEN_SESSION='yanado_token_v06';
const LAST_SLOT='yanado_last_slot_v06',MIGRATION='yanado_migrated_slot1_v06';
const BASE=['yanado_v03','yanado_pet_v05'];
const API=(typeof window.YANA_SYNC_API==='string'?window.YANA_SYNC_API:'').replace(/\/+$/,'');
const storage=window.localStorage,session=window.sessionStorage;
let slot=0,token='',timer=null,lastSnapshot='',writing=false;
try{
  const s=Number(session.getItem(SLOT_SESSION));slot=Number.isInteger(s)&&s>=1&&s<=10?s:0;
  token=session.getItem(TOKEN_SESSION)||'';
}catch(e){}
const el=id=>document.getElementById(id);
const key=(base,s=slot)=>base+'_slot_'+(s||'guest');
const metaKey=s=>'yanado_meta_slot_'+s;
function getJson(k){try{const v=storage.getItem(k);return v?JSON.parse(v):null}catch(e){return null}}
function setJson(k,v){try{if(v!==null)storage.setItem(k,JSON.stringify(v));else storage.removeItem(k)}catch(e){}}
function initialCopy(s){
 if(s!==1)return;
 try{
  if(storage.getItem(MIGRATION)==='done')return;
  for(const base of BASE) if(storage.getItem(key(base,s))===null && storage.getItem(base)!==null)
    storage.setItem(key(base,s),storage.getItem(base));
  storage.setItem(MIGRATION,'done');
 }catch(e){}
}
function snapshot(s=slot){return {progress:getJson(key(BASE[0],s)),pet:getJson(key(BASE[1],s))}}
function snapshotText(s=slot){return JSON.stringify(snapshot(s))}
function applySnapshot(s,data){
 if(!data||typeof data!=='object')return;
 for(const [base,field] of [[BASE[0],'progress'],[BASE[1],'pet']]){
   if(Object.prototype.hasOwnProperty.call(data,field))setJson(key(base,s),data[field]);
 }
}
function status(msg,kind){
 const node=el('syncStatus');if(node){node.textContent=msg;node.dataset.status=kind||'local'}
 const p=el('activeProfile');if(p)p.textContent=slot?slot+'번 학습자':'학습자 미선택';
 const note=el('profileNotice');if(note)note.textContent=msg;
}
function getMeta(s){return Object.assign({revision:0,dirty:false},getJson(metaKey(s))||{})}
function setMeta(s,m){setJson(metaKey(s),m)}
async function api(path,opts={}){
 const headers=Object.assign({'Content-Type':'application/json'},opts.headers||{});
 if(token)headers.Authorization='Bearer '+token;
 const res=await fetch(API+path,Object.assign({},opts,{headers,mode:'cors',cache:'no-store'}));
 let data={};try{data=await res.json()}catch(e){}
 if(!res.ok){const error=new Error(data.error||'서버 요청 실패 ('+res.status+')');error.status=res.status;throw error}
 return data;
}
async function login(newSlot,pin){
 const s=Number(newSlot);
 if(!Number.isInteger(s)||s<1||s>10)throw new Error('학습자 번호는 1~10번 중 선택하세요.');
 if(typeof pin!=='string'||!pin.trim())throw new Error('비밀번호를 입력해 주세요.');
 initialCopy(s);
 if(API){
   const auth=await api('/api/login',{method:'POST',body:JSON.stringify({slot:s,pin:pin.trim()})});
   if(!auth.token)throw new Error('동기화 서버에서 로그인 토큰을 받지 못했습니다.');
   token=auth.token;
   const response=await api('/api/profile');
   const meta=getMeta(s);
   if(response.state!==null && response.state!==undefined){
      const localHasData=BASE.some(base=>getJson(key(base,s))!==null);
      // When this device has offline edits, make a backup before replacing with the cloud copy.
      if(meta.dirty && localHasData && response.revision!==meta.revision){
        const localCopy=snapshot(s);
        setJson('yanado_backup_slot_'+s+'_'+Date.now(),localCopy);
        if(typeof window.confirm==='function' && !window.confirm(
          '다른 기기에 더 새로운 기록이 있습니다. 이 기기 기록은 백업하고 서버 기록을 불러올까요?\\n취소하면 로그인하지 않고 현재 기록을 보존합니다.')){
          token='';throw new Error('기존 기기 기록을 유지했습니다. 다른 기기에서 변경한 기록과 비교해 주세요.');
        }
      }
      applySnapshot(s,response.state);
      setMeta(s,{revision:response.revision||0,dirty:false});
   } else {
      // No cloud record yet. Upload this slot's existing progress or an empty profile.
      const up=await api('/api/profile',{method:'PUT',body:JSON.stringify({revision:0,state:snapshot(s)})});
      setMeta(s,{revision:up.revision||1,dirty:false});
   }
 }else if(pin.trim()!=='2580'){
   throw new Error('비밀번호가 일치하지 않습니다.');
 }
 slot=s;
 try{
   session.setItem(SLOT_SESSION,String(s));
   session.setItem('yanado_session','1');
   if(API)session.setItem(TOKEN_SESSION,token);else session.removeItem(TOKEN_SESSION);
   storage.setItem(LAST_SLOT,String(s));
 }catch(e){}
 lastSnapshot=snapshotText(s);
 if(window.location && typeof window.location.reload==='function')window.location.reload();
 return {slot:s,online:!!API};
}
function logout(){
 if(timer){clearTimeout(timer);timer=null}
 // Best-effort last sync, local data remains on device if it fails.
 if(API && token)flush().catch(()=>{});
 try{
   session.removeItem(SLOT_SESSION);session.removeItem(TOKEN_SESSION);
   session.removeItem('yanado_session');
 }catch(e){}
 slot=0;token='';status('로그아웃','local');
}
async function flush(){
 if(!API||!slot||!token||writing)return false;
 const meta=getMeta(slot);
 if(!meta.dirty)return true;
 writing=true;status('☁️ 동기화 중…','saving');
 try{
   const before=snapshotText();
   const r=await api('/api/profile',{method:'PUT',body:JSON.stringify({revision:meta.revision,state:snapshot()})});
   const after=snapshotText();
   const changedDuringSave=after!==before;
   setMeta(slot,{revision:r.revision,dirty:changedDuringSave});
   lastSnapshot=before;
   status(changedDuringSave?'☁️ 다음 변경 저장 예정':'☁️ 서버 저장 완료','synced');
   if(changedDuringSave)schedule();
   return true;
 }catch(e){
   status(e.status===409?'⚠️ 다른 기기와 기록 충돌 — 로그인 새로고침 필요':'⚠️ 서버 연결 실패, 이 기기에 저장됨','error');
   return false;
 }finally{writing=false}
}
function schedule(){if(timer)clearTimeout(timer);timer=setTimeout(()=>{timer=null;flush()},1800)}
function changed(){
 if(!slot)return;
 const now=snapshotText();
 if(now===lastSnapshot)return;
 lastSnapshot=now;
 if(API){
   const meta=getMeta(slot);meta.dirty=true;setMeta(slot,meta);
   status('☁️ 저장 대기…','saving');schedule();
 }else status('이 기기에만 저장 · 서버 연결 전','local');
}
function ready(){
 const selector=el('profileSlot');
 if(selector){
   try{selector.value=String(Math.min(10,Math.max(1,Number(storage.getItem(LAST_SLOT))||1)))}catch(e){selector.value='1'}
 }
 if(slot)initialCopy(slot);
 lastSnapshot=snapshotText();
 status(!slot?'번호를 선택해 로그인하세요.':API?'☁️ 서버 동기화 사용':'이 기기에만 저장 · 서버 연결 전',API?'synced':'local');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);
else ready();
if(typeof window.addEventListener==='function')window.addEventListener('online',()=>{if(API)schedule()});
window.YANA_ACCOUNT={activeSlot:()=>slot,key,login,logout,changed,flush,isCloudReady:()=>!!API,mode:API?'cloud':'local'};
})();
