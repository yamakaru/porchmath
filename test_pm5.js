// Acceptance + Tester addendum (2026-11-11) cases for wire size, pool volume, BTU, stud and rebar calculators.
// Usage: node test_pm5.js [base] ; serves dist at base (default http://localhost:8812). English page values + a de/vi decimal-comma pass.
const {chromium}=require('/workspace/deskkit/node_modules/playwright-core');
const base=process.argv[2]||'http://localhost:8812';
let bad=0,n=0;function ok(c,m){n++;if(!c){bad++;console.log('FAIL',m)}}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const go=async(s,m,lp)=>{await p.goto(`${base}/${lp||''}${s}/?evtest=1`);await p.evaluate(m=>{localStorage.setItem('pmu',m)},m);await p.reload();await p.waitForTimeout(150)};
const set=async(id,v)=>{await p.fill('#'+id,String(v));await p.waitForTimeout(25)};
const sel=async(id,v)=>{await p.selectOption('#'+id,String(v));await p.waitForTimeout(25)};
const chk=async(id,v)=>{await p.setChecked('#'+id,v);await p.waitForTimeout(25)};
const R=async()=>p.evaluate(()=>[...document.querySelectorAll('#r tr')].map(r=>r.cells[0].textContent+'='+(r.cells[1]?r.cells[1].textContent:'')).join(' | ')+' || '+(document.getElementById('warn').hidden?'':document.getElementById('warn').textContent));
const has=async(s,m)=>{const r=await R();ok(r.includes(s),m+' expected «'+s+'» got '+r)};
const not=async(s,m)=>{const r=await R();ok(!r.includes(s),m+' unexpected «'+s+'» got '+r)};
const W=async(o)=>{for(const[k,v] of Object.entries(o)){if(['vs','ph','cd','tt'].includes(k))await sel(k,v);else if(k=='ct')await chk(k,v);else await set(k,v)}};
// ---------- wire size (W)
await go('wire-size-calculator','0');
await W({vs:'120',ph:'1',cd:'cu',tt:'1',I:20,L:50,X:3,ct:false});
await has('Recommended wire size=10 AWG (5.26 mm²) · Copper','W2');await has('Governing check=Voltage drop','W2g');await has('2.49 V (2.07 %)','W2vd');await has('12 AWG (3.31 mm²): fails voltage drop, 3.95 V (3.29 %)','W2dn');await has('Next size up=8 AWG','W2up');
await W({vs:'240',cd:'al',I:40,L:100});await has('6 AWG (13.30 mm²) · Aluminum','W3');await has('6.46 V (2.69 %)','W3vd');await has('8 AWG (8.37 mm²): fails voltage drop, 10.27 V (4.28 %)','W3dn');
await W({vs:'480',ph:'3',cd:'cu',I:100,L:150});await has('3 AWG (26.66 mm²) · Copper','W4');await has('Governing check=Ampacity (NEC Table 310.16)','W4g');await has('6.37 V (1.33 %)','W4vd');
await W({cd:'al'});await has('1 AWG (42.41 mm²) · Aluminum','W4al');await has('6.58 V (1.37 %)','W4alvd');
await W({vs:'120',ph:'1',cd:'cu',I:25,L:10});await has('10 AWG','W5');await has('Small-conductor limit (NEC 240.4(D))','W5g');await has('fails the 240.4(D) limit (20 A)','W5dn');
await W({cd:'al',I:16,L:30});await has('10 AWG (5.26 mm²) · Aluminum','W5al');await has('1.96 V (1.63 %)','W5alvd');await has('240.4(D)','W5alg');
await W({cd:'cu',tt:'0',I:30,L:10});await has('10 AWG (5.26 mm²) · Copper','W6a');await has('30 A (60 °C column)','W6a2');
await W({I:55});await has('6 AWG (13.30 mm²) · Copper','W6b');await has('55 A (60 °C column)','W6b2');
await W({tt:'1'});await has('6 AWG (13.30 mm²) · Copper','W6c');await has('65 A (75 °C column)','W6c2');await has('8 AWG (8.37 mm²): fails ampacity (50 A)','W6c3');
await W({I:20,L:45.56});await has('12 AWG (3.31 mm²) · Copper','W7a');await has('(3.00 %)','W7a2');
await W({I:20,L:45.8});await has('Recommended wire size=10 AWG','W7b');
await W({I:20,L:10});await has('25 A (75 °C column) — max. overcurrent protection 20 A (NEC 240.4(D))','W10');
await W({I:600,L:10});await has('No size in this table','W8a');await W({I:200,L:1000});await has('No size in this table','W8b');
await W({I:16,L:10,ct:true});await has('Current used for sizing=20 A (125 % × 16 A)','W11');await chk('ct',false);
for(const[k,v] of [['I',0],['I',-5],['L',0],['X',0],['X',101],['I','abc']]){await W({I:20,L:50,X:3});await set(k,v);const r=await R();ok(!/NaN|Infinity/.test(r)&&r.includes('—'),'W12 '+k+'='+v+' '+r);}
await W({I:20,L:50,X:3});await sel('vs','c');await set('vc',0);ok((await R()).includes('—'),'W12 vc0');await set('vc',1e9);ok((await R()).includes('—'),'W12 vc1e9');await sel('vs','277');await sel('ph','3');await has('277 V is a line-to-neutral','W12-277');await sel('ph','1');
await p.click('.ub[data-u="1"]');await p.waitForTimeout(100);await W({vs:'230',cd:'cu',I:32,L:25,X:3});await has('Recommended wire size=4 mm² · Copper','W9');await has('6.88 V (2.99 %)','W9vd');await has('3.99 mm²','W9min');await has('2.5 mm²: 11.01 V (4.79 %)','W9dn');await has('IEC 60364-5-52','W9iec');await not('column','W9noamp');
ok(await p.isHidden('#tt'),'W9 temp hidden in metric');
// same numbers as voltage-drop page (W7)
await go('voltage-drop-calculator','0');await sel('vs','120');await sel('ph','1');await sel('cd','cu');await sel('ws','1');await set('L',45.56);await set('I',20);await has('3.00 %','W7 vd page');
// ---------- pool (PV)
await go('pool-volume-calculator','0');await sel('sh','re');await sel('dm','v');await W({L:32,W:16,DS:3,DD:8,Q:10});
await has('Pool volume (US gallons)=21,065','PV1');await has('Volume (ft³)=2,816','PV1b');await has('Volume (m³)=79.7','PV1c');await has('Volume (liters)=79,740','PV1d');await has('Fill time (hours)=35.1','PV5');await has('35:07','PV5b');
await sel('sh','ci');await sel('dm','c');await W({D:24,DC:4,Q:''});await has('=13,536','PV2');await has('Volume (ft³)=1,810','PV2b');await has('51.2','PV2c');
await sel('sh','ov');await W({L:30,W:15,DC:4});await has('=10,575','PV4');
for(const[k,v] of [['L',0],['W',-3],['DC',0]]){await W({L:30,W:15,DC:4});await set(k,v);const r=await R();ok(!/NaN|Infinity/.test(r)&&r.includes('—'),'PV6 '+k+v)}
await W({L:30,W:15,DC:4,Q:0});ok((await R()).includes('—'),'PV5 flow 0');await set('Q','');
await sel('dm','v');await W({DS:8,DD:3});await has('Average depth=5.5','PV6 deep<shallow');await W({DS:3,DD:40});await has('unusually large','PV6 warn');await set('L','1e9');ok((await R()).includes('—'),'PV6 1e9');
await go('pool-volume-calculator','1');await sel('sh','re');await sel('dm','v');await W({L:8,W:4,DS:1.2,DD:1.8,Q:30});await has('Pool volume (liters)=48,000','PV3');await has('=12,680','PV3b');await has('26:40','PV5m');
// ---------- BTU (B)
await go('btu-calculator','0');await W({A:320,P:3});await sel('sun','su');await chk('kit',false);await has('9,400 BTU/h','B1');await has('Tons of cooling=0.78','B1t');await has('2.75 kW','B1k');
await W({A:400,P:2});await sel('sun','sh');await chk('kit',true);await has('Cooling capacity (BTU/h)=12,100','B2');await has('=1.01','B2t');await has('3.55 kW','B2k');await chk('kit',false);await sel('sun','n');
for(const[a,e] of [[150,'5,000'],[150.1,'6,000'],[300,'7,000'],[300.1,'8,000'],[2500,'34,000']]){await set('A',a);await has('Cooling capacity (BTU/h)='+e,'B3 '+a)}
await set('A',99);await has('=5,000 BTU/h','B4a');await has('Under 100 ft²','B4a2');await set('A',2501);await has('Manual J','B4b');await not('34,000','B4b2');
await set('A',320);for(const[pp,e] of [[0,'8,000'],[1,'8,000'],[2,'8,000'],[5,'9,800']]){await set('P',pp);await has('Cooling capacity (BTU/h)='+e,'B6 '+pp)}
await set('P',-1);ok((await R()).includes('—'),'B6 neg');await set('P',2.5);ok((await R()).includes('—'),'B6 frac');
await go('btu-calculator','1');await W({A:30,P:2});await sel('sun','n');await has('Cooling capacity (kW)=2.34 kW','B5');await has('8,000 BTU/h','B5b');await set('A',13.9);await has('=5,000 BTU/h','B5c');await set('A',14);await has('=6,000 BTU/h','B5d');
// ---------- studs (ST)
await go('stud-calculator','0');await sel('sp','16');await sel('bl','12');await W({L:12,H:8,O:1,C:0,EO:2,EC:2,PL:3,X:10});await has('Studs to buy (incl. waste)=14','ST1');await has('Plate length=36 ft','ST1b');await has('=3','ST1c');
await W({L:10,O:0,X:0});await has('Studs to buy (incl. waste)=9','ST2');
await sel('sp','24');await sel('bl','8');await W({L:20,O:2,C:2,X:10});await has('Studs to buy (incl. waste)=21','ST3');await has('Plate boards (8 ft)=8','ST3b');
await W({O:1,C:0,EO:4,L:12,X:0});await sel('sp','16');await has('Studs before waste=14','ST5');await W({EO:2});
await sel('sp','12');await W({L:49,O:0,C:0,X:10});await has('Studs to buy (incl. waste)=55','ST7');
await sel('sp','16');await W({L:1,X:0});await has('Studs to buy (incl. waste)=2','ST8');
for(const[k,v] of [['L',0],['L',-1],['X',-1],['X',101],['O',1.5]]){await W({L:12,O:1,X:10});await set(k,v);ok((await R()).includes('—'),'ST9 '+k+v)}
await W({L:12,O:1,X:10,H:8});await has('91.5 in','ST10');
await sel('sp','c');await set('spc',0);ok((await R()).includes('—'),'ST9 spc0');await sel('sp','16');
await go('stud-calculator','1');await sel('spm','400');await sel('blm','4.8');await W({L:3.6,O:0,C:0,X:10,PL:3});await has('Studs to buy (incl. waste)=11','ST4');await has('Plate length=10.8 m','ST4b');await has('Plate boards (4.8 m)=3','ST4c');
await W({L:1.2,X:0});await has('Studs to buy (incl. waste)=4','ST6');await sel('spm','300');await W({L:0.9});await has('Studs to buy (incl. waste)=4','ST6b');
// ---------- rebar (R)
await go('rebar-calculator','0');await sel('bu','4');await sel('st','20');await W({L:10,W:10,S:12,CV:3});
await has('Total bars=22','R1');await has('11 × 9.5 ft','R1b');await has('Total length (ft)=209','R1c');await has('Weight (lb)=139.6','R1d');await has('Weight (kg)=63.3','R1e');await has('Stock bars to buy=11 × 20 ft','R1f');
ok(await p.inputValue('#LP')=='20','R7 lap #4=20');await sel('bu','5');ok(await p.inputValue('#LP')=='25','R7 lap #5=25');await has('Weight (lb)=218','R6 #5');await sel('bu','3');await has('Weight (lb)=78.6','R6 #3');await sel('bu','6');await has('Weight (lb)=313.9','R6 #6');await sel('bu','4');
await W({L:30,W:10});await has('11 × 31.17 ft (1 × lap)','R4');await has('31 × 9.5 ft','R4b');await has('Stock bars to buy=38','R4c');await has('Weight (lb)=425.7','R4d');
await W({L:10,W:10,CV:60});ok((await R()).includes('—'),'R8 cover');await W({CV:3,S:0});ok((await R()).includes('—'),'R8 s0');await W({S:200});await has('Total bars=4','R8 s>side');
await W({S:12});await sel('st','c');await set('stc',0);ok((await R()).includes('—'),'R12 stock0');await set('stc',1);ok((await R()).includes('—'),'R8 stock<lap');await sel('st','20');
await set('LP',30);await sel('bu','5');ok(await p.inputValue('#LP')=='30','R7 edited lap kept');
await go('rebar-calculator','1');await sel('bm','12');await sel('stm','12');await W({L:6,W:4,S:300,CV:75});
await has('14 × 5.85 m','R2a');await has('21 × 3.85 m','R2b');await has('Total length (m)=162.75','R2c');await has('Weight (kg)=144.7','R2d');await has('Stock bars to buy=14 × 12 m','R2e');ok(await p.inputValue('#LP')=='480','R7 metric lap');
await sel('stm','6');await has('Stock bars to buy=35 × 6 m','R2f');await sel('stm','12');
await W({L:4.75,W:4.75,S:200,CV:75});await has('Total bars=48','R5');
await sel('bm','10');await W({L:6,W:4,S:300,CV:75});await has('Weight (kg)=100.5','R6 10mm');
// ---------- decimal comma locales (W13/PV3/B5/R10) — only if translated pages exist
for(const lp of ['de/','vi/']){const r=await p.goto(`${base}/${lp}wire-size-calculator/?evtest=1`);if(!r||r.status()!=200){console.log('skip',lp);continue}
 await go('wire-size-calculator','0',lp);await W({vs:'120',ph:'1',cd:'cu',tt:'1',I:'16,5',L:50,X:'2,5'});const t=await R();ok(/10 AWG/.test(t)&&!t.split('||')[0].split(' | ').some(x=>/=\s*—\s*$/.test(x)),'W13 '+lp+t);
 await go('pool-volume-calculator','1',lp);await sel('sh','re');await sel('dm','v');await W({L:8,W:4,DS:'1,2',DD:'1,8',Q:''});ok((await R()).includes('48.000'),'PV3 '+lp+(await R()));
 await go('btu-calculator','1',lp);await W({A:'13,9',P:2});await sel('sun','n');ok((await R()).includes('5.000'),'B5 '+lp+(await R()));
 await go('rebar-calculator','1',lp);await sel('bm','12');await sel('stm','12');await W({L:6,W:4,S:'300',CV:'75'});ok((await R()).includes('144,7'),'R10 '+lp+(await R()));}
