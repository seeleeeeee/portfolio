document.addEventListener('DOMContentLoaded', function() {
    const food = document.getElementById('food');
    const seal = document.getElementById('seal');
    const sealFunny = document.getElementById('seal-funny');
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const startButton = document.getElementById('startButton');
    const resetRecordsButton = document.getElementById('resetRecordsButton');
    const gameResult = document.getElementById('gameResult');
    const finalScoreElement = document.getElementById('finalScore');
    const newRecordMessage = document.getElementById('newRecordMessage');
    const recordsTable = document.getElementById('recordsTable');
    const gameOverlay = document.querySelector('.game-overlay');

    let score = 0;
    let timeLeft = 30;
    let timer;
    let gameActive = false;

    function getSealZone() {
        const sealRect = document.querySelector('.seal-container').getBoundingClientRect();
        const gameAreaRect = document.querySelector('.game-area').getBoundingClientRect();
        const padding = 60;

        return {
            x: sealRect.left - gameAreaRect.left - padding,
            y: sealRect.top - gameAreaRect.top - padding,
            width: sealRect.width + padding * 2,
            height: sealRect.height + padding * 2
        };
    }

    function isInForbiddenZone(x, y) {
        const sealZone = getSealZone();
        return x > sealZone.x &&
               x < sealZone.x + sealZone.width &&
               y > sealZone.y &&
               y < sealZone.y + sealZone.height;
    }

 function handleFoodClick(event) {
    event.stopPropagation();
    if (!gameActive) return;

    score++;
    scoreElement.textContent = score;
    moveFood();

    // Скрываем обычного тюленя и показываем весёлого
    seal.style.opacity = '0';
    sealFunny.classList.remove('hidden');
    sealFunny.classList.add('visible');
    seal.classList.add('happy');

    setTimeout(function() {
        sealFunny.classList.remove('visible');
        sealFunny.classList.add('hidden');
        seal.style.opacity = '1';
        seal.classList.remove('happy');
    }, 500);
}

    function moveFood() {
        const gameArea = document.querySelector('.game-area');
        const gameAreaRect = gameArea.getBoundingClientRect();

        let x, y;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            x = Math.random() * (gameAreaRect.width - 120); // Учитываем ширину рыбки
            y = Math.random() * (gameAreaRect.height - 70); // Учитываем высоту рыбки
            attempts++;
            if (attempts >= maxAttempts) {
                x = gameAreaRect.width / 2 - 60; // Центр по горизонтали
                y = gameAreaRect.height / 4;    // Верхняя четверть по вертикали
                break;
            }
        } while (isInForbiddenZone(x, y));

        food.style.left = x + 'px';
        food.style.top = y + 'px';
    }

    function startTimer() {
        timer = setInterval(function() {
            timeLeft--;
            timerElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function startGame() {
        if (gameActive) return;

        gameActive = true;
        score = 0;
        timeLeft = 30;
        scoreElement.textContent = score;
        timerElement.textContent = timeLeft;
        startButton.style.display = 'none';
        gameResult.classList.add('hidden');
        gameOverlay.classList.add('hidden');

        food.classList.remove('hidden');
        moveFood();
        startTimer();
    }

    function endGame() {
        clearInterval(timer);
        gameActive = false;
        finalScoreElement.textContent = score;
        gameResult.classList.remove('hidden');
        startButton.style.display = 'block';
        gameOverlay.classList.remove('hidden');
        food.classList.add('hidden');

        const records = JSON.parse(localStorage.getItem('feedSealRecords')) || [];
        const isNewRecord = records.length < 5 || score > Math.min(...records);

        if (isNewRecord) {
            newRecordMessage.classList.remove('hidden');
            newRecordMessage.classList.add('visible');
        } else {
            newRecordMessage.classList.remove('visible');
            newRecordMessage.classList.add('hidden');
        }

        saveRecord(score);
    }

    function saveRecord(newScore) {
        let records = JSON.parse(localStorage.getItem('feedSealRecords')) || [];
        records.push(newScore);
        records.sort((a, b) => b - a);
        if (records.length > 5) records = records.slice(0, 5);

        localStorage.setItem('feedSealRecords', JSON.stringify(records));
        updateRecordsTable();
    }

    function updateRecordsTable() {
        const records = JSON.parse(localStorage.getItem('feedSealRecords')) || [];
        const tbody = recordsTable.querySelector('tbody');
        tbody.innerHTML = '';

        records.forEach((record, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${index + 1}</td><td>${record}</td>`;
            tbody.appendChild(row);
        });
    }

    function resetRecords() {
        if (confirm('Вы уверены, что хотите обнулить все рекорды?')) {
            localStorage.removeItem('feedSealRecords');
            updateRecordsTable();
        }
    }

    startButton.addEventListener('click', startGame);
    resetRecordsButton.addEventListener('click', resetRecords);
    food.addEventListener('click', handleFoodClick);

    // Инициализация таблицы рекордов
    updateRecordsTable();
});
