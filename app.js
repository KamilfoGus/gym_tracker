// Глобальная функция закрытия модальных окон
window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('Приложение запущено');
    
    // Загружаем данные
    Storage.load();
    
    // Проверяем, зарегистрирован ли пользователь
    const user = Storage.getUser();
    const isRegistered = user && user.isRegistered === true;
    
    console.log('Статус регистрации:', isRegistered);
    console.log('Данные пользователя:', user);
    
    if (!isRegistered) {
        // Показываем экран регистрации
        const registerScreen = document.getElementById('registerScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (registerScreen) registerScreen.style.display = 'block';
        if (mainApp) mainApp.classList.add('hidden');
        
        User.init();
    } else {
        // Показываем главное приложение
        const registerScreen = document.getElementById('registerScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (registerScreen) registerScreen.style.display = 'none';
        if (mainApp) mainApp.classList.remove('hidden');
        
        // Инициализация всех модулей
        User.init();
        if (window.Exercises) Exercises.init();
        if (window.Goals) Goals.init();
        
        // Настройка навигации по вкладкам
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
                
                Object.values(pages).forEach(pageId => {
                    const page = document.getElementById(pageId);
                    if (page) page.classList.add('hidden');
                });
                
                const targetPage = document.getElementById(pages[btn.dataset.page]);
                if (targetPage) targetPage.classList.remove('hidden');
            };
        });
        
        // Подписка на обновление данных
        window.addEventListener('dataUpdated', () => {
            if (window.User) User.updateUI();
            if (window.Exercises) Exercises.updateUI();
            if (window.Calendar) Calendar.updateUI();
            if (window.History) History.updateUI();
            if (window.Goals) Goals.renderGoalCard();
        });
        
        // Первоначальное обновление UI
        if (window.User) User.updateUI();
        if (window.Exercises) Exercises.updateUI();
        if (window.Calendar) Calendar.updateUI();
        if (window.History) History.updateUI();
        if (window.Goals) Goals.renderGoalCard();
        
        // Настройка Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }
    }
});
