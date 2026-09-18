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
    const openButton = document.querySelector(".btn-view-terms");
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

    if (openButton) {
      openButton.addEventListener("click", openModal);
    }

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
    const success = document.getElementById("lotteLeadSuccess");

    if (!nameInput || !phoneInput || !agreeInput || !submitButton) return;

    let formStarted = false;

    function validateBasic() {
      const name = nameInput.value.trim();
      const phoneOnly = phoneInput.value.replace(/[^0-9]/g, "");

      if (!name) {
        alert("성함을 입력해 주세요.");
        nameInput.focus();
        return false;
      }

      if (phoneOnly.length < 10 || phoneOnly.length > 11) {
        alert("올바른 연락처를 입력해 주세요.");
        phoneInput.focus();
        return false;
      }

      return true;
    }

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

    if (birthInput) {
      birthInput.addEventListener("input", function () {
        birthInput.value = birthInput.value
          .replace(/[^0-9]/g, "")
          .slice(0, 6);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateBasic()) return;

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const birthDate = birthInput ? birthInput.value.trim() : "";

      if (!/^\d{6}$/.test(birthDate)) {
        alert("생년월일 앞 6자리를 입력해 주세요. 예) 670102");

        if (birthInput) {
          birthInput.focus();
        }
        return;
      }

      if (!agreeInput.checked) {
        alert("개인정보 수집·이용 및 제3자 제공에 동의해 주세요.");
        agreeInput.focus();
        return;
      }

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

      fetch(LOTTE_GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(function () {
          trackLotte("lead_form_request_sent", {
            utm_source: payload.utmSource,
            utm_medium: payload.utmMedium,
            utm_campaign: payload.utmCampaign,
          });

          form.reset();
          form.hidden = true;

          if (success) {
            success.hidden = false;
            success.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        })
        .catch(function (error) {
          console.error(error);
          trackLotte("lead_form_error", {});
          alert("등록 요청 전송 중 오류가 발생했습니다. 다시 시도해 주세요.");
        })
        .finally(function () {
          submitButton.disabled = false;
          submitButton.textContent = "분양정보 받아보기";
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

  ready(function () {
    initHeaderAndNavigation();
    initReveal();
    initConversionBottomBar();
    initConversionTracking();
    initPrivacyModal();
    initLeadForm();
    initPcCallModal();
  });
})();
