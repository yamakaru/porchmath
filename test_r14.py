"""Round 14: slash-joined sizes fully converted; feet→m always 2 decimals; evtest link script on every page."""
import re,glob,sys
bad=[]
for p in glob.glob('dist/**/index.html',recursive=True):
    s=re.sub(r'<script.*?</script>','',open(p,encoding='utf-8').read(),flags=re.S)
    for m in re.finditer(r'\b\d+×\d+ / [\d.,]+×[\d.,]+ m\b',s):bad.append((p,'slash',m.group(0)))
    for m in re.finditer(r'(?<![\d.,])\d+(?:[.,]\d)? m \([^()]*ft\)',s):
        if float(m.group(0).split()[0].replace(',','.'))<10:bad.append((p,'ft-dec',m.group(0)))
    if 'a.search+=' not in open(p,encoding='utf-8').read():bad.append((p,'evtest-script',''))
from bs4 import BeautifulSoup
BARE=re.compile(r'(?<![\d.,×(/])\d+\s?×\s?\d+(?![\d.,×]|\s?(?:ft|m\b|m²|mm|cm|in\b|\(|×|=|÷|/|sq|lb|kg))')
for p in glob.glob('dist/*/*/index.html'):
    if p.split('/')[1] not in ('es','pt','fr','de','it','id','vi','ja'):continue
    S=BeautifulSoup(open(p,encoding='utf-8'),'html.parser')
    for x in S(['script','style','head']):x.decompose()
    for x in S.select('.us,.usb,.usc,.nocv'):x.decompose()
    for m in BARE.finditer(S.get_text('')):
        if not re.match(r'2\s?×',m.group(0)):bad.append((p,'bare-size',m.group(0)))
for b in bad[:40]:print(*b)
print(len(bad),'problems');sys.exit(1 if bad else 0)
