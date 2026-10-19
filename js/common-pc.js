(function () {
  "use strict";

  const LOTTE_GAS_URL =
    "https://script.google.com/macros/s/AKfycbwJh34BIDRg65M-tawmZi82LLGfgeYW1m4vMHcAJQHEv9shra4vuONW0wKwZITvJCQ_/exec";
  const LOTTE_SITE_NAME = "경기광주역 롯데캐슬 시그니처 2단지";
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

      trackLotte(eventName, {
        href: target.getAttribute("href") || "",
        label: (target.textContent || "")
          .trim()
          .replace(/\s+/g, " ")
          .slice(0, 80),
      });
    });
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

  function initLeadForm() {
    const form = document.getElementById("lotteLeadForm");
    if (!form) return;

    const nameInput = form.querySelector(".lead-name");
    const phoneInput = form.querySelector(".lead-phone");
    const birthInput = form.querySelector(".lead-birth");
    const agreeInput = form.querySelector(".privacy-agree");
    const submitButton = form.querySelector(".submit-btn");
    const honeypot = form.querySelector('input[name="website"]');
    const success = document.getElementById("lotteLeadSuccess");

    if (!nameInput || !phoneInput || !birthInput || !agreeInput || !submitButton) {
      return;
    }

    const defaultSubmitText = submitButton.textContent.trim();
    const SUBMIT_TIMEOUT_MS = 15000;
    const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
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

    function isValidBirth(value) {
      if (!/^\d{6}$/.test(value)) return false;

      const month = Number(value.slice(2, 4));
      const day = Number(value.slice(4, 6));

      if (month < 1 || month > 12 || day < 1) return false;
      return day <= DAYS_IN_MONTH[month - 1];
    }

    function validate() {
      [nameInput, phoneInput, birthInput, agreeInput, submitButton].forEach(
        clearError
      );

      const invalid = [];
      const name = nameInput.value.trim();
      const phoneDigits = phoneInput.value.replace(/[^0-9]/g, "");
      const birth = birthInput.value.trim();

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

      if (!isValidBirth(birth)) {
        showError(
          birthInput,
          "생년월일 앞 6자리를 확인해 주세요. 예) 900101",
          "birth"
        );
        invalid.push(birthInput);
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

    [nameInput, phoneInput, birthInput].forEach(function (input) {
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
      trackLotte("lead_form_start", {
        form_position: form.dataset.position || "관심고객등록",
      });
    });

    phoneInput.addEventListener("input", function () {
      phoneInput.value = formatPhone(phoneInput.value);
    });

    birthInput.addEventListener("input", function () {
      birthInput.value = birthInput.value.replace(/[^0-9]/g, "").slice(0, 6);
    });

    function showSuccess() {
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

    function resetSubmitButton() {
      isSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = defaultSubmitText;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (isSubmitting) return;
      if (!validate()) return;

      // 봇 차단: 사람 눈에 보이지 않는 입력칸이 채워지면 저장하지 않고 성공처럼 처리
      if (honeypot && honeypot.value) {
        showSuccess();
        return;
      }

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const birthDate = birthInput.value.trim();

      isSubmitting = true;
      submitButton.disabled = true;
      submitButton.textContent = "전송 중...";
      trackLotte("lead_form_submit", {});

      const query = new URLSearchParams(window.location.search);
      const payload = {
        siteName: LOTTE_SITE_NAME,
        formPosition: form.dataset.position || "관심고객등록",
        name: name,
        phone: phone,
        birthDate: birthDate,
        note: "",
        privacyConsent: true,
        utmSource: query.get("utm_source") || "",
        utmMedium: query.get("utm_medium") || "",
        utmCampaign: query.get("utm_campaign") || "",
        utmContent: query.get("utm_content") || "",
        utmTerm: query.get("utm_term") || "",
        referrer: document.referrer || "",
        landingUrl: window.location.href,
      };

      const controller =
        "AbortController" in window ? new AbortController() : null;
      const timer = window.setTimeout(function () {
        if (controller) controller.abort();
      }, SUBMIT_TIMEOUT_MS);

      // 참고: no-cors 요청은 서버 응답을 읽을 수 없어 '요청이 나갔는지'까지만 확인됩니다.
      fetch(LOTTE_GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined,
      })
        .then(function () {
          window.clearTimeout(timer);

          trackLotte("lead_form_request_sent", {
            utm_source: payload.utmSource,
            utm_medium: payload.utmMedium,
            utm_campaign: payload.utmCampaign,
          });

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

          resetSubmitButton();
          showSuccess();
        })
        .catch(function (error) {
          window.clearTimeout(timer);
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
    showroomDate: "2026년 10월 30일 예정",
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

  ready(function () {
    initHeaderAndNavigation();
    initReveal();
    initConversionBottomBar();
    initConversionTracking();
    initPrivacyModal();
    initLeadForm();
    initPcCallModal();
    initUpcomingSection();
  });
})();
