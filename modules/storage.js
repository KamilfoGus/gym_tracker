window.Storage = {
    data: { user: null, exercises: [], weightHistory: [], checkIns: [], goals: { active: null, history: [] } },
    
    load() {
        const saved = localStorage.getItem('gym_tracker_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.data = { ...this.data, ...parsed };
            } catch(e) {}
        }
        if (!this.data.exercises || this.data.exercises.length === 0) {
            this.data.exercises = [
                { id: '1', name: 'Жим лежа', sets: [], pr: 0 },
                { id: '2', name: 'Присед', sets: [], pr: 0 },
                { id: '3', name: 'Становая тяга', sets: [], pr: 0 }
            ];
        }
        if (!this.data.weightHistory) this.data.weightHistory = [];
        if (!this.data.checkIns) this.data.checkIns = [];
        if (!this.data.goals) this.data.goals = { active: null, history: [] };
        return this.data;
    },
    
    save() { localStorage.setItem('gym_tracker_data', JSON.stringify(this.data)); },
    
    getUser() { return this.data.user; },
    setUser(user) { this.data.user = user; this.save(); },
    
    getExercises() { return this.data.exercises; },
    setExercises(exercises) { this.data.exercises = exercises; this.save(); },
    
    getWeightHistory() { return this.data.weightHistory; },
    addWeightEntry(date, weight) { this.data.weightHistory.push({ date, weight }); this.save(); },
    
    getCheckIns() { return this.data.checkIns; },
    addCheckIn(date) { this.data.checkIns.push(date); this.save(); },
    
    isCheckedToday() { return this.data.checkIns.includes(new Date().toISOString().split('T')[0]); },
    
    getGoals() { return this.data.goals; },
    setGoals(goals) { this.data.goals = goals; this.save(); }
};
