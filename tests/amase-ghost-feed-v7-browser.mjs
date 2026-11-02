import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
const base=process.env.SHELF_TEST_ORIGIN||"http://127.0.0.1:4173";
const browser=await chromium.launch({headless:true});
await mkdir("artifacts/ghost-feed-v7",{recursive:true});
try{
for(const cfg of [{name:"desktop",viewport:{width:1450,height:950}},{name:"mobile",viewport:{width:390,height:844},isMobile:true,hasTouch:true}]){
const page=await browser.newPage({viewport:cfg.viewport,isMobile:cfg.isMobile,hasTouch:cfg.hasTouch,reducedMotion:"reduce"});
const exceptions=[];
page.on("pageerror",e=>exceptions.push(e.message));
await page.goto(base+"/preview/amase-ghost-feed-v7/index.html",{waitUntil:"domcontentloaded"});
await page.locator(".archive-card").first().waitFor({timeout:12000});
assert.equal(await page.locator("#archiveTabs button[data-kind='all'] .mono").innerText(),"106");
assert.equal(await page.locator(".archive-card").count(),12,"initial 12 cards");
assert.equal(await page.locator(".feed-post").count(),11,"all static feed posts, including extras");
assert.equal(await page.locator(".feed-post:visible").count(),7,"visible base posts");
assert((await page.locator("#heroCore").boundingBox())?.width>200,"actual SI canvas width");
await page.locator("#feedTabs button[data-feed='play']").click();
assert.equal(await page.locator(".feed-post:visible").count(),1,"play filtered");
await page.locator("#feedTabs button[data-feed='all']").click();
await page.locator("#feedMore").click();
assert.equal(await page.locator(".feed-post:visible").count(),11,"show extra entries");
await page.locator("#signalButton").click();
assert.equal(await page.locator("body").getAttribute("data-signal"),"on");
await page.locator("#archiveTabs button[data-kind='game']").click();
assert.equal(await page.locator(".archive-card").count(),8,"8 real games");
await page.locator("#archiveTabs button[data-kind='demo']").click();
assert.equal(await page.locator("#archiveCount").innerText(),"12 / 46 ENTRIES");
await page.locator("#archiveTabs button[data-kind='download']").click();
assert.equal(await page.locator(".archive-card").count(),6,"6 actual downloads");
await page.locator("#archiveTabs button[data-kind='all']").click();
await page.locator("#archiveSearch").fill("おみくじ");
assert.equal(await page.locator(".archive-card").count(),1,"search actual game");
await page.locator(".archive-card button[data-fav]").click();
await page.locator("#archiveSearch").fill("");
await page.locator("#archiveTabs button[data-kind='fav']").click();
assert.equal(await page.locator(".archive-card").count(),1,"favorite");
await page.locator("#archiveTabs button[data-kind='all']").click();
await page.locator("#moreArchive").click();
assert.equal(await page.locator(".archive-card").count(),24,"progressive loading");
await page.locator("#layoutButton").click();
assert(await page.locator("#archiveResults").evaluate(el=>el.classList.contains("dense")),"layout toggle");
if(cfg.isMobile){
await page.locator("#menuButton").click();
assert.equal(await page.locator("#mobileMenu").getAttribute("data-open"),"true");
await page.locator("#mobileMenu a[href='#feed']").click();
assert.equal(await page.locator("#mobileMenu").getAttribute("data-open"),"false");
}
const metric=await page.evaluate(()=>({vw:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll("body *")].filter(el=>{const box=el.getBoundingClientRect();return box.left< -3||box.right>document.documentElement.clientWidth+3}).slice(0,10).map(el=>({tag:el.tagName,cls:String(el.className||"").slice(0,50)}))}));
if(metric.sw>metric.vw+2)console.log("OVERFLOW",cfg.name,JSON.stringify(metric));
assert(metric.sw<=metric.vw+2,cfg.name+" horizontal overflow "+(metric.sw-metric.vw));
assert.deepEqual(exceptions,[],"runtime errors: "+exceptions.join(","));
await page.screenshot({path:"artifacts/ghost-feed-v7/"+cfg.name+".png",fullPage:true,animations:"disabled"});
console.log("GHOST_FEED_"+cfg.name.toUpperCase()+"_PASSED",JSON.stringify({inventory:106,posts:11,overflow:metric.sw-metric.vw,exceptions:exceptions.length}));
await page.close();
}
}finally{await browser.close()}
console.log("GHOST_FEED_V7_ALL_PASSED");
