// Main Application JavaScript
class NeuralWarsApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.apiBase = '/api';
        this.fileManager = null;
        this.taskManager = null;
        this.templateManager = null;
        this.init();
    }

    init() {
        console.log('🚀 Neural Wars Marketing Automation Started');
        this.setupEventListeners();
        this.initializeManagers();
        this.loadInitialData();
        this.initializeTheme();
    }

    initializeManagers() {
        // Initialize file manager for comprehensive file integration
        if (window.FileManager) {
            this.fileManager = new FileManager(this);
            window.fileManager = this.fileManager; // Make globally accessible
            console.log('✅ File Manager initialized');
        }
        
        // Initialize team manager
        if (window.TeamManager) {
            this.teamManager = new TeamManager(this);
            window.teamManager = this.teamManager; // Make globally accessible
            console.log('✅ Team Manager initialized');
        }
        
        // Initialize export manager
        if (window.ExportManager) {
            this.exportManager = new ExportManager(this);
            window.exportManager = this.exportManager; // Make globally accessible
            console.log('✅ Export Manager initialized');
        }
        
        // Initialize other managers when they become available
        if (window.TaskManager) {
            this.taskManager = new TaskManager(this);
            console.log('✅ Task Manager initialized');
        }
        
        if (window.TemplateManager) {
            this.templateManager = new TemplateManager(this);
            console.log('✅ Template Manager initialized');
        }
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

        // Enhanced modal controls - ESC key support and global close handling
        this.setupModalControls();
        
        // Enhanced navigation with submenu controls
        this.setupNavigationControls();
        
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(newTheme);
            });
        }
    }

    setupNavigationControls() {
        // Enhanced submenu functionality - start collapsed
        document.querySelectorAll('.nav-group').forEach(group => {
            const link = group.querySelector('.nav-link');
            const submenu = group.querySelector('.nav-submenu');
            
            if (submenu) {
                // Click to toggle submenu
                link.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleSubmenu(group);
                });
                
                // Keep submenu open when clicking inside it
                submenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        });

        // Close submenus when clicking outside
        document.addEventListener('click', () => {
            this.closeAllSubmenus();
        });
    }

    toggleSubmenu(navGroup) {
        const isOpen = navGroup.classList.contains('submenu-open');
        
        // Close all other submenus first
        this.closeAllSubmenus();
        
        // Toggle this submenu
        if (!isOpen) {
            navGroup.classList.add('submenu-open');
        }
    }

    closeAllSubmenus() {
        document.querySelectorAll('.nav-group').forEach(group => {
            group.classList.remove('submenu-open');
        });
    }

    setupModalControls() {
        // ESC key support for all modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Setup close buttons for all modals
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = button.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Modal backdrop clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
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
            
            // Load saved editable content
            loadEditableContent();
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
            case 'campaign':
                await this.loadCampaignData();
                break;
            case 'content':
                await this.loadContentData();
                break;
            case 'implementation':
                await this.loadImplementationData();
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
                this.apiCall('/files/roles/team')
            ]);

            this.updateTeamCoordination(coordination.data);
            this.updateTeamRoles(roles.data);
        } catch (error) {
            console.error('Failed to load team data:', error);
        }
    }

    async loadCampaignData() {
        try {
            const [timeline, execution] = await Promise.all([
                this.apiCall('/files/timeline/launch'),
                this.apiCall('/files/CAMPAIGN-EXECUTION-GUIDE.md')
            ]);

            this.updateCampaignTimeline(timeline.data);
            this.displayCampaignContent(execution.data);
        } catch (error) {
            console.error('Failed to load campaign data:', error);
        }
    }

    async loadContentData() {
        try {
            const [homepage, strategy] = await Promise.all([
                this.apiCall('/files/N-homepage-content.md'),
                this.apiCall('/files/M-content-strategy.md')
            ]);

            this.displayContentFiles([homepage.data, strategy.data]);
        } catch (error) {
            console.error('Failed to load content data:', error);
        }
    }

    async loadImplementationData() {
        try {
            const [complete, readme, gettingStarted] = await Promise.all([
                this.apiCall('/files/IMPLEMENTATION-COMPLETE.md'),
                this.apiCall('/files/MARKETING-IMPLEMENTATION-README.md'),
                this.apiCall('/files/PROJECT-GETTING-STARTED.md')
            ]);

            this.displayImplementationChecklist(complete.data);
            this.displayImplementationDocs([readme.data, gettingStarted.data]);
        } catch (error) {
            console.error('Failed to load implementation data:', error);
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

        // Enhanced team status with expandable details
        const teamMembers = [
            {
                id: 'person1',
                name: 'Content Creator',
                initials: 'CC',
                role: 'Content Creator & Visual Designer',
                task: 'Creating social media graphics',
                status: 'on-track',
                details: [
                    'Designing Neural Wars-themed social media assets',
                    'Creating book cover variations for testing',
                    'Developing visual style guide for campaign',
                    'Planning video trailer storyboard concepts'
                ],
                completed: '15/20 visual assets',
                nextDeadline: 'Tomorrow: Social media asset delivery'
            },
            {
                id: 'person2', 
                name: 'Community Manager',
                initials: 'CM',
                role: 'Social Engagement & Community Manager',
                task: 'Influencer outreach',
                status: 'on-track',
                details: [
                    'Researching sci-fi book influencers and reviewers',
                    'Drafting personalized outreach emails',
                    'Setting up social media posting schedules',
                    'Monitoring engagement and community feedback'
                ],
                completed: '8/15 influencer contacts made',
                nextDeadline: 'Friday: Influencer campaign launch'
            },
            {
                id: 'person3',
                name: 'Analytics Coordinator', 
                initials: 'AC',
                role: 'Analytics, Advertising & Strategic Coordination',
                task: 'Performance analysis',
                status: 'on-track',
                details: [
                    'Setting up Amazon KDP analytics tracking',
                    'Configuring Google Analytics for author website',
                    'Planning A/B testing for ad campaigns',
                    'Preparing performance dashboards and reports'
                ],
                completed: '5/8 analytics tools configured',
                nextDeadline: 'Monday: First performance report'
            }
        ];

        teamStatusList.innerHTML = teamMembers.map(member => `
            <div class="team-member" data-member="${member.id}">
                <div class="member-summary" onclick="toggleMemberDetails('${member.id}')">
                    <div class="member-avatar">${member.initials}</div>
                    <div class="member-info">
                        <div class="member-name">${member.name}</div>
                        <div class="member-task">${member.task}</div>
                    </div>
                    <span class="member-status status-${member.status}">${member.status.replace('-', ' ')}</span>
                    <div class="expand-arrow">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="member-details hidden">
                    <div class="member-role">
                        <strong>Role:</strong> ${member.role}
                    </div>
                    <div class="member-progress">
                        <strong>Progress:</strong> ${member.completed}
                    </div>
                    <div class="member-deadline">
                        <strong>Next Deadline:</strong> ${member.nextDeadline}
                    </div>
                    <div class="member-activities">
                        <strong>Current Activities:</strong>
                        <ul>
                            ${member.details.map(detail => `<li>${detail}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="member-actions">
                        <button class="btn btn-small" onclick="assignRole('${member.id}')">
                            <i class="fas fa-user-edit"></i> Assign Role
                        </button>
                        <button class="btn btn-small" onclick="updateResponsibilities('${member.id}')">
                            <i class="fas fa-tasks"></i> Update Tasks
                        </button>
                        <button class="btn btn-small" onclick="logCommunication('${member.id}')">
                            <i class="fas fa-comment"></i> Log Communication
                        </button>
                    </div>
                </div>
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
        this.showToast(message, type);
    }

    showToast(message, type = 'info') {
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

    updateCampaignTimeline(timeline) {
        const viewer = document.getElementById('campaign-file-viewer');
        if (!viewer || !timeline) return;

        viewer.innerHTML = `
            <div class="timeline-overview">
                <h3>Campaign Timeline Overview</h3>
                <div class="timeline-stats">
                    <div class="stat">
                        <span class="stat-value">${timeline.overview.duration || '9 months'}</span>
                        <span class="stat-label">Total Duration</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${timeline.overview.team || '3 people'}</span>
                        <span class="stat-label">Team Size</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${timeline.overview.budget || '$2,500'}</span>
                        <span class="stat-label">Budget</span>
                    </div>
                </div>
            </div>
            <div class="timeline-phases">
                <h3>Campaign Phases</h3>
                <div class="phases-list">
                    ${timeline.phases ? timeline.phases.map(phase => `
                        <div class="phase-item">
                            <h4>${phase.title}</h4>
                            <p>${phase.description}</p>
                            <div class="phase-tasks">
                                ${phase.tasks ? phase.tasks.slice(0, 3).map(task => 
                                    `<span class="task-badge">${task.text}</span>`
                                ).join('') : ''}
                            </div>
                        </div>
                    `).join('') : '<p>Timeline data loading...</p>'}
                </div>
            </div>
        `;
    }

    displayCampaignContent(content) {
        // This would be integrated with the timeline display
        console.log('Campaign content loaded:', content);
    }

    displayContentFiles(files) {
        const viewer = document.getElementById('content-file-viewer');
        const categories = document.getElementById('content-categories');
        
        if (!viewer || !files) return;

        // Update categories sidebar
        if (categories) {
            categories.innerHTML = `
                <div class="category-list">
                    <div class="category-item active" data-category="all">
                        <i class="fas fa-list"></i> All Content
                    </div>
                    <div class="category-item" data-category="homepage">
                        <i class="fas fa-home"></i> Homepage
                    </div>
                    <div class="category-item" data-category="strategy">
                        <i class="fas fa-strategy"></i> Strategy
                    </div>
                    <div class="category-item" data-category="templates">
                        <i class="fas fa-file-alt"></i> Templates
                    </div>
                </div>
            `;
        }

        // Display content files
        viewer.innerHTML = `
            <div class="content-files">
                ${files.map(file => `
                    <div class="content-file-card">
                        <div class="file-header">
                            <h3>${file.fileName.replace('.md', '').replace(/-/g, ' ')}</h3>
                            <div class="file-actions">
                                <button class="btn btn-small view-file" data-filename="${file.fileName}">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button class="btn btn-small copy-file" data-filename="${file.fileName}">
                                    <i class="fas fa-copy"></i> Copy
                                </button>
                            </div>
                        </div>
                        <div class="file-preview">
                            ${file.html ? file.html.substring(0, 300) + '...' : file.content.substring(0, 300) + '...'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners for file actions
        viewer.querySelectorAll('.view-file').forEach(btn => {
            btn.addEventListener('click', () => {
                const fileName = btn.dataset.filename;
                if (this.fileManager) {
                    this.fileManager.loadFile(fileName);
                }
            });
        });

        viewer.querySelectorAll('.copy-file').forEach(btn => {
            btn.addEventListener('click', async () => {
                const fileName = btn.dataset.filename;
                const file = files.find(f => f.fileName === fileName);
                if (file) {
                    try {
                        await navigator.clipboard.writeText(file.content);
                        this.showToast('File content copied to clipboard', 'success');
                    } catch (error) {
                        this.showToast('Failed to copy content', 'error');
                    }
                }
            });
        });
    }

    displayImplementationChecklist(data) {
        const checklist = document.getElementById('implementation-checklist');
        if (!checklist || !data) return;

        // Extract checklist items from the implementation complete file
        const checklistItems = this.extractChecklistItems(data.content);
        
        checklist.innerHTML = `
            <div class="implementation-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 85%"></div>
                </div>
                <span class="progress-text">85% Complete</span>
            </div>
            <div class="checklist-items">
                ${checklistItems.map((item, index) => `
                    <div class="checklist-item ${item.completed ? 'completed' : ''}">
                        <input type="checkbox" ${item.completed ? 'checked' : ''} 
                               onchange="app.toggleImplementationItem(${index}, this.checked)">
                        <span class="item-text">${item.text}</span>
                        ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    displayImplementationDocs(docs) {
        const docsList = document.getElementById('implementation-docs');
        if (!docsList || !docs) return;

        docsList.innerHTML = `
            <div class="docs-list">
                ${docs.map(doc => `
                    <div class="doc-item">
                        <div class="doc-header">
                            <h4>${doc.fileName.replace('.md', '').replace(/-/g, ' ')}</h4>
                            <button class="btn btn-small view-doc" data-filename="${doc.fileName}">
                                <i class="fas fa-external-link-alt"></i> Open
                            </button>
                        </div>
                        <p class="doc-description">
                            ${doc.content.substring(0, 150)}...
                        </p>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners
        docsList.querySelectorAll('.view-doc').forEach(btn => {
            btn.addEventListener('click', () => {
                const fileName = btn.dataset.filename;
                if (this.fileManager) {
                    this.fileManager.loadFile(fileName);
                }
            });
        });
    }

    extractChecklistItems(content) {
        const items = [];
        const lines = content.split('\n');
        
        lines.forEach(line => {
            if (line.match(/^- \[[ x]\]/)) {
                const completed = line.includes('[x]');
                const text = line.replace(/^- \[[ x]\]\s*/, '').replace(/\*\*/g, '');
                items.push({
                    text: text,
                    completed: completed,
                    description: ''
                });
            }
        });

        return items;
    }

    toggleImplementationItem(index, checked) {
        // In a real application, this would save the state
        this.showToast(checked ? 'Item marked as complete' : 'Item marked as incomplete', 'info');
    }

    updateTeamCoordination(data) {
        // Enhanced team coordination display
        console.log('Team coordination data loaded:', data);
    }

    updateTeamRoles(data) {
        // Enhanced team roles display
        console.log('Team roles data loaded:', data);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            
            // Focus the modal for accessibility
            const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
            
            // Track current modal for ESC handling
            this.currentModal = modalId;
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            this.currentModal = null;
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            if (!modal.classList.contains('hidden')) {
                this.closeModal(modal.id);
            }
        });
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

// Enhanced team member functions
function toggleMemberDetails(memberId) {
    const member = document.querySelector(`[data-member="${memberId}"]`);
    if (member) {
        const details = member.querySelector('.member-details');
        const arrow = member.querySelector('.expand-arrow i');
        
        if (details.classList.contains('hidden')) {
            details.classList.remove('hidden');
            arrow.classList.remove('fa-chevron-down');
            arrow.classList.add('fa-chevron-up');
        } else {
            details.classList.add('hidden');
            arrow.classList.remove('fa-chevron-up');
            arrow.classList.add('fa-chevron-down');
        }
    }
}

function assignRole(memberId) {
    app.showNotification(`Role assignment for ${memberId} - feature coming soon!`, 'info');
}

function updateResponsibilities(memberId) {
    app.showNotification(`Responsibility update for ${memberId} - feature coming soon!`, 'info');
}

function logCommunication(memberId) {
    app.showNotification(`Communication logging for ${memberId} - feature coming soon!`, 'info');
}

// Enhanced editable content functionality
function toggleEditMode(cardId) {
    const card = document.querySelector(`.${cardId}`);
    if (!card) return;

    const editButton = card.querySelector('.btn');
    const editableContents = card.querySelectorAll('.editable-content');
    const editHints = card.querySelectorAll('.edit-hint');
    
    const isEditing = editButton.innerHTML.includes('Save');
    
    if (isEditing) {
        // Save mode
        editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editButton.classList.remove('btn-success');
        editButton.classList.add('btn-small');
        
        editableContents.forEach(content => {
            content.contentEditable = 'false';
            content.classList.remove('editing');
            
            // Save the content
            const field = content.closest('.editable-field').dataset.field;
            const value = content.textContent.trim();
            saveEditableContent(field, value);
        });
        
        editHints.forEach(hint => {
            hint.style.display = 'block';
            hint.textContent = 'Click Edit to modify';
        });
        
        app.showNotification('Changes saved successfully!', 'success');
    } else {
        // Edit mode
        editButton.innerHTML = '<i class="fas fa-save"></i> Save';
        editButton.classList.remove('btn-small');
        editButton.classList.add('btn-success');
        
        editableContents.forEach(content => {
            content.contentEditable = 'true';
            content.classList.add('editing');
            content.focus();
            
            // Clear placeholder if it contains underscores
            if (content.textContent.includes('___')) {
                content.textContent = '';
            }
        });
        
        editHints.forEach(hint => {
            hint.style.display = 'block';
            hint.textContent = 'Type to edit, click Save when done';
        });
    }
}

function saveEditableContent(field, value) {
    // Save to localStorage for persistence
    const savedData = JSON.parse(localStorage.getItem('neural-wars-editable-content') || '{}');
    savedData[field] = value;
    localStorage.setItem('neural-wars-editable-content', JSON.stringify(savedData));
    
    // Also send to server if API exists
    fetch('/api/content/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            field: field,
            value: value,
            timestamp: new Date().toISOString()
        })
    }).catch(error => {
        console.log('Server save failed, using local storage only:', error);
    });
}

function loadEditableContent() {
    const savedData = JSON.parse(localStorage.getItem('neural-wars-editable-content') || '{}');
    
    Object.keys(savedData).forEach(field => {
        const element = document.querySelector(`[data-field="${field}"] .editable-content`);
        if (element && savedData[field]) {
            element.textContent = savedData[field];
        }
    });
}

// Enhanced role management functions
function toggleRole(roleId) {
    const roleSection = document.querySelector(`[data-role="${roleId}"]`);
    if (!roleSection) return;

    const details = roleSection.querySelector('.role-details');
    const arrow = roleSection.querySelector('.role-arrow i');
    
    if (details.classList.contains('hidden')) {
        details.classList.remove('hidden');
        arrow.classList.remove('fa-chevron-down');
        arrow.classList.add('fa-chevron-up');
    } else {
        details.classList.add('hidden');
        arrow.classList.remove('fa-chevron-up');
        arrow.classList.add('fa-chevron-down');
    }
}

function toggleAllRoles() {
    const button = document.querySelector('[onclick="toggleAllRoles()"]');
    const allDetails = document.querySelectorAll('.role-details');
    const isExpanded = button.innerHTML.includes('Collapse');
    
    if (isExpanded) {
        // Collapse all
        allDetails.forEach(details => {
            details.classList.add('hidden');
        });
        document.querySelectorAll('.role-arrow i').forEach(arrow => {
            arrow.classList.remove('fa-chevron-up');
            arrow.classList.add('fa-chevron-down');
        });
        button.innerHTML = '<i class="fas fa-expand-alt"></i> Expand All';
    } else {
        // Expand all
        allDetails.forEach(details => {
            details.classList.remove('hidden');
        });
        document.querySelectorAll('.role-arrow i').forEach(arrow => {
            arrow.classList.remove('fa-chevron-down');
            arrow.classList.add('fa-chevron-up');
        });
        button.innerHTML = '<i class="fas fa-compress-alt"></i> Collapse All';
    }
}

function showRoleTab(roleId, tabName) {
    const roleSection = document.querySelector(`[data-role="${roleId}"]`);
    if (!roleSection) return;

    // Update tab buttons
    roleSection.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    roleSection.querySelector(`[onclick="showRoleTab('${roleId}', '${tabName}')"]`).classList.add('active');

    // Update tab content
    roleSection.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    roleSection.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Enhanced campaign phase management
function togglePhase(phaseId) {
    const phaseSection = document.querySelector(`[data-phase="${phaseId}"]`);
    if (!phaseSection) return;

    const content = phaseSection.querySelector('.phase-content');
    const arrow = phaseSection.querySelector('.phase-arrow i');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        arrow.classList.remove('fa-chevron-down');
        arrow.classList.add('fa-chevron-up');
    } else {
        content.classList.add('hidden');
        arrow.classList.remove('fa-chevron-up');
        arrow.classList.add('fa-chevron-down');
    }
}

function toggleMonth(phaseId, monthId) {
    const monthSection = document.querySelector(`[data-phase="${phaseId}"] [data-month="${monthId}"]`);
    if (!monthSection) return;

    const content = monthSection.querySelector('.month-content');
    const arrow = monthSection.querySelector('.month-header i');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        arrow.classList.remove('fa-chevron-down');
        arrow.classList.add('fa-chevron-up');
    } else {
        content.classList.add('hidden');
        arrow.classList.remove('fa-chevron-up');
        arrow.classList.add('fa-chevron-down');
    }
}

