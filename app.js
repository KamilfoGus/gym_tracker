window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Приложение запущено');
    
    Storage.load();
    
    const user = Storage.getUser();
    const isRegistered = user && user.isRegistered === true;
    
    console.log('Статус регистрации:', isRegistered);
    console.log('Упражнений в Storage:', Storage.getExercises().length);
    
    if (!isRegistered) {
        document.getElementById('registerScreen').style.display = 'block';
        document.getElementById('mainApp').classList.add('hidden');
        User.init();
    } else {
        document.getElementById('registerScreen').style.display = 'none';
        document.getElementById('mainApp').classList.remove('hidden');
        
        User.init();
        Exercises.init();
        Goals.init();
        
        // Навигация
        const pages = {
            main: 'pageMain',
            calendar: 'pageCalendar',
            exercises: 'pageExercises',
            history: 'pageHistory'
        };
        
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                Object.values(pages).forEach(p => {
                    const el = document.getElementById(p);
                    if (el) el.classList.add('hidden');
                });
                const target = document.getElementById(pages[btn.dataset.page]);
                if (target) target.classList.remove('hidden');
            };
        });
        
        window.addEventListener('dataUpdated', () => {
            console.log('dataUpdated событие');
            User.updateUI();
            Exercises.updateUI();
            Calendar.updateUI();
            History.updateUI();
            Goals.renderGoalCard();
        });
        
        User.updateUI();
        Exercises.updateUI();
        Calendar.updateUI();
        History.updateUI();
        Goals.renderGoalCard();
        
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }
    }
});
