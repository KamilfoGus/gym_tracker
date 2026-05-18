/**
 * Модуль пользователя
 * Регистрация, профиль, отметки, управление весом
 */

window.User = {
    init() {
        document.getElementById('saveProfileBtn').onclick = () => this.saveProfile();
        document.getElementById('checkInBtn').onclick = () => this.checkIn();
    },

    saveProfile() {
        const name = document.getElementById('regName').value.trim();
        const height = parseFloat(document.getElementById('regHeight').value);
        const weight = parseFloat(document.getElementById('regWeight').value);
        const birthdate = document.getElementById('regBirthdate').value;
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        const days = parseInt(document.getElementById('regDays').value) || 0;

        if (!name || !height || !weight || !birthdate || !gender) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        // Расчет возраста
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

        const user = {
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

        Storage.setUser(user);
        
        // Добавляем первый вес в историю
        const todayStr = new Date().toISOString().split('T')[0];
        Storage.addWeightEntry(todayStr, weight);

        // Перезагружаем приложение для показа главного экрана
        window.location.reload();
    },

    checkIn() {
        const today = new Date().toISOString().split('T')[0];
        
        if (Storage.isCheckedToday()) {
            alert('✅ Вы уже отметились сегодня!');
            return;
        }

        Storage.addCheckIn(today);
        
        // Увеличиваем счетчик дней
        const user = Storage.getUser();
        user.daysCount++;
        Storage.setUser(user);

        // Запрашиваем новый вес
        const newWeight = prompt('Введите сегодняшний вес (кг):', user.weight);
        if (newWeight && !isNaN(parseFloat(newWeight)) && parseFloat(newWeight) > 0) {
            user.weight = parseFloat(newWeight);
            Storage.setUser(user);
            Storage.addWeightEntry(today, user.weight);
        }

        // Обновляем UI
        this.updateUI();
        window.dispatchEvent(new Event('dataUpdated'));
    },

    updateWeight() {
        const newWeight = parseFloat(document.getElementById('newWeight').value);
        if (!newWeight || newWeight <= 0) {
            alert('Введите корректный вес');
            return;
        }

        const user = Storage.getUser();
        user.weight = newWeight;
        Storage.setUser(user);
        
        const today = new Date().toISOString().split('T')[0];
        Storage.addWeightEntry(today, newWeight);

        this.updateUI();
        window.dispatchEvent(new Event('dataUpdated'));
        window.closeModal('weightModal');
        
        alert(`✅ Вес обновлен: ${newWeight} кг`);
    },

    showWeightModal() {
        const user = Storage.getUser();
        document.getElementById('newWeight').value = user.weight;
        document.getElementById('weightModal').classList.add('active');
    },

    updateUI() {
        const user = Storage.getUser();
        if (!user) return;

        document.getElementById('userName').textContent = user.name;
        document.getElementById('userStats').textContent = `${user.weight} кг • ${user.height} см • ${user.age} лет`;
        document.getElementById('weightValue').textContent = user.weight;
        document.getElementById('daysValue').textContent = user.daysCount;

        // Расчет ИМТ
        const heightM = user.height / 100;
        const bmi = (user.weight / (heightM * heightM)).toFixed(1);
        document.getElementById('bmiValue').textContent = bmi;

        let bmiStatus = '';
        if (bmi < 18.5) bmiStatus = 'Недостат.';
        else if (bmi < 25) bmiStatus = 'Норма';
        else if (bmi < 30) bmiStatus = 'Избыт.';
        else bmiStatus = 'Ожирение';
        document.getElementById('bmiStatus').textContent = bmiStatus;

        // Статус отметки
        const checkedToday = Storage.isCheckedToday();
        document.getElementById('checkStatus').textContent = checkedToday ? '✅ Отмечен сегодня' : '❌ Ещё не отмечались';
    }
};