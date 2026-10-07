const courseCatalog = window.cditData?.courses || [];
const categoryFilter = document.getElementById('category-filter');
const durationFilter = document.getElementById('duration-filter');
const levelFilter = document.getElementById('level-filter');
const searchInput = document.getElementById('course-search');
const categoryTabs = document.getElementById('category-tabs');
const recommendedList = document.getElementById('recommended-list');
const courseResults = document.getElementById('course-results');

let activeCategoryTab = 'All';

const primaryCategories = [...new Set(courseCatalog.map((course) => course.categoryPrimary))].sort();
const categories = [...new Set(courseCatalog.flatMap((course) => course.categories))].sort();
const durations = [...new Set(courseCatalog.map((course) => course.durationLabel))].sort((a, b) => {
  const numA = Number.parseInt(a, 10) || 0;
  const numB = Number.parseInt(b, 10) || 0;
  return numA - numB;
});
const levels = [...new Set(courseCatalog.map((course) => course.level))];

const populateFilters = () => {
  categories.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    categoryFilter.appendChild(option);
  });

  durations.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    durationFilter.appendChild(option);
  });

  levels.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    levelFilter.appendChild(option);
  });
};

const renderCategoryTabs = () => {
  if (!categoryTabs) return;
  const tabs = ['All', ...primaryCategories];
  categoryTabs.innerHTML = tabs.map((tab) => `
    <button type="button" class="category-tab ${activeCategoryTab === tab ? 'active' : ''}" data-category="${tab}">${tab}</button>
  `).join('');

  categoryTabs.querySelectorAll('.category-tab').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategoryTab = button.dataset.category;
      if (activeCategoryTab === 'All') {
        categoryFilter.value = 'all';
      } else {
        categoryFilter.value = activeCategoryTab;
      }
      renderCategoryTabs();
      renderCourseResults();
    });
  });
};

const getFilteredCourses = () => {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const category = activeCategoryTab === 'All' ? categoryFilter.value : activeCategoryTab;
  const duration = durationFilter.value;
  const level = levelFilter.value;

  return courseCatalog.filter((course) => {
    const searchableText = [course.name, course.shortDescription, course.description, course.categoryPrimary, ...(course.categories || [])].join(' ').toLowerCase();
    const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
    const matchesCategory = category === 'all' || category === 'All' || course.categoryPrimary === category || course.categories.includes(category);
    const matchesDuration = duration === 'all' || course.durationLabel === duration;
    const matchesLevel = level === 'all' || course.level === level;
    return matchesSearch && matchesCategory && matchesDuration && matchesLevel;
  });
};

const renderRecommended = () => {
  const featured = courseCatalog.filter((course) => course.recommended).slice(0, 4);
  if (!recommendedList) return;
  recommendedList.innerHTML = featured.map((course) => `
    <article class="recommended-card">
      <span class="badge">Recommended</span>
      <h3>${course.name}</h3>
      <p>${course.shortDescription}</p>
      <div class="mini-meta">
        <span>${course.durationLabel}</span>
        <span>${course.level}</span>
      </div>
      <div class="course-card-footer" style="margin-top: 12px; border-top: none; padding-top: 0;">
        <a href="course-detail.html?slug=${course.slug}" class="link-arrow">View details →</a>
      </div>
    </article>
  `).join('');
};

const renderCourseResults = () => {
  const filtered = getFilteredCourses();
  if (!courseResults) return;

  if (!filtered.length) {
    courseResults.innerHTML = `
      <div class="empty-state">
        <h3>No courses found.</h3>
        <p>Try changing your filters or search term.</p>
        <button type="button" class="btn btn-secondary" id="clear-filters">Clear Filters</button>
      </div>
    `;
    const clearButton = document.getElementById('clear-filters');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        searchInput.value = '';
        categoryFilter.value = 'all';
        activeCategoryTab = 'All';
        durationFilter.value = 'all';
        levelFilter.value = 'all';
        renderCategoryTabs();
        renderCourseResults();
      });
    }
    return;
  }

  const grouped = filtered.reduce((accumulator, course) => {
    const groupName = course.categoryPrimary || course.categories[0];
    if (!accumulator[groupName]) accumulator[groupName] = [];
    accumulator[groupName].push(course);
    return accumulator;
  }, {});

  const sections = Object.entries(grouped).map(([groupName, courses]) => `
    <div class="course-group">
      <div class="course-group-head">
        <h3>${groupName}</h3>
        <span class="badge" style="background: var(--surface); color: var(--text-secondary); letter-spacing:0.02em; text-transform:none;">${courses.length} course${courses.length > 1 ? 's' : ''}</span>
      </div>
      <div class="course-grid">
        ${courses.map((course) => `
          <article class="course-card">
            ${course.categories.includes('PSC Approved') ? '<img class="psc-approved-badge" src="../assets/pscapproved.png" alt="PSC Approved" width="88" height="88" />' : ''}
            <div class="course-card-media">
              <img src="${course.image}" srcset="${window.cditResponsiveImageSrcSet(course.image)}" sizes="(max-width: 760px) 92vw, (max-width: 1030px) 46vw, 380px" alt="${course.name}" loading="lazy" width="800" height="550" />
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
                <a href="course-detail.html?slug=${course.slug}" class="link-arrow">View Details →</a>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `).join('');

  courseResults.innerHTML = sections;
};

if (categoryFilter && durationFilter && levelFilter && searchInput) {
  populateFilters();
  renderCategoryTabs();
  renderRecommended();
  renderCourseResults();

  [searchInput, categoryFilter, durationFilter, levelFilter].forEach((element) => {
    element.addEventListener('input', () => {
      if (element !== categoryFilter) {
        activeCategoryTab = 'All';
        renderCategoryTabs();
      }
      renderCourseResults();
    });
    element.addEventListener('change', () => {
      if (element === categoryFilter) {
        activeCategoryTab = categoryFilter.value === 'all' ? 'All' : categoryFilter.value;
        renderCategoryTabs();
      }
      renderCourseResults();
    });
  });
}
