window.Exercises = {
    currentExerciseId: null,
    currentCalculatorId: null,
    currentExerciseForEdit: null,
    currentEditingSet: null,
    
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
        document.getElementById('modalExerciseName').textContent = `➕ Добавить: ${name}`;
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
            // Рассчитываем 1ПМ нового подхода
            const newOneRM = this.calculateOneRM(weight, reps);
            
            // Находим лучший предыдущий 1ПМ
            const oldBestPR = ex.pr || 0;
            
            // Добавляем новый подход
            const newSet = { 
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0], 
                weight: weight, 
                reps: reps 
            };
            ex.sets.push(newSet);
            
            // Обновляем PR
            if (!ex.pr || newOneRM > ex.pr) {
                ex.pr = newOneRM;
            }
            
            Storage.setExercises(exercises);
            
            // ПОКАЗЫВАЕМ ПРОГРЕСС В ПРОЦЕНТАХ
            const progressPercent = this.calculateProgressPercentage(oldBestPR, ex.pr);
            
            // Красивое сообщение с прогрессом
            let progressMessage = '';
            if (oldBestPR === 0) {
                progressMessage = `🎉 Первый результат! 1ПМ: ${newOneRM} кг\nПродолжай в том же духе! 💪`;
            } else if (newOneRM > oldBestPR) {
                progressMessage = `📈 Поздравляю! Ты стал сильнее на ${progressPercent}%!\nБыло: ${oldBestPR} кг → Стало: ${ex.pr} кг 🔥`;
            } else {
                const difference = ((oldBestPR - newOneRM) / oldBestPR * 100).toFixed(1);
                progressMessage = `📊 Результат добавлен: ${newOneRM} кг\nДо рекорда (${oldBestPR} кг) не хватает ${difference}% 💪\nПродолжай тренироваться!`;
            }
            
            alert(progressMessage);
        }
        
        document.getElementById('addSetModal').classList.remove('active');
        window.dispatchEvent(new Event('dataUpdated'));
    },
    
    calculateOneRM(w, r) { 
        return Math.round(w * (1 + r/30)); 
    },
    
    calculateProgressPercentage(oldValue, newValue) {
        if (oldValue === 0) return 100;
        const difference = newValue - oldValue;
        const percent = (difference / oldValue) * 100;
        return Math.round(percent);
    },
    
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
            const newOneRM = this.calculateOneRM(w, r);
            const oldBestPR = ex.pr || 0;
            
            ex.sets.push({ 
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0], 
                weight: w, 
                reps: r 
            });
            
            if (!ex.pr || newOneRM > ex.pr) {
                ex.pr = newOneRM;
            }
            
            Storage.setExercises(exercises);
            
            const progressPercent = this.calculateProgressPercentage(oldBestPR, ex.pr);
            
            let message = `✅ Сохранено: ${w}кг × ${r} = 1ПМ ${newOneRM}кг\n`;
            if (newOneRM > oldBestPR && oldBestPR !== 0) {
                message += `🎉 Новый рекорд! Ты стал сильнее на ${progressPercent}%!`;
            } else if (oldBestPR === 0) {
                message += `🎉 Первый результат! Продолжай в том же духе!`;
            } else {
                const diff = ((oldBestPR - newOneRM) / oldBestPR * 100).toFixed(1);
                message += `💪 До рекорда (${oldBestPR} кг) не хватает ${diff}%`;
            }
            alert(message);
        }
        
        document.getElementById('oneRMModal').classList.remove('active');
        window.dispatchEvent(new Event('dataUpdated'));
    },
    
    showHistory(exerciseId) {
        const ex = Storage.getExercises().find(e => e.id === exerciseId);
        if (!ex) return;
        
        this.currentExerciseForEdit = ex;
        
        if (ex.sets.length === 0) {
            alert(`📊 ${ex.name}\n\nНет записей о тренировках\n\nНажмите "Добавить подход" чтобы начать`);
            return;
        }
        
        const container = document.getElementById('historySetsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Показываем подходы от новых к старым
        const sortedSets = [...ex.sets].reverse();
        
        sortedSets.forEach((set, idx) => {
            const oneRM = this.calculateOneRM(set.weight, set.reps);
            const date = new Date(set.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            
            const setCard = document.createElement('div');
            setCard.className = 'history-set-card';
            setCard.innerHTML = `
                <div class="history-set-number">#${ex.sets.length - idx}</div>
                <div class="history-set-date">📅 ${date}</div>
                <div class="history-set-details">
                    <span class="history-set-weight">${set.weight} <span class="history-set-unit">кг</span></span>
                    <span class="history-set-multiply">×</span>
                    <span class="history-set-reps">${set.reps} <span class="history-set-unit">раз</span></span>
                    <span class="history-set-1rm">🏆 1ПМ: ${oneRM} кг</span>
                </div>
                <div class="history-set-actions">
                    <button class="btn-edit" onclick="window.Exercises.openEditModal('${set.id}')">✏️ Редактировать</button>
                    <button class="btn-delete" onclick="window.Exercises.deleteSet('${set.id}')">🗑️ Удалить</button>
                </div>
            `;
            container.appendChild(setCard);
        });
        
        document.getElementById('historyExerciseName').textContent = ex.name;
        document.getElementById('historyExercisePr').textContent = `${ex.pr || 0}`;
        document.getElementById('historyTotalSets').textContent = `${ex.sets.length}`;
        
        document.getElementById('historyModal').classList.add('active');
    },
    
    openEditModal(setId) {
        const ex = this.currentExerciseForEdit;
        if (!ex) return;
        
        const set = ex.sets.find(s => s.id === setId);
        if (!set) return;
        
        this.currentEditingSet = { setId, exerciseId: ex.id };
        
        document.getElementById('editSetWeight').value = set.weight;
        document.getElementById('editSetReps').value = set.reps;
        document.getElementById('editSetId').textContent = setId.substring(0, 8);
        document.getElementById('editSetDate').textContent = new Date(set.date).toLocaleDateString('ru-RU');
        
        document.getElementById('historyModal').classList.remove('active');
        document.getElementById('editSetModal').classList.add('active');
    },
    
    saveEditSet() {
        if (!this.currentEditingSet) return;
        
        const exercises = Storage.getExercises();
        const ex = exercises.find(e => e.id === this.currentEditingSet.exerciseId);
        if (!ex) return;
        
        const set = ex.sets.find(s => s.id === this.currentEditingSet.setId);
        if (!set) return;
        
        const oldOneRM = this.calculateOneRM(set.weight, set.reps);
        const newWeight = parseFloat(document.getElementById('editSetWeight').value);
        const newReps = parseInt(document.getElementById('editSetReps').value);
        
        if (!newWeight || !newReps) {
            alert('Введите корректные данные');
            return;
        }
        
        set.weight = newWeight;
        set.reps = newReps;
        
        const newOneRM = this.calculateOneRM(newWeight, newReps);
        
        // Пересчитываем PR
        ex.pr = Math.max(...ex.sets.map(s => this.calculateOneRM(s.weight, s.reps)));
        
        Storage.setExercises(exercises);
        window.dispatchEvent(new Event('dataUpdated'));
        
        document.getElementById('editSetModal').classList.remove('active');
        this.currentEditingSet = null;
        
        // Показываем изменение в процентах
        const percentChange = ((newOneRM - oldOneRM) / oldOneRM * 100).toFixed(1);
        if (newOneRM > oldOneRM) {
            alert(`✅ Подход обновлён!\n📈 1ПМ увеличился на ${percentChange}% (${oldOneRM} → ${newOneRM} кг)`);
        } else if (newOneRM < oldOneRM) {
            alert(`✅ Подход обновлён!\n📉 1ПМ уменьшился на ${Math.abs(percentChange)}% (${oldOneRM} → ${newOneRM} кг)`);
        } else {
            alert(`✅ Подход обновлён! 1ПМ остался прежним — ${newOneRM} кг`);
        }
        
        this.showHistory(ex.id);
    },
    
    deleteSet(setId) {
        if (!this.currentExerciseForEdit) return;
        
        const ex = this.currentExerciseForEdit;
        const setToDelete = ex.sets.find(s => s.id === setId);
        
        if (!setToDelete) return;
        
        const oneRMToDelete = this.calculateOneRM(setToDelete.weight, setToDelete.reps);
        
        if (confirm(`Удалить подход: ${setToDelete.weight}кг × ${setToDelete.reps} раз (1ПМ: ${oneRMToDelete} кг)?`)) {
            ex.sets = ex.sets.filter(s => s.id !== setId);
            
            // Пересчитываем PR
            if (ex.sets.length > 0) {
                ex.pr = Math.max(...ex.sets.map(s => this.calculateOneRM(s.weight, s.reps)));
            } else {
                ex.pr = 0;
            }
            
            Storage.setExercises(Storage.getExercises());
            window.dispatchEvent(new Event('dataUpdated'));
            
            if (ex.sets.length === 0) {
                document.getElementById('historyModal').classList.remove('active');
                alert('✅ Подход удалён! Больше нет подходов в этом упражнении.');
            } else {
                this.showHistory(ex.id);
                alert('✅ Подход удалён!');
            }
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
        
        // Полный список на странице упражнений
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
                            <div class="exercise-stats">📈 Прогресс: ${progress}%</div>
                            <div class="exercise-progress"><div class="exercise-progress-bar" style="width: ${progress}%"></div></div>
                            <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                                <button class="btn-secondary" style="flex:1;" onclick="event.stopPropagation(); window.Exercises.showAddSet('${ex.id}','${this.escapeHtml(ex.name)}')">➕ Добавить подход</button>
                                <button class="btn-secondary" style="flex:1;" onclick="event.stopPropagation(); window.Exercises.showCalculator('${ex.id}')">📐 Калькулятор 1RM</button>
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
