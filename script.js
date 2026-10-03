const nav = document.querySelector(".primary-nav");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const backTop = document.querySelector("#back-top");
const toast = document.querySelector("#toast");
const dialog = document.querySelector("#project-dialog");
const yearTarget = document.querySelector("#year");
const downloadCvButton = document.querySelector("#download-cv");
const printCvButton = document.querySelector("#print-cv");
let toastTimer;

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
    showToast("Your print-ready CV has been downloaded.");
  });
}

if (printCvButton) {
  printCvButton.addEventListener("click", () => {
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
    status.classList.add("success");
    status.textContent = "Thanks, your details are valid. This demo does not send messages or store your information.";
    showToast("Form validated. No message was sent.");
    form.reset();
    fields.forEach((field) => {
      field.input.removeAttribute("aria-invalid");
      field.error.textContent = "";
    });
  });
}