const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
const course = (window.cditData?.courses || []).find((item) => item.slug === slug);

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || '-';
};

if (course) {
  document.title = `${course.name} | C-DIT Computer Education`;
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
  }

  const modulesList = document.getElementById('detail-modules');
  if (modulesList) {
    modulesList.innerHTML = course.modules.map((module) => `
      <li><span class="checkmark">✓</span><span>${module}</span></li>
    `).join('');
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
