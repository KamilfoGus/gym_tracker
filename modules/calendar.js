/**
 * Модуль календаря и графика веса
 */

window.Calendar = {
    chart: null,

    init() {
        this.updateUI();
    },

    updateUI() {
        this.renderCalendar();
        this.renderWeightChart();
        this.renderWeightStats();
    },

    renderCalendar() {
        const container = document.getElementById('calendarGrid');
        if (!container) return;

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const checkIns = Storage.getCheckIns();
        const todayStr = new Date().toISOString().split('T')[0];

        container.innerHTML = '';
        
        // Дни недели
        const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        weekDays.forEach(day => {
            const div = document.createElement('div');
            div.className = 'calendar-day';
            div.style.background = '#3A3A3A';
            div.style.fontWeight = 'bold';
            div.textContent = day;
            container.appendChild(div);
        });

        // Смещение для понедельника
        let startOffset = (firstDay.getDay() + 6) % 7;
        for (let i = 0; i < startOffset; i++) {
            const div = document.createElement('div');
            div.className = 'calendar-day';
            div.style.background = '#1A1A1A';
            div.style.opacity = '0.5';
            container.appendChild(div);
        }

        // Дни месяца
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isChecked = checkIns.includes(dateStr);
            const isToday = dateStr === todayStr;

            const div = document.createElement('div');
            div.className = `calendar-day ${isChecked ? 'checked' : ''} ${isToday ? 'today' : ''}`;
            div.textContent = d;
            container.appendChild(div);
        }
    },

    renderWeightChart() {
        const ctx = document.getElementById('weightChart')?.getContext('2d');
        if (!ctx) return;

        const history = Storage.getWeightHistory();
        const last30 = history.slice(-30);
        
        const labels = last30.map(w => {
            const date = w.date.split('-');
            return `${date[2]}/${date[1]}`;
        });
        
        const weights = last30.map(w => w.weight);

        if (this.chart) this.chart.destroy();

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Вес (кг)',
                    data: weights,
                    borderColor: '#FF4444',
                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#FF4444',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: '#FFFFFF' }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.raw} кг`
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: '#2A2A2A' },
                        ticks: { color: '#FFFFFF' },
                        title: {
                            display: true,
                            text: 'Вес (кг)',
                            color: '#888888'
                        }
                    },
                    x: {
                        grid: { color: '#2A2A2A' },
                        ticks: { 
                            color: '#FFFFFF',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    },

    renderWeightStats() {
        const container = document.getElementById('weightStats');
        if (!container) return;

        const history = Storage.getWeightHistory();
        const user = Storage.getUser();
        
        if (!user || history.length === 0) return;

        const startWeight = user.startWeight || history[0]?.weight || user.weight;
        const currentWeight = user.weight;
        const change = (currentWeight - startWeight).toFixed(1);
        const changePercent = ((change / startWeight) * 100).toFixed(1);
        
        const minWeight = Math.min(...history.map(w => w.weight));
        const maxWeight = Math.max(...history.map(w => w.weight));

        container.innerHTML = `
            <div class="weight-stat">
                <div class="weight-stat-label">НАЧАЛЬНЫЙ</div>
                <div class="weight-stat-value">${startWeight} кг</div>
            </div>
            <div class="weight-stat">
                <div class="weight-stat-label">ТЕКУЩИЙ</div>
                <div class="weight-stat-value">${currentWeight} кг</div>
            </div>
            <div class="weight-stat">
                <div class="weight-stat-label">ИЗМЕНЕНИЕ</div>
                <div class="weight-stat-value" style="color: ${change >= 0 ? '#FF4444' : '#4CAF50'}">
                    ${change >= 0 ? '+' : ''}${change} кг (${changePercent}%)
                </div>
            </div>
        `;
    }
};