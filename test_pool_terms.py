# T11-24: MMO's US-gallon term on every localized pool page (static dist check).
import re,sys,os
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'dist')
T={'de':'US-Gallonen','fr':'gallons US','it':'galloni USA','pt':'galões americanos','id':'galon AS','es':'galones estadounidenses','vi':'gallon Mỹ','ja':'米ガロン','':'US gallons'}
BAD={'de':r'US gallons','fr':r'US gallons?|gallons américains','it':r'US gallons?|galloni (?:US|americani)\b','pt':r'US [Gg]allons?|galões dos EUA','id':r'US gall?ons?','es':r'gal(?:ones|ón) (?:de )?EE\. ?UU\.'}
f=0
for l,t in T.items():
    s=open(os.path.join(D,l,'pool-volume-calculator','index.html'),encoding='utf-8').read()
    vis=re.sub(r'<script[^>]*>.*?</script>','',s,flags=re.S)
    if t.lower() not in s.lower(): print('FAIL',l or 'en','missing',t);f+=1
    if l in BAD and re.search(BAD[l],s): print('FAIL',l,'old term',re.search(BAD[l],s).group(0));f+=1
    tt=re.search(r'<title>([^<]*)',s).group(1); md=re.search(r'<meta (?=[^>]*name="description")[^>]*content="([^"]*)"',s).group(1)
    print(l or 'en','|',tt,'|',md[:90])
print('FAIL' if f else 'OK',f);sys.exit(1 if f else 0)
