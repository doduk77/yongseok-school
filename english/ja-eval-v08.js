/* Offline Japanese intent estimation. Not a native-speaker understanding test. */
(function(){'use strict';
function normalize(s){return String(s||'').normalize('NFKC').replace(/[\s。、！？,.!?"'〜～]+/g,'').trim()}
const WH=/どこ|どちら|何時|いつ|何人|何名|何枚|何泊|何日|何個|何点|何色|何歳|なに|何を|何が|何の|どんな|どの|どれ|いくら|何時間|どのくらい|どうやって|何階|誰|だれ|何時ごろ/;
const YES=/^(はい|いいえ|うん|ううん|そうです|そうですね|もちろん|大丈夫|いいですよ|わかりました|けっこうです|結構です|お願いします)$/;
const PLACES=/ホテル|駅|えき|空港|くうこう|カフェ|家|いえ|うち|学校|がっこう|公園|こうえん|病院|びょういん|レストラン|市内|しない|部屋|へや|ロビー|東京|とうきょう|大阪|おおさか|京都|きょうと|シンガポール|ニューヨーク/;
const TIMES=/時|分|あさ|ひる|よる|朝|昼|夜|午前|午後|今日|きょう|明日|あした|昨日|きのう|月曜|火曜|水曜|木曜|金曜|土曜|日曜|から|まで|あと|頃|ごろ|一時間|二時間|三時間/;
const FOOD=/コーヒー|ラテ|みず|水|おちゃ|お茶|紅茶|こうちゃ|パン|ごはん|ご飯|ケーキ|ジュース|パスタ|スープ|サラダ|魚|さかな|ピザ|肉|にく|チキン|ラーメン|サンドイッチ|食事|しょくじ/;
const NUM=/一|二|三|四|五|六|七|八|九|十|百|千|[0-9０-９]|枚|人|個|円|ドル|サイズ|小|大|中|S|M|L|ひとつ|ふたつ|みっつ/;
const HOTEL=/ホテル|予約|よやく|お部屋|へや|部屋|キー|鍵|かぎ|チェックイン|チェックアウト|タオル|フロント|滞在|たいざい|泊まり|とまる/;
const PEOPLE=/私|わたし|妻|つま|夫|おっと|友達|ともだち|家族|かぞく|母|はは|父|ちち|子供|子ども|二人|三人|一人|いっしょ|一緒/;
const POSITIVE=/はい|いいえ|お願いします|ください|ありがとうございます|ありがとう|結構|大丈夫|わかりました/;
const PAIRS=[[/どこ|どちら|行き|いき|行か|乗り場|のりば/,PLACES],[/いつ|何時|何日|何泊|何時間|時間|じかん|締め切り|しめきり/,TIMES],[/何名|何人|何枚|いくつ|サイズ|いくら|どのくらい|料金|りょうきん/,NUM],[/何を食べ|食事|料理|飲み物|のみもの|お飲み物|デザート|コーヒー|お茶|たべもの/,FOOD],[/ご予約|予約|チェックイン|部屋|お部屋|鍵/,HOTEL],[/一緒|いっしょ|お連れ|どなた|誰/,PEOPLE]];
function classify({question='',answer='',sample='',topic=null}={}){
 const q=normalize(question),a=normalize(answer),s=normalize(sample);
 const note='無料 규칙 기반 추정 · 일본인 화자 수준의 실제 의미 이해 판정은 아닙니다.';
 const result=(kind,accepted,title,detail)=>({kind,accepted,title,detail,example:sample,disclaimer:note});
 if(!a)return result('unclear',false,'🟠 추가 확인 필요','일본어로 짧게라도 답해 보세요.');
 if(a.length>200)return result('unclear',false,'🟠 추가 확인 필요','대답이 길어 핵심 의도를 판단하기 어렵습니다. 짧게 나누어 보세요.');
 const wh=WH.test(q),yesOnly=YES.test(a),polite=POSITIVE.test(a);
 if(wh&&yesOnly)return result('unclear',false,'🟠 추가 확인 필요','질문에 맞는 장소·시간·내용 등의 정보가 더 필요합니다.');
 if(!wh&&yesOnly)return result('clear',true,'🟢 의도가 전달될 가능성이 높음','긍정·부정 또는 정중한 의사가 전달됩니다.');
 let relevant=false;
 for(const [qPattern,aPattern] of PAIRS)if(qPattern.test(q)&&aPattern.test(a)){relevant=true;break}
 if(!relevant && /ぞう|ゾウ|宇宙|うちゅう|ペンギン|ダンス|恐竜|きょうりゅう/.test(a) && !/ぞう|ゾウ|宇宙|うちゅう|ペンギン|ダンス|恐竜|きょうりゅう/.test(q))return result('offtopic',false,'🔴 질문과 관련이 낮아 보여요','질문 주제와 관계없는 내용입니다.');
 if(!relevant && s.length>=3 && a.length>=3){
   const ngrams=new Set();for(let i=0;i+3<=s.length;i++){const part=s.slice(i,i+3);if(!/^(してい|ていま|います|します|したい|たいで|いです|ですか|ました|くださ|ません|お願い|いまし|りまし|よろし|そうで)$/u.test(part))ngrams.add(part)}
   relevant=[...ngrams].some(part=>a.includes(part));
 }
 if(!relevant && question.includes('？')&&/はい|いいえ|ください|お願いします/.test(a)&&a.length>=5)relevant=true;
 if(relevant)return result('clear',true,'🟢 의도가 전달될 가능성이 높음','질문과 관련된 표현을 찾았습니다. 문법보다 의사전달을 우선합니다.');
 const wild=/ぞう|ゾウ|宇宙|うちゅう|ペンギン|ダンス|恐竜|きょうりゅう/;
 if(wild.test(a) && !wild.test(q))return result('offtopic',false,'🔴 질문과 관련이 낮아 보여요','문장은 인식했지만 질문의 주제와 거리가 있습니다.');
 return result('unclear',false,'🟠 추가 확인 필요','현재 규칙으로는 의도를 확실히 알기 어렵습니다. 조금 더 구체적으로 답해 보세요.');
}
window.YANA_JP_EVAL={evaluate:classify};
})();