// --- Memory ---
function setupMemory() {
  const board = document.getElementById('gameBoard');
  board.innerHTML = '';
  firstCard = null; secondCard = null; lockBoard = false; matchedPairs = 0;

  const selectedWords = [...words[language]].sort(()=>0.5-Math.random()).slice(0,20);
  totalPairs = selectedWords.length;

  let cards = [];
  selectedWords.forEach(pair => { cards.push(pair[0]); cards.push(pair[1]); });
  cards.sort(()=>0.5-Math.random());

  cards.forEach(word => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.word = word;
    card.innerText = '?';
    card.onclick = flipCard;
    board.appendChild(card);
  });
}

function flipCard() {
  if(lockBoard || this===firstCard) return;
  this.classList.add('flipped');
  this.innerText = this.dataset.word;

  if(!firstCard){ firstCard=this; return; }
  secondCard=this; checkMemoryMatch();
}

function checkMemoryMatch() {
  let isMatch = false;
  words[language].forEach(pair => {
    if((pair[0]===firstCard.dataset.word && pair[1]===secondCard.dataset.word) ||
       (pair[1]===firstCard.dataset.word && pair[0]===secondCard.dataset.word)) isMatch = true;
  });

  if(isMatch){
    firstCard.classList.add('correct'); 
    secondCard.classList.add('correct');
    matchedPairs++;
    updatePoints(100);
    resetMemory();
    if(matchedPairs === totalPairs) setupMemory(); // neue Runde
  } else {
    firstCard.classList.add('wrong');
    secondCard.classList.add('wrong');
    lockBoard = true;
    setTimeout(()=>{
      firstCard.classList.remove('flipped','wrong'); 
      secondCard.classList.remove('flipped','wrong'); 
      firstCard.innerText='?';
      secondCard.innerText='?';
      resetMemory();
    },800);
  }
}

function resetMemory(){ firstCard=null; secondCard=null; lockBoard=false; }

// --- Flashcards ---
function setupFlashcards() {
  const board = document.getElementById('gameBoard'); 
  board.innerHTML='';
  const pair = words[language][Math.floor(Math.random()*words[language].length)];
  const card = document.createElement('div');
  card.classList.add('flashcard');
  card.innerText = pair[0];
  card.onclick = ()=>{ card.innerText = pair[1]; };
  board.appendChild(card);

  const nextBtn = document.createElement('button');
  nextBtn.innerText = 'Nächstes Wort';
  nextBtn.onclick = ()=>{ updatePoints(10); setupFlashcards(); };
  board.appendChild(nextBtn);
}

// --- Normal Learning (4 Antwortmöglichkeiten) ---
function setupNormalLearning() {
  const board = document.getElementById('gameBoard'); 
  board.innerHTML='';

  const pair = words[language][Math.floor(Math.random()*words[language].length)];

  const wordDiv = document.createElement('div'); 
  wordDiv.innerText = pair[0]; 
  wordDiv.style.fontSize='24px';
  board.appendChild(wordDiv);

  let options = [pair[1]];
  while(options.length<4){
    let rand = words[language][Math.floor(Math.random()*words[language].length)][1];
    if(!options.includes(rand)) options.push(rand);
  }
  options.sort(()=>0.5-Math.random());

  options.forEach(opt => {
    const btn = document.createElement('button'); 
    btn.innerText = opt;
    btn.onclick = ()=>{
      if(opt === pair[1]){
        btn.classList.add('correct');
        updatePoints(15);
      } else btn.classList.add('wrong');
      setTimeout(setupNormalLearning,500);
    };
    board.appendChild(btn);
  });
}

// Punkte aktualisieren
function updatePoints(amount){
  points += amount;
  updatePointsAndRank();
}
