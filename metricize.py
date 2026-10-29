"""Non-English locales are metric-default: rewrite visible imperial quantities as 'metric (imperial)'.
Skips <head>, <script>, <style> and .us spans (the US-mode-only text that is hidden in metric mode)."""
import re,glob,sys
from bs4 import BeautifulSoup,NavigableString
FR={'⅛':.125,'¼':.25,'⅜':.375,'½':.5,'⅝':.625,'¾':.75,'⅞':.875}
NUM=r'(?:\d+(?:[.,]\d+)?[⅛¼⅜½⅝¾⅞]?|[⅛¼⅜½⅝¾⅞])'
def val(s):
    s=s.strip();f=0
    if s and s[-1] in FR:f=FR[s[-1]];s=s[:-1]
    return (float(s.replace(',','.')) if s else 0)+f
def fmt(x,d,comma):
    s=f"{x:.{d}f}"
    if d: s=s.rstrip('0').rstrip('.')
    return s.replace('.',',') if comma else s
def conv(t,comma,state):
    F=lambda x,d:fmt(x,d,comma)
    # list/ single lb with an explicit kg equivalent in brackets -> 'kg (lb)'
    t=re.sub(r'(\d+(?:(?:[,、]\s*|\s+)(?:[^\s\d()（）]{1,8}\s*)?\d+)*)\s*lb\s*[(（]\s*([^\d()（）]{0,10})(\d[^()（）]*?)\s*kg\s*[)）]',lambda m:(f"{m.group(3)} kg (≈{re.sub(r'\d+(?:[.,]\d+)?',lambda q:F(val(q.group(0))*2.20462,0),m.group(3))} lb)" if (m.group(2).strip() or abs(val(re.findall(r'\d+(?:[.,]\d+)?',m.group(3))[-1])-val(re.findall(r'\d+(?:[.,]\d+)?',m.group(1))[-1])*0.45359)>0.1*val(re.findall(r'\d+(?:[.,]\d+)?',m.group(3))[-1])) else f"{m.group(3)} kg ({m.group(1)} lb)"),t)
    t=re.sub(r'(?<![\d.,])(\d+(?:[.,]\d+)?)\s*lb(?![A-Za-z])(?!\))',lambda m:f"{F(val(m.group(1))*0.45359,0)} kg ({m.group(1)} lb)",t)
    t=re.sub(r'(?<![\d.,])(\d+(?:[.,]\d+)?)\s*cu ft(?![A-Za-z])',lambda m:f"{F(val(m.group(1))*0.0283168,3)} m³ ({m.group(1)} cu ft)",t)
    t=re.sub(r'(?<![\d.,])(\d+(?:[.,]\d+)?)\s*cu yd(?![A-Za-z])(?!\s*/\s*[\d.,]+\s*m³)',lambda m:f"{F(val(m.group(1))*0.764555,2)} m³ ({m.group(1)} cu yd)",t)
    t=re.sub(r'(?<![\d.,])(\d+(?:[.,]\d+)?)\s*sq ft(?![A-Za-z])',lambda m:f"{F(val(m.group(1))*0.092903,1)} m² ({m.group(1)} sq ft)",t)
    t=re.sub(r'(?<![\d.,])(\d+(?:[.,]\d+)?)\s*sq in(?![A-Za-z])',lambda m:f"{F(val(m.group(1))*6.4516,0)} cm² ({m.group(1)} sq in)",t)
    def dims(m,unit,mul,d,out):
        parts=re.split(r'(\s*[×x–-]\s*)',m.group(1))
        return ''.join(F(val(p)*mul,d) if i%2==0 else p for i,p in enumerate(parts))+f" {out} ({m.group(1)} {unit})"
    t=re.sub(rf'(?<![\d.,])({NUM}(?:\s*[×–-]\s*{NUM})*)\s*ft(?![A-Za-z])',lambda m:dims(m,'ft',0.3048,1,'m'),t)
    t=re.sub(rf'(?<![\d.,A-Za-z])({NUM}(?:\s*[×–-]\s*{NUM})*)\s*in(?![A-Za-z-])',lambda m:dims(m,'in',25.4,0,'mm') if ('×' in m.group(1) or any(c in m.group(1) for c in FR) or val(re.split(r'[×–-]',m.group(1))[0])<2) else dims(m,'in',2.54,0,'cm'),t)
    # bare unit names: annotate first occurrence per page
    for u,eq in (('sq ft','0,093 m²' if comma else '0.093 m²'),('cu ft','0,028 m³' if comma else '0.028 m³'),('cu yd','0,76 m³' if comma else '0.76 m³')):
        if u not in state:
            n=re.subn(rf'(?<![\d)] )(?<!\d)\b{u}\b(?!\s*\()(?![^(]*\))',f"{u} (= {eq})",t,count=1)
            if n[1]: t=n[0];state.add(u)
    return t
def page(path,lang):
    s=open(path,encoding='utf-8').read();soup=BeautifulSoup(s,'html.parser');b=soup.body
    if not b:return 0
    comma=lang!='ja';state=set();ch=0
    for node in list(b.find_all(string=True)):
        if not(isinstance(node,NavigableString) and node.parent) or node.find_parent(['script','style','textarea']):continue
        cl=set(c for p in node.parents if hasattr(p,'get') for c in (p.get('class') or []))
        if cl&{'us','usb','usc'}:continue
        t=str(node)
        if cl&{'mt','mtb','mtc'}:
            n=re.sub(r'(?<=\d)\.(?=\d)',',',t) if comma else t
        else:
            if not re.search(r'lb|ft|in\b|yd',t):continue
            n=conv(t,comma,state)
        if n!=t:node.replace_with(n);ch+=1
    if ch:open(path,'w',encoding='utf-8').write(str(soup))
    return ch
if __name__=='__main__':
    tot=0
    for p in glob.glob('dist/*/*/index.html')+glob.glob('dist/*/index.html'):
        lang=p.split('/')[1]
        if lang in('es','pt','fr','de','it','id','vi','ja'):tot+=page(p,lang)
    print('metricize: rewrote',tot,'text nodes')
