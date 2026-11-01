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

/* 모바일: 햄버거 → 사이드바 슬라이드 인/아웃 (+ 배경 딤) */
(function () {
  var menuBtn = document.querySelector('.header-menu');
  var side = document.querySelector('.sidebar');
  if (!menuBtn || !side) return;

  var backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  document.body.appendChild(backdrop);

  function setOpen(open) {
    side.classList.toggle('open', open);
    backdrop.classList.toggle('show', open);
    document.body.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }

  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!side.classList.contains('open'));
  });
  backdrop.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  /* 메뉴 링크 선택 시 닫기 */
  side.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
})();

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

/* 수량·가격 스텝퍼: .stepper 내 −/+ 버튼 (소수점 자릿수 유지) */
document.querySelectorAll('.stepper').forEach(function (st) {
  var num = st.querySelector('.num');
  var btns = st.querySelectorAll('button');
  if (!num || btns.length < 2) return;

  var decimals = (num.textContent.split('.')[1] || '').length;
  var step = decimals ? Math.pow(10, -decimals) : 1;
  var min = decimals ? 0 : 1;

  function move(dir) {
    var v = parseFloat(num.textContent.replace(/,/g, '')) || 0;
    v = Math.max(min, v + dir * step);
    num.textContent = decimals ? v.toFixed(decimals) : String(v);
  }
  btns[0].addEventListener('click', function () { move(-1); });
  btns[1].addEventListener('click', function () { move(1); });
});

/* 헤더 드롭다운: [data-dd] 안 [data-dd-toggle] 클릭 → 패널 토글 (바깥 클릭·ESC 닫기) */
(function () {
  var dds = document.querySelectorAll('[data-dd]');
  if (!dds.length) return;

  function closeAll(except) {
    Array.prototype.forEach.call(dds, function (dd) {
      if (dd === except) return;
      dd.classList.remove('open');
      var t = dd.querySelector('[data-dd-toggle]');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  Array.prototype.forEach.call(dds, function (dd) {
    var btn = dd.querySelector('[data-dd-toggle]');
    var panel = dd.querySelector('.dd-panel');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !dd.classList.contains('open');
      closeAll(dd);
      dd.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
    if (panel) panel.addEventListener('click', function (e) { e.stopPropagation(); });
  });

  document.addEventListener('click', function () { closeAll(null); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(null); });

  /* 알림 모두 읽음 */
  document.querySelectorAll('.dd-allread').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dd = btn.closest('[data-dd]');
      if (!dd) return;
      dd.querySelectorAll('.dd-list li.unread').forEach(function (li) { li.classList.remove('unread'); });
      var cnt = dd.querySelector('.dd-head .count');
      if (cnt) cnt.textContent = '0';
      var dot = dd.querySelector('.header-alarm .dot');
      if (dot) dot.style.display = 'none';
    });
  });
})();

/* ON/OFF 스위치: [role="switch"] 클릭 → aria-checked 토글 (+ .switch-txt 라벨 갱신) */
document.querySelectorAll('.switch[role="switch"]').forEach(function (sw) {
  sw.addEventListener('click', function () {
    var on = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', String(on));
    var txt = sw.nextElementSibling;
    if (txt && txt.classList.contains('switch-txt')) txt.textContent = on ? 'ON' : 'OFF';
  });
});

/* 세그먼트 탭(매도/매수 등): .seg 내 버튼 클릭 → active 전환
   [data-seg="name"] 과 [data-seg-panel="name"][data-seg-case="val"] 로 패널 연동 가능 */
document.querySelectorAll('.seg').forEach(function (seg) {
  var btns = seg.querySelectorAll('button');
  var name = seg.getAttribute('data-seg');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      if (!name) return;
      var val = btn.getAttribute('data-seg-val');
      document.querySelectorAll('[data-seg-panel="' + name + '"]').forEach(function (p) {
        p.classList.toggle('active', p.getAttribute('data-seg-case') === val);
      });
    });
  });
});

/* 사이드바 서브메뉴: .side-toggle 클릭 → 해당 그룹 펼치기/접기 */
document.querySelectorAll('.side-toggle').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var group = btn.parentElement;
    var open = !group.classList.contains('open');
    group.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });
});


/* 모바일 검색: .header-search-btn 클릭 → 헤더 아래 검색바 토글 */
(function () {
  var btn = document.querySelector('.header-search-btn');
  var box = document.querySelector('.header-search');
  if (!btn || !box) return;

  function close() {
    box.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = !box.classList.contains('open');
    box.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      var input = box.querySelector('input');
      if (input) input.focus();
    }
  });

  box.addEventListener('click', function (e) { e.stopPropagation(); });
  document.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

