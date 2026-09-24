const conversation = document.querySelector('#conversation');
const dialogue = document.querySelector('#dialogue');
const choices = document.querySelector('#choices');
const touchPrompt = document.querySelector('#touchPrompt');
const redEyes = document.querySelector('.red-eyes');


const eyeElements = redEyes.querySelectorAll('i');
const lines = [
  'Hello....',
  'So you came to help me?',
  'I need you to complete this 4 games for me because I\'M JUST A LITTLE KITTY'
];


let lineIndex = 0;
let isTyping = false;
let hasStarted = false;

function typeLine(text, done) {
  isTyping = true;
  touchPrompt.classList.remove('visible');
  choices.innerHTML = '';
  dialogue.textContent = '';
  let characterIndex = 0;
  const type = () => {
    dialogue.textContent = text.slice(0, characterIndex);
    characterIndex += 1;
    if (characterIndex <= text.length) {
      window.setTimeout(type, text === lines[2] ? 42 : 75);
    } else {
      isTyping = false;
      touchPrompt.classList.add('visible');
      if (done) done();
    }
  };
  type();
}


function showChoices(items) {
  touchPrompt.classList.remove('visible');
  items.forEach(({ label, reply }) => {
    const button = document.createElement('button');
    button.className = 'choice-button';
    button.textContent = label;
    button.addEventListener('click', () => {
      if (lineIndex === 1) {
        lineIndex = 2;
        typeLine(lines[2], showFinalChoices);
      } else {
        if (label === 'Ok????') enterGames();
        else if (label.includes('Why?')) typeLine('Me neither trust me the last time I played I scored -1.', enterGames);
        else typeLine('Right now! GO FAST', enterGames);
      }
    });
    choices.appendChild(button);
  });
}

function showFinalChoices() {
  dialogue.textContent = lines[2];
  document.body.classList.add('flicker');
  window.setTimeout(() => document.body.classList.remove('flicker'), 1200);
  showChoices([
    { label: 'Ok????' },
    
    { label: 'Why? Im not doing that, Im not good at this', reply: 'Me neither trust me the last time I played I scored -1.' },
    { label: 'When do I start?', reply: 'Right now! GO FAST' }
  ]);
}

function startConversation() {
  if (isTyping) return;
  if (!hasStarted) {
    hasStarted = true;
    typeLine(lines[0]);
    return;
  }
  if (lineIndex === 0) {
    lineIndex = 1;
    typeLine(lines[1], () => showChoices([
      { label: 'No? What do u want?' },
      { label: 'Yes, where can I help' }
    ]));
  }
}

conversation.addEventListener('click', (event) => {
  if (event.target.closest('button')) return;
  
  startConversation();
});

function enterGames() {
  document.body.classList.add('flicker');
  window.setTimeout(() => {
    sessionStorage.setItem('zoneout-access', 'granted');
    window.location.replace('./games.html');
  }, 850);
}

window.setTimeout(startConversation, 400);
document.addEventListener('mousemove', (event) => {
  const x = ((event.clientX / window.innerWidth) - .5) * 9;
  const y = ((event.clientY / window.innerHeight) - .5) * 5;
  eyeElements.forEach((eye) => {
    eye.style.transform = `translate(${x}px, ${y}px)`;
  });
});

const fullscreenBtn = document.querySelector('#fullscreenBtn');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });
}
