/**
 * Модуль целей по весу
 * Установка цели: набрать или сбросить вес к определённой дате
 */

window.Goals = {
    init() {
        this.renderGoalCard();
    },

    getGoal() {
        const goals = Storage.getGoals();
        return goals.active || null;
    },

    setGoal(type, targetWeight, targetDate) {
        const goal = {
            id: Date.now().toString(),
            type: type, // 'lose' или 'gain'
            targetWeight: targetWeight,
            targetDate: targetDate,
            startWeight: Storage.getUser().weight,
            startDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        
        const goals = Storage.getGoals();
        // Деактивируем старую цель
        if (goals.active) {
            goals.history.push(goals.active);
        }
        goals.active = goal;
        Storage.setGoals(goals);
        this.renderGoalCard();
        window.dispatchEvent(new Event('dataUpdated'));
    },

    deleteGoal() {
        if (confirm('Удалить текущую цель?')) {
            const goals = Storage.getGoals();
            goals.active = null;
            Storage.setGoals(goals);
            this.renderGoalCard();
            window.dispatchEvent(new Event('dataUpdated'));
        }
    },

    calculateProgress() {
        const goal = this.getGoal();
        if (!goal) return null;
        
        const currentWeight = Storage.getUser().weight;
        const startWeight = goal.startWeight;
        const targetWeight = goal.targetWeight;
        
        let progress = 0;
        let remaining = 0;
        
        if (goal.type === 'lose') {
            // Сброс веса: идём от большего к меньшему
            const totalToLose = startWeight - targetWeight;
            const lostSoFar = startWeight - currentWeight;
            progress = Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
            remaining = currentWeight - targetWeight;
        } else {
            // Набор веса: идём от меньшего к большему
            const totalToGain = targetWeight - startWeight;
            const gainedSoFar = currentWeight - startWeight;
            progress = Math.min(100, Math.max(0, (gainedSoFar / totalToGain) * 100));
            remaining = targetWeight - currentWeight;
        }
        
        // Расчёт дней до цели
        const targetDate = new Date(goal.targetDate);
        const today = new Date();
        const daysLeft = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
        
        return {
            progress: Math.round(progress),
            remaining: Math.abs(remaining).toFixed(1),
            daysLeft: daysLeft,
            neededPerDay: daysLeft > 0 ? (remaining / daysLeft).toFixed(2) : 0,
            isCompleted: progress >= 100
        };
    },

    renderGoalCard() {
        const container = document.getElementById('goalCard');
        if (!container) return;
        
        const goal = this.getGoal();
        
        if (!goal) {
            container.innerHTML = `
                <div class="goal-card">
                    <div class="goal-header">
                        <span>🎯 ПОСТАВИТЬ ЦЕЛЬ</span>
                        <button class="btn-icon-small" onclick="window.Goals.showGoalModal()">+</button>
                    </div>
                    <div class="goal-empty" onclick="window.Goals.showGoalModal()">
                        Нажмите чтобы установить цель<br>
                        (набрать или сбросить вес)
                    </div>
                </div>
            `;
            return;
        }
        
        const progress = this.calculateProgress();
        if (!progress) return;
        
        const typeText = goal.type === 'lose' ? 'Сбросить вес' : 'Набрать вес';
        const typeIcon = goal.type === 'lose' ? '⬇️' : '⬆️';
        const targetDateFormatted = new Date(goal.targetDate).toLocaleDateString('ru-RU');
        
        let statusHtml = '';
        if (progress.isCompleted) {
            statusHtml = '<div class="goal-completed">✅ ЦЕЛЬ ДОСТИГНУТА! 🎉</div>';
        } else if (progress.daysLeft < 0) {
            statusHtml = '<div class="goal-expired">⏰ Срок цели истёк</div>';
        }
        
        container.innerHTML = `
            <div class="goal-card">
                <div class="goal-header">
                    <span>🎯 ${typeIcon} ${typeText}</span>
                    <div>
                        <button class="btn-icon-small" onclick="window.Goals.showGoalModal()">✏️</button>
                        <button class="btn-icon-small" onclick="window.Goals.deleteGoal()">🗑️</button>
                    </div>
                </div>
                <div class="goal-target">
                    ${goal.startWeight} кг → ${goal.targetWeight} кг
                </div>
                <div class="goal-date">
                    📅 До ${targetDateFormatted} осталось ${progress.daysLeft} дн.
                </div>
                <div class="goal-progress-container">
                    <div class="goal-progress-bar" style="width: ${progress.progress}%"></div>
                </div>
                <div class="goal-stats">
                    <div class="goal-stat">
                        <div class="goal-stat-label">Прогресс</div>
                        <div class="goal-stat-value">${progress.progress}%</div>
                    </div>
                    <div class="goal-stat">
                        <div class="goal-stat-label">Осталось</div>
                        <div class="goal-stat-value">${progress.remaining} кг</div>
                    </div>
                    <div class="goal-stat">
                        <div class="goal-stat-label">В день</div>
                        <div class="goal-stat-value">${progress.neededPerDay > 0 ? progress.neededPerDay : 0} кг</div>
                    </div>
                </div>
                ${statusHtml}
            </div>
        `;
    },

    showGoalModal() {
        const goal = this.getGoal();
        document.getElementById('goalType').value = goal?.type || 'lose';
        document.getElementById('goalTargetWeight').value = goal?.targetWeight || '';
        document.getElementById('goalTargetDate').value = goal?.targetDate || '';
        document.getElementById('goalModal').classList.add('active');
    },

    saveGoal() {
        const type = document.getElementById('goalType').value;
        const targetWeight = parseFloat(document.getElementById('goalTargetWeight').value);
        const targetDate = document.getElementById('goalTargetDate').value;
        
        if (!targetWeight || !targetDate) {
            alert('Заполните все поля');
            return;
        }
        
        const currentWeight = Storage.getUser().weight;
        
        if (type === 'lose' && targetWeight >= currentWeight) {
            alert('Для сброса веса цель должна быть меньше текущего веса');
            return;
        }
        if (type === 'gain' && targetWeight <= currentWeight) {
            alert('Для набора веса цель должна быть больше текущего веса');
            return;
        }
        
        this.setGoal(type, targetWeight, targetDate);
        document.getElementById('goalModal').classList.remove('active');
    }
};
