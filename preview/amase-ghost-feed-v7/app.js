/* AMASE / GHOST FEED V7. Real DOM interaction; all source links remain native. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const raw=$("allEntries");
if(!raw)return;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let items;
try{items=JSON.parse(raw.textContent)}catch(err){$("archiveResults").textContent="記録を読み込めませんでした";return}
const ids=new Set();items=items.filter(x=>{if(!x||!x.title||!x.href||ids.has(x.href))return false;ids.add(x.href);return true});
const filterSpec=[
 ["all","すべて"],["game","ゲーム"],["tool","無料ツール"],["demo","動くデモ"],["build","作ったもの"],
 ["article","書いたこと"],["download","無料DL"],["service","お仕事"],["fav","保存"]
];
const kindLabel={game:"PLAYABLE",tool:"UTILITY",demo:"INTERACTIVE",build:"RELEASE",article:"NOTE",download:"DOWNLOAD",service:"WORK"};
let filter="all",query="",limit=12,compact=false,saved=new Set(),postSaved=new Set(),showExtra=false;
try{const s=JSON.parse(localStorage.getItem("amase.ghost.saved.v1")||"[]");if(Array.isArray(s))saved=new Set(s)}catch(err){}
try{const p=JSON.parse(localStorage.getItem("amase.ghost.fragments.v1")||"[]");if(Array.isArray(p))postSaved=new Set(p)}catch(err){}
const grid=$("archiveResults"),search=$("archiveSearch"),tabs=$("archiveTabs"),count=$("archiveCount"),more=$("moreArchive");
function counts(k){if(k==="all")return items.length;if(k==="fav")return items.filter(x=>saved.has(x.href)).length;return items.filter(x=>x.kind===k).length}
function matches(x){
if(filter==="fav"&&!saved.has(x.href))return false;
if(filter!=="all"&&filter!=="fav"&&x.kind!==filter)return false;
if(!query)return true;
return (x.title+" "+x.description+" "+(x.eyebrow||"")).toLocaleLowerCase("ja").includes(query.toLocaleLowerCase("ja"));
}
function card(x){
const fav=saved.has(x.href),type=kindLabel[x.kind]||"RECORD";
return '<article class="archive-card"><div class="row"><span class="type">'+type+'</span><button type="button" data-fav="'+esc(x.href)+'" aria-pressed="'+fav+'" aria-label="'+esc(x.title)+'を'+(fav?"保存から外す":"保存")+'">'+(fav?"♥":"♡")+'</button></div><strong>'+esc(x.title)+'</strong><p>'+esc(x.description)+'</p><a href="'+esc(x.href)+'">開く ↗</a></article>';
}
function renderTabs(){tabs.innerHTML=filterSpec.map(([k,label])=>'<button type="button" data-kind="'+k+'" aria-pressed="'+(k===filter)+'">'+label+' <span class="mono">'+counts(k)+'</span></button>').join("")}
function render(){
const filtered=items.filter(matches),shown=filtered.slice(0,limit);
grid.innerHTML=shown.length?shown.map(card).join(""):'<div class="archive-empty">この条件の記録はないみたい。<br>別の言葉でも探してみて。</div>';
count.textContent=shown.length+" / "+filtered.length+" ENTRIES";
more.hidden=shown.length===filtered.length;
renderTabs();
$("layoutButton").setAttribute("aria-pressed",String(compact));
$("layoutButton").textContent=compact?"▦ ふつうに見る":"☷ 小さく並べる";
grid.classList.toggle("dense",compact);
}
tabs.addEventListener("click",event=>{const b=event.target.closest("button[data-kind]");if(!b)return;filter=b.dataset.kind;limit=12;render()});
search.addEventListener("input",()=>{query=search.value.trim();limit=12;render()});
more.addEventListener("click",()=>{limit+=12;render()});
grid.addEventListener("click",event=>{
const btn=event.target.closest("[data-fav]");if(!btn)return;
const h=btn.dataset.fav;if(saved.has(h))saved.delete(h);else saved.add(h);
try{localStorage.setItem("amase.ghost.saved.v1",JSON.stringify([...saved]))}catch(err){}
render();
});
$("layoutButton").addEventListener("click",()=>{compact=!compact;render()});
$("randomPlay").addEventListener("click",()=>{
const games=items.filter(x=>x.kind==="game");if(!games.length)return;
location.href=games[Math.floor(Math.random()*games.length)].href;
});
const feedTabs=$("feedTabs"),feedPosts=$("feedPosts");
let activeFeed="all";
function feedFilter(next){
activeFeed=next;
for(const b of feedTabs.querySelectorAll("button[data-feed]"))b.setAttribute("aria-pressed",String(b.dataset.feed===next));
const nodes=[...feedPosts.querySelectorAll(".feed-post")];
for(const node of nodes){
const matches=next==="all"||node.dataset.feedkind===next;
const extra=node.dataset.extra==="true";
node.hidden=!matches||(extra&&!showExtra);
}
const extraAvailable=nodes.some(n=>n.dataset.extra==="true"&&(next==="all"||n.dataset.feedkind===next));
$("feedMore").hidden=!extraAvailable;
$("feedMore").textContent=showExtra?"前のところまで戻す ↑":"続きも読む ↓";
}
feedTabs.addEventListener("click",e=>{const b=e.target.closest("button[data-feed]");if(b){showExtra=false;feedFilter(b.dataset.feed)}});
$("feedMore").addEventListener("click",()=>{showExtra=!showExtra;feedFilter(activeFeed)});
feedPosts.addEventListener("click",e=>{
const b=e.target.closest("button[data-spark]");if(!b)return;
const key=b.dataset.spark;if(postSaved.has(key))postSaved.delete(key);else postSaved.add(key);
try{localStorage.setItem("amase.ghost.fragments.v1",JSON.stringify([...postSaved]))}catch(err){}
b.setAttribute("aria-pressed",String(postSaved.has(key)));
b.textContent=postSaved.has(key)?"♥ そっと保存した":"♡ 保存しておく";
});
for(const b of feedPosts.querySelectorAll("button[data-spark]")){const yes=postSaved.has(b.dataset.spark);b.setAttribute("aria-pressed",String(yes));b.textContent=yes?"♥ そっと保存した":"♡ 保存しておく"}
const toggle=$("signalButton");
toggle.addEventListener("click",()=>{
const on=document.body.dataset.signal!=="on";
document.body.dataset.signal=on?"on":"off";
toggle.setAttribute("aria-pressed",String(on));
toggle.querySelector(".mode-label").textContent=on?"SIGNAL ON":"SIGNAL OFF";
try{localStorage.setItem("amase.ghost.signal.v1",on?"on":"off")}catch(err){}
});
try{if(localStorage.getItem("amase.ghost.signal.v1")==="on")toggle.click()}catch(err){}
const mobileMenu=$("mobileMenu"),menuButton=$("menuButton");
menuButton.addEventListener("click",()=>{const on=mobileMenu.dataset.open!=="true";mobileMenu.dataset.open=String(on);menuButton.setAttribute("aria-expanded",String(on));menuButton.textContent=on?"閉じる ×":"MENU ＋"});
mobileMenu.addEventListener("click",e=>{if(e.target.closest("a")){mobileMenu.dataset.open="false";menuButton.setAttribute("aria-expanded","false");menuButton.textContent="MENU ＋"}});
$("searchOpen").addEventListener("click",()=>{
$("archive").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"});
search.focus({preventScroll:true});
});
function clock(){
const t=new Date();
try{$("localClock").textContent=new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",hour:"2-digit",minute:"2-digit",hour12:false}).format(t)+" JST"}catch(e){$("localClock").textContent="JST"}
}
clock();
setInterval(clock,60000);
document.addEventListener("keydown",e=>{
const tag=document.activeElement?.tagName?.toLowerCase();
if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"||(e.key==="/"&&!["input","textarea"].includes(tag))){
e.preventDefault();$("archive").scrollIntoView({behavior:"smooth"});search.focus({preventScroll:true});
}
if(e.key==="Escape"&&document.activeElement===search){search.value="";query="";limit=12;render();search.blur()}
});
renderTabs();render();feedFilter("all");
})();
