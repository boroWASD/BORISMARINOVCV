const nav = document.querySelector(".primary-nav");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const backTop = document.querySelector("#back-top");
const toast = document.querySelector("#toast");
const dialog = document.querySelector("#project-dialog");
const yearTarget = document.querySelector("#year");
const downloadCvButton = document.querySelector("#download-cv");
const printCvButton = document.querySelector("#print-cv");
const contactForm = document.querySelector("#contact-form");
const STORAGE_KEYS = {
  analytics: "boro-portfolio-analytics",
  submissions: "boro-portfolio-contact-submissions",
  adminAuth: "boro-admin-auth"
};
let toastTimer;

function hashString(value) {
  if (!window.crypto || !window.crypto.subtle) return Promise.resolve("");
  return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)).then((digest) =>
    Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("")
  );
}

function getCurrentPage() {
  const path = location.pathname.replace(/^\/+/, "");
  return path === "" ? "index.html" : path;
}

function getTrafficSource(referrer) {
  if (!referrer) return "Direct";
  try {
    const parsed = new URL(referrer);
    const domain = parsed.hostname.replace(/^www\./, "");
    if (domain === location.hostname) return "Direct";
    if (domain.includes("google")) return "Google";
    if (domain.includes("github")) return "GitHub";
    if (domain.includes("linkedin") || domain.includes("instagram") || domain.includes("facebook") || domain.includes("twitter") || domain.includes("x.com")) return "Social";
    return domain;
  } catch {
    return "Direct";
  }
}

function getUtmData() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    utmTerm: params.get("utm_term") || "",
    utmContent: params.get("utm_content") || ""
  };
}

function getDeviceType() {
  const width = window.innerWidth;
  if (width >= 1024) return "Desktop";
  if (width >= 768) return "Tablet";
  return "Mobile";
}

function getBrowser() {
  const userAgent = navigator.userAgent;
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Chrome\//.test(userAgent)) return "Chrome";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return "Safari";
  return "Other";
}

