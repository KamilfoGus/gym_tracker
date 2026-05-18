/**
 * GYM TRACKER - Telegram Mini App
 * Главный файл приложения
 */

// Глобальные функции
window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    // Загружаем данные
    Storage.load();
    
    // Пытаемся загрузить из Telegram Cloud
    Storage.loadFromTelegram((success) => {
        if (success) console.log('Синхронизация с Telegram Cloud выполнена');
    });

    // Проверяем регистрацию
    if (!Storage.getUser()?.isRegistered) {
        document.getElementById('registerScreen').style.display = 'block';
        document.getElementById('mainApp').classList.add('hidden');
        User.init();
    } else {
        document.getElementById('registerScreen').style.display = 'none';
        document.getElementById('mainApp').classList.remove('hidden');
        
        // Инициализация всех модулей
        User.init();
        Exercises.init();
        Calendar.init();
        
        // Навигация между вкладками
        setupNavigation();
        
        // Подписка на обновления данных
        window.addEventListener('dataUpdated', () => {
            User.updateUI();
            Exercises.updateUI();
            Calendar.updateUI();
            History.updateUI();
        });
        
        // Первоначальное обновление UI
        User.updateUI();
        Exercises.updateUI();
        Calendar.updateUI();
        History.updateUI();
        
        // Настройка Telegram WebApp
        setupTelegram();
    }
});

function setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            contents.forEach(content => content.classList.add('hidden'));
            
            const targetContent = document.getElementById(`tab${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`);
            if (targetContent) targetContent.classList.remove('hidden');
        });
    });
}

function setupTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.ready();
        webApp.expand();
        
        // Настройка главной кнопки (опционально)
        webApp.MainButton.isVisible = false;
        
        // Обработка закрытия
        webApp.onEvent('viewportChanged', () => {
            document.body.style.height = `${webApp.viewportHeight}px`;
        });
    }
}

// Экспортируем необходимые функции в глобальную область
window.User = User;
window.Exercises = Exercises;
window.Calendar = Calendar;
window.History = History;
window.Storage = Storage;