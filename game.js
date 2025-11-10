// Игровые данные
let gameState = {
    gold: 1000,
    food: 500,
    wood: 300,
    stone: 200,
    castleLevel: 1,
    warriors: 5
};

// Загружаем прогресс при запуске
function loadProgress() {
    const saved = localStorage.getItem('kingdomClashSave');
    if (saved) {
        gameState = JSON.parse(saved);
        console.log('Прогресс загружен!');
    }
    updateDisplay();
}

// Сохраняем прогресс
function saveProgress() {
    localStorage.setItem('kingdomClashSave', JSON.stringify(gameState));
    console.log('Прогресс сохранен!');
}

// Обновляем отображение
function updateDisplay() {
    document.getElementById('gold').textContent = gameState.gold;
    document.getElementById('food').textContent = gameState.food;
    document.getElementById('wood').textContent = gameState.wood;
    document.getElementById('stone').textContent = gameState.stone;
    document.getElementById('castle-level').textContent = gameState.castleLevel;
    document.getElementById('warriors').textContent = gameState.warriors;
    
    // Сохраняем после каждого изменения
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

// Запускаем игру при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    showMessage('Добро пожаловать в Kingdom Clash!');
});
