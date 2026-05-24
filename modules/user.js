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
            alert('Заполните все поля');
            return;
        }
        
        const age = new Date().getFullYear() - new Date(birthdate).getFullYear();
        Storage.setUser({ 
            name, height, weight, birthdate, gender, daysCount: days, age, 
            isRegistered: true, startWeight: weight 
        });
        Storage.addWeightEntry(new Date().toISOString().split('T')[0], weight);
        window.location.reload();
    },
    
    checkIn() {
        const today = new Date().toISOString().split('T')[0];
        if (Storage.isCheckedToday()) { alert('Вы уже отметились сегодня!'); return; }
        
        Storage.addCheckIn(today);
        const user = Storage.getUser();
        user.daysCount++;
        Storage.setUser(user);
        
        const newWeight = prompt('Введите сегодняшний вес (кг):', user.weight);
        if (newWeight && !isNaN(parseFloat(newWeight)) && parseFloat(newWeight) > 0) {
            user.weight = parseFloat(newWeight);
            Storage.setUser(user);
            Storage.addWeightEntry(today, user.weight);
        }
        window.dispatchEvent(new Event('dataUpdated'));
    },
    
    updateWeight() {
        const newWeight = parseFloat(document.getElementById('newWeight').value);
        if (!newWeight || newWeight <= 0) { alert('Введите корректный вес'); return; }
        const user = Storage.getUser();
        user.weight = newWeight;
        Storage.setUser(user);
        Storage.addWeightEntry(new Date().toISOString().split('T')[0], newWeight);
        window.dispatchEvent(new Event('dataUpdated'));
        window.closeModal('weightModal');
        alert(`✅ Вес обновлён: ${newWeight} кг`);
    },
    
    showWeightModal() {
        document.getElementById('newWeight').value = Storage.getUser().weight;
        document.getElementById('weightModal').classList.add('active');
    },
    
    updateUI() {
        const user = Storage.getUser();
        if (!user) return;
        
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userStats').textContent = `${user.weight} кг • ${user.height} см • ${user.age} лет`;
        document.getElementById('weightValue').textContent = user.weight;
        document.getElementById('daysValue').textContent = user.daysCount;
        
        const bmi = (user.weight / ((user.height/100)**2)).toFixed(1);
        document.getElementById('bmiValue').textContent = bmi;
        
        let status = bmi < 18.5 ? 'Недостат.' : bmi < 25 ? 'Норма' : bmi < 30 ? 'Избыт.' : 'Ожирение';
        document.getElementById('bmiStatus').textContent = status;
        document.getElementById('checkStatus').textContent = Storage.isCheckedToday() ? '✅ Отмечен сегодня' : '❌ Ещё не отмечались';
    }
};
