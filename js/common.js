/* ==================================================
   [공통] 유틸리티 함수
================================================== */
/* 오늘 날짜를 YYYY-MM-DD 형식으로 반환 */
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

/* 약관 모달 */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
}

/* 전화번호 자동 하이픈 */
function formatPhoneNumber(value) {
  const number = value.replace(/[^0-9]/g, "").slice(0, 11);
  if (number.length <= 3) return number;
  if (number.length <= 7) return number.slice(0, 3) + "-" + number.slice(3);
  return number.slice(0, 3) + "-" + number.slice(3, 7) + "-" + number.slice(7, 11);
}

/* 방문·상담 예약 폼으로 부드럽게 이동 */
function scrollToReservationForm() {
  const reservationForm = document.getElementById("reservationForm");
  if (!reservationForm) return;

  const targetPosition = reservationForm.getBoundingClientRect().top + window.scrollY - 20;
  window.scrollTo({
    top: Math.max(0, targetPosition),
    behavior: "smooth"
  });
}


/* ==================================================
   [기능 1] 방문 예약 폼 처리
================================================== */
function initLeadForms() {
  const leadForms = document.querySelectorAll(".lead-form");

  leadForms.forEach(function (form) {
    const nameInput = form.querySelector(".lead-name");
    const phoneInput = form.querySelector(".lead-phone");
    const reservationInput = form.querySelector(".lead-reservation");
    const privacyAgree = form.querySelector(".privacy-agree");
    const submitBtn = form.querySelector(".submit-btn");

    if (!nameInput || !phoneInput || !reservationInput || !privacyAgree || !submitBtn) return;

    /* 입력창 클릭 시 placeholder 숨김 */
    [nameInput, phoneInput].forEach(function (input) {
      input.dataset.originalPlaceholder = input.getAttribute("placeholder") || "";
      input.addEventListener("focus", function () { input.placeholder = ""; });
      input.addEventListener("blur", function () {
        if (input.value.trim() === "") input.placeholder = input.dataset.originalPlaceholder;
      });
    });

    /* 전화번호 자동 하이픈 */
    phoneInput.addEventListener("input", function () {
      phoneInput.value = formatPhoneNumber(phoneInput.value);
    });

    /* 예약날짜 달력 (Flatpickr) */
    let reservationPicker = null;
    if (typeof flatpickr === "function") {
      reservationPicker = flatpickr(reservationInput, {
        locale: flatpickr.l10ns && flatpickr.l10ns.ko ? flatpickr.l10ns.ko : "default",
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "Y년 m월 d일",
        altInputClass: "lead-reservation reservation-display",
        minDate: "today",
        disableMobile: true,
        allowInput: false,
        clickOpens: true,
        onReady: function (selectedDates, dateStr, instance) {
          instance.altInput.placeholder = "예약 날짜를 선택하세요";
        },
        onOpen: function (selectedDates, dateStr, instance) {
          instance.set("minDate", getTodayDateString());
        }
      });
    } else {
      reservationInput.type = "date";
      reservationInput.min = getTodayDateString();
    }

    /* 폼 제출 */
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const reservationDate = reservationInput.value.trim();
      const phoneNumbersOnly = phone.replace(/[^0-9]/g, "");

      if (!name) return alert("성함을 입력해 주세요."), nameInput.focus();
      if (phoneNumbersOnly.length < 10 || phoneNumbersOnly.length > 11) return alert("올바른 연락처를 입력해 주세요."), phoneInput.focus();
      if (!reservationDate) {
        alert("예약 날짜를 선택해 주세요.");
        reservationPicker ? reservationPicker.open() : reservationInput.focus();
        return;
      }
      if (reservationDate < getTodayDateString()) {
        alert("오늘 이후의 예약 날짜를 선택해 주세요.");
        reservationPicker ? (reservationPicker.clear(), reservationPicker.open()) : (reservationInput.value = "", reservationInput.focus());
        return;
      }
      if (!privacyAgree.checked) return alert("개인정보 수집·이용 및 제3자 제공에 동의해 주세요."), privacyAgree.focus();
      if (submitBtn.disabled) return;

      submitBtn.disabled = true;
      submitBtn.innerText = "전송 중...";

      const payload = {
        siteName: typeof CURRENT_SITE_NAME !== 'undefined' ? CURRENT_SITE_NAME : '알 수 없는 현장', // HTML에서 선언된 변수 사용
        formPosition: form.dataset.position || "",
        name: name,
        phone: phone,
        reservationDateTime: reservationDate,
        privacyConsent: true
      };

      fetch(typeof GAS_URL !== 'undefined' ? GAS_URL : '', {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(function () {
        alert((typeof CURRENT_SITE_NAME !== 'undefined' ? CURRENT_SITE_NAME : '선택하신 현장') + " 방문·상담 예약이 완료되었습니다.");
        form.reset();
        reservationPicker ? reservationPicker.clear() : (reservationInput.min = getTodayDateString());
        nameInput.placeholder = nameInput.dataset.originalPlaceholder;
        phoneInput.placeholder = phoneInput.dataset.originalPlaceholder;
        privacyAgree.checked = false;
      })
      .catch(function (error) {
        alert("등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
        console.error(error);
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.innerText = "방문·상담 예약하기";
      });
    });
  });
}

/* ==================================================
   [기능 2] 이벤트 배너 슬라이더
================================================== */
function initEventBanners() {
  const sliders = document.querySelectorAll('.event-banner-slider');

  sliders.forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll('.event-banner-slide'));
    const dots = Array.from(slider.querySelectorAll('.event-banner-dot'));
    if (slides.length <= 1) return;

    let currentIndex = 0, autoPlayTimer = null, isDragging = false, hasDragged = false, activePointerId = null;
    let startX = 0, startY = 0, currentX = 0, currentY = 0;

    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      slides.forEach((slide, idx) => {
        const isActive = idx === index;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });

      dots.forEach((dot, idx) => {
        const isActive = idx === index;
        dot.classList.toggle('active', isActive);
      });
      currentIndex = index;
    }

    function startAutoPlay() {
      stopAutoPlay();
      if (!document.hidden) autoPlayTimer = setInterval(() => showSlide(currentIndex + 1), 3000);
    }
    function stopAutoPlay() { if (autoPlayTimer !== null) clearInterval(autoPlayTimer); }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => { showSlide(index); startAutoPlay(); });
    });

    slider.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDragging = true; hasDragged = false; activePointerId = e.pointerId;
      startX = e.clientX; startY = e.clientY; currentX = e.clientX; currentY = e.clientY;
      stopAutoPlay();
      try { slider.setPointerCapture(e.pointerId); } catch (err) {}
    });

    slider.addEventListener('pointermove', (e) => {
      if (!isDragging || e.pointerId !== activePointerId) return;
      currentX = e.clientX; currentY = e.clientY;
      if (Math.abs(currentX - startX) > 8) hasDragged = true;
    });

    function finishDrag(e) {
      if (!isDragging) return;
      const distanceX = currentX - startX;
      isDragging = false;

      if (Math.abs(distanceX) > Math.abs(currentY - startY) && Math.abs(distanceX) >= 45) {
        distanceX < 0 ? showSlide(currentIndex + 1) : showSlide(currentIndex - 1);
      }
      if (activePointerId !== null && slider.hasPointerCapture(activePointerId)) {
        try { slider.releasePointerCapture(activePointerId); } catch (err) {}
      }
      activePointerId = null; startAutoPlay();
      setTimeout(() => hasDragged = false, 100);
    }

    slider.addEventListener('pointerup', finishDrag);
    slider.addEventListener('pointercancel', finishDrag);

    slides.forEach(slide => slide.addEventListener('click', (e) => { if (hasDragged) e.preventDefault(); }));
    slider.querySelectorAll('img').forEach(img => { img.draggable = false; });
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', () => { if (!isDragging) startAutoPlay(); });

    showSlide(0);
    startAutoPlay();
  });
}

