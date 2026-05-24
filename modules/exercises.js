window.Exercises = {
    currentExerciseId: null,
    currentCalculatorId: null,
    
    init() {
        document.getElementById('addExerciseBtn').onclick = () => this.showAddModal();
        document.getElementById('addExerciseBtn2').onclick = () => this.showAddModal();
    },
    
    showAddModal() { 
        document.getElementById('newExerciseName').value = ''; 
        document.getElementById('addExerciseModal').classList.add('active'); 
    },
    
    create() {
        const name = document.getElementById('newExerciseName').value.trim();
        if (!name) { alert('Введите название'); return; }
        const exercises = Storage.getExercises();
        exercises.push({ id: Date.now().toString(), name, sets: [], pr: 0 });
        Storage.setExercises(exercises);
        document.getElementById('addExerciseModal').classList.remove('active');
        window.dispatchEvent(new Event('dataUpdated'));
    },
    
    showAddSet(id, name) {
        this.currentExerciseId = id;
        document.getElementById('modalExerciseName').textContent = `Добавить: ${name}`;
        document.getElementById('setWeight').value = '';
        document.getElementById('setReps').value = '';
        document.getElementById('addSetModal').classList.add('active');
    },
    
    saveSet() {
        const weight = parseFloat(document.getElementById('setWeight').value);
        const reps = parseInt(document.getElementById('setReps').value);
        if (!weight || !reps) { alert('Введите данные'); return; }
        const exercises = Storage.getExercises();
        const ex = exercises.find(e => e.id === this.currentExerciseId);
        if (ex) {
            ex.sets.push({ 
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0], 
                weight, reps 
            });
            const oneRM = Math.round(weight * (1 + reps/30));
            if (!ex.pr || oneRM > ex.pr) ex.pr = oneRM;
            Storage.setExercises(exercises);
        }
        document.getElementById('addSetModal').classList.remove('active');
        window.dispatchEvent(new Event('dataUpdated'));
    },
    
    calculateOneRM(w, r) { return Math.round(w * (1 + r/30)); },
    
    showCalculator(id) {
        this.currentCalculatorId = id;
        document.getElementById('calcWeight').value = '';
        document.getElementById('calcReps').value = '';
        document.getElementById('calcResult').innerHTML = 'Введите вес и повторения';
        document.getElementById('oneRMModal').classList.add('active');
        document.getElementById('calcWeight').oninput = () => this.calcAndDisplay();
        document.getElementById('calcReps').oninput = () => this.calcAndDisplay();
    },
    
    calcAndDisplay() {
        const w = parseFloat(document.getElementById('calcWeight').value);
        const r = parseInt(document.getElementById('calcReps').value);
        if (w && r) {
            document.getElementById('calcResult').innerHTML = `🏆 1ПМ: <span style="color:#FF4444">${this.calculateOneRM(w, r)}</span> кг`;
        } else {
            document.getElementById('calcResult').innerHTML = 'Введите вес и повторения';
        }
    },
    
    saveFromCalculator() {
        const
