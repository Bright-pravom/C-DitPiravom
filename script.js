const header = document.getElementById('site-header');
const mobileNav = document.getElementById('mobile-nav');
const toggleButton = document.querySelector('.nav-toggle');
const WHATSAPP_NUMBER = '919447921498';
const WHATSAPP_MESSAGE = 'Hello, I would like to know more about the courses and institution.';

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

if (toggleButton) {
  toggleButton.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    toggleButton.setAttribute('aria-expanded', String(isOpen));
    toggleButton.textContent = isOpen ? '✕' : '☰';
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

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
initWhatsAppButton();
