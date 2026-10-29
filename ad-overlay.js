(function () {
  try {
    if (sessionStorage.getItem('shelfAdClosed') === '1') return;
  } catch (e) {}

  var HREF = 'https://px.a8.net/svt/ejp?a8mat=4BERA6+BG0062+5J4W+5YRHE';
  var IMP = 'https://www13.a8.net/0.gif?a8mat=4BERA6+BG0062+5J4W+5YRHE';
  var LINK_TEXT = '6ヶ月で全世界5万ユーザー＆12億円売り上げAIボイスレコーダー PLAUD NOTE';

  function build() {
    if (document.getElementById('shelf-ad-overlay')) return;
    var style = document.createElement('style');
    style.textContent =
      '#shelf-ad-overlay{position:fixed;right:16px;bottom:16px;z-index:9999;width:300px;max-width:calc(100vw - 32px);' +
      'background:#14161c;color:#e8eaf0;border:1px solid #2c3140;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.45);' +
      'padding:14px 16px 12px;font-family:inherit;animation:shelfAdIn .35s ease-out}' +
      '@keyframes shelfAdIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
      '#shelf-ad-overlay .pr{display:inline-block;font-size:10px;letter-spacing:.12em;color:#9aa3b8;border:1px solid #3a4157;' +
      'border-radius:4px;padding:1px 6px;margin-bottom:8px}' +
      '#shelf-ad-overlay .ttl{font-size:12px;color:#c6ccdb;margin:0 0 6px}' +
      '#shelf-ad-overlay a.ad{font-size:13.5px;line-height:1.55;color:#8fd0ff;text-decoration:none;font-weight:600}' +
      '#shelf-ad-overlay a.ad:hover{text-decoration:underline}' +
      '#shelf-ad-overlay .x{position:absolute;top:6px;right:8px;background:none;border:none;color:#9aa3b8;font-size:16px;' +
      'line-height:1;cursor:pointer;padding:4px}';
    document.head.appendChild(style);

    var box = document.createElement('div');
    box.id = 'shelf-ad-overlay';
    box.setAttribute('role', 'complementary');
    box.setAttribute('aria-label', '広告');

    var close = document.createElement('button');
    close.className = 'x';
    close.setAttribute('aria-label', '閉じる');
    close.textContent = '×';
    close.addEventListener('click', function () {
      try { sessionStorage.setItem('shelfAdClosed', '1'); } catch (e) {}
      box.remove();
    });

    var pr = document.createElement('span');
    pr.className = 'pr';
    pr.textContent = '広告 / PR';

    var ttl = document.createElement('p');
    ttl.className = 'ttl';
    ttl.textContent = '音声の仕事に、これを使っている人が増えてます。';

    var a = document.createElement('a');
    a.className = 'ad';
    a.href = HREF;
    a.rel = 'nofollow sponsored noopener';
    a.target = '_blank';
    a.textContent = LINK_TEXT;

    var img = document.createElement('img');
    img.src = IMP;
    img.width = 1;
    img.height = 1;
    img.alt = '';
    img.style.border = '0';

    box.appendChild(close);
    box.appendChild(pr);
    box.appendChild(ttl);
    box.appendChild(a);
    box.appendChild(img);
    document.body.appendChild(box);
  }

  function schedule() { setTimeout(build, 2500); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }
})();
