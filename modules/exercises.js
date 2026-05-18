/**
 * Модуль упражнений
 * Добавление упражнений, подходов, расчет 1RM, прогресс
 */

window.Exercises = {
    currentExerciseId: null,
    currentCalculatorExerciseId: null,

    init() {
        document.getElementById('addExerciseBtn').onclick = () => this.showAddModal();
        document.getElementById('addExerciseBtn2').onclick = () => this.showAddModal();
        
        // Привязываем глобальные функции
        window.saveSet = () => this.saveSet();
        window.createExercise = () => this.create();
    },

    showAddModal() {
        document.getElementById('newExerciseName').value = '';
        document.getElementById('addExerciseModal').classList.add('active');
    },

    create() {
        const name = document.getElementById('newExerciseName').value.trim();
        if (!name) {
            alert('Введите название упражнения');
            return;
        }

        const exercises = Storage.getExercises();
        exercises.push({
            id: Date.now().toString(),
            name: name,
            sets: [],
            pr: 0,
            createdAt: new Date().toISOString()
        });
        Storage.setExercises(exercises);

        document.getElementById('addExerciseModal').classList.remove('active');
        window.dispatchEvent(new Event('dataUpdated'));
    },

    showAddSet(exerciseId, exerciseName) {
        this.currentExerciseId = exerciseId;
        document.getElementById('modalExerciseName').textContent = `Добавить: ${exerciseName}`;
        document.getElementById('setWeight').value = '';
        document.getElementById('setReps').value = '';
        document.getElementById('addSetModal').classList.add('active');
    },

    saveSet() {
        const weight = parseFloat(document.getElementById('setWeight').value);
        const reps = parseInt(document.getElementById('setReps').value);

        if (!weight || !reps || weight <= 0 || reps <= 0) {
            alert('Введите корректные вес и повторения');
            return;
        }

        const exercises = Storage.getExercises();
        const exercise = exercises.find(e => e.id === this.currentExerciseId);
        
        if (exercise) {
            const newSet = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString(),
                weight: weight,
                reps: reps
            };
            exercise.sets.push(newSet);

            // Расчет и обновление PR (1ПМ)
            const oneRM = this.calculateOneRM(weight, reps);
            if (!exercise.pr || oneRM > exercise.pr) {
                exercise.pr = oneRM;
            }

            Storage.setExercises(exercises);
        }

        document.getElementById('addSetModal').classList.remove('active');
        window.dispatchEvent(new Event('dataUpdated'));
    },

    calculateOneRM(weight, reps) {
        // Формула Бжицки: вес * (1 + повторения/30)
        return Math.round(weight * (1 + reps / 30));
    },

    calculatePR(exercise) {
        if (!exercise.sets || exercise.sets.length === 0) return 0;
        return Math.max(...exercise.sets.map(s => this.calculateOneRM(s.weight, s.reps)));
    },

    calculateProgress(exercise) {
        if (!exercise.sets || exercise.sets.length < 2) return 0;
        
        const firstPR = this.calculateOneRM(exercise.sets[0].weight, exercise.sets[0].reps);
        const lastPR = this.calculateOneRM(
            exercise.sets[exercise.sets.length - 1].weight,
            exercise.sets[exercise.sets.length - 1].reps
        );
        
        const progress = ((lastPR - firstPR) / firstPR) * 100;
        return Math.round(Math.max(0, Math.min(100, progress)));
    },

    showCalculator(exerciseId) {
        this.currentCalculatorExerciseId = exerciseId;
        document.getElementById('calcWeight').value = '';
        document.getElementById('calcReps').value = '';
        document.getElementById('calcResult').innerHTML = 'Введите вес и повторения';
        document.getElementById('oneRMModal').classList.add('active');

        // Автоматический расчет при вводе
        document.getElementById('calcWeight').oninput = () => this.calculateAndDisplayRM();
        document.getElementById('calcReps').oninput = () => this.calculateAndDisplayRM();
    },

    calculateAndDisplayRM() {
        const weight = parseFloat(document.getElementById('calcWeight').value);
        const reps = parseInt(document.getElementById('calcReps').value);
        
        if (weight && reps && weight > 0 && reps > 0) {
            const oneRM = this.calculateOneRM(weight, reps);
            document.getElementById('calcResult').innerHTML = `🏆 Ваш 1ПМ: <span style="color: #FF4444; font-size: 22px;">${oneRM}</span> кг`;
        } else {
            document.getElementById('calcResult').innerHTML = 'Введите вес и повторения';
        }
    },

    saveFromCalculator() {
        const weight = parseFloat(document.getElementById('calcWeight').value);
        const reps = parseInt(document.getElementById('calcReps').value);

        if (!weight || !reps) {
            alert('Введите вес и повторения');
            return;
        }

        if (this.currentCalculatorExerciseId) {
            const exercises = Storage.getExercises();
            const exercise = exercises.find(e => e.id === this.currentCalculatorExerciseId);
            
            if (exercise) {
                const newSet = {
                    id: Date.now().toString(),
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString(),
                    weight: weight,
                    reps: reps
                };
                exercise.sets.push(newSet);

                const oneRM = this.calculateOneRM(weight, reps);
                if (!exercise.pr || oneRM > exercise.pr) {
                    exercise.pr = oneRM;
                }

                Storage.setExercises(exercises);
                alert(`✅ Сохранено! ${weight}кг × ${reps} = 1ПМ ${oneRM}кг`);
            }
        }

        document.getElementById('oneRMModal').classList.remove('active');
        window.dispatchEvent(new Event('dataUpdated'));
    },

    showExerciseHistory(exerciseId) {
        const exercises = Storage.getExercises();
        const ex = exercises.find(e => e.id === exerciseId);
        if (!ex) return;

        const pr = ex.pr || this.calculatePR(ex);
        const progress = this.calculateProgress(ex);
        
        let message = `📊 ИСТОРИЯ: ${ex.name}\n\n`;
        message += `🏆 Лучший 1ПМ: ${pr} кг\n`;
        message += `📈 Общий прогресс: ${progress}%\n`;
        message += `📝 Всего подходов: ${ex.sets.length}\n\n`;
        message += `📋 ПОСЛЕДНИЕ ПОДХОДЫ:\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n`;

        ex.sets.slice(-10).reverse().forEach(set => {
            const oneRM = this.calculateOneRM(set.weight, set.reps);
            message += `📅 ${set.date}\n`;
            message += `   ${set.weight}кг × ${set.reps} раз\n`;
            message += `   → 1ПМ: ${oneRM}кг\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        });

        if (ex.sets.length === 0) message += "Нет записей о тренировках";

        alert(message);
    },

    updateUI() {
        this.updateShortList();
        this.updateFullList();
    },

    updateShortList() {
        const container = document.getElementById('exercisesList');
        if (!container) return;

        const exercises = Storage.getExercises();
        container.innerHTML = '';

        exercises.slice(0, 3).forEach(ex => {
            const lastSet = ex.sets[ex.sets.length - 1];
            const lastSetText = lastSet ? `${lastSet.weight}кг × ${lastSet.reps} (${lastSet.date})` : 'Нет записей';
            const pr = ex.pr || this.calculatePR(ex);
            const progress = this.calculateProgress(ex);

            const div = document.createElement('div');
            div.className = 'exercise-item';
            div.innerHTML = `
                <div class="exercise-name">${this.escapeHtml(ex.name)}</div>
                <div class="exercise-stats">${lastSetText}</div>
                <div class="exercise-stats exercise-pr">🏆 PR: ${pr} кг</div>
                <div class="exercise-progress">
                    <div class="exercise-progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="exercise-stats" style="margin-top: 6px;">📈 Прогресс: ${progress}%</div>
            `;
            div.onclick = () => this.showExerciseHistory(ex.id);
            container.appendChild(div);
        });
    },

    updateFullList() {
        const container = document.getElementById('fullExercisesList');
        if (!container) return;

        const exercises = Storage.getExercises();
        container.innerHTML = '';

        exercises.forEach(ex => {
            const pr = ex.pr || this.calculatePR(ex);
            const progress = this.calculateProgress(ex);

            const div = document.createElement('div');
            div.className = 'exercise-item';
            div.innerHTML = `
                <div class="exercise-name">${this.escapeHtml(ex.name)}</div>
                <div class="exercise-stats">📊 Всего подходов: ${ex.sets.length}</div>
                <div class="exercise-stats">🏆 Лучший 1ПМ: ${pr} кг</div>
                <div class="exercise-progress">
                    <div class="exercise-progress-bar" style="width: ${progress}%"></div>
                </div>
                <button class="btn-secondary" style="margin-top: 12px;" onclick="window.Exercises.showAddSet('${ex.id}', '${this.escapeHtml(ex.name)}')">
                    ➕ Добавить подход
                </button>
                <button class="btn-secondary" style="margin-top: 8px;" onclick="window.Exercises.showCalculator('${ex.id}')">
                    📐 Калькулятор 1RM
                </button>
                <button class="btn-secondary" style="margin-top: 8px;" onclick="window.Exercises.showExerciseHistory('${ex.id}')">
                    📊 История
                </button>
            `;
            container.appendChild(div);
        });
    },

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
};