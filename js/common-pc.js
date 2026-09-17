(function(){
'use strict';
function ready(fn){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn,{once:true});}else{fn();}}
ready(function(){
  const header=document.getElementById('siteHeader');
  const toggle=document.getElementById('menuToggle');
  const menu=document.getElementById('mobileMenu');
  const closeBtn=document.getElementById('mobileClose');
  const backdrop=document.getElementById('menuBackdrop');
  if(!menu||!toggle||!backdrop){return;}

  const openMenu=()=>{
    backdrop.hidden=false;
    backdrop.classList.add('is-open');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden','false');
    toggle.setAttribute('aria-expanded','true');
    toggle.setAttribute('aria-label','메뉴 닫기');
    document.body.classList.add('menu-open');
  };
  const closeMenu=()=>{
    backdrop.classList.remove('is-open');
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden','true');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','메뉴 열기');
    document.body.classList.remove('menu-open');
    window.setTimeout(()=>{if(!menu.classList.contains('is-open')) backdrop.hidden=true;},280);
  };
  toggle.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();toggle.getAttribute('aria-expanded')==='true'?closeMenu():openMenu();});
  toggle.addEventListener('touchend',function(e){e.preventDefault();e.stopPropagation();toggle.getAttribute('aria-expanded')==='true'?closeMenu():openMenu();},{passive:false});
  closeBtn&&closeBtn.addEventListener('click',function(e){e.preventDefault();closeMenu();});
  backdrop.addEventListener('click',closeMenu);

  function scrollToId(id){
    const target=document.querySelector(id); if(!target) return;
    const offset=header?header.getBoundingClientRect().height:0;
    const top=target.getBoundingClientRect().top+window.pageYOffset-offset+1;
    window.scrollTo({top:Math.max(0,top),behavior:'smooth'});
  }

  document.addEventListener('click',function(e){
    const link=e.target.closest('a[href^="#"]');
    if(!link) return;
    const id=link.getAttribute('href'); if(!id||id==='#') return;
    if(!document.querySelector(id)) return;
    e.preventDefault();
    const isMobile=!!link.closest('#mobileMenu');
    if(isMobile){closeMenu();window.setTimeout(()=>scrollToId(id),120);}else{scrollToId(id);}
  });

  document.addEventListener('keydown',e=>{if(e.key==='Escape') closeMenu();});
  window.addEventListener('resize',()=>{if(window.innerWidth>980) closeMenu();});
  const updateHeader=()=>{header&&header.classList.toggle('is-scrolled',window.scrollY>30);}; updateHeader(); window.addEventListener('scroll',updateHeader,{passive:true});

  const revealEls=[...document.querySelectorAll('.reveal')];
  if('IntersectionObserver' in window){const io=new IntersectionObserver((entries,obs)=>{entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('is-visible');obs.unobserve(en.target);}})},{threshold:.12});revealEls.forEach(el=>io.observe(el));}else{revealEls.forEach(el=>el.classList.add('is-visible'));}

  const sections=[...document.querySelectorAll('main section[id]')];
  const navs=[...document.querySelectorAll('.desktop-nav .nav-link')];
  if('IntersectionObserver' in window){const sio=new IntersectionObserver(entries=>{const v=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!v)return;navs.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+v.target.id));},{rootMargin:'-28% 0px -58% 0px',threshold:[0,.15,.35]});sections.forEach(s=>sio.observe(s));}

  const form=document.getElementById('preapplyForm');
  form&&form.addEventListener('submit',e=>{e.preventDefault();alert('현재 디자인 시안입니다. 실제 접수 서버 연동 후 사용해 주세요.');});
});
})();



/* ==================================================
   [추가] 우측 하단 플로팅 액션(문자상담+대표전화) & 스크롤 등장 애니메이션
   - #floatingActions / .reveal 요소가 없는 페이지에서는 자동으로 아무 동작도 하지 않으므로
     기존 다른 현장 페이지에 이 common.js를 그대로 써도 안전합니다.
================================================== */
function initFloatingActions() {
  const group = document.getElementById("floatingActions");
  if (!group) return;

  const hero = document.querySelector(".hero");

  if (hero && "IntersectionObserver" in window) {
    // 히어로(상단 롤링 배너 포함) 영역을 벗어나는 순간 플로팅 버튼 노출
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            group.classList.add("hidden");
          } else {
            group.classList.remove("hidden");
          }
        });
      },
      { threshold: 0 }
    );
    io.observe(hero);
  } else {
    // 히어로가 없거나 IntersectionObserver 미지원 브라우저 대비 폴백
    window.addEventListener("scroll", function () {
      if (window.scrollY > 400) group.classList.remove("hidden");
      else group.classList.add("hidden");
    });
  }
}

function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  const io = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach(function (el) {
    io.observe(el);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initFloatingActions();
  initScrollReveal();
});
/* ==================================================
   CONVERSION V4 - 모바일 하단 CTA + 클릭 이벤트
================================================== */
function initConversionBottomBar(){
  const bar = document.getElementById('conversionBottomBar');
  if(!bar) return;

  const preapply = document.getElementById('preapply');
  let formVisible = false;

  if(preapply && 'IntersectionObserver' in window){
    const observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        formVisible = entry.isIntersecting;
        update();
      });
    }, { threshold:0.12 });
    observer.observe(preapply);
  }

  function update(){
    if(window.innerWidth > 640){
      bar.classList.remove('is-visible');
      return;
    }
    const shouldShow = window.scrollY > 220 && !formVisible;
    bar.classList.toggle('is-visible', shouldShow);
  }

  update();
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
}

function initConversionTracking(){
  document.addEventListener('click', function(e){
    const target = e.target.closest('[data-track]');
    if(!target) return;

    const eventName = target.getAttribute('data-track');
    if(!eventName) return;

    if(typeof window.trackLotte === 'function'){
      window.trackLotte(eventName, {
        href: target.getAttribute('href') || '',
        label: (target.textContent || '').trim().replace(/\s+/g,' ').slice(0,80)
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', function(){
  initConversionBottomBar();
  initConversionTracking();
});
