/* Original, lightweight SVG chibi pets inspired by the supplied cartoon pet palette. */
(function(){
  'use strict';
  const C='#242332', P='#ffc5d3';
  const e=(tag,attr,children='')=>'<'+tag+' '+attr+'>'+children+'</'+tag+'>';
  const path=(d,fill,other='')=>'<path d="'+d+'" fill="'+fill+'" '+other+'/>';
  const ellipse=(cx,cy,rx,ry,fill,other='')=>'<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" '+other+'/>';
  const circle=(cx,cy,r,fill,other='')=>'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" '+other+'/>';
  const base=(tail,ears,body,head,decor='')=>'<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><g stroke="'+C+'" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">'+
     ellipse(82,143,52,5,'#5f6070','opacity=".16" stroke="none"')+tail+body+ears+head+decor+'</g></svg>';
  const eyes=(y=73,x1=65,x2=98)=>circle(x1,y,8,C)+circle(x2,y,8,C)+circle(x1-2,y-3,2.2,'white','stroke="none"')+circle(x2-2,y-3,2.2,'white','stroke="none"');
  const smile=(y=89)=>circle(81,y-5,3.5,'#e47c8d','stroke="none"')+path('M81 '+(y-1)+'q-7 10 -14 2 M81 '+(y-1)+'q7 10 14 2','none','stroke-width="2.4"');
  const blush=(y=89,x1=47,x2=118)=>ellipse(x1,y,10,5,P,'stroke="none" opacity=".9"')+ellipse(x2,y,10,5,P,'stroke="none" opacity=".9"');
  const paws=(fill)=>ellipse(55,132,17,10,fill)+ellipse(106,132,17,10,fill);
  const body=(fill)=>ellipse(81,107,42,32,fill)+paws(fill);
  const face=(fill)=>ellipse(81,67,43,39,fill)+eyes()+blush()+smile();
  let svg={};
  // Elephant
  svg.elephant=base(
    path('M115 103 Q150 95 136 127','none','stroke-width="13"'),
    ellipse(42,69,26,31,'#7dbfff')+ellipse(124,69,26,31,'#7dbfff')+ellipse(41,71,17,21,'#f7abcf','stroke-width="3"')+ellipse(123,71,17,21,'#f7abcf','stroke-width="3"'),
    body('#78bafa'),ellipse(81,65,38,37,'#78bafa')+eyes(67,65,99)+blush(91,48,115)+
    path('M79 79 Q88 91 80 111 Q73 127 95 122 Q105 118 98 110','none','stroke-width="13"')+ellipse(97,123,7,4,'#5e9ddd')+
    path('M54 95 l-7 5 M109 96 l7 5','none','stroke-width="3"')
  );
  // White rabbit
  svg.rabbit=base(
    ellipse(121,110,15,15,'#fff') ,
    path('M51 42 Q33 -14 52 5 Q77 18 70 44 Z','#fff')+path('M88 40 Q96 -17 113 4 Q121 17 101 51 Z','#fff')+
    path('M53 16 Q50 10 54 17 L63 40 Q52 35 53 16 Z','#ffc7e7','stroke="none"')+
    path('M104 16 Q108 12 104 18 L97 43 Q93 38 104 16 Z','#ffc7e7','stroke="none"'),
    body('#fffafc'), face('#fffafc')
  );
  // Tiger
  svg.tiger=base(
    path('M119 111 Q148 91 143 61 Q138 43 130 56','none','stroke="#f79437" stroke-width="15"')+
    path('M142 67 l-12 4 M140 87 l-13 0','none','stroke="#35212a" stroke-width="5"'),
    path('M44 36 L48 15 Q63 17 66 32 Z','#f99028')+path('M101 34 L116 14 Q126 20 122 45 Z','#f99028')+
    path('M49 26 L53 21 L60 29 Z','#f0abc2','stroke="none"')+path('M111 27 L116 21 L118 33 Z','#f0abc2','stroke="none"'),
    body('#f89530'),face('#f89530')+ellipse(81,100,24,13,'white')+
    path('M79 33 v14 M67 36 l5 10 M92 36 l-5 10 M42 61 l15 5 M41 75 l15 -2 M120 62 l-15 5 M120 75 l-15 -2','none','stroke-width="5"')
  );
  // Frog
  svg.frog=base(
    '',circle(45,42,22,'#55c648')+circle(117,42,22,'#55c648'),
    body('#5bd34e')+ellipse(81,110,28,23,'#b7f980','stroke-width="2"')+
    ellipse(81,74,49,38,'#5bd34e')+circle(45,41,11,'white')+circle(117,41,11,'white')+
    circle(46,41,6,C)+circle(118,41,6,C)+circle(44,38,2,'white','stroke="none"')+circle(116,38,2,'white','stroke="none"')+
    ellipse(53,88,10,5,P,'stroke="none"')+ellipse(110,88,10,5,P,'stroke="none"')+path('M66 83 Q82 100 99 82','none','stroke-width="3.5"')+circle(67,80,2,C)+circle(98,80,2,C)
  );
  // Panda
  svg.panda=base(
    '',circle(49,37,17,C)+circle(112,37,17,C),
    body('#fff')+ellipse(56,116,14,17,C)+ellipse(106,116,14,17,C)+
    ellipse(81,67,44,39,'#fff')+ellipse(61,70,16,19,C)+ellipse(101,70,16,19,C)+
    circle(63,70,7,'white','stroke="none"')+circle(99,70,7,'white','stroke="none"')+circle(63,71,5,C,'stroke="none"')+circle(99,71,5,C,'stroke="none"')+
    circle(61,69,2,'white','stroke="none"')+circle(97,69,2,'white','stroke="none"')+blush(91,45,118)+smile(92)
  );
  // Dinosaur
  svg.dino=base(
    path('M98 101 Q130 113 147 118 Q136 127 113 124 Z','#11b7a1')+
    path('M111 85 L120 73 L128 85 L132 71 L140 89 L143 110','none','stroke-width="7" stroke="#0a977f"'),
    '',body('#15bba7')+ellipse(81,116,23,25,'#e8c057','stroke="none"')+
    path('M48 92 Q32 76 43 53 Q50 31 84 31 Q102 32 110 49 L111 68 Q103 80 73 84 Q64 95 48 92 Z','#15bba7')+
    ellipse(56,69,15,11,'#24cba9')+circle(89,49,9,'white')+circle(88,50,6,C,'stroke="none"')+circle(86,47,2.3,'white','stroke="none"')+
    circle(52,71,2.6,C,'stroke="none"')+ellipse(95,79,9,5,P,'stroke="none"')+path('M42 86 Q61 92 84 82','none','stroke-width="2.4"')
  );
  // Puppy
  svg.dog=base(
    path('M118 112 Q145 95 137 82','none','stroke="#eca03c" stroke-width="13"'),
    path('M40 34 Q6 45 23 89 Q35 100 52 70 Z','#e9a64a')+
    path('M120 35 Q152 39 144 83 Q127 96 108 71 Z','#e9a64a'),
    body('#fffdf6')+ellipse(81,72,44,39,'#fffdf8')+ellipse(107,62,15,27,'#f2b85a','stroke="none"')+eyes()+blush()+smile()
  );
  // Hamster
  svg.hamster=base(
    '',circle(48,41,18,'#e9983a')+circle(114,41,18,'#e9983a')+circle(48,41,10,'#f7a0b3')+circle(114,41,10,'#f7a0b3'),
    ellipse(81,103,48,38,'#f0a63c')+ellipse(81,112,31,27,'#fff6e2')+
    ellipse(81,69,44,39,'#ee9f35')+ellipse(59,81,25,20,'#fff1dc','stroke="none"')+ellipse(104,81,25,20,'#fff1dc','stroke="none"')+
    eyes(65,64,99)+ellipse(52,81,10,6,P,'stroke="none"')+ellipse(111,81,10,6,P,'stroke="none"')+smile(90)+paws('#f4ae4b')
  );
  // Gray striped kitten
  svg.cat=base(
    path('M122 108 Q149 98 143 78 Q141 68 135 75','none','stroke="#848c9b" stroke-width="16"')+path('M143 92 L132 92 M140 111 l-13 -2','none','stroke-width="4"'),
    path('M42 52 L41 16 L66 34 Z','#b9bdc8')+path('M98 35 L120 15 L122 55 Z','#b9bdc8')+
    path('M48 34 L47 26 L57 37 Z','#f5a8c3','stroke="none"')+path('M107 37 L117 25 L117 41 Z','#f5a8c3','stroke="none"'),
    body('#b8bbc6')+ellipse(81,112,23,25,'#fff','stroke-width="2"')+face('#b8bbc6')+
    ellipse(81,86,29,17,'#fff','stroke="none"')+
    path('M80 33 v13 M66 38 l6 11 M95 37 l-5 10 M44 62 l13 4 M43 75 l14 -2 M119 62 l-13 4 M118 75 l-13 -2','none','stroke-width="4"')+
    path('M81 78 l-4 4 h8 Z','#df8b9c')+path('M81 83 q-5 7 -10 2 M81 83 q5 7 10 2','none','stroke-width="2.2"')
  );
  // Monkey
  svg.monkey=base(
    path('M117 108 Q160 108 149 63 Q143 45 132 61','none','stroke="#ad6e38" stroke-width="14"'),
    circle(40,66,19,'#a97549')+circle(123,66,19,'#a97549')+circle(40,66,10,'#e4b68e')+circle(123,66,10,'#e4b68e'),
    body('#b2763e')+ellipse(80,110,24,23,'#e9bf90','stroke-width="2"')+
    ellipse(81,67,43,39,'#b5743c')+ellipse(82,77,35,26,'#eac499','stroke="none"')+
    eyes(70,65,99)+blush(91,48,113)+smile(91)+
    path('M58 45 Q81 30 104 45','none','stroke="#8b582f" stroke-width="7"')
  );
  const out={};for(const [key,value] of Object.entries(svg))out[key]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(value);
  window.YANA_PET_ART=out;
})();
