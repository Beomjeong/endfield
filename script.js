/* ============================================
   PC방 토글 이미지 상태 (백엔드 연동용)
============================================ */
function setPcRoomToggleState(isPcRoom) {
  var toggleBtn = document.getElementById('pcRoomToggle');
  if (!toggleBtn) { return; }
  var toggleImg = toggleBtn.querySelector('.toggle-btn__img');
  if (!toggleImg) { return; }
  var isOn = Boolean(isPcRoom);
  toggleBtn.dataset.state = isOn ? 'on' : 'off';
  toggleImg.src = isOn ? 'assets/off=on.png' : 'assets/off=off.png';
  toggleImg.alt = isOn ? 'PC방 모드 ON' : 'PC방 모드 OFF';
}

// 기본값 OFF (백엔드에서 접속 상태 확인 후 setPcRoomToggleState 호출)
setPcRoomToggleState(false);


/* ============================================
   공유하기
============================================ */
// ▼▼ 배포 시 아래 4개 값을 교체하세요 ▼▼
var SHARE_CONFIG = {
  title:       '[[TITLE – 카카오 공유 카드 제목]]',
  description: '[[DESCRIPTION – 카카오 공유 카드 요약]]',
  kakaoKey:    '[[KAKAO_JAVASCRIPT_KEY]]',
  ogImage:     '[[HTTPS_THUMBNAIL_URL – 카카오 피드 썸네일 권장 1200×630]]'
};

var copyToast = document.getElementById('copyToast');
var copyToastTimer = null;
var DEFAULT_TOAST_MSG = '클립보드에 복사되었습니다.';
function showCopyToast(msg) {
  if (!copyToast) { return; }
  copyToast.textContent = msg || DEFAULT_TOAST_MSG;
  copyToast.classList.add('is-visible');
  if (copyToastTimer) { clearTimeout(copyToastTimer); }
  copyToastTimer = setTimeout(function() {
    copyToast.classList.remove('is-visible');
  }, 2200);
}
function fallbackCopyText(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  var copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (e) {}
  document.body.removeChild(textarea);
  return copied;
}
function copyUrlWithToast(url, toastMsg) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(function() {
      showCopyToast(toastMsg);
    }).catch(function() {
      if (fallbackCopyText(url)) { showCopyToast(toastMsg); }
    });
  } else if (fallbackCopyText(url)) {
    showCopyToast(toastMsg);
  }
}

// Kakao SDK 초기화
(function initKakao() {
  if (!window.Kakao || !SHARE_CONFIG.kakaoKey) { return; }
  if (Kakao.isInitialized && Kakao.isInitialized()) { return; }
  try { Kakao.init(SHARE_CONFIG.kakaoKey); } catch (e) {}
})();

// 공유 모달 열기/닫기
var shareModal = document.getElementById('shareModal');
var shareModalClose = document.getElementById('shareModalClose');
var lastShareTrigger = null;
function openShareModal(trigger) {
  if (!shareModal) { return; }
  lastShareTrigger = trigger || null;
  shareModal.classList.add('is-open');
  shareModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (shareModalClose) { shareModalClose.focus(); }
}
function closeShareModal() {
  if (!shareModal) { return; }
  shareModal.classList.remove('is-open');
  shareModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastShareTrigger && lastShareTrigger.focus) { lastShareTrigger.focus(); }
}
if (shareModal) {
  shareModal.addEventListener('click', function(e) {
    if (e.target === shareModal) { closeShareModal(); }
  });
}
if (shareModalClose) {
  shareModalClose.addEventListener('click', closeShareModal);
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && shareModal && shareModal.classList.contains('is-open')) {
    closeShareModal();
  }
});

