(function () {
  "use strict";

  // 엘리프 시흥 더프라임 전용 구글시트(엘리프시흥 더프라임) Apps Script 웹앱 주소
  const LOTTE_GAS_URL =
    "https://script.google.com/macros/s/AKfycbxPXfXxdCD7CY-az_0F7UA3qQPpNpn0lHSEfllZZOUFgs5naJk06WGepZsJ_MNSdYTEGw/exec";
  const LOTTE_SITE_NAME = "엘리프 시흥 더프라임";
  const PHONE_NUMBER = "1600-0640";
  const PC_BREAKPOINT = 981;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  }

  function trackLotte(eventName, params) {
    const detail = params || {};

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, detail);
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, detail));
  }

  window.trackLotte = trackLotte;

  function initHeaderAndNavigation() {
    const header = document.getElementById("siteHeader");
    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("mobileMenu");
    const closeButton = document.getElementById("mobileClose");
    const backdrop = document.getElementById("menuBackdrop");

    function updateHeader() {
      if (header) {
        header.classList.toggle("is-scrolled", window.scrollY > 30);
      }
    }

    function scrollToId(id) {
      const target = document.querySelector(id);
      if (!target) return;

      const offset = header ? header.getBoundingClientRect().height : 0;
      const top =
        target.getBoundingClientRect().top + window.pageYOffset - offset + 1;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
    }

    function openMenu() {
      if (!menu || !toggle || !backdrop) return;

      backdrop.hidden = false;
      backdrop.classList.add("is-open");
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "메뉴 닫기");
      document.body.classList.add("menu-open");
    }

    function closeMenu() {
      if (!menu || !toggle || !backdrop) return;

      backdrop.classList.remove("is-open");
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "메뉴 열기");
      document.body.classList.remove("menu-open");

      window.setTimeout(function () {
        if (!menu.classList.contains("is-open")) {
          backdrop.hidden = true;
        }
      }, 280);
    }

    if (menu && toggle && backdrop) {
      toggle.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (toggle.getAttribute("aria-expanded") === "true") {
          closeMenu();
        } else {
          openMenu();
        }
      });

      toggle.addEventListener(
        "touchend",
        function (event) {
          event.preventDefault();
          event.stopPropagation();

          if (toggle.getAttribute("aria-expanded") === "true") {
            closeMenu();
          } else {
            openMenu();
          }
        },
        { passive: false }
      );

      if (closeButton) {
        closeButton.addEventListener("click", function (event) {
          event.preventDefault();
          closeMenu();
        });
      }

      backdrop.addEventListener("click", closeMenu);

      window.addEventListener("resize", function () {
        if (window.innerWidth > 980) {
          closeMenu();
        }
      });
    }

    document.addEventListener("click", function (event) {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute("href");
      if (!id || id === "#" || !document.querySelector(id)) return;

      event.preventDefault();

      if (link.closest("#mobileMenu")) {
        closeMenu();
        window.setTimeout(function () {
          scrollToId(id);
        }, 120);
        return;
      }

      scrollToId(id);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const navLinks = Array.from(
      document.querySelectorAll(".desktop-nav .nav-link")
    );

    if ("IntersectionObserver" in window && sections.length) {
      const observer = new IntersectionObserver(
        function (entries) {
          const visible = entries
            .filter(function (entry) {
              return entry.isIntersecting;
            })
            .sort(function (a, b) {
              return b.intersectionRatio - a.intersectionRatio;
            })[0];

          if (!visible) return;

          navLinks.forEach(function (link) {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + visible.target.id
            );
          });
        },
        {
          rootMargin: "-28% 0px -58% 0px",
          threshold: [0, 0.15, 0.35],
        }
      );

      sections.forEach(function (section) {
        observer.observe(section);
      });
    }
  }

  function initReveal() {
    const targets = Array.from(document.querySelectorAll(".reveal"));
    if (!targets.length) return;

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (element) {
        element.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, currentObserver) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    targets.forEach(function (element) {
      observer.observe(element);
    });
  }

  function initConversionBottomBar() {
    const bar = document.getElementById("conversionBottomBar");
    if (!bar) return;

    const preapply = document.getElementById("preapply");
    let formVisible = false;

    function update() {
      if (window.innerWidth > 640) {
        bar.classList.remove("is-visible");
        return;
      }

      const shouldShow = window.scrollY > 220 && !formVisible;
      bar.classList.toggle("is-visible", shouldShow);
    }

    if (preapply && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            formVisible = entry.isIntersecting;
            update();
          });
        },
        { threshold: 0.12 }
      );

      observer.observe(preapply);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initConversionTracking() {
    document.addEventListener("click", function (event) {
      const target = event.target.closest("[data-track]");
      if (!target) return;

      const eventName = target.getAttribute("data-track");
      if (!eventName) return;

      const href = target.getAttribute("href") || "";
      const label = (target.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80);
      trackLotte(eventName, { href: href, label: label });

      // 전화 버튼은 위치와 상관없이 phone_click 하나로도 집계
      if (href.indexOf("tel:") === 0) {
        trackLotte("phone_click", { cta_name: eventName, hero_variant: getHeroVariant() });
      }
    });
  }

  // 스크롤 깊이 25·50·75·90% (GA4 기본 scroll 이벤트는 90%만 잡힘)
  function initScrollDepth() {
    const marks = [25, 50, 75, 90];
    const sent = {};
    let ticking = false;
    function check() {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = (window.scrollY / max) * 100;
      marks.forEach(function (m) {
        if (pct >= m && !sent[m]) {
          sent[m] = true;
          trackLotte("scroll_depth", { percent: m, hero_variant: getHeroVariant() });
        }
      });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(check); }
    }, { passive: true });
  }

  function initPrivacyModal() {
    const modal = document.getElementById("lottePrivacyModal");
    const openButtons = Array.from(document.querySelectorAll(".btn-view-terms"));
    const closeButton = document.querySelector(".btn-close-modal");

    if (!modal) return;

    function openModal() {
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }

    openButtons.forEach(function (button) {
      button.addEventListener("click", openModal);
    });

    if (closeButton) {
      closeButton.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.style.display === "flex") {
        closeModal();
      }
    });
  }

  function formatPhone(value) {
    const number = value.replace(/[^0-9]/g, "").slice(0, 11);

    if (number.length <= 3) {
      return number;
    }

    if (number.length <= 7) {
      return number.slice(0, 3) + "-" + number.slice(3);
    }

    return (
      number.slice(0, 3) +
      "-" +
      number.slice(3, 7) +
      "-" +
      number.slice(7, 11)
    );
  }

  // 방문예약 폼(날짜·시간 포함)과 빠른 상담폼(이름·연락처만)을 함께 처리합니다.
  // ---------- 메인 문구 A/B (?hero=price → 가격·동호수형) ----------
  function getHeroVariant() {
    try {
      return new URLSearchParams(window.location.search).get("hero") === "price" ? "price" : "value";
    } catch (e) {
      return "value";
    }
  }

  function initHeroVariant() {
    if (getHeroVariant() !== "price") return;
    const l1 = document.querySelector("[data-hero-l1]");
    const l2 = document.querySelector("[data-hero-l2]");
    const sub = document.querySelector("[data-hero-sub]");
    if (l1) l1.textContent = "거모지구에서 귀한 84㎡";
    if (l2) l2.textContent = "잔여 동·호수, 먼저 상담하세요";
    if (sub) sub.textContent = "전세대 84㎡ · 5억 6,910만원부터 · 일반분양 사전 상담";
  }

  // "동·호수 상담 신청" 버튼: 문의 유형 선택 후 빠른 상담 폼 성함 칸으로 이동
  function initInquiryPicker() {
    document.querySelectorAll("[data-pick-inquiry]").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        const form = document.getElementById("quickLeadForm");
        if (!form || form.hidden) return;
        event.preventDefault();
        const radio = form.querySelector('input[name="inquiryType"][value="' + btn.dataset.pickInquiry + '"]');
        if (radio && !radio.checked) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
        }
        form.scrollIntoView({ behavior: "smooth", block: "center" });
        const name = form.querySelector(".lead-name");
        if (name) setTimeout(function () { name.focus({ preventScroll: true }); }, 400);
      });
    });
  }

  // GA4 리드 이벤트 공통 파라미터
  function leadEventParams(form) {
    const checked = form.querySelector('input[name="inquiryType"]:checked');
    return {
      form_position: form.dataset.position || "관심고객등록",
      inquiry_type: checked
        ? checked.value
        : form.querySelector(".lead-visit-date") ? "모델하우스 방문예약" : "",
      hero_variant: getHeroVariant(),
    };
  }


  // ================= 상품권 교환권 쿠폰 =================
  const COUPON_KEY = "elifCouponV1";

  function couponCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let c = "";
    for (let i = 0; i < 5; i += 1) c += chars[Math.floor(Math.random() * chars.length)];
    return "EL-" + c;
  }

  function maskPhone(phone) {
    const d = String(phone).replace(/\D/g, "");
    return d.slice(0, 3) + "-****-" + d.slice(-4);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 모델하우스 약도 (능곡동 868-7, 모다아울렛 건너편)
  function drawCouponMap(ctx, X, Y, W, H, font) {
    ctx.save();
    roundRect(ctx, X, Y, W, H, 18);
    ctx.clip();
    ctx.fillStyle = "#f2efe8";
    ctx.fillRect(X, Y, W, H);
    const px = function (v) { return X + v * W; };
    const py = function (v) { return Y + v * H; };
    function label(t, x, y, size, color, weight, align) {
      ctx.fillStyle = color;
      ctx.font = (weight || 700) + " " + size + "px " + font;
      ctx.textAlign = align || "center";
      ctx.textBaseline = "middle";
      ctx.fillText(t, x, y);
    }
    // 공원
    ctx.fillStyle = "#cfe5c2";
    roundRect(ctx, px(0.03), py(0.03), W * 0.62, H * 0.27, 26);
    ctx.fill();
    label("숲새재공원", px(0.34), py(0.16), 30, "#3f7a3a");
    // 하천 + 서해선
    ctx.fillStyle = "#bfe0f2";
    ctx.fillRect(px(0.735), Y, W * 0.022, H);
    ctx.fillStyle = "#f5e6a8";
    ctx.fillRect(px(0.80), Y, W * 0.09, H);
    ctx.fillStyle = "#8a7a3a";
    ctx.save();
    ctx.translate(px(0.845), py(0.22));
    ctx.rotate(Math.PI / 2);
    label("서해선", 0, 0, 24, "#8a7a3a", 700);
    ctx.restore();
    // 도로
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(X, py(0.33), px(0.735) - X, H * 0.08);   // 능곡군자로
    ctx.fillRect(X, py(0.72), px(0.735) - X, H * 0.08);   // 장현능곡로
    ctx.fillRect(px(0.395), py(0.33), W * 0.045, H * 0.67); // 사이 도로
    label("능곡군자로", px(0.15), py(0.37), 22, "#8f8a80", 600);
    label("장현능곡로", px(0.15), py(0.76), 22, "#8f8a80", 600);
    // 모델하우스
    ctx.fillStyle = "#054438";
    roundRect(ctx, px(0.13), py(0.44), W * 0.25, H * 0.25, 14);
    ctx.fill();
    label("엘리프", px(0.255), py(0.53), 28, "#e3c79f", 800);
    label("모델하우스", px(0.255), py(0.605), 30, "#ffffff", 800);
    // 핀
    const pinX = px(0.255), pinY = py(0.43);
    ctx.fillStyle = "#e5483b";
    ctx.beginPath();
    ctx.arc(pinX, pinY - 34, 24, Math.PI, 0);
    ctx.lineTo(pinX, pinY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(pinX, pinY - 34, 9, 0, Math.PI * 2);
    ctx.fill();
    // 모다아울렛
    ctx.fillStyle = "#ead9c0";
    roundRect(ctx, px(0.46), py(0.44), W * 0.255, H * 0.25, 14);
    ctx.fill();
    label("모다아울렛", px(0.587), py(0.535), 30, "#6b4f2a", 800);
    label("(롯데시네마)", px(0.587), py(0.61), 22, "#8a6d45", 600);
    // 시흥능곡역 + 4번 출구 동선
    ctx.strokeStyle = "#5fb336";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(px(0.845), py(0.87));
    ctx.lineTo(px(0.845), py(0.70));
    ctx.lineTo(px(0.70), py(0.70));
    ctx.stroke();
    ctx.fillStyle = "#5fb336";
    roundRect(ctx, px(0.775), py(0.84), W * 0.205, H * 0.13, 12);
    ctx.fill();
    label("시흥능곡역", px(0.877), py(0.885), 24, "#ffffff", 800);
    label("서해선", px(0.877), py(0.935), 19, "#eaffdf", 600);
    ctx.fillStyle = "#f4c430";
    ctx.beginPath();
    ctx.arc(px(0.70), py(0.70), 19, 0, Math.PI * 2);
    ctx.fill();
    label("4", px(0.70), py(0.702), 22, "#3a2f00", 800);
    label("4번 출구", px(0.70), py(0.795), 20, "#3a6b22", 700);
    // 북쪽 표시
    label("N ↑", px(0.95), py(0.07), 22, "#8f8a80", 800);
    ctx.restore();
  }

  function renderCoupon(data) {
    const W = 1080, H = 1720;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");
    const font = getComputedStyle(document.body).fontFamily || "'Apple SD Gothic Neo','Malgun Gothic',sans-serif";
    function text(t, x, y, size, color, weight, align) {
      ctx.fillStyle = color;
      ctx.font = (weight || 700) + " " + size + "px " + font;
      ctx.textAlign = align || "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(t, x, y);
    }
    ctx.fillStyle = "#f4f0ea";
    ctx.fillRect(0, 0, W, H);
    // 상단 티켓
    ctx.fillStyle = "#054438";
    roundRect(ctx, 50, 50, W - 100, 560, 30);
    ctx.fill();
    text("ELIF  시흥 더프라임", 110, 140, 34, "#e3c79f", 800);
    text("모델하우스 방문 고객 사은 이벤트", 110, 196, 30, "#c9d9d2", 600);
    text("백화점 상품권", 110, 300, 64, "#ffffff", 800);
    text("교환권", 110, 388, 76, "#f3d39b", 800);
    ctx.setLineDash([14, 12]);
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(110, 440);
    ctx.lineTo(W - 110, 440);
    ctx.stroke();
    ctx.setLineDash([]);
    text("성함", 110, 500, 28, "#9fbcb2", 600);
    text(data.name, 250, 500, 32, "#ffffff", 800);
    text("연락처", 110, 556, 28, "#9fbcb2", 600);
    text(maskPhone(data.phone), 250, 556, 32, "#ffffff", 800);
    text("쿠폰번호", 600, 500, 28, "#9fbcb2", 600);
    text(data.code, 600, 556, 40, "#f3d39b", 800);
    // 사용 안내
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 50, 640, W - 100, 250, 26);
    ctx.fill();
    text("인포에서 담당 최민 팀장을 찾아주세요", W / 2, 720, 40, "#054438", 800, "center");
    text("유효기간 ~ 2026년 12월 6일 · 선착순 50명", W / 2, 780, 28, "#6b6b6b", 600, "center");
    text("모델하우스 방문 상담 완료 시 교환 · 1인(1세대) 1회", W / 2, 830, 26, "#8a8a8a", 500, "center");
    // 약도
    text("오시는 길", 70, 950, 34, "#054438", 800);
    drawCouponMap(ctx, 50, 980, W - 100, 560, font);
    text("경기 시흥시 능곡동 868-7", 70, 1610, 36, "#222222", 800);
    text("모다아울렛(롯데시네마) 건너편 · 서해선 시흥능곡역 4번 출구 방면", 70, 1660, 26, "#6b6b6b", 600);
    return cv.toDataURL("image/png");
  }

  function initCoupon() {
    const band = document.getElementById("coupon");
    const modal = document.getElementById("couponModal");
    const form = document.getElementById("couponForm");
    const result = document.getElementById("couponSuccess");
    const img = document.getElementById("couponImg");
    const save = document.getElementById("couponSave");
    if (!band || !modal || !form) return;

    const until = Date.parse(band.dataset.couponUntil || "");
    if (until && Date.now() > until) {
      band.hidden = true;
      return;
    }

    // 이벤트 광고(링크에 offer=gift)로 들어온 방문자에게만 노출
    // 같은 세션 안에서 새로고침해도 유지, 이미 발급받은 사람은 계속 볼 수 있음
    let eligible = false;
    try {
      if (new URLSearchParams(window.location.search).get("offer") === "gift") {
        sessionStorage.setItem("elifOfferGift", "1");
      }
      eligible = sessionStorage.getItem("elifOfferGift") === "1" || !!localStorage.getItem(COUPON_KEY);
    } catch (e) {
      eligible = new URLSearchParams(window.location.search).get("offer") === "gift";
    }
    if (!eligible) {
      band.hidden = true;
      return;
    }
    band.hidden = false;

    let pending = null;

    function show(data) {
      const url = renderCoupon(data);
      img.src = url;
      save.href = url;
      form.hidden = true;
      result.hidden = false;
    }

    function open() {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(COUPON_KEY) || "null"); } catch (e) { saved = null; }
      if (saved && saved.code) show(saved);
    }

    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-coupon-open]").forEach(function (b) { b.addEventListener("click", open); });
    modal.querySelectorAll("[data-coupon-close]").forEach(function (b) { b.addEventListener("click", close); });
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("is-open")) close(); });

    // 제출 직전에 쿠폰번호를 만들어 시트 "접수 위치" 칸에 같이 기록
    document.addEventListener("submit", function (e) {
      if (e.target !== form) return;
      const code = couponCode();
      pending = {
        name: form.querySelector(".lead-name").value.trim(),
        phone: form.querySelector(".lead-phone").value.trim(),
        code: code,
      };
      form.dataset.position = "쿠폰발급·" + code;
    }, true);

    form.addEventListener("lead:success", function () {
      if (!pending) return;
      try { localStorage.setItem(COUPON_KEY, JSON.stringify(pending)); } catch (e) { /* 저장 불가 환경 무시 */ }
      trackLotte("coupon_issued", { coupon_code: pending.code });
      show(pending);
    });
  }

  // 시트 "접수 위치" 칸: 위치 + 문의 유형 (+ 가격형 메인일 때 표시)
  //   예) 빠른상담·일반분양 / 빠른상담·모델하우스방문 / 관심고객등록(방문예약폼)
  function buildFormPosition(form) {
    let position = form.dataset.position || "관심고객등록";
    const checked = form.querySelector('input[name="inquiryType"]:checked');
    if (checked) {
      position += checked.value.indexOf("모델하우스") > -1 ? "·모델하우스방문" : "·일반분양";
    }
    if (getHeroVariant() === "price") position += "(가격형)";
    return position;
  }

  // 시트 메모 칸: 문의 유형 + 메인 문구 버전
  function buildLeadNote(form) {
    const parts = [];
    const checked = form.querySelector('input[name="inquiryType"]:checked');
    if (checked) parts.push("문의유형:" + checked.value);
    else if (form.querySelector(".lead-visit-date")) parts.push("문의유형:모델하우스 방문예약");
    parts.push("메인:" + (getHeroVariant() === "price" ? "가격형" : "가치형"));
    return parts.join(" / ");
  }

  function initLeadForm(form, success) {
    if (!form) return;

    const nameInput = form.querySelector(".lead-name");
    const phoneInput = form.querySelector(".lead-phone");
    const visitDateInput = form.querySelector(".lead-visit-date");
    const visitTimeInput = form.querySelector(".lead-visit-time");
    const agreeInput = form.querySelector(".privacy-agree");
    const submitButton = form.querySelector(".submit-btn");
    const honeypot = form.querySelector('input[name="website"]');

    if (!nameInput || !phoneInput || !agreeInput || !submitButton) {
      return;
    }

    const defaultSubmitText = submitButton.textContent.trim();
    const FAST_SUCCESS_MS = 1200;
    const errorEls = new Map();
    let formStarted = false;
    let isSubmitting = false;

    // ---------- 인라인 오류 표시 (alert 대체) ----------
    function getErrorEl(field) {
      if (errorEls.has(field)) return errorEls.get(field);

      const el = document.createElement("p");
      el.className = "field-error";
      el.setAttribute("role", "alert");
      el.hidden = true;

      if (field === agreeInput) {
        const wrap = field.closest(".privacy-section") || field.parentNode;
        wrap.appendChild(el);
      } else if (field === submitButton) {
        field.insertAdjacentElement("beforebegin", el);
      } else {
        field.insertAdjacentElement("afterend", el);
      }

      errorEls.set(field, el);
      return el;
    }

    function showError(field, message, fieldName) {
      const el = getErrorEl(field);
      el.textContent = message;
      el.hidden = false;

      if (field !== agreeInput && field !== submitButton) {
        field.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");
      }

      trackLotte("lead_form_invalid", { field: fieldName });
    }

    function clearError(field) {
      const el = errorEls.get(field);
      if (el) el.hidden = true;
      field.classList.remove("is-invalid");
      field.removeAttribute("aria-invalid");
    }

    // ---------- 검증 ----------
    function isValidName(value) {
      return value.length >= 2 && value.length <= 30;
    }

    function isValidPhone(digits) {
      return /^01[016789]\d{7,8}$/.test(digits);
    }

    function todayString() {
      const d = new Date();
      const pad = function (n) { return String(n).padStart(2, "0"); };
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    // 방문 희망일은 오늘 이후만 선택 가능
    if (visitDateInput) visitDateInput.min = todayString();

    function isValidVisitDate(value) {
      return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= todayString();
    }

    function validate() {
      [nameInput, phoneInput, visitDateInput, visitTimeInput, agreeInput, submitButton]
        .filter(Boolean)
        .forEach(clearError);

      const invalid = [];
      const name = nameInput.value.trim();
      const phoneDigits = phoneInput.value.replace(/[^0-9]/g, "");
      const visitDate = visitDateInput ? visitDateInput.value : "";
      const visitTime = visitTimeInput ? visitTimeInput.value : "";

      if (!isValidName(name)) {
        showError(nameInput, "성함을 2자 이상 입력해 주세요.", "name");
        invalid.push(nameInput);
      }

      if (!isValidPhone(phoneDigits)) {
        showError(
          phoneInput,
          "휴대전화 번호를 확인해 주세요. 예) 010-1234-5678",
          "phone"
        );
        invalid.push(phoneInput);
      }

      if (visitDateInput && !isValidVisitDate(visitDate)) {
        showError(visitDateInput, "방문 희망일을 선택해 주세요.", "visit_date");
        invalid.push(visitDateInput);
      }

      if (visitTimeInput && !visitTime) {
        showError(visitTimeInput, "방문 희망 시간을 선택해 주세요.", "visit_time");
        invalid.push(visitTimeInput);
      }

      if (!agreeInput.checked) {
        showError(
          agreeInput,
          "개인정보 수집·이용 및 제공 동의가 필요합니다.",
          "consent"
        );
        invalid.push(agreeInput);
      }

      if (invalid.length) {
        invalid[0].focus();
        if (invalid[0].scrollIntoView) {
          invalid[0].scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return false;
      }

      return true;
    }

    [nameInput, phoneInput, visitDateInput, visitTimeInput].filter(Boolean).forEach(function (input) {
      input.addEventListener("change", function () {
        clearError(input);
      });
      input.addEventListener("input", function () {
        clearError(input);
      });
    });

    agreeInput.addEventListener("change", function () {
      clearError(agreeInput);
    });

    form.addEventListener("focusin", function () {
      if (formStarted) return;

      formStarted = true;
      trackLotte("lead_form_start", leadEventParams(form));
    });

    phoneInput.addEventListener("input", function () {
      phoneInput.value = formatPhone(phoneInput.value);
    });


    function showSuccess() {
      form.dispatchEvent(new CustomEvent("lead:success"));
      form.reset();
      form.hidden = true;

      if (success) {
        success.hidden = false;
        success.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }

    // 문의 유형에 따라 신청 버튼 문구 변경
    function currentSubmitLabel() {
      const checked = form.querySelector('input[name="inquiryType"]:checked');
      return (checked && checked.dataset.submitLabel) || defaultSubmitText;
    }

    form.querySelectorAll('input[name="inquiryType"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (!isSubmitting) submitButton.textContent = currentSubmitLabel();
        trackLotte("inquiry_type_select", { inquiry_type: radio.value });
      });
    });

    function resetSubmitButton() {
      isSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = currentSubmitLabel();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (isSubmitting) return;
      if (!validate()) return;

      if (!LOTTE_GAS_URL) {
        showError(
          submitButton,
          "현재 온라인 접수 준비 중입니다. 1600-0640으로 문의해 주세요.",
          "no_endpoint"
        );
        return;
      }

      // 봇 차단: 사람 눈에 보이지 않는 입력칸이 채워지면 저장하지 않고 성공처럼 처리
      if (honeypot && honeypot.value) {
        showSuccess();
        return;
      }

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const visitDate = visitDateInput ? visitDateInput.value : "";
      const visitTime = visitTimeInput ? visitTimeInput.value : "";

      isSubmitting = true;
      submitButton.disabled = true;
      submitButton.textContent = "전송 중...";
      trackLotte("lead_form_submit", leadEventParams(form));

      const query = new URLSearchParams(window.location.search);
      const payload = {
        siteName: LOTTE_SITE_NAME,
        formPosition: buildFormPosition(form),
        name: name,
        phone: phone,
        visitDate: visitDate,
        visitTime: visitTime,
        note: buildLeadNote(form),
        privacyConsent: true,
        utmSource: query.get("utm_source") || "",
        utmMedium: query.get("utm_medium") || "",
        utmCampaign: query.get("utm_campaign") || "",
        utmContent: query.get("utm_content") || "",
        utmTerm: query.get("utm_term") || "",
        referrer: document.referrer || "",
        landingUrl: window.location.href,
      };

      let finished = false;

      function finishSuccess() {
        if (finished) return;
        finished = true;

        const successParams = Object.assign(leadEventParams(form), {
          utm_source: payload.utmSource,
          utm_medium: payload.utmMedium,
          utm_campaign: payload.utmCampaign,
          utm_content: payload.utmContent,
        });
        trackLotte("lead_form_request_sent", successParams);
        // GA4 추천 이벤트 - 주요 이벤트(전환)로 지정해서 사용
        trackLotte("generate_lead", successParams);

        // Meta Pixel - 잠재 고객(Lead) 전환
        if (typeof window.fbq === "function") {
          window.fbq("track", "Lead");
        }

        // NAVER - 신청 완료(Lead) 전환
        if (window.wcs && typeof window.wcs.trans === "function") {
          window.wcs_add = window.wcs_add || {};
          window.wcs_add["wa"] = "s_4631a861069b";
          window.wcs.trans({ type: "lead" });
        }

        // 당근 픽셀 - 상담·방문예약 신청 완료 전환 (당근 표준 이벤트: CompleteRegistration)
        if (window.karrotPixel && typeof window.karrotPixel.track === "function") {
          window.karrotPixel.track("CompleteRegistration");
        }

        resetSubmitButton();
        showSuccess();
      }

      function finishError(error) {
        if (finished) return;
        finished = true;
        console.error(error);

        trackLotte("lead_form_error", {
          reason: error && error.name ? error.name : "unknown",
        });

        resetSubmitButton();
        showError(
          submitButton,
          "전송에 실패했습니다. 네트워크를 확인 후 다시 시도해 주세요. 계속되면 1600-0640으로 문의해 주세요.",
          "submit"
        );
      }

      if (navigator.onLine === false) {
        finishError({ name: "offline" });
        return;
      }

      // 구글 시트 저장과 알림 메일까지 3~5초가 걸려, 1.2초 안에 네트워크 오류가 없으면
      // 완료 화면을 먼저 보여줍니다. keepalive 덕분에 화면을 닫아도 전송은 끝까지 진행됩니다.
      const fastTimer = window.setTimeout(finishSuccess, FAST_SUCCESS_MS);

      // 참고: no-cors 요청은 서버 응답을 읽을 수 없어 '요청이 나갔는지'까지만 확인됩니다.
      fetch(LOTTE_GAS_URL, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(function () {
          window.clearTimeout(fastTimer);
          finishSuccess();
        })
        .catch(function (error) {
          window.clearTimeout(fastTimer);
          if (finished) {
            trackLotte("lead_form_error_after_success", {
              reason: error && error.name ? error.name : "unknown",
            });
            return;
          }
          finishError(error);
        });
    });
  }

  function initPcCallModal() {
    const modal = document.getElementById("pcCallModal");
    const closeButton = document.getElementById("pcCallClose");
    const copyButton = document.getElementById("pcCallCopy");
    const leadButton = document.getElementById("pcCallLead");

    if (!modal) return;

    function isPc() {
      return window.innerWidth >= PC_BREAKPOINT;
    }

    function openModal() {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      trackLotte("pc_call_modal_open", {});

      window.setTimeout(function () {
        if (copyButton) {
          copyButton.focus();
        }
      }, 0);
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    document.addEventListener("click", function (event) {
      const telLink = event.target.closest('a[href^="tel:1600-0640"]');
      if (!telLink || !isPc()) return;

      event.preventDefault();
      openModal();
    });

    if (closeButton) {
      closeButton.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });

    if (copyButton) {
      copyButton.addEventListener("click", async function () {
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(PHONE_NUMBER);
          } else {
            const textarea = document.createElement("textarea");
            textarea.value = PHONE_NUMBER;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            textarea.remove();
          }

          copyButton.textContent = "복사 완료";
          copyButton.classList.add("is-copied");
          trackLotte("pc_phone_copy", {});

          window.setTimeout(function () {
            copyButton.textContent = "전화번호 복사";
            copyButton.classList.remove("is-copied");
          }, 1800);
        } catch (error) {
          alert("대표번호는 1600-0640입니다.");
        }
      });
    }

    if (leadButton) {
      leadButton.addEventListener("click", function () {
        trackLotte("pc_call_modal_lead", {});
        closeModal();
      });
    }
  }


  // 공개 전에는 실제 자료가 없어도 안전하게 '공개 전'으로 표시합니다.
  // 자료 공개 승인을 받은 후 아래 값만 수정하면 '공개 예정 자료' 섹션에 반영됩니다.
  const SITE_RELEASE = {
    priceStatus: "공개 전",
    planStatus: "공개 전",
    unitStatus: "공개 전",
    noticeUrl: "", // 공식 모집공고 PDF 또는 공식 공고 링크 (https://)
    noticeStatus: "발표 전",
    subscriptionSchedule: "공고 발표 후 안내",
    showroomDate: "공식 안내 확인 후 안내",
    showroomAddress: "공식 안내 전",
    showroomVisit: "상세 일정 확인 후 안내",
    showroomMapUrl: "" // https:// 지도 링크
  };

  function initUpcomingSection() {
    const setText = function (id, value) {
      const el = document.getElementById(id);
      if (el && value) el.textContent = value;
    };

    setText("priceStatus", SITE_RELEASE.priceStatus);
    setText("planStatus", SITE_RELEASE.planStatus);
    setText("unitStatus", SITE_RELEASE.unitStatus);
    setText("officialNoticeStatus", SITE_RELEASE.noticeStatus);
    setText("subscriptionSchedule", SITE_RELEASE.subscriptionSchedule);
    setText("showroomOpenDate", SITE_RELEASE.showroomDate);
    setText("showroomAddress", SITE_RELEASE.showroomAddress);
    setText("showroomVisit", SITE_RELEASE.showroomVisit);

    const mapLink = document.getElementById("showroomMapLink");
    if (mapLink && /^https:\/\//i.test(SITE_RELEASE.showroomMapUrl)) {
      mapLink.href = SITE_RELEASE.showroomMapUrl;
      mapLink.hidden = false;
    }
  }


  
