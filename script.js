let galleryItems = [];
let currentIndex = -1;

function openModal(element) {
  galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  currentIndex = galleryItems.indexOf(element);

  const img = element.querySelector('img');
  const fullSrc = img.getAttribute('data-full');
  const htmlText = img.getAttribute('data-text');

  document.getElementById('modal-img').src = fullSrc;
  document.getElementById('modal-text').innerHTML = htmlText;
  document.getElementById('modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  currentIndex = -1;
}

function showImageAt(index) {
  if (index < 0) index = galleryItems.length - 1;
  if (index >= galleryItems.length) index = 0;
  openModal(galleryItems[index]);
}

function navigate(direction) {
  if (currentIndex === -1) return;
  showImageAt(currentIndex + direction);
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