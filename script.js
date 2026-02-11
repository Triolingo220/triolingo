let currentUser = null;
let language = '', method = '', points = 0;
let firstCard = null, secondCard = null, lockBoard = false, matchedPairs = 0, totalPairs = 0;

// Nutzerverwaltung
function getUsers(){ return JSON.parse(localStorage.getItem('triolingoUsers')||'{}'); }
function saveUsers(u){ localStorage.setItem('triolingoUsers', JSON.stringify(u)); }

function registerUser(){
  const u=document.getElementById('loginUsername').value.trim();
  const p=document.getElementById('loginPassword').value;
  if(!u||!p){ alert('Bitte Benutzername & Passwort eingeben'); return; }
  let users=getUsers();
  if(users[u]){ alert('Benutzername existiert schon'); return; }
  users[u]={password:p,points:0};
  saveUsers(users);
  alert('Registrierung erfolgreich! Bitte anmelden.');
}

function loginUser(){
  const u=document.getElementById('loginUsername').value.trim();
  const p=document.getElementById('loginPassword').value;
  let users=getUsers();
  if(users[u] && users[u].password===p){ currentUser=u; points=users[u].points; showMainUI(); }
  else { alert('Benutzername oder Passwort falsch'); }
}

function logoutUser(){ currentUser=null; points=0; document.getElementById('navBar').style.display='none'; document.getElementById('pointsRank').style.display='none'; showScreen('loginScreen'); }
function togglePassword(id){ const input=document.getElementById(id); input.type=input.type==='password'?'text':'password'; }
function showScreen(id){ document.querySelectorAll('.screen').forEach(s=>s.style.display='none'); document.getElementById(id).style.display='block'; }

function showMainUI(){ document.getElementById('navBar').style.display='flex'; document.getElementById('pointsRank').style.display='block'; updatePointsAndRank(); showScreen('languageScreen'); }
function showLanguageScreen(){ showScreen('languageScreen'); }
function showMethodScreen(){ showScreen('methodScreen'); }

function showLeaderboard(){ 
  showScreen('leaderboardScreen'); 
  const list=document.getElementById('leaderboardList'); list.innerHTML='';
  const users=getUsers();
  const arr=Object.keys(users).map(k=>({username:k,points:users[k].points}));
  arr.sort((a,b)=>b.points-a.points);
  arr.slice(0,10).forEach((p,i)=>{ const li=document.createElement('li'); li.innerText=`${p.username}: ${p.points} Punkte`; if(i===0) li.style.color='gold'; else if(i===1) li.style.color='silver'; else if(i===2) li.style.color='peru'; list.appendChild(li); });
}

function showProfile(){ showScreen('profileScreen'); document.getElementById('profileUsername').innerText=currentUser; const users=getUsers(); document.getElementById('profilePassword').value=users[currentUser].password; document.getElementById('profilePointsRank').innerText=`Punkte: ${points} | Rang: ${getRank(points)}`; }
function getRank(p){ if(p>=500) return 'Meister'; else if(p>=250) return 'Experte'; else if(p>=100) return 'Fortgeschritten'; else return 'Anfänger'; }
function updatePointsAndRank(){ document.getElementById('pointsRank').innerText=`Punkte: ${points} | Rang: ${getRank(points)}`; if(currentUser){ let users=getUsers(); users[currentUser].points=points; saveUsers(users); } }

function selectLanguage(lang){ language=lang; showMethodScreen(); }
function startGame(m){ method=m; showScreen('gameScreen'); document.getElementById('methodTitle').innerText = method==='memory'?'Memory-Spiel':method==='flashcards'?'Karteikarten':'Wörter lernen'; setupGame(); }
function setupGame(){ if(method==='memory'){ setupMemory(); } else if(method==='flashcards'){ setupFlashcards(); } else{ setupNormalLearning(); } }

// --- Memory ---
function setupMemory(){
  const board=document.getElementById('gameBoard');
  board.innerHTML='';
  const allWords=[...words[language]].slice(0,8);
  let cards=[];
  allWords.forEach(w=>{ cards.push({front:w[0], back:w[1]}); cards.push({front:w[0], back:w[1]}); });
  cards.sort(()=>Math.random()-0.5);
  cards.forEach(c=>{
    const card=document.createElement('div');
    card.className='card';
    card.innerText=c.front;
    card.dataset.back=c.back;
    card.addEventListener('click',()=>flipCard(card));
    board.appendChild(card);
  });
  firstCard=null; secondCard=null; lockBoard=false; matchedPairs=0; totalPairs=allWords.length;
}

function flipCard(card){
  if(lockBoard || card===firstCard) return;
  card.classList.add('flipped'); card.innerText=card.dataset.back;
  if(!firstCard){ firstCard=card; return; }
  secondCard=card; checkMatch();
}

function checkMatch(){
  if(firstCard.dataset.back===secondCard.dataset.back){ points+=10; firstCard.classList.add('correct'); secondCard.classList.add('correct'); resetCards(); matchedPairs++; if(matchedPairs===totalPairs) alert('Glückwunsch! Du hast alle Paare gefunden!'); }
  else{ firstCard.classList.add('wrong'); secondCard.classList.add('wrong'); lockBoard=true; setTimeout(()=>{ firstCard.classList.remove('flipped','wrong'); firstCard.innerText=firstCard.dataset.front; secondCard.classList.remove('flipped','wrong'); secondCard.innerText=secondCard.dataset.front; resetCards(); },1000);}
  updatePointsAndRank();
}

function resetCards(){ [firstCard,secondCard]=[null,null]; lockBoard=false; }

// --- Flashcards ---
function setupFlashcards(){
  const board=document.getElementById('gameBoard');
  board.innerHTML='';
  words[language].slice(0,12).forEach(w=>{
    const card=document.createElement('div');
    card.className='flashcard';
    card.innerText=w[0];
    card.addEventListener('click',()=>alert(`Übersetzung: ${w[1]}`));
    board.appendChild(card);
  });
}

// --- Normal Learning ---
function setupNormalLearning(){
  const board=document.getElementById('gameBoard');
  board.innerHTML='';
  words[language].slice(0,12).forEach(w=>{
    const btn=document.createElement('button');
    btn.innerText=w[0];
    btn.addEventListener('click',()=>alert(`Übersetzung: ${w[1]}`));
    board.appendChild(btn);
  });
}

showScreen('loginScreen');
