window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};

function setupTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.ready();
        webApp.expand();
        
        const setHeight = () => {
            const viewportHeight = webApp.viewportHeight;
            if (viewportHeight) {
                document.body.style.minHeight = `${viewportHeight}px`;
            }
        };
        
        setHeight();
        webApp.onEvent('viewportChanged', setHeight);
        
        const theme = webApp.themeParams;
        if (theme) {
            document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color || '#0D0D0D');
            document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color || '#FFFFFF');
            document.documentElement.style.setProperty('--tg-theme-hint-color', theme.hint_color || '#888888');
            document.documentElement.style.setProperty('--tg-theme-button-color', theme.button_color || '#FF4444');
        }
        
        webApp.enableClosingConfirmation();
        console.log('Telegram WebApp инициализирован');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('GYM TRACKER запущен');
    
    Storage.load();
    
    const user = Storage.getUser();
    const isRegistered = user && user.isRegistered === true;
    
    if (!isRegistered) {
        document.getElementById('registerScreen').style.display = 'block';
        document.getElementById('mainApp').classList.add('hidden');
        User.init();
    } else {
        document.getElementById('registerScreen').style.display = 'none';
        document.getElementById('mainApp').classList.remove('hidden');
        
        User.init();
        if (window.Exercises) Exercises.init();
        if (window.Goals) Goals.init();
        
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
                navTabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                Object.values(pages).forEach(pageId => {
                    const page = document.getElementById(pageId);
                    if (page) page.classList.add('hidden');
                });
                const targetPage = document.getElementById(pages[btn.dataset.page]);
                if (targetPage) targetPage.classList.remove('hidden');
                
                if (btn.dataset.page === 'calendar' && window.Calendar) {
                    window.Calendar.updateUI();
                }
            };
        });
        
        window.addEventListener('dataUpdated', () => {
            if (window.User) User.updateUI();
            if (window.Exercises) Exercises.updateUI();
            if (window.Calendar) Calendar.updateUI();
            if (window.History) History.updateUI();
            if (window.Goals) Goals.renderGoalCard();
        });
        
        if (window.User) User.updateUI();
        if (window.Exercises) Exercises.updateUI();
        if (window.Calendar) Calendar.updateUI();
        if (window.History) History.updateUI();
        if (window.Goals) Goals.renderGoalCard();
        
        setupTelegram();
    }
});

window.addEventListener('touchstart', function() {}, { passive: false });
