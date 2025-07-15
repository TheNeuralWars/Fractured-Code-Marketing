// Main Application JavaScript
class NeuralWarsApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.apiBase = '/api';
        this.init();
    }

    init() {
        console.log('🚀 Neural Wars Marketing Automation Started');
        this.setupEventListeners();
        this.loadInitialData();
        this.initializeTheme();
    }

    initializeTheme() {
        // Check for saved theme preference or default to light
        const savedTheme = localStorage.getItem('neural-wars-theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('neural-wars-theme', theme);
        
        const themeIcon = document.getElementById('theme-icon');
        const themeText = document.getElementById('theme-text');
        
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Light';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'Dark';
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Application error:', e);
            this.showNotification('An error occurred. Please refresh the page.', 'error');
        });

        // Template generator form
        const templateForm = document.getElementById('template-generator-form');
        if (templateForm) {
            templateForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateTemplateContent();
            });
        }
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    async loadInitialData() {
        this.showLoading();
        try {
            // Load dashboard data by default
            await this.loadTabData('dashboard');
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showNotification('Failed to load application data', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'tasks':
                await this.loadTasksData();
                break;
            case 'templates':
                await this.loadTemplatesData();
                break;
            case 'team':
                await this.loadTeamData();
                break;
            case 'export':
                // Export tab doesn't need initial data loading
                break;
        }
    }

    async loadDashboardData() {
        try {
            const [overview, metrics, status] = await Promise.all([
                this.apiCall('/dashboard/overview'),
                this.apiCall('/dashboard/metrics'),
                this.apiCall('/dashboard/status')
            ]);

            this.updateDashboardMetrics(metrics.data);
            this.updateTeamStatus(status.data);
            this.updateRecentActivity();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async loadTasksData() {
        // Tasks are now handled by TaskManager
        if (window.taskManager) {
            await taskManager.loadTasks();
        }
    }

    async loadTemplatesData() {
        // Templates are now handled by TemplateManager
        if (window.templateManager) {
            await templateManager.loadTemplates();
        }
    }

    async loadTeamData() {
        try {
            const [coordination, roles] = await Promise.all([
                this.apiCall('/team/coordination'),
                this.apiCall('/team/roles')
            ]);

            this.updateTeamCoordination(coordination.data);
            this.updateTeamRoles(roles.data);
        } catch (error) {
            console.error('Failed to load team data:', error);
        }
    }

    updateDashboardMetrics(metrics) {
        // Update key metrics display
        if (metrics && metrics.kpis) {
            // This would parse the metrics from the markdown and update the UI
            // For now, we'll use placeholder values
            document.getElementById('sales-rank').textContent = '#--';
            document.getElementById('total-sales').textContent = '--';
            document.getElementById('review-count').textContent = '--';
            document.getElementById('email-subscribers').textContent = '--';
        }
    }

    updateTeamStatus(status) {
        const teamStatusList = document.getElementById('team-status-list');
        if (!teamStatusList || !status) return;

        const teamMembers = [
            {
                id: 'person1',
                name: 'Content Creator',
                initials: 'CC',
                task: 'Creating social media graphics',
                status: 'on-track'
            },
            {
                id: 'person2', 
                name: 'Community Manager',
                initials: 'CM',
                task: 'Influencer outreach',
                status: 'on-track'
            },
            {
                id: 'person3',
                name: 'Analytics Coordinator', 
                initials: 'AC',
                task: 'Performance analysis',
                status: 'on-track'
            }
        ];

        teamStatusList.innerHTML = teamMembers.map(member => `
            <div class="team-member">
                <div class="member-avatar">${member.initials}</div>
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-task">${member.task}</div>
                </div>
                <span class="member-status status-${member.status}">${member.status.replace('-', ' ')}</span>
            </div>
        `).join('');
    }

    updateRecentActivity() {
        const activityList = document.getElementById('recent-activity-list');
        if (!activityList) return;

        const activities = [
            {
                icon: 'fas fa-check',
                text: 'Daily tasks completed for Person 1',
                time: '2 hours ago'
            },
            {
                icon: 'fas fa-share-alt',
                text: 'Social media posts scheduled',
                time: '4 hours ago'
            },
            {
                icon: 'fas fa-chart-line',
                text: 'Performance metrics updated',
                time: '6 hours ago'
            }
        ];

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    updateTasksDisplay(tasks) {
        if (!tasks) return;

        ['person1', 'person2', 'person3'].forEach(person => {
            const taskList = document.getElementById(`${person}-task-list`);
            if (taskList && tasks[person]) {
                taskList.innerHTML = tasks[person].map(task => `
                    <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                               onchange="app.toggleTask('${task.id}', '${person}', this.checked)">
                        <span class="task-text">${task.text}</span>
                        ${task.estimatedTime ? `<span class="task-time">${task.estimatedTime}min</span>` : ''}
                        <span class="task-day">${task.day}</span>
                    </div>
                `).join('');
            }
        });
    }

    updateTemplatesDisplay(templates) {
        if (!templates) return;

        // Update social media templates
        const socialList = document.getElementById('social-template-list');
        if (socialList && templates.J) {
            const socialTemplates = this.extractTemplatesFromContent(templates.J.content, 'social');
            socialList.innerHTML = this.renderTemplateList(socialTemplates);
        }

        // Update email templates
        const emailList = document.getElementById('email-template-list');
        if (emailList && templates.K) {
            const emailTemplates = this.extractTemplatesFromContent(templates.K.content, 'email');
            emailList.innerHTML = this.renderTemplateList(emailTemplates);
        }

        // Update press templates
        const pressList = document.getElementById('press-template-list');
        if (pressList && templates.L) {
            const pressTemplates = this.extractTemplatesFromContent(templates.L.content, 'press');
            pressList.innerHTML = this.renderTemplateList(pressTemplates);
        }
    }

    extractTemplatesFromContent(content, type) {
        // Extract template items from markdown content
        const templates = [];
        const lines = content.split('\n');
        let currentTemplate = null;

        lines.forEach(line => {
            if (line.startsWith('**') && line.endsWith(':**')) {
                if (currentTemplate) {
                    templates.push(currentTemplate);
                }
                currentTemplate = {
                    title: line.replace(/\*\*/g, '').replace(':', ''),
                    content: '',
                    type: type
                };
            } else if (currentTemplate && line.trim()) {
                currentTemplate.content += line + '\n';
            }
        });

        if (currentTemplate) {
            templates.push(currentTemplate);
        }

        return templates;
    }

    renderTemplateList(templates) {
        return templates.map(template => `
            <div class="template-item" onclick="app.useTemplate('${template.type}', '${template.title}')">
                <h4>${template.title}</h4>
                <p>${template.content.substring(0, 100)}...</p>
                <button class="btn btn-small">Use Template</button>
            </div>
        `).join('');
    }

    async toggleTask(taskId, personId, completed) {
        try {
            await this.apiCall('/tasks/complete', 'POST', {
                taskId,
                personId,
                completed
            });
            
            this.showNotification('Task updated successfully', 'success');
        } catch (error) {
            console.error('Failed to update task:', error);
            this.showNotification('Failed to update task', 'error');
        }
    }

    async useTemplate(type, title) {
        this.showNotification(`Using template: ${title}`, 'info');
        // This would open the template editor or copy content to clipboard
    }

    async generateTemplateContent() {
        const templateType = document.getElementById('template-type').value;
        const templateSection = document.getElementById('template-section').value;
        
        if (!templateType) {
            this.showNotification('Please select a template type', 'error');
            return;
        }

        try {
            this.showLoading();
            const result = await this.apiCall('/templates/generate', 'POST', {
                templateType,
                templateSection,
                variables: {} // Could collect from form
            });

            // Display generated content
            this.showGeneratedContent(result.data.content);
            this.closeModal('template-modal');
        } catch (error) {
            console.error('Failed to generate template:', error);
            this.showNotification('Failed to generate template content', 'error');
        } finally {
            this.hideLoading();
        }
    }

    showGeneratedContent(content) {
        // Create a new modal or section to display generated content
        this.showNotification('Template content generated successfully!', 'success');
        console.log('Generated content:', content);
    }

    async loadTemplateTypes() {
        try {
            const types = await this.apiCall('/templates/meta/types');
            const select = document.getElementById('template-type');
            if (select && types.data) {
                select.innerHTML = '<option value="">Select a template type...</option>' +
                    types.data.map(type => 
                        `<option value="${type.type}">${type.title}</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Failed to load template types:', error);
        }
    }

    // Utility methods
    async apiCall(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${this.apiBase}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        return await response.json();
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        // Create a simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '80px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10001',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
}

// Global functions for HTML onclick handlers
function refreshMetrics() {
    app.loadDashboardData();
}

function filterTasks() {
    // Use the proper task manager filtering if available
    if (window.taskManager) {
        const personFilter = document.getElementById('person-filter').value;
        const dayFilter = document.getElementById('day-filter').value;
        
        taskManager.currentFilter = {
            person: personFilter,
            day: dayFilter
        };
        
        taskManager.renderTasks();
    }
}

function showTemplateGenerator() {
    if (window.templateManager) {
        templateManager.openTemplateGenerator();
    } else {
        // Fallback to basic modal opening
        app.showModal('template-modal');
    }
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function logMeeting() {
    app.showNotification('Meeting logging feature coming soon!', 'info');
}

function updateStatus() {
    app.showNotification('Status update feature coming soon!', 'info');
}

async function exportData(type, format) {
    try {
        app.showLoading();
        const response = await fetch(`/api/export/${type}/${format}`);
        
        if (!response.ok) {
            throw new Error('Export failed');
        }

        // Create download link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neural-wars-${type}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        app.showNotification(`${type} exported successfully as ${format.toUpperCase()}`, 'success');
    } catch (error) {
        console.error('Export failed:', error);
        app.showNotification('Export failed', 'error');
    } finally {
        app.hideLoading();
    }
}

function integrateExternal(service) {
    app.showNotification(`${service} integration coming soon!`, 'info');
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    app.setTheme(newTheme);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NeuralWarsApp();
    
    // Set up event listeners for UI elements
    setupEventListeners();
});

function setupEventListeners() {
    // Filter event listeners
    const personFilter = document.getElementById('person-filter');
    const dayFilter = document.getElementById('day-filter');
    
    if (personFilter) {
        personFilter.addEventListener('change', filterTasks);
    }
    
    if (dayFilter) {
        dayFilter.addEventListener('change', filterTasks);
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Refresh metrics
    const refreshBtn = document.getElementById('refresh-metrics');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshMetrics);
    }
    
    // Template generator
    const templateGenBtn = document.getElementById('show-template-generator');
    if (templateGenBtn) {
        templateGenBtn.addEventListener('click', showTemplateGenerator);
    }
}