const canvas = document.getElementById("network-bg");
const ctx = canvas.getContext("2d");

let width;
let height;
let points = [];
let mouse = { x: null, y: null };

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resize() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(95, Math.max(42, Math.floor((width * height) / 18000)));
  points = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.8 + 1.2
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(192, 38, 211, 0.16)");
  gradient.addColorStop(0.52, "rgba(59, 130, 246, 0.08)");
  gradient.addColorStop(1, "rgba(20, 184, 166, 0.18)");

  for (const p of points) {
    if (!prefersReducedMotion) {
      p.x += p.vx;
      p.y += p.vy;
    }

    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;
    if (p.y < -20) p.y = height + 20;
    if (p.y > height + 20) p.y = -20;
  }

  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const a = points[i];
      const b = points[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 160;

      if (distance < maxDistance) {
        const opacity = (1 - distance / maxDistance) * 0.24;
        ctx.strokeStyle = `rgba(94, 234, 212, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    const p = points[i];

    if (mouse.x !== null) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 180) {
        ctx.strokeStyle = `rgba(192, 38, 211, ${0.25 * (1 - distance / 180)})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = i % 3 === 0 ? "rgba(192, 38, 211, 0.72)" : "rgba(94, 234, 212, 0.72)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  requestAnimationFrame(draw);
}

window.addEventListener("resize", resize);
window.addEventListener("mousemove", event => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});
window.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});

resize();
draw();

// Email anti-scraping: the address is never stored in the HTML as plain text.
// The user and domain are kept as separate Base64 data attributes and joined
// at runtime, so bots that don't execute JavaScript can't harvest it.
function setupProtectedEmail() {
  const link = document.getElementById("email-link");
  if (!link) return;

  const decode = value => {
    try {
      return atob(value || "");
    } catch (error) {
      return "";
    }
  };

  const buildAddress = () => {
    const user = decode(link.dataset.user);
    const domain = decode(link.dataset.domain);
    return user && domain ? `${user}@${domain}` : "";
  };

  const address = buildAddress();
  if (address) {
    link.href = `mailto:${address}`;
  }

  // Fallback: assemble on demand in case the href wasn't set.
  link.addEventListener("click", event => {
    if (link.getAttribute("href") === "#") {
      const fallback = buildAddress();
      if (fallback) {
        event.preventDefault();
        window.location.href = `mailto:${fallback}`;
      }
    }
  });
}

setupProtectedEmail();

