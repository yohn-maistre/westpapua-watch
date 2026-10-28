"""Built-site checks. Ask/News answers use explicit fixtures; no model calls.
Run after npm run build with Astro preview running. BASE_URL/CAPTURE_DIR optional.
"""
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path(os.getenv('CAPTURE_DIR','/tmp/watch-interaction-polish'));OUT.mkdir(parents=True,exist_ok=True);BASE=os.getenv('BASE_URL','http://localhost:4321')
D=json.loads(Path('content/investigative-record.json').read_text());sources=[{'title':s['title'],'url':s['url'],'publisher':s.get('publisher','Watch source record')} for s in D['sources'][:2]]
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);checks=[]
  for w in [1440,768,390,320]:
   ctx=await b.new_context(viewport={'width':w,'height':900 if w>500 else 844},reduced_motion='reduce');page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'/history/',wait_until='domcontentloaded');await page.locator('[data-discovery-seed]').wait_for(state='attached');await page.screenshot(path=str(OUT/f'ticker-{w}.png'))
   ticker=await page.locator('[data-following-ticker]').bounding_box();assert ticker['height']<=48,ticker
   assert await page.locator('[data-following-ticker] strong').first.evaluate('(e)=>getComputedStyle(e).whiteSpace')=='nowrap'
   assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth+1')
   await page.locator('.masthead [data-ask-open]').click();await page.locator('[data-ask-dialog]').wait_for(state='visible');await page.screenshot(path=str(OUT/f'ask-empty-{w}.png'))
   box=await page.locator('[data-ask-dialog]').bounding_box();assert box['height']<550 if w>520 else box['height']>=840
   counter=0
   async def mock(route):
    nonlocal counter
    counter+=1
    if counter==4:await asyncio.sleep(2);await route.fulfill(status=503,content_type='application/json',body='{}');return
    await asyncio.sleep(.4);await route.fulfill(content_type='application/json',body=json.dumps({'answer':'The records describe the court proceedings and their background. [S1]\n\n'+('\n\n'.join('A dated paragraph with evidence and context, presented as a test fixture rather than a published Watch answer.' for _ in range(10)))+' [S2]','sources':sources}))
   await page.route('**/api/ask',mock);await page.route('**/api/search?*',lambda route:route.fulfill(content_type='application/json',body='{"items":[]}'))
   await page.locator('[data-ask-input]').fill('Show me the source records for this case');await page.locator('[data-ask-submit]').click();await page.locator('.ask-message-assistant').wait_for();await page.screenshot(path=str(OUT/f'ask-answer-{w}.png'))
   await page.locator('.ask-message-assistant .ask-message-text a').first.click();assert await page.locator('.ask-message details').first.get_attribute('open') is not None;await page.screenshot(path=str(OUT/f'ask-sources-{w}.png'))
   await page.locator('[data-ask-input]').fill('Explain the next development');await page.locator('[data-ask-submit]').click();await page.locator('.ask-message-assistant').nth(1).wait_for()
   # While a subsequent answer arrives, retain a reader's position in the old answer.
   await page.locator('[data-ask-input]').fill('Compare these dated reports');await page.locator('[data-ask-submit]').click();await page.locator('[data-ask-scroll]').evaluate('(e)=>e.scrollTop=30');await page.locator('.ask-message-assistant').nth(2).wait_for();assert await page.locator('[data-ask-scroll]').evaluate('(e)=>e.scrollTop')<50
   await page.locator('[data-ask-input]').fill('Please explain the source');await page.locator('[data-ask-submit]').click();await page.locator('[data-ask-input]').fill('Keep my next question');await page.locator('[data-ask-stop]').click();await page.locator('[data-ask-submit]:enabled').wait_for();assert await page.locator('[data-ask-input]').input_value()=='Keep my next question'
   await page.keyboard.press('Escape');assert await page.locator('.masthead [data-ask-open]').evaluate('(e)=>e===document.activeElement')
   # Public news: fixtures verify selectors/URL/Back, not editorial output quality.
   async def current(route):
    from urllib.parse import urlparse,parse_qs
    q=parse_qs(urlparse(route.request.url).query);desk=q.get('desk',['focus'])[0]
    await route.fulfill(content_type='application/json',body=json.dumps({'items':[{'id':i,'story_url':'/story/?id='+str(i),'title':{'en':desk.title()+' — a sourced story','id':'Kisah dengan sumber'},'summary':{'en':'A summary with the original episode and its latest documented outcome.','id':'Ringkasan peristiwa dan perkembangan yang terdokumentasi.'},'sources':[{'publisher_id':'jubi','publisher':'Jubi','role':'local_newsroom'},{'publisher_id':'antara','publisher':'ANTARA','role':'state_media'}],'source_count':2,'article_count':3,'latest_report_at':'2026-10-28T03:00:00Z','category':'human rights','place':'Nduga'} for i in range(1,5)],'selection':{'version':1,'desk':desk,'scope':'published'},'place_options':[{'slug':'nduga','name':'Nduga'}],'pagination':{'has_more':False},'meta':{}}))
   await page.route('**/api/current?*',current);await page.goto(BASE+'/news/?desk=rights',wait_until='domcontentloaded');await page.locator('[data-current-hero][aria-busy=false]').wait_for();assert await page.locator('[data-current-title]').inner_text()=='Rights — a sourced story';assert await page.locator('[data-news-desk=rights]').get_attribute('aria-current')=='page'
   await page.locator('[data-news-desk=land]').click();await page.wait_for_function("()=>document.querySelector('[data-current-title]').textContent.startsWith('Land')");assert 'desk=land' in page.url;await page.locator('[data-news-place]').select_option('nduga');await page.wait_for_url('**place=nduga');await page.go_back();assert 'place=' not in page.url;await page.wait_for_function("()=>document.querySelector('[data-current-hero]').getAttribute('aria-busy')==='false'");assert await page.locator('.hero.has-no-image').count()==1;await page.screenshot(path=str(OUT/f'news-{w}.png'));assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth+1')
   await page.route('**/api/development/1',lambda route:route.fulfill(content_type='application/json',body=json.dumps({'development':{'title_en':'An episode and its outcome','title_id':'Peristiwa dan perkembangannya','summary_en':'Sourced account','summary_id':'Catatan bersumber'},'articles':[],'issues':[],'places':[]})))
   await page.locator('[data-current-story]').click();await page.locator('[data-story-content]:not([hidden])').wait_for();await page.locator('.story-back').click();await page.wait_for_url('**/news/?desk=land');await page.locator('[data-current-hero][aria-busy=false]').wait_for()
   assert not errors,errors;checks.append({'width':w,'tickerHeight':ticker['height'],'askEmptyHeight':box['height'],'errors':errors});print(checks[-1],flush=True);await ctx.close()
  await b.close();(OUT/'browser-results.json').write_text(json.dumps(checks,indent=2))
asyncio.run(main())
