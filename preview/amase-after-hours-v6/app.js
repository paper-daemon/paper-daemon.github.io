/* AMASE / AFTER HOURS. All controls are genuine DOM, no screenshots as UI. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const raw=$("archiveData");if(!raw)return;
let catalog;
try{catalog=JSON.parse(raw.textContent)}catch(err){$("shelfGrid").textContent="棚を読み込めませんでした。";return;}
const keys=new Set();
catalog=catalog.filter(item=>{if(!item||typeof item.href!=="string"||!item.title||keys.has(item.href))return false;keys.add(item.href);return true});
const labels={all:["すべて","ALL"],game:["あそぶ","PLAY"],tool:["無料ツール","TOOLS"],demo:["実験デモ","DEMO"],build:["作ったもの","WORKS"],article:["書きもの","NOTES"],download:["無料DL","FREE"],service:["依頼メニュー","SERVICE"],fav:["♡ 保存したもの","SAVED"]};
let active="all",query="",limit=16,layout="grid",favorites=new Set();
try{const saved=JSON.parse(localStorage.getItem("amase.afterhours.favs.v1")||"[]");if(Array.isArray(saved))favorites=new Set(saved)}catch(err){}
const grid=$("shelfGrid"),tabs=$("shelfTabs"),search=$("shelfSearch");
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function count(k){return k==="all"?catalog.length:k==="fav"?catalog.filter(x=>favorites.has(x.href)).length:catalog.filter(x=>x.kind===k).length}
function renderTabs(){tabs.innerHTML=Object.entries(labels).map(([id,v])=>'<button type="button" data-filter="'+id+'" aria-pressed="'+(id===active)+'">'+v[0]+'<small>'+count(id)+'</small></button>').join("")}
function matching(){const q=query.toLocaleLowerCase("ja");return catalog.filter(x=>(active==="all"||active==="fav"&&favorites.has(x.href)||x.kind===active)&&(!q||(x.title+" "+x.description+" "+(x.eyebrow||"")).toLocaleLowerCase("ja").includes(q)))}
const typeLabel={game:"PLAY / GAME",tool:"FREE / TOOL",demo:"LIVE / DEMO",build:"WORK / RECORD",article:"NOTE / MEMORY",download:"FREE / DOWNLOAD",service:"WORK / MENU"};
const marks={game:"✧",tool:"⌘",demo:"◈",build:"◉",article:"✎",download:"⇩",service:"♢"};
function card(x){
const pic=x.image?'<img src="'+esc(x.image)+'" alt="" loading="lazy">':'<span class="symbol" aria-hidden="true">'+(marks[x.kind]||"✧")+'</span>';
const fav=favorites.has(x.href);
return '<article class="item"><div class="item-header"><span class="item-type">'+(typeLabel[x.kind]||"ARCHIVE")+'</span><button class="item-fav" type="button" data-fav="'+esc(x.href)+'" aria-pressed="'+fav+'" aria-label="'+esc(x.title)+'を'+(fav?"保存から外す":"保存する")+'">'+(fav?"♥":"♡")+'</button></div><div class="item-visual">'+pic+'</div><h3>'+esc(x.title)+'</h3><p>'+esc(x.description)+'</p><a class="item-open" href="'+esc(x.href)+'" data-visit="'+esc(x.href)+'"><span>'+esc(x.cta||"開く")+'</span><span aria-hidden="true">↗</span></a></article>';
}
function render(){
const all=matching(),shown=all.slice(0,limit);
grid.classList.toggle("list",layout==="list");
grid.innerHTML=shown.length?shown.map(card).join(""):'<p class="empty">まだ見つからないみたい。違う言葉でも探してみて。</p>';
$("shelfCount").textContent=shown.length+" / "+all.length+" items";
$("loadMore").hidden=shown.length>=all.length;
$("layoutToggle").setAttribute("aria-pressed",String(layout==="list"));
$("layoutToggle").textContent=layout==="list"?"▦ カードに戻す":"☷ 一覧表示";
renderTabs();
}
tabs.addEventListener("click",event=>{const btn=event.target.closest("button[data-filter]");if(!btn)return;active=btn.dataset.filter;limit=16;render()});
search.addEventListener("input",()=>{query=search.value.trim();limit=16;render()});
$("loadMore").addEventListener("click",()=>{limit+=16;render()});
$("layoutToggle").addEventListener("click",()=>{layout=layout==="grid"?"list":"grid";render()});
grid.addEventListener("click",event=>{
const btn=event.target.closest("button[data-fav]");
if(btn){const id=btn.dataset.fav;if(favorites.has(id))favorites.delete(id);else favorites.add(id);try{localStorage.setItem("amase.afterhours.favs.v1",JSON.stringify([...favorites]))}catch(err){}render();return}
const link=event.target.closest("a[data-visit]");if(link)try{localStorage.setItem("amase.afterhours.recent.v1",link.dataset.visit)}catch(err){}
});
function jump(to,filter){
if(filter&&labels[filter]){active=filter;limit=16;query="";search.value="";render()}
const target=document.getElementById(to);
if(target)target.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"start"});
}
document.querySelectorAll("[data-jump]").forEach(btn=>btn.addEventListener("click",()=>jump(btn.dataset.jump,btn.dataset.category)));
$("openRandom").addEventListener("click",()=>{const games=catalog.filter(x=>x.kind==="game");if(!games.length)return;location.href=games[Math.floor(Math.random()*games.length)].href});
const lamp=$("lampButton"),room=$("room");
lamp.addEventListener("click",()=>{const off=room.classList.toggle("lamp-off");lamp.setAttribute("aria-pressed",String(off));lamp.textContent=off?"☼ 明かりをつける":"☾ 部屋を暗くする"});
const mobile=$("menuButton"),mobileNav=$("mobileNav");
mobile.addEventListener("click",()=>{const open=mobileNav.dataset.open!=="true";mobileNav.dataset.open=String(open);mobile.setAttribute("aria-expanded",String(open));mobile.textContent=open?"閉じる ×":"メニュー ＋"});
mobileNav.addEventListener("click",event=>{if(event.target.closest("a")){mobileNav.dataset.open="false";mobile.setAttribute("aria-expanded","false");mobile.textContent="メニュー ＋"}});
function showTime(){try{$("roomClock").textContent=new Intl.DateTimeFormat("ja-JP",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Asia/Tokyo"}).format(new Date())}catch(err){$("roomClock").textContent="NIGHT"}}
showTime();setInterval(showTime,60000);
const tip=$("roomTip");
$("roomMessage").addEventListener("click",()=>{tip.hidden=!tip.hidden;if(!tip.hidden)tip.querySelector("button").focus()});
$("closeTip").addEventListener("click",()=>{tip.hidden=true;$("roomMessage").focus()});
document.addEventListener("keydown",event=>{
const tag=document.activeElement?.tagName?.toLowerCase();
if((event.key==="/"&&!["input","textarea"].includes(tag))||((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k")){event.preventDefault();jump("shelf");search.focus({preventScroll:true})}
if(event.key==="Escape"){if(!tip.hidden)tip.hidden=true;else if(document.activeElement===search){search.value="";query="";search.blur();limit=16;render()}}
});
render();
})();
