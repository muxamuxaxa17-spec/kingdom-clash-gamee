// Расширенные игровые данные
let gameState = {
    gold: 1000,
    food: 500,
    wood: 300,
    stone: 200,
    castleLevel: 1,
    warriors: 5,
    archers: 0,
    cavalry: 0,
    totalEarnedGold: 1000,
    totalBattles: 0,
    totalWins: 0,
    achievements: {},
    lastEventTime: 0
};

// Система достижений
const achievements = {
    firstGold: {
        name: "Первая добыча",
        description: "Заработать 1000 золота",
        icon: "💰",
        condition: (state) => state.totalEarnedGold >= 1000,
        reward: { gold: 200 }
    },
    warriorKing: {
        name: "Король воинов", 
        description: "Нанять 10 воинов",
        icon: "🛡️",
        condition: (state) => state.warriors >= 10,
        reward: { warriors: 2 }
    },
    masterArcher: {
        name: "Мастер лучников",
        description: "Нанять 5 лучников", 
        icon: "🏹",
        condition: (state) => state.archers >= 5,
        reward: { archers: 1 }
    },
    cavalryLeader: {
        name: "Лидер кавалерии",
        description: "Нанять 3 всадника",
        icon: "🐎", 
        condition: (state) => state.cavalry >= 3,
        reward: { cavalry: 1 }
    },
    castleBuilder: {
        name: "Строитель замков",
        description: "Достичь 5 уровня замка",
        icon: "🏰",
        condition: (state) => state.castleLevel >= 5,
        reward: { gold: 500, stone: 200 }
    },
    battleMaster: {
        name: "Мастер битв",
        description: "Выиграть 10 битв",
        icon: "⚔️",
        condition: (state) => state.totalWins >= 10,
        reward: { gold: 300, warriors: 3 }
    }
};

// События
const gameEvents = [
    {
        name: "💰 Золотая лихорадка!",
        description: "Все сборы ресурсов дают x2 золота на 30 минут",
        effect: "goldBoost",
        duration: 30 * 60 * 1000 // 30 минут
    },
    {
        name: "⚔️ Боевой дух!",
        description: "Шанс победы в битвах увеличен на 20% на 30 минут", 
        effect: "battleBoost",
        duration: 30 * 60 * 1000
    },
    {
        name: "🏗️ Строительный бум!",
        description: "Стоимость улучшений уменьшена на 30% на 30 минут",
        effect: "buildBoost", 
        duration: 30 * 60 * 1000
    },
    {
        name: "🎁 Щедрый король!",
        description: "Получите случайный бонус!",
        effect: "randomBonus",
        duration: 0
    }
];

// Текущее активное событие
let activeEvent = null;
let eventEndTime = 0;

// Инициализация Telegram
let tg = window.Telegram ? window.Telegram.WebApp : null;

