/* ============================================
   PARROT OS PORTFOLIO - Window Manager
   ============================================ */

class WindowManager {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.zIndexCounter = 100;
        this.dragState = null;
        this.resizeState = null;
        
        this.init();
    }
    
    init() {
        // Найти все окна
        document.querySelectorAll('.window').forEach(window => {
            const windowId = window.dataset.window;
            this.windows.set(windowId, {
                element: window,
                isMinimized: false,
                isMaximized: false,
                previousState: null
            });
            
            this.setupWindowEvents(window);
        });
        
        // Установить терминал как активное окно
        const terminalWindow = document.getElementById('window-terminal');
        if (terminalWindow) {
            this.activateWindow('terminal');
        }
        
        // Глобальные события мыши
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }
    
    setupWindowEvents(windowEl) {
        const header = windowEl.querySelector('.window-header');
        const controls = windowEl.querySelectorAll('.window-btn');
        
        // Клик по окну - активация
        windowEl.addEventListener('mousedown', () => {
            this.activateWindow(windowEl.dataset.window);
        });
        
        // Перетаскивание
        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-btn')) return;
            this.startDrag(e, windowEl);
        });
        
        // Кнопки управления
        controls.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const windowId = windowEl.dataset.window;
                
                switch (action) {
                    case 'close':
                        this.closeWindow(windowId);
                        break;
                    case 'minimize':
                        this.minimizeWindow(windowId);
                        break;
                    case 'maximize':
                        this.toggleMaximize(windowId);
                        break;
                }
            });
        });
        
        // Ресайз
        windowEl.addEventListener('mousedown', (e) => {
            const rect = windowEl.getBoundingClientRect();
            const isResizeArea = 
                e.clientX > rect.right - 15 && 
                e.clientY > rect.bottom - 15;
            
            if (isResizeArea) {
                this.startResize(e, windowEl);
            }
        });
    }
    
    activateWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        // Убрать активный класс у всех окон
        this.windows.forEach(data => {
            data.element.classList.remove('active');
        });
        
        // Активировать выбранное окно
        windowData.element.classList.add('active');
        windowData.element.style.zIndex = ++this.zIndexCounter;
        this.activeWindow = windowId;
        
        // Обновить таскбар
        this.updateTaskbar();
    }
    
    openWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        windowData.element.classList.remove('hidden', 'minimized');
        windowData.isMinimized = false;
        this.activateWindow(windowId);
    }
    
    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        windowData.element.classList.add('hidden');
        windowData.isMinimized = false;
        windowData.isMaximized = false;
        
        // Сбросить максимизацию
        windowData.element.classList.remove('maximized');
        
        // Обновить таскбар
        this.updateTaskbar();
    }
    
    minimizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        windowData.element.classList.add('minimized');
        windowData.isMinimized = true;
        
        // Активировать следующее окно
        this.activateNextWindow();
        
        // Обновить таскбар
        this.updateTaskbar();
    }
    
    toggleMaximize(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        if (windowData.isMaximized) {
            // Восстановить
            windowData.element.classList.remove('maximized');
            
            if (windowData.previousState) {
                windowData.element.style.width = windowData.previousState.width;
                windowData.element.style.height = windowData.previousState.height;
                windowData.element.style.left = windowData.previousState.left;
                windowData.element.style.top = windowData.previousState.top;
            }
            
            windowData.isMaximized = false;
        } else {
            // Сохранить текущее состояние
            windowData.previousState = {
                width: windowData.element.style.width,
                height: windowData.element.style.height,
                left: windowData.element.style.left,
                top: windowData.element.style.top
            };
            
            windowData.element.classList.add('maximized');
            windowData.isMaximized = true;
        }
    }
    
    restoreWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        if (windowData.isMinimized) {
            windowData.element.classList.remove('minimized');
            windowData.isMinimized = false;
            this.activateWindow(windowId);
        } else if (this.activeWindow === windowId) {
            this.minimizeWindow(windowId);
        } else {
            this.activateWindow(windowId);
        }
        
        this.updateTaskbar();
    }
    
    activateNextWindow() {
        let foundActive = null;
        
        this.windows.forEach((data, id) => {
            if (!data.element.classList.contains('hidden') && 
                !data.element.classList.contains('minimized')) {
                foundActive = id;
            }
        });
        
        if (foundActive) {
            this.activateWindow(foundActive);
        } else {
            this.activeWindow = null;
        }
    }
    
    // Drag & Drop
    startDrag(e, windowEl) {
        const windowData = this.windows.get(windowEl.dataset.window);
        if (windowData.isMaximized) return;
        
        const rect = windowEl.getBoundingClientRect();
        
        this.dragState = {
            window: windowEl,
            startX: e.clientX,
            startY: e.clientY,
            startLeft: rect.left,
            startTop: rect.top
        };
        
        windowEl.classList.add('dragging');
        e.preventDefault();
    }
    
    handleMouseMove(e) {
        if (this.dragState) {
            const deltaX = e.clientX - this.dragState.startX;
            const deltaY = e.clientY - this.dragState.startY;
            
            let newLeft = this.dragState.startLeft + deltaX;
            let newTop = this.dragState.startTop + deltaY;
            
            // Ограничения
            const maxTop = window.innerHeight - 48 - 50;
            newTop = Math.max(0, Math.min(newTop, maxTop));
            newLeft = Math.max(-this.dragState.window.offsetWidth + 100, newLeft);
            
            this.dragState.window.style.left = newLeft + 'px';
            this.dragState.window.style.top = newTop + 'px';
        }
        
        if (this.resizeState) {
            const deltaX = e.clientX - this.resizeState.startX;
            const deltaY = e.clientY - this.resizeState.startY;
            
            let newWidth = this.resizeState.startWidth + deltaX;
            let newHeight = this.resizeState.startHeight + deltaY;
            
            // Минимальные размеры
            newWidth = Math.max(300, newWidth);
            newHeight = Math.max(200, newHeight);
            
            this.resizeState.window.style.width = newWidth + 'px';
            this.resizeState.window.style.height = newHeight + 'px';
        }
    }
    
    handleMouseUp() {
        if (this.dragState) {
            this.dragState.window.classList.remove('dragging');
            this.dragState = null;
        }
        
        if (this.resizeState) {
            this.resizeState.window.classList.remove('resizing');
            this.resizeState = null;
        }
    }
    
    // Resize
    startResize(e, windowEl) {
        const windowData = this.windows.get(windowEl.dataset.window);
        if (windowData.isMaximized) return;
        
        this.resizeState = {
            window: windowEl,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: windowEl.offsetWidth,
            startHeight: windowEl.offsetHeight
        };
        
        windowEl.classList.add('resizing');
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Taskbar Update
    updateTaskbar() {
        const taskbarWindows = document.getElementById('taskbar-windows');
        if (!taskbarWindows) return;
        
        taskbarWindows.innerHTML = '';
        
        const icons = {
            terminal: '💻',
            projects: '📁',
            about: '📄',
            skills: '⚡',
            contact: '📧'
        };
        
        const titles = {
            terminal: 'Terminal',
            projects: 'Мои проекты',
            about: 'About.txt',
            skills: 'Skills.sh',
            contact: 'Contact'
        };
        
        this.windows.forEach((data, id) => {
            if (!data.element.classList.contains('hidden')) {
                const item = document.createElement('div');
                item.className = 'taskbar-item';
                if (this.activeWindow === id && !data.isMinimized) {
                    item.classList.add('active');
                }
                
                item.innerHTML = `
                    <span class="taskbar-item-icon">${icons[id] || '📄'}</span>
                    <span class="taskbar-item-title">${titles[id] || id}</span>
                `;
                
                item.addEventListener('click', () => {
                    this.restoreWindow(id);
                });
                
                taskbarWindows.appendChild(item);
            }
        });
    }
    
    // Проверка видимости окна
    isWindowOpen(windowId) {
        const windowData = this.windows.get(windowId);
        return windowData && !windowData.element.classList.contains('hidden');
    }
}

// Экспортируем глобально
window.WindowManager = WindowManager;
