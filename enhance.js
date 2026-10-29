// Amase enhancement: scroll reveal + mobile tab bar current page
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function(el){ io.observe(el); });
  }
  var path = location.pathname;
  document.querySelectorAll('.mobile-tabbar a').forEach(function(a){
    var href = a.getAttribute('href');
    if (href === path || (href !== '/' && path.indexOf(href) === 0)) a.classList.add('active');
    if (href === '/' && (path === '/' || path === '/index.html' || path.indexOf('/amase') === 0)) a.classList.add('active');
  });
})();
