/* ==========================================================================
   common.js — 공통 동작 (탭 / 모달 / 모바일 메뉴 / 시계)
   ========================================================================== */

/* 탭: [data-tab-group] 내부 [data-tab] 버튼 ↔ [data-panel] 패널 전환 */
document.querySelectorAll('[data-tab-group]').forEach(function (group) {
  var name = group.getAttribute('data-tab-group');
  group.querySelectorAll('[data-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      group.querySelectorAll('[data-tab]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('[data-panel-group="' + name + '"]').forEach(function (p) {
        p.classList.toggle('active', p.getAttribute('data-panel') === btn.getAttribute('data-tab'));
      });
    });
  });
});

/* 모달: [data-modal-open="id"] 열기 / [data-modal-close] 닫기 / 배경 클릭 닫기 */
document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var m = document.getElementById(btn.getAttribute('data-modal-open'));
    if (m) m.classList.add('open');
  });
});
document.querySelectorAll('.modal').forEach(function (m) {
  m.addEventListener('click', function (e) { if (e.target === m) m.classList.remove('open'); });
  m.querySelectorAll('[data-modal-close]').forEach(function (btn) {
    btn.addEventListener('click', function () { m.classList.remove('open'); });
  });
});

/* 모바일: 햄버거 → 사이드바 토글 */
var menuBtn = document.querySelector('.header-menu');
if (menuBtn) {
  menuBtn.addEventListener('click', function () {
    var side = document.querySelector('.sidebar');
    if (side) side.classList.toggle('open');
  });
}

/* 시계: [data-clock] 에 실시간 시간 표시 */
function tickClock() {
  var now = new Date();
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var hms = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
  document.querySelectorAll('[data-clock]').forEach(function (el) {
    el.textContent = hms;
  });
}
tickClock();
setInterval(tickClock, 1000);

/* 수량 스텝퍼: .stepper 내 −/+ 버튼 */
document.querySelectorAll('.stepper').forEach(function (st) {
  var num = st.querySelector('.num');
  var btns = st.querySelectorAll('button');
  if (!num || btns.length < 2) return;
  btns[0].addEventListener('click', function () { num.textContent = Math.max(1, parseInt(num.textContent, 10) - 1); });
  btns[1].addEventListener('click', function () { num.textContent = parseInt(num.textContent, 10) + 1; });
});
