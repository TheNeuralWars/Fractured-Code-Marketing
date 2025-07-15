// Tasks-specific functionality
class TaskManager {
    constructor() {
        this.tasks = {};
        this.currentFilter = { person: 'all', day: 'all' };
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Filter event listeners are set up in index.html
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTask(e.target);
            } else if (e.target.classList.contains('task-expand-btn')) {
                this.toggleTaskExpansion(e.target);
            }
        });
    }

    async loadTasks() {
        try {
            app.showLoading();
            const response = await fetch('/api/tasks/daily');
            const result = await response.json();
            
            if (result.success) {
                this.tasks = result.data;
                this.renderTasks();
                this.updateTaskProgress();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to load tasks:', error);
            app.showNotification('Failed to load tasks', 'error');
        } finally {
            app.hideLoading();
        }
    }

    renderTasks() {
        const people = ['person1', 'person2', 'person3'];
        
        people.forEach(person => {
            const container = document.getElementById(`${person}-task-list`);
            if (!container || !this.tasks[person]) return;

            const filteredTasks = this.filterTasks(this.tasks[person]);
            container.innerHTML = this.generateTasksHTML(filteredTasks, person);
        });

        this.updateVisibility();
    }

    filterTasks(tasks) {
        return tasks.filter(task => {
            const dayMatch = this.currentFilter.day === 'all' || task.day === this.currentFilter.day;
            return dayMatch;
        });
    }

    generateTasksHTML(tasks, person) {
        if (tasks.length === 0) {
            return '<div class="no-tasks">No tasks match the current filter.</div>';
        }

        return tasks.map(task => this.generateTaskHTML(task, person)).join('');
    }

    generateTaskHTML(task, person) {
        const completedClass = task.completed ? 'completed' : '';
        const contextBadge = this.getContextBadge(task.context);
        const estimatedTime = task.estimatedTime ? `${task.estimatedTime} mins` : 'No estimate';
        
        return `
            <div class="task-item ${completedClass}" data-task-id="${task.id}" data-person="${person}">
                <div class="task-header">
                    <div class="task-checkbox-container">
                        <input type="checkbox" 
                               class="task-checkbox" 
                               data-task-id="${task.id}" 
                               data-person="${person}"
                               ${task.completed ? 'checked' : ''}>
                    </div>
                    <div class="task-content">
                        <div class="task-title">${this.stripMarkdown(task.text)}</div>
                        <div class="task-meta">
                            <span class="task-time">
                                <i class="fas fa-clock"></i> ${estimatedTime}
                            </span>
                            <span class="task-day">
                                <i class="fas fa-calendar"></i> ${this.capitalizeFirst(task.day)}
                            </span>
                            ${contextBadge}
                            ${task.completed && task.completedAt ? 
                                `<span class="task-completed-at">
                                    <i class="fas fa-check"></i> ${new Date(task.completedAt).toLocaleString()}
                                </span>` : ''
                            }
                        </div>
                    </div>
                    <button class="task-expand-btn" data-task-id="${task.id}">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="task-details" style="display: none;">
                    <div class="task-description">
                        ${task.description ? 
                            `<div class="description-section">
                                <h4><i class="fas fa-info-circle"></i> Description</h4>
                                <p>${task.description.replace(/\n/g, '<br>')}</p>
                            </div>` : ''
                        }
                        ${task.context && task.context.relatedDocs.length > 0 ? 
                            `<div class="related-docs-section">
                                <h4><i class="fas fa-file-alt"></i> Related Documentation</h4>
                                <ul class="related-docs-list">
                                    ${task.context.relatedDocs.map(doc => 
                                        `<li><a href="#" onclick="openDocumentation('${doc}')">${doc}</a></li>`
                                    ).join('')}
                                </ul>
                            </div>` : ''
                        }
                        <div class="task-actions">
                            <button class="btn btn-small btn-primary" onclick="taskManager.markUrgent('${task.id}')">
                                <i class="fas fa-exclamation"></i> Mark Urgent
                            </button>
                            <button class="btn btn-small btn-secondary" onclick="taskManager.addNote('${task.id}')">
                                <i class="fas fa-sticky-note"></i> Add Note
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getContextBadge(context) {
        if (!context) return '';
        
        const colors = {
            analytics: 'badge-blue',
            social: 'badge-green',
            email: 'badge-purple',
            content: 'badge-orange',
            coordination: 'badge-red',
            advertising: 'badge-yellow'
        };

        const color = colors[context.category] || 'badge-gray';
        return `<span class="task-badge ${color}">${context.category}</span>`;
    }

    stripMarkdown(text) {
        return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    updateVisibility() {
        const people = ['person1', 'person2', 'person3'];
        
        people.forEach(person => {
            const container = document.getElementById(`${person}-tasks`);
            if (!container) return;

            const shouldShow = this.currentFilter.person === 'all' || this.currentFilter.person === person;
            container.style.display = shouldShow ? 'block' : 'none';
        });
    }

    async toggleTask(checkbox) {
        const taskId = checkbox.dataset.taskId;
        const person = checkbox.dataset.person;
        const completed = checkbox.checked;

        try {
            const response = await fetch('/api/tasks/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    taskId,
                    personId: person,
                    completed
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Update local task state
                const task = this.findTask(taskId);
                if (task) {
                    task.completed = completed;
                    task.completedAt = completed ? new Date().toISOString() : null;
                }

                // Update UI
                const taskItem = checkbox.closest('.task-item');
                if (completed) {
                    taskItem.classList.add('completed');
                    app.showNotification('Task completed!', 'success');
                } else {
                    taskItem.classList.remove('completed');
                }

                // Update progress and dashboard
                this.updateTaskProgress();
                if (window.dashboardManager) {
                    dashboardManager.refreshMetrics();
                }
            } else {
                // Revert checkbox if API call failed
                checkbox.checked = !completed;
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to update task:', error);
            app.showNotification('Failed to update task', 'error');
            checkbox.checked = !completed; // Revert on error
        }
    }

    toggleTaskExpansion(button) {
        const taskItem = button.closest('.task-item');
        const details = taskItem.querySelector('.task-details');
        const icon = button.querySelector('i');

        if (details.style.display === 'none') {
            details.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            button.classList.add('expanded');
        } else {
            details.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            button.classList.remove('expanded');
        }
    }

    findTask(taskId) {
        const people = ['person1', 'person2', 'person3'];
        for (const person of people) {
            if (this.tasks[person]) {
                const task = this.tasks[person].find(t => t.id === taskId);
                if (task) return task;
            }
        }
        return null;
    }

    async updateTaskProgress() {
        try {
            const response = await fetch('/api/tasks/progress');
            const result = await response.json();
            
            if (result.success) {
                this.updateProgressDisplay(result.data);
            }
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    }

    updateProgressDisplay(progressData) {
        // Update individual progress bars
        ['person1', 'person2', 'person3'].forEach(person => {
            const data = progressData[person];
            if (!data) return;

            const container = document.querySelector(`#${person}-tasks .person-tasks h3`);
            if (container) {
                const existing = container.querySelector('.progress-indicator');
                if (existing) existing.remove();

                const indicator = document.createElement('span');
                indicator.className = 'progress-indicator';
                indicator.innerHTML = ` (${data.completed}/${data.total} - ${data.percentage}%)`;
                container.appendChild(indicator);
            }
        });

        // Update overall progress in weekly progress card
        const weeklyProgress = document.getElementById('weekly-progress-content');
        if (weeklyProgress && progressData.overall) {
            const overall = progressData.overall;
            weeklyProgress.innerHTML = `
                <div class="progress-summary">
                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${overall.percentage}%"></div>
                        </div>
                        <div class="progress-text">
                            ${overall.completed} of ${overall.total} tasks completed (${overall.percentage}%)
                        </div>
                    </div>
                </div>
            `;
        }
    }

    markUrgent(taskId) {
        // This could be expanded to actually update priority
        app.showNotification('Task marked as urgent', 'info');
    }

    addNote(taskId) {
        const note = prompt('Add a note for this task:');
        if (note) {
            // This could be expanded to save notes
            app.showNotification('Note added successfully', 'success');
        }
    }
}

// Global filter functions called from HTML
function filterTasks() {
    if (!window.taskManager) return;
    
    const personFilter = document.getElementById('person-filter').value;
    const dayFilter = document.getElementById('day-filter').value;
    
    taskManager.currentFilter = {
        person: personFilter,
        day: dayFilter
    };
    
    taskManager.renderTasks();
}

function openDocumentation(docName) {
    // This could open documentation in a modal or new tab
    app.showNotification(`Opening ${docName}`, 'info');
}

// Initialize task manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (typeof app !== 'undefined') {
        window.taskManager = new TaskManager();
    }
});