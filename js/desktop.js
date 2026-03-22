/* ============================================
   PARROT OS PORTFOLIO - Desktop
   ============================================ */

class Desktop {
    constructor() {
        this.icons = document.querySelectorAll('.desktop-icon');
        this.selectedIcon = null;
        this.clickTimeout = null;
        this.contextMenu = document.getElementById('context-menu');
        this.selectionBox = document.getElementById('selection-box');
        this.isSelecting = false;
        this.selectionStart = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        this.setupIconEvents();
        this.setupDesktopEvents();
        this.setupContextMenu();
        this.setupSelectionBox();
    }
    
    setupIconEvents() {
        this.icons.forEach(icon => {
            // Один клик - выделение
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectIcon(icon);
                
                // Проверка на двойной клик
                if (this.clickTimeout) {
                    clearTimeout(this.clickTimeout);
                    this.clickTimeout = null;
                    this.openIcon(icon);
                } else {
                    this.clickTimeout = setTimeout(() => {
                        this.clickTimeout = null;
                    }, 300);
                }
            });
            
            // Двойной клик (альтернатива)
            icon.addEventListener('dblclick', (e) => {
                e.preventDefault();
                this.openIcon(icon);
            });
        });
    }
    
    setupDesktopEvents() {
        const desktop = document.getElementById('desktop');
        
        // Клик по пустому месту - снять выделение
        desktop.addEventListener('click', (e) => {
            if (e.target === desktop || e.target.classList.contains('desktop-icons')) {
                this.deselectAll();
            }
        });
    }
    
    setupSelectionBox() {
        const desktop = document.getElementById('desktop');
        
        desktop.addEventListener('mousedown', (e) => {
            // Только левая кнопка мыши
            if (e.button !== 0) return;
            
            // Не начинать выделение если клик на иконку, окно или таскбар
            if (e.target.closest('.desktop-icon') || 
                e.target.closest('.window') || 
                e.target.closest('.taskbar') ||
                e.target.closest('.context-menu') ||
                e.target.closest('.start-menu') ||
                e.target.closest('.calendar-popup')) {
                return;
            }
            
            this.isSelecting = true;
            this.selectionStart = { x: e.clientX, y: e.clientY };
            
            this.selectionBox.style.left = e.clientX + 'px';
            this.selectionBox.style.top = e.clientY + 'px';
            this.selectionBox.style.width = '0px';
            this.selectionBox.style.height = '0px';
            this.selectionBox.classList.add('active');
            
            this.deselectAll();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isSelecting) return;
            
            const currentX = e.clientX;
            const currentY = e.clientY;
            
            const left = Math.min(this.selectionStart.x, currentX);
            const top = Math.min(this.selectionStart.y, currentY);
            const width = Math.abs(currentX - this.selectionStart.x);
            const height = Math.abs(currentY - this.selectionStart.y);
            
            this.selectionBox.style.left = left + 'px';
            this.selectionBox.style.top = top + 'px';
            this.selectionBox.style.width = width + 'px';
            this.selectionBox.style.height = height + 'px';
            
            // Проверяем какие иконки попали в область выделения
            this.checkIconsInSelection(left, top, width, height);
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isSelecting) {
                this.isSelecting = false;
                this.selectionBox.classList.remove('active');
            }
        });
    }
    
    checkIconsInSelection(selLeft, selTop, selWidth, selHeight) {
        const selRight = selLeft + selWidth;
        const selBottom = selTop + selHeight;
        
        this.icons.forEach(icon => {
            const rect = icon.getBoundingClientRect();
            
            // Проверяем пересечение
            const overlaps = !(rect.right < selLeft || 
                              rect.left > selRight || 
                              rect.bottom < selTop || 
                              rect.top > selBottom);
            
            if (overlaps) {
                icon.classList.add('selected');
            } else {
                icon.classList.remove('selected');
            }
        });
    }
    
    setupContextMenu() {
        const desktop = document.getElementById('desktop');
        
        // Правый клик по рабочему столу
        desktop.addEventListener('contextmenu', (e) => {
            // Только если клик по десктопу, не по окнам
            if (e.target.closest('.window') || e.target.closest('.taskbar')) {
                return;
            }
            
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY);
        });
        
        // Скрыть меню при клике
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });
        
        // Обработка пунктов меню
        this.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleContextAction(action);
                this.hideContextMenu();
            });
        });
    }
    
    showContextMenu(x, y) {
        this.contextMenu.classList.add('open');
        
        // Проверка границ экрана
        const menuWidth = this.contextMenu.offsetWidth;
        const menuHeight = this.contextMenu.offsetHeight;
        
        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 10;
        }
        if (y + menuHeight > window.innerHeight - 48) {
            y = window.innerHeight - 48 - menuHeight - 10;
        }
        
        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';
    }
    
    hideContextMenu() {
        this.contextMenu.classList.remove('open');
    }
    
    handleContextAction(action) {
        switch (action) {
            case 'open-terminal':
                if (window.windowManager) {
                    window.windowManager.openWindow('terminal');
                }
                break;
            case 'open-projects':
                if (window.windowManager) {
                    window.windowManager.openWindow('projects');
                }
                break;
            case 'refresh':
                location.reload();
                break;
            case 'settings':
                alert('Настройки в разработке 🛠️');
                break;
            case 'about-system':
                if (window.terminal) {
                    if (window.windowManager) {
                        window.windowManager.openWindow('terminal');
                    }
                    setTimeout(() => {
                        window.terminal.executeCommand('neofetch');
                    }, 300);
                }
                break;
        }
    }
    
    selectIcon(icon) {
        this.deselectAll();
        icon.classList.add('selected');
        this.selectedIcon = icon;
    }
    
    deselectAll() {
        this.icons.forEach(icon => {
            icon.classList.remove('selected');
        });
        this.selectedIcon = null;
    }
    
    openIcon(icon) {
        const windowId = icon.dataset.window;
        
        if (window.windowManager && windowId) {
            window.windowManager.openWindow(windowId);
        }
    }
}

