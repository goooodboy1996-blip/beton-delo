const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('.menu');
const nav = document.querySelector('#navigation');
const service = document.querySelector('#service');
const description = document.querySelector('#description');
const viewSwitch = document.querySelector('.view-switch');
const cutaway = document.querySelector('#cutaway');
const photoCaption = document.querySelector('.cover figcaption');
function showCutaway(open) {
  cutaway.hidden = !open;
  viewSwitch.setAttribute('aria-expanded', String(open));
  viewSwitch.firstChild.textContent = open ? 'Показать фото ' : 'Показать схему ';
  photoCaption.lastChild.textContent = open ? ' Устройство плиты · условная схема' : ' Заливка фундаментной плиты';
}
viewSwitch.addEventListener('click', () => showCutaway(cutaway.hidden));

function toggleMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  nav.classList.toggle('open', open);
}
menu.addEventListener('click', () => toggleMenu(!nav.classList.contains('open')));
nav.addEventListener('click', () => toggleMenu(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    toggleMenu(false);
    menu.focus();
  }
});

const details = [...document.querySelectorAll('.service-list details')];
const samples = [...document.querySelectorAll('.sample')];
details.forEach((item, index) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    for (const other of details) {
      if (other !== item) other.open = false;
    }
    samples.forEach((sample, i) => sample.classList.toggle('active', index === i));
    document.querySelector('#sample-title').textContent = item.querySelector('strong').textContent;
    if (!reducedMotion.matches) {
      item.querySelector('.body').animate(
        [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
        { duration: 250, easing: 'ease-out' }
      );
    }
  });
});
document.querySelectorAll('[data-choose]').forEach(link => {
  link.addEventListener('click', () => { service.value = link.dataset.choose; });
});

const form = document.querySelector('#volume-form');
const result = document.querySelector('#volume-result');
const format = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 5});
function dimensions() {
  return ['length', 'width', 'thickness'].map(key => form.elements.namedItem(key).valueAsNumber);
}
function renderSlab(length, width, thickness) {
  const svg = document.querySelector('#slab');
  const ratio = Math.min(2.3, Math.max(.44, length / width));
  const x = 286 * ratio / (1 + ratio);
  const y = 286 - x;
  const depth = Math.min(48, Math.max(8, 18 * Math.sqrt(thickness / 20)));
  const start = 65, top = 36;
  const a = [start + y, top], b = [start + x + y, top + x * .42];
  const c = [start + x, top + (x + y) * .42], d = [start, top + y * .42];
  const down = ([px, py]) => [px, py + depth];
  const polygon = points => 'M' + points.join(' L') + ' Z';
  const topPath = polygon([a, b, c, d]);
  svg.querySelector('#face-top').setAttribute('d', topPath);
  svg.querySelector('#face-grid').setAttribute('d', topPath);
  svg.querySelector('#face-left').setAttribute('d', polygon([d, c, down(c), down(d)]));
  svg.querySelector('#face-right').setAttribute('d', polygon([c, b, down(b), down(c)]));
  function dimensionLine(axis, from, to, value) {
    const offset = depth + 14;
    const [x1, y1] = from, [x2, y2] = to;
    svg.querySelector('#measure-' + axis).setAttribute('d',
      `M${x1} ${y1+offset} L${x2} ${y2+offset} M${x1} ${y1+offset-3}v6 M${x2} ${y2+offset-3}v6`);
    const label = svg.querySelector('#label-' + axis);
    label.setAttribute('x', (x1 + x2) / 2);
    label.setAttribute('y', (y1 + y2) / 2 + offset + 22);
    label.textContent = format.format(value) + ' м';
  }
  dimensionLine('x', d, c, length);
  dimensionLine('y', c, b, width);
}
function updateVolume() {
  const valid = form.checkValidity();
  document.querySelector('#slab').style.visibility = valid ? 'visible' : 'hidden';
  if (!valid) { result.value = '—'; return; }
  const [length, width, thickness] = dimensions();
  result.value = format.format(length * width * thickness / 100) + ' м³';
  renderSlab(length, width, thickness);
}
form.addEventListener('input', updateVolume);
updateVolume();
form.addEventListener('submit', event => {
  event.preventDefault();
  const [length, width, thickness] = dimensions().map(value => format.format(value));
  if (!['Фундаменты','Бетонные полы','Площадки и отмостки'].includes(service.value)) service.value = 'Другие работы';
  description.value = `Размеры: ${length} × ${width} м, толщина ${thickness} см. Объём без запаса: ${result.value}. Адрес объекта: `;
  description.setCustomValidity('');
  document.querySelector('#contact').scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  description.focus({preventScroll:true});
});

