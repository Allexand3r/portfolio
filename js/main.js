/* ============================================
   PARROT OS PORTFOLIO - Main Entry Point
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Window Manager
    window.windowManager = new WindowManager();
    
    // Инициализация Desktop (иконки)
    window.desktop = new Desktop();
    
    // Инициализация Terminal
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    
    if (terminalOutput && terminalInput) {
        window.terminal = new Terminal(terminalOutput, terminalInput);
    }
    
    // Инициализация часов и календаря
    initDateTime();
    
    // Инициализация Start Menu
    initStartMenu();
    
    // Обновить таскбар
    window.windowManager.updateTaskbar();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + Tab - переключение окон
        if (e.altKey && e.key === 'Tab') {
            e.preventDefault();
            cycleWindows();
        }
        
        // Escape - закрыть меню
        if (e.key === 'Escape') {
            closeAllPopups();
        }
        
        // Super key (Win) - открыть меню Пуск
        if (e.key === 'Meta' || e.key === 'OS') {
            e.preventDefault();
            toggleStartMenu();
        }
    });
    
    console.log('%c🔒 Parrot OS Portfolio Loaded', 
        'color: #00ffcc; font-size: 20px; font-weight: bold;');
    console.log('%cType "help" in terminal for available commands', 
        'color: #50fa7b; font-size: 14px;');
});

// ============================================
// DATE & TIME + CALENDAR
// ============================================

let currentCalendarDate = new Date();

function initDateTime() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Клик по дате/времени - открыть календарь
    const datetimeEl = document.getElementById('datetime');
    const calendarPopup = document.getElementById('calendar-popup');
    
    datetimeEl.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCalendar();
    });
    
    // Навигация календаря
    document.getElementById('cal-prev').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('cal-next').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Закрытие при клике вне
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.calendar-popup') && !e.target.closest('.datetime')) {
            calendarPopup.classList.remove('open');
        }
    });
    
    renderCalendar();
}

function updateDateTime() {
    const dateTimeEl = document.getElementById('datetime');
    const calendarTime = document.getElementById('calendar-time');
    if (!dateTimeEl) return;
    
    const now = new Date();
    
    const time = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const date = now.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
    });
    
    dateTimeEl.querySelector('.time').textContent = time;
    dateTimeEl.querySelector('.date').textContent = date;
    
    // Обновить время в календаре
    if (calendarTime) {
        calendarTime.textContent = now.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

function toggleCalendar() {
    const calendarPopup = document.getElementById('calendar-popup');
    const startMenu = document.getElementById('start-menu');
    
    startMenu.classList.remove('open');
    calendarPopup.classList.toggle('open');
    
    if (calendarPopup.classList.contains('open')) {
        currentCalendarDate = new Date();
        renderCalendar();
    }
}

function renderCalendar() {
    const titleEl = document.getElementById('calendar-title');
    const daysEl = document.getElementById('calendar-days');
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Название месяца
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    titleEl.textContent = `${monthNames[month]} ${year}`;
    
    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // День недели первого числа (0 = Вс, нужно сделать Пн = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    
    // Текущая дата
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    
    let html = '';
    
    // Дни предыдущего месяца
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        html += `<div class="calendar-day other-month">${prevMonthLastDay - i}</div>`;
    }
    
    // Дни текущего месяца
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const isToday = isCurrentMonth && day === today.getDate();
        html += `<div class="calendar-day${isToday ? ' today' : ''}">${day}</div>`;
    }
    
    // Дни следующего месяца
    const remainingDays = 42 - (startDay + lastDay.getDate());
    for (let i = 1; i <= remainingDays; i++) {
        html += `<div class="calendar-day other-month">${i}</div>`;
    }
    
    daysEl.innerHTML = html;
}

// ============================================
// START MENU
// ============================================

function initStartMenu() {
    const startBtn = document.getElementById('start-btn');
    const startMenu = document.getElementById('start-menu');
    
    // Клик по кнопке Пуск
    startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStartMenu();
    });
    
    // Закрытие при клике вне
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.start-menu') && !e.target.closest('.start-btn')) {
            startMenu.classList.remove('open');
        }
    });
    
    // Приложения в меню
    startMenu.querySelectorAll('.start-menu-app').forEach(app => {
        app.addEventListener('click', () => {
            const windowId = app.dataset.window;
            const action = app.dataset.action;
            
            if (windowId && window.windowManager) {
                window.windowManager.openWindow(windowId);
            }
            
            if (action === 'neofetch' && window.terminal) {
                if (window.windowManager) {
                    window.windowManager.openWindow('terminal');
                }
                setTimeout(() => {
                    window.terminal.executeCommand('neofetch');
                }, 300);
            }
            
            startMenu.classList.remove('open');
        });
    });
    
    // Кнопки в футере
    startMenu.querySelectorAll('.start-menu-footer-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            
            if (action === 'lock') {
                showLockScreen();
            } else if (action === 'shutdown') {
                showShutdown();
            }
            
            startMenu.classList.remove('open');
        });
    });
}

function toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');
    const calendarPopup = document.getElementById('calendar-popup');
    
    calendarPopup.classList.remove('open');
    startMenu.classList.toggle('open');
    
    // Фокус на поиск
    if (startMenu.classList.contains('open')) {
        const searchInput = document.getElementById('start-search');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }
}

function closeAllPopups() {
    document.getElementById('start-menu').classList.remove('open');
    document.getElementById('calendar-popup').classList.remove('open');
    document.getElementById('context-menu').classList.remove('open');
}

function showLockScreen() {
    // Простая заглушка
    document.body.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0d0d1a 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'JetBrains Mono', monospace;
            color: #e0e0e0;
            cursor: pointer;
        " onclick="location.reload()">
            <div style="font-size: 80px; margin-bottom: 20px;">🔒</div>
            <div style="font-size: 48px; color: #00ffcc; text-shadow: 0 0 20px rgba(0,255,204,0.5);">
                ${new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
            </div>
            <div style="font-size: 18px; color: #a0a0a0; margin-top: 10px;">
                ${new Date().toLocaleDateString('ru-RU', {weekday: 'long', day: 'numeric', month: 'long'})}
            </div>
            <div style="margin-top: 40px; color: #666;">Кликните для разблокировки</div>
        </div>
    `;
}

function showShutdown() {
    document.body.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'JetBrains Mono', monospace;
            color: #00ffcc;
            animation: fadeOut 2s forwards;
        ">
            <div style="font-size: 14px; opacity: 0.8;">Shutting down...</div>
            <div style="margin-top: 20px; font-size: 12px; color: #666;">
                Thanks for visiting! 🦜
            </div>
        </div>
        <style>
            @keyframes fadeOut {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
        </style>
    `;
    
    setTimeout(() => {
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'JetBrains Mono', monospace;
                color: #333;
                cursor: pointer;
            " onclick="location.reload()">
                Click to boot
            </div>
        `;
    }, 2000);
}

// Циклическое переключение окон
function cycleWindows() {
    const windows = Array.from(window.windowManager.windows.entries())
        .filter(([id, data]) => !data.element.classList.contains('hidden'))
        .map(([id]) => id);
    
    if (windows.length === 0) return;
    
    const currentIndex = windows.indexOf(window.windowManager.activeWindow);
    const nextIndex = (currentIndex + 1) % windows.length;
    
    window.windowManager.activateWindow(windows[nextIndex]);
}