// ============================================
// Projects Folder Navigation
// ============================================
class ProjectsNavigator {
    constructor() {
        this.backBtn = document.getElementById('projects-back');
        this.pathEl = document.getElementById('projects-path');
        this.mainView = document.getElementById('projects-main');
        this.currentFolder = null;
        
        this.folders = {
            'telegram-bots': document.getElementById('projects-telegram-bots'),
            'scrapers': document.getElementById('projects-scrapers'),
            'apps': document.getElementById('projects-apps'),
            'crypto': document.getElementById('projects-crypto')
        };
        
        this.init();
    }
    
    init() {
        // Setup folder click events
        document.querySelectorAll('.folder-item').forEach(folder => {
            folder.addEventListener('dblclick', () => {
                this.openFolder(folder.dataset.folder);
            });
        });
        
        // Back button
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => {
                this.goBack();
            });
        }
    }
    
    openFolder(folderName) {
        if (!this.folders[folderName]) return;
        
        // Hide main view
        if (this.mainView) this.mainView.classList.add('hidden');
        
        // Hide all folder views
        Object.values(this.folders).forEach(view => {
            if (view) view.classList.add('hidden');
        });
        
        // Show selected folder
        this.folders[folderName].classList.remove('hidden');
        
        // Update path
        if (this.pathEl) {
            this.pathEl.textContent = `~/projects/${folderName}`;
        }
        
        // Enable back button
        if (this.backBtn) {
            this.backBtn.disabled = false;
        }
        
        this.currentFolder = folderName;
    }
    
    goBack() {
        // Hide all folder views
        Object.values(this.folders).forEach(view => {
            if (view) view.classList.add('hidden');
        });
        
        // Show main view
        if (this.mainView) this.mainView.classList.remove('hidden');
        
        // Update path
        if (this.pathEl) {
            this.pathEl.textContent = '~/projects';
        }
        
        // Disable back button
        if (this.backBtn) {
            this.backBtn.disabled = true;
        }
        
        this.currentFolder = null;
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.projectsNavigator = new ProjectsNavigator();
});

// Экспортируем глобально
window.Desktop = Desktop;
