/* ============================================
   PARROT OS PORTFOLIO - Terminal
   ============================================ */

class Terminal {
    constructor(outputEl, inputEl) {
        this.output = outputEl;
        this.input = inputEl;
        this.history = [];
        this.historyIndex = -1;
        this.isTyping = false;
        
        this.commands = {
            help: this.cmdHelp.bind(this),
            about: this.cmdAbout.bind(this),
            skills: this.cmdSkills.bind(this),
            projects: this.cmdProjects.bind(this),
            contact: this.cmdContact.bind(this),
            clear: this.cmdClear.bind(this),
            whoami: this.cmdWhoami.bind(this),
            neofetch: this.cmdNeofetch.bind(this),
            ls: this.cmdLs.bind(this),
            cat: this.cmdCat.bind(this),
            sudo: this.cmdSudo.bind(this),
            exit: this.cmdExit.bind(this),
            date: this.cmdDate.bind(this),
            uname: this.cmdUname.bind(this),
            pwd: this.cmdPwd.bind(this),
            echo: this.cmdEcho.bind(this),
            hack: this.cmdHack.bind(this),
            matrix: this.cmdMatrix.bind(this)
        };
        
        this.init();
    }
    
    init() {
        // Обработка ввода
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        
        // Фокус на инпут при клике на терминал
        this.output.parentElement.addEventListener('click', () => {
            this.input.focus();
        });
        
        // Запуск приветствия
        this.showWelcome();
    }
    
    async showWelcome() {
        await this.typeLines([
            { text: '┌──────────────────────────────────────────────────────────┐', class: 'output-cyan' },
            { text: '│                   PARROT OS PORTFOLIO                    │', class: 'output-cyan' },
            { text: '│                    Welcome, stranger                     │', class: 'output-cyan' },
            { text: '└──────────────────────────────────────────────────────────┘', class: 'output-cyan' },
            { text: '' },
            { text: '[*] Initializing secure connection...', class: 'output-green' },
            { text: '[*] Encryption: AES-256-GCM', class: 'output-green' },
            { text: '[*] VPN Status: Active', class: 'output-green' },
            { text: '[+] Connection established!', class: 'output-green' },
            { text: '' }
        ], 3);
        
        await this.cmdNeofetch();
        
        this.printLine('');
        this.printLine('Type "help" to see available commands.', 'output-comment');
        this.printLine('');
        
        this.input.focus();
    }
    
    handleInput(e) {
        if (this.isTyping) return;
        
        if (e.key === 'Enter') {
            const cmd = this.input.value.trim();
            this.input.value = '';
            
            if (cmd) {
                this.history.push(cmd);
                this.historyIndex = this.history.length;
                this.executeCommand(cmd);
            } else {
                this.printPrompt();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.autocomplete();
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            this.cmdClear();
        }
    }
    
    autocomplete() {
        const partial = this.input.value.toLowerCase();
        if (!partial) return;
        
        const matches = Object.keys(this.commands).filter(cmd => 
            cmd.startsWith(partial)
        );
        
        if (matches.length === 1) {
            this.input.value = matches[0];
        } else if (matches.length > 1) {
            this.printPrompt(partial);
            this.printLine(matches.join('  '), 'output-cyan');
        }
    }
    
    executeCommand(cmdLine) {
        this.printPrompt(cmdLine);
        
        const parts = cmdLine.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.printLine(`bash: ${cmd}: command not found`, 'terminal-error');
            this.printLine(`Type "help" for available commands.`, 'output-comment');
        }
    }
    
    printPrompt(cmd = '') {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `
            <span class="output-cyan">┌──(</span><span class="output-red">root㉿parrot</span><span class="output-cyan">)-[</span><span class="output-purple">~</span><span class="output-cyan">]</span>
            <br>
            <span class="output-cyan">└─#</span> <span class="command-input">${this.escapeHtml(cmd)}</span>
        `;
        this.output.appendChild(line);
        this.scrollToBottom();
    }
    
    printLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.innerHTML = text;
        this.output.appendChild(line);
        this.scrollToBottom();
    }
    
    async typeLines(lines, delay = 3) {
        this.isTyping = true;
        
        for (const lineData of lines) {
            const line = document.createElement('div');
            line.className = `terminal-line ${lineData.class || ''}`;
            this.output.appendChild(line);
            
            for (const char of lineData.text) {
                line.innerHTML += char === ' ' ? '&nbsp;' : this.escapeHtml(char);
                await this.sleep(delay);
                this.scrollToBottom();
            }
        }
        
        this.isTyping = false;
    }
    
    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ==================== COMMANDS ====================
    
    cmdHelp() {
        const helpText = `
<span class="output-cyan">Available commands:</span>

<span class="help-command">help</span>      <span class="help-description">- Show this help message</span>
<span class="help-command">about</span>     <span class="help-description">- Learn about me</span>
<span class="help-command">skills</span>    <span class="help-description">- View my technical skills</span>
<span class="help-command">projects</span>  <span class="help-description">- Browse my projects</span>
<span class="help-command">contact</span>   <span class="help-description">- Get my contact info</span>
<span class="help-command">neofetch</span>  <span class="help-description">- Display system info</span>
<span class="help-command">whoami</span>    <span class="help-description">- Display current user</span>
<span class="help-command">clear</span>     <span class="help-description">- Clear terminal</span>
<span class="help-command">ls</span>        <span class="help-description">- List directory contents</span>
<span class="help-command">cat</span>       <span class="help-description">- Display file contents</span>
<span class="help-command">pwd</span>       <span class="help-description">- Print working directory</span>
<span class="help-command">date</span>      <span class="help-description">- Show current date/time</span>
<span class="help-command">uname</span>     <span class="help-description">- Print system information</span>
<span class="help-command">hack</span>      <span class="help-description">- ???</span>
<span class="help-command">matrix</span>    <span class="help-description">- Enter the Matrix</span>
<span class="help-command">exit</span>      <span class="help-description">- Close terminal</span>

<span class="output-comment">Tip: Use Tab for autocomplete, ↑↓ for history</span>
`;
        this.printLine(helpText);
    }
    
    cmdAbout() {
        if (window.windowManager) {
            window.windowManager.openWindow('about');
        }
        this.printLine('[+] Opening About.txt...', 'output-green');
    }
    
    cmdSkills() {
        if (window.windowManager) {
            window.windowManager.openWindow('skills');
        }
        this.printLine('[+] Executing Skills.sh...', 'output-green');
    }
    
    cmdProjects() {
        if (window.windowManager) {
            window.windowManager.openWindow('projects');
        }
        this.printLine('[+] Opening projects folder...', 'output-green');
    }
    
    cmdContact() {
        if (window.windowManager) {
            window.windowManager.openWindow('contact');
        }
        this.printLine('[+] Loading contact info...', 'output-green');
    }
    
    cmdClear() {
        this.output.innerHTML = '';
    }
    
    cmdWhoami() {
        this.printLine('root', 'output-green');
    }
    
    cmdNeofetch() {
        const logo = `
<span class="neofetch-logo">
  ██████╗  █████╗ ██████╗ ██████╗  ██████╗ ████████╗
  ██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝
  ██████╔╝███████║██████╔╝██████╔╝██║   ██║   ██║   
  ██╔═══╝ ██╔══██║██╔══██╗██╔══██╗██║   ██║   ██║   
  ██║     ██║  ██║██║  ██║██║  ██║╚██████╔╝   ██║   
  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚═╝   
</span>`;

        const info = `
${logo}
<span class="output-cyan">root</span>@<span class="output-cyan">parrot</span>
<span class="output-cyan">───────────────────────</span>
<span class="output-cyan">OS:</span> Parrot Security 5.3
<span class="output-cyan">Host:</span> Portfolio Website
<span class="output-cyan">Kernel:</span> JavaScript ES2024
<span class="output-cyan">Uptime:</span> ${this.getUptime()}
<span class="output-cyan">Shell:</span> bash 5.1.16
<span class="output-cyan">Terminal:</span> Web Terminal
<span class="output-cyan">CPU:</span> Your Browser @ ∞ GHz
<span class="output-cyan">Memory:</span> ${Math.floor(Math.random() * 4000 + 4000)}MB / 16384MB

<span class="output-cyan">Developer:</span> Oleksandr Zachepa
<span class="output-cyan">Focus:</span> Go, Python, Automation
<span class="output-cyan">Status:</span> <span class="output-green">Full Stack Engineer</span>

<span style="background:#ff5555;color:#ff5555;">███</span><span style="background:#50fa7b;color:#50fa7b;">███</span><span style="background:#f1fa8c;color:#f1fa8c;">███</span><span style="background:#bd93f9;color:#bd93f9;">███</span><span style="background:#ff79c6;color:#ff79c6;">███</span><span style="background:#8be9fd;color:#8be9fd;">███</span><span style="background:#f8f8f2;color:#f8f8f2;">███</span>
`;
        this.printLine(info);
    }
    
    getUptime() {
        const now = new Date();
        const hours = now.getHours();
        const mins = now.getMinutes();
        return `${hours} hours, ${mins} mins`;
    }
    
    cmdLs(args) {
        const files = [
            { name: 'projects/', type: 'dir', color: 'output-cyan' },
            { name: 'skills.sh', type: 'exec', color: 'output-green' },
            { name: 'about.txt', type: 'file', color: 'output-text' },
            { name: 'contact.txt', type: 'file', color: 'output-text' },
            { name: '.secret', type: 'hidden', color: 'output-purple' },
            { name: 'resume.pdf', type: 'file', color: 'output-red' }
        ];
        
        if (args.includes('-la') || args.includes('-l')) {
            this.printLine('total 42', 'output-text');
            files.forEach(f => {
                const perms = f.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
                const size = Math.floor(Math.random() * 10000);
                this.printLine(
                    `${perms}  1 root root  ${size.toString().padStart(5)} Mar 18 ${f.name}`,
                    f.color
                );
            });
        } else {
            let output = '';
            files.forEach(f => {
                if (!f.name.startsWith('.') || args.includes('-a')) {
                    output += `<span class="${f.color}">${f.name}</span>  `;
                }
            });
            this.printLine(output);
        }
    }
    
    cmdCat(args) {
        const file = args[0];
        
        if (!file) {
            this.printLine('cat: missing file operand', 'terminal-error');
            return;
        }
        
        const files = {
            'about.txt': `
Name: Alex
Location: Russia
Status: Security Enthusiast & Developer

I specialize in cybersecurity and building privacy-focused applications.
Always learning, always hacking (ethically).
`,
            'contact.txt': `
Email: your@email.com
Telegram: @yourusername
GitHub: github.com/yourusername
`,
            '.secret': `
<span class="output-green">
██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ 
██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
███████║███████║██║     █████╔╝ █████╗  ██████╔╝
██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
</span>
You found the secret! 🎉
Flag: CTF{y0u_f0und_th3_s3cr3t}
`,
            'skills.sh': `#!/bin/bash
# Skills Assessment Script

echo "Loading skills..."

LANGUAGES=("Python" "JavaScript" "Go" "Bash")
TOOLS=("Nmap" "Burp Suite" "Wireshark" "Metasploit")
OTHER=("Linux" "Docker" "Git" "AWS")

for skill in "\${LANGUAGES[@]}"; do
    echo "[+] $skill"
done
`
        };
        
        if (files[file]) {
            this.printLine(files[file]);
        } else {
            this.printLine(`cat: ${file}: No such file or directory`, 'terminal-error');
        }
    }
    
    cmdSudo(args) {
        if (args[0] === 'rm' && args.includes('-rf') && args.includes('/')) {
            this.printLine('Nice try! 😄', 'output-yellow');
            this.printLine('This would destroy everything. Command blocked.', 'output-red');
        } else {
            this.printLine('[sudo] password for root: ********', 'output-text');
            this.printLine('You are already root! 🔓', 'output-green');
        }
    }
    
    cmdExit() {
        this.printLine('Closing terminal...', 'output-yellow');
        setTimeout(() => {
            if (window.windowManager) {
                window.windowManager.closeWindow('terminal');
            }
        }, 500);
    }
    
    cmdDate() {
        const now = new Date();
        this.printLine(now.toString(), 'output-text');
    }
    
    cmdUname(args) {
        if (args.includes('-a')) {
            this.printLine('Linux parrot 5.18.0-parrot1-amd64 #1 SMP Parrot x86_64 GNU/Linux', 'output-text');
        } else {
            this.printLine('Linux', 'output-text');
        }
    }
    
    cmdPwd() {
        this.printLine('/root', 'output-text');
    }
    
    cmdEcho(args) {
        this.printLine(args.join(' '), 'output-text');
    }
    
    async cmdHack() {
        const lines = [
            '[*] Initializing hack sequence...',
            '[*] Bypassing firewall...',
            '[*] Injecting payload...',
            '[*] Establishing backdoor...',
            '[*] Extracting data...',
            '[+] Access granted!',
            '',
            'Just kidding! This is a portfolio website 😉',
            'But thanks for your curiosity!'
        ];
        
        await this.typeLines(
            lines.map(text => ({ text, class: text.startsWith('[+]') ? 'output-green' : 'output-yellow' })),
            50
        );
    }
    
    async cmdMatrix() {
        this.printLine('Entering the Matrix...', 'output-green');
        
        const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
        
        for (let i = 0; i < 10; i++) {
            let line = '';
            for (let j = 0; j < 60; j++) {
                line += chars[Math.floor(Math.random() * chars.length)];
            }
            this.printLine(line, 'output-green');
            await this.sleep(100);
        }
        
        this.printLine('');
        this.printLine('Wake up, Neo...', 'output-green');
    }
}

// Экспортируем глобально
window.Terminal = Terminal;
