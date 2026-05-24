window.User = {
    init() {
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            saveBtn.onclick = () => this.saveProfile();
        }
        
        const checkInBtn = document.getElementById('checkInBtn');
        if (checkInBtn) {
            checkInBtn.onclick = () => this.checkIn();
        }
    },
    
    saveProfile() {
        console.log('saveProfile вызван');
        
        const name = document.getElementById('regName')?.value.trim();
        const height = parseFloat(document.getElementById('regHeight')?.value);
        const weight = parseFloat(document.getElementById('regWeight')?.value);
        const birthdate = document.getElementById('regBirthdate')?.value;
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        const days = parseInt(document.getElementById('regDays')?.value) || 0;
        
        console.log('Данные формы:', { name, height, weight, birthdate, gender, days });
        
        // Проверка обязательных полей
        if (!name) {
            alert('Введите имя');
            return;
        }
        if (!height || isNaN(height)) {
            alert('Введите корректный рост');
            return;
        }
        if (!weight || isNaN(weight)) {
            alert('Введите корректный вес');
            return;
        }
        if (!birthdate) {
            alert('Выберите дату рождения');
            return;
        }
        if (!gender) {
            alert('Выберите пол');
            return;
        }
        
        // Расчёт возраста
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        
        const userData = {
            name: name,
            height: height,
            weight: weight,
            birthdate: birthdate,
            gender: gender,
            daysCount: days,
            age: age,
            isRegistered: true,
            startWeight: weight,
            registeredAt: new Date().toISOString()
        };
        
        console.log('Сохраняем пользователя:', userData);
        
        // Сохраняем пользователя
        Storage.setUser(userData);
        
        // Добавляем первый вес в историю
        const todayStr = new Date().toISOString().split('T')[0];
        Storage.addWeightEntry(todayStr, weight);
        
        console.log('Данные сохранены, переключаем интерфейс');
        
        // Прячем экран регистрации
        const registerScreen = document.getElementById('registerScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (registerScreen) registerScreen.style.display = 'none';
        if (mainApp) mainApp.classList.remove('hidden');
        
        // Обновляем весь интерфейс
        if (window.User) window.User.updateUI();
        if (window.Exercises) window.Exercises.updateUI();
        if (window.Calendar) window.Calendar.updateUI();
        if (window.History) window.History.updateUI();
        if (window.Goals) window.Goals.renderGoalCard();
        
        // Уведомляем об обновлении
        window.dispatchEvent(new Event('dataUpdated'));
        
        // Настройка Telegram
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }
        
        console.log('Готово!');
    },
    
    checkIn() {
        const today = new Date().toISOString().split('T')[0];
        if (Storage.isCheckedToday()) { 
            alert('Вы уже отметились сегодня!'); 
            return; 
        }
        
        Storage.addCheckIn(today);
        const user = Storage.getUser();
        if (user) {
            user.daysCount++;
            Storage.setUser(user);
        }
        
        const newWeight = prompt('Введите сегодняшний вес (кг):', user?.weight || 70);
        if (newWeight && !isNaN(parseFloat(newWeight)) && parseFloat(newWeight) > 0) {
            if (user) {
                user.weight = parseFloat(newWeight);
                Storage.setUser(user);
            }
            Storage.addWeightEntry(today, parseFloat(newWeight));
        }
        
        window.dispatchEvent(new Event('dataUpdated'));
    },
    
    updateWeight() {
        const newWeight = parseFloat(document.getElementById('newWeight')?.value);
        if (!newWeight || newWeight <= 0) { 
            alert('Введите корректный вес'); 
            return; 
        }
        const user = Storage.getUser();
        if (user) {
            user.weight = newWeight;
            Storage.setUser(user);
        }
        Storage.addWeightEntry(new Date().toISOString().split('T')[0], newWeight);
        window.dispatchEvent(new Event('dataUpdated'));
        window.closeModal('weightModal');
        alert(`✅ Вес обновлён: ${newWeight} кг`);
    },
    
    showWeightModal() {
        const user = Storage.getUser();
        const weightInput = document.getElementById('newWeight');
        if (weightInput && user) {
            weightInput.value = user.weight;
        }
        document.getElementById('weightModal').classList.add('active');
    },
    
    updateUI() {
        const user = Storage.getUser();
        if (!user) return;
        
        const userNameEl = document.getElementById('userName');
        const userStatsEl = document.getElementById('userStats');
        const weightValueEl = document.getElementById('weightValue');
        const daysValueEl = document.getElementById('daysValue');
        const bmiValueEl = document.getElementById('bmiValue');
        const bmiStatusEl = document.getElementById('bmiStatus');
        const checkStatusEl = document.getElementById('checkStatus');
        
        if (userNameEl) userNameEl.textContent = user.name;
        if (userStatsEl) userStatsEl.textContent = `${user.weight} кг • ${user.height} см • ${user.age} лет`;
        if (weightValueEl) weightValueEl.textContent = user.weight;
        if (daysValueEl) daysValueEl.textContent = user.daysCount;
        
        if (bmiValueEl) {
            const bmi = (user.weight / ((user.height/100)**2)).toFixed(1);
            bmiValueEl.textContent = bmi;
        }
        
        if (bmiStatusEl) {
            const bmi = (user.weight / ((user.height/100)**2)).toFixed(1);
            let status = bmi < 18.5 ? 'Недостат.' : bmi < 25 ? 'Норма' : bmi < 30 ? 'Избыт.' : 'Ожирение';
            bmiStatusEl.textContent = status;
        }
        
        if (checkStatusEl) {
            checkStatusEl.textContent = Storage.isCheckedToday() ? '✅ Отмечен сегодня' : '❌ Ещё не отмечались';
        }
    }
};
