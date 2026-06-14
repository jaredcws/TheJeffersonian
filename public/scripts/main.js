/* =====================================================================
   The Jeffersonian — site behavior
   Loads editable content from /content/*.json and renders it, then wires
   up navigation, scroll reveals, the FAQ, the gallery lightbox and the
   contact form. Designed to run on any static host (no build step).
   ===================================================================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Resolve content path relative to site root so it works in subfolders too */
async function loadJSON(name) {
  try {
    const res = await fetch(`content/${name}.json`, { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.warn(`Could not load content/${name}.json`, err);
    return null;
  }
}

/* ---------- Amenity / feature icons ---------- */
const ICONS = {
  elevator: '<path d="M6 3h12v18H6zM12 3v18M9 8l3-3 3 3M9 16l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  window: '<rect x="4" y="3" width="16" height="18" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 3v18M4 12h16" stroke="currentColor" stroke-width="1.7"/>',
  wood: '<path d="M3 7h18M3 12h18M3 17h18M7 7v10M14 7v10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  locker: '<rect x="5" y="3" width="14" height="18" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 3v18" stroke="currentColor" stroke-width="1.7"/><circle cx="9" cy="9" r="0.9" fill="currentColor"/><circle cx="15" cy="9" r="0.9" fill="currentColor"/>',
  loft: '<path d="M3 12 12 4l9 8M5 11v9h14v-9M9 20v-5h6v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  parking: '<rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  leaf: '<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19c3-3 6-5 9-6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  location: '<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.location}</svg>`;

/* ---------- Renderers ---------- */
function setText(sel, value) { const el = $(sel); if (el && value != null) el.textContent = value; }
function setHTML(sel, value) { const el = $(sel); if (el && value != null) el.innerHTML = value; }

function renderSite(site) {
  if (!site) return;
  document.title = `${site.name} — Historic Apartments in Jefferson, Iowa`;
  const md = $('meta[name="description"]'); if (md && site.metaDescription) md.setAttribute("content", site.metaDescription);

  if (site.hero) {
    setText('[data-hero="eyebrow"]', site.hero.eyebrow);
    setText('[data-hero="heading"]', site.hero.heading);
    setText('[data-hero="subheading"]', site.hero.subheading);
    const p = $('[data-hero="primaryCta"]'); if (p && site.hero.primaryCta) { p.textContent = site.hero.primaryCta.label; p.setAttribute("href", site.hero.primaryCta.href); }
    const s = $('[data-hero="secondaryCta"]'); if (s && site.hero.secondaryCta) { s.firstChild.textContent = site.hero.secondaryCta.label + " "; s.setAttribute("href", site.hero.secondaryCta.href); }
  }

  // Stats
  const statWrap = $("#stats");
  if (statWrap && Array.isArray(site.stats)) {
    statWrap.innerHTML = site.stats.map((s) => `
      <div class="stat reveal"><div class="num">${esc(s.value)}</div><div class="lbl">${esc(s.label)}</div></div>`).join("");
  }

  // Contact details (shared)
  const c = site.contact || {};
  $$('[data-contact="email"]').forEach((el) => { el.textContent = c.email || ""; if (el.tagName === "A") el.href = `mailto:${c.email}`; });
  $$('[data-contact="phone"]').forEach((el) => { if (!c.phone) { el.closest("[data-contact-block]")?.remove(); return; } el.textContent = c.phone; if (el.tagName === "A") el.href = `tel:${c.phone}`; });
  const addr = [c.address, `${c.city || ""}${c.city ? "," : ""} ${c.state || ""} ${c.zip || ""}`.trim()].filter(Boolean).join("\n");
  $$('[data-contact="address"]').forEach((el) => { el.textContent = addr; });
  $$('[data-map]').forEach((el) => { if (c.mapQuery) el.src = `https://www.google.com/maps?q=${encodeURIComponent(c.mapQuery)}&output=embed`; });

  // Footer note + tagline
  setText('[data-site="footerNote"]', site.footerNote);
  setText('[data-site="tagline"]', site.tagline);
  setText('[data-site="name"]', site.name);

  // Social
  const fb = $('[data-social="facebook"]'); if (fb) { if (site.social?.facebook) fb.href = site.social.facebook; else fb.remove(); }
  const ig = $('[data-social="instagram"]'); if (ig) { if (site.social?.instagram) ig.href = site.social.instagram; else ig.remove(); }
}

function renderAbout(about) {
  if (!about) return;
  setText('[data-about="title"]', about.sectionTitle);
  setText('[data-about="lead"]', about.lead);
  const body = $('[data-about="body"]');
  if (body && Array.isArray(about.paragraphs)) body.innerHTML = about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
  const hl = $('[data-about="highlights"]');
  if (hl && Array.isArray(about.highlights)) hl.innerHTML = about.highlights.map((h) => `
    <div class="highlight reveal"><h3>${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("");
}

function renderAmenities(data) {
  if (!data) return;
  setText('[data-amenities="title"]', data.sectionTitle);
  setText('[data-amenities="intro"]', data.intro);
  const grid = $('[data-amenities="grid"]');
  if (grid && Array.isArray(data.items)) grid.innerHTML = data.items.map((a) => `
    <div class="amenity reveal"><div class="ico">${icon(a.icon)}</div><h3>${esc(a.title)}</h3><p>${esc(a.body)}</p></div>`).join("");
}

function unitCard(u) {
  const feats = Array.isArray(u.features) ? `<ul class="unit-features">${u.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : "";
  return `<article class="unit-card reveal">
    <div class="unit-top"><h3>${esc(u.name)}</h3><span class="unit-id">${esc(u.id || "")}</span></div>
    <div class="unit-meta">
      <span><strong>${esc(u.beds)}</strong>${/studio/i.test(u.beds) ? "" : " bed"}</span>
      <span><strong>${esc(u.baths)}</strong> bath</span>
      <span><strong>${esc(u.sqft)}</strong> sq ft</span>
    </div>
    <div class="unit-body"><p>${esc(u.blurb)}</p>${feats}</div>
    <div class="unit-foot"><span class="unit-avail">${esc(u.availability || "Contact for availability")}</span>
      <a class="btn btn--ghost" href="index.html#contact">Inquire <span class="arrow">→</span></a></div>
  </article>`;
}

function renderApartments(data, { preview = false } = {}) {
  if (!data) return;
  setText('[data-apartments="intro"]', data.intro);
  setText('[data-apartments="note"]', data.note);
  const grid = $('[data-apartments="grid"]');
  if (grid && Array.isArray(data.unitTypes)) {
    const list = preview ? data.unitTypes.slice(0, 4) : data.unitTypes;
    grid.innerHTML = list.map(unitCard).join("");
  }
  const floors = $('[data-apartments="floors"]');
  if (floors && Array.isArray(data.floors)) floors.innerHTML = data.floors.map((f) => `
    <div class="floor reveal"><h4>${esc(f.level)}</h4><p>${esc(f.summary)}</p></div>`).join("");
}

function renderTimeline(data) {
  if (!data) return;
  setText('[data-timeline="title"]', data.sectionTitle);
  setText('[data-timeline="intro"]', data.intro);
  const wrap = $('[data-timeline="list"]');
  if (wrap && Array.isArray(data.milestones)) wrap.innerHTML = data.milestones.map((m) => `
    <div class="tl-item reveal"><div class="tl-date">${esc(m.date)}</div><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p></div>`).join("");
}

function renderGallery(data) {
  if (!data) return;
  setText('[data-gallery="title"]', data.sectionTitle);
  setText('[data-gallery="intro"]', data.intro);
  const grid = $('[data-gallery="grid"]');
  if (!grid || !Array.isArray(data.images)) return;
  grid.innerHTML = data.images.map((im, i) => `
    <figure data-lb="${i}" tabindex="0" role="button" aria-label="View ${esc(im.caption || "image")}">
      <img src="${esc(im.src)}" alt="${esc(im.caption || "The Jeffersonian")}" loading="lazy">
      ${im.caption ? `<figcaption>${esc(im.caption)}</figcaption>` : ""}
    </figure>`).join("");
  setupLightbox(data.images);
}

function renderFAQ(data) {
  if (!data) return;
  setText('[data-faq="title"]', data.sectionTitle);
  const wrap = $('[data-faq="list"]');
  if (!wrap || !Array.isArray(data.items)) return;
  wrap.innerHTML = data.items.map((f, i) => `
    <div class="faq-item">
      <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}" id="faq-q-${i}">${esc(f.q)}<span class="pm" aria-hidden="true"></span></button>
      <div class="faq-a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}"><div class="faq-a-inner">${esc(f.a)}</div></div>
    </div>`).join("");
  setupAccordion(wrap);
}

function renderUpdates(data) {
  if (!data) return;
  setText('[data-updates="title"]', data.sectionTitle);
  setText('[data-updates="intro"]', data.intro);
  const grid = $('[data-updates="grid"]');
  if (!grid || !Array.isArray(data.posts)) return;
  const fmt = (d) => { const dt = new Date(d + "T00:00:00"); return isNaN(dt) ? d : dt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); };
  const posts = [...data.posts].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);
  grid.innerHTML = posts.map((p) => `
    <article class="update-card reveal"><time datetime="${esc(p.date)}">${esc(fmt(p.date))}</time><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p></article>`).join("");
}

/* ---------- Interactions ---------- */
function setupAccordion(wrap) {
  $$(".faq-q", wrap).forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const panel = $(".faq-a", item);
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : null;
    });
  });
}

