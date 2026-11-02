/* あませの棚 v8 — real browsing, no fake social feed. */
(() => {
  "use strict";
  const $=id=>document.getElementById(id);
  const node=$("allItems");
  if(!node)return;
  let records;
  try{records=JSON.parse(node.textContent)}catch(error){$("catalogResults").textContent="作品一覧の読み込みに失敗しました。";return}
  const known=new Set();
  records=records.filter(item=>{if(!item||!item.href||!item.title||known.has(item.href))return false;known.add(item.href);return true});
  const kinds={all:"すべて",game:"ゲーム",tool:"ツール",demo:"デモ",build:"制作物",article:"記事",download:"無料DL",service:"お仕事",saved:"保存"};
  const typeName={game:"ゲーム",tool:"ツール",demo:"デモ",build:"制作物",article:"記事",download:"無料DL",service:"お仕事"};
  let selection="all",searchTerm="",limit=14,mode="list";
  let saved=new Set();
  try{const p=JSON.parse(localStorage.getItem("amase-v8-saved")||"[]");if(Array.isArray(p))saved=new Set(p)}catch(e){}
  const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const chips=$("catalogChips"),result=$("catalogResults"),more=$("catalogMore"),search=$("catalogSearch");
  function matches(item){
    if(selection==="saved"&&!saved.has(item.href))return false;
    if(selection!=="all"&&selection!=="saved"&&item.kind!==selection)return false;
    if(!searchTerm)return true;
    return (item.title+" "+item.description+" "+(item.eyebrow||"")).toLocaleLowerCase("ja").includes(searchTerm.toLocaleLowerCase("ja"));
  }
  function totals(kind){
    if(kind==="all")return records.length;
    if(kind==="saved")return records.filter(x=>saved.has(x.href)).length;
    return records.filter(x=>x.kind===kind).length;
  }
  function render(){
    const found=records.filter(matches),part=found.slice(0,limit);
    chips.innerHTML=Object.entries(kinds).map(([k,title])=>'<button type="button" data-kind="'+k+'" aria-pressed="'+(k===selection)+'">'+title+' <small>'+totals(k)+'</small></button>').join("");
    result.classList.toggle("tiles",mode==="tiles");
    result.innerHTML=part.length?part.map(item=>'<article class="entry"><span class="kind">'+(typeName[item.kind]||"作品")+'</span><div class="details"><a href="'+escape(item.href)+'">'+escape(item.title)+'</a><p>'+escape(item.description)+'</p></div><a class="visit" href="'+escape(item.href)+'">開く ↗</a><button type="button" class="save" data-save="'+escape(item.href)+'" aria-label="'+escape(item.title)+'を'+(saved.has(item.href)?"保存から外す":"保存する")+'" aria-pressed="'+saved.has(item.href)+'">'+(saved.has(item.href)?"♥":"♡")+'</button></article>').join(""):'<p class="empty">まだ見つからないみたい。別の言葉でも探してみて。</p>';
    $("catalogCount").textContent=part.length+" / "+found.length+" 件を表示";
    more.hidden=part.length>=found.length;
    $("catalogMode").textContent=mode==="list"?"▦ カード表示":"☰ 一覧表示";
    $("catalogMode").setAttribute("aria-pressed",String(mode==="tiles"));
  }
  chips.addEventListener("click",e=>{const b=e.target.closest("button[data-kind]");if(!b)return;selection=b.dataset.kind;limit=14;render()});
  search.addEventListener("input",()=>{searchTerm=search.value.trim();limit=14;render()});
  more.addEventListener("click",()=>{limit+=14;render()});
  $("catalogMode").addEventListener("click",()=>{mode=mode==="list"?"tiles":"list";render()});
  result.addEventListener("click",e=>{
    const b=e.target.closest("button[data-save]");if(!b)return;
    if(saved.has(b.dataset.save))saved.delete(b.dataset.save);else saved.add(b.dataset.save);
    try{localStorage.setItem("amase-v8-saved",JSON.stringify([...saved]))}catch(e){}
    render();
  });
  document.querySelectorAll("[data-category-link]").forEach(link=>link.addEventListener("click",()=>{
    const kind=link.dataset.categoryLink;
    if(Object.hasOwn(kinds,kind)){selection=kind;searchTerm="";search.value="";limit=14;render()}
  }));
  $("randomGame").addEventListener("click",()=>{
    const list=records.filter(x=>x.kind==="game");if(list.length)location.href=list[Math.floor(Math.random()*list.length)].href;
  });
  $("menuToggle").addEventListener("click",()=>{
    const nav=$("mobileMenu"),open=nav.dataset.open!=="true";nav.dataset.open=String(open);
    $("menuToggle").setAttribute("aria-expanded",String(open));
    $("menuToggle").textContent=open?"閉じる ×":"メニュー";
  });
  $("mobileMenu").addEventListener("click",e=>{if(e.target.closest("a")){$("mobileMenu").dataset.open="false";$("menuToggle").setAttribute("aria-expanded","false");$("menuToggle").textContent="メニュー"}});
  document.addEventListener("keydown",e=>{
    if((e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName))||((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k")){
      e.preventDefault();$("catalog").scrollIntoView({behavior:"smooth"});search.focus({preventScroll:true});
    }
    if(e.key==="Escape"&&document.activeElement===search){search.value="";searchTerm="";limit=14;render();search.blur()}
  });
  render();
})();
