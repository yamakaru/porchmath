"""Every 'metric (US)' pair on every localized page (both modes are in static HTML) must agree within ±3%."""
import os,re,sys
from bs4 import BeautifulSoup
import metricize as M
L=['es','pt','fr','de','it','id','vi','ja']
F={('m²','sq ft'):0.092903,('m³','cu ft'):0.0283168,('m³','cu yd'):0.764555,('kg','lb'):0.45359,('L','gal'):3.78541,('m','ft'):0.3048,('cm','in'):2.54,('mm','in'):25.4,('cm²','sq in'):6.4516,('t','tons'):0.907185}
N=r'(?:\d{1,3}(?:[,.\u202f\u00a0 ]\d{3})+(?![\d]|[.,]\d)|\d+(?:[.,]\d+)?[⅛¼⅜½⅝¾⅞]?|[⅛¼⅜½⅝¾⅞])'
G=rf'{N}(?:\s*[–〜~×x-]\s*{N})*'
PAT=re.compile(rf'({G})\s*(m²|m³|kg|L|mm|cm²|cm|m|t)\s*[(（]\s*≈?\s*({G})\s*(sq ft|cu ft|cu yd|lb|gal|ft|in|sq in|tons)\s*[)）]')
bad=[];n=0
for l in L:
    for r,_,fs in os.walk(f'dist/{l}'):
        if 'index.html' not in fs:continue
        p=os.path.join(r,'index.html');M.ENTH.clear();M.ENTH.update(x.replace(',','') for x in M.entho(p,l))
        s=BeautifulSoup(open(p,encoding='utf-8'),'html.parser')
        for x in s(['script','style','head']):x.decompose()
        for m in PAT.finditer(s.get_text(' ')):
            f=F.get((m.group(2),m.group(4)))
            if not f:continue
            a=[M.val(v) for v in re.split(r'\s*[–〜~×x-]\s*',m.group(1))];b=[M.val(v) for v in re.split(r'\s*[–〜~×x-]\s*',m.group(3))]
            n+=1
            if len(a)!=len(b) or any(abs(x-y*f)>0.03*max(abs(y*f),1e-9)+0.051*(m.group(2) in('m','cm','m²','kg','L','t'))*0+ (0.5 if m.group(2) in('mm','cm','cm²','kg') and y*f<20 else 0) for x,y in zip(a,b)):
                bad.append((r,m.group(0)))
for b in bad:print(*b)
print(f'{n} pairs, {len(bad)} off by >3%');sys.exit(1 if bad else 0)
