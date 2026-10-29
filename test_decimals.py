"""Fail if any visible/hidden text (both unit modes are in static HTML) in comma locales has a dot decimal, or English spelled-out unit names."""
import os,re,sys
from bs4 import BeautifulSoup,Comment
L=['es','pt','fr','de','it','id','vi']
DOT=re.compile(r'(?<![\d.])(\d+)\.(\d+)(?!\d|[.,]\d)')
TH=set()
def thousands(m):return m.group(1)[0]!='0' and len(m.group(1))<=3 and len(m.group(2))==3 and (m.group(2)[-1]=='0' or m.group(1)+','+m.group(2) in TH)
UN=re.compile(r'\b(cubic|square)\s+(yards?|feet|foot|inch(es)?|met(re|er)s?)\b',re.I)
bad=[]
for l in L:
    for r,_,fs in os.walk(f'dist/{l}'):
        if 'index.html' not in fs:continue
        TH.clear();ep=os.path.join(r,'index.html').replace(f'dist/{l}/','dist/',1)
        if os.path.exists(ep):TH.update(re.findall(r'[1-9]\d{0,2}(?:,\d{3})+',open(ep,encoding='utf-8').read()))
        s=BeautifulSoup(open(os.path.join(r,'index.html'),encoding='utf-8'),'html.parser')
        for x in s(['script','style','head']):x.decompose()
        for t in s.find_all(string=True):
            if isinstance(t,Comment):continue
            for m in DOT.finditer(t):
                if not thousands(m):bad.append((r,'dot',m.group(0),t.strip()[:60]))
            for m in UN.finditer(t):bad.append((r,'unit',m.group(0),t.strip()[:60]))
for b in bad:print(*b)
print(len(bad),'problems');sys.exit(1 if bad else 0)
