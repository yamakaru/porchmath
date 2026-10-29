# Shared calculator runtime (parser, field errors, locale formatting, US/metric) used by render.py.
import json,re
NOMETRIC={"paint-calculator","insulation-calculator","roofing-calculator","deck-board-calculator","stair-calculator","square-footage-calculator","cubic-yard-calculator","board-foot-calculator"}
IN_RULES=[("(sq ft)","(m²)",10.7639),("(sq ft, ","(m², ",10.7639),("Sq ft per","m² per",10.7639),("(tons per cu yd)","(t per m³)",0.842777),("(lb per cu ft)","(kg per m³)",1/16.0185),("(lb per 1,000 sq ft)","(kg per 100 m²)",2.0482),("(cu ft)","(L)",1/28.3168),("(ft)","(m)",3.28084),("(in)","(cm)",1/2.54),("(in, ","(cm, ",1/2.54)]
def in_unit(label):
    for a,b,f in IN_RULES:
        if a in label: return label.replace(a,b),f
    if re.search(r"\b(ft|in|sq|cu|lb|gal|gallon|tons?)\b",label.replace("80 lb","")): raise ValueError("unhandled unit: "+label)
    return None,None
def out_unit(label):
    L=label
    if L=="Cubic feet": return ["Liters",28.3168,0]
    if L=="Cubic yards": return ["Cubic meters",0.764555,2]
    if L.startswith("Tons"): return [L.replace("Tons","Metric tons"),0.907185,2]
    if L=="Linear feet of baseboard": return ["Meters of baseboard",0.3048,1]
    if L=="Incl. waste": return ["Incl. waste (m)",0.3048,1]
    if L=="Area incl. waste": return ["Area incl. waste (m²)",0.092903,1]
    if L=="Grout volume (cu in)": return ["Grout volume (cm³)",16.3871,0]
    if L.startswith("Grout (lb"): return ["Grout (kg, approx.)",0.453592,1]
    if L=="Grass seed (lb)": return ["Grass seed (kg)",0.453592,1]
    if L.endswith(" per sq ft"): return [L.replace(" per sq ft"," per m²"),10.7639,None]
    if "(sq ft)" in L: return [L.replace("(sq ft)","(m²)"),0.092903,None]
    if "(cu yd)" in L: return [L.replace("(cu yd)","(m³)"),0.764555,2]
    return None
def labels_of(js):
    # static row labels in return order; dynamic labels ("'Pieces of '+K") yield their prefix
    m=re.search(r"return \[(\[.*\])\];?\s*$",js,re.S)
    return [x.group(1) or x.group(2) for x in re.finditer(r"\['([^']*)'(?:,|\+)|\[([^'\[\]]*?)\+",m.group(1))] if m else []
