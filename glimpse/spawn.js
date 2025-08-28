function spawnGlimpse() {
  glimpse.style.display = 'flex';
  glimpse.classList.add('fade-in', 'show');
  document.body.style.overflow = 'hidden';
  searchInput.focus();
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  searchInput.select();
}