/* 첨부파일: [data-file-drop] 드래그&드롭 / 파일 선택 / 목록 표시·삭제 */
document.querySelectorAll('[data-file-drop]').forEach(function (drop) {
  var input = drop.querySelector('input[type="file"]');
  var pick = drop.querySelector('[data-file-pick]');
  var list = drop.parentElement ? drop.parentElement.querySelector('.file-list') : null;
  if (!input) return;

  var files = [];
  var MAX = 5;

  function size(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + 'KB';
    return (bytes / 1024 / 1024).toFixed(1) + 'MB';
  }

  function render() {
    if (!list) return;
    list.innerHTML = '';
    list.hidden = files.length === 0;
    files.forEach(function (file, i) {
      var li = document.createElement('li');
      li.innerHTML =
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>' +
        '<span class="nm"></span><span class="size"></span>' +
        '<button type="button" class="del" aria-label="삭제">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M18 6 6 18M6 6l12 12"></path></svg></button>';
      li.querySelector('.nm').textContent = file.name;
      li.querySelector('.size').textContent = size(file.size);
      li.querySelector('.del').addEventListener('click', function () {
        files.splice(i, 1);
        render();
      });
      list.appendChild(li);
    });
  }

  function add(fileList) {
    Array.prototype.forEach.call(fileList, function (file) {
      if (files.length >= MAX) return;
      var dup = files.some(function (f) { return f.name === file.name && f.size === file.size; });
      if (!dup) files.push(file);
    });
    render();
  }

  /* 영역 전체 / 파일 선택 버튼 모두 클릭 가능 */
  drop.addEventListener('click', function () { input.click(); });
  if (pick) pick.addEventListener('click', function (e) { e.stopPropagation(); input.click(); });
  input.addEventListener('change', function () { add(input.files); input.value = ''; });

  ['dragenter', 'dragover'].forEach(function (type) {
    drop.addEventListener(type, function (e) {
      e.preventDefault();
      drop.classList.add('dragover');
    });
  });
  ['dragleave', 'dragend'].forEach(function (type) {
    drop.addEventListener(type, function (e) {
      if (type === 'dragleave' && drop.contains(e.relatedTarget)) return;
      drop.classList.remove('dragover');
    });
  });
  drop.addEventListener('drop', function (e) {
    e.preventDefault();
    drop.classList.remove('dragover');
    if (e.dataTransfer && e.dataTransfer.files) add(e.dataTransfer.files);
  });
});

/* 하단 주문유형 버튼 → 우측 주문 패널 레이어 전환 */
(function () {
  var btns = document.querySelectorAll('[data-order-type]');
  if (!btns.length) return;
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-order-type');
      btns.forEach(function (b) { b.classList.toggle('on', b === btn); });
      document.querySelectorAll('[data-panel-group="order"]').forEach(function (p) {
        p.classList.toggle('active', p.getAttribute('data-panel') === name);
      });
    });
  });
})();

/* 중복확인: [data-dupcheck] 클릭 → 결과 모달 표시 */
(function () {
  var modal = document.getElementById('modal-alert');
  var btns = document.querySelectorAll('[data-dupcheck]');
  if (!modal || !btns.length) return;

  var box = modal.querySelector('.modal-alert');
  var msg = modal.querySelector('.alert-msg');

  /* 받침 여부에 따라 을/를 선택 */
  function josa(word) {
    var code = word.charCodeAt(word.length - 1) - 0xac00;
    if (code < 0 || code > 11171) return '를';
    return code % 28 ? '을' : '를';
  }

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var label = btn.getAttribute('data-dupcheck');
      var row = btn.closest('.reg-row');
      var input = row ? row.querySelector('input') : null;
      var value = input ? input.value.trim() : '';
      var ok = value.length > 0;

      box.classList.toggle('is-error', !ok);
      msg.innerHTML = ok
        ? '<b>' + value + '</b>사용 가능한 ' + label + '입니다.'
        : label + josa(label) + ' 입력해 주세요.';
      modal.classList.add('open');
    });
  });
})();

