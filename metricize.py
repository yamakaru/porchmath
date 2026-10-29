"""Non-English locales are metric-default: rewrite visible imperial quantities as 'metric (imperial)'.
Skips <head>, <script>, <style> and .us spans (the US-mode-only text that is hidden in metric mode)."""
import re,glob,sys
from bs4 import BeautifulSoup,NavigableString
FR={'⅛':.125,'¼':.25,'⅜':.375,'½':.5,'⅝':.625,'¾':.75,'⅞':.875}
NUM=r'(?:\d+(?:[.,]\d+)?[⅛¼⅜½⅝¾⅞]?|[⅛¼⅜½⅝¾⅞])'
ENTH=set();LSEP=['.']
TOK=r'(?:\d{1,3}(?:[,.\u202f\u00a0 ]\d{3})+(?![\d]|[.,]\d)|\d+(?:[.,]\d+)?)'
SPL=r'(?:\s*[–〜~-]\s*|\s+(?:à|a|bis|hingga|sampai|đến|to|até|al)\s+)'
RNG=rf'({TOK}(?:{SPL}{TOK})?)'
def isth(s):return bool(re.fullmatch(r'\d{1,3}(?:[,.\u202f\u00a0 ]\d{3})+',s)) and (re.sub(r'\D','',s) in ENTH or bool(re.search(r'[\u202f\u00a0 ]',s)))
def O(s):
    def one(x):
        if not isth(x):return x
        d=re.sub(r'\D','',x);g=[];
        while d:g.insert(0,d[-3:]);d=d[:-3]
        return LSEP[0].join(g)
    return re.sub(TOK,lambda m:one(m.group(0)),s)
def val(s):
    s=s.strip();f=0
    if s and s[-1] in FR:f=FR[s[-1]];s=s[:-1]
    if isth(s):return float(re.sub(r'\D','',s))+f
    return (float(s.replace(',','.')) if s else 0)+f
def fmt(x,d,comma,keep=False):
    import math
    if x and abs(x)<1:d=max(d,1-int(math.floor(math.log10(abs(x)))))
    s=f"{x:.{d}f}"
    if d and not keep: s=s.rstrip('0').rstrip('.')
    return s.replace('.',',') if comma else s
def conv(t,comma,state):
    _P=[]
    def _pr(m):
        _P.append(m.group(2));return m.group(1)+' (\x00'+str(len(_P)-1)+'\x00)'
    t=re.sub(r'(\d\s?(?:mm|cm|m|kg|L|m²|m³|g/cm³|t)) \(([^()]*)\)',_pr,t)
    r=_conv(t,comma,state)
    r=re.sub(r'(\d+ × \d+ mm \([^()]*\)) \(\d+ sq in\)',r'\1',r)
    return re.sub('\x00(\\d+)\x00',lambda m:_P[int(m.group(1))],r)
