import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
const base=process.env.SHELF_TEST_ORIGIN||"http://127.0.0.1:4173";
const url=base+"/preview/amase-after-hours-v6/index.html";
const browser=await chromium.launch({headless:true});
await mkdir("artifacts/after-hours-v6",{recursive:true});
try{
for(const cfg of [{name:"desktop",viewport:{width:1440,height:930}},{name:"mobile",viewport:{width:390,height:844},isMobile:true,hasTouch:true}]){
 const page=await browser.newPage({viewport:cfg.viewport,isMobile:cfg.isMobile,hasTouch:cfg.hasTouch,reducedMotion:"reduce"});
 const problems=[];
 page.on("pageerror",err=>problems.push("pageerror: "+err.message));
 await page.goto(url,{waitUntil:"domcontentloaded"});
 await page.locator(".item").first().waitFor({timeout:15000});
 assert.equal(await page.locator("#shelfTabs button[data-filter='all'] small").innerText(),"106",cfg.name+" real inventory count");
 assert.equal(await page.locator(".item").count(),16,cfg.name+" initial progressive load");
 assert.equal(await page.locator(".work-card").count(),3,cfg.name+" live featured games");
 const core=await page.locator("#heroCore").boundingBox();
 assert(core&&core.width>190&&core.height>140,cfg.name+" original live canvas viewport");
 await page.locator("#shelfTabs button[data-filter='game']").click();
 assert.equal(await page.locator(".item").count(),8,cfg.name+" game filter");
 await page.locator("#shelfTabs button[data-filter='demo']").click();
 assert.equal(await page.locator("#shelfCount").innerText(),"16 / 46 items",cfg.name+" 46 real live demos");
 await page.locator("#shelfTabs button[data-filter='download']").click();
 assert.equal(await page.locator(".item").count(),6,cfg.name+" six free downloads");
 await page.locator("#shelfTabs button[data-filter='all']").click();
 await page.locator("#shelfSearch").fill("おみくじ");
 assert.equal(await page.locator(".item").count(),1,cfg.name+" search item");
 const named=await page.locator(".item h3").first().innerText();assert(named.includes("おみくじ"));
 await page.locator(".item .item-fav").first().click();
 await page.locator("#shelfSearch").fill("");
 await page.locator("#shelfTabs button[data-filter='fav']").click();
 assert.equal(await page.locator(".item").count(),1,cfg.name+" favorites persist in state");
 await page.locator("#shelfTabs button[data-filter='all']").click();
 await page.locator("#layoutToggle").click();
 assert(await page.locator("#shelfGrid").evaluate(el=>el.classList.contains("list")));
 await page.locator("#layoutToggle").click();
 await page.locator("#loadMore").click();
 assert.equal(await page.locator(".item").count(),32,cfg.name+" progressive show-more");
 await page.locator("#lampButton").click();
 assert(await page.locator("#room").evaluate(el=>el.classList.contains("lamp-off")),cfg.name+" room lamp interaction");
 await page.locator("#roomMessage").click();
 assert.equal(await page.locator("#roomTip").isVisible(),true);
 await page.locator("#closeTip").click();
 assert.equal(await page.locator("#roomTip").isVisible(),false);
 if(cfg.isMobile){
   await page.locator("#menuButton").click();
   assert.equal(await page.locator("#mobileNav").getAttribute("data-open"),"true");
   await page.locator("#mobileNav a[href='#shelf']").click();
   assert.equal(await page.locator("#mobileNav").getAttribute("data-open"),"false");
 }
 const errs=await page.evaluate(()=>({
  vw:document.documentElement.clientWidth,
  documentWidth:document.documentElement.scrollWidth,
  offenders:[...document.querySelectorAll("body *")].filter(el=>el.getBoundingClientRect().left< -3||el.getBoundingClientRect().right>document.documentElement.clientWidth+3).map(el=>({tag:el.tagName,cls:String(el.className||"").slice(0,70),right:Math.round(el.getBoundingClientRect().right)})).slice(0,12)
 }));
 if(errs.documentWidth-errs.vw>2)console.log("OVERFLOW",cfg.name,JSON.stringify(errs));
 assert(errs.documentWidth-errs.vw<=2,cfg.name+" mobile horizontal overflow");
 assert.deepEqual(problems,[],cfg.name+" JS runtime errors");
 await page.screenshot({path:"artifacts/after-hours-v6/"+cfg.name+".png",fullPage:true,animations:"disabled"});
 console.log("AFTER_HOURS_"+cfg.name.toUpperCase()+"_PASSED",JSON.stringify({all:106,coreWidth:core.width,overflow:errs.documentWidth-errs.vw}));
 await page.close();
}
}finally{await browser.close();}
console.log("AMASE_AFTER_HOURS_V6_BROWSER_PASSED");
