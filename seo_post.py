"""SEO post-processing on dist/ (runs last in build.py, after i18n/metricize/searchidx).
S1 dist/404.html (noindex, no canonical/hreflang/JSON-LD) · S3 <lastmod> in sitemaps via lastmod.json
S4 BreadcrumbList (tool pages) + Organization (home pages) JSON-LD · S5 dist/llms.txt
No new strings go through i18n; nothing here calls a translation API."""
import os,re,json,glob,hashlib,html,subprocess,datetime
from zoneinfo import ZoneInfo
from bs4 import BeautifulSoup
exec(open("config.py").read())
SITE=os.environ.get("BASE_URL",BASE_URL).rstrip("/")
D="dist";LANGS=["es","pt","fr","de","it","id","vi","ja"]
TODAY=datetime.datetime.now(ZoneInfo("Asia/Saigon")).date().isoformat()
def rd(p):return open(p,encoding="utf-8").read()
def wr(p,s):open(p,"w",encoding="utf-8").write(s)
def ldtag(obj):return '<script type="application/ld+json">'+json.dumps(obj,ensure_ascii=False).replace("</","<\\/")+'</script>'
def add_ld(h,obj):
    """insert after the last existing JSON-LD block (or before </head>); idempotent per @type"""
    if re.search(r'<script type="application/ld\+json">[^<]*"@type": ?"%s"'%obj["@type"],h):return h
    ms=list(re.finditer(r'<script type="application/ld\+json">.*?</script>',h,re.S))
    i=ms[-1].end() if ms else h.index("</head>")
    return h[:i]+ldtag(obj)+h[i:]
def file_of(url):
    p=url[len(SITE):] or "/";return D+p+"index.html"
# ---------------- S1: 404.html (English, from about page shell)
def make_404():
    h=rd(f"{D}/about/index.html")
    h=re.sub(r'<link[^>]*rel="canonical"[^>]*>','',h)
    h=re.sub(r'<link[^>]*hreflang=[^>]*>','',h)
    h=re.sub(r'<script type="application/ld\+json">.*?</script>','',h,flags=re.S)
    h=re.sub(r'<meta property="og:url"[^>]*>','',h)
    t="Page not found – PorchMath"
    h=re.sub(r"<title>.*?</title>",f"<title>{t}</title><meta name=\"robots\" content=\"noindex\">",h,count=1,flags=re.S)
    h=re.sub(r'<meta property="og:title" content="[^"]*">',f'<meta property="og:title" content="{t}">',h)
    desc="The page you were looking for does not exist on PorchMath."
    h=re.sub(r'<meta name="description" content="[^"]*">',f'<meta name="description" content="{desc}">',h)
    h=re.sub(r'<meta property="og:description" content="[^"]*">',f'<meta property="og:description" content="{desc}">',h)
    # language switcher: point each language to its home page (no about-page alternates on a 404)
    h=re.sub(r"(<details class='lsw'>.*?</details>)",lambda m:re.sub(r"href='(/[a-z]{2})?/about/'",lambda n:f"href='{n.group(1) or ''}/'",m.group(1)),h,count=1,flags=re.S)
    main=("<main class='w page'><h1>Page not found</h1><div class='panel guide'>"
          "<p>Sorry, the page you were looking for doesn't exist or has moved.</p>"
          "<p><a href='/'>Go to the PorchMath home page</a> or <a href='/#tools'>browse all calculators</a>.</p></div></main>")
    h=re.sub(r"<main[\s>].*?</main>",lambda m:main,h,count=1,flags=re.S)
    assert "canonical" not in h and "hreflang=\"" not in h and "ld+json" not in h and "noindex" in h
    wr(f"{D}/404.html",h)
# ---------------- sitemap URLs
def sitemap_files():return [f"{D}/sitemap-{l}.xml" for l in ["en"]+LANGS]
def sitemap_urls():
    out=[]
    for f in sitemap_files():out+=re.findall(r"<url><loc>([^<]+)</loc>",rd(f))
    return out
