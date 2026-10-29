// In metric mode, no imperial unit may appear in calculator labels/results outside brackets.
const {chromium}=require('/workspace/deskkit/node_modules/playwright-core');
const base=process.argv[2]||'http://localhost:8812';
const NOM=['roofing','deck-board','stair','square-footage','cubic-yard','board-foot'];
const fs=require('fs');const L=['','es/','pt/','fr/','de/','it/','id/','vi/','ja/'];
const calcs=fs.readdirSync(__dirname+'/dist').filter(s=>s.endsWith('-calculator')&&!NOM.some(n=>s==n+'-calculator'));
const IMP=/(^|[^A-Za-z])(sq ?ft|sq ?in|cu ?ft|cu ?yd|cu ?in|ft|in|lb|lbs|gal|gallons?|galon|inci|yd)(?![A-Za-z])/;
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();let bad=0,n=0;
for(const l of L)for(const c of calcs){await p.goto(`${base}/${l}${c}/`);
 const ok=await p.evaluate(()=>{const bs=[...document.querySelectorAll('button')].filter(x=>/metr|mét|メートル/i.test(x.innerText));if(!bs.length)return false;bs[0].click();return true});
 if(!ok){console.log('NO TOGGLE',l+c);bad++;continue}
 await p.waitForTimeout(150);
 const txt=await p.evaluate(()=>[...document.querySelectorAll('label'),...document.querySelectorAll('#r td, #r th'),...document.querySelectorAll('select option')].filter(e=>e.offsetParent!==null||e.tagName=='OPTION').map(e=>e.innerText.trim()));
 for(const t of txt){n++;const MET=/(m²|m³|cm³|cm|mm|kg|\bL\b|\bm\b|\bt\b)/;const s=t.replace(/[(（][^()（）]*[)）]/g,x=>MET.test(t.replace(x,''))?'':x);if(l!=='' ? IMP.test(s.replace(/\b(in|a|to)\b(?=\s+\D)/g,'')) : IMP.test(s.replace(/\bin\b(?= [a-z])/g,''))){console.log('IMPERIAL',l+c,JSON.stringify(t));bad++}}}
console.log(`${n} strings, ${bad} problems`);await b.close();process.exit(bad?1:0)})();
