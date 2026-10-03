const galleryItems = window.cditData?.gallery || [];
const filterContainer = document.getElementById('gallery-filters');
const galleryMasonry = document.getElementById('gallery-masonry');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const closeButton = document.querySelector('.lightbox-close');
const prevButton = document.querySelector('.lightbox-prev');
const nextButton = document.querySelector('.lightbox-next');
let currentFilter = 'All';
let currentIndex = 0;

const categories = ['All', ...new Set(galleryItems.map((item) => item.category))];

const filterGallery = () => {
  const activeItems = currentFilter === 'All' ? galleryItems : galleryItems.filter((item) => item.category === currentFilter);
  if (!galleryMasonry) return;

  galleryMasonry.innerHTML = activeItems.map((item, index) => `
    <article class="gallery-item ${index % 3 === 0 ? 'large' : index % 2 === 0 ? 'medium' : 'small'}">
      <img src="${item.image}" srcset="${window.cditResponsiveImageSrcSet(item.image)}" sizes="(max-width: 760px) 92vw, (max-width: 1030px) 46vw, 380px" alt="${item.title}" loading="lazy" width="800" height="600" />
      <div class="gallery-overlay">${item.title}</div>
    </article>
  `).join('');

  const cards = galleryMasonry.querySelectorAll('.gallery-item');
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      currentIndex = index;
      openLightbox(activeItems, index);
    });
  });
};

const renderFilters = () => {
  if (!filterContainer) return;
  filterContainer.innerHTML = categories.map((category) => `
    <button type="button" class="chip ${category === currentFilter ? 'active' : ''}" data-category="${category}">${category}</button>
  `).join('');

  filterContainer.querySelectorAll('.chip').forEach((button) => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.category;
      renderFilters();
      filterGallery();
    });
  });
};

const openLightbox = (items, index) => {
  const currentItem = items[index];
  if (!lightbox || !lightboxImage || !currentItem) return;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  lightboxImage.src = currentItem.image;
  lightboxImage.alt = currentItem.title;
  currentIndex = index;
};

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
};

const moveLightbox = (direction) => {
  const activeItems = currentFilter === 'All' ? galleryItems : galleryItems.filter((item) => item.category === currentFilter);
  const nextIndex = (currentIndex + direction + activeItems.length) % activeItems.length;
  openLightbox(activeItems, nextIndex);
};

if (filterContainer && galleryMasonry) {
  renderFilters();
  filterGallery();
}

if (closeButton) closeButton.addEventListener('click', closeLightbox);
if (prevButton) prevButton.addEventListener('click', () => moveLightbox(-1));
if (nextButton) nextButton.addEventListener('click', () => moveLightbox(1));
if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}
document.addEventListener('keydown', (event) => {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowRight') moveLightbox(1);
  if (event.key === 'ArrowLeft') moveLightbox(-1);
});