function expandAllPhases() {
    const button = document.querySelector('[onclick="expandAllPhases()"]');
    const allPhaseContents = document.querySelectorAll('.phase-content');
    const allMonthContents = document.querySelectorAll('.month-content');
    const isExpanded = button.innerHTML.includes('Collapse');
    
    if (isExpanded) {
        // Collapse all
        allPhaseContents.forEach(content => content.classList.add('hidden'));
        allMonthContents.forEach(content => content.classList.add('hidden'));
        document.querySelectorAll('.phase-arrow i, .month-header i').forEach(arrow => {
            arrow.classList.remove('fa-chevron-up');
            arrow.classList.add('fa-chevron-down');
        });
        button.innerHTML = '<i class="fas fa-expand-alt"></i> Expand All Phases';
    } else {
        // Expand all
        allPhaseContents.forEach(content => content.classList.remove('hidden'));
        allMonthContents.forEach(content => content.classList.remove('hidden'));
        document.querySelectorAll('.phase-arrow i, .month-header i').forEach(arrow => {
            arrow.classList.remove('fa-chevron-down');
            arrow.classList.add('fa-chevron-up');
        });
        button.innerHTML = '<i class="fas fa-compress-alt"></i> Collapse All Phases';
    }
}

function showCampaignOverview() {
    app.showNotification('Campaign overview analytics coming soon!', 'info');
}

