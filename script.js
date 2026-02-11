let currentUser = null;
let language = '', method = '', points = 0;
let firstCard = null, secondCard = null, lockBoard = false, matchedPairs = 0, totalPairs = 0;

// --- Benutzerverwaltung ---
function getUsers() { return JSON.parse(localStorage.getItem('triolingoUsers') || '{}'); }
function saveUsers(users) { localStorage.setItem('triolingoUsers', JSON.stringify(users)); }

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
    if (users[u] && users[u].password === p) {
        currentUser = u;
        points = users[u].points;
        showMainUI();
    } else { alert('Benutzername oder Passwort falsch'); }
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

// --- Screen Navigation ---
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
    let arr = Object.keys(users).map(k => ({ username: k, points: users[k].points }));
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

// --- Punkte & Rang ---
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

// --- Sprache & Methode ---
function selectLanguage(lang) {
    language = lang;
    showMethodScreen();
}

function startGame(m) {
    method = m;
    showScreen('gameScreen');
    document.getElementById('methodTitle').innerText = method === 'memory' ? 'Memory-Spiel' :
        method === 'flashcards' ? 'Karteikarten' : 'Wörter lernen';
    setupGame();
}

function setupGame() {
    if (method === 'memory') setupMemory();
    else if (method === 'flashcards') setupFlashcards();
    else setupNormalLearning();
}

// --- Memory ---
function setupMemory() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    matchedPairs = 0;

    let selectedWords = [...words[language]].sort(() => 0.5 - Math.random()).slice(0, 8); // z.B. 8 Paare
    totalPairs = selectedWords.length;

    let cards = [];
    selectedWords.forEach(pair => { cards.push(pair[0]); cards.push(pair[1]); });
    cards.sort(() => 0.5 - Math.random());

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
    if (lockBoard || this === firstCard) return;
    this.classList.add('flipped');
    this.innerText = this.dataset.word;

    if (!firstCard) { firstCard = this; return; }
    secondCard = this;
    checkMatch();
}

function checkMatch() {
    let isMatch = false;
    words[language].forEach(pair => {
        if ((pair[0] === firstCard.dataset.word && pair[1] === secondCard.dataset.word) ||
            (pair[1] === firstCard.dataset.word && pair[0] === secondCard.dataset.word)) isMatch = true;
    });

    if (isMatch) {
        matchedPairs++;
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        firstCard.classList.add('correct');
        secondCard.classList.add('correct');
        resetMemory();
        if (matchedPairs === totalPairs) {
            points += 100;
            alert('Memory abgeschlossen! +100 Punkte');
            updatePointsAndRank();
            setupMemory();
        }
    } else {
        firstCard.classList.add('wrong');
        secondCard.classList.add('wrong');
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped', 'wrong');
            secondCard.classList.remove('flipped', 'wrong');
            firstCard.innerText = '?';
            secondCard.innerText = '?';
            resetMemory();
        }, 800);
    }
}

function resetMemory() { [firstCard, secondCard] = [null, null]; lockBoard = false; }

// --- Flashcards ---
function setupFlashcards() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    const pair = words[language][Math.floor(Math.random() * words[language].length)];
    const card = document.createElement('div');
    card.classList.add('flashcard');
    card.innerText = pair[0];
    card.onclick = () => { card.innerText = pair[1]; };
    board.appendChild(card);

    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Richtig';
    nextBtn.onclick = () => {
        points += 10;
        alert('Richtig! +10 Punkte');
        updatePointsAndRank();
        setupFlashcards();
    };
    board.appendChild(nextBtn);
}

// --- Normal Learning ---
function setupNormalLearning() {
    const pair = words[language][Math.floor(Math.random() * words[language].length)];
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';

    const wordDiv = document.createElement('div');
    wordDiv.innerText = pair[0];
    wordDiv.style.fontSize = '24px';
    board.appendChild(wordDiv);

    let options = [pair[1]];
    while (options.length < 4) {
        let randPair = words[language][Math.floor(Math.random() * words[language].length)];
        if (!options.includes(randPair[1])) options.push(randPair[1]);
    }
    options.sort(() => 0.5 - Math.random());

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => {
            if (opt === pair[1]) {
                points += 15;
                alert('Richtig! +15 Punkte');
                btn.classList.add('correct');
            } else {
                alert('Falsch! +0 Punkte');
                btn.classList.add('wrong');
            }
            updatePointsAndRank();
            setupNormalLearning();
        };
        board.appendChild(btn);
    });
}

// --- Start ---
showScreen('loginScreen');
