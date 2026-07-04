window.Storage = {
    data: { 
        user: null, 
        exercises: [], 
        weightHistory: [], 
        checkIns: [], 
        goals: { active: null, history: [] },
        achievements: { earned: [] }
    },
    
    load() {
        const saved = localStorage.getItem('gym_tracker_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.data = { ...this.data, ...parsed };
            } catch(e) {
                console.log('Ошибка парсинга:', e);
            }
        }
        
        if (!this.data.exercises || this.data.exercises.length === 0) {
            console.log('Создаём базовые упражнения');
            this.data.exercises = [
                { id: '1', name: 'Жим лежа', sets: [], pr: 0 },
                { id: '2', name: 'Присед', sets: [], pr: 0 },
                { id: '3', name: 'Становая тяга', sets: [], pr: 0 }
            ];
            this.save();
        }
        
        if (!this.data.weightHistory) this.data.weightHistory = [];
        if (!this.data.checkIns) this.data.checkIns = [];
        if (!this.data.goals) this.data.goals = { active: null, history: [] };
        if (!this.data.achievements) this.data.achievements = { earned: [] };
        
        console.log('Загружено упражнений:', this.data.exercises.length);
        return this.data;
    },
    
    save() { 
        localStorage.setItem('gym_tracker_data', JSON.stringify(this.data));
        this.syncToCloud();
        console.log('Данные сохранены локально и в облаке');
    },
    
    syncToCloud() {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
            const cloud = window.Telegram.WebApp.CloudStorage;
            const data = JSON.stringify(this.data);
            cloud.setItem('gym_tracker_data', data, (err) => {
                if (err) console.log('Ошибка синхронизации с облаком:', err);
                else console.log('✅ Данные синхронизированы с облаком Telegram');
            });
        }
    },

    loadFromCloud(callback) {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
            const cloud = window.Telegram.WebApp.CloudStorage;
            cloud.getItem('gym_tracker_data', (err, value) => {
                if (!err && value) {
                    try {
                        const cloudData = JSON.parse(value);
                        this.data = { ...this.data, ...cloudData };
                        localStorage.setItem('gym_tracker_data', JSON.stringify(this.data));
                        console.log('✅ Данные загружены из облака Telegram');
                        if (callback) callback(true);
                    } catch(e) {
                        console.log('Ошибка парсинга облачных данных:', e);
                        if (callback) callback(false);
                    }
                } else {
                    console.log('Нет данных в облаке или ошибка доступа');
                    if (callback) callback(false);
                }
            });
        } else {
            console.log('CloudStorage недоступен, используем localStorage');
            if (callback) callback(false);
        }
    },
    
    getUser() { return this.data.user; },
    setUser(user) { this.data.user = user; this.save(); },
    
    getExercises() { 
        if (!this.data.exercises || this.data.exercises.length === 0) {
            this.data.exercises = [
                { id: '1', name: 'Жим лежа', sets: [], pr: 0 },
                { id: '2', name: 'Присед', sets: [], pr: 0 },
                { id: '3', name: 'Становая тяга', sets: [], pr: 0 }
            ];
            this.save();
        }
        return this.data.exercises; 
    },
    setExercises(exercises) { this.data.exercises = exercises; this.save(); },
    
    getWeightHistory() { return this.data.weightHistory; },
    addWeightEntry(date, weight) { 
        this.data.weightHistory.push({ date, weight }); 
        this.save();
    },
    
    getCheckIns() { return this.data.checkIns; },
    addCheckIn(date) { 
        this.data.checkIns.push(date); 
        this.save();
    },
    
    isCheckedToday() { 
        return this.data.checkIns.includes(new Date().toISOString().split('T')[0]); 
    },
    
    getGoals() { 
        if (!this.data.goals) this.data.goals = { active: null, history: [] };
        return this.data.goals; 
    },
    setGoals(goals) { this.data.goals = goals; this.save(); },
    
    getAchievements() {
        if (!this.data.achievements) this.data.achievements = { earned: [] };
        return this.data.achievements;
    },
    setAchievements(achievements) { this.data.achievements = achievements; this.save(); }
};