/* ==================================================
   [기능 3] 모델하우스 이미지 갤러리
================================================== */
function initModelGallery() {
  const gallery = document.getElementById("modelGallery");
  if (!gallery) return;

  const viewport = gallery.querySelector(".model-gallery-viewport");
  const track = gallery.querySelector(".model-gallery-track");
  const slides = Array.from(gallery.querySelectorAll(".model-gallery-slide"));
  const thumbnails = Array.from(gallery.querySelectorAll(".model-gallery-thumb"));
  const prevBtn = gallery.querySelector(".model-gallery-prev");
  const nextBtn = gallery.querySelector(".model-gallery-next");

  if (!viewport || !track || slides.length === 0) return;

  let currentIndex = 0;
  function showSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;
    track.style.transform = `translate3d(${-(index * viewport.clientWidth)}px, 0, 0)`;
    
    thumbnails.forEach((thumb, idx) => thumb.classList.toggle("active", idx === index));
  }

  thumbnails.forEach(thumb => thumb.addEventListener("click", () => showSlide(Number(thumb.dataset.index))));
  if (prevBtn) prevBtn.addEventListener("click", () => showSlide(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => showSlide(currentIndex + 1));
  
  // 브라우저 리사이즈 대응
  window.addEventListener("resize", () => { setTimeout(() => showSlide(currentIndex), 100); });
  showSlide(0);
}

