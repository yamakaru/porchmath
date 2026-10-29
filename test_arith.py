"""In-text arithmetic on every page/locale: 'a × b m (c m²)' and 'a × b × c = d' must agree with the stated result (±2%)."""
import os,re,sys
from bs4 import BeautifulSoup
import metricize as M
L=['','es','pt','fr','de','it','id','vi','ja']
NUM=r'(?:\d{1,3}(?:[.,\u202f\u00a0]\d{3})+(?![\d]|[.,]\d)|\d+(?:[.,]\d+)?)'
U={'mm':0.001,'cm':0.01,'m':1,'m²':1,'m³':1,'kg':1,'L':1,'t':1}
TERM=rf'({NUM})\s*(mm|cm|m²|m³|m|kg|L|t)?(?![A-Za-z²³])'
CH=re.compile(rf'(?<![\d.,/])(?<![×÷=+−] )(?<![×÷=+−])({NUM}\s*(?:mm|cm|m²|m³|m|kg|L)?(?:\s*[×÷]\s*{NUM}\s*(?:mm|cm|m²|m³|m|kg|L)?)+)\s*(?:=|≈)\s*({NUM})\s*(mm|cm|m²|m³|m|kg|L|t)?(?![A-Za-z²³\d])(?![^。、;；=]{{0,8}}あたり)')
DIM=re.compile(rf'(?<![\d.,/])({NUM})\s*×\s*({NUM})\s*m\s*[(（]\s*({NUM})\s*m²')
bad=[];n=0
def ev(expr):
    toks=re.findall(rf'([×÷])?\s*{TERM}',expr);v=None;units=[]
    for op,num,u in toks:
        x=M.val(num)*(U.get(u,1) if u in('mm','cm') else 1);units.append(u)
        v=x if v is None else (v*x if op!='÷' else v/x)
    return v,units
for l in L:
    for r,_,fs in os.walk(f'dist/{l}' if l else 'dist'):
        if l=='' and any(r.startswith(f'dist/{x}') for x in L if x):continue
        if 'index.html' not in fs:continue
        p=os.path.join(r,'index.html');M.ENTH.clear()
        if l:M.ENTH.update(x.replace(',','') for x in M.entho(p,l))
        s=BeautifulSoup(open(p,encoding='utf-8'),'html.parser')
        for x in s(['script','style','head']):x.decompose()
        T=re.sub(r'\s*[(（][^()（）]*[)）]','',s.get_text(' '))  # drop bracketed equivalents
        T0=s.get_text(' ')
        for m in DIM.finditer(T0):
            n+=1;a,b,c=(M.val(x) for x in m.groups())
            if abs(a*b-c)>0.02*c+0.006: bad.append((r,m.group(0)))
        for m in CH.finditer(T):
            v,us=ev(m.group(1));res=M.val(m.group(2));ru=m.group(3)
            if any(u for u in us) and not ru: continue
            if ru in('mm','cm') and any(u in('mm','cm','m','m²','m³') for u in us): res*=U[ru]
            n+=1
            if v is not None and not ru and res==int(v) and v>=res and '÷' in m.group(1): pass  # whole-number floor (e.g. strips per roll)
            elif v is None or abs(v-res)>0.02*abs(res)+0.006*(1 if ru else 0)+ (0.5 if not ru and res>=10 else 0): bad.append((r,m.group(0)))
for b in bad:print(*b)
print(f'{n} expressions, {len(bad)} wrong');sys.exit(1 if bad else 0)