def build(k,v):
    ids=[i for i,_,_ in v['f']]
    metric=k not in NOMETRIC
    MU={};ML={}
    if metric:
        for i,l,_ in v['f']:
            ml,f=in_unit(l)
            if ml: MU[i]=f;ML[i]=ml
    if k=="brick-calculator" and metric:
        for i in "BCJ": MU[i]=1/25.4;ML[i]=ML[i].replace("(cm)","(mm)")
        MU["M"]=36.2874/50;ML["M"]="Bricks per 50 kg mortar bag"
    rows=labels_of(v['js'])
    MO=[]
    if metric:
        for r in rows:
            if r=="Pieces of ": MO.append(["Pieces",1,0])
            elif r=="80 lb mortar bags" and k=="brick-calculator": MO.append(["50 kg mortar bags",None,0,"M"])
            elif k=="concrete-calculator" and re.match(r"(80|60|40) lb bags \(", r):
                kg={"80":50,"60":40,"40":25}[r.split()[0]];MO.append([f"{kg} kg bags (≈{kg*0.6/36.2874/35.3147:.3f} m³ each)",None,0,None,kg*0.6/36.2874])
            else: MO.append(out_unit(r))
    inputs="".join(f"<div class='f'><label for='{i}'>"+(f"<span class='us'>{l}</span><span class='mt'>{ML[i]}</span>" if i in ML else l)+f"</label><input id='{i}' type='text' inputmode='decimal' autocomplete='off' spellcheck='false' value='{d}' aria-describedby='{i}-e'><span class='fe' id='{i}-e'></span></div>" for i,l,d in v['f'])
    toggle=("<div class='units' role='group' aria-label='Units'><button type='button' class='ub' data-u='0' aria-pressed='true'>US (ft, in)</button><button type='button' class='ub' data-u='1' aria-pressed='false'>Metric (m, cm)</button></div>") if MU else ""
    if k=="brick-calculator":
        toggle+=("<div class='f'><label for='bp'>Brick size preset</label><select id='bp'><option value=''>Custom size</option>"
          "<option value='220,60,10'>Vietnam standard brick 220×105×60 mm</option><option value='180,80,10'>Vietnam 4-hole tuynel brick 180×80×80 mm</option>"
          "<option value='215,65,10'>Metric brick 215×102.5×65 mm</option><option value='390,190,10'>Concrete block 390×190×190 mm</option>"
          "<option value='193.675,57.15,9.525'>US modular brick 7⅝×2¼ in</option></select></div>")
    em="var EM={E:'Enter a number',N:'Not a valid number',A:'Unclear number. Write decimals like this:',G:'Must be 0 or more',B:'Number too large'};"
    js=("function U(x){return Math.ceil(+(+x).toFixed(6))}"
        "var RAW={},LOC=((typeof document!='undefined'&&document.documentElement&&document.documentElement.lang)||'en'),OV=0,MT=0,BAD=0,"
        "MU="+json.dumps(MU)+",MO="+json.dumps(MO)+",ROWS="+json.dumps(len(rows))+";"+em+
        "function NF(d,g,mx){return new Intl.NumberFormat(LOC,{minimumFractionDigits:d,maximumFractionDigits:mx==null?d:mx,useGrouping:g!==false})}"
        "var DEC=(function(){try{var p=NF(1).formatToParts(1.5);for(var j=0;j<p.length;j++)if(p[j].type=='decimal')return p[j].value}catch(e){}return '.'})();"
        "function Z(a,b){if(b<a)OV=1;return Math.max(a,b)}"
        "function pnum(s){s=String(s==null?'':s).replace(/[\\s\\u00a0\\u202f\\x27]/g,'');if(!s)return 'E';if(/^[-+]?\\d+(\\.\\d+)?e[-+]?\\d+$/i.test(s))return +s;if(!/^[-+]?[\\d.,]+$/.test(s)||!/\\d/.test(s))return 'N';"
        "var sg=s.charAt(0)=='-'?-1:1;s=s.replace(/^[-+]/,'');var c=s.split(',').length-1,d=s.split('.').length-1,v;"
        "function grp(x,sp){return new RegExp('^\\\\d{1,3}(\\\\'+sp+'\\\\d{3})+$').test(x)}"
        "if(c&&d){var di=Math.max(s.lastIndexOf(','),s.lastIndexOf('.')),ds=s.charAt(di),gs=ds==','?'.':',',ip=s.slice(0,di),fp=s.slice(di+1);if(!/^\\d+$/.test(fp)||ip.indexOf(ds)>=0||!grp(ip,gs))return 'N';v=+(ip.split(gs).join('')+'.'+fp)}"
        "else if(!c&&!d)v=+s;"
        "else{var sp=c?',':'.';if(c+d>1){if(!grp(s,sp))return 'N';v=+s.split(sp).join('')}"
        "else{var a=s.split(sp);if(!a[0]&&!a[1])return 'N';if(sp==DEC)v=+((a[0]||'0')+'.'+(a[1]||'0'));"
        "else if(/^\\d{3}$/.test(a[1])&&/^[1-9]\\d{0,2}$/.test(a[0])){if(sp==','&&/^(en|ja)/.test(LOC))v=+(a[0]+a[1]);else return 'A'}"
        "else v=+((a[0]||'0')+'.'+(a[1]||'0'))}}"
        "return isFinite(v)?sg*v:'N'}"
        "function FE(el,e){if(!el||!el.setAttribute)return;var s=document.getElementById(el.id+'-e');el.setAttribute('aria-invalid',e?'true':'false');if(s)s.textContent=e?(e=='A'?EM.A+' '+NF(1).format(1.5):EM[e]):''}"
        "function c(){OV=0;var EE,VV,ids="+json.dumps(ids)+",EE=[],VV={};ids.forEach(function(i){var el=document.getElementById(i),x=pnum(el.value),e='';if(typeof x=='string')e=x;else if(x<0)e='G';else if(x>1e12)e='B';RAW[i]=x;if(!e&&MT&&MU[i])x=x*MU[i];VV[i]=x;EE.push(e);FE(el,e)});"
        "BAD=EE.some(Boolean);if(BAD)return [[EE.every(function(e){return !e||e=='G'})?'Please enter non-negative numbers':'Please check the highlighted fields','—']];"
        "var "+",".join(f"{i}=VV.{i}" for i in ids)+";"
        "var RES=(function(){"+v['js'].replace('Math.ceil(','U(').replace('Math.max(0,','Z(0,')+"})();"
        "if(OV){BAD=1;return [['Deductions (doors, windows or openings) are larger than the area','—']]}"
        "return RES.map(function(x){var s=String(x[1]);return [x[0],/NaN|Infinity/.test(s)?'—':x[1]]})}"
        "function FM(x,m){var s=String(x),r=s.match(/^(\\$?)(-?\\d+(?:\\.(\\d+))?(?:e[-+]\\d+)?)(.*)$/);if(!r)return s;var n=+r[2],d=r[3]?r[3].length:0;if(/e/i.test(r[2]))d=0;if(m){n=n*m[1];if(m[2]!=null)d=m[2]}return r[1]+NF(d).format(n)+r[4]}"
        "function CV(o,j,m){var x=o[j];return m&&m[3]?NF(0).format(Math.ceil(+(o[0][1]/RAW[m[3]]).toFixed(6))):m&&m[4]?NF(0).format(Math.ceil(+(o[0][1]/m[4]).toFixed(6))):FM(x[1],m)}"
        "function run(){var u=arguments[0],o=c(),T=document.getElementById('r');T.innerHTML=o.map(function(x,j){var m=(MT&&!BAD&&MO[j])||null,val=CV(o,j,m);return '<tr><td>'+(m?m[0]:x[0])+'</td><td><b>'+val+'</b></td></tr>'}).join('');if(u&&!BAD&&window.MTrack)window.MTrack('calc')}"
        "function SV(el,x){el.value=NF(0,false,4).format(+(+x).toFixed(4))}"
        "function SW(el,m){var k=MU[el.id];if(!k)return;var s=el._pm||(el._pm={}),o=el.value,t;if(s.p===o&&s[m]!=null)t=s[m];else{var x=pnum(o);if(typeof x!='number')return;el.value=o;SV(el,m?x/k:x*k);t=el.value}s[MT]=o;el.value=t;s.p=t}"
        "function SU(m){var f=document.querySelector('form.calc');if(m==MT)return;document.querySelectorAll('.calc input').forEach(function(el){SW(el,m)});MT=m;f.classList.toggle('m',!!m);document.body.classList.toggle('um',!!m);document.querySelectorAll('.ub').forEach(function(b){b.setAttribute('aria-pressed',String(+b.getAttribute('data-u')==m))});try{localStorage.setItem('pmu',m)}catch(e){}run()}"
        "document.querySelectorAll('.calc input').forEach(function(el){SV(el,el.value);el.addEventListener('input',function(){run(1)})});"
        "document.querySelectorAll('.ub').forEach(function(b){b.addEventListener('click',function(){SU(+b.getAttribute('data-u'))})});"
        "var bp=document.getElementById('bp');function BP(v){if(!v)return;var a=v.split(',');['B','C','J'].forEach(function(i,j){var el=document.getElementById(i),mm=+a[j];SV(el,MT?mm/25.4:mm);var ot=el.value;SV(el,MT?mm:mm/25.4);el._pm={p:el.value};el._pm[MT?0:1]=ot;el._pm[MT]=el.value});run()}function BSZ(){var f=function(i){var e=document.getElementById(i);return Math.round((+e.value||0)*(MT?1:25.4)*10)/10};document.querySelectorAll('.bsz').forEach(function(x){x.textContent=f('B')+' × '+f('C')});document.querySelectorAll('.bjt').forEach(function(x){x.textContent=f('J')})}var rt=document.getElementById('r');if(rt&&document.querySelector('.bsz'))new MutationObserver(BSZ).observe(rt,{childList:true,subtree:true,characterData:true});if(bp){bp.addEventListener('change',function(){BP(bp.value)});document.querySelectorAll('#B,#C,#J').forEach(function(el){el.addEventListener('input',function(){bp.value=''})})}"
        "var CPT={ok:'Copied',no:'Could not copy. Select the results and copy manually.'};"
        "function CPY(t,ok,no){function fb(){var a=document.createElement('textarea'),r=false;a.value=t;a.setAttribute('readonly','');a.style.position='fixed';a.style.top='0';a.style.opacity='0';document.body.appendChild(a);a.select();try{r=document.execCommand('copy')}catch(e){}document.body.removeChild(a);if(r)ok();else no()}if(navigator.clipboard&&window.isSecureContext!==false)navigator.clipboard.writeText(t).then(ok,fb);else fb()}"
        "var cpb=document.getElementById('cp'),cpm=document.getElementById('cpm');if(cpb)cpb.addEventListener('click',function(){if(BAD)return;var t=document.querySelector('h1').textContent+'\\n'+[].map.call(document.querySelectorAll('#r tr'),function(r){return r.cells[0].textContent+': '+r.cells[1].textContent}).join('\\n');"
        "if(!cpb._o)cpb._o=cpb.textContent;function sh(ok){clearTimeout(cpb._t);cpb.textContent=ok?'✓ '+CPT.ok:cpb._o;cpb.classList.toggle('ok',ok);if(cpm){cpm.textContent=ok?CPT.ok:CPT.no;cpm.className=ok?'cpm':'cpm err'}if(!ok){var rg=document.createRange(),tb=document.getElementById('r');if(tb&&window.getSelection){rg.selectNodeContents(tb);var sl=window.getSelection();sl.removeAllRanges();sl.addRange(rg)}}cpb._t=setTimeout(function(){cpb.textContent=cpb._o;cpb.classList.remove('ok');if(cpm&&ok)cpm.textContent=''},ok?2000:6000)}"
        "CPY(t,function(){sh(true);if(window.MTrack)window.MTrack('copy')},function(){sh(false)})});"
        "if(!/^(en|ja)/.test(LOC)){var DC=function(){document.querySelectorAll('#r td,#r th,#bp option').forEach(function(e){var t=e.textContent,u=t.replace(/(\d)\.(\d)/g,'$1,$2');if(u!==t)e.textContent=u})};DC();var rr=document.getElementById('r');if(rr)new MutationObserver(DC).observe(rr,{childList:true,subtree:true,characterData:true})}run();if(Object.keys(MU).length){var st=null;try{st=localStorage.getItem('pmu')}catch(e){}SU(st!=null?+st:(/^en/.test(LOC)?0:1));if(bp&&(MT||/^vi/.test(LOC))){bp.value=/^vi/.test(LOC)?'220,60,10':'215,65,10';BP(bp.value)}}")
    return inputs,toggle,js
