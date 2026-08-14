// Application Memory State
let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];
let currentFilter = 'all';

// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');

// ==================== LOCALSTORAGE SYNC ENGINE ====================
function saveTasks() {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
}

// ==================== RENDERING / ENGINE VIEW LAYER ====================
function renderTasks() {
    taskList.innerHTML = '';

    // Filter tasks array before looping to paint elements
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true; // Handles 'all'
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<li style="justify-content: center; background: transparent; border: none; font-size: 12px; color: var(--text-muted);">No tasks here.</li>`;
        return;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', task.id);

        li.innerHTML = `
            <span class="task-text">${escapeHTML(task.text)}</span>
            <div class="task-actions">
                <button class="action-btn toggle-btn" title="Toggle Status">${task.completed ? '↩️' : '✔️'}</button>
                <button class="action-btn delete-btn" title="Delete Task">❌</button>
            </div>
        `;

        taskList.appendChild(li);
    });
}

// Simple security helper preventing malicious XSS payload injections
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, match => {
        const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return entityMap[match];
    });
}

// ==================== LOGIC ACTIONS ====================
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    taskInput.value = '';
    taskInput.focus();
}

function handleTaskAction(e) {
    const target = e.target;
    const taskItem = target.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.getAttribute('data-id');

    if (target.closest('.toggle-btn') || target.closest('.task-text')) {
        // Toggle Task Complete State
        tasks = tasks.map(task => {
            if (task.id === taskId) task.completed = !task.completed;
            return task;
        });
        saveTasks();
        renderTasks();
    } 
    
    else if (target.closest('.delete-btn')) {
        // Fade out animation before removing object from DOM reference arrays
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
        }, 200);
    }
}

// ==================== EVENT ROUTER LISTENERS ====================
addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
});

taskList.addEventListener('click', handleTaskAction);

// Setup filter button toggles
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentFilter = btn.getAttribute('data-filter');
        renderTasks();
    });
});

// ==================== LIGHT/DARK THEME MANAGEMENT ====================
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.querySelector('.mode-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

// Initial Render on startup run execution
renderTasks();