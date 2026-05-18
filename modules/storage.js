/**
 * Модуль хранения данных
 * Работает с localStorage и Telegram Cloud Storage
 */

window.Storage = {
    data: {
        user: null,
        exercises: [],
        weightHistory: [],
        checkIns: []
    },

    // Загрузка данных
    load() {
        // Загружаем из localStorage
        const saved = localStorage.getItem('gym_tracker_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.data = { ...this.data, ...parsed };
            } catch(e) {}
        }

        // Данные по умолчанию
        if (!this.data.exercises || this.data.exercises.length === 0) {
            this.data.exercises = [
                { id: '1', name: 'Жим лежа', sets: [], pr: 0 },
                { id: '2', name: 'Присед', sets: [], pr: 0 },
                { id: '3', name: 'Становая тяга', sets: [], pr: 0 }
            ];
        }

        if (!this.data.weightHistory) this.data.weightHistory = [];
        if (!this.data.checkIns) this.data.checkIns = [];

        return this.data;
    },

    // Сохранение данных
    save() {
        localStorage.setItem('gym_tracker_data', JSON.stringify(this.data));
        
        // Синхронизация с Telegram Cloud
        this.syncToTelegram();
    },

    // Синхронизация с Telegram Cloud Storage
    syncToTelegram() {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
            window.Telegram.WebApp.CloudStorage.setItem(
                'gym_tracker_data', 
                JSON.stringify(this.data),
                (err) => { if (err) console.log('Sync error:', err); }
            );
        }
    },

    // Загрузка из Telegram Cloud
    loadFromTelegram(callback) {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
            window.Telegram.WebApp.CloudStorage.getItem('gym_tracker_data', (err, value) => {
                if (!err && value) {
                    try {
                        const cloudData = JSON.parse(value);
                        this.data = { ...this.data, ...cloudData };
                        localStorage.setItem('gym_tracker_data', JSON.stringify(this.data));
                        if (callback) callback(true);
                    } catch(e) {}
                } else if (callback) {
                    callback(false);
                }
            });
        }
    },

    // Геттеры
    getUser() { return this.data.user; },
    setUser(user) { this.data.user = user; this.save(); },

    getExercises() { return this.data.exercises; },
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

    // Вспомогательные методы
    isCheckedToday() {
        const today = new Date().toISOString().split('T')[0];
        return this.data.checkIns.includes(today);
    },

    getLastWeight() {
        if (this.data.weightHistory.length === 0) return null;
        return this.data.weightHistory[this.data.weightHistory.length - 1];
    }
};