// Same VD formula, K values and CM table as /voltage-drop-calculator/ so both pages agree.
function R2(x){return Math.round(x*100)/100}
var AWG=[['14 AWG',4110],['12 AWG',6530],['10 AWG',10380],['8 AWG',16510],['6 AWG',26240],['4 AWG',41740],['3 AWG',52620],['2 AWG',66360],['1 AWG',83690],['1/0 AWG',105600],['2/0 AWG',133100],['3/0 AWG',167800],['4/0 AWG',211600],['250 kcmil',250000],['300 kcmil',300000],['350 kcmil',350000],['400 kcmil',400000],['500 kcmil',500000]];
var MM=[[1.5,'16 AWG'],[2.5,'14 AWG'],[4,'12 AWG'],[6,'10 AWG'],[10,'8 AWG'],[16,'6 AWG'],[25,'4 AWG'],[35,'2 AWG'],[50,'1/0 AWG'],[70,'2/0 AWG'],[95,'3/0 AWG'],[120,'4/0 AWG'],[150,'300 kcmil'],[185,'350 kcmil'],[240,'500 kcmil']];
/* NEC 2023 Table 310.16 allowable ampacities [60 °C, 75 °C, 90 °C], rows aligned with AWG above (NFPA fact sheet NECAmpacityWorkflow.pdf) */
var AMP={cu:[[15,20,25],[20,25,30],[30,35,40],[40,50,55],[55,65,75],[70,85,95],[85,100,115],[95,115,130],[110,130,145],[125,150,170],[145,175,195],[165,200,225],[195,230,260],[215,255,290],[240,285,320],[260,310,350],[280,335,380],[320,380,430]],
al:[null,[15,20,25],[25,30,35],[35,40,45],[40,50,55],[55,65,75],[65,75,85],[75,90,100],[85,100,115],[100,120,135],[115,135,150],[130,155,175],[150,180,205],[170,205,230],[195,230,260],[210,250,280],[225,270,305],[260,310,350]]};
/* NEC 240.4(D) small-conductor overcurrent limits (A), by AWG row index */
var LIM={cu:{0:15,1:20,2:30},al:{1:15,2:25}};
function VD(met,ph,cu,size,L,I){var f=ph=='3'?1.732:2;return met?f*(cu?0.0172:0.0282)*L*I/size:f*(cu?12.9:21.2)*I*L/size}
function NAME(met,j){return met?NF(0,false,1).format(MM[j][0])+' mm²':AWG[j][0]+' ('+F(AWG[j][1]*0.000506707,2)+' mm²)'}
var ONI=0;function ONU(m){MT=m;UV();if(!ONI){ONI=1;if(!/^en/.test(LOC))$('vs').value='230';VS();$('vs').addEventListener('change',VS)}}
function VS(){$('vcw').hidden=$('vs').value!='c'}
function CALC(){var met=MT,v=$('vs').value,V=v=='c'?N('vc',{max:100000}):+v,ph=$('ph').value,cu=$('cd').value=='cu',I0=N('I',{max:100000}),L=N('L',{max:100000}),X=N('X');
 if(ERR)return null;if(X>100){FE($('X'),'B');ERR=1;return null}
 var I=$('ct').checked?I0*1.25:I0,MAT=cu?'Copper':'Aluminum',U=met?' m':' ft',w=[],rows,j,p,d;
 function pct(j){return R2(VD(met,ph,cu,met?MM[j][0]:AWG[j][1],L,I)/V*100)}
 function vdt(j){var d=VD(met,ph,cu,met?MM[j][0]:AWG[j][1],L,I);return F(d,2)+' V ('+F(d/V*100,2)+' %)'}
 if(ph=='3'&&V==277)w.push('Check the voltage: 277 V is a line-to-neutral voltage. Three-phase circuits are normally sized with the line-to-line voltage, such as 480 V.');
 if(V<12)w.push('Check the voltage: this calculator is meant for building wiring.');
 var cur=['Current used for sizing',F(I,0,2)+' A'+($('ct').checked?' (125 % × '+F(I0,0,2)+' A)':'')];
 if(met){var iv=-1;for(j=0;j<MM.length;j++)if(pct(j)<=X){iv=j;break}
  var amin=(ph=='3'?1.732:2)*(cu?0.0172:0.0282)*L*I/(X/100*V);
  if(iv<0)return {msg:'No size in this table (up to 240 mm²) keeps the voltage drop within the limit. Use parallel conductors or have an electrical engineer design the circuit.'};
  rows=[['Recommended wire size',NAME(1,iv)+' · '+MAT],['Governing check','Voltage drop only'],['Minimum cross-section for this voltage drop',F(amin,2)+' mm²'],['Voltage drop',vdt(iv)],['Next size up',iv+1<MM.length?NAME(1,iv+1):'—'],['Next size down',iv>0?NAME(1,iv-1)+': '+vdt(iv-1):'—'],cur];
  w.push('Current-carrying capacity is not checked in metric mode. Check it against IEC 60364-5-52 or your local wiring standard.');
  return {rows:rows,warn:w.join(' ')}}
 var col=+$('tt').value,A=AMP[cu?'cu':'al'],Lm=LIM[cu?'cu':'al'],ia=-1,it=-1,ivu=-1;
 for(j=0;j<AWG.length;j++){if(!A[j])continue;var a=A[j][col],e=Math.min(a,Lm[j]||1e9);if(it<0&&a>=I)it=j;if(ia<0&&e>=I)ia=j;if(ivu<0&&pct(j)<=X)ivu=j}
 if(ia<0||ivu<0)return {msg:'No size in this table (up to 500 kcmil) passes both checks. Use parallel conductors or have an electrical engineer design the circuit.'};
 var ans=Math.max(ia,ivu),gov=ivu>ia?'Voltage drop':ia>it?'Small-conductor limit (NEC 240.4(D))':ivu==ia?'Ampacity and voltage drop':'Ampacity (NEC Table 310.16)',a0=A[ans][col],l0=Lm[ans],first=cu?0:1;
 var amp=F(a0,0)+' A ('+(col?'75':'60')+' °C column)'+(l0&&l0<a0?' — max. overcurrent protection '+F(l0,0)+' A (NEC 240.4(D))':'');
 var dn='—';if(ans>first){var b=A[ans-1][col],bl=Math.min(b,Lm[ans-1]||1e9);dn=NAME(0,ans-1)+': '+(b<I?'fails ampacity ('+F(b,0)+' A)':bl<I?'fails the 240.4(D) limit ('+F(bl,0)+' A)':'fails voltage drop, '+vdt(ans-1))}
 rows=[['Recommended wire size',NAME(0,ans)+' · '+MAT],['Governing check',gov],['Ampacity of this size',amp],['Voltage drop',vdt(ans)],['Next size up',ans+1<AWG.length?NAME(0,ans+1):'—'],['Next size down',dn],cur];
 return {rows:rows,warn:w.join(' ')}}
window.PM5W={AMP:AMP,LIM:LIM,VD:VD};
