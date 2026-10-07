document.querySelectorAll('[data-mode]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.revision-drawing').dataset.mode = button.dataset.mode;
    document.querySelectorAll('button[data-mode]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  });
});
const privacy = document.querySelector('#privacy');
document.querySelector('.privacy-button').addEventListener('click', () => privacy.showModal());
document.querySelector('.dialog-close').addEventListener('click', () => privacy.close());
privacy.addEventListener('click', event => {
  const bounds = privacy.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) privacy.close();
});