def _conv(t,comma,state):
    F=lambda x,d:fmt(x,d,comma)
    # list/ single lb with an explicit kg equivalent in brackets -> 'kg (lb)'
    t=re.sub(r'(\d+(?:(?:[,、]\s*|\s+)(?:[^\s\d()（）]{1,8}\s*)?\d+)*)\s*lb\s*[(（]\s*([^\d()（）]{0,10})(\d[^()（）]*?)\s*kg\s*[)）]',lambda m:(f"{m.group(3)} kg (≈{re.sub(r'\d+(?:[.,]\d+)?',lambda q:F(val(q.group(0))*2.20462,0),m.group(3))} lb)" if (m.group(2).strip() or abs(val(re.findall(r'\d+(?:[.,]\d+)?',m.group(3))[-1])-val(re.findall(r'\d+(?:[.,]\d+)?',m.group(1))[-1])*0.45359)>0.1*val(re.findall(r'\d+(?:[.,]\d+)?',m.group(3))[-1])) else f"{m.group(3)} kg ({m.group(1)} lb)"),t)
    def R(t,ure,mul,d,out,un):
        return re.sub(rf'(?<![\d.,(]){RNG}\s*{ure}',lambda m:'–'.join((lambda vs:[F(v,max([2 if out=='m²' and max(abs(w) for w in vs)<10 else d]+[1-int(__import__('math').floor(__import__('math').log10(abs(w)))) for w in vs if w and abs(w)<1])) for v in vs])([val(x)*mul for x in re.split(SPL,m.group(1))]))+f" {out} ({O(m.group(1))} {un})",t)
    t=re.sub(rf'(?<![\d.,])({TOK})\s*lb(\s*/\s*|\s+(?:\S{{1,8}}\s+){{1,2}})cu in\b',lambda m:f"{F(val(m.group(1))*453.592/16.3871,1)} g/cm³ ({m.group(1)} lb"+m.group(2)+"cu in)",t)
    t=R(t,r'lb(?![A-Za-z])(?!\))',0.45359,0,'kg','lb')
    t=R(t,r'cu ft(?![A-Za-z])',0.0283168,3,'m³','cu ft')
    t=R(t,r'cu yd(?![A-Za-z])(?!\s*/\s*[\d.,]+\s*m³)',0.764555,2,'m³','cu yd')
    t=R(t,r'sq ft(?![A-Za-z])',0.092903,1,'m²','sq ft')
    t=R(t,r'sq in(?![A-Za-z])',6.4516,0,'cm²','sq in')
    t=R(t,r'gal(?:lons?)?(?![A-Za-z])(?!\s*\()',3.78541,1,'L','gal')
    def dims(m,unit,mul,d,out):
        parts=re.split(r'(\s+/\s+|\s*[×x–〜~-]\s*|\s+(?:à|a|bis|hingga|sampai|đến|to|até|al)\s+)',m.group(1))
        return ''.join((fmt(val(p)*mul,2,comma,True) if out=='m' and val(p)*mul<10 else F(val(p)*mul,d)) if i%2==0 else p for i,p in enumerate(parts))+f" {out} ({m.group(1)} {unit})"
    t=re.sub(rf'(?<![\d.,/])({NUM}(?:(?:\s*[×–〜~-]\s*|\s+/\s+|\s+(?:à|a|bis|hingga|sampai|đến|to|até|al)\s+){NUM})*)\s*ft(?![A-Za-z])',lambda m:dims(m,'ft',0.3048,1,'m'),t)
    FQ=lambda q:F(int(q.split('/')[0])/int(q.split('/')[1])*25.4+1e-9,1)
    t=re.sub(r'(?<![\d.,/(])(\d+/\d+)(?:(\s*[–〜~-]\s*|\s+(?:à|a|bis|hingga|sampai|đến|to|até|al)\s+)(\d+/\d+))? in(?![A-Za-z-])(?!\s*\()',lambda m:FQ(m.group(1))+(('–'+FQ(m.group(3))) if m.group(3) else '')+f' mm ({m.group(1)}'+((m.group(2)+m.group(3)) if m.group(3) else '')+' in)',t)
    t=re.sub(rf'(?<![\d.,A-Za-z/])({NUM}(?:(?:\s*[×–〜~-]\s*|\s+(?:à|a|bis|hingga|sampai|đến|to|até|al)\s+){NUM})*)\s*in(?![A-Za-z-])',lambda m:dims(m,'in',25.4,0,'mm') if ('×' in m.group(1) or any(c in m.group(1) for c in FR) or val(re.split(r'\s*[×–〜~-]\s*|\s+(?:à|a|bis|hingga|sampai|đến|to|até|al)\s+',m.group(1))[0])<2) else dims(m,'in',2.54,0,'cm'),t)
    # bare unit names: annotate first occurrence per page
    for u,eq in (('gallon','3,785 L' if comma else '3.785 L'),('cu in','16,4 cm³' if comma else '16.4 cm³'),('sq ft','0,093 m²' if comma else '0.093 m²'),('cu ft','0,028 m³' if comma else '0.028 m³'),('cu yd','0,76 m³' if comma else '0.76 m³')):
        if u not in state:
            n=re.subn(rf'(?<![\d)] )(?<!\d)\b{u}\b(?!\s*\()(?![^(]*\))',f"{u} (= {eq})",t,count=1)
            if n[1]: t=n[0];state.add(u)
    G=lambda y:F(val(y)*453.592/16.3871,1)
    t=re.sub(rf'{TOK}\s*kg\s*[(（]({TOK})\s*lb[)）]\s*/\s*cu in',lambda m:f"{G(m.group(1))} g/cm³ ({m.group(1)} lb/cu in)",t)
    t=re.sub(rf'1 cu inあたり約{TOK}\s*kg\s*[(（]({TOK})\s*lb[)）]（約[\d.,]+ g/cm³）',lambda m:f"約{G(m.group(1))} g/cm³（1 cu inあたり{m.group(1)} lb）",t)
    t=re.sub(r'(g/cm³ \([^()]*cu in\)) \((?:khoảng|約|ca\.|environ|circa|cerca de|sekitar|aprox\.)\s*[\d.,]+ g/cm³\)',r'\1',t)
    return t
