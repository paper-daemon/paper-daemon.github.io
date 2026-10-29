(function () {
  // Shelfiria in-flow PR slot: quiet, static, placed just before the footer.
  var HREF = 'https://px.a8.net/svt/ejp?a8mat=4BERA6+BG0062+5J4W+5YRHE';
  var IMP = 'https://www13.a8.net/0.gif?a8mat=4BERA6+BG0062+5J4W+5YRHE';
  var LINK_TEXT = '6ヶ月で全世界5万ユーザー＆12億円売り上げAIボイスレコーダー PLAUD NOTE';

  function build() {
    if (document.getElementById('shelf-pr-slot')) return;
    var footer = document.querySelector('footer.site-footer');
    if (!footer || !footer.parentNode) return;

    var style = document.createElement('style');
    style.textContent =
      '#shelf-pr-slot{width:min(1080px,calc(100% - 32px));margin:28px auto 4px;background:#fff;color:#41446c;' +
      'border:1px solid #d9dcf2;border-radius:12px;padding:12px 16px;font-size:12.5px;line-height:1.6}' +
      '#shelf-pr-slot .pr{display:inline-block;font-size:10px;letter-spacing:.12em;color:#6d7099;border:1px solid #d9dcf2;' +
      'border-radius:4px;padding:0 6px;margin-right:8px;vertical-align:1px}' +
      '#shelf-pr-slot a{color:#2f49c9;text-decoration:none;font-weight:600}' +
      '#shelf-pr-slot a:hover{text-decoration:underline}';
    document.head.appendChild(style);

    var box = document.createElement('div');
    box.id = 'shelf-pr-slot';
    var pr = document.createElement('span');
    pr.className = 'pr';
    pr.textContent = '広告 / PR';
    var a = document.createElement('a');
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
    box.appendChild(pr);
    box.appendChild(a);
    box.appendChild(img);
    footer.parentNode.insertBefore(box, footer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
