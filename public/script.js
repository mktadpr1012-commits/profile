// 개인 정보 (예시) — 실제 정보로 바꿔 사용하세요
const EMAIL = 'alex.chen@designcraft.dev';

const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const toastEl = document.getElementById('toast');

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

/* ---------- 1. 메뉴 클릭 시 해당 영역으로 이동 ---------- */
function closeMobileMenu() {
  mobileNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '메뉴 열기');
  menuToggle.querySelector('.material-symbols-outlined').textContent = 'menu';
}

menuToggle.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  menuToggle.querySelector('.material-symbols-outlined').textContent = open ? 'close' : 'menu';
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMobileMenu();
    const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
    window.scrollTo({ top: id === '#home' ? 0 : top, behavior: 'smooth' });
    history.replaceState(null, '', id);
  });
});

// 화면 크기가 데스크톱으로 바뀌면 모바일 메뉴 닫기
window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
  if (e.matches) closeMobileMenu();
});

// 스크롤 위치에 따라 현재 메뉴 강조
const sections = ['home', 'about', 'projects', 'contact'].map((id) => document.getElementById(id));
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
  const offset = header.offsetHeight + window.innerHeight * 0.3;
  let current = 'home';
  sections.forEach((sec) => {
    if (sec.getBoundingClientRect().top + window.scrollY - offset <= window.scrollY) current = sec.id;
  });
  // 페이지 맨 아래에 도달하면 마지막 섹션 강조
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = 'contact';

  navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  header.classList.toggle('scrolled', window.scrollY > 8);
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

/* ---------- 2. 프로젝트 카드 클릭 시 관련 링크로 이동 ---------- */
document.querySelectorAll('.project-card').forEach((card) => {
  const open = () => window.open(card.dataset.link, '_blank', 'noopener,noreferrer');
  card.addEventListener('click', open);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
});

/* ---------- 3. 이메일 클릭 시 메일 작성창 열기 ---------- */
// 이메일 주소는 mailto: 링크라 클릭하면 기본 메일 앱이 열립니다.
document.getElementById('copyEmailBtn').addEventListener('click', async () => {
  const btn = document.getElementById('copyEmailBtn');
  const icon = btn.querySelector('.material-symbols-outlined');
  try {
    await navigator.clipboard.writeText(EMAIL);
    icon.textContent = 'check';
    showToast('이메일 주소가 복사되었습니다.');
    setTimeout(() => (icon.textContent = 'content_copy'), 2000);
  } catch {
    showToast('복사에 실패했습니다: ' + EMAIL);
  }
});

// 문의 폼 → 입력 내용을 담아 메일 작성창 열기
const form = document.getElementById('contactForm');
const formError = document.getElementById('formError');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fields = ['name', 'email', 'message'].map((id) => document.getElementById(id));
  let firstInvalid = null;
  fields.forEach((f) => {
    const ok = f.checkValidity() && f.value.trim() !== '';
    f.parentElement.classList.toggle('invalid', !ok);
    if (!ok && !firstInvalid) firstInvalid = f;
  });

  if (firstInvalid) {
    formError.textContent = firstInvalid.type === 'email' && firstInvalid.value
      ? '올바른 이메일 주소를 입력해 주세요.'
      : '모든 항목을 입력해 주세요.';
    firstInvalid.focus();
    return;
  }
  formError.textContent = '';

  const [name, email, message] = fields.map((f) => f.value.trim());
  const subject = `[포트폴리오 문의] ${name}`;
  const body = `이름/기업명: ${name}\n회신 이메일: ${email}\n\n${message}`;
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  showToast('메일 작성창을 여는 중입니다…');
});

form.querySelectorAll('input, textarea').forEach((f) =>
  f.addEventListener('input', () => f.parentElement.classList.remove('invalid'))
);

// 이력서 버튼 (예시) — 실제 파일이 있으면 index.html의 href를 resume.pdf 등으로 바꾸세요
document.getElementById('resumeBtn').addEventListener('click', () => {
  showToast('예시 사이트입니다. 이력서는 이메일로 요청해 주세요.');
});

/* ---------- 다크 모드 ---------- */
const themeBtn = document.getElementById('themeToggle');
function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  themeBtn.querySelector('.material-symbols-outlined').textContent = dark ? 'light_mode' : 'dark_mode';
}
try {
  applyTheme(localStorage.getItem('theme') === 'dark');
} catch { /* 저장소 사용 불가 시 기본 테마 */ }

themeBtn.addEventListener('click', () => {
  const dark = !document.documentElement.classList.contains('dark');
  applyTheme(dark);
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
});

/* ---------- 스크롤 등장 효과 ---------- */
const revealTargets = document.querySelectorAll('.section-head, .projects-head, .card, .project-card, .contact-pitch, .contact-card');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('visible');
        io.unobserve(el);
        // 등장이 끝나면 클래스를 지워 카드 hover 효과가 원래대로 동작하게 함
        el.addEventListener('transitionend', () => el.classList.remove('reveal', 'visible'), { once: true });
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((el) => {
    el.classList.add('reveal');
    io.observe(el);
  });
}
