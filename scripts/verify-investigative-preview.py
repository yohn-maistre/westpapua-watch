"""Run after a production build: pip install playwright; BASE_URL=... python3 scripts/verify-investigative-preview.py.
Uses Chromium (CHROMIUM_PATH defaults to /usr/bin/chromium). No production writes or model queries.
"""
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
REPO=Path(__file__).resolve().parents[1]
DATA=json.loads((REPO/'content/investigative-record.json').read_text())
ROUTES=json.loads((REPO/'content/investigative-routes.json').read_text())
BASE=os.environ.get('BASE_URL','http://localhost:4321').rstrip('/')
OUT=Path(os.environ.get('CAPTURE_DIR','/tmp/watch-browser-verification'));OUT.mkdir(parents=True,exist_ok=True)
async def ready(page,path):
 await page.goto(BASE+path,wait_until='domcontentloaded')
 await page.locator('[data-desk-ready=true]').wait_for(timeout=30000)
async def unlocked(page):
 for _ in range(30):
  if await page.evaluate("getComputedStyle(document.body).overflowY!=='hidden'"):return
  await page.wait_for_timeout(50)
 raise AssertionError('Closing an overlay must release the page scroll lock')
async def wheel_scroll(page,amount):
 # Hash restoration and font layout can race a wheel assertion after navigation.
 await page.evaluate('document.fonts.ready')
 for _ in range(10):
  before=await page.evaluate('scrollY');await page.wait_for_timeout(100)
  if abs(await page.evaluate('scrollY')-before)<1:break
 before=await page.evaluate('scrollY');await page.mouse.wheel(0,amount)
 try:await page.wait_for_function('(y)=>scrollY>y+1',arg=before,timeout=3000)
 except Exception:
  state=await page.evaluate('({y:scrollY,max:document.documentElement.scrollHeight-innerHeight,overflow:getComputedStyle(document.body).overflowY,dialogs:document.querySelectorAll("dialog[open]").length})')
  raise AssertionError(f'Real wheel scroll failed from {before}: {state}')
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox']);errors=[];checks=[]
  for locale,prefix in [('en',''),('pmy','/id')]:
   ctx=await browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce');page=await ctx.new_page();page.on('pageerror',lambda e:errors.append({'url':page.url,'error':str(e)}))
   await page.goto(BASE+prefix+'/topics/',wait_until='domcontentloaded');await page.locator('[data-record-search] input:enabled').wait_for()
   assert await page.locator('[data-following-card]').count()==9
   assert await page.locator('.topics-directory-grid>a').count()>=10
   assert await page.locator('.issues-research-index li').count()==20
   assert await page.locator('.masthead').count()>0
   await page.mouse.move(600,700);await wheel_scroll(page,600)
   search=page.locator('[data-record-search] input');await search.fill('Haji Isham')
   await page.get_by_role('option').first.click(no_wait_after=True)
   await page.wait_for_url('**/topics/south-papua-food-energy-estate/?entity=isam#explore',wait_until='domcontentloaded')
   await page.locator('[data-desk-ready=true]').wait_for(timeout=30000);assert 'entity=isam' in page.url
   checks.append(locale+': mosaic, topics, twenty threads, masthead, wheel scroll and identity search')
   for case in DATA['cases']:
    print(locale,case['id'],flush=True)
    await ready(page,prefix+ROUTES[case['id']]+'#explore')
    assert await page.locator('[data-network-node]').count()==len(case['scene']),case['id']
    assert await page.locator('[data-network-document]').count()>0
    assert await page.locator('.case-document-shelf a').count()>0
    assert await page.locator('.case-records-grid').inner_text()
    first=case['claimIds'][0]
    await page.locator('[data-network-claim="'+first+'"]').focus();await page.keyboard.press('Enter');assert 'claim='+first in page.url
    assert await page.locator('[data-case-reading-title]').inner_text()==next(c for c in DATA['claims'] if c['id']==first)['title'][locale]
    await page.locator('[data-case-evidence]').click();await page.locator('.case-source-dialog').wait_for(state='visible')
    expected=next(c for c in DATA['claims'] if c['id']==first)['evidence'][0]['source'];source=next(s for s in DATA['sources'] if s['id']==expected)
    assert await page.locator('.case-source-dialog .case-source-link').first.get_attribute('href')==source['url']
    share=page.url;await page.reload(wait_until='domcontentloaded');await page.locator('.case-source-dialog').wait_for(state='visible');await page.keyboard.press('Escape');await page.go_back();await page.locator('.case-source-dialog').wait_for(state='visible');await page.keyboard.press('Escape')
    await unlocked(page)
    checks.append(locale+': '+case['id']+' complete network, source links, keyboard, reload/Back and released scroll lock')
   await ready(page,prefix+ROUTES['merauke']+'#explore')
   toggle=page.locator('[data-timeline-expand]');await toggle.click();assert await page.locator('[data-topic-timeline]').get_attribute('data-show-all')=='true';assert await page.locator('[data-timeline-entry]').count()==42;await toggle.click()
   for width in [1150,768,390,320]:
    await page.set_viewport_size({'width':width,'height':900});await ready(page,prefix+ROUTES['merauke']+'#explore')
    assert await page.locator('[data-network-node]').count()==17,'Narrow windows must retain the whole case'
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    box=await page.locator('.case-network-svg').bounding_box();await page.mouse.move(min(width-20,box['x']+box['width']/2),max(170,min(700,box['y']+100)))
    await wheel_scroll(page,400)
    await page.locator('[data-network-node=jokowi]').scroll_into_view_if_needed();await page.locator('[data-network-node=jokowi]').click()
    if width<=800:
     await page.locator('.case-source-dialog').wait_for(state='visible');assert 'Joko Widodo' in await page.locator('.case-source-dialog').inner_text();await page.keyboard.press('Escape')
    assert await page.locator('[data-case-reading-title]').inner_text()=='Joko Widodo'
    await page.locator('[data-network-expand]').click();await page.locator('.case-network-dialog').wait_for(state='visible');await page.keyboard.press('Escape');await unlocked(page)
    await page.locator('[data-case-workbench]').scroll_into_view_if_needed();await page.screenshot(path=str(OUT/f'{locale}-merauke-{width}.png'))
    checks.append(locale+': '+str(width)+' full network, real scrolling, entity reader, expansion and reflow')
   await page.set_viewport_size({'width':1440,'height':1000});await page.goto(BASE+prefix+'/?case=freeport-mimika',wait_until='domcontentloaded');await page.locator('[data-overview-case="freeport-mimika"][aria-pressed=true]').wait_for()
   mapbox=await page.locator('.home-overview-geography').bounding_box();copybox=await page.locator('.home-overview-copy').bounding_box();assert mapbox['width']>1100 and mapbox['y']<copybox['y']
   assert 'security-2025' in await page.locator('[data-overview-records] a').first.get_attribute('href')
   await page.locator('[data-overview-case="south-papua-food-energy-estate"]').click();await page.go_back();assert await page.locator('[data-overview-case="freeport-mimika"]').get_attribute('aria-pressed')=='true'
   await page.locator('[data-home-overview]').scroll_into_view_if_needed();await page.screenshot(path=str(OUT/f'{locale}-home.png'))
   await page.goto(BASE+prefix+'/topics/?case=freeport&claim=security-2025',wait_until='domcontentloaded');await page.locator('[data-desk-ready=true]').wait_for();assert '/topics/freeport-mimika/' in page.url and 'claim=security-2025' in page.url
   checks.append(locale+': Atlas hierarchy, source-backed story previews, Back and old shared URL redirect')
   await ctx.close()
  ctx=await browser.new_context(java_script_enabled=False,viewport={'width':390,'height':900});page=await ctx.new_page();await page.goto(BASE+'/topics/south-papua-food-energy-estate/',wait_until='domcontentloaded');assert await page.locator('.case-no-script article').count()>=42;assert await page.locator('.case-no-script a').count()>=42;checks.append('No JavaScript: full Merauke chronology and original source links');await ctx.close()
  await browser.close();assert not errors,errors
  (OUT/'results.json').write_text(json.dumps({'checks':checks,'pageErrors':errors},indent=2));print(json.dumps({'passed':len(checks),'pageErrors':errors,'screenshots':str(OUT)}))
asyncio.run(main())
