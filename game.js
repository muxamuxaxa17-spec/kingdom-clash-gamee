// Расширенные игровые данные
let gameState = {
    gold: 1000,
    food: 500,
    wood: 300,
    stone: 200,
    castleLevel: 1,
    warriors: 5,
    archers: 0,
    cavalry: 0
};

// Инициализация Telegram
let tg = window.Telegram ? window.Telegram.WebApp : null;

// Загружаем игру при запуске
function loadGame() {
    const saved = localStorage.getItem('kingdomClashSave');
    if (saved) {
        try {
            gameState = JSON.parse(saved);
            console.log('✅ Игра загружена!');
        } catch (e) {
            console.log('❌ Ошибка загрузки:', e);
        }
    }
    updateDisplay();
    
    // Приветствие
    setTimeout(() => {
        showMessage('🏰 Добро пожаловать в Kingdom Clash!', 'success');
    }, 500);
}

// Сохраняем игру
function saveGame() {
    try {
        localStorage.setItem('kingdomClashSave', JSON.stringify(gameState));
        console.log('💾 Игра сохранена!');
        return true;
    } catch (e) {
        console.log('❌ Ошибка сохранения:', e);
        return false;
    }
}

// Принудительное сохранение
function forceSave() {
    if (saveGame()) {
        showMessage('💾 Игра успешно сохранена!', 'success');
        // Анимация кнопки сохранения
        const saveBtn = document.querySelector('.save-btn');
        saveBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            saveBtn.style.transform = 'scale(1)';
        }, 150);
    } else {
        showMessage('❌ Ошибка сохранения игры!', 'error');
    }
}

// Обновляем отображение
function updateDisplay() {
    // Обновляем ресурсы
    document.getElementById('gold').textContent = formatNumber(gameState.gold);
    document.getElementById('food').textContent = formatNumber(gameState.food);
    document.getElementById('wood').textContent = formatNumber(gameState.wood);
    document.getElementById('stone').textContent = formatNumber(gameState.stone);
    
    // Обновляем уровень замка
    document.getElementById('castle-level').textContent = gameState.castleLevel;
    
    // Обновляем армию
    document.getElementById('warriors').textContent = gameState.warriors;
    document.getElementById('archers').textContent = gameState.archers;
    document.getElementById('cavalry').textContent = gameState.cavalry;
    
    // Обновляем стоимость улучшения
    const upgradeCost = gameState.castleLevel * 500;
    document.getElementById('upgrade-cost').textContent = `${formatNumber(upgradeCost)} золота`;
    
    // Автосохранение
    saveGame();
}

// Форматирование чисел (1,000 вместо 1000)
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Сбор ресурсов с анимацией
function collectResources() {
    // Увеличиваем ресурсы
    gameState.gold += 100;
    gameState.food += 50;
    gameState.wood += 30;
    gameState.stone += 20;
    
    // Анимация кнопки
    animateButton('.collect-btn');
    
    // Создаем летящие монетки
    createFlyingCoins();
    
    updateDisplay();
    showMessage('💎 Ресурсы собраны! +100 золота, +50 еды', 'success');
}

// Улучшение замка
function upgradeCastle() {
    const cost = gameState.castleLevel * 500;
    
    if (gameState.gold >= cost) {
        gameState.gold -= cost;
        gameState.castleLevel++;
        
        // Анимация улучшения
        animateCastleUpgrade();
        
        updateDisplay();
        showMessage(`🏰 Замок улучшен до уровня ${gameState.castleLevel}!`, 'success');
    } else {
        showMessage(`❌ Недостаточно золота! Нужно: ${cost}`, 'error');
        // Анимация тряски кнопки
        shakeButton('.upgrade-btn');
    }
}

// Нанять воина
function trainWarrior() {
    const cost = 100;
    
    if (gameState.gold >= cost) {
        gameState.gold -= cost;
        gameState.warriors++;
        
        // Анимация кнопки
        animateButton('.army-btn');
        
        updateDisplay();
        showMessage('🛡️ Воин нанят в вашу армию!', 'success');
    } else {
        showMessage('❌ Недостаточно золота для найма воина!', 'error');
        shakeButton('.army-btn');
    }
}

// Атака врага
function attack() {
    if (gameState.warriors > 0) {
        // Анимация кнопки атаки
        animateBattle();
        
        const winChance = Math.random();
        
        setTimeout(() => {
            if (winChance > 0.4) { // 60% шанс победы
                const loot = Math.floor(Math.random() * 200) + 100;
                gameState.gold += loot;
                showMessage(`🎉 Победа! Захвачено ${loot} золота!`, 'success');
                
                // Анимация победы
                createVictoryEffects();
            } else {
                gameState.warriors = Math.max(0, gameState.warriors - 1);
                showMessage('💀 Поражение! Потерян 1 воин.', 'error');
                
                // Анимация поражения
                createDefeatEffects();
            }
            
            updateDisplay();
        }, 1000);
        
    } else {
        showMessage('❌ Нет воинов для атаки! Сначала наймите армию.', 'error');
        shakeButton('.battle-btn');
    }
}

