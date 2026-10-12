import sys, json, base64, subprocess, time, os
from playwright.sync_api import sync_playwright
names=sys.argv[1].split(','); w=int(sys.argv[2]); h=int(sys.argv[3]); ss=float(sys.argv[4]) if len(sys.argv)>4 else 1.5
srv=subprocess.Popen(['python3','-m','http.server','8765'],cwd='/home/claude/renders',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(0.8)
os.makedirs('out',exist_ok=True)
try:
  with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    for n in names:
      pg=b.new_page(viewport={'width':400,'height':300})
      errs=[]; pg.on('console', lambda m: errs.append(m.text) if m.type in('error','warning') else None); pg.on('pageerror', lambda e: errs.append(str(e)))
      pg.goto('http://localhost:8765/index.html'); pg.wait_for_function('window.ready===true', timeout=60000)
      t=time.time()
      r=pg.evaluate(f"renderScene('{n}',{w},{h},{ss})")
      open(f'out/{n}.webp','wb').write(base64.b64decode(r['data'].split(',')[1]))
      json.dump(r['anchors'],open(f'out/{n}.json','w'),indent=1)
      print(n, round(time.time()-t,1),'s', os.path.getsize(f'out/{n}.webp')//1024,'KB', [e for e in errs if 'GPU stall' not in e][:5])
      pg.close()
    b.close()
finally:
  srv.terminate()
