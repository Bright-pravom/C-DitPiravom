const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
const course = (window.cditData?.courses || []).find((item) => item.slug === slug);

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || '-';
};

const setMetaContent = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.setAttribute('content', value);
};

if (course) {
  const titleSuffix = ' | C-Dit Piravom';
  const localizedCourseTitle = `${course.name} in Piravom${titleSuffix}`;
  document.title = localizedCourseTitle.length <= 60
    ? localizedCourseTitle
    : `${course.name.slice(0, 60 - titleSuffix.length - 1).trimEnd()}…${titleSuffix}`;
  const descriptionSuffix = ' Offered in Piravom, Ernakulam.';
  const maxDescriptionPrefixLength = 155 - descriptionSuffix.length;
  let descriptionPrefix = course.shortDescription.trim();
  if (descriptionPrefix.length > maxDescriptionPrefixLength) {
    descriptionPrefix = `${descriptionPrefix.slice(0, maxDescriptionPrefixLength - 1).replace(/\s+\S*$/, '').trimEnd()}…`;
  }
  const localizedDescription = `${descriptionPrefix}${descriptionSuffix}`;
  const localizedShareTitle = `${course.name} in Piravom | C-Dit Piravom`;
  setMetaContent('meta[name="description"]', localizedDescription);
  setMetaContent('meta[property="og:title"]', localizedShareTitle);
  setMetaContent('meta[property="og:description"]', localizedDescription);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.href = `https://c-ditpiravom.in/courses/course-detail.html?slug=${encodeURIComponent(course.slug)}`;
  }

  const courseStructuredData = document.createElement('script');
  courseStructuredData.type = 'application/ld+json';
  courseStructuredData.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'C-Dit Piravom'
    }
  });
  document.head.appendChild(courseStructuredData);

  setText('#detail-category', course.categoryPrimary || course.categories[0]);
  setText('#detail-name', course.name);
  setText('#detail-short', course.shortDescription);
  setText('#detail-duration', course.durationLabel);
  setText('#detail-eligibility', course.eligibility);
  setText('#detail-level', course.level);
  setText('#detail-description', course.description);
  setText('#detail-meta-duration', course.durationLabel);
  setText('#detail-meta-eligibility', course.eligibility);
  setText('#detail-meta-level', course.level);
  setText('#detail-type', course.type);

  const image = document.getElementById('detail-image');
  if (image) {
    image.src = course.image;
    image.alt = course.name;
    const srcSet = window.cditResponsiveImageSrcSet?.(course.image);
    if (srcSet) {
      image.srcset = srcSet;
      image.sizes = '(max-width: 760px) 92vw, (max-width: 1030px) 92vw, 42vw';
    }
  }

  const modulesList = document.getElementById('detail-modules');
  if (modulesList) {
    modulesList.innerHTML = course.modules.map((module) => `
      <li><span class="checkmark">✓</span><span>${module}</span></li>
    `).join('');
    const moduleItems = modulesList.querySelectorAll('li');
    if ('IntersectionObserver' in window) {
      const moduleObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      moduleItems.forEach((item) => moduleObserver.observe(item));
    } else {
      moduleItems.forEach((item) => item.classList.add('is-visible'));
    }
  }
} else {
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `
      <section class="not-found">
        <div class="not-found-card">
          <h1>404</h1>
          <h2>Course not found.</h2>
          <p>We could not find the course you requested. Please return to the course catalogue.</p>
          <div style="display:flex; justify-content:center; flex-wrap:wrap; gap:12px; margin-top:20px;">
            <a href="index.html" class="btn btn-primary">Back to Courses</a>
          </div>
        </div>
      </section>
    `;
  }
}