// SNS별 공유 동작
function openPopup(url) {
  var w = 600, h = 600;
  var left = (window.screen.width  - w) / 2;
  var top  = (window.screen.height - h) / 2;
  window.open(url, '_blank', 'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top + ',noopener');
}
function shareFacebook() {
  var u = encodeURIComponent(window.location.href);
  openPopup('https://www.facebook.com/sharer/sharer.php?u=' + u);
}
function shareTwitter() {
  var u = encodeURIComponent(window.location.href);
  var t = encodeURIComponent(SHARE_CONFIG.title);
  openPopup('https://twitter.com/intent/tweet?url=' + u + '&text=' + t);
}
function shareNaver() {
  var u = encodeURIComponent(window.location.href);
  var t = encodeURIComponent(SHARE_CONFIG.title);
  openPopup('https://share.naver.com/web/shareView?url=' + u + '&title=' + t);
}
function shareKakao() {
  if (!window.Kakao || !Kakao.Share) { return; }
  if (!Kakao.isInitialized || !Kakao.isInitialized()) { return; }
  try {
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: SHARE_CONFIG.title,
        description: SHARE_CONFIG.description,
        imageUrl: SHARE_CONFIG.ogImage,
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href
        }
      },
      buttons: [{
        title: '자세히 보기',
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href
        }
      }]
    });
  } catch (e) {}
}
function shareInstagram() {
  copyUrlWithToast(window.location.href, 'URL이 복사되었습니다. 인스타그램에 붙여넣어 주세요.');
}
function shareCopy() {
  copyUrlWithToast(window.location.href, '클립보드에 복사되었습니다.');
}
var SHARE_HANDLERS = {
  kakao:     shareKakao,
  facebook:  shareFacebook,
  twitter:   shareTwitter,
  naver:     shareNaver,
  instagram: shareInstagram,
  copy:      shareCopy
};
if (shareModal) {
  shareModal.addEventListener('click', function(e) {
    var target = e.target.closest ? e.target.closest('[data-share]') : null;
    if (!target) { return; }
    var type = target.getAttribute('data-share');
    var handler = SHARE_HANDLERS[type];
    if (typeof handler === 'function') {
      handler();
      closeShareModal();
    }
  });
}

var btnShare = document.getElementById('btnShare');
if (btnShare) {
  btnShare.addEventListener('click', function() { openShareModal(btnShare); });
}
var btnShareFloating = document.getElementById('btnShareFloating');
if (btnShareFloating) {
  btnShareFloating.addEventListener('click', function() { openShareModal(btnShareFloating); });
}
var btnScrollTop = document.getElementById('btnScrollTop');
if (btnScrollTop) {
  btnScrollTop.addEventListener('click', function(e) {
    e.preventDefault();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var behavior = reduce ? 'auto' : 'smooth';
    try {
      window.scrollTo({ top: 0, left: 0, behavior: behavior });
    } catch (err) {
      (document.scrollingElement || document.documentElement).scrollTop = 0;
      document.body.scrollTop = 0;
    }
  });
}


/* ============================================
   스크롤 마퀴 / 플레이 버튼 / S03 탭
============================================ */
(function () {
  'use strict';

  /* ENDFIELD 스크롤 마퀴
     - 스크롤 다운 → 오른쪽에서 왼쪽 이동
     - 스크롤 업   → 왼쪽에서 오른쪽 이동
     - 타일 단위(1472px)로 무한 루프 */
  var track = document.querySelector('.sec01__deco-track');

  if (track) {
    var lastY   = window.scrollY;
    var offset  = 0;
    var tileW   = 0;
    var SPEED   = 0.8;

    function getTileWidth() {
      var imgs = track.querySelectorAll('img');
      if (imgs.length >= 2 && imgs[0].offsetWidth > 0) {
        return imgs[1].offsetLeft - imgs[0].offsetLeft;
      }
      return 0;
    }

    function initMarquee() {
      tileW = getTileWidth();
      if (!tileW) return false;
      offset = -tileW;
      track.style.transform = 'translateX(' + offset + 'px)';
      return true;
    }

    window.addEventListener('load', initMarquee);

    window.addEventListener('scroll', function () {
      if (!tileW && !initMarquee()) return;

      var y     = window.scrollY;
      var delta = y - lastY;
      lastY = y;

      offset -= delta * SPEED;

      while (offset < -3 * tileW) offset += tileW;
      while (offset > 0)          offset -= tileW;

      track.style.transform = 'translateX(' + offset + 'px)';
    });
  }

  /* 플레이 버튼 터치 탭 효과 (pointer: coarse 환경에서만) */
  var playBtn = document.querySelector('.playnow__btn');

  if (playBtn && window.matchMedia('(pointer: coarse)').matches) {
    playBtn.addEventListener('click', function () {
      playBtn.classList.add('is-tapped');
      setTimeout(function () {
        playBtn.classList.remove('is-tapped');
      }, 400);
    });
  }

  /* S03 탭 전환 */
  var tabBtns = document.querySelectorAll('.s03-tab__btn');
  var tabBars = document.querySelectorAll('.s03-tab__bar');

  tabBtns.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');

      tabBtns.forEach(function (b, j) {
        var isActive = j === i;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (tabBars[j]) tabBars[j].classList.toggle('is-active', isActive);
      });

      document.querySelectorAll('[id^="s03-panel-"]').forEach(function (panel) {
        if (panel.id === 's03-panel-' + target) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      });

      var newPanel = document.getElementById('s03-panel-' + target);
      if (newPanel && window._triggerEls) {
        var animEls = newPanel.querySelectorAll('[data-fade-up], [data-flicker], [data-slide-up], [data-reveal-x], [data-tv-in]');
        window._triggerEls(animEls);
      }
    });
  });

})();


