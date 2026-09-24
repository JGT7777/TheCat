const panels = document.querySelectorAll('.game-panel');
const count = document.querySelector('#count');
const completed = new Set();
const progressDots = document.querySelectorAll('#progressDots i');
const interlude = document.querySelector('#interlude');
const interludeText = document.querySelector('#interludeText');
const interludeKicker = document.querySelector('#interludeKicker');
const continueButton = document.querySelector('#continueButton');
const betrayal = document.querySelector('#betrayal');
const betrayalText = document.querySelector('#betrayalText');
const betrayalButton = document.querySelector('#betrayalButton');
const jumpscare = document.querySelector('#jumpscare');
const jumpscareImage = document.querySelector('#jumpscareImage');
const memoryScore = document.querySelector('#memoryScore');
let mistakeCount = 0;
let jumpscareShowing = false;
let nextJumpscareAt = 0;

function showJumpscare(force = false) {
  if (jumpscareShowing || (!force && Date.now() < nextJumpscareAt)) return;
  nextJumpscareAt = Date.now() + 5000;
  jumpscareShowing = true;
  jumpscare.classList.remove('final');
  jumpscareImage.src = './jumpscare.png';
  jumpscare.classList.add('visible');
  jumpscare.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => {
    jumpscare.classList.remove('visible');
    jumpscare.setAttribute('aria-hidden', 'true');
    jumpscareShowing = false;
  }, 900);
}

window.setInterval(() => {
  const stage = Number(document.body.dataset.stage || 0);
  const activePanel = document.querySelector('.game-panel.active')?.dataset.panel;
  if (stage >= 2 && activePanel !== '1' && !interlude.classList.contains('visible') && !jumpscareShowing && Math.random() < .2) showJumpscare();
}, 10000);

function scare(message) {
  mistakeCount += 1;
  document.body.classList.add('mistake', `mistake-${mistakeCount}`);
  window.setTimeout(() => document.body.classList.remove('mistake'), 420);
  if (message) message.textContent = mistakeCount > 2 ? 'she saw that.' : 'wrong.';
}

function complete(number) {
  if (completed.has(number)) return;
  completed.add(number);
  if (count) count.textContent = `${completed.size} / 4`;
  if (progressDots[number - 1]) {
    progressDots[number - 1].classList.add('done');
    progressDots[number - 1].classList.remove('current');
  }
  document.body.dataset.stage = completed.size;
  document.body.classList.add(`room-${number}-done`);
  const panel = document.querySelector(`[data-panel="${number}"]`);
  panel.classList.add('released');
  window.setTimeout(() => panel.classList.remove('released'), 1500);
  if (completed.size < 4) showInterlude(number);
  else { document.body.classList.add('everything-awake'); window.setTimeout(showBetrayal, 1300); }
}

function showInterlude(number) {
  const messages = {
    1: ['', "wasn't that easy?\nright? right?"],
    2: ['', 'Just like that...\nkeep going...keeeeeep going'],
    3: ['', 'NICEE VERY NICEEE\nSO CLOOOOSSEEE.']
  };
  interludeKicker.textContent = messages[number][0];
  interludeText.textContent = messages[number][1];
  interlude.dataset.nextPanel = String(number + 1);
  interlude.classList.add('visible', `scare-${number}`);
  interlude.setAttribute('aria-hidden', 'false');
  document.body.classList.add('interlude-open');
  window.setTimeout(() => interlude.classList.remove(`scare-${number}`), 900);
}

continueButton.addEventListener('click', () => {
  const next = Number(interlude.dataset.nextPanel || 1);
  interlude.classList.remove('visible');
  interlude.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('interlude-open');
  if (next <= 4) {
    panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === String(next)));
    if (progressDots[next - 1]) progressDots[next - 1].classList.add('current');
    if (next === 2) setupDodge();
  }
});
document.addEventListener('keydown', (event) => {
  if (interlude.classList.contains('visible')) {
    event.preventDefault();
    continueButton.click();
  }
});

function showBetrayal() {
  betrayal.classList.add('visible');
  betrayal.setAttribute('aria-hidden', 'false');
  betrayal.querySelector('.betrayal-small').textContent = '';
  betrayalButton.textContent = 'continue';
  const words = '...'.split('');
  let index = 0;
  const write = () => {
    betrayalText.textContent = words.slice(0, index).join('');
    index += 1;
    if (index <= words.length) window.setTimeout(write, 55);
  };
  write();
}

let endingStep = 0;
betrayalButton.addEventListener('click', () => {
  endingStep += 1;
  if (endingStep === 1) betrayalText.textContent = 'Now He is free.';
  else if (endingStep === 2) betrayalText.textContent = "I'm sorry, but I can't let u leave...";
  else {
    betrayal.classList.remove('visible');
    betrayal.setAttribute('aria-hidden', 'true');
    jumpscareImage.src = './ending.png';
    jumpscare.classList.add('visible', 'final');
    jumpscare.setAttribute('aria-hidden', 'false');
    betrayalButton.disabled = true;
    document.body.classList.add('caught');
  }
});

