/**
 * Модуль достижений (ачивки)
 * Автоматически отслеживает прогресс и выдаёт награды
 */

window.Achievements = {
    // Список всех достижений
    list: [
        {
            id: 'first_workout',
            name: 'Первый шаг',
            description: 'Провел первую тренировку',
            icon: '🚀',
            check: (data) => data.checkIns.length >= 1
        },
        {
            id: 'week_streak',
            name: 'Неделя силы',
            description: 'Тренировался 7 дней подряд',
            icon: '💪',
            check: (data) => {
                const checkIns = data.checkIns;
                if (checkIns.length < 7) return false;
                const sorted = [...checkIns].sort();
                let streak = 1;
                for (let i = 1; i < sorted.length; i++) {
                    const diff = (new Date(sorted[i]) - new Date(sorted[i-1])) / (1000*60*60*24);
                    if (diff <= 1) streak++;
                    else streak = 1;
                    if (streak >= 7) return true;
                }
                return false;
            }
        },
        {
            id: 'month_streak',
            name: 'Железный человек',
            description: 'Тренировался 30 дней подряд',
            icon: '🏆',
            check: (data) => {
                const checkIns = data.checkIns;
                if (checkIns.length < 30) return false;
                const sorted = [...checkIns].sort();
                let streak = 1;
                for (let i = 1; i < sorted.length; i++) {
                    const diff = (new Date(sorted[i]) - new Date(sorted[i-1])) / (1000*60*60*24);
                    if (diff <= 1) streak++;
                    else streak = 1;
                    if (streak >= 30) return true;
                }
                return false;
            }
        },
        {
            id: 'pr_50',
            name: 'Силач',
            description: 'Достиг 1ПМ 50 кг в любом упражнении',
            icon: '🏋️',
            check: (data) => {
                return data.exercises.some(ex => (ex.pr || 0) >= 50);
            }
        },
        {
            id: 'pr_100',
            name: 'Мастер силы',
            description: 'Достиг 1ПМ 100 кг в любом упражнении',
            icon: '🔥',
            check: (data) => {
                return data.exercises.some(ex => (ex.pr || 0) >= 100);
            }
        },
        {
            id: 'pr_150',
            name: 'Легенда',
            description: 'Достиг 1ПМ 150 кг в любом упражнении',
            icon: '👑',
            check: (data) => {
                return data.exercises.some(ex => (ex.pr || 0) >= 150);
            }
        },
        {
            id: 'weight_loss_5',
            name: 'Стройнее на 5 кг',
            description: 'Сбросил 5 кг от начального веса',
            icon: '⬇️',
            check: (data) => {
                const user = data.user;
                if (!user || !user.startWeight) return false;
                return (user.startWeight - user.weight) >= 5;
            }
        },
        {
            id: 'weight_gain_5',
            name: 'Масса +5 кг',
            description: 'Набрал 5 кг от начального веса',
            icon: '⬆️',
            check: (data) => {
                const user = data.user;
                if (!user || !user.startWeight) return false;
                return (user.weight - user.startWeight) >= 5;
            }
        },
        {
            id: 'ten_workouts',
            name: 'Дисциплина',
            description: 'Провел 10 тренировок',
            icon: '🎯',
            check: (data) => data.checkIns.length >= 10
        },
        {
            id: 'fifty_workouts',
            name: 'Ветеран',
            description: 'Провел 50 тренировок',
            icon: '⭐',
            check: (data) => data.checkIns.length >= 50
        },
        {
            id: 'hundred_workouts',
            name: 'Легенда зала',
            description: 'Провел 100 тренировок',
            icon: '🏅',
            check: (data) => data.checkIns.length >= 100
        }
    ],

    getUserAchievements() {
        const data = Storage.data;
        if (!data.achievements) {
            data.achievements = { earned: [] };
            Storage.save();
        }
        return data.achievements;
    },

    checkAll() {
        const data = Storage.data;
        const earned = this.getUserAchievements().earned || [];
        const newAchievements = [];

        this.list.forEach(ach => {
            if (!earned.includes(ach.id) && ach.check(data)) {
                earned.push(ach.id);
                newAchievements.push(ach);
            }
        });

        if (newAchievements.length > 0) {
            data.achievements.earned = earned;
            Storage.save();
            this.showNewAchievements(newAchievements);
        }

        return newAchievements;
    },

    showNewAchievements(achievements) {
        let message = '🏆 НОВЫЕ ДОСТИЖЕНИЯ! 🏆\n\n';
        achievements.forEach(ach => {
            message += `${ach.icon} ${ach.name}\n`;
            message += `   ${ach.description}\n\n`;
        });
        alert(message);
        window.dispatchEvent(new Event('dataUpdated'));
    },

    getAllWithStatus() {
        const earned = this.getUserAchievements().earned || [];
        return this.list.map(ach => ({
            ...ach,
            earned: earned.includes(ach.id)
        }));
    },

    getCount() {
        const earned = this.getUserAchievements().earned || [];
        return earned.length;
    },

    renderWidget() {
        const container = document.getElementById('achievementsWidget');
        if (!container) return;

        const total = this.list.length;
        const earned = this.getUserAchievements().earned || [];
        const count = earned.length;
        const recent = this.list.filter(ach => earned.includes(ach.id)).slice(-3);

        let html = `
            <div class="achievements-widget" onclick="document.getElementById('achievementsModal').classList.add('active')">
                <div class="achievements-header">
                    <span>🏆 Достижения</span>
                    <span class="achievements-count">${count}/${total}</span>
                </div>
                <div class="achievements-progress">
                    <div class="achievements-progress-bar" style="width: ${(count/total)*100}%"></div>
                </div>
                <div class="achievements-icons">
        `;

        if (recent.length > 0) {
            recent.forEach(ach => {
                html += `<span class="achievement-icon" title="${ach.name}">${ach.icon}</span>`;
            });
        } else {
            html += `<span class="achievement-empty">Нет достижений</span>`;
        }

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    renderFullPage() {
        const container = document.getElementById('achievementsFullList');
        if (!container) return;

        const all = this.getAllWithStatus();
        const earned = all.filter(a => a.earned);
        const locked = all.filter(a => !a.earned);

        let html = `
            <div style="margin-bottom:20px;">
                <h3 style="color:#FF8888;">🏆 Достижения</h3>
                <p style="color:#888; font-size:13px;">Получено: ${earned.length} из ${all.length}</p>
            </div>
        `;

        if (earned.length > 0) {
            html += `<div class="achievements-section"><h4>✅ Получены</h4>`;
            earned.forEach(ach => {
                html += `
                    <div class="achievement-item earned">
                        <span class="achievement-icon">${ach.icon}</span>
                        <div>
                            <div class="achievement-name">${ach.name}</div>
                            <div class="achievement-desc">${ach.description}</div>
                        </div>
                        <span class="achievement-badge">✅</span>
                    </div>
                `;
            });
            html += `</div>`;
        }

        if (locked.length > 0) {
            html += `<div class="achievements-section"><h4>🔒 Не получены</h4>`;
            locked.forEach(ach => {
                html += `
                    <div class="achievement-item locked">
                        <span class="achievement-icon">${ach.icon}</span>
                        <div>
                            <div class="achievement-name">${ach.name}</div>
                            <div class="achievement-desc">${ach.description}</div>
                        </div>
                        <span class="achievement-badge">🔒</span>
                    </div>
                `;
            });
            html += `</div>`;
        }

        container.innerHTML = html;
    }
};