/* ============================================
   모바일 헤더 hide-on-scroll + TOP 버튼
============================================ */
(function () {
  var header = document.querySelector('.cb-header');
  var topBtn = document.getElementById('btnScrollTop');
  var lastY = 0;
  var THRESHOLD = 8;
  var mq = window.matchMedia('(max-width: 768px)');

  window.addEventListener('scroll', function () {
    var currentY = window.scrollY || window.pageYOffset;

    if (mq.matches) {
      if (Math.abs(currentY - lastY) >= THRESHOLD) {
        if (currentY > lastY && currentY > 0) {
          header.style.transform = 'translateY(-100%)';
        } else {
          header.style.transform = '';
        }
      }
    } else {
      header.style.transform = '';
    }

    if (topBtn) {
      if (mq.matches && currentY > 800) {
        topBtn.classList.add('is-visible');
      } else {
        topBtn.classList.remove('is-visible');
      }
    }

    lastY = currentY;
  }, { passive: true });

  var fabBtns = document.querySelectorAll('.mobile-fab__btn');
  fabBtns.forEach(function (btn) {
    var timer = null;
    function triggerTap() {
      btn.classList.add('is-tapped');
      clearTimeout(timer);
      timer = setTimeout(function () {
        btn.classList.remove('is-tapped');
      }, 400);
    }
    btn.addEventListener('touchstart', triggerTap, { passive: true });
    btn.addEventListener('mousedown', triggerTap);
  });

  ['assets/quickbt_share_tab.png', 'assets/quickbt_top_tab.png'].forEach(function (src) {
    var img = new Image();
    img.src = src;
  });
})();