const dialog = document.querySelector('#request-dialog');
const preview = document.querySelector('#request-text');
const copy = document.querySelector('#copy-request');
description.addEventListener('input', () => description.setCustomValidity(''));
document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!description.value.trim()) {
    description.setCustomValidity('Опишите вашу задачу.');
    description.reportValidity();
    return;
  }
  preview.textContent = `Здравствуйте! Интересуют бетонные работы.\n\n${service.value}.\n${description.value.trim()}`;
  document.querySelector('#whatsapp-link').href = 'https://wa.me/79517243652?text=' + encodeURIComponent(preview.textContent);
  copy.textContent = 'Скопировать текст';
  dialog.showModal();
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(preview.textContent);
    copy.textContent = 'Скопировано';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(preview);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copy.textContent = 'Текст выделен для копирования';
  }
});

// Build the photograph from five independently moving strips, then release the layers.
const photo = document.querySelector('.photo-window img');
const strips = [...document.querySelectorAll('.shutters i')];
let animations = [];
function assemble() {
  if (reducedMotion.matches || !photo.naturalWidth || !photo.animate) return;
  animations.forEach(animation => animation.cancel());
  const {width, height} = photo.getBoundingClientRect();
  const scale = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
  const sw = photo.naturalWidth * scale, sh = photo.naturalHeight * scale;
  const origin = photo.getBoundingClientRect().left;
  animations = strips.map((strip, index) => {
    const left = strip.getBoundingClientRect().left - origin;
    Object.assign(strip.style, {
      backgroundImage: 'url("' + photo.currentSrc + '")',
      backgroundSize: sw + 'px ' + sh + 'px',
      backgroundPosition: ((width - sw) * .83 - left) + 'px ' + ((height - sh) * .54) + 'px'
    });
    return strip.animate([
      {transform: 'translateY(' + (index % 2 ? -55 : 55) + '%)', opacity: 0},
      {transform: 'translateY(0)', opacity: 1}
    ], {duration: 720, delay: index * 60, easing: 'cubic-bezier(.17,.75,.22,1)', fill: 'both'});
  });
  photo.style.opacity = '0';
  const current = animations;
  Promise.allSettled(current.map(animation => animation.finished)).then(() => {
    if (current !== animations) return;
    photo.style.opacity = '';
    current.forEach(animation => animation.cancel());
    animations = [];
  });
}
if (!location.hash || location.hash === '#top') {
  if (photo.complete) assemble();
  else photo.addEventListener('load', () => { if (scrollY < innerHeight / 2) assemble(); }, {once:true});
}
document.querySelector('#replay-intro').addEventListener('click', () => {
  showCutaway(false);
  window.scrollTo({top:0, behavior:'instant'});
  assemble();
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) animations.forEach(animation => animation.cancel());
});

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (!reducedMotion.matches) entry.target.animate(
        [{transform:'translateY(14px)', opacity:.6}, {transform:'none', opacity:1}],
        {duration:450, easing:'ease-out'}
      );
    }
  }, {threshold:.15});
  document.querySelectorAll('.section h2,.steps li,.workbench').forEach(element => observer.observe(element));
}
