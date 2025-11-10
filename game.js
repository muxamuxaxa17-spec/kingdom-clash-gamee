// Интеграция с Telegram
let tg = window.Telegram?.WebApp;
let user = null;

// Инициализация Telegram
if (tg) {
    tg.expand();
    tg.enableClosingConfirmation();
    user = tg.initDataUnsafe?.user;
}

// Игровые данные
let gameState = {
    gold: 1000,
    food: 500,
    wood: 300,
    stone: 200,
    castleLevel: 1,
    warriors: 5
};

// Обновляем отображение
function updateDisplay() {
    document.getElementById('gold').textContent = gameState.gold;
    document.getElementById('food').textContent = gameState.food;
    document.getElementById('wood').textContent = gameState.wood;
    document.getElementById('stone').textContent = gameState.stone;
    document.getElementById('level').textContent = gameState.castleLevel;
    document.getElementById('warriors').textContent = gameState.warriors;
    
    // Сохраняем прогресс
    saveProgress();
}

// Сбор ресурсов
function collectResources() {
    gameState.gold += 100;
    gameState.food += 50;
    gameState.wood += 30;
    gameState.stone += 20;
    
    updateDisplay();
    showMessage('💎 Ресурсы собраны!');
}

// Улучшение замка
function upgradeCastle() {
    const cost = gameState.castleLevel * 500;
    
    if (gameState.gold >= cost) {
        gameState.gold -= cost;
        gameState.castleLevel++;
        updateDisplay();
        showMessage(`🏰 Замок улучшен до уровня ${gameState.castleLevel}!`);
    } else {
        showMessage('❌ Недостаточно золота для улучшения!');
    }
}

// Нанять воина
function trainWarrior() {
    if (gameState.gold >= 100) {
        gameState.gold -= 100;
        gameState.warriors++;
        updateDisplay();
        showMessage('🛡️ Воин нанят!');
    } else {
        showMessage('❌ Недостаточно золота!');
    }
}

// Атака
function attack() {
    if (gameState.warriors > 0) {
        const winChance = Math.random();
        
        if (winChance > 0.3) {
            const loot = Math.floor(Math.random() * 200) + 100;
            gameState.gold += loot;
            showMessage(`🎉 Победа! Захвачено ${loot} золота!`, 'green');
        } else {
            gameState.warriors--;
            showMessage('💀 Поражение! Потерян 1 воин.', 'red');
        }
        
        updateDisplay();
    } else {
        showMessage('❌ Нет воинов для атаки!', 'red');
    }
}

// Показ сообщений
function showMessage(text, color = 'blue') {
    const battleResult = document.getElementById('battle-result');
    battleResult.textContent = text;
    battleResult.style.color = color;
    
    setTimeout(() => {
        battleResult.textContent = '';
    }, 3000);
}

// Сохранение прогресса
function saveProgress() {
    if (tg) {
        const progress = JSON.stringify(gameState);
        tg.CloudStorage.setItem('gameProgress', progress);
    } else {
        // Локальное сохранение для теста
        localStorage.setItem('kingdomClashProgress', JSON.stringify(gameState));
    }
}

// Загрузка прогресса
function loadProgress() {
    if (tg) {
        tg.CloudStorage.getItem('gameProgress', (err, data) => {
            if (data) {
                gameState = JSON.parse(data);
            }
            updateDisplay();
        });
    } else {
        // Локальная загрузка для теста
        const saved = localStorage.getItem('kingdomClashProgress');
        if (saved) {
            gameState = JSON.parse(saved);
        }
        updateDisplay();
    }
}

// Приветствие пользователя
if (user) {
    showMessage(`Привет, ${user.first_name}! Добро пожаловать в Kingdom Clash!`);
}

// Запускаем игру при загрузке
loadProgress();