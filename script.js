// =======================
// GLOBAL STATE
// =======================

let currentUser = null;
let currentLanguage = null;
let currentMethod = null;

let currentIndex = 0;
let wrongWords = [];
let memoryLevel = 1;

const RANKS = [
  { name: "Anfänger", min: 0 },
  { name: "Fortgeschritten", min: 200 },
  { name: "Meister", min: 600 }
];

// =======================
// USER SYSTEM
// =======================

function register() {
  const username = document.getElementById("regUser").value;
  const password = document.getElementById("regPass").value;

  if (!username || !password) return alert("Bitte alles ausfüllen");

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (users[username]) {
    return alert("Benutzername existiert bereits!");
  }

  users[username] = {
    password: password,
    points: 0,
    memoryLevel: 1,
    wrongWords: []
  };

  localStorage.setItem("users", JSON.stringify(users));
  alert("Registrierung erfolgreich!");
}

function login() {
  const username = document.getElementById("logUser").value;
  const password = document.getElementById("logPass").value;

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (!users[username] || users[username].password !== password) {
    return alert("Falsche Login-Daten");
  }

  currentUser = username;
  memoryLevel = users[username].memoryLevel;
  wrongWords = users[username].wrongWords || [];

  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("mainApp").style.display = "block";

  updateProfile();
}

function logout() {
  currentUser = null;
  location.reload();
}

// =======================
// PROFILE / RANK SYSTEM
// =======================

function getUserData() {
  let users = JSON.parse(localStorage.getItem("users"));
  return users[currentUser];
}

function saveUserData(data) {
  let users = JSON.parse(localStorage.getItem("users"));
  users[currentUser] = data;
  localStorage.setItem("users", JSON.stringify(users));
}

function getRank(points) {
  let rank = RANKS[0];

  for (let r of RANKS) {
    if (points >= r.min) rank = r;
  }

  return rank;
}

function updateProfile() {
  const data = getUserData();
  const rank = getRank(data.points);

  let nextRank = RANKS.find(r => r.min > data.points);
  let needed = nextRank ? nextRank.min - data.points : 0;

  document.getElementById("profileName").innerText = currentUser;
  document.getElementById("profilePoints").innerText = data.points + " Punkte";
  document.getElementById("profileRank").innerText =
    rank.name + (nextRank ? " | Noch " + needed + " Punkte bis " + nextRank.name : " | Max Rang erreicht");
}

// =======================
// LANGUAGE
// =======================

function selectLanguage(lang) {
  currentLanguage = lang;
  document.getElementById("methodScreen").style.display = "block";
}

// =======================
// NORMAL LEARNING
// =======================

function startLearning() {
  currentMethod = "learn";
  currentIndex = 0;
  showWord();
}

function showWord() {
  const word = words[currentLanguage][currentIndex];
  document.getElementById("question").innerText = word[0];
  document.getElementById("answerInput").value = "";
  document.getElementById("result").innerText = "";
}

function checkAnswer() {
  const userAnswer = document.getElementById("answerInput").value;
  const correct = words[currentLanguage][currentIndex][1];

  if (userAnswer.toLowerCase() === correct.toLowerCase()) {
    document.getElementById("result").innerText = "Richtig!";
    addPoints(10);
  } else {
    document.getElementById("result").innerText =
      "Falsch! Richtige Antwort: " + correct;

    wrongWords.push(words[currentLanguage][currentIndex]);
    saveWrongWords();
  }
}

function nextWord() {
  currentIndex++;
  if (currentIndex >= words[currentLanguage].length) {
    currentIndex = 0;
  }
  showWord();
}

function learnWrongWords() {
  if (wrongWords.length === 0) {
    return alert("Keine falschen Wörter vorhanden");
  }

  words[currentLanguage] = wrongWords;
  currentIndex = 0;
  showWord();
}

function saveWrongWords() {
  let data = getUserData();
  data.wrongWords = wrongWords;
  saveUserData(data);
}

// =======================
// MEMORY SYSTEM
// =======================

function startMemory(level) {
  if (level > memoryLevel) return;

  const start = (level - 1) * 5;
  const selected = words[currentLanguage].slice(start, start + 5);

  buildMemoryBoard(selected);
}

function buildMemoryBoard(selectedWords) {
  const board = document.getElementById("memoryBoard");
  board.innerHTML = "";

  let cards = [];

  selectedWords.forEach(pair => {
    cards.push({ text: pair[0], id: pair[0] });
    cards.push({ text: pair[1], id: pair[0] });
  });

  cards.sort(() => Math.random() - 0.5);

  let first = null;

  cards.forEach(card => {
    let btn = document.createElement("button");
    btn.className = "bigButton";
    btn.innerText = "?";

    btn.onclick = () => {
      btn.innerText = card.text;

      if (!first) {
        first = { btn, id: card.id };
      } else {
        if (first.id === card.id) {
          addPoints(20);
        } else {
          setTimeout(() => {
            btn.innerText = "?";
            first.btn.innerText = "?";
          }, 800);
        }
        first = null;
      }
    };

    board.appendChild(btn);
  });
}

// =======================
// POINTS
// =======================

function addPoints(amount) {
  let data = getUserData();
  data.points += amount;

  if (data.points >= memoryLevel * 50) {
    data.memoryLevel++;
    memoryLevel = data.memoryLevel;
  }

  saveUserData(data);
  updateProfile();
}