function getOperatingSystem() {
  const userAgent = navigator.userAgent;
  if (/Windows/.test(userAgent)) return "Windows";
  if (/Macintosh/.test(userAgent)) return "macOS";
  if (/Android/.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";
  if (/Linux/.test(userAgent)) return "Linux";
  return "Other";
}

function trackAnalyticsEvent(eventType, payload = {}) {
  const sessionId = sessionStorage.getItem("boro-session-id") || "guest-session";
  const visitorId = localStorage.getItem("boro-visitor-id") || (() => {
    const newId = `visitor-${Math.random().toString(16).slice(2, 10)}`;
    localStorage.setItem("boro-visitor-id", newId);
    return newId;
  })();

  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    eventType,
    page: getCurrentPage(),
    visitorId,
    sessionId,
    source: getTrafficSource(document.referrer),
    referrer: document.referrer || "Direct",
    device: getDeviceType(),
    browser: getBrowser(),
    os: getOperatingSystem(),
    screen: `${window.innerWidth}x${window.innerHeight}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
    ...getUtmData(),
    ...payload
  };

  const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.analytics) || "[]");
  records.push(entry);
  localStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify(records.slice(-5000)));
}

function filterAnalyticsData(records, range) {
  if (!records.length) return [];
  const startTimes = {
    today: Date.now() - (24 * 60 * 60 * 1000),
    "7days": Date.now() - (7 * 24 * 60 * 60 * 1000),
    "30days": Date.now() - (30 * 24 * 60 * 60 * 1000),
    all: 0
  };

  return records.filter((entry) => {
    if (!entry.timestamp) return true;
    return new Date(entry.timestamp).getTime() >= startTimes[range];
  });
}

function tallyEntries(entries, key) {
  return entries.reduce((accumulator, entry) => {
    const label = entry[key] || "Unknown";
    accumulator[label] = (accumulator[label] || 0) + 1;
    return accumulator;
  }, {});
}

function renderList(target, map, limit = 5) {
  if (!target) return;
  const topEntries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, limit);
  target.innerHTML = topEntries.length ? topEntries.map(([label, count]) => `
    <li><span>${label}</span><strong>${count}</strong></li>
  `).join("") : "<li><span>No data yet</span><strong>0</strong></li>";
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" });
}

function renderAdminDashboard() {
  const rows = JSON.parse(localStorage.getItem(STORAGE_KEYS.analytics) || "[]");
  const submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.submissions) || "[]");
  const selectedRange = document.querySelector(".filter-toggle.is-active")?.dataset.range || "today";
  const filteredRows = filterAnalyticsData(rows, selectedRange);
  const totalVisits = filteredRows.length;
  const uniqueVisitors = new Set(filteredRows.map((entry) => entry.visitorId)).size;
  const sourceMap = tallyEntries(filteredRows, "source");
  const pageMap = tallyEntries(filteredRows.filter((entry) => entry.page), "page");
  const projectMap = tallyEntries(filteredRows.filter((entry) => entry.project), "project");
  const deviceMap = tallyEntries(filteredRows, "device");

  const totalVisitsEl = document.querySelector("#stat-total-visits");
  const uniqueVisitorsEl = document.querySelector("#stat-unique-visitors");
  const todayVisitsEl = document.querySelector("#stat-visits-today");
  const monthVisitsEl = document.querySelector("#stat-visits-month");

  if (totalVisitsEl) totalVisitsEl.textContent = totalVisits.toLocaleString();
  if (uniqueVisitorsEl) uniqueVisitorsEl.textContent = uniqueVisitors.toLocaleString();
  if (todayVisitsEl) todayVisitsEl.textContent = rows.filter((entry) => new Date(entry.timestamp).getTime() >= Date.now() - (24 * 60 * 60 * 1000)).length.toLocaleString();
  if (monthVisitsEl) monthVisitsEl.textContent = rows.filter((entry) => new Date(entry.timestamp).getTime() >= Date.now() - (30 * 24 * 60 * 60 * 1000)).length.toLocaleString();

  renderList(document.querySelector("#source-list"), sourceMap, 5);
  renderList(document.querySelector("#page-list"), pageMap, 5);
  renderList(document.querySelector("#project-list"), projectMap, 5);
  renderList(document.querySelector("#device-list"), deviceMap, 5);

  const activityTable = document.querySelector("#activity-table-body");
  if (activityTable) {
    activityTable.innerHTML = filteredRows.slice(-10).reverse().map((entry) => `
      <tr>
        <td>${formatTimestamp(entry.timestamp)}</td>
        <td>${entry.page || "-"}</td>
        <td>${entry.eventType || "event"}</td>
        <td>${entry.device || "-"}</td>
        <td>${entry.source || "Direct"}</td>
      </tr>
    `).join("") || '<tr><td colspan="5">No activity yet.</td></tr>';
  }

  const submissionTable = document.querySelector("#submission-table-body");
  if (submissionTable) {
    submissionTable.innerHTML = submissions.slice(0, 8).map((submission) => `
      <tr>
        <td>${submission.name || "-"}</td>
        <td>${submission.email || "-"}</td>
        <td>${submission.projectType || "-"}</td>
        <td class="message-cell">${submission.message || "-"}</td>
        <td>${formatTimestamp(submission.createdAt)}</td>
      </tr>
    `).join("") || '<tr><td colspan="5">No contact submissions yet.</td></tr>';
  }
}

function showAdminDashboard() {
  const loginPanel = document.querySelector("#admin-login-panel");
  const dashboard = document.querySelector("#admin-dashboard");
  if (loginPanel) loginPanel.classList.add("hidden");
  if (dashboard) {
    dashboard.classList.remove("hidden");
    dashboard.classList.add("is-visible");
    renderAdminDashboard();
  }
}

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    nav.classList.toggle("is-open", !isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

if (navLinks.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const activeLink = navLinks.find((link) => link.getAttribute("href") === `#${entry.target.id}`);
      if (!activeLink) return;
      navLinks.forEach((link) => {
        const active = link === activeLink;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });

  document.querySelectorAll("main section[id], #education").forEach((section) => sectionObserver.observe(section));
}

const revealTargets = document.querySelectorAll(".section-heading, .about-copy, .about-facts, .skill-group, .project-card, .timeline-column, .service-item, .process-step, .contact-copy, .contact-form");
if (revealTargets.length && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
}

if (backTop) {
  window.addEventListener("scroll", () => {
    backTop.classList.toggle("visible", window.scrollY > 550);
  }, { passive: true });

  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3500);
}

