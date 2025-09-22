let galleryItems = [];
let currentIndex = -1;
let navSeq = 0;


function openModal(element) {
  galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  currentIndex = galleryItems.indexOf(element);
  const token = ++navSeq;

  const imgEl = element.querySelector('img');
  const thumb = imgEl.getAttribute('src');
  const full  = imgEl.getAttribute('data-full');
  const text  = imgEl.getAttribute('data-text');

  const modal = document.getElementById('modal');
  modal.classList.remove('closing');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  applyModalContent({ thumb, full, text, token });
  preloadNeighbors(currentIndex, 2);
}


function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal.classList.contains('open')) return;

  modal.classList.add('closing');
  modal.classList.remove('open');

  const onTransitionEnd = (e) => {
    if (e.target !== modal) return;
    modal.removeEventListener('transitionend', onTransitionEnd);
    modal.classList.remove('closing');

    document.body.style.overflow = '';
  };

  modal.addEventListener('transitionend', onTransitionEnd);
}

function showImageAt(index) {
  if (index < 0) index = galleryItems.length - 1;
  if (index >= galleryItems.length) index = 0;

  const token = ++navSeq; 
  currentIndex = index;

  const item  = galleryItems[index];
  const imgEl = item.querySelector('img');
  const thumb = imgEl.getAttribute('src');
  const full  = imgEl.getAttribute('data-full');
  const text  = imgEl.getAttribute('data-text');

  applyModalContent({ thumb, full, text, token });
  preloadNeighbors(index, 2);
}

function navigate(direction) {
  if (currentIndex === -1) return;
  showImageAt(currentIndex + direction);
}

function preloadNeighbors(centerIndex, radius = 1) {
  const total = galleryItems.length;
  for (let d = 1; d <= radius; d++) {
    const l = (centerIndex - d + total) % total;
    const r = (centerIndex + d) % total;
    const lf = galleryItems[l].querySelector('img').getAttribute('data-full');
    const rf = galleryItems[r].querySelector('img').getAttribute('data-full');
    preloadFull(lf); preloadFull(rf);
  }
}


// Close modal by clicking the overlay only (not arrows or content)
document.getElementById('modal').addEventListener('click', function(event) {
  if (event.target.id === 'modal') {
    closeModal();
  }
});

// Close modal with Escape key and navigate with arrow keys
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  } else if (event.key === 'ArrowRight' && currentIndex !== -1) {
    navigate(1);
  } else if (event.key === 'ArrowLeft' && currentIndex !== -1) {
    navigate(-1);
  }
});
const fullCache = new Map(); // src -> Promise<HTMLImageElement>

function decodeWithTimeout(img, ms = 400) {
  if (!img.decode) return Promise.resolve();
  return Promise.race([
    img.decode(),
    new Promise(res => setTimeout(res, ms))
  ]).catch(() => {});
}
//preload images 
function preloadFull(src) {
  if (fullCache.has(src)) return fullCache.get(src);

  const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    img.onload = () => decodeWithTimeout(img).then(() => resolve(img));
    img.onerror = reject;
  });

  fullCache.set(src, p);
  return p;
}
function applyModalContent({ thumb, full, text, token }) {
  const modalImg  = document.getElementById('modal-img');
  const modalText = document.getElementById('modal-text');

  if (thumb) modalImg.src = thumb;
  modalText.innerHTML = text || '';

  if (full) {
    preloadFull(full).then(img => {
      if (token === navSeq) {
        modalImg.src = img.src;
      }
    }).catch(() => {});
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  });
  const modalImg = document.getElementById('modal-img');
  if (modalImg) {
    modalImg.setAttribute('decoding', 'async');
    modalImg.setAttribute('fetchpriority', 'high');
  }
});