/* ==================================================
   [기능 4] 평면 안내 갤러리
================================================== */
function initFloorplanGallery() {
  const gallery = document.getElementById("floorplanGallery");
  if (!gallery) return;

  const track = gallery.querySelector(".floorplan-track");
  const slides = Array.from(gallery.querySelectorAll(".floorplan-slide"));
  const buttonsContainer = gallery.querySelector(".floorplan-thumbnails");
  const currentText = gallery.querySelector(".floorplan-current");
  const totalText = gallery.querySelector(".floorplan-total");
  const progressBar = gallery.querySelector(".floorplan-progress-bar");
  const prevBtn = gallery.querySelector(".floorplan-prev");
  const nextBtn = gallery.querySelector(".floorplan-next");

  if (!track || !buttonsContainer || slides.length === 0) return;

  let currentIndex = 0;
  if (totalText) totalText.textContent = slides.length;
  if (progressBar) progressBar.style.width = (100 / slides.length) + "%";

  /* 타입명 추출 로직 */
  function getFloorplanType(slide, index) {
    if (slide.dataset.type) return slide.dataset.type;
    const img = slide.querySelector("img");
    if (img) {
      const match = (img.getAttribute("alt") || img.getAttribute("src") || "").match(/(\d{2,3})[-_\s]*([a-zA-Z])/i);
      if (match) return match[1] + match[2].toUpperCase();
    }
    return (index + 1) + "타입";
  }

  /* 텍스트 버튼 생성 */
  buttonsContainer.innerHTML = "";
  const typeButtons = slides.map((slide, index) => {
    const btn = document.createElement("button");
    btn.className = "floorplan-thumb floorplan-type-btn";
    btn.textContent = getFloorplanType(slide, index);
    btn.addEventListener("click", () => showSlide(index));
    buttonsContainer.appendChild(btn);
    return btn;
  });

  function getSlideStep() {
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    return slideWidth + gap;
  }

  function showSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;

    const maxOffset = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    const offset = Math.min(index * getSlideStep(), maxOffset);
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;

    if (currentText) currentText.textContent = currentIndex + 1;
    if (progressBar) progressBar.style.transform = `translateX(${currentIndex * 100}%)`;
    typeButtons.forEach((btn, idx) => btn.classList.toggle("active", idx === currentIndex));
  }

  if (prevBtn) prevBtn.addEventListener("click", () => showSlide(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => showSlide(currentIndex + 1));
  window.addEventListener("resize", () => { setTimeout(() => showSlide(currentIndex), 100); });
  showSlide(0);
}

