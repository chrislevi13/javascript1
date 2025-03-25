class Task {
    constructor(name, description, dueDate, status = 'pending') {
        this.id = Date.now().toString();
        this.name = name;
        this.description = description;
        this.dueDate = dueDate;
        this.status = status;
    }
}

class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentEditId = null;
        
        // DOM Elements
        this.taskForm = document.getElementById('taskForm');
        this.taskNameInput = document.getElementById('taskName');
        this.taskDescriptionInput = document.getElementById('taskDescription');
        this.taskDueDateInput = document.getElementById('taskDueDate');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.updateTaskBtn = document.getElementById('updateTaskBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.tasksContainer = document.getElementById('tasksContainer');
        this.searchInput = document.getElementById('searchInput');
        this.filterAllBtn = document.getElementById('filterAll');
        this.filterPendingBtn = document.getElementById('filterPending');
        this.filterCompletedBtn = document.getElementById('filterCompleted');
        
        // Event Listeners
        this.taskForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.updateTaskBtn.addEventListener('click', () => this.updateTask());
        this.cancelEditBtn.addEventListener('click', () => this.cancelEdit());
        this.searchInput.addEventListener('input', () => this.renderTasks());
        this.filterAllBtn.addEventListener('click', () => this.renderTasks());
        this.filterPendingBtn.addEventListener('click', () => this.renderTasks('pending'));
        this.filterCompletedBtn.addEventListener('click', () => this.renderTasks('completed'));
        
        // Initial render
        this.renderTasks();
    }
    
    loadTasks() {
        const tasksJSON = localStorage.getItem('tasks');
        return tasksJSON ? JSON.parse(tasksJSON) : [];
    }
    
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        const name = this.taskNameInput.value.trim();
        const description = this.taskDescriptionInput.value.trim();
        const dueDate = this.taskDueDateInput.value;
        
        if (!name) {
            alert('Task name is required!');
            return;
        }
        
        const newTask = new Task(name, description, dueDate);
        this.tasks.push(newTask);
        this.saveTasks();
        
        this.resetForm();
        this.renderTasks();
    }
    
    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (!task) return;
        
        this.currentEditId = taskId;
        this.taskNameInput.value = task.name;
        this.taskDescriptionInput.value = task.description;
        this.taskDueDateInput.value = task.dueDate;
        
        this.addTaskBtn.style.display = 'none';
        this.updateTaskBtn.style.display = 'inline-block';
        this.cancelEditBtn.style.display = 'inline-block';
    }
    
    updateTask() {
        const name = this.taskNameInput.value.trim();
        const description = this.taskDescriptionInput.value.trim();
        const dueDate = this.taskDueDateInput.value;
        
        if (!name) {
            alert('Task name is required!');
            return;
        }
        
        const taskIndex = this.tasks.findIndex(task => task.id === this.currentEditId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].name = name;
            this.tasks[taskIndex].description = description;
            this.tasks[taskIndex].dueDate = dueDate;
            this.saveTasks();
        }
        
        this.cancelEdit();
        this.renderTasks();
    }
    
    cancelEdit() {
        this.currentEditId = null;
        this.resetForm();
        
        this.addTaskBtn.style.display = 'inline-block';
        this.updateTaskBtn.style.display = 'none';
        this.cancelEditBtn.style.display = 'none';
    }
    
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
        }
    }
    
    toggleTaskStatus(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.status = task.status === 'completed' ? 'pending' : 'completed';
            this.saveTasks();
            this.renderTasks();
        }
    }
    
    resetForm() {
        this.taskForm.reset();
    }
    
    renderTasks(statusFilter = null) {
        this.tasksContainer.innerHTML = '';
        
        if (this.tasks.length === 0) {
            this.tasksContainer.innerHTML = '<div class="no-tasks">No tasks found. Add a task to get started!</div>';
            return;
        }
        
        const searchTerm = this.searchInput.value.toLowerCase();
        
        let filteredTasks = this.tasks.filter(task => {
            const matchesSearch = task.name.toLowerCase().includes(searchTerm) || 
                                task.description.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || task.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        
        // Sort tasks by due date (tasks without due date go last)
        filteredTasks.sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
        
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task ${task.status === 'completed' ? 'completed' : ''}`;
            
            const dueDateFormatted = task.dueDate ? 
                new Date(task.dueDate).toLocaleDateString() : 'No due date';
            
            taskElement.innerHTML = `
                <div class="task-name">${task.name}</div>
                <div class="task-description">${task.description || 'No description'}</div>
                <div class="task-due-date">Due: ${dueDateFormatted}</div>
                <span class="task-status status-${task.status}">${task.status}</span>
                <div class="task-actions">
                    <button class="complete-btn" data-id="${task.id}">
                        ${task.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                    </button>
                    <button class="edit-btn" data-id="${task.id}">Edit</button>
                    <button class="delete-btn" data-id="${task.id}">Delete</button>
                </div>
            `;
            
            this.tasksContainer.appendChild(taskElement);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleTaskStatus(e.target.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editTask(e.target.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteTask(e.target.getAttribute('data-id'));
            });
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});