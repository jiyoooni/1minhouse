// js/analytics.js
(function () {
  // =========================
  // GA4
  // =========================
  var gaId = "G-8LC8404HQF";

  var gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = "https://www.googletagmanager.com/gtag/js?id=" + gaId;
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }

  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", gaId);


  // =========================
  // Meta Pixel
  // =========================
  var metaPixelId = "2922203174796046";

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;

    n = f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    };

    if (!f._fbq) f._fbq = n;

    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];

    t = b.createElement(e);
    t.async = true;
    t.src = v;

    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );

  fbq("init", metaPixelId);

  // 페이지 방문 이벤트
  fbq("track", "PageView");
})();