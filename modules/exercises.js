window.Exercises = {
    currentExerciseId: null,
    currentSetId: null,
    
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
            const newSet = { 
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0], 
                weight, 
                reps 
            };
            ex.sets.push(newSet);
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
        const w = parseFloat(document.getElementById('calcWeight').value);
        const r = parseInt(document.getElementById('calcReps').value);
        if (!w || !r) { alert('Введите данные'); return; }
        const exercises = Storage.getExercises();
        const ex = exercises.find(e => e.id === this.currentCalculatorId);
        if (ex) {
            ex.sets.push({ 
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0], 
                weight: w, 
                reps: r 
            });
            const oneRM = this.calculateOneRM(w, r);
            if (!ex.pr || oneRM > ex.pr) ex.pr = oneRM;
            Storage.setExercises(exercises);
        }
        document.getElementById('oneRMModal').classList.remove('active');
        window.dispatchEvent(new Event('dataUpdated'));
    },
    
    // НОВЫЙ МЕТОД: Показать детальную историю с кнопками редактирования/удаления
    showHistory(exerciseId) {
        const ex = Storage.getExercises().find(e => e.id === exerciseId);
        if (!ex) return;
        
        let message = `📊 ${ex.name}\n`;
        message += `🏆 Лучший 1ПМ: ${ex.pr || 0} кг\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        if (ex.sets.length === 0) {
            message += `Нет записей о тренировках\n\n`;
            message += `Нажмите "Добавить подход", чтобы начать`;
            alert(message);
            return;
        }
        
        message += `📝 СПИСОК ПОДХОДОВ:\n\n`;
        
        ex.sets.slice().reverse().forEach((set, idx) => {
            const oneRM = this.calculateOneRM(set.weight, set.reps);
            const originalIndex = ex.sets.length - idx;
            message += `${originalIndex}. ${set.date}\n`;
            message += `   ${set.weight}кг × ${set.reps} раз\n`;
            message += `   1ПМ: ${oneRM}кг\n`;
            message += `   🆔 ID: ${set.id.substring(0, 8)}...\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        });
        
        message += `\n✏️ Чтобы редактировать или удалить подход,\n`;
        message += `   нажмите "Редактировать" и введите ID подхода`;
        
        // Показываем через confirm с возможностью редактирования
        const action = confirm(`${message}\n\n─────────────────────\nХотите РЕДАКТИРОВАТЬ или УДАЛИТЬ подход?\n\n"OK" - Редактировать\n"Отмена" - Удалить`);
        
        if (action) {
            // Редактирование
            const setId = prompt('Введите ID подхода (первые 8 символов из списка выше):');
            if (setId) {
                const foundSet = ex.sets.find(s => s.id.startsWith(setId));
                if (foundSet) {
                    this.editSet(exerciseId, foundSet.id);
                } else {
                    alert('❌ Подход с таким ID не найден!');
                }
            }
        } else {
            // Удаление
            const setId = prompt('Введите ID подхода для УДАЛЕНИЯ (первые 8 символов):');
            if (setId) {
                const foundSet = ex.sets.find(s => s.id.startsWith(setId));
                if (foundSet && confirm(`Удалить подход: ${foundSet.weight}кг × ${foundSet.reps} (${foundSet.date})?`)) {
                    ex.sets = ex.sets.filter(s => s.id !== foundSet.id);
                    // Пересчитываем PR
                    if (ex.sets.length > 0) {
                        ex.pr = Math.max(...ex.sets.map(s => this.calculateOneRM(s.weight, s.reps)));
                    } else {
                        ex.pr = 0;
                    }
                    Storage.setExercises(Storage.getExercises());
                    window.dispatchEvent(new Event('dataUpdated'));
                    alert('✅ Подход удалён!');
                } else if (!foundSet) {
                    alert('❌ Подход с таким ID не найден!');
                }
            }
        }
    },
    
    // НОВЫЙ МЕТОД: Редактирование подхода
    editSet(exerciseId, setId) {
        const exercises = Storage.getExercises();
        const ex = exercises.find(e => e.id === exerciseId);
        if (!ex) return;
        
        const set = ex.sets.find(s => s.id === setId);
        if (!set) {
            alert('❌ Подход не найден!');
            return;
        }
        
        const newWeight = prompt(`Редактировать вес (было: ${set.weight} кг):`, set.weight);
        const newReps = prompt(`Редактировать повторения (было: ${set.reps}):`, set.reps);
        
        if (newWeight && !isNaN(parseFloat(newWeight))) set.weight = parseFloat(newWeight);
        if (newReps && !isNaN(parseInt(newReps))) set.reps = parseInt(newReps);
        
        // Пересчитываем PR
        if (ex.sets.length > 0) {
            ex.pr = Math.max(...ex.sets.map(s => this.calculateOneRM(s.weight, s.reps)));
        } else {
            ex.pr = 0;
        }
        
        Storage.setExercises(exercises);
        window.dispatchEvent(new Event('dataUpdated'));
        alert('✅ Подход обновлён!');
    },
    
    updateUI() {
        const exercises = Storage.getExercises();
        const container = document.getElementById('exercisesList');
        if (container) {
            container.innerHTML = '';
            exercises.slice(0,3).forEach(ex => {
                const last = ex.sets[ex.sets.length-1];
                const progress = this.calcProgress(ex);
                container.innerHTML += `
                    <div class="exercise-item" onclick="window.Exercises.showHistory('${ex.id}')">
                        <div class="exercise-name">${this.escapeHtml(ex.name)}</div>
                        <div class="exercise-stats">${last ? last.weight+'кг × '+last.reps + ' (' + last.date + ')' : 'Нет записей'}</div>
                        <div class="exercise-stats exercise-pr">🏆 PR: ${ex.pr || 0} кг</div>
                        <div class="exercise-progress"><div class="exercise-progress-bar" style="width: ${progress}%"></div></div>
                        <div class="exercise-stats" style="margin-top:6px;">📈 Прогресс: ${progress}%</div>
                    </div>
                `;
            });
        }
        
        const full = document.getElementById('fullExercisesList');
        if (full) {
            full.innerHTML = '';
            exercises.forEach(ex => {
                const progress = this.calcProgress(ex);
                full.innerHTML += `
                    <div class="exercise-item">
                        <div class="exercise-name">${this.escapeHtml(ex.name)}</div>
                        <div class="exercise-stats">📊 Всего подходов: ${ex.sets.length}</div>
                        <div class="exercise-stats">🏆 Лучший 1ПМ: ${ex.pr || 0} кг</div>
                        <div class="exercise-progress"><div class="exercise-progress-bar" style="width: ${progress}%"></div></div>
                        <button class="btn-secondary" style="margin-top:12px;" onclick="window.Exercises.showAddSet('${ex.id}','${this.escapeHtml(ex.name)}')">
                            ➕ Добавить подход
                        </button>
                        <button class="btn-secondary" style="margin-top:8px;" onclick="window.Exercises.showCalculator('${ex.id}')">
                            📐 Калькулятор 1RM
                        </button>
                        <button class="btn-secondary" style="margin-top:8px;" onclick="window.Exercises.showHistory('${ex.id}')">
                            📊 История / Редактировать
                        </button>
                    </div>
                `;
            });
        }
    },
    
    calcProgress(ex) {
        if (ex.sets.length < 2) return 0;
        const first = Math.max(...ex.sets.slice(0,2).map(s => this.calculateOneRM(s.weight, s.reps)));
        const last = Math.max(...ex.sets.slice(-2).map(s => this.calculateOneRM(s.weight, s.reps)));
        const progress = ((last - first) / first) * 100;
        return Math.max(0, Math.min(100, Math.round(progress)));
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