const memoryBoard = document.querySelector('#memoryBoard');
const memoryMessage = document.querySelector('#memoryMessage');
let memoryOpen = [];
let memoryLocked = false;
const memoryValues = ['pair1', 'pair1', 'pair2', 'pair2', 'pair3', 'pair3'].sort(() => Math.random() - .5);
function setupMemory() {
  memoryBoard.innerHTML = '';
  memoryOpen = [];
  memoryLocked = false;
  memoryValues.forEach((value, index) => {
    const card = document.createElement('button');
    card.className = 'memory-card';
    card.dataset.value = value;
    card.dataset.index = index;
    card.innerHTML = `<img src="./${value}.png" alt="" />`;
    card.style.setProperty('--tilt', `${-5 + Math.random() * 10}deg`);
    card.addEventListener('click', () => flipMemory(card));
    memoryBoard.appendChild(card);
  });
  memoryMessage.textContent = '';
}
function flipMemory(card) {
  if (memoryLocked || card.classList.contains('open') || card.classList.contains('matched')) return;
  card.classList.add('open');
  memoryOpen.push(card);
  if (memoryOpen.length < 2) return;
  if (memoryOpen[0].dataset.value === memoryOpen[1].dataset.value) {
    memoryOpen.forEach((item) => item.classList.add('matched'));
    memoryOpen = [];
    if (document.querySelectorAll('.matched').length === 6) {
      memoryMessage.textContent = '';
      complete(1);
    }
  } else {
    memoryLocked = true;
    scare(memoryMessage);
    window.setTimeout(() => {
      memoryBoard.querySelectorAll('.memory-card').forEach((item) => item.classList.remove('open', 'matched'));
      memoryOpen = [];
      memoryLocked = false;
      memoryMessage.textContent = '';
    }, 700);
  }
}
setupMemory();


const dodgeGame = document.querySelector('#dodgeGame');
const dodgePlayer = document.querySelector('#dodgePlayer');
const dodgeGhosts = document.querySelector('#dodgeGhosts');
const dodgeDoor = document.querySelector('#dodgeDoor');
const dodgeTimerDisplay = document.querySelector('#dodgeTimerDisplay');
let dodgeTimer;
let dodgeMoveTimer;
let dodgeSpawnTimer;
let dodgeCountdownTimer;
let dodgeResetTimer;
let dodgeCaught = false;
let dodgePlayerX = 50;
let dodgePlayerY = 50;
let dodgeStartedAt = 0;
let dodgeEscaped = false;
function addDodgeGhost() {
  const ghost = document.createElement('i');
  ghost.className = 'dodge-ghost';
  ghost.dataset.x = `${10 + Math.random() * 80}`;
  ghost.dataset.y = `${10 + Math.random() * 80}`;
  ghost.style.left = `${ghost.dataset.x}%`;
  ghost.style.top = `${ghost.dataset.y}%`;
  dodgeGhosts.appendChild(ghost);
}
function setupDodge() {
  clearTimeout(dodgeTimer);
  clearTimeout(dodgeResetTimer);
  clearInterval(dodgeMoveTimer);
  clearInterval(dodgeSpawnTimer);
  clearInterval(dodgeCountdownTimer);
  dodgeCaught = false;
  dodgeEscaped = false;
  dodgePlayerX = 50;
  dodgePlayerY = 50;
  dodgeStartedAt = Date.now();
  dodgePlayer.style.left = '50%';
  dodgePlayer.style.top = '50%';
  dodgeTimerDisplay.textContent = '30';
  dodgeTimerDisplay.classList.remove('urgent');
  dodgeDoor.classList.remove('visible');
  dodgeGhosts.innerHTML = '';
  addDodgeGhost();
  addDodgeGhost();
  dodgeMoveTimer = window.setInterval(() => {
    const elapsed = (Date.now() - dodgeStartedAt) / 1000;
    const speed = .34 + Math.min(elapsed * .012, .65);
    dodgeGhosts.querySelectorAll('.dodge-ghost').forEach((ghost) => {
      let x = Number(ghost.dataset.x);
      let y = Number(ghost.dataset.y);
      const distance = Math.hypot(dodgePlayerX - x, dodgePlayerY - y) || 1;
      x += ((dodgePlayerX - x) / distance) * speed;
      y += ((dodgePlayerY - y) / distance) * speed;
      ghost.dataset.x = `${x}`;
      ghost.dataset.y = `${y}`;
      ghost.style.left = `${x}%`;
      ghost.style.top = `${y}%`;
      if (distance < 4.2) catchDodgePlayer();
    });
  }, 50);
  dodgeCountdownTimer = window.setInterval(() => {
    const remaining = Math.max(0, Math.ceil(30 - (Date.now() - dodgeStartedAt) / 1000));
    dodgeTimerDisplay.textContent = String(remaining).padStart(2, '0');
    dodgeTimerDisplay.classList.toggle('urgent', remaining <= 10);
  }, 250);
  dodgeSpawnTimer = window.setInterval(addDodgeGhost, 4000);
  dodgeTimer = window.setTimeout(finishDodge, 30000);
}
function finishDodge() {
  if (dodgeCaught || dodgeEscaped) return;
  clearInterval(dodgeCountdownTimer);
  dodgeTimerDisplay.textContent = '00';
  dodgeEscaped = true;
  dodgeDoor.classList.add('visible');
}
function catchDodgePlayer() {
  if (dodgeCaught) return;
  dodgeCaught = true;
  clearTimeout(dodgeTimer);
  clearInterval(dodgeMoveTimer);
  clearInterval(dodgeSpawnTimer);
  clearInterval(dodgeCountdownTimer);
  dodgeTimerDisplay.textContent = '!!';
  showJumpscare(true);
  dodgeResetTimer = window.setTimeout(setupDodge, 1000);
}
dodgeGame.addEventListener('pointermove', (event) => {
  if (dodgeCaught) return;
  const bounds = dodgeGame.getBoundingClientRect();
  dodgePlayerX = Math.max(5, Math.min(95, ((event.clientX - bounds.left) / bounds.width) * 100));
  dodgePlayerY = Math.max(8, Math.min(92, ((event.clientY - bounds.top) / bounds.height) * 100));
  dodgePlayer.style.left = `${dodgePlayerX}%`;
  dodgePlayer.style.top = `${dodgePlayerY}%`;
  if (dodgeEscaped && Math.hypot(dodgePlayerX - 86, dodgePlayerY - 50) < 10) {
    dodgeEscaped = false;
    clearTimeout(dodgeTimer);
    clearInterval(dodgeMoveTimer);
    clearInterval(dodgeSpawnTimer);
    clearInterval(dodgeCountdownTimer);
    dodgeDoor.classList.remove('visible');
    complete(2);
  }
});

