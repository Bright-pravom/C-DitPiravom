const header = document.getElementById('site-header');
const mobileNav = document.getElementById('mobile-nav');
const toggleButton = document.querySelector('.nav-toggle');
const mobileNavBackdrop = mobileNav ? document.createElement('button') : null;
const WHATSAPP_NUMBER = '919447921498';
const WHATSAPP_MESSAGE = 'Hello, I would like to know more about the courses and institution.';

if (mobileNav && mobileNavBackdrop) {
  mobileNavBackdrop.type = 'button';
  mobileNavBackdrop.className = 'mobile-nav-backdrop';
  mobileNavBackdrop.setAttribute('aria-label', 'Close navigation menu');
  mobileNavBackdrop.setAttribute('aria-hidden', 'true');
  mobileNavBackdrop.disabled = true;
  document.body.insertBefore(mobileNavBackdrop, header || document.body.firstChild);
}

const setMobileNavOpen = (isOpen) => {
  if (!mobileNav || !toggleButton || !mobileNavBackdrop) return;
  mobileNav.classList.toggle('open', isOpen);
  mobileNavBackdrop.classList.toggle('open', isOpen);
  mobileNavBackdrop.disabled = !isOpen;
  mobileNavBackdrop.setAttribute('aria-hidden', String(!isOpen));
  toggleButton.setAttribute('aria-expanded', String(isOpen));
  toggleButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  toggleButton.textContent = isOpen ? '✕' : '☰';
  document.body.style.overflow = isOpen ? 'hidden' : '';
};

const initWhatsAppButton = () => {
  if (document.querySelector('.whatsapp-floating-button')) return;
  const scriptElement = document.currentScript;
  if (!scriptElement) return;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  const iconUrl = new URL('assets/icons/whatsapp.svg', scriptElement.src).href;
  const button = document.createElement('a');
  button.className = 'whatsapp-floating-button';
  button.href = whatsappUrl;
  button.target = '_blank';
  button.rel = 'noopener noreferrer';
  button.setAttribute('aria-label', 'Chat with us on WhatsApp');
  button.innerHTML = `<img src="${iconUrl}" alt="" width="28" height="28" />`;
  document.body.appendChild(button);
};

const updateHeaderState = () => {
  if (!header) return;
  const shouldHaveShadow = window.scrollY > 16;
  header.classList.toggle('scrolled', shouldHaveShadow);
};

window.addEventListener('scroll', updateHeaderState, { passive: true });
updateHeaderState();

if (toggleButton && mobileNav) {
  toggleButton.addEventListener('click', () => {
    setMobileNavOpen(!mobileNav.classList.contains('open'));
  });
}
if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', () => setMobileNavOpen(false));

const initMobileFilterSheet = () => {
  const sheet = document.getElementById('mobile-filter-sheet');
  const openButton = document.getElementById('mobile-filter-toggle');
  const closeButton = sheet?.querySelector('.filter-sheet-close');
  const backdrop = sheet?.querySelector('.filter-sheet-backdrop');
  const applyButton = document.getElementById('apply-course-filters');
  const clearButton = document.getElementById('clear-course-filters');
  const count = document.getElementById('filter-count');
  const filterControls = ['category-filter', 'duration-filter', 'level-filter']
    .map((id) => document.getElementById(id))
    .filter((control) => control);

  if (!sheet || !openButton || !backdrop || !count) return;

  const mobileQuery = window.matchMedia('(max-width: 760px)');
  const originalParent = sheet.parentElement;
  const originalNextSibling = sheet.nextElementSibling;
  let previousBodyOverflow = '';

  const updateActiveFilterCount = () => {
    const categoryFilter = filterControls.find((control) => control.id === 'category-filter');
    const activeTab = document.querySelector('.category-tab.active');
    const activeCategoryCount = (categoryFilter?.value !== 'all') ||
      (activeTab && activeTab.dataset.category !== 'All') ? 1 : 0;
    const total = Number(activeCategoryCount) +
      filterControls.filter((control) => control.id !== 'category-filter' && control.value !== 'all').length;
    count.textContent = total ? String(total) : '';
    count.classList.toggle('visible', total > 0);
    count.setAttribute('aria-label', total ? `${total} active filters` : '');
  };

  const closeSheet = () => {
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
    openButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = previousBodyOverflow;
    openButton.focus();
  };

  const openSheet = () => {
    previousBodyOverflow = document.body.style.overflow;
    sheet.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
    openButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeButton?.focus();
  };

  const syncSheetAccessibility = () => {
    if (mobileQuery.matches) {
      if (sheet.parentElement !== document.body) document.body.appendChild(sheet);
      sheet.setAttribute('role', 'dialog');
      sheet.setAttribute('aria-modal', 'true');
      sheet.setAttribute('aria-hidden', String(!sheet.classList.contains('open')));
    } else {
      if (sheet.classList.contains('open')) {
        sheet.classList.remove('open');
        document.body.style.overflow = previousBodyOverflow;
      }
      if (originalParent && sheet.parentElement !== originalParent) {
        originalParent.insertBefore(sheet, originalNextSibling?.parentElement === originalParent ? originalNextSibling : null);
      }
      sheet.classList.remove('open');
      sheet.removeAttribute('role');
      sheet.removeAttribute('aria-modal');
      sheet.setAttribute('aria-hidden', 'false');
      openButton.setAttribute('aria-expanded', 'false');
    }
  };

  openButton.addEventListener('click', openSheet);
  closeButton?.addEventListener('click', closeSheet);
  backdrop.addEventListener('click', closeSheet);
  applyButton?.addEventListener('click', closeSheet);
  filterControls.forEach((control) => control.addEventListener('change', updateActiveFilterCount));
  document.getElementById('category-tabs')?.addEventListener('click', () => {
    window.setTimeout(updateActiveFilterCount);
  });
  clearButton?.addEventListener('click', () => {
    const allTab = document.querySelector('.category-tab[data-category="All"]');
    allTab?.click();
    filterControls.forEach((control) => {
      control.value = 'all';
      control.dispatchEvent(new Event('change', { bubbles: true }));
    });
    updateActiveFilterCount();
  });
  sheet.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeSheet();
      return;
    }
    if (event.key !== 'Tab' || !sheet.classList.contains('open')) return;
    const focusable = [...sheet.querySelectorAll('button:not(:disabled), select, input, [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  mobileQuery.addEventListener('change', syncSheetAccessibility);
  new MutationObserver(updateActiveFilterCount).observe(
    document.getElementById('category-tabs') || sheet,
    { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] }
  );
  syncSheetAccessibility();
  updateActiveFilterCount();
};

