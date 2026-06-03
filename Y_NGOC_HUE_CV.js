const progressBar = document.querySelector(".scroll-progress");
const navLinks = Array.from(document.querySelectorAll(".menu-links a"));
const mobileCv = document.querySelector(".mobile-cv");
const desktopCv = document.querySelector(".cv-page");
const fitSection = document.querySelector("#fit");
const mobileQuery = window.matchMedia("(max-width: 760px)");

function normalizedText(element) {
  return element ? element.textContent.replace(/\s+/g, " ").trim() : "";
}

function addText(parent, tag, className, text) {
  if (!text) return null;

  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.appendChild(element);

  return element;
}

function cloneForMobile(element) {
  if (!element) return null;

  const clone = element.cloneNode(true);
  clone.classList.remove("reveal", "is-visible", "pulse-fit");
  Array.from(clone.querySelectorAll(".reveal, .is-visible, .pulse-fit")).forEach((child) => {
    child.classList.remove("reveal", "is-visible", "pulse-fit");
  });

  return clone;
}

function appendClone(parent, element) {
  const clone = cloneForMobile(element);
  if (clone) parent.appendChild(clone);
}

function buildMobileProfile() {
  const section = document.createElement("section");
  section.className = "mobile-section mobile-profile-card reveal";

  addText(section, "span", "eyebrow", "My profile");
  addText(section, "h2", "", normalizedText(document.querySelector(".hero-copy h1")));
  addText(section, "p", "headline", normalizedText(document.querySelector(".hero-copy .headline")));
  addText(section, "p", "target-role", normalizedText(document.querySelector(".hero-copy .target-role")));

  const contacts = Array.from(document.querySelectorAll(".contact-card span")).map(normalizedText).filter(Boolean);
  if (contacts.length) {
    const contactList = document.createElement("div");
    contactList.className = "mobile-contact-list";
    contacts.forEach((contact) => addText(contactList, "span", "", contact));
    section.appendChild(contactList);
  }

  return section;
}

function buildMobileImpact() {
  const source = desktopCv ? desktopCv.querySelector(".impact-panel") : null;
  if (!source) return null;

  const section = document.createElement("section");
  section.className = "mobile-section mobile-impact-card reveal";
  appendClone(section, source);

  return section;
}

function buildMobileExperience(sourceSection) {
  const section = document.createElement("section");
  section.className = "mobile-section mobile-experience-card reveal";
  section.dataset.sourceSection = sourceSection.id;

  const children = Array.from(sourceSection.children);
  appendClone(section, children.find((child) => child.tagName === "H2"));

  children.filter((child) => child.classList.contains("job")).forEach((job, index) => {
    const details = document.createElement("details");
    details.className = "mobile-job";
    details.open = index === 0;

    const summary = document.createElement("summary");
    addText(summary, "span", "mobile-job-role", normalizedText(job.querySelector("h3")));
    addText(summary, "span", "mobile-job-date", normalizedText(job.querySelector(".job-title-row p")));
    details.appendChild(summary);

    appendClone(details, job.querySelector(".company-note"));
    appendClone(details, job.querySelector("ul"));
    section.appendChild(details);
  });

  return section;
}

function buildMobileSection(sourceSection) {
  const section = document.createElement("section");
  section.className = `mobile-section mobile-${sourceSection.id || "section"}-card reveal`;
  section.dataset.sourceSection = sourceSection.id;

  if (sourceSection.classList.contains("two-column")) {
    section.classList.add("mobile-two-column-card");
    Array.from(sourceSection.children).forEach((child) => appendClone(section, child));
    return section;
  }

  const children = Array.from(sourceSection.children);
  const heading = children.find((child) => child.tagName === "H2");
  appendClone(section, heading);
  children.filter((child) => child !== heading).forEach((child) => appendClone(section, child));

  return section;
}

function buildMobileCv() {
  if (!mobileCv || !desktopCv) return;

  mobileCv.innerHTML = "";
  [buildMobileProfile(), buildMobileImpact()]
    .filter(Boolean)
    .forEach((section) => mobileCv.appendChild(section));

  Array.from(desktopCv.querySelectorAll(".section")).forEach((section) => {
    const mobileSection = section.id === "experience"
      ? buildMobileExperience(section)
      : buildMobileSection(section);
    mobileCv.appendChild(mobileSection);
  });
}

function bindMobileAccordions() {
  if (!mobileCv) return;

  const jobs = Array.from(mobileCv.querySelectorAll(".mobile-job"));
  jobs.forEach((job) => {
    job.addEventListener("toggle", () => {
      if (!job.open) return;

      jobs.forEach((otherJob) => {
        if (otherJob !== job) otherJob.open = false;
      });
    });
  });
}

function isMobileView() {
  return mobileQuery.matches && Boolean(mobileCv);
}

function getTargetSection(sectionId) {
  if (isMobileView()) {
    return mobileCv.querySelector(`[data-source-section="${sectionId}"]`);
  }

  return document.getElementById(sectionId);
}

function updateProgress() {
  if (!progressBar) return;

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
}

function updateActiveNav() {
  const midpoint = window.innerHeight * 0.38;
  const sections = isMobileView()
    ? Array.from(mobileCv.querySelectorAll("[data-source-section]"))
    : Array.from(document.querySelectorAll(".cv-page section[id]"));
  let activeId = "";

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= midpoint && rect.bottom >= midpoint) {
      activeId = section.dataset.sourceSection || section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  });
}

buildMobileCv();
bindMobileAccordions();

const revealItems = Array.from(document.querySelectorAll(".reveal"));

if ("IntersectionObserver" in window) {
  let revealObserver;
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const sectionId = link.hash.slice(1);
    const target = getTargetSection(sectionId);

    if (!target || !isMobileView()) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll('[data-action="print"]').forEach((button) => {
  button.addEventListener("click", () => {
    window.print();
  });
});

document.querySelectorAll('[data-action="focus"]').forEach((button) => {
  button.addEventListener("click", () => {
    const target = getTargetSection("fit") || fitSection;
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.classList.add("pulse-fit");
    window.setTimeout(() => target.classList.remove("pulse-fit"), 1100);
  });
});

window.addEventListener("scroll", () => {
  updateProgress();
  updateActiveNav();
}, { passive: true });

window.addEventListener("resize", () => {
  updateProgress();
  updateActiveNav();
});

if (mobileQuery.addEventListener) {
  mobileQuery.addEventListener("change", updateActiveNav);
} else {
  mobileQuery.addListener(updateActiveNav);
}

updateProgress();
updateActiveNav();
