import {chromium} from 'playwright';
import fs from 'node:fs';
const url=process.env.PREVIEW_URL||'https://etnos-forum-explore.etnos-watch-lab.pages.dev/etnos/';
fs.mkdirSync('/tmp/etnos-shots',{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox']});
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'networkidle'});await page.locator('#forum-feed .content-row').first().waitFor({timeout:30000});
 await page.screenshot({path:`/tmp/etnos-shots/${name}-initial.png`,fullPage:false});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(`${name}: horizontal overflow `+JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth).map(e=>({tag:e.tagName,class:e.className})))));
 await page.screenshot({path:`/tmp/etnos-shots/${name}-forum.png`,fullPage:false});
 await page.locator('[data-destination="explore"]').click();await page.locator('#explore-feed .content-row').first().waitFor({timeout:30000});
 await page.waitForFunction(()=>document.querySelector('#explore-map')?.getAttribute('data-ready')==='true',{},{timeout:30000});
 await page.screenshot({path:`/tmp/etnos-shots/${name}-explore.png`,fullPage:false});
 await page.locator('[data-section="wiki"]').click();await page.waitForFunction(()=>document.querySelector('#explore-provenance')?.textContent?.includes('Referensi'));await page.locator('#explore-feed .content-row').first().waitFor({timeout:30000});
 await page.screenshot({path:`/tmp/etnos-shots/${name}-wiki.png`,fullPage:false});
 if(errors.length)throw new Error(errors.join('\n'));
 console.log(`${name}: forum, news, wiki loaded; no overflow or page errors`);await page.close();
}
await browser.close();