# ---------------- S4: JSON-LD
def schema(urls):
    crumbs=orgs=0
    for u in urls:
        f=file_of(u);h=rd(f);s=BeautifulSoup(h,"html.parser")
        nav=s.find("nav",class_="crumb")
        if nav:
            a=nav.find("a");can=s.find("link",rel="canonical")["href"];h1=s.find("h1").get_text(" ",strip=True)
            home=a["href"];home=SITE+home if home.startswith("/") else home
            h=add_ld(h,{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
                {"@type":"ListItem","position":1,"name":a.get_text(" ",strip=True),"item":home},
                {"@type":"ListItem","position":2,"name":h1,"item":can}]});crumbs+=1
        if f==f"{D}/index.html" or re.fullmatch(rf"{D}/[a-z]{{2}}/index.html",f):
            h=add_ld(h,{"@context":"https://schema.org","@type":"Organization","@id":SITE+"/#org","name":SITE_NAME,"url":SITE+"/"});orgs+=1
        wr(f,h)
    return crumbs,orgs
# ---------------- S3: lastmod
def content_hash(h):
    h=re.sub(r"<script\b.*?</script>","",h,flags=re.S|re.I);h=re.sub(r"<style\b.*?</style>","",h,flags=re.S|re.I)
    m=re.search(r"<main[\s>].*?</main>",h,re.S)
    if m:body=m.group(0)
    else:  # home pages have no <main>: body minus header/footer
        b=re.search(r"<body[^>]*>(.*)</body>",h,re.S).group(1)
        body=re.sub(r"<footer\b.*?</footer>","",re.sub(r"<header\b.*?</header>","",b,flags=re.S),flags=re.S)
    s=BeautifulSoup(h,"html.parser")
    t=s.title.get_text() if s.title else ""
    md=s.find("meta",attrs={"name":"description"});d=md["content"] if md else ""
    return hashlib.sha256((t+"\n"+d+"\n"+body).encode()).hexdigest()
def git_dates():
    """latest commit date (%cs) per dist/<..>/index.html, one git call"""
    try:out=subprocess.run(["git","log","--format=@%cs","--name-only","--","dist"],capture_output=True,text=True,check=True).stdout
    except Exception:return {}
    res={};cur=None
    for line in out.splitlines():
        if line.startswith("@"):cur=line[1:]
        elif line.strip() and line not in res:res[line]=cur
    return res
def lastmod(urls):
    path="lastmod.json";db=json.load(open(path)) if os.path.exists(path) else {}
    gd=None;new={};changed=0
    for u in urls:
        key=u[len(SITE):] or "/";hs=content_hash(rd(file_of(u)))
        if key in db and db[key][0]==hs:new[key]=db[key];continue
        if key in db:day=TODAY;changed+=1
        else:
            if gd is None:gd=git_dates()
            day=gd.get(file_of(u),TODAY) if not db else TODAY
            day=min(day,TODAY)
        new[key]=[hs,day]
    json.dump(new,open(path,"w"),indent=0,sort_keys=True);open(path,"a").write("\n")
    for f in sitemap_files():
        x=rd(f)
        x=re.sub(r"<lastmod>[^<]*</lastmod>","",x)
        x=re.sub(r"(<url><loc>([^<]+)</loc>)",lambda m:m.group(1)+"<lastmod>"+new[m.group(2)[len(SITE):] or "/"][1]+"</lastmod>",x)
        wr(f,x)
    return changed
# ---------------- S5: llms.txt
def llms(urls):
    def meta(f):
        s=BeautifulSoup(rd(f),"html.parser");md=s.find("meta",attrs={"name":"description"})
        return s.find("h1").get_text(" ",strip=True) if s.find("h1") else "",(md["content"] if md else "").strip()
    _,hd=meta(f"{D}/index.html")
    tools=[u for u in urls if re.fullmatch(re.escape(SITE)+r"/[a-z0-9-]+-calculator/",u)]
    L=[f"# {SITE_NAME}","",f"> {hd}","","## Calculators",""]
    for u in tools:
        h1,d=meta(file_of(u));L.append(f"- [{h1}]({u}): {d}")
    L+=["","## About","",f"- [About]({SITE}/about/): who we are and how we check the math",f"- [Privacy Policy]({SITE}/privacy/)",f"- [Contact]({SITE}/contact/)","",
        "Other languages: "+" ".join(f"[/{l}/]({SITE}/{l}/)" for l in LANGS),""]
    wr(f"{D}/llms.txt","\n".join(L));return len(tools)
if __name__=="__main__":
    make_404();urls=sitemap_urls()
    c,o=schema(urls);ch=lastmod(urls);n=llms(urls)
    print(f"seo_post: 404.html, {len(urls)} sitemap URLs, {c} breadcrumbs, {o} Organization, lastmod changed {ch}, llms.txt {n} tools")