function setupLightbox(images) {
  let lb = $("#lightbox");
  if (!lb) {
    lb = document.createElement("div");
    lb.id = "lightbox"; lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
    lb.innerHTML = `
      <button class="lb-close" aria-label="Close">×</button>
      <button class="lb-nav lb-prev" aria-label="Previous">‹</button>
      <figure style="margin:0"><img alt=""><figcaption></figcaption></figure>
      <button class="lb-nav lb-next" aria-label="Next">›</button>`;
    document.body.appendChild(lb);
  }
  const img = $("img", lb), cap = $("figcaption", lb);
  let idx = 0;
  const show = (i) => { idx = (i + images.length) % images.length; img.src = images[idx].src; img.alt = images[idx].caption || ""; cap.textContent = images[idx].caption || ""; };
  const open = (i) => { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; };
  const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };

  $$("[data-lb]").forEach((fig) => {
    const i = Number(fig.dataset.lb);
    fig.addEventListener("click", () => open(i));
    fig.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
  });
  $(".lb-close", lb).onclick = close;
  $(".lb-prev", lb).onclick = () => show(idx - 1);
  $(".lb-next", lb).onclick = () => show(idx + 1);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
}

function setupNav() {
  const header = $(".site-header");
  const toggle = $(".nav-toggle");
  const links = $(".nav-links");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", links).forEach((a) => a.addEventListener("click", () => { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }));
  }
}

function setupReveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach((e) => io.observe(e));
}

function setupForm() {
  const form = $("#inquiry-form");
  if (!form) return;
  const status = $(".form-status", form);
  form.addEventListener("submit", async (e) => {
    // If the host supports Netlify Forms the default POST is captured.
    // We progressively enhance: show a friendly status, and fall back to
    // mailto when no form backend is present.
    e.preventDefault();
    if (form.querySelector('[name="bot-field"]')?.value) return; // honeypot
    const data = new FormData(form);
    status.textContent = "Sending…"; status.className = "form-status";
    try {
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(data).toString() });
      if (!res.ok) throw new Error(res.status);
      status.textContent = "Thank you — we'll be in touch soon."; status.className = "form-status ok";
      form.reset();
    } catch (err) {
      // Fallback: open the visitor's email client pre-filled.
      const to = $('[data-contact="email"]')?.textContent || "203WHarrison@gmail.com";
      const subject = encodeURIComponent("Inquiry — The Jeffersonian");
      const body = encodeURIComponent(`Name: ${data.get("name") || ""}\nEmail: ${data.get("email") || ""}\nPhone: ${data.get("phone") || ""}\nInterested in: ${data.get("interest") || ""}\n\n${data.get("message") || ""}`);
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      status.textContent = "Opening your email app to send your message…"; status.className = "form-status ok";
    }
  });
}

/* ---------- Boot ---------- */
async function init() {
  setupNav();
  const page = document.body.dataset.page;

  const [site] = await Promise.all([loadJSON("site").then((d) => { renderSite(d); return d; })]);

  if (page === "home") {
    const [about, amenities, apartments, timeline, gallery, faq, updates] = await Promise.all([
      loadJSON("about"), loadJSON("amenities"), loadJSON("apartments"),
      loadJSON("timeline"), loadJSON("gallery"), loadJSON("faq"), loadJSON("updates"),
    ]);
    renderAbout(about);
    renderAmenities(amenities);
    renderApartments(apartments, { preview: true });
    renderTimeline(timeline);
    renderGallery(gallery);
    renderFAQ(faq);
    renderUpdates(updates);
  } else if (page === "apartments") {
    const [apartments, amenities] = await Promise.all([loadJSON("apartments"), loadJSON("amenities")]);
    renderApartments(apartments, { preview: false });
    renderAmenities(amenities);
  }

  setupForm();
  setupReveal();
  // year in footer
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
}

document.addEventListener("DOMContentLoaded", init);
