// --- Memory ---
function setupMemory() {
  const board = document.getElementById('gameBoard');
  board.innerHTML = '';
  board.style.display = 'grid';
  board.style.gridTemplateColumns = 'repeat(4, 120px)';
  board.style.gap = '10px';
  const wordsArray = words[language].slice(0,8); // 8 Paare
  const cards = [...wordsArray, ...wordsArray];
  cards.sort(() => Math.random() - 0.5);
  totalPairs = wordsArray.length;
  matchedPairs = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  cards.forEach(w => {
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.word = w[0];
    div.dataset.translation = w[1];
    div.innerText = '?';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.cursor = 'pointer';
    div.addEventListener('click', () => {
      if(lockBoard || div.classList.contains('flipped')) return;
      div.innerText = div.dataset.word;
      div.classList.add('flipped');

      if(!firstCard) {
        firstCard = div;
        return;
      }

      secondCard = div;
      lockBoard = true;

      if(firstCard.dataset.translation === secondCard.dataset.translation){
        firstCard.classList.add('correct');
        secondCard.classList.add('correct');
        points += 10;
        updatePointsAndRank();
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
        matchedPairs++;
        if(matchedPairs === totalPairs) alert('Memory fertig!');
      } else {
        firstCard.classList.add('wrong');
        secondCard.classList.add('wrong');
        setTimeout(() => {
          firstCard.innerText = '?';
          secondCard.innerText = '?';
          firstCard.classList.remove('flipped','wrong');
          secondCard.classList.remove('flipped','wrong');
          points = Math.max(points-2,0);
          updatePointsAndRank();
          [firstCard, secondCard] = [null, null];
          lockBoard = false;
        }, 1000);
      }
    });
    board.appendChild(div);
  });
}

// --- Flashcards ---
function setupFlashcards() {
  const board = document.getElementById('gameBoard');
  board.innerHTML = '';
  board.style.display = 'grid';
  board.style.gridTemplateColumns = 'repeat(3, 200px)';
  board.style.gap = '10px';

  words[language].forEach(w => {
    const div = document.createElement('div');
    div.className = 'flashcard';
    div.innerText = `${w[0]} - ${w[1]}`;
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.height = '100px';
    div.style.fontSize = '16px';
    div.style.cursor = 'pointer';
    board.appendChild(div);
  });
}

// --- Normales Lernen ---
function setupNormalLearning() {
  const board = document.getElementById('gameBoard');
  board.innerHTML = '';
  board.style.display = 'grid';
  board.style.gridTemplateColumns = 'repeat(3, 200px)';
  board.style.gap = '10px';

  words[language].forEach(w => {
    const div = document.createElement('div');
    div.className = 'flashcard';
    div.innerText = w[0];
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.height = '100px';
    div.style.fontSize = '16px';
    div.style.cursor = 'pointer';
    div.addEventListener('click', ()=>alert(`Übersetzung: ${w[1]}`));
    board.appendChild(div);
  });
}
