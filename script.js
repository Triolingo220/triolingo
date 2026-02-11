let currentUser = null;
let language = '', method = '', points = 0;

// Nutzerverwaltung
function getUsers() { return JSON.parse(localStorage.getItem('triolingoUsers') || '{}'); }
function saveUsers(u) { localStorage.setItem('triolingoUsers', JSON.stringify(u)); }

function registerUser() {
  const u = document.getElementById('loginUsername').value.trim();
  const p = document.getElementById('loginPassword').value;
  if (!u || !p) { alert('Bitte Benutzername & Passwort eingeben'); return; }
  let users = getUsers();
  if (users[u]) { alert('Benutzername existiert schon'); return; }
  users[u] = { password: p, points: 0 };
  saveUsers(users);
  alert('Registrierung erfolgreich! Bitte anmelden.');
}

function loginUser() {
  const u = document.getElementById('loginUsername').value.trim();
  const p = document.getElementById('loginPassword').value;
  let users = getUsers();
  if (users[u] && users[u].password === p) { currentUser = u; points = users[u].points; showMainUI(); }
  else { alert('Benutzername oder Passwort falsch'); }
}

function logoutUser() {
  currentUser = null;
  points = 0;
  document.getElementById('navBar').style.display = 'none';
  document.getElementById('pointsRank').style.display = 'none';
  showScreen('loginScreen');
}

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

function showMainUI() {
  document.getElementById('navBar').style.display = 'flex';
  document.getElementById('pointsRank').style.display = 'block';
  updatePointsAndRank();
  showScreen('languageScreen');
}

function showLanguageScreen() { showScreen('languageScreen'); }
function showMethodScreen() { showScreen('methodScreen'); }

function showLeaderboard() {
  showScreen('leaderboardScreen');
  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';
  const users = getUsers();
  const arr = Object.keys(users).map(k => ({ username: k, points: users[k].points }));
  arr.sort((a, b) => b.points - a.points);
  arr.slice(0, 10).forEach((p, i) => {
    const li = document.createElement('li');
    li.innerText = `${p.username}: ${p.points} Punkte`;
    if (i === 0) li.style.color = 'gold';
    else if (i === 1) li.style.color = 'silver';
    else if (i === 2) li.style.color = 'peru';
    list.appendChild(li);
  });
}

function showProfile() {
  showScreen('profileScreen');
  document.getElementById('profileUsername').innerText = currentUser;
  const users = getUsers();
  document.getElementById('profilePassword').value = users[currentUser].password;
  document.getElementById('profilePointsRank').innerText = `Punkte: ${points} | Rang: ${getRank(points)}`;
}

function getRank(p) {
  if (p >= 500) return 'Meister';
  else if (p >= 250) return 'Experte';
  else if (p >= 100) return 'Fortgeschritten';
  else return 'Anfänger';
}

function updatePointsAndRank() {
  document.getElementById('pointsRank').innerText = `Punkte: ${points} | Rang: ${getRank(points)}`;
  if (currentUser) {
    let users = getUsers();
    users[currentUser].points = points;
    saveUsers(users);
  }
}

function selectLanguage(lang) { language = lang; showMethodScreen(); }

function startGame(m) {
  method = m;
  showScreen('gameScreen');
  document.getElementById('methodTitle').innerText =
    method === 'memory' ? 'Memory-Spiel' :
    method === 'flashcards' ? 'Karteikarten' : 'Wörter lernen';
  setupGame();
}

function setupGame() {
  const board = document.getElementById('gameBoard');
  board.innerHTML = '';
  const wordList = words[language].slice(0, 12); // 12 Wörter
  wordList.forEach(w => {
    const btn = document.createElement('button');
    btn.innerText = w[0];
    btn.onclick = () => checkWord(btn, w[1]);
    board.appendChild(btn);
  });
}

function checkWord(btn, correctAnswer) {
  const userAnswer = prompt(`Übersetzung für "${btn.innerText}" eingeben:`).trim().toLowerCase();
  if (userAnswer === correctAnswer.toLowerCase()) {
    btn.style.backgroundColor = 'green';
    points += 10;
  } else {
    btn.style.backgroundColor = 'red';
  }
  updatePointsAndRank();
}

showScreen('loginScreen');
