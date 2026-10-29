// Regression: brick note size, per-m2 in mm, 10 m2 default, one-version-per-mode
const {chromium}=require('/workspace/deskkit/node_modules/playwright-core');
const B=process.argv[2]||'http://localhost:8812';let f=0;const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m)}};
(async()=>{const br=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const l of ['vi','de','fr','en']){const p=await br.newPage();await p.goto(`${B}/${l=='en'?'':l+'/'}brick-calculator/`);await p.waitForTimeout(400);
 const rd=()=>p.evaluate(()=>({bsz:document.querySelector('.bsz').textContent,bjt:document.querySelector('.bjt').textContent,A:document.getElementById('A').value,rows:[...document.querySelectorAll('#r tr')].map(r=>r.innerText),
  vis:[...document.querySelectorAll('.us,.mt,.usb,.mtb,.usc,.mtc')].filter(e=>!e.closest('form')&&e.offsetParent!==null).map(e=>e.className)}));
 const sel=async v=>{await p.selectOption('#bp',v);await p.waitForTimeout(150)};
 const num=s=>+s.replace(/[^\d.,]/g,'').replace(l=='en'?/,/g:/\./g,'').replace(',','.');
 if(l!='en'){let r=await rd();ok(num(r.A)==10,l+' default area '+r.A);
  for(const [v,e] of [['180,80,10',58.48],['215,65,10',59.26],['390,190,10',12.5]]){await sel(v);r=await rd();const pm=num(r.rows[2].split('\t').pop());ok(Math.abs(pm-e)<.005,`${l} ${v} per m2 ${pm}`)}
  await sel('193.675,57.15,9.525');r=await rd();ok(/193[.,]7 × 57[.,]2/.test(r.bsz),l+' modular bsz '+r.bsz);
  await p.fill('#B','200,5');await p.dispatchEvent('#B','input');await p.waitForTimeout(150);r=await rd();ok(/^200[.,]5 ×/.test(r.bsz),l+' custom bsz '+r.bsz);
  ok(!r.vis.some(c=>/us/.test(c)),l+' metric shows US text '+r.vis)}
 await p.click('.ub[data-u="0"]');await p.waitForTimeout(150);let r=await rd();
 ok(!r.vis.some(c=>/^mt/.test(c)),l+' US mode shows metric text '+r.vis);ok(!/^0 × 0/.test(r.bsz),l+' US bsz '+r.bsz);await p.close()}
await br.close();console.log(f?f+' brick failures':'brick: all pass');process.exit(f?1:0)})();