async function exportData(type, format) {
    try {
        app.showLoading();
        
        // Enhanced PDF export functionality
        if (format === 'pdf') {
            await exportToPDF(type);
            return;
        }
        
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

// Enhanced PDF export with professional branding
async function exportToPDF(type) {
    try {
        // This would typically use a library like jsPDF or Puppeteer on the server
        const response = await fetch('/api/export/pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: type,
                branding: {
                    title: 'The Neural Wars: Fractured Code',
                    subtitle: 'Marketing Campaign Documentation',
                    author: 'Neural Wars Marketing Team',
                    date: new Date().toLocaleDateString()
                }
            })
        });

        if (!response.ok) {
            throw new Error('PDF generation failed');
        }

        // Download the PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neural-wars-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        app.showNotification(`Professional PDF exported successfully`, 'success');
    } catch (error) {
        console.error('PDF export failed:', error);
        
        // Fallback to browser print with enhanced formatting
        const printWindow = window.open('', '_blank');
        const content = document.querySelector('.file-viewer-content') || document.querySelector('.main-content');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>The Neural Wars: Fractured Code - Marketing Documentation</title>
                <style>
                    @page { margin: 1in; }
                    body { 
                        font-family: Arial, sans-serif; 
                        line-height: 1.6; 
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #667eea;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .title { 
                        font-size: 24px; 
                        font-weight: bold; 
                        color: #667eea;
                        margin: 0;
                    }
                    .subtitle { 
                        font-size: 18px; 
                        color: #666; 
                        margin: 10px 0;
                    }
                    .meta {
                        font-size: 14px;
                        color: #888;
                    }
                    .content {
                        max-width: none;
                    }
                    h1, h2, h3 { color: #667eea; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="title">The Neural Wars: Fractured Code</h1>
                    <p class="subtitle">Marketing Campaign Documentation</p>
                    <p class="meta">Generated on ${new Date().toLocaleDateString()} | Type: ${type}</p>
                </div>
                <div class="content">
                    ${content ? content.innerHTML : 'Content not available'}
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
        
        app.showNotification('Content formatted for printing', 'info');
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
    
    // Modal close buttons
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => closeModal('template-modal'));
    }
    
    if (modalCancelBtn) {
        modalCancelBtn.addEventListener('click', () => closeModal('template-modal'));
    }
    
    // Export buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-export]')) {
            const button = e.target.closest('[data-export]');
            const type = button.dataset.export;
            const format = button.dataset.format;
            exportData(type, format);
        }
        
        if (e.target.closest('[data-integration]')) {
            const button = e.target.closest('[data-integration]');
            const service = button.dataset.integration;
            integrateExternal(service);
        }
    });
}