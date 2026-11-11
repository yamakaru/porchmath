"""F1 check for i18n.py --estimate / --max-credits with a MOCKED Kie API (urlopen is replaced; no network, no real key).
Usage: python3 test_i18n_budget.py [path/to/i18n.py]   (run from anywhere; works in a temp dir)"""
import os,sys,json,subprocess,tempfile,shutil,csv
SRC=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),"i18n.py"))
MOCK=r'''
import sys,json,io,urllib.request,runpy,os
st={"bal":1000.0,"calls":0}
class R(io.BytesIO):
    def __enter__(s):return s
    def __exit__(s,*a):pass
def fake(req,timeout=None):
    u=req.full_url if hasattr(req,"full_url") else req
    if u.endswith("/api/v1/chat/credit"):return R(json.dumps({"code":200,"data":round(st["bal"],2)}).encode())
    st["calls"]+=1;st["bal"]-=float(os.environ.get("MOCK_COST","1"))
    items=json.loads(json.loads(req.data)["messages"][0]["content"].rsplit("\n",1)[-1])
    return R(json.dumps({"choices":[{"message":{"content":json.dumps({k:"[T] "+v for k,v in items.items()})}}]}).encode())
urllib.request.urlopen=fake
sys.argv=["i18n.py"]+sys.argv[1:]
try:runpy.run_path("i18n.py",run_name="__main__")
finally:print("MOCK chat calls:",st["calls"],file=sys.stderr)
'''
bad=0
def ok(c,m):
    global bad
    print(("OK  " if c else "FAIL"),m);bad+=not c
d=tempfile.mkdtemp();shutil.copy(SRC,d+"/i18n.py");open(d+"/mock.py","w").write(MOCK)
os.makedirs(d+"/dist");os.makedirs(d+"/i18n")
open(d+"/dist/index.html","w").write("<!doctype html><html lang='en'><head><title>Budget test</title></head><body><main>"+"".join(f"<p>Sentence number {i} for the budget test.</p>" for i in range(200))+"</main></body></html>")
log=d+"/log.csv";env=dict(os.environ,KIE_I18N_LOG=log);env.pop("KIE_API_KEY",None)
def run(*a,cost="1"):
    e=dict(env,MOCK_COST=cost);return subprocess.run([sys.executable,"mock.py","PorchMath","https://example.com"]+list(a),cwd=d,env=e,capture_output=True,text=True)
r=run("--estimate");ok(r.returncode==0 and "TOTAL: 1608 strings" in r.stdout and "no API call" in r.stdout,"estimate works without KIE_API_KEY: "+r.stdout.strip().splitlines()[-1])
ok("MOCK chat calls: 0" in r.stderr,"estimate makes no API call")
r=run("--translate");ok(r.returncode!=0 and "requires --max-credits" in (r.stderr+r.stdout),"--translate without --max-credits is refused")
env["KIE_API_KEY"]="mock-not-a-key"
r=run("--translate","--max-credits","3.5","es");ok(r.returncode==3 and "BUDGET STOP" in r.stdout,"tiny cap stops with exit 3")
calls=int(r.stderr.split("MOCK chat calls:")[1].split()[0]);ok(calls<=3,f"spend stayed under the cap ({calls} batches x 1 credit < 3.5)")
c=json.load(open(d+"/i18n/es.json"));ok(0<len(c)<201,f"partial cache saved ({len(c)} of 201 strings)")
r=run("--translate","--max-credits","100","es");ok(r.returncode==0 and "Kie credits used" in r.stdout,"large cap finishes: "+r.stdout.strip().splitlines()[-1])
rows=list(csv.DictReader(open(log)));ok([x["mode"] for x in rows]==["estimate","translate","translate"],"one log row per estimate/translate run")
ok(rows[1]["status"]=="budget_stop" and float(rows[1]["credits_used"])<3.5,"log row: budget_stop, credits_used "+rows[1]["credits_used"])
ok(all("mock-not-a-key" not in open(log).read() for _ in [0]) and "mock-not-a-key" not in r.stdout+r.stderr,"key never printed or logged")
print("header:",open(log).readline().strip())
shutil.rmtree(d);print("BAD",bad);sys.exit(1 if bad else 0)
