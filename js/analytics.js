// js/analytics.js
(function() {
    var gaId = 'G-8LC8404HQF'; // 여기에 복사한 GA4 측정 ID 입력

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', gaId);
})();