// Загружаем игру при запуске
function loadGame() {
    const saved = localStorage.getItem('kingdomClashSave');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            gameState = { ...gameState, ...loaded };
            console.log('✅ Игра загружена!');
        } catch (e) {
            console.log('❌ Ошибка загрузки:', e);
        }
    }
    
    updateDisplay();
    updateAchievements();
    updateRanking();
    updateEventDisplay();
    
    // Приветствие
    setTimeout(() => {
        showMessage('🏰 Добро пожаловать в обновленный Kingdom Clash!', 'success');
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
        animateButton('.save-btn');
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
    
    // Обновляем счетчики новых юнитов
    document.getElementById('archers-count').textContent = gameState.archers;
    document.getElementById('cavalry-count').textContent = gameState.cavalry;
    
    // Обновляем стоимость улучшения
    const upgradeCost = Math.floor(gameState.castleLevel * 500 * (activeEvent?.effect === 'buildBoost' ? 0.7 : 1));
    document.getElementById('upgrade-cost').textContent = `${formatNumber(upgradeCost)} золота`;
    
    // Автосохранение
    saveGame();
    
    // Проверяем достижения
    checkAchievements();
}

// Форматирование чисел
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Сбор ресурсов с анимацией
function collectResources() {
    let goldGain = 100;
    let foodGain = 50;
    let woodGain = 30;
    let stoneGain = 20;
    
    // Умножаем на 2 если активно событие золота
    if (activeEvent?.effect === 'goldBoost') {
        goldGain *= 2;
        foodGain *= 2;
        woodGain *= 2;
        stoneGain *= 2;
    }
    
    gameState.gold += goldGain;
    gameState.food += foodGain;
    gameState.wood += woodGain;
    gameState.stone += stoneGain;
    gameState.totalEarnedGold += goldGain;
    
    // Анимация кнопки
    animateButton('.collect-btn');
    
    // Создаем летящие монетки
    createFlyingCoins();
    
    updateDisplay();
    showMessage(`💎 Ресурсы собраны! +${goldGain} золота, +${foodGain} еды`, 'success');
    
    // Воспроизводим звук сбора
    playSound('collect');
}

// Улучшение замка
function upgradeCastle() {
    let cost = gameState.castleLevel * 500;
    
    // Уменьшаем стоимость если активно событие строительства
    if (activeEvent?.effect === 'buildBoost') {
        cost = Math.floor(cost * 0.7);
    }
    
    if (gameState.gold >= cost) {
        gameState.gold -= cost;
        gameState.castleLevel++;
        
        // Анимация улучшения
        animateCastleUpgrade();
        
        updateDisplay();
        showMessage(`🏰 Замок улучшен до уровня ${gameState.castleLevel}!`, 'success');
        
        // Воспроизводим звук улучшения
        playSound('upgrade');
    } else {
        showMessage(`❌ Недостаточно золота! Нужно: ${cost}`, 'error');
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
        
        // Воспроизводим звук найма
        playSound('train');
    } else {
        showMessage('❌ Недостаточно золота для найма воина!', 'error');
        shakeButton('.army-btn');
    }
}

// Нанять лучника
function trainArcher() {
    const goldCost = 150;
    const woodCost = 50;
    
    if (gameState.gold >= goldCost && gameState.wood >= woodCost) {
        gameState.gold -= goldCost;
        gameState.wood -= woodCost;
        gameState.archers++;
        
        // Анимация кнопки
        animateButton('.unit-btn:nth-child(1)');
        
        updateDisplay();
        showMessage('🏹 Лучник присоединился к армии!', 'success');
        
        // Воспроизводим звук найма
        playSound('train');
    } else {
        showMessage(`❌ Недостаточно ресурсов! Нужно: ${goldCost} золота и ${woodCost} дерева`, 'error');
        shakeButton('.unit-btn:nth-child(1)');
    }
}

// Нанять всадника  
function trainCavalry() {
    const goldCost = 300;
    const foodCost = 100;
    
    if (gameState.gold >= goldCost && gameState.food >= foodCost) {
        gameState.gold -= goldCost;
        gameState.food -= foodCost;
        gameState.cavalry++;
        
        // Анимация кнопки
        animateButton('.unit-btn:nth-child(2)');
        
        updateDisplay();
        showMessage('🐎 Всадник присоединился к армии!', 'success');
        
        // Воспроизводим звук найма
        playSound('train');
    } else {
        showMessage(`❌ Недостаточно ресурсов! Нужно: ${goldCost} золота и ${foodCost} еды`, 'error');
        shakeButton('.unit-btn:nth-child(2)');
    }
}

// Атака врага
function attack() {
    if (gameState.warriors + gameState.archers + gameState.cavalry > 0) {
        // Анимация кнопки атаки
        animateBattle();
        
        let winChance = 0.6; // Базовый шанс 60%
        
        // Увеличиваем шанс если активно событие битвы
        if (activeEvent?.effect === 'battleBoost') {
            winChance += 0.2;
        }
        
        // Учитываем армию
        const armyPower = gameState.warriors + gameState.archers * 1.2 + gameState.cavalry * 1.5;
        winChance = Math.min(0.9, winChance + armyPower * 0.01);
        
        gameState.totalBattles++;
        
        setTimeout(() => {
            if (Math.random() < winChance) {
                const baseLoot = 100;
                const armyBonus = (gameState.archers * 10) + (gameState.cavalry * 20);
                const loot = Math.floor(Math.random() * 100) + baseLoot + armyBonus;
                
                gameState.gold += loot;
                gameState.totalWins++;
                gameState.totalEarnedGold += loot;
                
                showMessage(`🎉 Победа! Захвачено ${loot} золота!`, 'success');
                
                // Анимация победы
                createVictoryEffects();
                
                // Воспроизводим звук победы
                playSound('victory');
            } else {
                // Потери зависят от типа юнитов
                if (gameState.cavalry > 0) {
                    gameState.cavalry--;
                    showMessage('💀 Поражение! Потерян 1 всадник.', 'error');
                } else if (gameState.archers > 0) {
                    gameState.archers--;
                    showMessage('💀 Поражение! Потерян 1 лучник.', 'error');
                } else {
                    gameState.warriors--;
                    showMessage('💀 Поражение! Потерян 1 воин.', 'error');
                }
                
                // Воспроизводим звук поражения
                playSound('defeat');
            }
            
            updateDisplay();
        }, 1000);
        
    } else {
        showMessage('❌ Нет армии для атаки! Сначала наймите войска.', 'error');
        shakeButton('.battle-btn');
    }
}

// Система достижений
function checkAchievements() {
    let newAchievements = false;
    
    for (const [id, achievement] of Object.entries(achievements)) {
        if (!gameState.achievements[id] && achievement.condition(gameState)) {
            // Разблокируем достижение
            gameState.achievements[id] = {
                unlocked: true,
                unlockedAt: Date.now()
            };
            
            // Выдаем награду
            if (achievement.reward) {
                for (const [resource, amount] of Object.entries(achievement.reward)) {
                    gameState[resource] += amount;
                }
            }
            
            showMessage(`🏆 Достижение разблокировано: ${achievement.name}!`, 'success');
            newAchievements = true;
            
            // Воспроизводим звук достижения
            playSound('achievement');
        }
    }
    
    if (newAchievements) {
        updateAchievements();
        updateDisplay();
    }
}

function updateAchievements() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (const [id, achievement] of Object.entries(achievements)) {
        const achievementElem = document.createElement('div');
        achievementElem.className = `achievement-card ${gameState.achievements[id]?.unlocked ? 'unlocked' : ''}`;
        
        let progress = 0;
        if (achievement.condition) {
            // Простая логика прогресса для демонстрации
            if (id === 'firstGold') progress = Math.min(100, (gameState.totalEarnedGold / 1000) * 100);
            else if (id === 'warriorKing') progress = Math.min(100, (gameState.warriors / 10) * 100);
            else if (id === 'masterArcher') progress = Math.min(100, (gameState.archers / 5) * 100);
            else if (id === 'cavalryLeader') progress = Math.min(100, (gameState.cavalry / 3) * 100);
            else if (id === 'castleBuilder') progress = Math.min(100, (gameState.castleLevel / 5) * 100);
            else if (id === 'battleMaster') progress = Math.min(100, (gameState.totalWins / 10) * 100);
        }
        
        achievementElem.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
            ${!gameState.achievements[id]?.unlocked ? `
                <div class="achievement-progress">
                    <div class="achievement-progress-bar" style="width: ${progress}%"></div>
                </div>
            ` : ''}
        `;
        
        container.appendChild(achievementElem);
    }
}

// Система рейтинга
function updateRanking() {
    const container = document.getElementById('ranking-list');
    if (!container) return;
    
    // В реальном приложении здесь был бы запрос к серверу
    // Сейчас создадим демо-рейтинг
    const demoRanking = [
        { name: 'Ты', score: calculateScore(), isCurrent: true },
        { name: 'Король Артур', score: 12500 },
        { name: 'Ланселот', score: 11200 },
        { name: 'Гвиневра', score: 9800 },
        { name: 'Мерлин', score: 8900 }
    ];
    
    // Сортируем по очкам
    demoRanking.sort((a, b) => b.score - a.score);
    
    container.innerHTML = '';
    
    demoRanking.forEach((player, index) => {
        const rankElem = document.createElement('div');
        rankElem.className = `ranking-item ${player.isCurrent ? 'current-player' : ''}`;
        
        rankElem.innerHTML = `
            <div class="ranking-position">${index + 1}</div>
            <div class="ranking-name">${player.name}</div>
            <div class="ranking-score">${formatNumber(player.score)}</div>
        `;
        
        if (player.isCurrent) {
            rankElem.style.background = 'rgba(255, 215, 0, 0.2)';
            rankElem.style.border = '1px solid var(--color-gold)';
        }
        
        container.appendChild(rankElem);
    });
}

function calculateScore() {
    return gameState.castleLevel * 1000 + 
           gameState.warriors * 50 + 
           gameState.archers * 75 + 
           gameState.cavalry * 100 +
           gameState.totalWins * 200;
}

// Система событий
function startEvent() {
    const now = Date.now();
    
    // Проверяем кулдаун (1 событие в час)
    if (now - gameState.lastEventTime < 60 * 60 * 1000) {
        const remaining = Math.ceil((60 * 60 * 1000 - (now - gameState.lastEventTime)) / 60000);
        showMessage(`❌ Событие можно запускать раз в час. Подожди еще ${remaining} минут.`, 'error');
        return;
    }
    
    const randomEvent = gameEvents[Math.floor(Math.random() * gameEvents.length)];
    activeEvent = randomEvent;
    eventEndTime = now + randomEvent.duration;
    gameState.lastEventTime = now;
    
    // Обрабатываем мгновенные события
    if (randomEvent.effect === 'randomBonus') {
        const bonuses = [
            { type: 'gold', amount: 500, message: '🎁 Найдено 500 золота!' },
            { type: 'resources', amount: 200, message: '🎁 Получено 200 каждого ресурса!' },
            { type: 'army', amount: 3, message: '🎁 К вам присоединились 3 воина!' }
        ];
        
        const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
        
        switch (bonus.type) {
            case 'gold':
                gameState.gold += bonus.amount;
                break;
            case 'resources':
                gameState.gold += bonus.amount;
                gameState.food += bonus.amount;
                gameState.wood += bonus.amount;
                gameState.stone += bonus.amount;
                break;
            case 'army':
                gameState.warriors += bonus.amount;
                break;
        }
        
        showMessage(bonus.message, 'success');
        activeEvent = null;
    }
    
    updateEventDisplay();
    updateDisplay();
    
    if (randomEvent.effect !== 'randomBonus') {
        showMessage(`🎪 Запущено событие: ${randomEvent.name}`, 'success');
        
        // Запускаем таймер для автоматического завершения события
        setTimeout(() => {
            activeEvent = null;
            updateEventDisplay();
            showMessage('🕒 Событие завершилось.', 'info');
        }, randomEvent.duration);
    }
    
    // Воспроизводим звук события
    playSound('event');
}

function updateEventDisplay() {
    const container = document.getElementById('current-event');
    const button = document.querySelector('.event-btn');
    
    if (!container) return;
    
    if (activeEvent) {
        const remaining = Math.max(0, eventEndTime - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        container.innerHTML = `
            <div>${activeEvent.name}</div>
            <div style="font-size: 0.8em; opacity: 0.8; margin-top: 5px;">
                ${activeEvent.description}
            </div>
            <div style="font-size: 0.7em; margin-top: 5px;">
                ⏳ Осталось: ${minutes}:${seconds.toString().padStart(2, '0')}
            </div>
        `;
        
        if (button) button.disabled = true;
    } else {
        const lastEventTime = gameState.lastEventTime;
        const now = Date.now();
        const cooldown = 60 * 60 * 1000; // 1 час
        
        if (lastEventTime && now - lastEventTime < cooldown) {
            const remaining = Math.ceil((cooldown - (now - lastEventTime)) / 60000);
            container.innerHTML = `⏳ Следующее событие через ${remaining} мин`;
            if (button) button.disabled = true;
        } else {
            container.innerHTML = '🎲 Запустите событие для получения бонусов!';
            if (button) button.disabled = false;
        }
    }
}

// Звуковая система
function playSound(type) {
    // В реальном приложении здесь были бы настоящие звуковые файлы
    // Сейчас просто логируем для демонстрации
    console.log(`🔊 Playing sound: ${type}`);
    
    // Можно добавить реальные звуки позже
    // const audio = new Audio(`sounds/${type}.mp3`);
    // audio.volume = 0.3;
    // audio.play().catch(e => console.log('Audio play failed:', e));
}

// Анимации (остаются без изменений)
function animateButton(selector) {
    const button = document.querySelector(selector);
    if (!button) return;
    
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
}

function shakeButton(selector) {
    const button = document.querySelector(selector);
    if (!button) return;
    
    button.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        button.style.animation = '';
    }, 500);
}

function animateCastleUpgrade() {
    const castleIcon = document.querySelector('.castle-icon');
    if (!castleIcon) return;
    
    castleIcon.style.transform = 'scale(1.2)';
    castleIcon.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
        castleIcon.style.transform = 'scale(1)';
    }, 300);
}

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

function createFlyingCoins() {
    // Реализация анимации летящих монеток
    console.log('🪙 Creating flying coins animation');
}

function createVictoryEffects() {
    // Реализация эффектов победы
    console.log('🎉 Creating victory effects');
}

// Показ сообщений
function showMessage(text, type = 'info') {
    const battleResult = document.getElementById('battle-result');
    if (!battleResult) return;
    
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
    
    battleResult.style.transform = 'scale(0.8)';
    battleResult.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        battleResult.style.transform = 'scale(1)';
    }, 50);
    
    setTimeout(() => {
        battleResult.style.opacity = '0';
        setTimeout(() => {
            battleResult.textContent = '';
            battleResult.style.opacity = '1';
        }, 300);
    }, 4000);
}

// Добавляем CSS анимации
function addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
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
    
    // Обновляем событие каждую секунду для таймера
    setInterval(updateEventDisplay, 1000);
});