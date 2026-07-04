window.Calendar = {
    chart: null,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),

    init() {
        this.renderCalendar();
        this.renderWeightChart();
        this.renderWeightStats();
        this.setupNavigation();
    },

    setupNavigation() {
        const prevBtn = document.getElementById('calendarPrev');
        const nextBtn = document.getElementById('calendarNext');

        if (prevBtn) {
            prevBtn.onclick = () => {
                this.currentMonth--;
                if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                }
                this.renderCalendar();
                this.renderWeightChart();
                this.renderWeightStats();
                this.updateMonthLabel();
            };
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                this.currentMonth++;
                if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                }
                this.renderCalendar();
                this.renderWeightChart();
                this.renderWeightStats();
                this.updateMonthLabel();
            };
        }

        this.updateMonthLabel();
    },

    updateMonthLabel() {
        const label = document.getElementById('calendarMonthLabel');
        if (label) {
            const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Окторябрь', 'Ноябрь', 'Декабрь'];
            label.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }
    },

    renderCalendar() {
        const container = document.getElementById('calendarGrid');
        if (!container) return;

        const year = this.currentYear;
        const month = this.currentMonth;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const checkIns = Storage.getCheckIns();
        const todayStr = new Date().toISOString().split('T')[0];

        container.innerHTML = '';
        
        const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        weekDays.forEach(day => {
            const div = document.createElement('div');
            div.className = 'calendar-day';
            div.style.background = '#3A3A3A';
            div.style.fontWeight = 'bold';
            div.textContent = day;
            container.appendChild(div);
        });

        let startOffset = (firstDay.getDay() + 6) % 7;
        for (let i = 0; i < startOffset; i++) {
            const div = document.createElement('div');
            div.className = 'calendar-day';
            div.style.background = '#1A1A1A';
            div.style.opacity = '0.5';
            container.appendChild(div);
        }

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
        
        const year = this.currentYear;
        const month = this.currentMonth;
        
        const monthData = history.filter(w => {
            const date = new Date(w.date);
            return date.getFullYear() === year && date.getMonth() === month;
        });

        monthData.sort((a, b) => new Date(a.date) - new Date(b.date));

        const labels = monthData.map(w => {
            const d = new Date(w.date);
            return d.getDate().toString();
        });
        
        const weights = monthData.map(w => w.weight);

        if (this.chart) this.chart.destroy();

        if (weights.length === 0) {
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Нет данных'],
                    datasets: [{
                        label: 'Вес (кг)',
                        data: [0],
                        borderColor: '#FF4444',
                        backgroundColor: 'rgba(255, 68, 68, 0.1)',
                        borderWidth: 2,
                        pointRadius: 0,
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
                                label: (context) => {
                                    if (context.raw === 0) return 'Нет данных';
                                    return `${context.raw} кг`;
                                }
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
                            },
                            min: 0,
                            max: 1
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
            return;
        }

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
        
        if (!user || history.length === 0) {
            container.innerHTML = `
                <div class="weight-stat">
                    <div class="weight-stat-label">НЕТ ДАННЫХ</div>
                    <div class="weight-stat-value" style="font-size:14px;">Начните тренировки</div>
                </div>
            `;
            return;
        }

        const year = this.currentYear;
        const month = this.currentMonth;
        
        const monthData = history.filter(w => {
            const date = new Date(w.date);
            return date.getFullYear() === year && date.getMonth() === month;
        });

        if (monthData.length === 0) {
            container.innerHTML = `
                <div class="weight-stat">
                    <div class="weight-stat-label">НЕТ ДАННЫХ</div>
                    <div class="weight-stat-value" style="font-size:14px;">За этот месяц</div>
                </div>
            `;
            return;
        }

        const startWeight = monthData[0].weight;
        const currentWeight = monthData[monthData.length - 1].weight;
        const change = (currentWeight - startWeight).toFixed(1);
        const changePercent = ((change / startWeight) * 100).toFixed(1);

        container.innerHTML = `
            <div class="weight-stat">
                <div class="weight-stat-label">НАЧАЛО МЕСЯЦА</div>
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
    },

    updateUI() {
        this.renderCalendar();
        this.renderWeightChart();
        this.renderWeightStats();
        this.updateMonthLabel();
    }
};