/* 회원가입 유효성 검사: [data-reg-submit] 클릭 → 첫 누락 항목을 경고 모달로 안내 */
(function () {
  var card = document.querySelector('.reg-card');
  var submit = document.querySelector('[data-reg-submit]');
  var modal = document.getElementById('modal-alert');
  if (!card || !submit || !modal) return;

  var box = modal.querySelector('.modal-alert');
  var msg = modal.querySelector('.alert-msg');
  var pending = null;

  /* 받침 여부에 따라 을/를 선택 (비한글은 '을') */
  function josa(word) {
    var code = word.charCodeAt(word.length - 1) - 0xac00;
    if (code < 0 || code > 11171) return '을';
    return code % 28 ? '을' : '를';
  }

  function warn(text, field) {
    box.classList.add('is-error');
    msg.textContent = text;
    modal.classList.add('open');
    pending = field || null;
  }

  /* 모달을 닫으면 문제가 된 입력으로 포커스 이동 */
  modal.querySelectorAll('[data-modal-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (pending) { pending.focus(); pending = null; }
    });
  });

  submit.addEventListener('click', function (e) {
    var rows = card.querySelectorAll('.reg-row:not([data-optional])');

    for (var i = 0; i < rows.length; i++) {
      var lab = rows[i].querySelector('.lab');
      var field = rows[i].querySelector('input, select');
      if (!lab || !field) continue;

      var name = lab.textContent.replace('*', '').trim();
      var isSelect = field.tagName === 'SELECT';
      var empty = isSelect ? field.selectedIndex === 0 : !field.value.trim();

      if (empty) {
        e.preventDefault();
        warn(name + josa(name) + ' ' + (isSelect ? '선택' : '입력') + '해주세요.', field);
        return;
      }
    }

    /* 비밀번호 일치 확인 */
    var pw = card.querySelectorAll('input[type="password"]');
    if (pw.length === 2 && pw[0].value !== pw[1].value) {
      e.preventDefault();
      warn('비밀번호가 일치하지 않습니다.', pw[1]);
      return;
    }

    /* 본인 확인 */
    var human = card.querySelector('.captcha input[type="checkbox"]');
    if (human && !human.checked) {
      e.preventDefault();
      warn('본인 확인(사람입니다) 항목에 체크해주세요.', human);
    }
  });
})();

/* 호가 접기 / 펼치기: [data-hoga-fold] 클릭 → 호가창 토글 */
document.querySelectorAll('[data-hoga-fold]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var box = btn.closest('.hts-hoga');
    if (!box) return;
    var folded = box.classList.toggle('folded');
    box.querySelectorAll('[data-hoga-fold]').forEach(function (b) {
      b.setAttribute('aria-expanded', String(!folded));
    });
  });
});

/* 호가창 현재가 가운데 정렬: 로드 시 + 접기/펼치기로 높이가 바뀔 때 */
function centerHoga() {
  document.querySelectorAll('.hts-hoga .hoga-scroll').forEach(function (sc) {
    var cur = sc.querySelector('tr.cur');
    if (!cur) return;
    sc.scrollTop = cur.offsetTop - (sc.clientHeight - cur.offsetHeight) / 2;
  });
}
centerHoga();
document.querySelectorAll('[data-hoga-fold], [data-top-fold]').forEach(function (btn) {
  btn.addEventListener('click', function () { setTimeout(centerHoga, 0); });   /* 접기 처리 후 실행 */
});

/* 주문 옵션 스텝 버튼: [data-step] 클릭 → 같은 칸의 input 값 증감 */
document.querySelectorAll('.ord-row [data-step]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var fld = btn.closest('.fld');
    var input = fld ? fld.querySelector('input.num') : null;
    if (!input || input.readOnly) return;
    var v = parseInt(input.value, 10);
    if (isNaN(v)) v = 0;
    input.value = Math.max(0, v + (btn.getAttribute('data-step') === 'up' ? 1 : -1));
  });
});

/* 숫자 입력칸 — 숫자만 허용 */
document.querySelectorAll('.ord-row input.num').forEach(function (input) {
  input.addEventListener('input', function () {
    var v = input.value.replace(/[^0-9]/g, '');
    if (v !== input.value) input.value = v;
  });
});

/* 종목 선택 드롭다운: 항목 클릭 → 종목명·코드 교체 후 닫기 */
document.querySelectorAll('[data-sym-pick]').forEach(function (dd) {
  var btn = dd.querySelector('.sym-btn');
  var nm = dd.querySelector('.sym-btn .nm');
  var code = dd.querySelector('.sym-btn .code');
  dd.querySelectorAll('.sym-list button').forEach(function (item) {
    item.addEventListener('click', function () {
      dd.querySelectorAll('.sym-list button').forEach(function (b) { b.classList.remove('on'); });
      item.classList.add('on');
      if (nm) nm.textContent = item.getAttribute('data-nm') || item.textContent;
      if (code) code.textContent = item.getAttribute('data-code') || '';
      dd.classList.remove('open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });
});

/* 상단 접기 / 펼치기: [data-top-fold] 클릭 → 계좌 요약 + 주문 영역 토글 */
document.querySelectorAll('[data-top-fold]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var box = btn.closest('.hts-order');
    if (!box) return;
    var folded = box.classList.toggle('top-folded');
    btn.setAttribute('aria-expanded', String(!folded));
  });
});
