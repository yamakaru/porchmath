/* US: ASTM A615 nominal weights (lb/ft) and diameters (in); metric: kg/m = d²/162 */
var BAR={'3':[0.376,0.375,'#10'],'4':[0.668,0.5,'#13'],'5':[1.043,0.625,'#16'],'6':[1.502,0.75,'#19']},LAPED=0;
function DIA(){return MT?+$('bm').value:BAR[$('bu').value][1]}
function LAPD(){if(!LAPED)$('LP').value=NF(0,false,2).format(40*DIA())}
var ONI=0;function ONU(m){MT=m;UV();if(!ONI){ONI=1;['bu','bm'].forEach(function(i){$(i).addEventListener('change',function(){LAPD();run(1)})});['st','stm'].forEach(function(i){$(i).addEventListener('change',SC)});$('LP').addEventListener('input',function(){LAPED=1})}LAPED=0;LAPD();SC()}
function SC(){$('stcw').hidden=$(MT?'stm':'st').value!='c'}
function CALC(){var L=N('L',{max:1e4}),W=N('W',{max:1e4}),s=N('S',{max:1e5}),c=N('CV',{z:1,max:1e5}),lap=N('LP',{max:1e5}),stv=$(MT?'stm':'st').value,st=stv=='c'?N('stc',{max:1000}):+stv;
 if(ERR)return null;
 /* work in inches (US) or millimetres (metric) */
 var f=MT?1000:12,Li=L*f,Wi=W*f,Si=st*f,U=MT?' m':' ft',pa=Li-2*c,pb=Wi-2*c;
 if(pa<=0||pb<=0){FE($('CV'),'');ERR=1;return {msg:'The edge cover must be less than half of the shorter side.'}}
 if(lap>=Si)return {msg:'The stock length must be longer than the lap length.'};
 function line(p,n){if(p<=Si+1e-9){var per=Math.floor(Si/p+1e-9);return {n:n,len:p,sticks:0,per:per,laps:0}}var k=UP((p-Si)/(Si-lap))+1;return {n:n,len:p+(k-1)*lap,sticks:k*n,per:0,laps:k-1}}
 var A=line(pa,UP(pb/s)+1),B=line(pb,UP(pa/s)+1),sticks=A.sticks+B.sticks;
 if(A.per&&B.per&&Math.abs(pa-pb)<1e-6)sticks+=UP((A.n+B.n)/A.per);else{if(A.per)sticks+=UP(A.n/A.per);if(B.per)sticks+=UP(B.n/B.per)}
 var tl=(A.n*A.len+B.n*B.len)/f,kgm=MT?DIA()*DIA()/162:0,lbft=MT?0:BAR[$('bu').value][0],wt=MT?tl*kgm:tl*lbft;
 function seg(o){return F(o.n,0)+' × '+F(o.len/f,0,2)+U+(o.laps?' ('+F(o.laps,0)+' × lap)':'')}
 var rows=[['Total bars',F(A.n+B.n,0)],['Bars along the length',seg(A)],['Bars along the width',seg(B)],[MT?'Total length (m)':'Total length (ft)',F(tl,0,2)]];
 if(MT)rows.push(['Weight (kg)',F(wt,1)]);else rows.push(['Weight (lb)',F(wt,1)],['Weight (kg)',F(wt*0.45359237,1)]);
 rows.push(['Stock bars to buy',F(sticks,0)+' × '+F(st,0,2)+U]);
 return {rows:rows}}