/* ============================================
   Section 02 내부 스크롤
============================================ */
(function () {
  var sec02  = document.getElementById('sec02');
  if (!sec02) return;
  var sticky = sec02.querySelector('.sec02__sticky');
  var layer  = sec02.querySelector('.sec02__scroll-layer');

  function update() {
    var stickyH = sticky.offsetHeight;
    var headerH = window.innerHeight - stickyH;
    sec02.style.height = Math.max(layer.scrollHeight, stickyH) + 'px';

    var maxOffset   = -(layer.scrollHeight - stickyH);
    var stickyStart = sec02.offsetTop - headerH;
    var progress    = window.scrollY - stickyStart;
    var offset      = Math.min(0, Math.max(maxOffset, -progress));
    layer.style.transform = 'translateY(' + offset + 'px)';
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load',   update);
})();


/* ============================================
   Section 03 내부 스크롤
============================================ */
(function () {
  var sec03  = document.getElementById('sec03');
  if (!sec03) return;
  var sticky = sec03.querySelector('.sec03__sticky');
  var layer  = sec03.querySelector('.sec03__scroll-layer');

  function update() {
    var stickyH = sticky.offsetHeight;
    var headerH = window.innerHeight - stickyH;
    sec03.style.height = Math.max(layer.scrollHeight, stickyH) + 'px';

    var maxOffset   = -(layer.scrollHeight - stickyH);
    var stickyStart = sec03.offsetTop - headerH;
    var progress    = window.scrollY - stickyStart;
    var offset      = Math.min(0, Math.max(maxOffset, -progress));
    layer.style.transform = 'translateY(' + offset + 'px)';
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load',   update);
})();


/* ============================================
   Mission 02 누적 플레이 hover 인터랙션
============================================ */
(function () {
  var totalplay = document.querySelector('.s02-m02__totalplay');
  if (!totalplay) return;

  /* PC hover (가로 fill) */
  var pcFill = totalplay.querySelector('.totalplay-track__fill');
  var line   = totalplay.querySelector('.totalplay-track__line');

  function pcActivate(slot) {
    var marker = totalplay.querySelector('.totalplay-slot[data-slot="' + slot + '"] .totalplay-slot__marker');
    if (marker && line && pcFill) {
      var mr = marker.getBoundingClientRect();
      var lr = line.getBoundingClientRect();
      pcFill.style.width = Math.max(0, mr.left + mr.width / 2 - lr.left) + 'px';
    }
    totalplay.dataset.active = slot;
  }

  function pcDeactivate() {
    if (pcFill) pcFill.style.width = '0';
    delete totalplay.dataset.active;
  }

  totalplay.querySelectorAll('[data-slot]').forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      if (window.innerWidth > 768) pcActivate(el.dataset.slot);
    });
  });
  totalplay.addEventListener('mouseleave', function () {
    if (window.innerWidth > 768) pcDeactivate();
  });

  /* 모바일 스크롤 (세로 fill) */
  var moFill   = totalplay.querySelector('.totalplay-mo-fill');
  var moActive = 0;
  var moGroups = Array.prototype.slice.call(
    totalplay.querySelectorAll('.totalplay-card-group[data-slot]')
  );

  function moUpdateFill(slot) {
    if (!moFill) return;
    if (slot === 0) {
      moFill.style.height = '0';
      delete totalplay.dataset.active;
      return;
    }
    var container = totalplay.querySelector('.totalplay-cards');
    var isLast = slot === moGroups.length;
    if (isLast && container) {
      moFill.style.height = container.getBoundingClientRect().height + 'px';
    } else {
      var marker = totalplay.querySelector('.totalplay-card-group[data-slot="' + slot + '"] .totalplay-mo-marker');
      if (marker && container) {
        var mr = marker.getBoundingClientRect();
        var cr = container.getBoundingClientRect();
        moFill.style.height = Math.max(0, mr.top + mr.height / 2 - cr.top) + 'px';
      }
    }
    totalplay.dataset.active = String(slot);
  }

  function moCalcActive() {
    if (window.innerWidth > 768) return;
    var threshold = window.innerHeight * 0.65;
    var newActive = 0;
    moGroups.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top + rect.height * 0.4 < threshold) {
        newActive = Math.max(newActive, parseInt(el.dataset.slot, 10));
      }
    });
    if (newActive !== moActive) {
      moActive = newActive;
      moUpdateFill(moActive);
    }
  }

  window.addEventListener('scroll', moCalcActive, { passive: true });
  moCalcActive();
})();


/* ============================================
   쿠폰 사용방법 스텝 인터랙션
============================================ */
(function () {
  var coupon = document.querySelector('.s02-m02__coupon');
  if (!coupon) return;

  var imgEl = coupon.querySelector('.coupon-img-box__img');
  var steps = Array.prototype.slice.call(coupon.querySelectorAll('.coupon-step'));
  var stepsEl = coupon.querySelector('.coupon-steps');

  var STEP_IMGS = {
    '1': 'assets/coupon_how_01.png',
    '2': 'assets/coupon_how_02.png',
    '3': 'assets/coupon_how_03.png',
    '4': 'assets/coupon_how_04.png'
  };

  function getDefaultImg() {
    return window.innerWidth <= 768
      ? imgEl.dataset.defaultMo
      : imgEl.dataset.defaultPc;
  }

  var allSrcs = [imgEl.dataset.defaultPc, imgEl.dataset.defaultMo].concat(
    Object.values ? Object.values(STEP_IMGS) : [STEP_IMGS['1'], STEP_IMGS['2'], STEP_IMGS['3'], STEP_IMGS['4']]
  );
  allSrcs.forEach(function (src) { if (src) { var p = new Image(); p.src = src; } });

  function setImgSrc(src) {
    if (!imgEl) return;
    imgEl.src = src;
  }

  function activate(step) {
    steps.forEach(function (s) { s.classList.remove('is-active'); });
    if (step) {
      step.classList.add('is-active');
      setImgSrc(STEP_IMGS[step.dataset.step] || getDefaultImg());
    } else {
      setImgSrc(getDefaultImg());
    }
  }

  if (imgEl) imgEl.src = getDefaultImg();

  steps.forEach(function (step) {
    step.addEventListener('mouseenter', function () {
      if (window.innerWidth > 768) activate(step);
    });
    step.addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        activate(step.classList.contains('is-active') ? null : step);
      }
    });
  });

  if (stepsEl) {
    stepsEl.addEventListener('mouseleave', function () {
      if (window.innerWidth > 768) activate(null);
    });
  }

  window.addEventListener('resize', function () {
    if (!coupon.querySelector('.coupon-step.is-active') && imgEl) {
      imgEl.src = getDefaultImg();
    }
  });
})();


