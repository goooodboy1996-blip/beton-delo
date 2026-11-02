const rows=[["Фундаментная плита","Сплошное основание под дом или гараж.","Готовим и уплотняем основание.|Собираем опалубку и вяжем арматуру по проекту.|Заливаем плиту и выравниваем поверхность.",2,4],["Ленточный фундамент","Бетонная лента под стенами дома.","Размечаем оси стен на участке.|Готовим траншеи и собираем арматурный каркас.|Выставляем опалубку и заливаем ленту.",8,11],["Ростверк на сваях","Бетонная балка, которая связывает сваи.","Уточняем положение свай и отметку балки.|Собираем опалубку и связываем каркас по проекту.|Укладываем и уплотняем бетон.",2,4],["Бетонный пол","Пол для гаража, склада или мастерской.","Готовим основание с учётом нагрузки.|Укладываем бетон и выравниваем поверхность.|Выполняем финишную обработку и швы по проекту.",5,6],["Стяжка пола","Ровное основание под напольное покрытие.","Проверяем перепады высоты.|Выставляем направляющие и укладываем смесь.|Выравниваем поверхность под выбранное покрытие.",5,7],["Монолитное перекрытие","Железобетонная плита между этажами.","Собираем опалубку на временных опорах.|Вяжем арматуру и оставляем проёмы по проекту.|Заливаем перекрытие и организуем уход за бетоном.",9,2],["Въезд и парковка","Площадка под автомобиль у дома.","Учитываем вес машин и направление стока воды.|Уплотняем основание и выставляем опалубку.|Заливаем площадку и устраиваем швы.",0,6],["Садовые дорожки","Бетонные дорожки между домом, садом и двором.","Размечаем маршрут и ширину прохода.|Готовим основание и выставляем борта формы.|Укладываем бетон с уклоном для отвода воды.",1,7],["Отмостка вокруг дома","Полоса вдоль стен для отвода дождевой воды.","Уточняем ширину и уклон от дома.|Готовим основание и устанавливаем опалубку.|Бетонируем полосу и устраиваем швы.",0,1],["Крыльцо и ступени","Бетонная площадка и ступени перед входом.","Проверяем высоту порога и размеры площадки.|Собираем форму ступеней и арматурный каркас.|Заливаем крыльцо и выравниваем ступени.",10,7],["Межэтажная лестница","Монолитный лестничный марш внутри дома.","Уточняем высоту этажей и размеры проёма.|Собираем наклонную опалубку и вяжем арматуру.|Заливаем марш и формируем ступени.",10,2],["Подпорная стена","Бетонная стена для участка с перепадом высот.","Уточняем перепад высот и решение по дренажу.|Готовим основание и арматурный каркас по проекту.|Собираем щиты и бетонируем стену.",3,4]], groups=["Фундаменты","Полы и перекрытия","Двор и дорожки","Лестницы и стены"], stages=["Уплотнение щебня","Опалубка по контуру","Вязка арматуры","Щиты опалубки","Подача бетона","Выравнивание по направляющим","Нарезка швов","Заглаживание поверхности","Разметка осей","Временные опоры","Опалубка ступеней","Арматурный каркас"];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('.hero');
const shots = [...document.querySelectorAll('.shot')];
const captions = [...document.querySelectorAll('.caption')];
const ticks = [...document.querySelectorAll('.ticks i')];
const pause = document.querySelector('#pause');
const dialog = document.querySelector('dialog');
let current = 0;
let timer;
let playing = !motion.matches;
let inView = true;

function schedule() {
  clearTimeout(timer);
  pause.textContent = playing ? 'Ⅱ' : '▷';
  pause.setAttribute('aria-label', playing ? 'Приостановить смену кадров' : 'Включить смену кадров');
  if (playing && inView && !document.hidden && !dialog.open) {
    timer = setTimeout(() => showSlide(current + 1), 6200);
  }
}
function showSlide(index) {
  current = (index + shots.length) % shots.length;
  shots.forEach((shot, i) => {
    shot.classList.toggle('active', i === current);
    captions[i].classList.toggle('active', i === current);
    captions[i].setAttribute('aria-hidden', String(i !== current));
    ticks[i].classList.toggle('on', i === current);
  });
  document.querySelector('#slide-index').textContent = String(current + 1).padStart(2, '0');
  schedule();
}
document.querySelector('#prev').onclick = () => showSlide(current - 1);
document.querySelector('#next').onclick = () => showSlide(current + 1);
pause.onclick = () => { playing = !playing; schedule(); };
motion.addEventListener('change', () => { playing = !motion.matches; schedule(); });
document.addEventListener('visibilitychange', schedule);
let touchStart;
hero.addEventListener('touchstart', e => {
  touchStart = [e.touches[0].clientX, e.touches[0].clientY];
}, {passive:true});
hero.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart[0];
  const dy = e.changedTouches[0].clientY - touchStart[1];
  if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) showSlide(current + (dx < 0 ? 1 : -1));
  touchStart = null;
}, {passive:true});

function enter(element, delay = 0) {
  if (motion.matches || !element.animate) return;
  element.animate([{opacity:.35, transform:'translateY(13px)'}, {opacity:1, transform:'translateY(0)'}],
    {duration:430, delay, easing:'cubic-bezier(.18,.7,.24,1)', fill:'backwards'});
}
const cards = [...document.querySelectorAll('.card')];
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); }).observe(hero);
  const reveal = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach((entry, i) => {
      reveal.unobserve(entry.target);
      enter(entry.target, (i % 3) * 45);
    });
  });
  document.querySelectorAll('.card, .catalog h2, .contact > *, footer').forEach(el => reveal.observe(el));
}
schedule();

const filters = [...document.querySelectorAll('.filters button')];
for (const button of filters) {
  button.onclick = () => {
    const group = Number(button.dataset.group);
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach((card, i) => {
      card.hidden = group >= 0 && Math.floor(i / 3) !== group;
      if (!card.hidden) enter(card, (i % 3) * 45);
    });
  };
}
for (const [i, card] of cards.entries()) {
  card.onclick = () => {
    const [name, desc, work, ...images] = rows[i];
    document.querySelector('#name').textContent = name;
    document.querySelector('#group').textContent = groups[Math.floor(i / 3)];
    document.querySelector('#desc').textContent = desc;
    document.querySelector('#sample').src = card.querySelector('img').src;
    document.querySelector('#tasks').replaceChildren(...work.split('|').map(text => {
      const li = document.createElement('li'); li.textContent = text; return li;
    }));
    document.querySelector('.pair').replaceChildren(...images.map(k => {
      const figure = document.createElement('figure');
      const image = new Image();
      image.src = 'media/stage' + k + '.webp';
      image.alt = '';
      const caption = document.createElement('figcaption');
      caption.textContent = stages[k];
      figure.append(image, caption);
      return figure;
    }));
    dialog.showModal();
    dialog.scrollTop = 0;
    schedule();
  };
}
dialog.querySelector('.close').onclick = () => dialog.close();
dialog.onclick = e => { if (e.target === dialog) dialog.close(); };
dialog.addEventListener('close', schedule);
