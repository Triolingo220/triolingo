// --- Variablen ---
let username = '', language = '', method = '', points = 0;
let firstCard = null, secondCard = null, lockBoard = false;
let matchedPairs = 0, totalPairs = 0;

// Benutzer-Daten (Username & Punkte)
let userData = JSON.parse(localStorage.getItem('triolingoUsers') || '{}');

// Ränge
const rankThresholds = [
  {name:'Anfänger', points:0},
  {name:'Fortgeschritten', points:100},
  {name:'Experte', points:250},
  {name:'Meister', points:500}
];

// --- Hilfsfunktionen ---
function hideAllScreens() {
  ['usernameScreen','languageScreen','methodScreen','gameScreen','leaderboardScreen','profileScreen'].forEach(id=>{
    document.getElementById(id).style.display='none';
  });
}

function showUsernameScreen(){ hideAllScreens(); document.getElementById('usernameScreen').style.display='block'; }
function showLanguageScreen(){ hideAllScreens(); document.getElementById('languageScreen').style.display='block'; }
function goToMethods(){ hideAllScreens(); document.getElementById('methodScreen').style.display='block'; }
function showProfile(){
  hideAllScreens(); 
  document.getElementById('profileScreen').style.display='block';
  document.getElementById('profileUsername').innerText = username;
  document.getElementById('profilePoints').innerText = points;
  document.getElementById('profileRank').innerText = getRank();
}
function showLeaderboard(){
  hideAllScreens(); 
  document.getElementById('leaderboardScreen').style.display='block';
  let leaderboard = JSON.parse(localStorage.getItem('triolingoLeaderboard')||'[]');
  // Punkte speichern
  let existing = leaderboard.find(p => p.username === username);
  if(existing) existing.points = points;
  else leaderboard.push({username,points});
  leaderboard.sort((a,b)=>b.points-a.points);
  if(leaderboard.length>10) leaderboard = leaderboard.slice(0,10);
  localStorage.setItem('triolingoLeaderboard', JSON.stringify(leaderboard));
  const list = document.getElementById('leaderboardList'); list.innerHTML='';
  leaderboard.forEach((player,i)=>{
    const li = document.createElement('li');
    li.innerText = `${player.username}: ${player.points} Punkte`;
    if(i===0) li.style.color='gold';
    else if(i===1) li.style.color='silver';
    else if(i===2) li.style.color='#cd7f32';
    list.appendChild(li);
  });
}

// --- Punkte & Ränge ---
function updatePoints(amount){
  points += amount;
  userData[username].points = points;
  localStorage.setItem('triolingoUsers', JSON.stringify(userData));
  document.getElementById('pointsDisplay').innerText = `Punkte: ${points}`;
  document.getElementById('rankDisplay').innerText = `Rang: ${getRank()}`;
}

function getRank(){
  let currentRank = rankThresholds[0].name;
  for(let i=0;i<rankThresholds.length;i++){
    if(points >= rankThresholds[i].points) currentRank = rankThresholds[i].name;
  }
  return currentRank;
}

// --- Username ---
function setUsername(){
  const input = document.getElementById('usernameInput').value.trim();
  if(!input) return alert('Bitte Benutzernamen eingeben');
  if(!userData[input]) userData[input] = {points:0};
  username = input;
  points = userData[username].points;
  localStorage.setItem('triolingoUsers', JSON.stringify(userData));
  showLanguageScreen();
  updatePoints(0);
}

// --- Sprache & Methode ---
function selectLanguage(lang){ language=lang; goToMethods(); }

function startGame(selectedMethod){
  method=selectedMethod;
  hideAllScreens();
  document.getElementById('gameScreen').style.display='block';
  document.getElementById('methodTitle').innerText = method==='memory'?'Memory-Spiel':method==='flashcards'?'Karteikarten':'Wörter lernen';
  if(method==='memory') setupMemory();
  else if(method==='flashcards') setupFlashcards();
  else setupNormalLearning();
}

// --- Memory ---
function setupMemory(){
  const board = document.getElementById('gameBoard'); 
  board.innerHTML=''; matchedPairs=0;
  let selectedWords = [...words[language]].sort(()=>0.5-Math.random()).slice(0,20);
  totalPairs = selectedWords.length;
  let cards=[]; 
  selectedWords.forEach(pair=>{ cards.push(pair[0]); cards.push(pair[1]); });
  cards.sort(()=>0.5-Math.random());
  cards.forEach(word=>{
    const card = document.createElement('div'); 
    card.classList.add('card'); 
    card.dataset.word = word; 
    card.innerText='?'; 
    card.onclick = flipCard;
    board.appendChild(card);
  });
}

function flipCard(){
  if(lockBoard || this===firstCard) return;
  this.classList.add('flipped'); 
  this.innerText=this.dataset.word;
  if(!firstCard){ firstCard=this; return; }
  secondCard=this;
  checkMatch();
}

function checkMatch(){
  let isMatch = false;
  words[language].forEach(pair=>{
    if((pair[0]===firstCard.dataset.word && pair[1]===secondCard.dataset.word) ||
       (pair[1]===firstCard.dataset.word && pair[0]===secondCard.dataset.word)) isMatch=true;
  });
  if(isMatch){
    matchedPairs++;
    firstCard.removeEventListener('click',flipCard);
    secondCard.removeEventListener('click',flipCard);
    updatePoints(100);
    setTimeout(()=>setupMemory(),500);
  } else{
    lockBoard=true;
    setTimeout(()=>{
      firstCard.classList.remove('flipped'); 
      secondCard.classList.remove('flipped'); 
      firstCard.innerText='?';
      secondCard.innerText='?';
      resetMemory();
    },800);
  }
}

function resetMemory(){ [firstCard,secondCard]=[null,null]; lockBoard=false; }

// --- Flashcards ---
function setupFlashcards(){
  const board = document.getElementById('gameBoard'); board.innerHTML='';
  const pair = words[language][Math.floor(Math.random()*words[language].length)];
  const card = document.createElement('div'); card.classList.add('flashcard'); card.innerText=pair[0];
  card.onclick = ()=>{ card.innerText=pair[1]; };
  board.appendChild(card);
  const nextBtn = document.createElement('button'); nextBtn.innerText='Richtig';
  nextBtn.onclick = ()=>{ updatePoints(10); setupFlashcards(); };
  board.appendChild(nextBtn);
}

// --- Normal Learning ---
function setupNormalLearning(){
  const pair = words[language][Math.floor(Math.random()*words[language].length)];
  const board = document.getElementById('gameBoard'); board.innerHTML='';
  const wordDiv = document.createElement('div'); wordDiv.innerText=pair[0]; wordDiv.style.fontSize='24px';
  board.appendChild(wordDiv);
  let options=[pair[1]];
  while(options.length<4){
    let rand = words[language][Math.floor(Math.random()*words[language].length)][1];
    if(!options.includes(rand)) options.push(rand);
  }
  options.sort(()=>0.5-Math.random());
  options.forEach(opt=>{
    const btn=document.createElement('button'); btn.innerText=opt;
    btn.onclick = ()=>{
      if(opt===pair[1]){
        btn.style.background='green';
        updatePoints(15);
      } else btn.style.background='red';
      setTimeout(setupNormalLearning,500);
    };
    board.appendChild(btn);
  });
}

// --- Logout ---
function logout(){
  username=''; points=0;
  showUsernameScreen();
}

// --- Start ---
showUsernameScreen();
