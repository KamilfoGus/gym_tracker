/**
 * Модуль уведомлений о тренировках
 * Отслеживает пропуски и напоминает
 */

window.Notifications = {
    // Настройки по умолчанию
    settings: {
        enabled: true,
        daysThreshold: 3, // через сколько дней напоминать (3, 5, 7)
        lastCheck: null
    },

    init() {
        this.loadSettings();
        this.checkReminder();
        this.setupUI();
    },

    loadSettings() {
        const saved = localStorage.getItem('gym_tracker_notifications');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch(e) {}
        }
    },

    saveSettings() {
        localStorage.setItem('gym_tracker_notifications', JSON.stringify(this.settings));
    },

    // Проверка: пора ли напомнить?
    checkReminder() {
        if (!this.settings.enabled) return;

        const checkIns = Storage.getCheckIns();
        if (checkIns.length === 0) {
            this.showNotification('💪 Пора начать тренироваться!', 'Добавь первую тренировку');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastCheckIn = new Date(Math.max(...checkIns.map(d => new Date(d).getTime())));
        lastCheckIn.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24));

        // Проверяем, не показывали ли уже уведомление сегодня
        const lastCheckDate = this.settings.lastCheck ? new Date(this.settings.lastCheck) : null;
        const todayStr = today.toDateString();

        if (diffDays >= this.settings.daysThreshold) {
            // Показываем только если ещё не показывали сегодня
            if (!lastCheckDate || lastCheckDate.toDateString() !== todayStr) {
                this.showNotification(
                    `⏰ Давно не тренировался!`,
                    `Прошло ${diffDays} дней с последней тренировки. Пора в зал! 💪`
                );
                this.settings.lastCheck = new Date().toISOString();
                this.saveSettings();
            }
        }
    },

    // Показать уведомление в Telegram
    showNotification(title, message) {
        // 1. Показываем через Telegram WebApp (если доступно)
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                window.Telegram.WebApp.showPopup({
                    title: title,
                    message: message,
                    buttons: [
                        { type: 'ok', text: '👊 В зал!' },
                        { type: 'cancel', text: 'Позже' }
                    ]
                }, (buttonId) => {
                    if (buttonId === 'ok') {
                        // Переключаем на главную страницу
                        document.querySelector('[data-page="main"]')?.click();
                    }
                });
            } catch(e) {
                // Если не работает, показываем alert
                alert(`${title}\n\n${message}`);
            }
        } else {
            // Для веб-версии
            alert(`${title}\n\n${message}`);
        }
    },

    // Настройка интерфейса уведомлений
    setupUI() {
        const container = document.getElementById('notificationsSettings');
        if (!container) return;

        container.innerHTML = `
            <div class="notification-settings">
                <div class="setting-item">
                    <label class="switch-label">
                        <span>🔔 Уведомления</span>
                        <div class="switch">
                            <input type="checkbox" id="notifEnabled" ${this.settings.enabled ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </label>
                </div>
                <div class="setting-item">
                    <label>⏰ Напоминать через (дней)</label>
                    <select id="notifThreshold">
                        <option value="2" ${this.settings.daysThreshold === 2 ? 'selected' : ''}>2 дня</option>
                        <option value="3" ${this.settings.daysThreshold === 3 ? 'selected' : ''}>3 дня</option>
                        <option value="5" ${this.settings.daysThreshold === 5 ? 'selected' : ''}>5 дней</option>
                        <option value="7" ${this.settings.daysThreshold === 7 ? 'selected' : ''}>7 дней</option>
                        <option value="10" ${this.settings.daysThreshold === 10 ? 'selected' : ''}>10 дней</option>
                    </select>
                </div>
                <div class="setting-item">
                    <button class="btn-secondary" onclick="window.Notifications.checkReminder()">🔍 Проверить сейчас</button>
                </div>
            </div>
        `;

        // Обработчики событий
        const enabledCheckbox = document.getElementById('notifEnabled');
        if (enabledCheckbox) {
            enabledCheckbox.onchange = () => {
                this.settings.enabled = enabledCheckbox.checked;
                this.saveSettings();
                if (this.settings.enabled) this.checkReminder();
            };
        }

        const thresholdSelect = document.getElementById('notifThreshold');
        if (thresholdSelect) {
            thresholdSelect.onchange = () => {
                this.settings.daysThreshold = parseInt(thresholdSelect.value);
                this.saveSettings();
            };
        }
    },

    // Добавить кнопку "Настройки уведомлений" в меню
    renderSettingsButton() {
        const container = document.getElementById('notificationsButton');
        if (!container) return;

        container.innerHTML = `
            <button class="btn-secondary" onclick="document.getElementById('notificationsModal').classList.add('active')">
                🔔 Уведомления
            </button>
        `;
    },

    // Получить статистику пропусков
    getStats() {
        const checkIns = Storage.getCheckIns();
        if (checkIns.length === 0) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const sorted = [...checkIns].sort();
        const lastCheckIn = new Date(Math.max(...checkIns.map(d => new Date(d).getTime())));
        lastCheckIn.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24));

        return {
            lastCheckIn: lastCheckIn,
            daysSince: diffDays,
            totalCheckIns: checkIns.length
        };
    }
};
