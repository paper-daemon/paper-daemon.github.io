
function recordUsage(label){try{const k='amase_usage_creator_stack_picker';const d=JSON.parse(localStorage.getItem(k)||'{"total":0,"labels":{}}');d.total++;d.labels[label]=(d.labels[label]||0)+1;localStorage.setItem(k,JSON.stringify(d));}catch(e){}}
const tasks=[['automation','自動化'],['video','動画・字幕'],['image','画像・サムネ'],['docs','文章・資料'],['selfhost','自前運用'],['team','チーム共有']];
const tools={
 make:{key:'make',name:'Make',url:'https://www.make.com/',tags:['automation','easy','team'],why:'画面で組む自動化の候補。まず小さく連携したい時に。'},
 n8n:{key:'n8n',name:'n8n',url:'https://n8n.io/',tags:['automation','control','selfhost'],why:'自前運用や細かい制御も考えたい自動化の候補。'},
 adobe:{key:'adobe',name:'Adobe Creative Cloud',url:'https://www.adobe.com/jp/creativecloud.html',tags:['video','image','creative','team'],why:'動画・画像を横断して制作する時の候補。'},
 conoha_canvas:{key:'conoha_canvas',name:'ConoHa AI Canvas',url:'https://ai.conoha.jp/canvas/',tags:['image','easy'],why:'ブラウザからSI画像生成を試したい時の候補。'},
 kdenlive:{key:'kdenlive',name:'Kdenlive',url:'https://kdenlive.org/',tags:['video','cost','selfhost'],why:'無料で始めたい動画編集の候補。'},
 gimp:{key:'gimp',name:'GIMP',url:'https://www.gimp.org/',tags:['image','cost','selfhost'],why:'無料で画像編集を始めたい時の候補。'},
 libre:{key:'libre',name:'LibreOffice',url:'https://www.libreoffice.org/',tags:['docs','cost','selfhost'],why:'文書・表計算を無料で扱う候補。'}
};
const affiliate=window.AFFILIATE_CONFIG||{};
const linkFor=t=>{const c=affiliate[t.key];return c&&c.enabled&&c.url?{url:c.url,rel:'nofollow noopener sponsored',paid:true}:{url:t.url,rel:'noopener',paid:false}};
const box=document.querySelector('#choices'); tasks.forEach(([id,label])=>box.insertAdjacentHTML('beforeend',`<label class="choice"><input type="checkbox" value="${id}"> ${label}</label>`));
document.querySelector('#run').onclick=()=>{recordUsage('run');const selected=[...document.querySelectorAll('#choices input:checked')].map(x=>x.value);const priority=document.querySelector('#priority').value;const scored=Object.values(tools).map(t=>({...t,score:t.tags.filter(x=>selected.includes(x)).length*3+(t.tags.includes(priority)?2:0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);const cards=document.querySelector('#cards');cards.innerHTML=scored.length?scored.map(t=>{const l=linkFor(t);return `<article class="card"><span class="tag">候補</span><h3>${t.name}</h3><p>${t.why}</p><a href="${l.url}" target="_blank" rel="${l.rel}">公式サイトを見る${l.paid?'（PR）':''}</a></article>`}).join(''):'<p>条件を1つ以上選んでください。</p>';document.querySelector('#disclosure').hidden=!scored.some(t=>linkFor(t).paid);document.querySelector('#result').hidden=false;};