DOT=re.compile(r'(?<![\d.,])(\d+)\.(\d+)(?!\d|[.,]\d)')
UW={'de':['Kubikyard','Kubikyard','Kubikfuß','Kubikfuß','Quadratfuß','Quadratfuß','Quadratyard','Quadratyard','Kubikzoll','Kubikzoll','Quadratzoll','Quadratzoll','Kubikmeter','Kubikmeter','Quadratmeter','Quadratmeter'],
'es':['yarda cúbica','yardas cúbicas','pie cúbico','pies cúbicos','pie cuadrado','pies cuadrados','yarda cuadrada','yardas cuadradas','pulgada cúbica','pulgadas cúbicas','pulgada cuadrada','pulgadas cuadradas','metro cúbico','metros cúbicos','metro cuadrado','metros cuadrados'],
'pt':['jarda cúbica','jardas cúbicas','pé cúbico','pés cúbicos','pé quadrado','pés quadrados','jarda quadrada','jardas quadradas','polegada cúbica','polegadas cúbicas','polegada quadrada','polegadas quadradas','metro cúbico','metros cúbicos','metro quadrado','metros quadrados'],
'fr':['yard cube','yards cubes','pied cube','pieds cubes','pied carré','pieds carrés','yard carré','yards carrés','pouce cube','pouces cubes','pouce carré','pouces carrés','mètre cube','mètres cubes','mètre carré','mètres carrés'],
'it':['iarda cubica','iarde cubiche','piede cubo','piedi cubi','piede quadrato','piedi quadrati','iarda quadrata','iarde quadrate','pollice cubo','pollici cubi','pollice quadrato','pollici quadrati','metro cubo','metri cubi','metro quadrato','metri quadrati'],
'id':['yard kubik']*2+['kaki kubik']*2+['kaki persegi']*2+['yard persegi']*2+['inci kubik']*2+['inci persegi']*2+['meter kubik']*2+['meter persegi']*2,
'vi':['yard khối']*2+['feet khối']*2+['feet vuông']*2+['yard vuông']*2+['inch khối']*2+['inch vuông']*2+['mét khối']*2+['mét vuông']*2}
UP=[r'cubic\s+yard',r'cubic\s+yards',r'cubic\s+foot',r'cubic\s+feet',r'square\s+foot',r'square\s+feet',r'square\s+yard',r'square\s+yards',r'cubic\s+inch',r'cubic\s+inches',r'square\s+inch',r'square\s+inches',r'cubic\s+met(?:re|er)',r'cubic\s+met(?:re|er)s',r'square\s+met(?:re|er)',r'square\s+met(?:re|er)s']
def locd(t,lang):
    t=DOT.sub(lambda m:m.group(0) if (m.group(1)[0]!='0' and len(m.group(1))<=3 and len(m.group(2))==3 and m.group(2)[-1]=='0') else m.group(1)+','+m.group(2),t)
    for pat,w in sorted(zip(UP,UW[lang]),key=lambda x:-len(x[0])):
        t=re.sub(r'\b'+pat+r'\b',lambda m:(w[0].upper()+w[1:]) if m.group(0)[0].isupper() and lang!='de' else w,t,flags=re.I)
    return t
SEP={'fr':'\u202f'}
def entho(path,lang):
    ep=path.replace(f'dist/{lang}/','dist/',1)
    try:t=open(ep,encoding='utf-8').read()
    except OSError:return set()
    return set(re.findall(r'(?<![\d.,])[1-9]\d{0,2}(?:,\d{3})+(?![\d]|[.,]\d)',t))
def page(path,lang):
    s=open(path,encoding='utf-8').read();soup=BeautifulSoup(s,'html.parser');b=soup.body
    if not b:return 0
    comma=lang!='ja';state=set();ch=0;TH=entho(path,lang);ENTH.clear();ENTH.update(x.replace(',','') for x in TH);LSEP[0]={'fr':'\u202f','ja':','}.get(lang,'.');THD={x.replace(',',''):x for x in TH}
    for node in list(b.find_all(string=True)):
        if not(isinstance(node,NavigableString) and node.parent) or node.find_parent(['script','style','textarea']):continue
        cl=set(c for p in node.parents if hasattr(p,'get') for c in (p.get('class') or []))
        t=str(node)
        if comma:
            for x in TH:t=re.sub(r'(?<![\d.,])'+re.escape(x)+r'(?!\d|[.,]\d)',x.replace(',',''),t)
        t0=str(node)
        if cl&{'us','usb','usc','nocv'}:n=t
        elif cl&{'mt','mtb','mtc'}:
            n=t
        else:
            n=conv(t,comma,state) if re.search(r'lb|ft|in\b|yd',t) else t
        if not cl&{'us','usb','usc','nocv'}:
            n=re.sub(r'(?<![\d.,×(/])8\s?×\s?8\s?×\s?16(?![\d×]|[.,]\d|\s?(?:in\b|mm|cm|\())','200×200×400 mm (8×8×16 in)',n)
            n=re.sub(r'(?<![\d.,×(/])4\s?×\s?(8|12)(?![\d×]|[.,]\d|\s?(?:ft|m\b|mm|cm|in\b|\(|×|=|/|sq))',lambda m:('1.22×2.44' if m.group(1)=='8' else '1.22×3.66')+f' m (4×{m.group(1)} ft)',n)
        if comma:
            n=locd(n,lang)
            n=re.sub(r'(?<![\d.,])\d{4,}(?!\d|[.,]\d)',lambda m:THD[m.group(0)].replace(',',SEP.get(lang,'.')) if m.group(0) in THD else m.group(0),n)
        if n!=t0:node.replace_with(n);ch+=1
    if ch:open(path,'w',encoding='utf-8').write(str(soup))
    return ch
if __name__=='__main__':
    tot=0
    for p in glob.glob('dist/*/*/index.html')+glob.glob('dist/*/index.html'):
        lang=p.split('/')[1]
        if lang in('es','pt','fr','de','it','id','vi','ja'):tot+=page(p,lang)
    print('metricize: rewrote',tot,'text nodes')
