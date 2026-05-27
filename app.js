/**
 * GYM TRACKER - Telegram Mini App
 * Главный файл приложения с поддержкой iOS
 */

// Глобальная функция закрытия модальных окон
window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};

// Настройка Telegram WebApp (с поддержкой iOS)
function setupTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.ready();
        webApp.expand();
        
        // Фикс для iOS: принудительно устанавливаем высоту
        const setHeight = () => {
            const viewportHeight = webApp.viewportHeight;
            if (viewportHeight) {
                document.body.style.minHeight = `${viewportHeight}px`;
            }
        };
        
        setHeight();
        webApp.onEvent('viewportChanged', setHeight);
        
        // Настройка темы
        const theme = webApp.themeParams;
        if (theme) {
            document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color || '#0D0D0D');
            document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color || '#FFFFFF');
            document.documentElement.style.setProperty('--tg-theme-hint-color', theme.hint_color || '#888888');
            document.documentElement.style.setProperty('--tg-theme-button-color', theme.button_color || '#FF4444');
            document.documentElement.style.setProperty('--tg-theme-button-text-color', theme.button_text_color || '#FFFFFF');
            document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color || '#1A1A1A');
        }
        
        // Предупреждение при закрытии ОТКЛЮЧЕНО
        // webApp.enableClosingConfirmation();
        
        console.log('Telegram WebApp инициализирован, платформа:', webApp.platform);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('Приложение запущено');
    
    // Загружаем данные
    Storage.load();
    
    // Проверяем, зарегистрирован ли пользователь
    const user = Storage.getUser();
    const isRegistered = user && user.isRegistered === true;
    
    console.log('Статус регистрации:', isRegistered);
    console.log('Упражнений в Storage:', Storage.getExercises().length);
    
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
        
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                
                // Обновляем активный класс у кнопок
                navTabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Прячем все страницы
                Object.values(pages).forEach(pageId => {
                    const page = document.getElementById(pageId);
                    if (page) page.classList.add('hidden');
                });
                
                // Показываем выбранную страницу
                const targetPage = document.getElementById(pages[btn.dataset.page]);
                if (targetPage) targetPage.classList.remove('hidden');
                
                // Если открыли календарь, обновляем график
                if (btn.dataset.page === 'calendar' && window.Calendar) {
                    window.Calendar.updateUI();
                }
            };
        });
        
        // Подписка на обновление данных
        window.addEventListener('dataUpdated', () => {
            console.log('dataUpdated событие - обновляем UI');
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
        
        // Настройка Telegram (с поддержкой iOS)
        setupTelegram();
    }
});

// Обработка ошибок для iOS
window.addEventListener('touchstart', function() {}, { passive: false });

// Предотвращаем случайное масштабирование на iOS (если нужно)
document.addEventListener('gesturestart', function(e) {
    if (e.target.closest('.modal-content')) {
        e.preventDefault();
    }
});