function initMapModal() {
  const modal = document.getElementById("mapModal");
  const open = document.getElementById("mapOpen");
  const close = document.getElementById("mapClose");

  if (!modal || !open) return;

  document.body.appendChild(modal);

  let previousOverflow = "";

  function show() {
    previousOverflow = document.body.style.overflow;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("map-modal-open");
    document.body.style.overflow = "hidden";

    const body = modal.querySelector(".map-modal-body");

    if (body && window.innerWidth <= 980) {
      body.scrollLeft =
        (body.scrollWidth - body.clientWidth) * 0.3;
    }

    if (close) close.focus();

    trackLotte("map_open", {});
  }

  function hide() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("map-modal-open");
    document.body.style.overflow = previousOverflow;

    open.focus();
  }

  open.addEventListener("click", show);

  if (close) {
    close.addEventListener("click", hide);
  }

  modal.addEventListener("click", function (e) {
    if (e.target === modal) hide();
  });

  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      modal.classList.contains("is-open")
    ) {
      hide();
    }
  });
}


  ready(function () {
    initHeaderAndNavigation();
    initReveal();
    initConversionBottomBar();
    initConversionTracking();
    initPrivacyModal();
    initHeroVariant();
    initCoupon();
    initScrollDepth();
    initInquiryPicker();
    initLeadForm(document.getElementById("lotteLeadForm"), document.getElementById("lotteLeadSuccess"));
    initLeadForm(document.getElementById("quickLeadForm"), document.getElementById("quickLeadSuccess"));
    initLeadForm(document.getElementById("couponForm"), document.getElementById("couponSuccess"));
    initPcCallModal();
    initMapModal();
    initUpcomingSection();
  });
})();
