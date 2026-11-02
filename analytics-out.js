// Shelfiria outbound click tracking for GoatCounter events.
// Deploy as /analytics-out.js and load after the GoatCounter count script.
// Sends one event per external-link click, named "out:<host>" so the
// dashboard shows where visitors fly to (note / BOOTH / Coconala / SNS / affiliates).
(function () {
  function track(a) {
    try {
      if (!window.goatcounter || !window.goatcounter.count) return;
      var u = new URL(a.href, location.href);
      if (u.hostname === location.hostname) return;
      window.goatcounter.count({ path: 'out:' + u.hostname, title: a.href, event: true });
    } catch (e) {}
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if (a) track(a);
  }, true);
})();
