var LOC=((typeof document!='undefined'&&document.documentElement&&document.documentElement.lang)||'en'),MT=0,BAD=0,ERR=0;
/*PNUM*/
var EM={E:'Enter a number',N:'Not a valid number',A:'Unclear number. Write decimals like this:',G:'Must be 0 or more',P:'Must be greater than 0',B:'Number too large'};
var CPT={ok:'Copied',no:'Could not copy. Select the results and copy manually.'};
function $(i){return document.getElementById(i)}
function FE(el,e){if(!el||!el.setAttribute)return;var s=$(el.id+'-e');el.setAttribute('aria-invalid',e?'true':'false');if(s)s.textContent=e?(e=='A'?EM.A+' '+NF(1).format(1.5):EM[e]):''}
/* read number from input id. o.z: allow 0; o.opt: empty -> null; o.neg: allow negative; o.max */
function N(id,o){o=o||{};var el=typeof id=='string'?$(id):id,x=pnum(el.value),e='';if(x==='E'&&o.opt){FE(el,'');return null}if(typeof x=='string')e=x;else if(x<0&&!o.neg)e=o.z?'G':'P';else if(x==0&&!o.z)e='P';else if(Math.abs(x)>(o.max||1e9))e='B';FE(el,e);if(e){ERR=1;return NaN}return x}
function F(x,d,mx){if(typeof x!='number'||!isFinite(x))return '—';return NF(d,true,mx).format(x)}
function UP(x){return Math.ceil(+(x-Math.abs(x)*1e-9).toFixed(6))}
function SV(el,x){el.value=NF(0,false,4).format(+(+x).toFixed(4))}
function RR(r){var T=$('r'),w=$('warn');if(w){w.textContent='';w.hidden=true}
 if(!r||ERR||r.msg){BAD=1;T.innerHTML='<tr><td>'+(r&&r.msg?r.msg:'Please check the highlighted fields')+'</td><td><b>—</b></td></tr>';return 0}
 BAD=0;T.innerHTML=r.rows.map(function(x){return '<tr><td>'+x[0]+'</td><td><b>'+x[1]+'</b></td></tr>'}).join('');if(w&&r.warn){w.textContent=r.warn;w.hidden=false}return 1}
function run(u){ERR=0;var r=null;try{r=CALC()}catch(e){r=null}if(RR(r)&&u&&window.MTrack)window.MTrack('calc')}
/* unit switch with memo so toggling back restores the typed value */
function SW(el,m){var k=+el.getAttribute('data-k');if(!k)return;var s=el._pm||(el._pm={}),o=el.value,t;if(s.p===o&&s[m]!=null)t=s[m];else{var x=pnum(o);if(typeof x!='number')return;SV(el,m?x*k:x/k);t=el.value}s[MT]=o;el.value=t;s.p=t}
function SU(m,init){var f=document.querySelector('form.calc');if(m==MT&&!init)return;if(init&&m)document.querySelectorAll('.calc [data-mv]').forEach(function(el){el.value=el.getAttribute('data-mv')});else if(!init)document.querySelectorAll('.calc input[data-k]').forEach(function(el){SW(el,m)});
 MT=m;f.classList.toggle('m',!!m);document.body.classList.toggle('um',!!m);document.querySelectorAll('.ub').forEach(function(b){b.setAttribute('aria-pressed',String(+b.getAttribute('data-u')==m))});try{if(!init)localStorage.setItem('pmu',m)}catch(e){}if(typeof ONU=='function')ONU(m);run()}
function CPY(t,ok,no){function fb(){var a=document.createElement('textarea'),r=false;a.value=t;a.setAttribute('readonly','');a.style.position='fixed';a.style.top='0';a.style.opacity='0';document.body.appendChild(a);a.select();try{r=document.execCommand('copy')}catch(e){}document.body.removeChild(a);if(r)ok();else no()}if(navigator.clipboard&&window.isSecureContext!==false)navigator.clipboard.writeText(t).then(ok,fb);else fb()}
function INIT(){var cpb=$('cp'),cpm=$('cpm');
 if(cpb)cpb.addEventListener('click',function(){if(BAD){var e=document.querySelector('#r td');if(cpm){cpm.textContent=e?e.textContent:'';cpm.className='cpm err'}return}var w=$('warn'),t=document.querySelector('h1').textContent+'\n'+[].map.call(document.querySelectorAll('#r tr'),function(r){return r.cells[0].textContent+': '+r.cells[1].textContent}).join('\n')+(w&&!w.hidden?'\n'+w.textContent:'');
  if(!cpb._o)cpb._o=cpb.textContent;function sh(ok){clearTimeout(cpb._t);cpb.textContent=ok?'✓ '+CPT.ok:cpb._o;cpb.classList.toggle('ok',ok);if(cpm){cpm.textContent=ok?CPT.ok:CPT.no;cpm.className=ok?'cpm':'cpm err'}cpb._t=setTimeout(function(){cpb.textContent=cpb._o;cpb.classList.remove('ok');if(cpm&&ok)cpm.textContent=''},ok?2000:6000)}
  CPY(t,function(){sh(true);if(window.MTrack)window.MTrack('copy')},function(){sh(false)})});
 var f=document.querySelector('form.calc');f.addEventListener('input',function(){run(1)});f.addEventListener('change',function(){run(1)});
 document.querySelectorAll('.ub').forEach(function(b){b.addEventListener('click',function(){SU(+b.getAttribute('data-u'))})});
 var st=null;try{st=localStorage.getItem('pmu')}catch(e){}var m=st!=null?+st:(/^en/.test(LOC)?0:1);
 if(document.querySelector('.ub'))SU(m,1);else{if(typeof ONU=='function')ONU(m);run()}}
