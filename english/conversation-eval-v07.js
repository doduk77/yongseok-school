/* 야나도 한다고 v0.7 - transparent, rule-based conversation relevance estimator.
 * Not a real AI judgement or native-speaker comprehension test.
 */
(function(){
'use strict';
const strip=s=>String(s||'').toLowerCase().replace(/[^a-z0-9'\s]/g,' ').replace(/\s+/g,' ').trim();
const words=s=>strip(s).split(' ').filter(Boolean);
const has=(str,re)=>re.test(str);
const domains=[
 {name:'시간',q:/\b(what time|how long|how many minutes|when|how often|what day|what date)\b/,r:/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|hour|minute|day|week|month|year|am|pm|o'clock|morning|afternoon|evening|tonight|tomorrow|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|now|later|soon|next|at|around|since|for)\b/},
 {name:'장소·방향',q:/\b(where|which station|which floor|which gate|directions|way to|going to|flying to|nearby)\b/,r:/\b(hotel|airport|home|school|office|work|park|station|train|bus|taxi|cafe|coffee shop|restaurant|library|mall|shop|market|downtown|city|floor|gate|room|lobby|entrance|exit|elevator|bathroom|restroom|toilet|left|right|straight|behind|beside|near|outside|inside|upstairs|downstairs|next|across|there|here|boston|chicago|new york|seoul|london|paris|tokyo|los angeles|america|japan|at|in|to|from)\b/},
 {name:'음료',q:/\b(drink|coffee|tea|milk|beverage|hot or iced|cold brew)\b/,r:/\b(coffee|latte|tea|juice|milk|water|soda|cola|cappuccino|americano|espresso|decaf|iced|hot|cold|medium|small|large|cup|bottle|orange|apple|sugar|straw)\b/},
 {name:'음식',q:/\b(eat|food|meal|breakfast|lunch|dinner|order|appetizer|dish|steak|chicken or pasta|hungry|dessert)\b/,r:/\b(food|eat|ate|pizza|rice|pasta|salad|soup|sandwich|chicken|beef|fish|burger|fries|noodles|steak|bread|cake|cookie|vegetable|vegetarian|dessert|breakfast|lunch|dinner|hungry|order|hot|mild|spicy)\b/},
 {name:'가격·수량',q:/\b(how much|how many|price|cost|charge|fee|size|what size)\b/,r:/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|dollar|won|cash|card|small|medium|large|size|expensive|cheap|price|money|bag|bags|person|people|guests)\b/},
 {name:'색깔',q:/\b(what colo[u]?r|which colo[u]?r|color would)\b/,r:/\b(red|blue|green|black|white|yellow|orange|pink|purple|brown|gray|silver|gold|dark|light)\b/},
 {name:'사람·동행',q:/\b(who|with someone|traveling with|how many people|how many guests)\b/,r:/\b(wife|husband|friend|family|mother|father|daughter|son|parent|children|kid|colleague|coworker|boss|manager|girlfriend|boyfriend|partner|alone|together|me|my|us|we|people|adult|one|two|three|\d+)\b/},
 {name:'기분·건강',q:/\b(how are you|how do you feel|feeling okay|hurting|symptoms|problem with the noise|comfortable)\b/,r:/\b(fine|good|great|okay|happy|sad|tired|sick|ill|hurt|pain|headache|fever|nervous|cold|hot|relaxed|uncomfortable|comfortable|noisy|loud|quiet|worried|better|bad)\b/},
 {name:'직업·행동',q:/\b(what do you do|what are you doing|what did you do|what will you do|what would you like to do|what should we do|tell me about yourself|your job)\b/,r:/\b(work|working|engineer|manager|teacher|student|office|job|study|studying|school|travel|traveling|go|going|went|visit|visiting|visited|eat|ate|eating|cook|cooking|read|reading|walk|walking|shop|shopping|sleep|sleeping|meeting|meet|met|watch|watching|swim|swimming|fish|fishing|drive|driving|learn|learning|help|helping|clean|cleaning|play|playing|want|would|will|plan|planning|like|love)\b/},
 {name:'선호·계획',q:/\b(what kind|which one|what do you prefer|do you like|what would you like|what are you looking for|what do you need|what do you want|would you prefer)\b/,r:/\b(like|love|want|need|looking|prefer|would|i'd|please|yes|no|good|nice|great|small|medium|large|blue|black|red|white|coffee|tea|milk|soup|salad|meat|fish|pizza|pasta|room|hotel|ticket|shoes|shirt|jacket|bag|bus|train|walk|food|water|window|aisle)\b/}
];
const negative=/\b(elephant|monkey|banana|purple|moon|galaxy|universe|dinosaur|penguin|zebra|spaceship|rocket|rainbow)\b/;
const genericAgreement=/^(yes|no|yeah|yep|nope|sure|of course|okay|ok|not really|i do|i don't|i am|i'm not|i have|i haven't|certainly|absolutely|please|no thanks|yes please)\b/;
const polite=/\b(thanks|thank you|sorry|excuse me|please)\b/;
function evaluate({question,answer,sample,topic}={}){
 const q=strip(question),a=strip(answer),tokens=words(answer),sampleTokens=words(sample);
 const label='브라우저 규칙 기반 추정 · 실제 원어민 이해도 평가 아님';
 if(!a)return {kind:'unclear',accepted:false,title:'🟠 추가 확인 필요',detail:'아직 대답이 없습니다. 짧게라도 영어로 말해 보세요.',example:sample||'',disclaimer:label};
 if(tokens.length>65)return {kind:'unclear',accepted:false,title:'🟠 추가 확인 필요',detail:'대답이 너무 깁니다. 중요한 내용부터 간단히 알려주세요.',example:sample||'',disclaimer:label};
 const yesNo=/^(are|is|do|does|did|have|has|can|could|would|will|should|may|were|was)\b/.test(q)||/\b(do you|does it|are you|is there|have you|would you|can you|could you|will you|did you|should we)\b/.test(q);
 const wh=/^(what|where|when|why|who|which|how)\b/.test(q);
 const politeResponse=polite.test(a) && tokens.length<=3;
 if(wh && genericAgreement.test(a)&&tokens.length<=3)return {kind:'unclear',accepted:false,title:'🟠 다시 확인하면 좋음',detail:'이 질문은 장소·시간·내용 등의 정보가 필요합니다. Yes/No만으로는 부족할 수 있어요.',example:sample||'',disclaimer:label};

 if(yesNo && genericAgreement.test(a))return {kind:'clear',accepted:true,title:'🟢 뜻이 통할 가능성 높음',detail:'예/아니요 또는 동의 의사가 질문에 맞게 전달됩니다. 문법은 별도로 익혀도 괜찮아요.',example:sample||'',disclaimer:label};
  if(a.length<2)return {kind:'unclear',accepted:false,title:'🟠 다시 확인하면 좋음',detail:'짧은 답변입니다. 한 단어를 더 덧붙여 주세요.',example:sample||'',disclaimer:label};
 const matched=domains.filter(d=>d.q.test(q));
 let successful=matched.some(d=>d.r.test(a));
 const meaningfulExtra=/\b(i|i'm|i've|i'd|we|we're|my|our|want|need|would|because|but|and|please|can|could|what|where|when|how|why)\b/.test(a);
 // A user's additional clause can be understood as relevant to a shared scenario.
 const sharedTheme=/\b(hotel|flight|airport|reservation|check.?in|check.?out|bus|train|station|mall|restaurant|cafe|work|office|meeting|room|restroom)\b/.test(a);
 const qNouns=new Set(words(q).filter(x=>x.length>4&&!['would','could','should','there','today','tomorrow','please','about','which','where','going','like','have','want','your','what','when','with'].includes(x)));
 const commonNouns=tokens.filter(x=>qNouns.has(x));
 const sampleCore=new Set(sampleTokens.filter(x=>x.length>3&&!['please','would','could','should','have','this','that','there','with','your','from'].includes(x)));
 const sampleMatch=tokens.some(x=>sampleCore.has(x));
 if(sampleMatch)successful=true;
 if(!matched.length && commonNouns.length>0)successful=true;
 if(/\b(reservation|reserved|booking)\b/.test(q) && /\b(booked|booking|reserved|reservation)\b/.test(a))successful=true;
 if(successful)return {kind:'clear',accepted:true,title:'🟢 뜻이 통할 가능성 높음',detail:'질문과 관련된 정보를 찾았습니다. 시제·문법이 조금 틀려도 대화를 이어갈 수 있어 보여요.',example:sample||'',disclaimer:label};
 const badKnown=negative.test(a);
 const contextMismatch= matched.length>0 && tokens.length>=3 && !successful && (badKnown || /\b(i like|i love|i watched|i played|i work|i ate|i am|i'm|the|my)\b/.test(a));
 if(contextMismatch)return {kind:'offtopic',accepted:false,title:'🔴 질문과 관련이 낮아 보여요',detail:'영어 문장일 수 있지만, 지금 질문에서 요구하는 정보와는 거리가 있어 보여요. 질문을 다시 듣고 답해 보세요.',example:sample||'',disclaimer:label};
 if(politeResponse && yesNo)return {kind:'clear',accepted:true,title:'🟢 뜻이 통할 가능성 높음',detail:'간단하고 정중한 응답입니다.',example:sample||'',disclaimer:label};
 return {kind:'unclear',accepted:false,title:'🟠 다시 확인하면 좋음',detail:'지금 규칙으로는 질문과 답의 관련성을 확신하기 어렵습니다. 조금 더 구체적으로 말해 보세요.',example:sample||'',disclaimer:label};
}
window.YANA_EVAL={evaluate};
})();