/* ============================================
   조기소진 설정
   ▼▼ true 로 바꾸면 해당 카드에 조기소진 처리 ▼▼
============================================ */
var DAILY_SOLD_OUT   = { day1: false, day2: false, day3: false };
var CUMPLAY_SOLD_OUT = { slot1: false, slot2: false, slot3: false };

(function () {
  var map = { day1: '1', day2: '2', day3: '3' };
  Object.keys(DAILY_SOLD_OUT).forEach(function (key) {
    if (DAILY_SOLD_OUT[key]) {
      var card = document.querySelector('.m01-card[data-day="' + map[key] + '"]');
      if (card) card.setAttribute('data-sold-out', '');
    }
  });

  var totalplayMap = { slot1: '1', slot2: '2', slot3: '3' };
  Object.keys(CUMPLAY_SOLD_OUT).forEach(function (key) {
    if (CUMPLAY_SOLD_OUT[key]) {
      var group = document.querySelector('.totalplay-card-group[data-slot="' + totalplayMap[key] + '"]');
      if (group) group.setAttribute('data-sold-out', '');
    }
  });
})();


/* ============================================
   Fade-up 자동 stagger + 스크롤 트리거
============================================ */
(function () {
  var GROUPS = [
    { sel: '.m01-card',       step: 0.10 },
    { sel: '.totalplay-card', step: 0.12, anchor: '.totalplay-track', startDelay: 0.5 },
    { sel: '.milage-card',    step: 0    },
    { sel: '.s04-notice__item', step: 0.05 },
  ];
  GROUPS.forEach(function (g) {
    var els = document.querySelectorAll(g.sel);
    Array.prototype.forEach.call(els, function (el, i) {
      el.setAttribute('data-fade-up', '');
      if (g.anchor) el.setAttribute('data-flicker-with', g.anchor);
      var delay = (g.startDelay || 0) + (g.step ? i * g.step : 0);
      if (delay) el.setAttribute('data-flicker-delay', delay.toFixed(2));
    });
  });

  // s03-step-card: 패널별로 딜레이를 0부터 독립적으로 적용
  document.querySelectorAll('[id^="s03-panel-"]').forEach(function (panel) {
    var els = panel.querySelectorAll('.s03-step-card');
    Array.prototype.forEach.call(els, function (el, i) {
      el.setAttribute('data-fade-up', '');
      if (i > 0) el.setAttribute('data-flicker-delay', (i * 0.12).toFixed(2));
    });
  });
})();

(function () {
  var pending = Array.prototype.slice.call(
    document.querySelectorAll('[data-flicker], [data-slide-up], [data-reveal-x], [data-fade-up], [data-tv-in]')
  );
  if (!pending.length) return;

  function triggerEl(el) {
    var delay = parseFloat(el.dataset.flickerDelay || 0) * 1000;
    setTimeout(function () { el.classList.add('is-visible'); }, delay);
    var dependents = document.querySelectorAll('[data-flicker-with]');
    Array.prototype.forEach.call(dependents, function (dep) {
      if (!dep.classList.contains('is-visible') && el.matches(dep.dataset.flickerWith)) {
        pending = pending.filter(function (p) { return p !== dep; });
        triggerEl(dep);
      }
    });
  }

  function check() {
    var vh = window.innerHeight;
    pending = pending.filter(function (el) {
      if (el.dataset.flickerWith) {
        var anchor = document.querySelector(el.dataset.flickerWith);
        if (anchor && anchor.offsetParent !== null) return true;
      }
      var rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.88 && rect.bottom > 0) {
        triggerEl(el);
        return false;
      }
      return true;
    });
    if (!pending.length) {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    }
  }

  window._triggerEls = function (els) {
    Array.prototype.forEach.call(els, function (el) {
      pending = pending.filter(function (p) { return p !== el; });
      el.classList.remove('is-visible');
      void el.offsetWidth;
      triggerEl(el);
    });
  };

  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  check();
})();
