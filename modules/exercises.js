window.Exercises = {
    currentExerciseId: null,
    currentCalculatorId: null,
    currentSetForEdit: null,
    currentExerciseForEdit: null,
    
    baseExerciseIds: ['1', '2', '3'],
    
    init() {
        console.log('Exercises.init() вызван');
        
        const addBtn1 = document.getElementById('addExerciseBtn');
        const addBtn2 = document.getElementById('addExerciseBtn2');
        
        if (addBtn1) addBtn1.onclick = () => this.showAddModal();
        if (addBtn2) addBtn2.onclick = () => this.showAddModal();
    },
    
    showAddModal() { 
        document.getElementById('newExerciseName').value = ''; 
        document.getElementById('addExerciseModal').classList.add('active'); 
    },
    
    create() {
        const name = document.getElementById('newExerciseName').value.trim();
        if (!name) { 
            alert('Введите название'); 
            return; 
        }
        
        const exercises = Storage.getExercises();
        
        if (exercises.some(e => e.name.toLowerCase() === name.toLowerCase())) {
            alert('❌ Упражнение с таким названием уже существует!');
            return;
        }
        
        exercises.push({ 
            id: Date.now().toString(), 
            name: name, 
            sets: [], 
            pr: 0,
            isCustom: true
        });
        Storage.setExercises(exercises);
        
        document.getElementById('addExerciseModal').classList.remove('active');
        window.dispatchEvent(new Event('dataUpdated'));
        alert(`✅ Упражнение "${name}" добавлено!`);
    },
    
    deleteExercise(exerciseId, exerciseName) {
        if (this.baseExerciseIds.includes(exerciseId)) {
            alert('❌ Базовые упражнения нельзя удалить!');
            return;
        }
        
        if (confirm(`Удалить упражнение "${exerciseName}"?\n\nВсе данные о подходах будут потеряны!`)) {
            const exercises = Storage.getExercises();
            const newExercises = exercises.filter(e => e.id !== exerciseId);
            Storage.setExercises(newExercises);
            window.dispatchEvent(new Event('dataUpdated'));
            alert(`✅ Упражнение "${exerciseName}" удалено!`);
        }
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
        
        if (!weight || !reps) { 
            alert('Введите данные'); 
            return; 
        }
        
        const exercises = Storage.getExercises();
        const ex = exercises.find(e => e.id === this.currentExerciseId);
        
        if (ex) {
            ex.sets.push({ 
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0], 
                weight: weight, 
                reps: reps 
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
            const oneRM = this.calculateOneRM(w, r);
            document.getElementById('calcResult').innerHTML = `🏆 1ПМ: <span style="color:#FF4444; font-size:24px;">${oneRM}</span> кг`;
        } else {
            document.getElementById('calcResult').innerHTML = 'Введите вес и повторения';
        }
    },
    
    saveFromCalculator() {
        const w = parseFloat(document.getElementById('calcWeight').value);
        const r = parseInt(document.getElementById('calcReps').value);
        
        if (!w || !r) { 
            alert('Введите данные'); 
            return; 
        }
        
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
            alert(`✅ Сохранено! ${w}кг × ${r} = 1ПМ ${oneRM}кг`);
        }
        
        document.getElementById('oneRMModal').classList.remove('active');
        window.dispatchEvent(new Event('dataUpdated'));
    },
    
    // НОВЫЙ МЕТОД: Показать красивое окно с историей
    showHistory(exerciseId) {
        const ex = Storage.getExercises().find(e => e.id === exerciseId);
        if (!ex) return;
        
        this.currentExerciseForEdit = ex;
        
        if (ex.sets.length === 0) {
            alert(`📊 ${ex.name}\n\nНет записей о тренировках\n\nНажмите "Добавить подход" чтобы начать`);
            return;
        }
        
        // Заполняем модальное окно
        const container = document.getElementById('historySetsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Показываем последние 20 подходов (сначала новые)
        const recentSets = [...ex.sets].reverse();
        
        recentSets.forEach((set, idx) => {
            const oneRM = this.calculateOneRM(set.weight, set.reps);
            const date = new Date(set.date).toLocaleDateString('ru-RU');
            
            const setDiv = document.createElement('div');
            setDiv.className = 'history-set-item';
            setDiv.innerHTML = `
                <div class="history-set-header">
                    <span class="history-set-date">📅 ${date}</span>
                    <span class="history-set-id">🆔 ${set.id.substring(0, 8)}</span>
                </div>
                <div class="history-set-data">
                    <span class="history-set-weight">${set.weight} кг</span>
                    <span class="history-set-reps">× ${set.reps} раз</span>
                    <span class="history-set-1rm">🏆 1ПМ: ${oneRM} кг</span>
                </div>
                <div class="history-set-actions">
                    <button class="btn-edit-set" onclick="window.Exercises.openEditModal('${set.id}')">✏️ Редактировать</button>
                    <button class="btn-delete-set" onclick="window.Exercises.deleteSet('${set.id}')">🗑️ Удалить</button>
                </div>
            `;
            container.appendChild(setDiv);
        });
        
        document.getElementById('historyExerciseName').textContent = ex.name;
        document.getElementById('historyExercisePr').textContent = `${ex.pr || 0} кг`;
        document.getElementById('historyTotalSets').textContent = `${ex.sets.length} подходов`;
        document.getElementById('historyModal').classList.add('active');
    },
    
    // Открыть модалку редактирования
    openEditModal(setId) {
        const ex = this.currentExerciseForEdit;
        if (!ex) return;
        
        const set = ex.sets.find(s => s.id === setId);
        if (!set) return;
        
        this.currentSetForEdit = set;
        
        document.getElementById('editSetWeight').value = set.weight;
        document.getElementById('editSetReps').value = set.reps;
        document.getElementById('editSetId').textContent = set.id.substring(0, 8);
        document.getElementById('editSetDate').textContent = new Date(set.date).toLocaleDateString('ru-RU');
        
        document.getElementById('editSetModal').classList.add('active');
    },
    
    // Сохранить редактирование
    saveEditSet() {
        if (!this.currentSetForEdit || !this.currentExerciseForEdit) return;
        
        const newWeight = parseFloat(document.getElementById('editSetWeight').value);
        const newReps = parseInt(document.getElementById('editSetReps').value);
        
        if (!newWeight || !newReps) {
            alert('Введите корректные данные');
            return;
        }
        
        this.currentSetForEdit.weight = newWeight;
        this.currentSetForEdit.reps = newReps;
        
        // Пересчитываем PR
        const ex = this.currentExerciseForEdit;
        if (ex.sets.length > 0) {
            ex.pr = Math.max(...ex.sets.map(s => this.calculateOneRM(s.weight, s.reps)));
        } else {
            ex.pr = 0;
        }
        
        Storage.setExercises(Storage.getExercises());
        window.dispatchEvent(new Event('dataUpdated'));
        
        document.getElementById('editSetModal').classList.remove('active');
        this.showHistory(ex.id);
        alert('✅ Подход обновлён!');
    },
    
    // Удалить подход
    deleteSet(setId) {
        if (!this.currentExerciseForEdit) return;
        
        if (confirm('Удалить этот подход?')) {
            const ex = this.currentExerciseForEdit;
            ex.sets = ex.sets.filter(s => s.id !== setId);
            
            // Пересчитываем PR
            if (ex.sets.length > 0) {
                ex.pr = Math.max(...ex.sets.map(s => this.calculateOneRM(s.weight, s.reps)));
            } else {
                ex.pr = 0;
            }
            
            Storage.setExercises(Storage.getExercises());
            window.dispatchEvent(new Event('dataUpdated'));
            
            this.showHistory(ex.id);
            alert('✅ Подход удалён!');
        }
    },
    
    calcProgress(ex) {
        if (ex.sets.length < 2) return 0;
        const first = Math.max(...ex.sets.slice(0,2).map(s => this.calculateOneRM(s.weight, s.reps)));
        const last = Math.max(...ex.sets.slice(-2).map(s => this.calculateOneRM(s.weight, s.reps)));
        const progress = ((last - first) / first) * 100;
        return Math.max(0, Math.min(100, Math.round(progress)));
    },
    
    updateUI() {
        const exercises = Storage.getExercises();
        
        // Краткий список на главной
        const container = document.getElementById('exercisesList');
        if (container) {
            container.innerHTML = '';
            if (exercises.length === 0) {
                container.innerHTML = '<div class="exercise-item" style="text-align:center; color:#888;">Нет упражнений. Нажмите "+" чтобы добавить</div>';
            } else {
                exercises.slice(0, 3).forEach(ex => {
                    const last = ex.sets[ex.sets.length-1];
                    const progress = this.calcProgress(ex);
                    container.innerHTML += `
                        <div class="exercise-item" onclick="window.Exercises.showHistory('${ex.id}')">
                            <div class="exercise-name">${this.escapeHtml(ex.name)}</div>
                            <div class="exercise-stats">${last ? last.weight+'кг × '+last.reps + ' (' + last.date + ')' : 'Нет записей'}</div>
                            <div class="exercise-stats exercise-pr">🔥 Лучший 1ПМ: ${ex.pr || 0} кг</div>
                            <div class="exercise-progress"><div class="exercise-progress-bar" style="width: ${progress}%"></div></div>
                            <div class="exercise-stats" style="margin-top:6px;">📈 Прогресс: ${progress}%</div>
                        </div>
                    `;
                });
            }
        }
        
        // Полный список
        const full = document.getElementById('fullExercisesList');
        if (full) {
            full.innerHTML = '';
            if (exercises.length === 0) {
                full.innerHTML = '<div class="exercise-item" style="text-align:center; color:#888;">Нет упражнений. Нажмите "+ ДОБАВИТЬ УПРАЖНЕНИЕ"</div>';
            } else {
                exercises.forEach(ex => {
                    const progress = this.calcProgress(ex);
                    const isBase = this.baseExerciseIds.includes(ex.id);
                    full.innerHTML += `
                        <div class="exercise-item">
                            <div class="exercise-name">
                                ${this.escapeHtml(ex.name)}
                                ${isBase ? '<span style="font-size:10px; color:#888; margin-left:8px;">📌 базовое</span>' : ''}
                            </div>
                            <div class="exercise-stats">📊 Всего подходов: ${ex.sets.length}</div>
                            <div class="exercise-stats">🔥 Лучший 1ПМ: ${ex.pr || 0} кг</div>
                            <div class="exercise-progress"><div class="exercise-progress-bar" style="width: ${progress}%"></div></div>
                            <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                                <button class="btn-secondary" style="flex:1;" onclick="event.stopPropagation(); window.Exercises.showAddSet('${ex.id}','${this.escapeHtml(ex.name)}')">➕ Добавить подход</button>
                                <button class="btn-secondary" style="flex:1;" onclick="event.stopPropagation(); window.Exercises.showCalculator('${ex.id}')">📐 1RM</button>
                                <button class="btn-secondary" style="flex:1;" onclick="event.stopPropagation(); window.Exercises.showHistory('${ex.id}')">📊 История</button>
                            </div>
                            ${!isBase ? `<button class="btn-delete-exercise" onclick="event.stopPropagation(); window.Exercises.deleteExercise('${ex.id}','${this.escapeHtml(ex.name)}')">🗑️ Удалить упражнение</button>` : ''}
                        </div>
                    `;
                });
            }
        }
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
