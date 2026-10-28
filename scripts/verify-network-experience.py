"""Browser regression for the source-backed network and touch/accordion repairs."""
import asyncio,json,os,time
from pathlib import Path
from playwright.async_api import async_playwright
BASE=os.environ.get('BASE_URL','http://localhost:4321');OUT=Path(os.environ.get('CAPTURE_DIR','/workspace/scratch/watch-network-build-2026-10-28/browser'));OUT.mkdir(parents=True,exist_ok=True)
DATA=json.loads(Path('content/investigative-record.json').read_text());ROUTES=json.loads(Path('content/investigative-routes.json').read_text())
async def ready(page,path):
 await page.goto(BASE+path,wait_until='domcontentloaded');await page.locator('[data-desk-ready=true]').wait_for(timeout=30000);await page.evaluate('document.fonts.ready')
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);checks=[];errors=[]
  for prefix in ['', '/id']:
   ctx=await b.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce');page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)));await page.route('**/api/**',lambda r:r.fulfill(json={'items':[]}))
   for case in DATA['cases']:
    await ready(page,prefix+ROUTES[case['id']]+'#explore');assert await page.locator('[data-network-node]').count()==len(case['scene']),case['id']
    await page.locator('[data-network-claim='+case['claimIds'][0]+']').focus();await page.keyboard.press('Enter');assert 'claim='+case['claimIds'][0] in page.url
    source=next(c for c in DATA['claims'] if c['id']==case['claimIds'][0])['evidence'][0]['source'];await page.locator('[data-case-evidence]').click();await page.locator('.case-source-dialog').wait_for();assert source in page.url;assert await page.locator('.case-source-dialog .case-source-original').get_attribute('href')==next(s for s in DATA['sources'] if s['id']==source)['url'];await page.keyboard.press('Escape')
    checks.append(prefix+': '+case['id']+' nodes, keyboard record, exact source and Escape')
   await ready(page,prefix+ROUTES['merauke']+'#explore');search=page.locator('[data-record-search] input');await search.fill('Haji Isham');await page.get_by_role('option').first.click();assert 'entity=isam' in page.url;await page.wait_for_function('document.querySelector(".case-evidence [data-case-reading-title]")?.textContent==="Haji Isam"');assert len(await page.locator('.case-evidence .case-reader-summary').inner_text())>250;assert await page.evaluate('!!document.querySelector("[data-desk-ready=true]")')
   share=page.url;await page.reload(wait_until='domcontentloaded');await page.locator('[data-desk-ready=true]').wait_for();assert 'Haji Isam' in await page.locator('.case-evidence').inner_text()
   await page.locator('[data-network-scope=all]').click();assert await page.locator('[data-network-node]').count()>85;assert 'scope=all' in page.url;await page.locator('[data-network-lens=business]').click();assert 'lens=business' in page.url
   await page.go_back();assert await page.locator('[data-network-lens=all]').get_attribute('aria-pressed')=='true'
   await page.locator('[data-network-expand]').click();dialog=page.locator('.case-network-dialog');await dialog.locator('[data-network-node=ptfi]').focus();await page.keyboard.press('Enter');assert await dialog.is_visible();assert 'Freeport' in await dialog.locator('[data-case-reader]').inner_text();assert 'entity=ptfi' in page.url
   await dialog.locator('[data-network-document]').first.click();assert await dialog.is_visible();assert await dialog.locator('.case-source-original').count()==1;await page.screenshot(path=str(OUT/('expanded-'+('id' if prefix else 'en')+'.png')));await page.keyboard.press('Escape')
   await page.reload(wait_until='domcontentloaded');await page.locator('[data-desk-ready=true]').wait_for();assert 'scope=all' in page.url and await page.locator('[data-network-node]').count()>85
   checks.append(prefix+': in-place alias search, dossier, reload, scope, lens Back and persistent expanded reader/source')
   for width in [768,390,320]:
    await page.set_viewport_size({'width':width,'height':950});await ready(page,prefix+ROUTES['merauke']+'#explore');assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth+1')
    await page.locator('[data-network-node=isam]').focus();await page.keyboard.press('Enter');await page.locator('.case-source-dialog').wait_for();assert 'Haji Isam' in await page.locator('.case-source-dialog').inner_text();await page.keyboard.press('Escape')
    await page.locator('[data-network-expand]').click();await page.locator('.case-network-dialog [data-network-node=isam]').focus();await page.keyboard.press('Enter');assert await page.locator('.case-network-dialog').is_visible();assert 'Haji Isam' in await page.locator('.case-network-dialog [data-case-reader]').inner_text();await page.screenshot(path=str(OUT/(f'expanded-{width}-'+('id' if prefix else 'en')+'.png')));await page.keyboard.press('Escape')
    await page.locator('[data-case-workbench]').scroll_into_view_if_needed();await page.wait_for_timeout(100);before=await page.evaluate('scrollY');await page.mouse.move(width/2,550);await page.mouse.wheel(0,300);await page.wait_for_timeout(250);assert await page.evaluate('scrollY')>before
    checks.append(prefix+': '+str(width)+' reflow, phone dossier, expanded selection and wheel scroll')
   await ctx.close()
  # Every category transition preserves its clicked summary, including shrink-above.
  for width in [1440,390]:
   ctx=await b.new_context(viewport={'width':width,'height':950},reduced_motion='reduce');page=await ctx.new_page();await page.route('**/api/**',lambda r:r.fulfill(json={'items':[]}));await page.goto(BASE+'/resources/',wait_until='domcontentloaded');await page.evaluate('document.fonts.ready');sections=page.locator('[data-directory-section]')
   for i in range(4):
    for j in range(4):
     if i==j:continue
     for index in [i,j]:
      summary=sections.nth(index).locator('summary');await summary.scroll_into_view_if_needed();await page.wait_for_timeout(50);before=await summary.bounding_box();await summary.click();await page.wait_for_timeout(150);after=await summary.bounding_box();assert after['y']>50 and abs(before['y']-after['y'])<35,(width,i,j,before,after)
     assert await page.locator('[data-directory-section][open]').count()<=1
   await page.locator('[data-organization-search]').fill('a');assert await page.locator('[data-directory-section][open]').count()>1;await page.locator('[data-organization-search]').fill('');assert await page.locator('[data-directory-section][open]').count()<=1
   checks.append(str(width)+': all directory pairs anchored; multi-category search restores state');await ctx.close()
  # Native touch and delayed content, with normal animation.
  ctx=await b.new_context(viewport={'width':390,'height':900},has_touch=True,is_mobile=True);page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  async def api(route):
   if '/api/current?' in route.request.url:
    await asyncio.sleep(3);await route.fulfill(json={'items':[{'id':44,'publication_kind':'reviewed','title':{'en':'A current news report for the discovery strip','id':'Berita terbaru untuk jalur penemuan'},'story_url':'/story/?id=44','latest_report_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'report_count':3,'sources':['Jubi'],'summary':{'en':'Recorded update','id':'Perkembangan tercatat'}}]})
   else:await route.fulfill(json={'items':[]})
  await page.route('**/api/**',api);await page.goto(BASE+'/resources/',wait_until='domcontentloaded');await page.evaluate('document.fonts.ready');v=page.locator('[data-following-viewport]');a=await v.evaluate('(e)=>e.scrollLeft');await page.wait_for_timeout(500);assert await v.evaluate('(e)=>e.scrollLeft')>a
  cdp=await ctx.new_cdp_session(page);before_hold=await v.evaluate('(e)=>e.scrollLeft');await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':330,'y':20}]});await page.wait_for_timeout(120);await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':328,'y':20}]});await page.wait_for_timeout(120);assert abs(await v.evaluate('(e)=>e.scrollLeft')-before_hold)<3,'A held finger must not invoke mouse dragging or reset the strip';await cdp.send('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]});await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':340,'y':20}]});await page.wait_for_timeout(300)
  for x in [300,250,200,150,90,35]:await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':20}]});await page.wait_for_timeout(45)
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await page.wait_for_timeout(500);held=await v.evaluate('(e)=>e.scrollLeft');await page.wait_for_timeout(3200);resumed=await v.evaluate('(e)=>e.scrollLeft');assert resumed>held+10,(held,resumed);assert await page.locator('[data-discovery-id="news:44"]').count()==2,'The delayed reviewed news must actually be applied'
  button=page.locator('[data-discovery-pause]');await button.focus();await page.keyboard.press('Space');assert await button.get_attribute('aria-pressed')=='true';paused=await v.evaluate('(e)=>e.scrollLeft');await page.wait_for_timeout(500);assert abs(await v.evaluate('(e)=>e.scrollLeft')-paused)<2;await page.keyboard.press('Space');await page.wait_for_timeout(600);assert await v.evaluate('(e)=>e.scrollLeft')>paused+5
  assert await page.locator('[data-following-track] [inert]').count()==0;assert await page.locator('[data-following-track] [aria-hidden=true] a:not([tabindex="-1"])').count()==0
  checks.append('Touch ticker: native swipe release resumes, delayed news preserves position, keyboard Pause persists, focused Resume works and seam links are interactive');await ctx.close()
  ctx=await b.new_context(viewport={'width':390,'height':900},reduced_motion='reduce');page=await ctx.new_page();await page.route('**/api/**',api);await page.goto(BASE+'/resources/',wait_until='domcontentloaded');await page.locator('[data-discovery-id="news:44"]').wait_for(timeout=15000);v=page.locator('[data-following-viewport]');fixed=await v.evaluate('(e)=>e.scrollLeft');await page.wait_for_timeout(500);assert await v.evaluate('(e)=>e.scrollLeft')==fixed;assert await page.locator('[data-following-track] [data-discovery-id="news:44"]').count()==1
  checks.append('Reduced-motion ticker receives fresh news without animation or duplicate segment');await ctx.close()
  # Actual dragging changes positions; physics sleeps after settling. Touch inline still scrolls.
  ctx=await b.new_context(viewport={'width':1440,'height':1000});page=await ctx.new_page();await page.route('**/api/**',lambda r:r.fulfill(json={'items':[]}));await ready(page,ROUTES['merauke']+'#explore');await page.wait_for_timeout(1700)
  await page.locator('[data-network-node=isam]').click();assert 'entity=isam' in page.url,'Pointer selection must work with SVG pointer capture'
  node=page.locator('[data-network-node=jhonlin]');await node.scroll_into_view_if_needed();box=await node.locator('.case-node-mark').bounding_box();old=await node.get_attribute('transform');await page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);await page.mouse.down();await page.mouse.move(box['x']+45,box['y']+30,steps=8);await page.mouse.up();assert await node.get_attribute('transform')!=old
  await page.wait_for_timeout(1700);assert await page.locator('[data-case-network]').get_attribute('data-network-motion')=='idle';fixed=await node.get_attribute('transform');await page.wait_for_timeout(350);assert await node.get_attribute('transform')==fixed
  checks.append('Actual pointer selection/drag works; force simulation becomes idle with stationary nodes');await ctx.close()
  ctx=await b.new_context(viewport={'width':390,'height':900},has_touch=True,is_mobile=True);page=await ctx.new_page();await page.route('**/api/**',lambda r:r.fulfill(json={'items':[]}));await ready(page,ROUTES['merauke']+'#explore');await page.locator('.case-network-svg').scroll_into_view_if_needed();await page.wait_for_timeout(250);before=await page.evaluate('scrollY');cdp=await ctx.new_cdp_session(page);await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':190,'y':650}]})
  for y in [600,550,500,450,400,350]:await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':190,'y':y}]});await page.wait_for_timeout(30)
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await page.wait_for_timeout(200);assert await page.evaluate('scrollY')>before+150;checks.append('Actual native touch scroll over inline graph remains page scrolling');await ctx.close()
  await b.close();assert not errors,errors;(OUT/'results.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2));print(json.dumps({'passed':len(checks),'checks':checks,'errors':errors},indent=2))
asyncio.run(main())