// ---------- round 2 regressions (Tester 11/11 vòng 1)
await go('wire-size-calculator','1');await W({vs:'230',ph:'1',cd:'al',I:10,L:10,X:3});await has('2.5 mm² · Aluminum','T11-16 Al metric min');await not('1.5 mm² · Aluminum','T11-16 no 1.5 Al');await has('Minimum 2.5 mm² for aluminum conductors (IEC 60364-5-52, Table 52.2).','T11-16 note');
{const r=await R();ok(!/Next size down=1\.5 mm²/.test(r),'T11-16 next size down not below 2.5 '+r)}
await W({cd:'cu'});await has('1.5 mm² · Copper','T11-16 Cu metric 1.5 kept');await not('Minimum 2.5 mm²','T11-16 no note for Cu');
await go('wire-size-calculator','0');await W({vs:'120',ph:'1',cd:'al',tt:'1',I:10,L:10,X:3});await not('1.5 mm²','T11-16 US Al unchanged');await not('Minimum 2.5','T11-16 US no note');
await go('wire-size-calculator','0','vi/');await W({vs:'120',ph:'1',cd:'cu',tt:'1',I:20,L:10,X:3});await has('(cột 75 °C)','T11-06 vi');
await go('wire-size-calculator','0','it/');await W({vs:'120',ph:'1',cd:'cu',tt:'0',I:20,L:10,X:3});await has('(colonna 60 °C)','T11-06 it');
await go('wire-size-calculator','1','vi/');await W({vs:'230',ph:'1',cd:'al',I:10,L:10,X:3});await has('Tối thiểu 2,5 mm² cho nhôm theo IEC 60364-5-52 (Bảng 52.2).','T11-16 vi note');
await go('btu-calculator','1','vi/');await W({A:'5',P:2});await sel('sun','n');{const r=await R();ok(r.includes('9,3 m² (100 ft²)')&&r.includes('5.000 BTU/h')&&!/5,000|9\.3/.test(r),'T11-04 vi metric '+r)}
await go('btu-calculator','0','de/');await W({A:'3000',P:2});{const r=await R();ok(r.includes('2.500 ft² (232 m²)')&&!r.includes('2,500'),'T11-04 de US '+r)}
await go('btu-calculator','1','de/');await W({A:'300',P:2});{const r=await R();ok(r.includes('232 m² (2.500 ft²)'),'T11-04 de metric '+r)}
await go('btu-calculator','0');await W({A:'50',P:2});await has('Under 100 ft² (9.3 m²)','T11-04 en unchanged');
await go('rebar-calculator','1','vi/');await sel('bm','12');await sel('stm','12');await W({L:6,W:4,S:'0,3',CV:'7,5'});{const r=await R();ok(/Kiểm tra khoảng cách cốt thép: 0,3 mm/.test(r)&&/Kiểm tra lớp bảo vệ cạnh: 7,5 mm/.test(r),'T11-17 vi warn '+r)}
await go('rebar-calculator','1');await sel('bm','12');await sel('stm','12');await W({L:6,W:4,S:300,CV:75});await not('Check the','T11-17 no warn normal');
await go('rebar-calculator','0');await sel('bu','4');await sel('st','20');await W({L:10,W:10,S:1,CV:0.25});await has('Check the bar spacing: 1 in','T11-17 US spacing');await has('Check the edge cover: 0.25 in','T11-17 US cover');
await go('stud-calculator','1','vi/');for(const v of ["12'",'12"']){await set('L',v);await p.waitForTimeout(80);ok(await p.$eval('#L',e=>e.getAttribute('aria-invalid'))==='true','T11-18 reject '+v)}
for(const [pg,fld] of [['stud-calculator','L'],['rebar-calculator','S'],['wire-size-calculator','L']]){await go(pg,'0');for(const v of ["12'6","1'2","1'200'5","12'","12\"","12′","'12","1’200","1''200","12' 6\"","5'6\"","1'20","12'000'","1'2000"]){await set(fld,v);await p.waitForTimeout(60);ok(await p.$eval('#'+fld,e=>e.getAttribute('aria-invalid'))==='true','T11-18 reject '+pg+' '+JSON.stringify(v))}}
await go('stud-calculator','0');await sel('sp','16');await sel('bl','12');await W({L:"1'200",H:8,O:1,C:0,EO:2,EC:2,PL:3,X:10});{const r=await R();await set('L','1200');const r2=await R();ok(r===r2&&await p.$eval('#L',e=>e.getAttribute('aria-invalid'))!=='true',"T11-18 1'200 == 1200")}
await go('stud-calculator','0');await set('L',"12'6");await p.waitForTimeout(60);{const r=await R();ok(!/Studs to buy \(incl\. waste\)=\d/.test(r.split('||')[0])||/—/.test(r),"T11-18 no result for 12'6 "+r)}
await go('stud-calculator','0','de/');await set('L',"1'200");await p.waitForTimeout(80);ok(await p.$eval('#L',e=>e.getAttribute('aria-invalid'))!=='true','T11-18 1\'200 still accepted as thousands');
await go('wire-size-calculator','0');{const h=await p.$$eval('a[href]',a=>a.filter(x=>x.origin===location.origin&&!x.hasAttribute('download')).map(x=>x.href));ok(h.length>5&&h.every(x=>/[?&]evtest=1/.test(x)),'T11-19 links keep evtest '+h.filter(x=>!/evtest/.test(x)).slice(0,3))}
await p.goto(base+'/wire-size-calculator/');{const h=await p.$$eval('a[href^="/"]',a=>a.map(x=>x.getAttribute('href')));ok(h.every(x=>!/evtest/.test(x)),'T11-19 no evtest without flag')}
await p.setViewportSize({width:1440,height:900});for(const u of ['pool-volume-calculator','btu-calculator','voltage-drop-calculator']){await p.goto(base+'/'+u+'/');const w=await p.evaluate(()=>{const r=e=>{const x=e.getBoundingClientRect();return Math.round(x.left)+'/'+Math.round(x.right)};return [r(document.querySelector('section.faq')),r(document.querySelector('.guide'))]});ok(w[0]===w[1],'T11-14 faq width '+u+' '+w)}
await p.setViewportSize({width:390,height:844});
ok(errs.length==0,'js errors '+errs.join(';'));
console.log(bad?'FAILED':'ALL OK',n-bad+'/'+n);await b.close();process.exit(bad?1:0)})();