if (downloadCvButton) {
  downloadCvButton.addEventListener("click", () => {
    const cv = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Boro Marinov — CV</title>
  <style>
    * { box-sizing: border-box; }
    body { max-width: 850px; margin: 56px auto; padding: 0 40px; color: #25252b; font: 14px/1.65 "Segoe UI", Arial, sans-serif; }
    header { padding-bottom: 25px; border-bottom: 2px solid #25252b; }
    h1 { margin: 0; font-size: 34px; letter-spacing: -.04em; }
    .role { margin: 4px 0 0; color: #665b8b; font-size: 16px; }
    .location { margin: 8px 0 0; color: #686872; font-size: 12px; }
    section { margin-top: 25px; }
    h2 { margin: 0 0 10px; padding-bottom: 5px; border-bottom: 1px solid #d8d7dd; color: #665b8b; font-size: 11px; letter-spacing: .1em; }
    h3 { margin: 0; font-size: 14px; }
    p { margin: 5px 0 0; color: #55545c; }
    .entry { margin-top: 13px; }
    .meta { color: #74737c; font-size: 12px; }
    .skills { display: flex; flex-wrap: wrap; gap: 7px; }
    .skills span { padding: 4px 8px; border: 1px solid #d8d7dd; border-radius: 3px; font-size: 11px; }
    @media print { body { max-width: none; margin: 0; padding: 0; font-size: 11pt; } section { break-inside: avoid; } }
    @media (max-width: 600px) { body { margin: 28px auto; padding: 0 22px; } }
  </style>
</head>
<body>
  <header><h1>Boro Marinov</h1><p class="role">Computer Systems &amp; Technologies Student | Web Development | AI-Assisted Development</p><p class="location">Burgas, Bulgaria</p></header>
  <section><h2>PROFILE</h2><p>I am a motivated and communicative Computer Systems and Technologies student with a background in Applied Programming and a strong personal interest in web development, technology and AI-assisted development.</p></section>
  <section><h2>SKILLS</h2><p>HTML5, CSS3, JavaScript, Bootstrap, Responsive Web Design, UI/UX, Web Development, Git / GitHub, Databases / SQL, Computer Systems, Troubleshooting, AI-Assisted Web Development.</p><p>Education knowledge: Programming fundamentals, Object-Oriented Programming, Algorithms and data structures, Databases and SQL, Computer networks, Operating systems, Computer architecture, Microprocessors / microcontrollers, Software and computer systems.</p></section>
  <section><h2>EXPERIENCE</h2><div class="entry"><h3>Seasonal Employee — Airport Operations / Video Surveillance</h3><p class="meta">Fraport Twin Star Airport Management / Burgas Airport</p><p>Worked in a dynamic airport environment, assisted people with lost baggage and other airport-related situations, performed video surveillance and monitoring, monitored aircraft and relevant airport areas, and communicated with colleagues from different departments while working under time-sensitive conditions.</p></div></section>
  <section><h2>EDUCATION</h2><div class="entry"><h3>PGEE “Konstantin Fotinov”</h3><p class="meta">Vocational High School of Electrical Engineering and Electronics · Specialization: Applied Programming</p></div><div class="entry"><h3>Burgas Free University (BFU)</h3><p class="meta">Computer Systems and Technologies · Second-year student · Full-time studies</p></div></section>
  <section><h2>PROJECTS</h2><div class="entry"><h3>Personal and concept websites</h3><p class="meta">Responsive websites, product pages, e-commerce-style interfaces, login and registration screens, shopping cart functionality, contact pages, filters, forms, JavaScript interactions, UI/UX improvements, and debugging existing code.</p></div></section>
</body>
</html>`;
    const blob = new Blob([cv], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "Boro-Marinov-CV.html";
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    trackAnalyticsEvent("click", { label: "download-cv" });
    showToast("Your print-ready CV has been downloaded.");
  });
}

if (printCvButton) {
  printCvButton.addEventListener("click", () => {
    trackAnalyticsEvent("click", { label: "print-cv" });
    window.print();
  });
}

const projects = {
  glowie: {
    title: "Glowie — E-commerce Website",
    kind: "PERSONAL PROJECT",
    description: "A modern e-commerce concept featuring product cards, filtering, product information, cart functionality and a responsive interface.",
    technologies: ["HTML", "CSS", "JavaScript", "Bootstrap"]
  },
  portfolio: {
    title: "Personal Portfolio",
    kind: "PERSONAL PROJECT",
    description: "A responsive portfolio website designed to showcase skills, projects and freelance services.",
    technologies: ["HTML", "CSS", "JavaScript"]
  },
  business: {
    title: "Business Landing Page",
    kind: "CONCEPT PROJECT",
    description: "A modern landing page concept designed for a small business.",
    technologies: ["HTML", "CSS", "JavaScript"]
  },
  community: {
    title: "Community / Discord Website",
    kind: "CONCEPT PROJECT",
    description: "A modern community website concept with responsive navigation and clean UI.",
    technologies: ["HTML", "CSS", "JavaScript"]
  }
};

const projectButtons = document.querySelectorAll(".project-view");
if (projectButtons.length && dialog) {
  projectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const project = projects[button.dataset.project];
      if (!project) return;
      const kindEl = document.querySelector("#dialog-kind");
      const titleEl = document.querySelector("#dialog-title");
      const descriptionEl = document.querySelector("#dialog-description");
      const tech = document.querySelector("#dialog-tech");
      if (kindEl) kindEl.textContent = project.kind;
      if (titleEl) titleEl.textContent = project.title;
      if (descriptionEl) descriptionEl.textContent = project.description;
      if (tech) {
        tech.replaceChildren(...project.technologies.map((name) => {
          const tag = document.createElement("span");
          tag.textContent = name;
          return tag;
        }));
      }
      trackAnalyticsEvent("click", { label: `project-${button.dataset.project}`, project: button.dataset.project });
      dialog.showModal();
    });
  });

  const closeDialogButton = document.querySelector(".dialog-close");
  if (closeDialogButton) {
    closeDialogButton.addEventListener("click", () => dialog.close());
  }
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

const form = document.querySelector("#contact-form");
if (form) {
  const fields = [
    { input: document.querySelector("#name"), error: document.querySelector("#name-error"), message: "Please enter at least 2 characters." },
    { input: document.querySelector("#email"), error: document.querySelector("#email-error"), message: "Please enter a valid email address." },
    { input: document.querySelector("#project-type"), error: document.querySelector("#project-type-error"), message: "Please choose a project type." },
    { input: document.querySelector("#message"), error: document.querySelector("#message-error"), message: "Please enter at least 10 characters." }
  ].filter((field) => field.input && field.error);

  function validateField(field) {
    const valid = field.input.checkValidity();
    field.input.setAttribute("aria-invalid", String(!valid));
    field.error.textContent = valid ? "" : field.message;
    return valid;
  }

  fields.forEach((field) => {
    ["input", "change"].forEach((eventName) => field.input.addEventListener(eventName, () => {
      if (field.input.hasAttribute("aria-invalid")) validateField(field);
    }));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valid = fields.map(validateField).every(Boolean);
    const status = document.querySelector("#form-status");
    if (!valid) {
      status.classList.remove("success");
      status.textContent = "Please check the highlighted fields and try again.";
      fields.find((field) => !field.input.checkValidity())?.input.focus();
      return;
    }

    const submission = {
      name: document.querySelector("#name").value.trim(),
      email: document.querySelector("#email").value.trim(),
      projectType: document.querySelector("#project-type").value,
      message: document.querySelector("#message").value.trim(),
      createdAt: new Date().toISOString()
    };

    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.submissions) || "[]");
    submissions.unshift(submission);
    localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(submissions.slice(0, 200)));

    status.classList.add("success");
    status.textContent = "Thanks — your message has been saved locally for the owner dashboard.";
    trackAnalyticsEvent("contact_submission", { label: "contact-form-submit", project: submission.projectType, email: submission.email });
    showToast("Message saved locally for the owner dashboard.");
    form.reset();
    fields.forEach((field) => {
      field.input.removeAttribute("aria-invalid");
      field.error.textContent = "";
    });
  });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-track]");
  if (trigger) {
    trackAnalyticsEvent("click", { label: trigger.dataset.track, project: trigger.dataset.project || "" });
    return;
  }

  const projectButton = event.target.closest(".project-view");
  if (projectButton) {
    trackAnalyticsEvent("click", { label: `project-${projectButton.dataset.project}`, project: projectButton.dataset.project });
  }
});

if (document.body.dataset.page === "admin") {
  const loginForm = document.querySelector("#admin-login-form");
  const loginStatus = document.querySelector("#admin-auth-status");
  const dashboard = document.querySelector("#admin-dashboard");
  const filters = [...document.querySelectorAll(".filter-toggle")];

  const showLogin = () => {
    const loginPanel = document.querySelector("#admin-login-panel");
    loginPanel?.classList.remove("hidden");
    dashboard?.classList.add("hidden");
  };

  const isAuthenticated = () => sessionStorage.getItem(STORAGE_KEYS.adminAuth) === "true";

  if (isAuthenticated()) {
    showAdminDashboard();
  } else {
    showLogin();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const passwordInput = document.querySelector("#admin-password");
      const configuredHash = (window.BORO_ADMIN_CONFIG && window.BORO_ADMIN_CONFIG.passwordHash || "").trim();
      if (!configuredHash || configuredHash === "REPLACE_WITH_SHA256_HEX_OF_YOUR_PASSWORD") {
        loginStatus.textContent = "Add a valid password hash to config.js to enable owner access.";
        return;
      }

      const password = passwordInput.value.trim();
      const candidateHash = await hashString(password);
      if (candidateHash && candidateHash.toLowerCase() === configuredHash.toLowerCase()) {
        sessionStorage.setItem(STORAGE_KEYS.adminAuth, "true");
        showAdminDashboard();
        loginStatus.textContent = "";
        passwordInput.value = "";
      } else {
        loginStatus.textContent = "Incorrect password. Please try again.";
      }
    });
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((filterButton) => filterButton.classList.toggle("is-active", filterButton === button));
      renderAdminDashboard();
    });
  });

  const logoutButton = document.querySelector("#admin-logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem(STORAGE_KEYS.adminAuth);
      showLogin();
      if (loginStatus) loginStatus.textContent = "You have been logged out.";
    });
  }
}

if (!sessionStorage.getItem("boro-session-id")) {
  sessionStorage.setItem("boro-session-id", `session-${Date.now()}`);
}

if (!window.location.pathname.includes("admin.html")) {
  trackAnalyticsEvent("page_view", { label: getCurrentPage(), page: getCurrentPage() });
}