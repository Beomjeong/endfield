(function () {
  'use strict';

  /* ============================================
     ENDFIELD 스크롤 마퀴
     - 스크롤 다운 → 오른쪽에서 왼쪽 이동
     - 스크롤 업   → 왼쪽에서 오른쪽 이동
     - 타일 단위(1472px)로 무한 루프
  ============================================ */
  var track = document.querySelector('.sec01__deco-track');

  if (track) {
    var lastY   = window.scrollY;
    var offset  = 0;
    var tileW   = 0;
    var SPEED   = 0.8; // 스크롤 1px당 이동 px

    function getTileWidth() {
      var imgs = track.querySelectorAll('img');
      if (imgs.length >= 2 && imgs[0].offsetWidth > 0) {
        // 연속된 타일 간 실제 간격 측정 (img 너비 + gap 포함)
        return imgs[1].offsetLeft - imgs[0].offsetLeft;
      }
      return 0;
    }

    function initMarquee() {
      tileW = getTileWidth();
      if (!tileW) return false;
      // 초기 오프셋: 1타일 앞에서 시작 → 양방향 이동 공간 확보
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

      // 무한 루프: 3타일 범위 안에서 순환
      while (offset < -3 * tileW) offset += tileW;
      while (offset > 0)          offset -= tileW;

      track.style.transform = 'translateX(' + offset + 'px)';
    });
  }


  /* ============================================
     플레이 버튼 터치 탭 효과
     - pointer: coarse 환경(터치)에서만 동작
     - 탭 시 is-tapped 클래스를 잠깐 붙였다가 제거
  ============================================ */
  var playBtn = document.querySelector('.playnow__btn');

  if (playBtn && window.matchMedia('(pointer: coarse)').matches) {
    playBtn.addEventListener('click', function () {
      playBtn.classList.add('is-tapped');
      setTimeout(function () {
        playBtn.classList.remove('is-tapped');
      }, 400);
    });
  }

})();