const pauseOffscreenMarquees = () => {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
    });
  });
  document.querySelectorAll('.marquee-wrap').forEach((marquee) => observer.observe(marquee));
};

const renderFeaturedCourses = () => {
  const target = document.getElementById('featured-courses');
  if (!target || !window.cditData) return;
  const featuredCourses = window.cditData.courses.filter((course) => course.featured).slice(0, 6);
  target.innerHTML = featuredCourses.map((course) => `
    <article class="course-card">
      ${course.categories.includes('PSC Approved') ? '<img class="psc-approved-badge" src="assets/pscapproved.png" alt="PSC Approved" width="88" height="88" />' : ''}
      <div class="course-card-media">
        <img src="${course.image}" alt="${course.name}" loading="lazy" width="800" height="550" />
      </div>
      <div class="course-card-content">
        <div class="course-meta">
          <span>${course.categoryPrimary}</span>
          <span class="badge">${course.level}</span>
        </div>
        <h3>${course.name}</h3>
        <p>${course.shortDescription}</p>
        <div class="course-card-footer">
          <span>${course.durationLabel}</span>
          <a href="courses/course-detail.html?slug=${course.slug}" class="link-arrow">View Details →</a>
        </div>
      </div>
    </article>
  `).join('');
};

const initAccordions = () => {
  document.querySelectorAll('.accordion-header').forEach((button) => {
    const item = button.closest('.accordion-item');
    if (!item) return;
    const isOpen = item.classList.contains('open');
    if (isOpen) {
      item.querySelector('.accordion-content').style.display = 'block';
    }
    button.addEventListener('click', () => {
      item.classList.toggle('open');
      const content = item.querySelector('.accordion-content');
      if (content) {
        content.style.display = item.classList.contains('open') ? 'block' : 'none';
      }
    });
  });
};

const validateField = (fieldName, value) => {
  const trimmed = value.trim();
  if (fieldName === 'name' && trimmed.length < 2) return 'Please enter your name.';
  if (fieldName === 'phone' && trimmed.length < 7) return 'Please enter a valid phone number.';
  if (fieldName === 'course' && trimmed.length < 2) return 'Please tell us which course you are interested in.';
  if (fieldName === 'message' && trimmed.length < 10) return 'Please add a short message.';
  return '';
};

const markFieldError = (name, message) => {
  const input = document.querySelector(`[name="${name}"]`);
  const errorNode = document.querySelector(`[data-error-for="${name}"]`);
  if (!input || !errorNode) return;
  input.classList.toggle('invalid', Boolean(message));
  errorNode.textContent = message;
};

const handleFormSubmit = (formId, successId) => {
  const form = document.getElementById(formId);
  const successBox = document.getElementById(successId);
  if (!form || !successBox) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const entries = Object.fromEntries(formData.entries());
    const fieldNames = Object.keys(entries);
    let hasError = false;

    fieldNames.forEach((fieldName) => {
      const message = validateField(fieldName, entries[fieldName]);
      if (message) {
        hasError = true;
      }
      markFieldError(fieldName, message);
    });

    if (hasError) {
      successBox.classList.remove('visible');
      return;
    }

    successBox.classList.add('visible');
    form.reset();
  });
};

renderFeaturedCourses();
initAccordions();
handleFormSubmit('home-enquiry-form', 'home-success');
initMobileFilterSheet();
pauseOffscreenMarquees();
initWhatsAppButton();
