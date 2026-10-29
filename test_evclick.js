// Round 14: clicking a search result keeps ?evtest=1 (en/de/vi)
const {chromium}=require('/workspace/deskkit/node_modules/playwright-core');
const base=process.argv[2]||'http://localhost:8812';
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});let bad=0;
for(const l of ['','de/','vi/','ja/']){const p=await b.newPage();await p.goto(base+'/'+l+'?evtest=1');await p.fill('#q','mulch');await p.waitForTimeout(400);
const a=p.locator('a[href*="mulch"]:visible').first();await Promise.all([p.waitForNavigation(),a.click()]);
const u=p.url();const ok=/evtest=1/.test(u);if(!ok)bad++;console.log(l||'en',ok?'OK':'FAIL',u);await p.close();}
await b.close();console.log(bad?'FAIL':'evclick: all pass');process.exit(bad?1:0)})();
