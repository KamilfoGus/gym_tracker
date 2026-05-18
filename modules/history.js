/**
 * Модуль истории тренировок
 */

window.History = {
    updateUI() {
        const container = document.getElementById('historyList');
        if (!container) return;

        const checkIns = [...Storage.getCheckIns()].reverse();
        const weightHistory = Storage.getWeightHistory();
        const exercises = Storage.getExercises();

        if (checkIns.length === 0) {
            container.innerHTML = `
                <div class="history-item">
                    <div class="history-date">📭 Нет записей</div>
                    <div class="history-details">Начните тренироваться и отмечайтесь каждый день!</div>
                </div>
            `;
            return;
        }

        container.innerHTML = '<h3 style="margin-bottom: 20px;">📊 ИСТОРИЯ ТРЕНИРОВОК</h3>';

        checkIns.forEach(date => {
            const weightEntry = weightHistory.find(w => w.date === date);
            
            // Подсчет подходов за этот день
            let totalSets = 0;
            let exercisesDone = [];
            
            exercises.forEach(ex => {
                const setsOnDate = ex.sets.filter(s => s.date === date);
                if (setsOnDate.length > 0) {
                    totalSets += setsOnDate.length;
                    exercisesDone.push({
                        name: ex.name,
                        sets: setsOnDate.length
                    });
                }
            });

            const div = document.createElement('div');
            div.className = 'history-item';
            
            let exercisesHtml = '';
            if (exercisesDone.length > 0) {
                exercisesHtml = '<div style="margin-top: 8px;"><strong>💪 Упражнения:</strong><br>';
                exercisesDone.forEach(ex => {
                    exercisesHtml += `&nbsp;&nbsp;• ${ex.name}: ${ex.sets} подходов<br>`;
                });
                exercisesHtml += '</div>';
            } else {
                exercisesHtml = '<div style="margin-top: 8px;">💪 Нет записей упражнений</div>';
            }

            div.innerHTML = `
                <div class="history-date">📅 ${this.formatDate(date)}</div>
                <div class="history-details">
                    <div>⚖️ Вес: ${weightEntry ? weightEntry.weight + ' кг' : '—'}</div>
                    <div>🏋️ Всего подходов: ${totalSets}</div>
                    ${exercisesHtml}
                </div>
            `;
            container.appendChild(div);
        });
    },

    formatDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(year, month - 1, day);
        const weekDays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        return `${day}.${month}.${year} (${weekDays[date.getDay()]})`;
    }
};