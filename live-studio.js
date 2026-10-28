(()=>{
const mount=document.querySelector('#service-mount'); if(!mount)return;
const tools=[
 {id:'brief',n:'01',name:'相談を整理',sub:'raw text → brief'},
 {id:'file',n:'02',name:'納品前点検',sub:'file → QA'},
 {id:'route',n:'03',name:'進め方を組む',sub:'task → workflow'}
];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const state={tool:'brief',brief:'ECの商品画像を10枚作りたい。正方形、白背景、来週金曜まで。文字入れはなし。',route:'ai-production'};
function briefResult(text){
 const t=text.trim(); if(!t)return {title:'入力待ち',lines:['相談文を貼ると、作業に必要な要素へ分けます。']};
 const deadline=(t.match(/(?:期限|締切|納期|まで)[：:\s]*([^。\n]+)/)||t.match(/([^。\n]*(?:今日|明日|今週|来週|金曜|月曜|\d+月\d+日)[^。\n]*)/))?.[1]||'未指定';
 const count=(t.match(/\d+\s*(?:枚|本|件|ページ|個|点|文字|分)/)||[])[0]||'未指定';
 const formats=[['正方形','1:1'],['縦','縦型'],['横','横型'],['PDF','PDF'],['CSV','CSV'],['MP4','MP4']].filter(([k])=>t.includes(k)).map(x=>x[1]);
 const avoid=['文字入れなし','顔出しなし','面談なし','音声なし','透かしなし'].filter(x=>t.includes(x));
 const purpose=t.includes('商品')?'商品・販売用':t.includes('SNS')?'SNS用':t.includes('動画')?'動画制作':t.includes('Web')?'Web制作':'要確認';
 return {title:'作業brief',lines:[`用途：${purpose}`,`量：${count}`,`形式：${formats.join(' / ')||'未指定'}`,`期限：${deadline}`,`避けるもの：${avoid.join(' / ')||'未指定'}`],next: ['素材の有無を確認','完成条件を1つ決める','納品形式を確定']};
}
function routeResult(kind){
 const map={
  'ai-production':{title:'SI制作フロー',flow:['brief','素材整理','生成','目視QA','差分修正','納品QA'],risk:'生成を一発で確定せず、QAと差分修正を分ける'},
  'automation':{title:'自動化フロー',flow:['現状確認','副作用を分離','dry-run','実装','失敗テスト','receipt'],risk:'二重実行と途中失敗を先に設計する'},
  'web':{title:'Web修正フロー',flow:['症状再現','バックアップ','局所修正','PC確認','mobile確認','公開確認'],risk:'本番を直接触らず、戻し方を先に用意する'},
  'data':{title:'データ整理フロー',flow:['入力確認','schema確認','変換','重複/欠損QA','件数照合','書き出し'],risk:'行数と列型の変化を必ず照合する'}
 };
 return map[kind]||map['ai-production'];
}
function resultHTML(r){return `<div class="result-card"><h3>${esc(r.title)}</h3>${r.lines?`<ul>${r.lines.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${r.flow?`<p><b>FLOW</b></p><code>${esc(r.flow.join('  →  '))}</code>`:''}${r.next?`<p><b>NEXT</b> ${esc(r.next.join(' / '))}</p>`:''}${r.risk?`<p><b>注意：</b>${esc(r.risk)}</p>`:''}</div>`}
function briefPanel(mobile=false){return `${mobile?'<h3>相談を、作業に変える。</h3><p>雑なメモでもOK。必要な条件だけ拾います。</p>':''}<label>RAW REQUEST</label><textarea id="brief-input">${esc(state.brief)}</textarea><button class="run-btn" id="brief-run">整理する</button>${mobile?'<div id="brief-result"></div>':''}`}
function filePanel(mobile=false){return `${mobile?'<h3>渡す前に、点検する。</h3><p>ファイル名、サイズ、画像寸法などをブラウザ内で確認します。</p>':''}<label>FILE</label><div class="dropzone" id="dropzone" tabindex="0"><div><strong>ファイルをここへ</strong><span>クリック or ドロップ / 外部送信なし</span></div><input id="file-input" type="file" hidden></div>${mobile?'<div id="file-result"></div>':''}`}
function routePanel(mobile=false){return `${mobile?'<h3>最初に、進め方を組む。</h3><p>作業タイプから、実装とQAの順番を返します。</p>':''}<label>TASK TYPE</label><select class="field-select" id="route-select"><option value="ai-production">SI画像・動画制作</option><option value="automation">自動化・Agent</option><option value="web">Web修正・公開</option><option value="data">データ整理・変換</option></select><button class="run-btn" id="route-run">ルートを作る</button>${mobile?'<div id="route-result"></div>':''}`}
function desktop(){
 mount.innerHTML=`<div class="desk-pc"><aside class="tool-rail">${tools.map(t=>`<button data-tool="${t.id}" class="${t.id===state.tool?'active':''}"><b>${t.n}</b><span>${t.name}<small>${t.sub}</small></span></button>`).join('')}</aside><section class="tool-stage"><header class="stage-head"><p id="stage-title"></p><b>● LOCAL / READY</b></header><div class="stage-body"><div class="stage-input" id="stage-input"></div><div class="stage-output"><label>RESULT</label><div id="stage-result"></div></div></div></section></div><nav class="mobile-bottom"><a href="#desk">使う</a><a href="/showcase.html">見る</a><a href="/work.html">頼む</a></nav>`;
 mount.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{state.tool=b.dataset.tool;desktop(); bind();});
 renderDesktopTool();
}
function renderDesktopTool(){
 const i=document.querySelector('#stage-input'),o=document.querySelector('#stage-result'),title=document.querySelector('#stage-title');
 if(state.tool==='brief'){title.textContent='相談文を、作業briefへ';i.innerHTML=briefPanel();o.innerHTML=resultHTML(briefResult(state.brief));}
 if(state.tool==='file'){title.textContent='納品前に、ファイルを点検';i.innerHTML=filePanel();o.innerHTML=resultHTML({title:'ファイル待ち',lines:['画像なら寸法も確認します。','ファイル内容は外へ送りません。']});}
 if(state.tool==='route'){title.textContent='作業タイプから、実行ルートを設計';i.innerHTML=routePanel();o.innerHTML=resultHTML(routeResult(state.route));document.querySelector('#route-select').value=state.route;}
}
function mobile(){
 mount.innerHTML=`<div class="mobile-desk"><div class="mobile-tool-switch">${tools.map(t=>`<button data-tool="${t.id}" class="${t.id===state.tool?'active':''}">${t.n} ${t.name}</button>`).join('')}</div><section class="mobile-tool-card" id="mobile-card"></section></div><nav class="mobile-bottom"><a href="#desk">使う</a><a href="/showcase.html">見る</a><a href="/work.html">頼む</a></nav>`;
 mount.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{state.tool=b.dataset.tool;mobile();bind();});
 const c=document.querySelector('#mobile-card');
 if(state.tool==='brief'){c.innerHTML=briefPanel(true);document.querySelector('#brief-result').innerHTML=resultHTML(briefResult(state.brief));}
 if(state.tool==='file'){c.innerHTML=filePanel(true);document.querySelector('#file-result').innerHTML=resultHTML({title:'ファイル待ち',lines:['画像なら寸法も確認します。','ファイル内容は外へ送りません。']});}
 if(state.tool==='route'){c.innerHTML=routePanel(true);document.querySelector('#route-select').value=state.route;document.querySelector('#route-result').innerHTML=resultHTML(routeResult(state.route));}
}
async function inspectFile(file){
 if(!file)return; const out=document.querySelector('#stage-result')||document.querySelector('#file-result');
 const lines=[`名前：${file.name}`,`種類：${file.type||'不明'}`,`サイズ：${file.size<1024*1024?(file.size/1024).toFixed(1)+' KB':(file.size/1024/1024).toFixed(2)+' MB'}`];
 let verdict='基本情報OK';
 if(file.type.startsWith('image/')){try{const url=URL.createObjectURL(file);const img=new Image();await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url});lines.push(`寸法：${img.naturalWidth} × ${img.naturalHeight}px`);const ratio=(img.naturalWidth/img.naturalHeight).toFixed(3);lines.push(`比率：${ratio}`);if(img.naturalWidth<1000||img.naturalHeight<1000)verdict='用途によっては解像度確認';URL.revokeObjectURL(url)}catch{verdict='画像メタデータを読めませんでした'}}
 if(file.name.includes(' '))lines.push('注意：ファイル名に空白あり');
 out.innerHTML=resultHTML({title:verdict,lines,next:['用途に合う寸法か確認','納品先の形式指定と照合','最終ファイル名を確定']});
}
function bind(){
 const bi=document.querySelector('#brief-input'),br=document.querySelector('#brief-run');if(bi&&br){bi.oninput=()=>state.brief=bi.value;br.onclick=()=>{state.brief=bi.value;const out=document.querySelector('#stage-result')||document.querySelector('#brief-result');out.innerHTML=resultHTML(briefResult(state.brief));}}
 const rs=document.querySelector('#route-select'),rr=document.querySelector('#route-run');if(rs&&rr){rr.onclick=()=>{state.route=rs.value;const out=document.querySelector('#stage-result')||document.querySelector('#route-result');out.innerHTML=resultHTML(routeResult(state.route));}}
 const dz=document.querySelector('#dropzone'),fi=document.querySelector('#file-input');if(dz&&fi){dz.onclick=()=>fi.click();dz.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fi.click()}};fi.onchange=()=>inspectFile(fi.files[0]);['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag')}));['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag')}));dz.addEventListener('drop',e=>inspectFile(e.dataTransfer.files[0]));}
}
const mq=matchMedia('(max-width:760px)');function render(){mq.matches?mobile():desktop();bind()}mq.addEventListener?.('change',render);render();
})();