const signalLights = document.querySelectorAll('#signalLights button');
const signalMessage = document.querySelector('#signalMessage');
const listen = document.querySelector('#listen');
let signalSequence = [];
let signalInput = [];
let signalPlaying = false;
function flashSignal(index) {
  signalLights[index].classList.add('lit');
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (AudioContextClass) {
    const audio = new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = [118, 174, 232, 311][index];
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.08, audio.currentTime + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .32);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + .34);
  }
  window.setTimeout(() => signalLights[index].classList.remove('lit'), 360);
}
function playSignal() {
  if (signalPlaying) return;
  signalPlaying = true;
  signalInput = [];
  listen.textContent = 'playing sequence...';
  listen.disabled = true;
  signalLights.forEach((light) => { light.disabled = true; });
  signalMessage.textContent = 'listen carefully...';
  signalSequence.push(Math.floor(Math.random() * 4));
  signalSequence.forEach((tone, index) => window.setTimeout(() => {
    flashSignal(tone);
    if (index === signalSequence.length - 1) window.setTimeout(() => {
      signalPlaying = false;
      listen.disabled = false;
      listen.textContent = 'listen again';
      signalLights.forEach((light) => { light.disabled = false; });
      signalMessage.textContent = 'your turn: repeat the lights';
    }, 450);
  }, index * 600));
}
listen.addEventListener('click', playSignal);
signalLights.forEach((light) => light.addEventListener('click', () => {
  if (signalPlaying || !signalSequence.length) return;
  const tone = Number(light.dataset.tone);
  flashSignal(tone);
  signalInput.push(tone);
  if (signalInput[signalInput.length - 1] !== signalSequence[signalInput.length - 1]) {
    scare(signalMessage); signalMessage.textContent = mistakeCount > 2 ? 'she heard you.' : 'that was not the sound'; signalSequence = []; return;
  }
  if (signalInput.length === signalSequence.length) {
    if (signalSequence.length === 5) { signalMessage.textContent = ''; complete(3); return; }
    signalMessage.textContent = 'correct. listen to the longer sequence'; window.setTimeout(playSignal, 650);
  }
}));

const eyeGame = document.querySelector('#eyeGame');
const movingEye = document.querySelector('#movingEye');
const eyeMessage = document.querySelector('#eyeMessage');
const eyeScore = document.querySelector('#eyeScore');
let eyeHits = 0;
let eyeSpeed = 280;
function moveEye() {
  movingEye.style.left = `${8 + Math.random() * 84}%`;
  movingEye.style.top = `${12 + Math.random() * 70}%`;
}
movingEye.addEventListener('click', () => {
  eyeHits += 1;
  eyeSpeed = Math.max(90, eyeSpeed - 35);
  movingEye.style.setProperty('--eye-speed', `${eyeSpeed}ms`);
  eyeScore.textContent = `${eyeHits} / 10`;
  eyeGame.classList.add('eye-hit');
  window.setTimeout(() => eyeGame.classList.remove('eye-hit'), 180);
  moveEye();
  if (eyeHits === 10) { complete(4); }
});
moveEye();

function autoReset(name, callback) {
  const button = document.querySelector(`[data-reset="${name}"]`);
  button.addEventListener('click', callback);
}
