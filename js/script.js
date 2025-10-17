const startButton = document.querySelector('.start-block__button');
const title = document.querySelector('.title');
const subtitle = document.querySelector('.subtitle');
const img = document.querySelector('.start-block__img img');
const game = document.querySelector('.game');
let isChecked = false;

if (startButton) {
  startButton.addEventListener(
    'click',
    (e) => {
      title.innerHTML = `Fang die Geschenke und gewinne!`;
      subtitle.innerHTML = `Endlich geht’s los! <br/>
Fangen Sie 5 Red Bull Dosen, aber weichen Sie den anderen Objekten aus! <br/>
Nur die Schnellsten schaffen es, das exklusive Red Bull Box Set freizuschalten.`;
      startButton.innerHTML = 'lass uns gehen!';
      img.src = 'img/lidl2.png';
      setTimeout(() => {
        isChecked = true;
        game.style.opacity = '1';
      });
    },
    10,
  );
}

const startBtn = document.querySelector('.start-block__button');
const restartButton = document.querySelector('.popup__final3');
const cart = document.querySelector('.cart');
const countdown = document.querySelector('.countdown');
const startBoxes = document.querySelectorAll('.start-boxes');

const all = document.querySelector('.all');
const pyro = document.querySelector('.pyro');

const miniBox1 = document.querySelector('.mini-box1');
const miniBox2 = document.querySelector('.mini-box2');
const miniBox3 = document.querySelector('.mini-box3');
const miniBox4 = document.querySelector('.mini-box4');

let score = 0;
let gameInterval;
let isGameActive = false;
let missed = false;

restartButton.addEventListener('click', startGame);
startBtn.addEventListener('click', startGame);

let touchX = null;
let targetX = null;

window.addEventListener('mousemove', (e) => {
  if (!isGameActive) return;
  const rect = game.getBoundingClientRect();
  moveCart(e.clientX - rect.left, rect.width);
});

game.addEventListener(
  'touchstart',
  (e) => {
    if (!isGameActive) return;
    e.preventDefault();
    const rect = game.getBoundingClientRect();
    touchX = e.touches[0].clientX - rect.left;
    targetX = touchX;
  },
  { passive: false },
);

game.addEventListener(
  'touchmove',
  (e) => {
    if (!isGameActive) return;
    e.preventDefault();
    const rect = game.getBoundingClientRect();
    targetX = e.touches[0].clientX - rect.left;
  },
  { passive: false },
);

function smoothMove() {
  if (!isGameActive) return;
  if (targetX !== null) {
    const rect = game.getBoundingClientRect();
    const currentLeft = parseFloat(cart.style.left) || rect.width / 2;
    const newLeft = currentLeft + (targetX - currentLeft) * 0.5;
    moveCart(newLeft, rect.width);
  }
  requestAnimationFrame(smoothMove);
}

function moveCart(x, gameWidth) {
  const cartWidth = cart.offsetWidth;
  const minX = cartWidth / 2;
  const maxX = gameWidth - cartWidth / 2;
  if (x < minX) x = minX;
  if (x > maxX) x = maxX;
  cart.style.left = `${x}px`;
}

function startGame() {
  if (!isChecked) return;

  popup1.classList.remove('active');
  popup2.classList.remove('active');

  miniBox1.style.opacity = '0';
  miniBox2.style.opacity = '0';
  miniBox3.style.opacity = '0';
  miniBox4.style.opacity = '0';
  all.textContent = 0;
  positiveScore = 0;
  score = 0;
  missed = false;
  isGameActive = false;

  startBoxes.forEach((item) => item.remove());
  game.classList.add('game-start');
  countdown.textContent = '3';
  let count = 3;

  clearInterval(gameInterval);

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth',
  });

  const timer = setInterval(() => {
    count--;
    if (count > 0) countdown.textContent = count;
    else if (count === 0) countdown.textContent = 'Start!';
    else {
      clearInterval(timer);
      countdown.textContent = '';
      runGame();
    }
  }, 1000);
}

function runGame() {
  isGameActive = true;
  gameInterval = setInterval(spawnItem, 1300);
  requestAnimationFrame(smoothMove);
}

let positiveScore = 0;

function spawnItem() {
  if (!isGameActive) return;

  const img = document.createElement('img');

  const boxes = ['img/box1.png', 'img/box2.png'];
  const randomIndex = Math.floor(Math.random() * boxes.length);
  const isBox1 = randomIndex === 0;
  img.src = boxes[randomIndex];

  img.classList.add('game__item');

  let width = isBox1 ? 62 : 44;
  if (game.offsetWidth < 500) width = width;
  img.style.width = width + 'px';

  const maxLeft = game.offsetWidth - width;
  let left;
  let safe = false;
  let tries = 0;

  while (!safe && tries < 20) {
    left = Math.random() * maxLeft;
    safe = true;
    const existing = document.querySelectorAll('.game__item');
    existing.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const gameRect = game.getBoundingClientRect();
      const existingLeft = rect.left - gameRect.left;
      const existingWidth = el.offsetWidth;
      if (Math.abs(existingLeft - left) < Math.max(existingWidth, width)) {
        safe = false;
      }
    });
    tries++;
  }

  img.style.left = `${left}px`;
  game.appendChild(img);

  let posY = -100;
  const fallSpeed = 6;

  const fall = setInterval(() => {
    if (!isGameActive) {
      clearInterval(fall);
      img.remove();
      return;
    }

    posY += fallSpeed;
    img.style.transform = `translateY(${posY}px)`;

    const cartRect = cart.getBoundingClientRect();
    const itemRect = img.getBoundingClientRect();

    if (
      itemRect.bottom >= cartRect.top &&
      itemRect.left < cartRect.right &&
      itemRect.right > cartRect.left
    ) {
      clearInterval(fall);
      img.remove();

      if (isBox1) {
        endGame('lose');
      } else {
        positiveScore++;
        if (positiveScore == 1) {
          miniBox1.style.opacity = '1';
        }
        if (positiveScore == 2) {
          miniBox2.style.opacity = '1';
        }
        if (positiveScore == 3) {
          miniBox3.style.opacity = '1';
        }
        if (positiveScore == 4) {
          miniBox4.style.opacity = '1';
        }
        all.textContent = positiveScore;
        if (positiveScore >= 5) {
          endGame('win');
          // pyro.classList.add('active');
        }
      }
    }

    if (posY > game.offsetHeight + 50) {
      clearInterval(fall);
      img.remove();
    }
  }, 20);
}

function endGame(result) {
  if (!isGameActive) return;
  isGameActive = false;
  clearInterval(gameInterval);

  setTimeout(() => {
    if (result === 'win') openPopup(popup2);
    else if (result === 'lose') openPopup(popup1);

    document.querySelectorAll('.game__item').forEach((el) => el.remove());
    // startBtn.style.display = 'inline-block';
  }, 200);
}

const popup1 = document.getElementById('popup1');
const popup2 = document.getElementById('popup2');

function openPopup(popup) {
  popup.classList.add('active');
}

function closePopup(popup) {
  if (popup.id === 'popup2') return;
  popup.classList.remove('active');
}

document.querySelectorAll('.popup-close').forEach((btn) => {
  btn.addEventListener('click', () => {
    closePopup(btn.closest('.popup-overlay'));
  });
});