/* ==================================================
   [공통] 이벤트 리스너 통합 바인딩 (DOM 로드 후 실행)
================================================== */
document.addEventListener("DOMContentLoaded", function () {
  /* 모달 오버레이 및 ESC 키 닫기 */
  document.querySelectorAll(".modal-overlay").forEach(function (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal(modal.id);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      document.querySelectorAll(".modal-overlay").forEach(function (modal) {
        if (modal.style.display === "flex") closeModal(modal.id);
      });
    }
  });

  /* 브라우저 탭 벗어남 감지 (슬라이더 일시정지 용도) */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) return;
    document.querySelectorAll('.event-banner-slider').forEach(function (slider) {
      slider.dispatchEvent(new Event('mouseenter'));
    });
  });

  /* 하단 바 표시 로직 */
  const bottomBar = document.getElementById("bottomBar");
  if (bottomBar) bottomBar.classList.remove("hidden");

  /* 전화 버튼 스크롤 감지 */
  const callBtn = document.getElementById("callBtn");
  if (callBtn) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 200) callBtn.classList.remove("hidden");
      else callBtn.classList.add("hidden");
    });
  }

  /* 각 컴포넌트 초기화 함수 호출 */
  initLeadForms();
  initEventBanners();
  initModelGallery();
  initFloorplanGallery();
});


/* ==================================================
   [공통] 예약 폼 및 모달 HTML 자동 렌더링 (추가할 함수)
================================================== */
function injectCommonFormAndModal() {
  // 1. 공통 폼 삽입
  const formPlaces = document.querySelectorAll('.common-form-place');
  
  formPlaces.forEach(function(place, index) {
    // top, bottom 등 폼 위치를 가져와서 ID 중복 방지에 사용
    const position = place.dataset.position || "form" + index; 
    const positionName = place.dataset.position === 'top' ? '상단' : (place.dataset.position === 'bottom' ? '하단' : '기본');

    place.innerHTML = `
      <form class="lead-form" data-position="${positionName}">
        <div class="form-group">
          <label for="${position}Name">성함 <span class="required-star">*</span></label>
          <input type="text" id="${position}Name" class="lead-name" placeholder="홍길동" autocomplete="name" required>
        </div>
        <div class="form-group">
          <label for="${position}Phone">연락처 <span class="required-star">*</span></label>
          <input type="tel" id="${position}Phone" class="lead-phone" placeholder="010-1234-5678" autocomplete="tel" inputmode="tel" maxlength="13" required>
        </div>
        <div class="form-group reservation-form-group">
          <label for="${position}Reservation">예약날짜 <span class="required-star">*</span></label>
          <input type="text" id="${position}Reservation" class="lead-reservation" placeholder="예약 날짜를 선택해 주세요" autocomplete="off" readonly required>
        </div>
        <div class="privacy-section">
          <p class="privacy-notice">
            당사는 고객님의 정보를 중요시하며 개인정보보호법을 준수하고 있습니다.<br>
            수집된 개인정보는 분양 상담, 방문예약 및 정보 제공 목적으로 활용됩니다.
          </p>
          <div class="check-item-row single-agree-row">
            <label>
              <input type="checkbox" class="privacy-agree">
              개인정보 수집·이용에 동의합니다
              <span class="required-star">*</span>
            </label>
            <button type="button" class="btn-view-terms" onclick="openModal('modalPrivacyPolicy')">
              (약관보기)
            </button>
          </div>
        </div>
        <button type="submit" class="submit-btn">방문·상담 예약하기</button>
      </form>
    `;
  });

  // 2. 공통 모달 삽입
  const modalPlace = document.getElementById('commonModalPlace');
  
  // 모달이 중복 생성되지 않도록 체크 후 삽입
  if (modalPlace && !document.getElementById('modalPrivacyPolicy')) {
    modalPlace.innerHTML = `
      <div aria-labelledby="privacyPolicyTitle" aria-modal="true" class="modal-overlay" id="modalPrivacyPolicy" role="dialog">
        <div class="modal-content">
          <h3 id="privacyPolicyTitle">개인정보 수집·이용 동의</h3>
          <div class="modal-body">
            <h4>1. 개인정보 수집 및 이용</h4>
            <p><strong>수집 항목</strong>: 성함, 연락처(휴대전화번호), 예약일시</p>
            <p><strong>수집 및 이용 목적</strong>: 분양 정보 안내, 방문·상담 예약 접수, 고객 문의 응대, 프로모션 및 이벤트 정보 제공</p>
            <p><strong>보유 및 이용 기간</strong>: 수집 목적 달성 시 또는 고객의 삭제 요청 시까지 보관합니다. 단, 관계 법령에 따라 보존할 필요가 있는 경우에는 해당 기간 동안 보관합니다.</p>
            <h4>2. 개인정보 제3자 제공</h4>
            <p><strong>제공받는 자</strong>: 분양 대행사 및 협력 분양 상담사</p>
            <p><strong>제공 목적</strong>: 분양 상담 진행, 방문예약 확인, 맞춤형 분양 정보 제공 및 고객 문의 응대</p>
            <p><strong>제공 항목</strong>: 성함, 연락처, 예약일시</p>
            <p><strong>보유 및 이용 기간</strong>: 분양 완료 시 또는 업무 위탁 및 협력 계약 종료 시까지</p>
            <h4>3. 동의 거부 권리</h4>
            <p>이용자는 개인정보 수집·이용 및 제3자 제공에 대한 동의를 거부할 수 있습니다. 다만 동의를 거부할 경우 방문예약 및 분양 상담 서비스 이용이 제한될 수 있습니다.</p>
          </div>
          <button class="btn-close-modal" onclick="closeModal('modalPrivacyPolicy')" type="button">닫기</button>
        </div>
      </div>
    `;
  }
}


