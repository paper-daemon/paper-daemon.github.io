import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";

const browser=await chromium.launch({headless:true});
const origin=process.env.SHELF_TEST_ORIGIN||"http://127.0.0.1:4173";
const outDir="artifacts/shelfiria-v5";
await mkdir(outDir,{recursive:true});
let failures=[];
try{
for(const config of [
 {label:"desktop",viewport:{width:1440,height:960}},
 {label:"mobile",viewport:{width:390,height:844},isMobile:true,hasTouch:true}
]){
 const page=await browser.newPage(config);
 const errors=[];
 page.on("pageerror",e=>errors.push("pageerror: "+e.message));
 await page.goto(origin+"/preview/shelfiria-v5/index.html",{waitUntil:"domcontentloaded"});
 await page.locator("#results .catalog-card").first().waitFor({timeout:15000});
 const count=await page.locator("#results .catalog-card").count();
 assert.equal(count,26,config.label+" catalog items");
 assert.equal(await page.locator("#heroCore").count(),1,"interactive original canvas present");
 assert.equal(await page.locator("#results a.c-link").count(),26);
 const box=await page.locator("#heroCore").boundingBox();
 assert(box&&box.width>120&&box.height>100,config.label+" canvas dimensions");
 await page.locator("#results .catalog-card").first().locator("button.favorite-btn").click();
 assert.equal(await page.locator("#filterList .filter-btn[data-kind='fav'] .filter-num").innerText(),"01");
 await page.locator("#filterList .filter-btn[data-kind='fav']").click();
 assert.equal(await page.locator("#results .catalog-card").count(),1,config.label+" favorites filter");
 await page.locator("#filterList .filter-btn[data-kind='game']").click();
 assert.equal(await page.locator("#results .catalog-card").count(),8,config.label+" games filter");
 await page.locator("#searchField").fill("タイミング");
 assert.equal(await page.locator("#results .catalog-card").count(),1,config.label+" search");
 await page.locator("#searchField").fill("");
 await page.locator("#filterList .filter-btn[data-kind='all']").click();
 assert.equal(await page.locator("#results .catalog-card").count(),26);
 await page.locator("#listButton").click();
 assert(await page.locator("#results").evaluate(el=>el.classList.contains("list-view")));
 await page.locator("#gridButton").click();
 await page.locator("#lightToggle").click();
 assert(await page.locator("body").evaluate(el=>el.classList.contains("soft-glow")));
 if(config.isMobile){
  await page.locator("#mobileMenu").click();
  assert.equal(await page.locator("#mobileNav").getAttribute("data-open"),"true");
  await page.locator("#mobileNav a[href='#arcade']").click();
  assert.equal(await page.locator("#mobileNav").getAttribute("data-open"),"false");
 }
 await page.locator("#filterList .filter-btn[data-kind='all']").click();
 await page.screenshot({path:outDir+"/"+config.label+".png",fullPage:true,animations:"disabled"});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 assert(overflow<=2,config.label+" document overflow "+overflow+"px");
 assert.deepEqual(errors,[],config.label+" JS runtime exceptions");
 console.log(config.label+" PASSED",JSON.stringify({count,canvasWidth:Math.round(box.width),overflow,errors:errors.length}));
 await page.close();
}
const games=["shooter","omikuji","core","slot","janken","guess","timing","secret"];
for(const name of games){
 const page=await browser.newPage({viewport:{width:1000,height:850}});
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto(origin+"/preview/retro-holo-v4/play/"+name+".html",{waitUntil:"domcontentloaded"});
 const main=await page.locator("body").innerText();
 assert(main.length>40,"Game "+name+" missing content");
 assert((await page.title()).length>3,"Game "+name+" title missing");
 console.log("game",name,"OK");
 await page.close();
}
} catch(e){failures.push(e.stack||String(e));console.error(e);}
finally{await browser.close();}
if(failures.length)process.exit(1);
console.log("SHELFIRIA_V5_TEST_PASSED");
