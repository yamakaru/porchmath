// Acceptance + Tester addendum cases for the 2026-11-04 custom calculators.
const {chromium}=require('/workspace/deskkit/node_modules/playwright-core');
const base=process.argv[2]||'http://localhost:8812',LP=process.argv[3]||'';
let bad=0;function ok(c,m){if(!c){bad++;console.log('FAIL',m)}}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const go=async(s,m)=>{await p.goto(`${base}/${LP}${s}/`);await p.evaluate(m=>{localStorage.setItem('pmu',m)},m);await p.reload();await p.waitForTimeout(100)};
const set=async(id,v)=>{await p.fill('#'+id,String(v));await p.waitForTimeout(30)};
const sel=async(id,v)=>{await p.selectOption('#'+id,String(v));await p.waitForTimeout(30)};
const R=async()=>p.evaluate(()=>[...document.querySelectorAll('#r tr')].map(r=>r.cells[0].textContent+'='+(r.cells[1]?r.cells[1].textContent:'')).join(' | ')+' || '+(document.getElementById('warn').hidden?'':document.getElementById('warn').textContent));
const has=async(s,m)=>{const r=await R();ok(r.includes(s),m+' expected '+s+' got '+r)};
const not=async(s,m)=>{const r=await R();ok(!r.includes(s),m+' unexpected '+s+' got '+r)};
// cubic feet
await go('cubic-feet-calculator','0');await has('Cubic feet (ft³)=24','C1');await has('0.889','C1yd');await has('0.68','C1m3');
await p.fill('#items .it:nth-child(1) [data-i=l]','24');await p.fill('#items .it:nth-child(1) [data-i=w]','18');await p.fill('#items .it:nth-child(1) [data-i=h]','12');
for(const c of ['l','w','h'])await p.selectOption(`#items .it:nth-child(1) [data-i=${c}u]`,'in');await has('Cubic feet (ft³)=3 ','C2 inches');
await p.click('#add');await p.click('#add');await p.fill('#items .it:nth-child(2) [data-i=l]','1,5');await p.selectOption('#items .it:nth-child(2) [data-i=lu]','m');
await p.click('#items .it:nth-child(2) .rm');await p.waitForTimeout(50);let n=await p.$$eval('#items .it',a=>a.length);ok(n==2,'P4 rows');await has('Cubic feet (ft³)=6','P4 sum');
await p.fill('#items .it:nth-child(1) [data-i=l]','');await has('Please check','empty');await p.fill('#items .it:nth-child(1) [data-i=l]','-2');await has('Please check','neg');
await p.fill('#items .it:nth-child(1) [data-i=l]','24');await p.selectOption('#items .it:nth-child(1) .sh','c');await p.fill('#items .it:nth-child(1) [data-i=d]','12');
await go('cubic-feet-calculator','1');await has('Cubic meters (m³)=0.648','C metric default');
// voltage
await go('voltage-drop-calculator','0');await has('=6.32 V','V0');await has('5.27 %','V0p');await has('Warning','V0w');await has('≤ 3 %=8 AWG','V0 smallest');
await set('L','150');await set('I','20');await has('9.88 %','Vx');await sel('cd','al');await set('L','100');await set('I','16');await has('10.39 V','V1');await has('8.66 %','V1p');await has('Warning','V1w');
await sel('vs','480');await sel('ph','3');await sel('cd','cu');await sel('ws','5');await set('L','200');await set('I','50');await has('5.35 V','V2');await has('1.12 %','V2p /* 5.3537/480 = 1.1153 %; addendum says 1.11 (truncated) */');await has('OK:','V2ok');
await sel('ph','1');await sel('vs','120');await set('I','0');await has('Please check','V4 zero I');await sel('vs','c');await set('vc','0');await has('Please check','V4 zero V');
let b7=await p.evaluate(()=>{var L=0.03*120*6530/(25.8*10);return [PM4.SMALL(0,'1',true,120,L,10),PM4.SMALL(0,'1',true,120,L*1.001,10)]});ok(b7[0]==1&&b7[1]==2,'V7 boundary '+b7);
await go('voltage-drop-calculator','0');await sel('vs','240');await set('L','50');await sel('ws','2');await set('I','30');await has('3.73 V','V240');
await go('voltage-drop-calculator','0');await sel('ws','0');await set('L','2000');await set('I','30');await has('Wire too small','V5');await has('Voltage at load=—','V5b');await set('L','5000');await has('None in the table','V6');
await go('voltage-drop-calculator','1');await sel('vs','230');await has('6.60 V','V3');await has('2.87 %','V3p');await has('2.5 mm² (≈14 AWG)','V9');
await set('L','');await has('Please check','Vempty');await set('L','0');await has('Please check','Vzero');await set('L','30');await set('I','1,5');await not('Please check','dec comma');await p.click('.ub[data-u="0"]');await p.waitForTimeout(50);let wo=await p.$eval('#ws',e=>e.options[0].textContent);ok(wo=='14 AWG','V8 list '+wo);
// slab
await go('concrete-slab-cost-calculator','0');await has('(yd³)=1.36','S yd');await has('(ft³)=36.67','S ft');await has('=62','S bags');await has('Cheapest option=Enter a price','S noprice');
await set('P80','6,5');await has('Cheapest option=80 lb','S cheap');await set('PR','150');await set('DF','60');await has('Cost with ready-mix=263.70','S rm');await set('P80','0');await has('Please check','S zero price');
// roof
await go('roof-pitch-calculator','0');await has('Pitch=6/12','R p');await has('26.57°','R a');await has('50','R s');await has('1.118','R m');
await set('Rn','0');await has('Please check','R run0');await sel('md','an');await set('A','90');await has('below 90','R 90');await set('A','0');await has('0/12','R0');
await sel('md','sp');await has('incl. overhang=14.53 ft','R raf');
// retaining
await go('retaining-wall-calculator','0');await has('Courses (rows)=9','W c');await has('Blocks per course=20','W p');await has('Blocks before waste=180','W b');await has('=189','W w');await not('IRC','W nowarn');
await p.check('#bu');await has('Courses (rows)=10','W buried');await p.uncheck('#bu');await set('H','4');await not('IRC','W 4ft');await set('H','4,083');await has('IRC','W 49in');
await go('retaining-wall-calculator','1');await has('Blocks before waste=180','W metric');await set('H','1,21');await has('IRC','W 1.21');await set('H','1,2');await not('IRC','W 1.2');
// overflow
for(const w of [390,375])for(const s of ['cubic-feet-calculator','voltage-drop-calculator','concrete-slab-cost-calculator','roof-pitch-calculator','retaining-wall-calculator']){await p.setViewportSize({width:w,height:800});await p.goto(`${base}/${LP}${s}/`);const o=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);ok(o<=0,'overflow '+w+' '+s+' '+o)}
ok(!errs.length,'page errors '+errs.join(';'));console.log(bad?bad+' failures':'ALL PASS');await b.close();process.exit(bad?1:0)})();