CSS=".ad,.mob-ad{display:none!important}.btn.sec{background:#fff!important;color:#0f766e!important;border:1px solid #0f766e!important;box-shadow:none!important}.cp{margin:10px 0 0;padding:8px 14px}.units{display:inline-flex;gap:0;margin:0 0 14px;padding:3px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:999px}.ub{border:0;background:transparent;color:#334155;border-radius:999px;padding:7px 14px;font:inherit;font-size:.92em;font-weight:600;cursor:pointer;min-height:36px;transition:background .15s,color .15s}.ub:hover{color:#0f766e}.ub:focus-visible{outline:2px solid #0f766e;outline-offset:2px}.ub[aria-pressed=true]{background:#0f766e;color:#fff;box-shadow:0 1px 3px rgba(15,118,110,.35)}.cp.ok{background:#ecfdf5!important;border-color:#059669!important;color:#047857!important}.cpm{display:block;min-height:1.2em;margin-top:6px;font-size:.9em;color:#047857}.cpm.err{color:#b91c1c}.calc .mt{display:none}.calc.m .mt,.um .mt{display:inline}.calc.m .us,.um .us{display:none}.fe{display:block;color:#b91c1c;font-size:.85em;min-height:0}.fe:empty{display:none}input[aria-invalid=true]{border-color:#b91c1c!important;outline-color:#b91c1c}"
