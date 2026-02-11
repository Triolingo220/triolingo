let currentUser = null;
let language='', method='', points=0;
let firstCard=null, secondCard=null, lockBoard=false, matchedPairs=0, totalPairs=0;

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

function logoutUser(){ 
  currentUser=null; points=0; 
  document.getElementById('navBar').style.display='none'; 
  document.getElementById('pointsRank').style.display='none'; 
  showScreen('loginScreen'); 
}

function togglePassword(id){ 
  const input=document.getElementById(id); 
  input.type=input.type==='password'?'text':'password'; 
}

function showScreen(id){ 
  document.querySelectorAll('.screen').forEach(s=>s.style.display='none'); 
  document.getElementById(id).style.display='block'; 
}

function showMainUI(){ 
  document.getElementById('navBar').style.display='flex'; 
  document.getElementById('pointsRank').style.display='block'; 
  updatePointsAndRank(); 
  showScreen('languageScreen'); 
}

function showLanguageScreen(){ showScreen('languageScreen'); }
function showMethodScreen(){ showScreen('methodScreen'); }

function showLeaderboard(){ 
  showScreen('leaderboardScreen'); 
  const list=document.getElementById('leaderboardList'); list.innerHTML='';
  const users=getUsers();
  const arr=Object.keys(users).map(k=>({username:k,points:users[k].points}));
  arr.sort((a,b)=>b.points-a.points);
  arr.slice(0,10).forEach((p,i)=>{ 
    const li=document.createElement('li'); 
    li.innerText=`${p.username}: ${p.points} Punkte`; 
    if(i===0) li.style.color='gold'; 
    else if(i===1) li.style.color='silver'; 
    else if(i===2) li.style.color='bronze'; 
    list.appendChild(li); 
  });
}

function showProfile(){
  showScreen('profileScreen');
  document.getElementById('profileUsername').innerText=currentUser;
  const users=getUsers();
  document.getElementById('profilePassword').value=users[currentUser].password;
  document.getElementById('profilePointsRank').innerText=`Punkte: ${points} | Rang: ${getRank(points)}`;
}

function getRank(p){ 
  if(p>=500) return 'Meister'; 
  else if(p>=250) return 'Experte'; 
  else if(p>=100) return 'Fortgeschritten'; 
  else return 'Anfänger'; 
}

function updatePointsAndRank(){
  document.getElementById('pointsRank').innerText=`Punkte: ${points} | Rang: ${getRank(points)}`;
  if(currentUser){ let users=getUsers(); users[currentUser].points=points; saveUsers(users); }
}

function selectLanguage(lang){ language=lang; showMethodScreen(); }

function startGame(m){ 
  method=m; 
  showScreen('gameScreen'); 
  document.getElementById('methodTitle').innerText = method==='memory'?'Memory-Spiel':method==='flashcards'?'Karteikarten':'Wörter lernen'; 
  setupGame(); 
}

function setupGame(){
  if(method==='memory'){ setupMemory(); }
  else if(method==='flashcards'){ setupFlashcards(); }
  else{ setupNormalLearning(); }
}

// --- Memory ---
function setupMemory(){
  const board=document.getElementById('gameBoard'); board.innerHTML='';
  const wordsArray=words[language].slice(0,8); // 8 Paare
  const cards=[...wordsArray,...wordsArray];
  cards.sort(()=>Math.random()-0.5);
  totalPairs=wordsArray.length; matchedPairs=0;
  cards.forEach((w,index)=>{
    const div=document.createElement('div');
    div.className='card';
    div.dataset.word=w[0]; 
    div.dataset.translation=w[1];
    div.addEventListener('click',flipCard);
    div.innerText='?';
    board.appendChild(div);
  });
}

function flipCard(){
  if(lockBoard || this===firstCard) return;
  this.innerText=this.dataset.word;
  this.classList.add('flipped');
  if(!firstCard){ firstCard=this; return; }
  secondCard=this; lockBoard=true;
  if(firstCard.dataset.translation===secondCard.dataset.translation){
    firstCard.classList.add('correct'); secondCard.classList.add('correct');
    resetBoard(true);
  } else { 
    firstCard.classList.add('wrong'); secondCard.classList.add('wrong');
    setTimeout(()=>resetBoard(false),1000);
  }
}

function resetBoard(match){
  if(match) points+=10;
  else points=Math.max(points-2,0);
  updatePointsAndRank();
  [firstCard,secondCard]=[null,null]; lockBoard=false;
  matchedPairs++;
  if(matchedPairs===totalPairs) alert('Memory fertig!');
}

// --- Flashcards ---
function setupFlashcards(){
  const board=document.getElementById('gameBoard'); board.innerHTML='';
  words[language].forEach(w=>{
    const div=document.createElement('div');
    div.className='flashcard';
    div.innerText=`${w[0]} - ${w[1]}`;
    board.appendChild(div);
  });
}

// --- Normales Lernen ---
function setupNormalLearning(){
  const board=document.getElementById('gameBoard'); board.innerHTML='';
  words[language].forEach(w=>{
    const div=document.createElement('div');
    div.className='flashcard';
    div.innerText=w[0];
    div.addEventListener('click',()=>alert(`Übersetzung: ${w[1]}`));
    board.appendChild(div);
  });
}

showScreen('loginScreen');
