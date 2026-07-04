/**
 * Модуль достижений (ачивки)
 * Автоматически отслеживает прогресс и выдаёт награды
 */

window.Achievements = {
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
            name:
