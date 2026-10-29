"""Fail if any visible text node on a localized page is identical to English source text (leftover English)."""
import os,re,sys
from bs4 import BeautifulSoup,Comment
LANGS=['es','pt','fr','de','it','id','vi','ja']
ALLOW=set(x.lower() for x in """PorchMath Quikrete Sakrete Behr Sherwin-Williams GAF Owens Corning USG Sheetrock Polyblend Mapei Modular Queen King Utility CMU OK Porch Math Mulch Drywall Grout Contact Email Nominal Mortar Asphalt aboutads.info Google Ads Settings""".split())
def texts(p):
    s=BeautifulSoup(open(p,encoding='utf-8'),'html.parser')
    for x in s(['script','style','noscript','svg','head']):x.decompose()
    for x in s.select('.lsw'):x.decompose()  # language names
    return [t.strip() for t in s.find_all(string=True) if not isinstance(t,Comment) and t.strip()]
def englishy(t):
    w=[x for x in re.findall(r"[A-Za-z][A-Za-z'-]+",t) if x.lower() not in ALLOW]
    if "@" in t or re.fullmatch(r"[\w.-]+\.[a-z]{2,}",t):return False
    return sum(len(x)>=3 for x in w)>=2 or any(len(x)>=5 for x in w)
en={}
for r,_,fs in os.walk('dist'):
    rel=os.path.relpath(r,'dist')
    if rel.split(os.sep)[0] in LANGS or 'index.html' not in fs:continue
    for t in texts(os.path.join(r,'index.html')):
        if englishy(t):en[t]=rel
bad=[]
EX={'pt':{'interior'},'id':{'interior'},'it':set(),'es':set(),'fr':set(),'de':set(),'vi':set(),'ja':set()}
for l in LANGS:
    for r,_,fs in os.walk(f'dist/{l}'):
        if 'index.html' not in fs:continue
        for t in texts(os.path.join(r,'index.html')):
            if t in en:bad.append((l,os.path.relpath(r,'dist'),t[:70]))
for b in bad:print('LEFT-EN',*b)
print(f"{len(bad)} leftover English text nodes");sys.exit(1 if bad else 0)
