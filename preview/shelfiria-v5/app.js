/* SHELFIRIA / Holographic Shelf v5, real DOM interactions.
   Game render code stays in original index-derived script, separate from this UI. */
(function(){
"use strict";
const dataElement=document.getElementById("realCatalog");
if(!dataElement)return;
let items=[];
try{items=JSON.parse(dataElement.textContent)}catch(e){document.getElementById("results").textContent="読み込みに失敗しました。";return}
const categories=[
 {id:"all",label:"すべて",icon:"✳"},
 {id:"game",label:"ゲーム",icon:"◇"},
 {id:"tool",label:"ツール",icon:"⌘"},
 {id:"article",label:"記事",icon:"▤"},
 {id:"service",label:"おまけ",icon:"↗"},
 {id:"fav",label:"お気に入り",icon:"♡"}
];
let active="all",search="",view="grid",favorites=new Set(),recent=null;
try{const stored=JSON.parse(localStorage.getItem("shelfiria-favorites.v5")||"[]");if(Array.isArray(stored))favorites=new Set(stored);recent=JSON.parse(localStorage.getItem("shelfiria-recent.v5")||"null")}catch(e){}
const $=id=>document.getElementById(id);
const categoriesEl=$("filterList"),results=$("results"),searchField=$("searchField");
function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function counts(id){if(id==="all")return items.length;if(id==="fav")return items.filter(x=>favorites.has(x.id)).length;return items.filter(x=>x.kind===id).length}
function escapeAttr(v){return escapeHTML(v)}
function formatNum(n){return String(n).padStart(2,"0")}
function setupRail(){
 categoriesEl.innerHTML=categories.map(c=>'<button class="filter-btn'+(active===c.id?' active':'')+'" type="button" data-kind="'+c.id+'" aria-pressed="'+(active===c.id)+'"><span class="f-icon" aria-hidden="true">'+c.icon+'</span><span>'+c.label+'</span><span class="filter-num">'+formatNum(counts(c.id))+'</span></button>').join("");
}
function matchItem(x){
 const q=search.toLocaleLowerCase("ja");
 const category=active==="all"||(active==="fav"?favorites.has(x.id):x.kind===active);
 const content=(x.title+" "+x.description+" "+x.eyebrow).toLocaleLowerCase("ja");
 return category&&(!q||content.includes(q));
}
function remember(x){
 try{localStorage.setItem("shelfiria-recent.v5",JSON.stringify({id:x.id,href:x.href,title:x.title,kind:x.kind}))}catch(e){}
}
function renderCard(x){
 const color={game:"#8ef6f1",tool:"#aeb2ff",article:"#ff9bd9",service:"#e6d59d"}[x.kind]||"#9bf6ed";
 const badge={game:"GAME / PLAY",tool:"TOOL / USE",article:"ARTICLE / READ",service:"SERVICE / MORE"}[x.kind];
 const visual=x.image?'<img src="'+escapeAttr(x.image)+'" alt="" loading="lazy">':'<span class="symbol" aria-hidden="true">'+escapeHTML(x.symbol||"✳")+'</span>';
 const fav=favorites.has(x.id);
 return '<article class="catalog-card'+(view==="list"?' list-layout':'')+'" style="--item-accent:'+color+'">'+
 '<div class="c-top"><span class="c-category">'+badge+'</span><button type="button" class="favorite-btn" data-favorite="'+escapeAttr(x.id)+'" aria-label="'+escapeAttr(x.title)+'をお気に入り'+(fav?'から外す':'に追加する')+'" aria-pressed="'+fav+'">'+(fav?'♥':'♡')+'</button></div>'+
 '<div class="c-visual">'+visual+'</div>'+
 '<div class="c-body"><h3>'+escapeHTML(x.title)+'</h3><p>'+escapeHTML(x.description)+'</p></div>'+
 '<a class="c-link" href="'+escapeAttr(x.href)+'" data-record="'+escapeAttr(x.id)+'">'+escapeHTML(x.cta||"開く")+'</a></article>';
}
function render(){
 const filtered=items.filter(matchItem);
 results.classList.toggle("list-view",view==="list");
 results.innerHTML=filtered.length?filtered.map(renderCard).join(""):'<div class="empty"><strong>まだ見つからないみたい。</strong><p>検索を変えるか、別の棚をのぞいてみて。</p></div>';
 $("currentCategory").textContent=categories.find(x=>x.id===active)?.label||"すべて";
 $("resultCount").textContent=filtered.length+" / "+items.length+" ITEMS";
 $("statusResult").textContent=filtered.length+" 件表示";
 $("gridButton").classList.toggle("active",view==="grid");
 $("listButton").classList.toggle("active",view==="list");
 $("gridButton").setAttribute("aria-pressed",String(view==="grid"));
 $("listButton").setAttribute("aria-pressed",String(view==="list"));
 setupRail();
 const rec=$("recentLink");
 if(recent&&typeof recent.href==="string"&&typeof recent.title==="string"){rec.hidden=false;rec.href=recent.href;rec.textContent="↗ 最近の作品: "+recent.title}else{rec.hidden=true}
}
categoriesEl.addEventListener("click",e=>{
 const btn=e.target.closest("button[data-kind]");
 if(!btn)return;
 active=btn.dataset.kind;render();
});
searchField.addEventListener("input",()=>{search=searchField.value.trim();render()});
$("gridButton").addEventListener("click",()=>{view="grid";render()});
$("listButton").addEventListener("click",()=>{view="list";render()});
results.addEventListener("click",e=>{
 const btn=e.target.closest("button[data-favorite]");
 if(btn){
  const id=btn.dataset.favorite;
  if(favorites.has(id))favorites.delete(id);else favorites.add(id);
  try{localStorage.setItem("shelfiria-favorites.v5",JSON.stringify([...favorites]))}catch(err){}
  render();return;
 }
 const link=e.target.closest("a[data-record]");
 if(link){const match=items.find(x=>x.id===link.dataset.record);if(match){remember(match);recent={id:match.id,href:match.href,title:match.title,kind:match.kind}}}
});
document.querySelectorAll("a[data-record]").forEach(link=>link.addEventListener("click",()=>{const x=items.find(x=>x.id===link.dataset.record);if(x){remember(x);recent=x}}));
$("randomPlay").addEventListener("click",()=>{
 const games=items.filter(x=>x.kind==="game");if(!games.length)return;
 const pick=games[Math.floor(Math.random()*games.length)];remember(pick);window.location.assign(pick.href);
});
const mobileMenu=$("mobileMenu"),mobileNav=$("mobileNav");
mobileMenu.addEventListener("click",()=>{const on=mobileNav.dataset.open!=="true";mobileNav.dataset.open=String(on);mobileMenu.setAttribute("aria-expanded",String(on));mobileMenu.textContent=on?"CLOSE ×":"MENU +";});
mobileNav.addEventListener("click",e=>{if(e.target.closest("a")){mobileNav.dataset.open="false";mobileMenu.setAttribute("aria-expanded","false");mobileMenu.textContent="MENU +"}});
$("lightToggle").addEventListener("click",()=>{
 const on=document.body.classList.toggle("soft-glow");
 $("lightToggle").setAttribute("aria-pressed",String(on));
 $("lightToggle").textContent=on?"✧ LIGHT":"✦ GLOW";
 try{localStorage.setItem("shelfiria-softglow.v5",on?"1":"0")}catch(e){}
});
try{if(localStorage.getItem("shelfiria-softglow.v5")==="1")$("lightToggle").click()}catch(e){}
$("searchOpen").addEventListener("click",()=>{document.getElementById("explorerTop").scrollIntoView({behavior:"smooth"});searchField.focus({preventScroll:true})});
document.addEventListener("keydown",e=>{
 const k=e.key.toLowerCase();
 if((e.ctrlKey||e.metaKey)&&k==="k"||e.key==="/"&&!["input","textarea"].includes(document.activeElement.tagName.toLowerCase())){
 e.preventDefault();$("explorerTop").scrollIntoView({behavior:"smooth"});searchField.focus({preventScroll:true});
 }
 if(e.key==="Escape"&&document.activeElement===searchField){searchField.value="";search="";searchField.blur();render()}
});
document.querySelectorAll("a[href^='#']").forEach(a=>a.addEventListener("click",()=>{if(mobileNav.dataset.open==="true"){mobileNav.dataset.open="false";mobileMenu.textContent="MENU +";mobileMenu.setAttribute("aria-expanded","false")}}));
const io=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(entries=>{for(const x of entries){if(x.isIntersecting){x.target.classList.add("revealed");io.unobserve(x.target)}}},{rootMargin:"0px 0px -8% 0px"}):null;
if(io)document.querySelectorAll(".portal,.chapter,.signal-row").forEach(el=>io.observe(el));
render();
})();