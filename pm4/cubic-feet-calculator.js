var UF={ft:1,'in':1/12,yd:3,m:1/0.3048,cm:1/30.48};
function cfOut(cf){return {ft3:cf,in3:cf*1728,yd3:cf/27,m3:cf*0.0283168,L:cf*28.3168,gal:cf*7.48052}}
// PM-07: 3 significant digits, trailing zeros kept (0.680)
function SG(x){var a=Math.abs(x),d=a>=100?0:a>=10?1:a>=1?2:a>=0.1?3:a>=0.01?4:a>=0.001?5:6;return F(x,d,d)}
var IDN=0;
function ADD(src){var t=$('itpl'),it=t.content?t.content.firstElementChild.cloneNode(true):t.firstElementChild.cloneNode(true),n=++IDN;
 it.querySelectorAll('[data-i]').forEach(function(e){var b=e.getAttribute('data-i');e.id=b+n;var l=it.querySelector('label[data-f="'+b+'"]');if(l)l.setAttribute('for',b+n);var s=it.querySelector('[data-e="'+b+'"]');if(s){s.id=b+n+'-e';e.setAttribute('aria-describedby',b+n+'-e')}});
 if(src){it.querySelectorAll('input,select').forEach(function(e){var o=src.querySelector('[data-i="'+e.getAttribute('data-i')+'"]');if(o)e.value=o.value});it.classList.toggle('cyl',src.classList.contains('cyl'))}
 $('items').appendChild(it);RM();return it}
function RM(){var a=document.querySelectorAll('#items .it');a.forEach(function(it,j){it.querySelector('.rm').disabled=a.length<2;var h=it.querySelector('.itn');if(h)h.textContent='#'+(j+1)})}
function CALC(){var tot=0;document.querySelectorAll('#items .it').forEach(function(it){var cyl=it.querySelector('.sh').value=='c',q=N(it.querySelector('.q')),
 g=function(c){var w=it.querySelector('.d-'+c);return N(w.querySelector('input'))*UF[w.querySelector('select').value]};
 var v=cyl?Math.PI*Math.pow(g('d')/2,2)*g('h'):g('l')*g('w')*g('h');tot+=v*q});
 if(ERR)return null;if(!isFinite(tot)||tot>1e9)return {msg:'Total volume is too large (over 1 billion ft³). Check the dimensions and units.'};var o=cfOut(tot),R={ft3:['Cubic feet (ft³)',SG(o.ft3)],yd3:['Cubic yards (yd³)',SG(o.yd3)],in3:['Cubic inches (in³)',SG(o.in3)],m3:['Cubic meters (m³)',SG(o.m3)],L:['Liters (L)',SG(o.L)],gal:['US gallons (gal)',SG(o.gal)]};
 var ord=MT?['m3','L','ft3','yd3','in3','gal']:['ft3','yd3','in3','m3','L','gal'];return {rows:ord.map(function(k){return R[k]})}}
var ONU0=0;function ONU(m){if(ONU0)return;ONU0=1;MT=m;var it=ADD();if(m)it.querySelectorAll('.dim').forEach(function(w){w.querySelector('select').value='m';var i=w.querySelector('input');i.value=i.getAttribute('data-mv')});
 $('items').addEventListener('click',function(e){var b=e.target.closest('.rm');if(b&&!b.disabled){b.closest('.it').remove();RM();run(1)}});
 $('items').addEventListener('change',function(e){if(e.target.classList.contains('sh')){e.target.closest('.it').classList.toggle('cyl',e.target.value=='c');run(1)}});
 $('add').addEventListener('click',function(){var a=document.querySelectorAll('#items .it');ADD(a[a.length-1]);run(1)})}