/* ==================================================
   [공통] 이벤트 리스너 통합 바인딩 (DOM 로드 후 실행)
================================================== */
document.addEventListener("DOMContentLoaded", function () {
  
  // 1. 가장 먼저 HTML 요소(폼, 모달)를 화면에 그려줍니다.
  injectCommonFormAndModal();

  // 2. 그려진 폼과 달력 등을 초기화합니다.
  initLeadForms();
  
  // 3. 기타 기능 초기화
  initEventBanners();
  initModelGallery();
  initFloorplanGallery();

  /* 모달 오버레이 및 ESC 키 닫기 등 기존 코드 유지 ... */
  document.querySelectorAll(".modal-overlay").forEach(function (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal(modal.id);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      document.querySelectorAll(".modal-overlay").forEach(function (modal) {
        if (modal.style.display === "flex") closeModal(modal.id);
      });
    }
  });

  // 하단 바 표시 로직
  const bottomBar = document.getElementById("bottomBar");
  if (bottomBar) bottomBar.classList.remove("hidden");

  // 전화 버튼 스크롤 감지
  const callBtn = document.getElementById("callBtn");
  if (callBtn) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 200) callBtn.classList.remove("hidden");
      else callBtn.classList.add("hidden");
    });
  }
});

/* 방문·상담 예약 폼으로 부드럽게 이동 */
function scrollToReservationForm() {
  // id 대신 첫 번째 폼 영역(.common-form-place)을 찾도록 수정
  const reservationForm = document.querySelector(".common-form-place") || document.querySelector(".lead-form");

  if (!reservationForm) {
    console.warn("예약 폼 요소를 찾을 수 없습니다.");
    return;
  }

  // 모바일에서 상단 여백을 조금 띄우기 위해 - 80 정도를 줍니다.
  const targetPosition = reservationForm.getBoundingClientRect().top + window.scrollY - 200;

  window.scrollTo({
    top: Math.max(0, targetPosition),
    behavior: "smooth"
  });
}