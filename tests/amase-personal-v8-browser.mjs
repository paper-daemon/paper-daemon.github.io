import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
const root=process.env.SHELF_TEST_ORIGIN||"http://127.0.0.1:4173";
const browser=await chromium.launch({headless:true});
await mkdir("artifacts/amase-personal-v8",{recursive:true});
try{
for(const cfg of [{name:"desktop",viewport:{width:1440,height:900}},{name:"mobile",viewport:{width:390,height:844},isMobile:true,hasTouch:true}]){
  const page=await browser.newPage({viewport:cfg.viewport,isMobile:cfg.isMobile,hasTouch:cfg.hasTouch,reducedMotion:"reduce"});
  const exceptions=[];page.on("pageerror",e=>exceptions.push(e.message));
  await page.goto(root+"/preview/amase-personal-v8/index.html",{waitUntil:"domcontentloaded"});
  await page.locator(".entry").first().waitFor({timeout:15000});
  assert.equal(await page.locator("#catalogChips button[data-kind='all'] small").innerText(),"106","live 106 entries");
  assert.equal(await page.locator(".entry").count(),14,"initial rows");
  assert.equal(await page.locator(".project").count(),4,"actual featured game links");
  assert.equal(await page.locator(".note-row").count(),5,"actual note links");
  assert.equal(await page.locator(".tool-card").count(),2,"real utilities");
  assert.equal(await page.locator(".about img[src='/amase-avatar.jpg']").count(),1,"single modest avatar");
  assert.equal(await page.locator("img[src='/amase-avatar.jpg']").count(),1,"no vanity photos elsewhere");
  const core=await page.locator("#heroCore").boundingBox();
  assert(core&&core.width>=200&&core.height>=140,"live Canvas functional area");
  await page.locator("#catalogChips button[data-kind='game']").click();
  assert.equal(await page.locator(".entry").count(),8,"8 actual playable games");
  await page.locator("#catalogChips button[data-kind='demo']").click();
  assert.equal(await page.locator("#catalogCount").innerText(),"14 / 46 件を表示","46 real demos");
  await page.locator("#catalogChips button[data-kind='download']").click();
  assert.equal(await page.locator(".entry").count(),6,"six actual downloads");
  await page.locator("#catalogChips button[data-kind='all']").click();
  await page.locator("#catalogSearch").fill("おみくじ");
  assert.equal(await page.locator(".entry").count(),1,"real searchable item");
  await page.locator(".entry .save").first().click();
  await page.locator("#catalogSearch").fill("");
  await page.locator("#catalogChips button[data-kind='saved']").click();
  assert.equal(await page.locator(".entry").count(),1,"favorites filter");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#catalogChips button[data-kind='saved']").click();
  assert.equal(await page.locator(".entry").count(),1,"favorites persisted across reload");
  await page.locator("#catalogChips button[data-kind='all']").click();
  await page.locator("#catalogMore").click();
  assert.equal(await page.locator(".entry").count(),28,"load more real entries");
  await page.locator("#catalogMode").click();
  assert(await page.locator("#catalogResults").evaluate(x=>x.classList.contains("tiles")),"tiles layout");
  await page.locator("[data-category-link='game']").click();
  assert.equal(await page.locator(".entry").count(),8,"featured section game filter link");
  if(cfg.isMobile){
    await page.locator("#menuToggle").click();
    assert.equal(await page.locator("#mobileMenu").getAttribute("data-open"),"true");
    await page.locator("#mobileMenu a[href='#tools']").click();
    assert.equal(await page.locator("#mobileMenu").getAttribute("data-open"),"false");
  }
  const measurement=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll("body *")].filter(el=>el.getBoundingClientRect().right>document.documentElement.clientWidth+2).slice(0,9).map(el=>({tag:el.tagName,cls:String(el.className||"").slice(0,40),right:Math.round(el.getBoundingClientRect().right)}))}));
  if(measurement.scroll-measurement.viewport>2)console.log("OVERFLOW_DIAGNOSTIC",cfg.name,JSON.stringify(measurement));
  assert(measurement.scroll-measurement.viewport<=2,cfg.name+" horizontal overflow");
  assert.deepEqual(exceptions,[],cfg.name+" JS errors");
  await page.screenshot({path:"artifacts/amase-personal-v8/"+cfg.name+".png",fullPage:true,animations:"disabled"});
  console.log("AMASE_PERSONAL_"+cfg.name.toUpperCase()+"_PASSED",JSON.stringify({coreWidth:core.width,overflow:measurement.scroll-measurement.viewport,realEntries:106,errors:0}));
  await page.close();
}
}finally{await browser.close()}
console.log("AMASE_PERSONAL_V8_ALL_PASSED");
