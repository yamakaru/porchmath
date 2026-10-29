// Regression: concrete bag counts always round up, using the per-bag volume shown in the label
const {chromium}=require('/workspace/deskkit/node_modules/playwright-core');
const B=process.argv[2]||'http://localhost:8812';let f=0,n=0;const ok=(c,m)=>{n++;if(!c){f++;console.log('FAIL',m)}};
(async()=>{const br=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const l of ['de','vi','fr','en']){const p=await br.newPage();await p.goto(`${B}/${l=='en'?'':l+'/'}concrete-calculator/`);await p.waitForTimeout(400);
 const P=s=>+s.replace(/[^\d.,]/g,'').replace(l=='en'?/,/g:/\./g,'').replace(',','.');
 for(const mode of (l=='en'?[0]:[1,0])){await p.click(`.ub[data-u="${mode}"]`);await p.waitForTimeout(150);
 for(const [L,W,T,X] of [[3,3,10,10],[4,2.32,10,10],[2,2.32,10,10],[5,4,12,0],[1.7,1.3,8,5]]){
  const tv=mode?[L,W,T,X]:[L*3.28084,W*3.28084,T/2.54,X];
  for(const [id,v] of [['L',tv[0]],['W',tv[1]],['T',tv[2]],['X',tv[3]]]){await p.fill('#'+id,String(+v.toFixed(3)).replace('.',l=='en'?'.':','))}
  await p.dispatchEvent('#X','input');await p.waitForTimeout(100);
  const rows=await p.$$eval('#r tr',t=>t.map(r=>[r.cells[0].innerText,r.cells[1].innerText]));
  const vals=await p.$$eval('.calc input',a=>a.map(e=>e.value));const [a,b,c,x]=vals.map(P);
  if(mode){const m3=a*b*(c/100)*(1+x/100);for(const [lab,v] of rows.slice(2)){const y=P(lab.match(/\d+[.,]\d+(?= m³)/)[0]);ok(P(v)==Math.ceil(+(m3/y).toFixed(6)),`${l} ${vals} ${lab} ${v} vs ${m3}/${y}`)}}
  else{const cf=a*b*(c/12)*(1+x/100);rows.slice(2).forEach(([lab,v],j)=>ok(P(v)==Math.ceil(+(cf/[0.6,0.45,0.3][j]).toFixed(6)),`${l} US ${lab} ${v}`))}}}
 await p.close()}
await br.close();console.log(f?`${f}/${n} concrete failures`:`concrete: all ${n} pass`);process.exit(f?1:0)})();
