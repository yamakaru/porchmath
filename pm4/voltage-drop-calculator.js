// PM-04: classify on the value shown (2 dp) so the label never contradicts the number
function R2(x){return Math.round(x*100)/100}
var AWG=[['14 AWG',4110],['12 AWG',6530],['10 AWG',10380],['8 AWG',16510],['6 AWG',26240],['4 AWG',41740],['3 AWG',52620],['2 AWG',66360],['1 AWG',83690],['1/0 AWG',105600],['2/0 AWG',133100],['3/0 AWG',167800],['4/0 AWG',211600],['250 kcmil',250000],['300 kcmil',300000],['350 kcmil',350000],['400 kcmil',400000],['500 kcmil',500000]];
var MM=[[1.5,'16 AWG'],[2.5,'14 AWG'],[4,'12 AWG'],[6,'10 AWG'],[10,'8 AWG'],[16,'6 AWG'],[25,'4 AWG'],[35,'2 AWG'],[50,'1/0 AWG'],[70,'2/0 AWG'],[95,'3/0 AWG'],[120,'4/0 AWG'],[150,'300 kcmil'],[185,'350 kcmil'],[240,'500 kcmil']];
/* metric: size = mm², L in m, rho at 20 °C; US: size = circular mils, L in ft, K per NEC Ch.9 */
function VD(met,ph,cu,size,L,I){var f=ph=='3'?1.732:2;return met?f*(cu?0.0172:0.0282)*L*I/size:f*(cu?12.9:21.2)*I*L/size}
function SMALL(met,ph,cu,V,L,I){var T=met?MM:AWG;for(var j=0;j<T.length;j++){var s=met?T[j][0]:T[j][1];if(R2(VD(met,ph,cu,s,L,I)/V*100)<=3)return j}return -1}
function WN(met,j){return met?NF(0,false,1).format(MM[j][0])+' mm² (≈'+MM[j][1]+')':AWG[j][0]}
function FILL(m){var ws=$('ws'),cur=ws.options.length?+ws.value:-1,area=cur<0?(m?2.5:6530*0.000506707):(MT?MM[cur][0]:AWG[cur][1]*0.000506707),T=m?MM:AWG,best=0,bd=1e9;
 ws.innerHTML='';T.forEach(function(r,j){var o=document.createElement('option');o.value=j;o.textContent=WN(m,j);ws.appendChild(o);var a=m?r[0]:r[1]*0.000506707,d=Math.abs(Math.log(a/area));if(d<bd){bd=d;best=j}});ws.value=best}
var ONI=0;function ONU(m){FILL(m);MT=m;if(!ONI){ONI=1;if(!/^en/.test(LOC))$('vs').value='230';VS();$('vs').addEventListener('change',VS)}}
function VS(){$('vcw').hidden=$('vs').value!='c'}
function CALC(){var met=MT,v=$('vs').value,V=v=='c'?N('vc'):+v,ph=$('ph').value,cu=$('cd').value=='cu',j=+$('ws').value,L=N('L'),I=N('I');
 if(ERR)return null;var size=met?MM[j][0]:AWG[j][1],d=VD(met,ph,cu,size,L,I),p=d/V*100,pr=R2(p),s=SMALL(met,ph,cu,V,L,I),U=met?' m':' ft',rows=[['Voltage drop',F(d,2)+' V'],['Voltage drop (%)',F(p,2)+' %'],['Voltage at load',d>=V?'—':F(V-d,2)+' V'],['Wire size checked',WN(met,j)],['Smallest size for ≤ 3 %',s<0?'None in the table':WN(met,s)],['One-way length',F(L,0,1)+U],['Load current',F(I,0,2)+' A']];
 var w=d>=V?'Wire too small: the drop is at or above the supply voltage. Choose a much larger wire or a shorter run.':pr<=3?'OK: within the 3 % branch-circuit recommendation (NEC 210.19(A) Informational Note, not a code requirement).':pr<=5?'Warning: above the 3 % branch-circuit recommendation; keep the total feeder + branch drop within 5 %.':'Warning: above the 5 % total recommendation. Use a larger wire or a shorter run.';
 if(s<0)w+=' '+'No wire size in the table keeps the drop at or below 3 %.';return {rows:rows,warn:w}}
window.PM4={VD:VD,SMALL:SMALL};