// Показ сообщений с разными типами
function showMessage(text, type = 'info') {
    const battleResult = document.getElementById('battle-result');
    
    // Устанавливаем стили в зависимости от типа
    const styles = {
        success: { color: '#32CD32', borderColor: '#32CD32', background: 'rgba(50, 205, 50, 0.1)' },
        error: { color: '#DC143C', borderColor: '#DC143C', background: 'rgba(220, 20, 60, 0.1)' },
        info: { color: '#FFD700', borderColor: '#FFD700', background: 'rgba(255, 215, 0, 0.1)' }
    };
    
    const style = styles[type] || styles.info;
    
    battleResult.textContent = text;
    battleResult.style.color = style.color;
    battleResult.style.borderColor = style.borderColor;
    battleResult.style.background = style.background;
    battleResult.style.opacity = '1';
    
    // Анимация появления
    battleResult.style.transform = 'scale(0.8)';
    battleResult.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        battleResult.style.transform = 'scale(1)';
    }, 50);
    
    // Автоматическое скрытие через 4 секунды
    setTimeout(() => {
        battleResult.style.opacity = '0';
        setTimeout(() => {
            battleResult.textContent = '';
            battleResult.style.opacity = '1';
        }, 300);
    }, 4000);
}

// Анимация кнопки
function animateButton(selector) {
    const button = document.querySelector(selector);
    if (!button) return;
    
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

// Анимация тряски кнопки при ошибке
function shakeButton(selector) {
    const button = document.querySelector(selector);
    if (!button) return;
    
    button.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        button.style.animation = '';
    }, 500);
}

// Анимация улучшения замка
function animateCastleUpgrade() {
    const castleIcon = document.querySelector('.castle-icon');
    if (!castleIcon) return;
    
    castleIcon.style.transform = 'scale(1.2)';
    castleIcon.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
        castleIcon.style.transform = 'scale(1)';
    }, 300);
}

// Анимация битвы
function animateBattle() {
    const battleBtn = document.querySelector('.battle-btn');
    if (!battleBtn) return;
    
    battleBtn.style.background = 'linear-gradient(135deg, #DC143C, #8B0000)';
    battleBtn.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        battleBtn.style.background = 'linear-gradient(135deg, #8B0000, #DC143C)';
        battleBtn.style.transform = 'scale(1)';
    }, 200);
}

// Создание летящих монеток при сборе ресурсов
function createFlyingCoins() {
    const container = document.querySelector('.floating-coins');
    if (!container) return;
    
    for (let i = 0; i < 5; i++) {
        const coin = document.createElement('div');
        coin.textContent = '💰';
        coin.style.position = 'fixed';
        coin.style.left = '50%';
        coin.style.bottom = '20%';
        coin.style.fontSize = '20px';
        coin.style.zIndex = '1000';
        coin.style.pointerEvents = 'none';
        coin.style.animation = `flyCoin ${Math.random() * 1 + 1}s ease-in forwards`;
        
        // Случайное направление
        const endX = (Math.random() - 0.5) * 200;
        
        coin.style.setProperty('--end-x', `${endX}px`);
        coin.style.setProperty('--end-y', '-100px');
        
        container.appendChild(coin);
        
        // Удаляем после анимации
        setTimeout(() => {
            if (coin.parentNode) {
                coin.parentNode.removeChild(coin);
            }
        }, 2000);
    }
}

// Создание эффектов победы
function createVictoryEffects() {
    const container = document.querySelector('.floating-shields');
    if (!container) return;
    
    for (let i = 0; i < 3; i++) {
        const effect = document.createElement('div');
        effect.textContent = '🛡️';
        effect.style.position = 'fixed';
        effect.style.left = '50%';
        effect.style.top = '50%';
        effect.style.fontSize = '30px';
        effect.style.zIndex = '1000';
        effect.style.pointerEvents = 'none';
        effect.style.animation = `victoryEffect 2s ease-out forwards`;
        
        container.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 2000);
    }
}

// Создание эффектов поражения
function createDefeatEffects() {
    const container = document.querySelector('.floating-shields');
    if (!container) return;
    
    for (let i = 0; i < 2; i++) {
        const effect = document.createElement('div');
        effect.textContent = '💀';
        effect.style.position = 'fixed';
        effect.style.left = '50%';
        effect.style.top = '50%';
        effect.style.fontSize = '25px';
        effect.style.zIndex = '1000';
        effect.style.pointerEvents = 'none';
        effect.style.animation = `defeatEffect 1.5s ease-out forwards`;
        
        container.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1500);
    }
}

// Добавляем CSS анимации динамически
function addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes flyCoin {
            0% {
                transform: translate(0, 0) scale(1) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translate(var(--end-x, 0), var(--end-y, -100px)) scale(0.5) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes victoryEffect {
            0% {
                transform: translate(-50%, -50%) scale(0) rotate(0deg);
                opacity: 1;
            }
            50% {
                transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
                opacity: 0.8;
            }
            100% {
                transform: translate(calc(-50% + ${Math.random() * 100 - 50}px), calc(-50% + ${Math.random() * 100 - 50}px)) scale(0) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes defeatEffect {
            0% {
                transform: translate(-50%, -50%) scale(1) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translate(calc(-50% + ${Math.random() * 200 - 100}px), calc(-50% + ${Math.random() * 100 + 50}px)) scale(0) rotate(-180deg);
                opacity: 0;
            }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', function() {
    addAnimations();
    loadGame();
});

// Добавляем обработчики для анимации кнопок при наведении
document.addEventListener('DOMContentLoaded', function() {
    // Анимация частиц для кнопки сбора ресурсов
    const collectBtn = document.querySelector('.collect-btn');
    if (collectBtn) {
        collectBtn.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        collectBtn.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
    }
});