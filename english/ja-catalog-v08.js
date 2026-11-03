/* やなとも English/Japanese shared learning catalog v0.8 (Japanese edition).
   Requires the 4 Japanese vocab segments and 3 Japanese conversation segments.
   All Japanese practice sentences are authored Japanese, not browser-translated English. */
(function(){
'use strict';
const EN=window.YANA_DATA;
const forms=window.YANA_JP_FORMS||{};
const scripts=window.YANA_JP_SCENES||{};
if(!EN||!EN.WORDS||!EN.TOPICS)throw Error('English base catalog not loaded');
const counters=Object.create(null);
const readingByGroup=Object.create(null);
for(const [group,list] of Object.entries(forms)){
 readingByGroup[group]=String(list).split(',');
}
const WORDS=EN.WORDS.map(entry=>{
 const index=counters[entry.group]||0;counters[entry.group]=index+1;
 const jp=readingByGroup[entry.group]?.[index];
 if(!jp)throw Error('Japanese word missing: '+entry.group+' / '+index+' / '+entry.word);
 return {word:jp,reading:jp,ko:entry.ko,english:entry.word,group:entry.group,icon:EN.VISUALS?.get(entry.word)||null};
});
const TOPICS=EN.TOPICS.map(t=>{
 const jp=scripts[t.id];
 if(!jp||jp.questions?.length!==3||jp.answers?.length!==3)throw Error('Japanese conversation missing: '+t.id);
 return {...t,turns:t.turns.map((old,i)=>({en:jp.questions[i],ko:old.ko,sample:jp.answers[i]}))};
});
const quizKo=new Map();
for(let i=0;i<TOPICS.length;i++){
 for(let j=0;j<3;j++){
  const eng=EN.TOPICS[i].turns[j].sample;
  const jp=TOPICS[i].turns[j].sample;
  // Translation of the corresponding English response is available in the v0.7 catalog.
  const korean=EN.QUIZ_KO?.get(eng)||EN.TOPICS[i].turns[j].ko;
  if(!quizKo.has(jp))quizKo.set(jp,korean);
 }
}
const jpImages=new Map(WORDS.filter(w=>w.icon).map(w=>[w.word,w.icon]));
const variants=[];
for(const time of ['朝','昼','夕方','週末']){
 for(const company of ['一人で','友達と','家族と']){
  for(const mood of ['ゆっくり','急いで'])variants.push({time,company,mood});
 }
}
const result={
 TOPICS,WORDS,VARIANTS:variants,
 GROUP_KO:EN.GROUP_KO,
 VISUALS:jpImages,
 QUIZ_KO:quizKo,
 totalEpisodes:TOPICS.length*variants.length,
 totalQuizVariants:TOPICS.length*variants.length*3,
 contentVersion:'0.8-ja',language:'ja'
};
window.YANA_EN_DATA=EN;
window.YANA_JP_DATA=result;
window.YANA_JP_META={themes:TOPICS.length,questions:TOPICS.length*3,wordEntries:WORDS.length,distinctWords:new Set(WORDS.map(w=>w.word)).size};
})();
