// Stars animation — stops automatically in light mode
let starsRunning = false;
(function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  function createStars() {
    stars = [];
    for (let i = 0; i < 200; i++)
      stars.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height,
                   r: Math.random()*1.2+0.2, speed: 0.003+Math.random()*0.008, phase: Math.random()*Math.PI*2 });
  }
  function draw(t) {
    if (!document.body.classList.contains('dark')) { starsRunning = false; return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const a = 0.15 + 0.65*(0.5 + 0.5*Math.sin(t*s.speed + s.phase));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window._startStars = function() {
    if (starsRunning) return;
    starsRunning = true;
    requestAnimationFrame(draw);
  };
  resize(); createStars();
  window.addEventListener('resize', () => { resize(); createStars(); });
})();

// Theme toggle
let isDark = document.body.classList.contains('dark');
function toggleTheme() {
  isDark = !isDark;
  document.body.className = isDark ? 'dark' : 'light';
  const icon  = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  const pill  = document.getElementById('toggle-pill');
  const dot   = document.getElementById('toggle-dot');
  if (icon)  icon.className         = isDark ? 'ti ti-sun'      : 'ti ti-moon';
  if (label) label.textContent      = isDark ? 'Светлая тема'   : 'Тёмная тема';
  if (pill)  pill.style.background  = isDark ? '#1D9BF0'        : '#E7E9EA';
  if (dot)   dot.style.left         = isDark ? '20px'           : '2px';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  if (isDark && window._startStars) window._startStars();
}
// Sync toggle button state if dark was pre-applied by anti-FOUC snippet
if (isDark) {
  const icon  = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  const pill  = document.getElementById('toggle-pill');
  const dot   = document.getElementById('toggle-dot');
  if (icon)  icon.className         = 'ti ti-sun';
  if (label) label.textContent      = 'Светлая тема';
  if (pill)  pill.style.background  = '#1D9BF0';
  if (dot)   dot.style.left         = '20px';
  if (window._startStars) window._startStars();
}

// Sidebar helper — call after loading user profile
function updateSidebar(profile) {
  const av     = document.getElementById('sidebar-av');
  const name   = document.getElementById('sidebar-name');
  const handle = document.getElementById('sidebar-handle');
  if (av)     av.textContent     = (profile.name || 'U')[0].toUpperCase();
  if (name)   name.textContent   = profile.name || '';
  if (handle) handle.textContent = '@' + (profile.username || '');
}
