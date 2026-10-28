(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const defs=[
{kind:'network',label:'SYSTEM / AGENTLINK',steps:'route → crash → fallback → receipt'},
{kind:'creative',label:'PRODUCTION / CONTROL ROOM',steps:'generate → reject → repair → pack'},
{kind:'report',label:'AUTOMATION / DAILY REPORT',steps:'validate → aggregate → report → QA'},
{kind:'rag',label:'RAG / FLEET HARNESS',steps:'query → source health → route → cite'},
{kind:'receipt',label:'RECOVERY / RECEIPT REPLAY',steps:'effect → ack loss → reconcile → skip retry'},
{kind:'terminal',label:'NOTE / SYSTEMD DEBUG',steps:'fail → inspect env → patch unit → active'},
{kind:'trace',label:'NOTE / DEBUGGABLE RAG',steps:'query → retrieval → reason trace → answer'},
{kind:'bench',label:'NOTE / MODEL BENCHMARK',steps:'load → latency → quality → winner'},
{kind:'chain',label:'NOTE / PROOF OF ANTIQUITY',steps:'hash → timestamp → chain → verify'},
{kind:'inspector',label:'TOOL / DELIVERY INSPECTOR',steps:'read → metadata → media QA → pass'},
{kind:'checks',label:'TOOL / LAUNCH CHECKER',steps:'assets → links → metadata → viewports'},
{kind:'router',label:'TOOL / SI WORK ROUTER',steps:'task → policy → route → verify'},
{kind:'stack',label:'TOOL / STACK PICKER',steps:'constraints → score → compare → pick'}
];
const t=()=>reduced?12:($('.dh-actions #dh-turbo.active').length?32:70);
function node(x,y,k,n,c=''){return`<div class="wd-node ${c}" style="left:${x}%;top:${y}%"><small>${k}</small><b>${n}</b><i></i></div>`}
function template(kind){
if(kind==='network')return`${node(4,38,'01','PHONE')}${node(27,16,'02','ROUTER')}${node(27,63,'02B','GUARD')}${node(52,9,'03A','REMOTE')}${node(52,42,'03B','LOCAL')}${node(52,73,'03C','FALLBACK')}${node(78,31,'04','VERIFY')}${node(78,67,'05','RECEIPT')}<span class="wd-packet" style="left:9%;top:54%;--tx:320px">JOB</span><em class="wd-auto-note">FAILOVER PATH</em>`;
if(kind==='creative')return`<div class="wd-tiles">${Array.from({length:12},(_,i)=>`<i class="wd-tile" data-id="V${String(i+1).padStart(2,'0')}"></i>`).join('')}</div><em class="wd-auto-note">12 → 6 / PARTIAL FIX</em>`;
if(kind==='report')return`<div class="wd-report-grid">${Array.from({length:7},(_,i)=>`<div class="wd-report-row"><b>${String(i+1).padStart(2,'0')}</b><span>${['安全','搬入','施工','清掃'][i%4]}</span><span>${i===4?'MISSING':'OK'}</span></div>`).join('')}</div><div class="wd-report-paper"><b>建設日報 / 2026-09-03</b>${'<span></span>'.repeat(8)}</div><em class="wd-auto-note">CSV → JAPANESE REPORT</em>`;
if(kind==='rag')return`<div class="wd-query">Q / worker再起動後に同じeffectを出さない方法は？</div><div class="wd-sources">${['CANON','RUNBOOK','RECEIPT','STALE'].map(x=>`<div class="wd-source"><b>${x}</b><span></span><span></span></div>`).join('')}</div><div class="wd-answer">route: canonical + receipt evidence / stale source rejected</div><em class="wd-auto-note">SOURCE HEALTH + TRACE</em>`;
if(kind==='receipt')return`<div class="wd-receipt-flow">${[['01','REQUEST'],['02','EFFECT'],['03','ACK ?'],['04','RECONCILE'],['05','RECEIPT']].map(x=>`<div class="wd-rstep"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}</div><em class="wd-auto-note">DON'T BLIND RETRY</em>`;
if(kind==='terminal')return`<div class="wd-terminal">${['$ systemctl --user status agent.service','× agent.service - failed / status=203/EXEC','$ systemctl --user show-environment','PATH=/usr/bin  HOME=/home/user','$ systemctl --user edit agent.service','Environment=PATH=/home/user/.local/bin:/usr/bin','$ systemctl --user daemon-reload && restart','● agent.service - active (running)'].map((x,i)=>`<div class="wd-term-line ${i===1?'bad':i===7?'good':''}">${x}</div>`).join('')}</div>`;
if(kind==='trace')return`<div class="wd-trace">${[['01','QUERY'],['02','RETRIEVE'],['03','TRACE'],['04','ANSWER']].map(x=>`<div class="wd-trace-box"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}</div><em class="wd-auto-note">WHY THIS ANSWER?</em>`;
if(kind==='bench')return`<div class="wd-bench">${[['MODEL A','84%','42'],['MODEL B','61%','58'],['MODEL C','93%','35'],['MODEL D','76%','49'],['MODEL E','88%','39']].map(x=>`<div class="wd-bench-row" style="--score:${x[1]}"><b>${x[0]}</b><span class="wd-bench-track"><i class="wd-bench-bar"></i></span><em>${x[2]}ms</em></div>`).join('')}</div><em class="wd-auto-note">QUALITY × LATENCY</em>`;
if(kind==='chain')return`<div class="wd-chain">${['DATA','HASH','TIME','BLOCK','VERIFY'].map((x,i)=>`<div class="wd-block"><b>${x}</b><small>${['memo_03','7fa2c9','10:32:14','prev:91ba','MATCH'][i]}</small></div>`).join('')}</div><em class="wd-auto-note">LOCAL CHAIN PROOF</em>`;
if(kind==='inspector')return`<div class="wd-inspector"><div class="wd-media-preview"></div><div class="wd-meta"><span>1920×1080</span><span>29.97 FPS</span><span>H.264 / 8bit</span><span>AAC / 48k</span><span>-14.2 LUFS</span><span>00:42.16</span><span>16:9 PASS</span><span>NAME PASS</span></div></div>`;
if(kind==='checks')return`<div class="wd-checks">${['HTML','CSS / JS','INTERNAL LINKS','META','OG IMAGE','FAVICON','390px','1440px'].map(x=>`<div class="wd-check"><b>${x}</b></div>`).join('')}</div><em class="wd-auto-note">PRE-LAUNCH STATIC QA</em>`;
if(kind==='router')return`<div class="wd-route">${node(4,38,'TASK','INPUT')}${node(29,16,'POLICY','CLASSIFY')}${node(29,63,'GUARD','RISK')}${node(56,10,'A','LOCAL')}${node(56,43,'B','REMOTE')}${node(56,75,'C','HUMAN')}${node(80,39,'OUT','VERIFY')}<span class="wd-packet" style="left:9%;top:53%;--tx:310px">T</span></div><em class="wd-auto-note">ROUTE BY COST / RISK</em>`;
return`<div class="wd-stack">${[['LOCAL FIRST','91%'],['CLOUD API','73%'],['NO-CODE','62%'],['CUSTOM APP','86%'],['HYBRID','95%']].map(x=>`<div class="wd-stack-row" style="--score:${x[1]}"><b>${x[0]}</b><span class="wd-stack-meter"><i></i></span><em>${x[1]}</em></div>`).join('')}</div><em class="wd-auto-note">CONSTRAINT-BASED PICK</em>`;
}
function convert(){const old=$$('.dh-proof');old.forEach((a,i)=>{const d=defs[i];if(!d)return;const href=a.getAttribute('href'),category=$('small',a)?.textContent||d.label,title=$('b',a)?.textContent||`WORK ${i+1}`,desc=$('p',a)?.textContent||'';const art=document.createElement('article');art.className='dh-proof wd-proof';art.dataset.work=i;art.innerHTML=`<header class="wd-proof-head"><div><small>${category}</small><h3>${title}</h3></div><button class="wd-replay" type="button">REPLAY</button></header><p class="wd-desc">${desc}</p><div class="wd-stage">${template(d.kind)}</div><footer class="wd-proof-foot"><span class="wd-status">READY / ${d.steps}</span><a class="wd-open" href="${href}">実物を見る ↗</a></footer>`;a.replaceWith(art)})}
function reset(a){a.classList.remove('running','done');$$('.on,.bad,.fix,.fly,.lock,.win',a).forEach(e=>e.classList.remove('on','bad','fix','fly','lock','win'));const s=$('.wd-status',a);if(s)s.textContent='READY / '+defs[+a.dataset.work].steps}
async function seq(els,cls='on',gap=1){for(const e of els){e.classList.add(cls);await sleep(t()*gap)}}
async function runNetwork(a){const n=$$('.wd-node',a),p=$('.wd-packet',a);await seq(n.slice(0,4));n[3].classList.remove('on');n[3].classList.add('bad');await sleep(t()*1.5);n[5].classList.add('fix');p?.classList.add('fly');await sleep(t()*2);n[5].classList.remove('fix');n[5].classList.add('on');await seq(n.slice(6));}
async function runCreative(a){const x=$$('.wd-tile',a);await seq(x,'on',.45);[2,7,10].forEach(i=>{x[i].classList.remove('on');x[i].classList.add('bad')});await sleep(t()*2);for(const i of[2,7,10]){x[i].classList.remove('bad');x[i].classList.add('fix');await sleep(t()*.65)}}
async function runReport(a){const rows=$$('.wd-report-row',a);for(let i=0;i<rows.length;i++){rows[i].classList.add(i===4?'bad':'on');await sleep(t()*.55)}await sleep(t());rows[4].classList.remove('bad');rows[4].classList.add('on');$('.wd-report-paper',a)?.classList.add('on')}
async function runRag(a){const src=$$('.wd-source',a);src[0].classList.add('on');await sleep(t());src[1].classList.add('on');await sleep(t());src[2].classList.add('on');src[3].classList.add('bad');await sleep(t()*1.4);$('.wd-answer',a)?.classList.add('on')}
async function runReceipt(a){const s=$$('.wd-rstep',a);s[0].classList.add('on');await sleep(t());s[1].classList.add('on');await sleep(t());s[2].classList.add('bad');await sleep(t()*1.3);s[3].classList.add('fix');await sleep(t()*1.3);s[4].classList.add('on')}
async function runTerminal(a){await seq($$('.wd-term-line',a),'on',.65)}
async function runTrace(a){const x=$$('.wd-trace-box',a);await seq(x.slice(0,2));x[2].classList.add('bad');await sleep(t()*1.4);x[2].classList.remove('bad');x[2].classList.add('on');await sleep(t());x[3].classList.add('on')}
async function runBench(a){const r=$$('.wd-bench-row',a);await seq(r,'on',.6);await sleep(t());r[2].classList.add('win')}
async function runChain(a){const b=$$('.wd-block',a);await seq(b,'on',.8);b.forEach(x=>x.classList.add('lock'))}
async function runInspector(a){const m=$$('.wd-meta span',a);await seq(m,'on',.4)}
async function runChecks(a){const c=$$('.wd-check',a);for(let i=0;i<c.length;i++){c[i].classList.add(i===2?'bad':'on');await sleep(t()*.45)}await sleep(t());c[2].classList.remove('bad');c[2].classList.add('on')}
async function runRouter(a){const n=$$('.wd-node',a),p=$('.wd-packet',a);n[0].classList.add('on');await sleep(t());n[1].classList.add('on');n[2].classList.add('on');await sleep(t()*1.1);n[4].classList.add('bad');await sleep(t());n[3].classList.add('on');n[4].classList.remove('bad');p?.classList.add('fly');await sleep(t()*1.5);n[6].classList.add('on')}
async function runStack(a){const r=$$('.wd-stack-row',a);await seq(r,'on',.55);await sleep(t());r[4].classList.add('win')}
const runners={network:runNetwork,creative:runCreative,report:runReport,rag:runRag,receipt:runReceipt,terminal:runTerminal,trace:runTrace,bench:runBench,chain:runChain,inspector:runInspector,checks:runChecks,router:runRouter,stack:runStack};
async function runWork(i){const a=$(`.wd-proof[data-work="${i}"]`);if(!a||a.classList.contains('running'))return;reset(a);a.classList.add('running');const s=$('.wd-status',a);if(s)s.textContent='RUNNING / '+defs[i].steps;try{await runners[defs[i].kind](a)}catch{}a.classList.remove('running');a.classList.add('done');if(s)s.textContent='DONE / '+defs[i].steps}
async function runAllWorks(){for(let i=0;i<defs.length;i++){runWork(i);await sleep(reduced?8:Math.max(20,t()*.7))}}
function wire(){$$('.wd-proof').forEach((a,i)=>{$('.wd-replay',a)?.addEventListener('click',()=>runWork(i));a.addEventListener('mouseenter',()=>{if(!a.dataset.seen){a.dataset.seen='1';runWork(i)}})});$('#dh-run-all')?.addEventListener('click',runAllWorks);const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!e.target.dataset.auto){e.target.dataset.auto='1';runWork(+e.target.dataset.work)}}),{rootMargin:'100px',threshold:.18});$$('.wd-proof').forEach(x=>io.observe(x))}
convert();wire();window.runWorkDemosAll=runAllWorks;
})();