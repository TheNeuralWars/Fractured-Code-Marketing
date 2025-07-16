// Team-specific functionality
// This file extends the main app with team coordination methods

class TeamManager {
    constructor(app) {
        this.app = app;
        this.apiBase = '/api/team';
        this.members = {};
        this.statistics = {};
        this.activityLog = [];
        this.init();
    }

    init() {
        console.log('✅ Team Manager initialized');
        this.setupEventListeners();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Team member edit buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.edit-member-btn')) {
                const memberId = e.target.dataset.memberId;
                this.showMemberEditModal(memberId);
            }
            
            if (e.target.matches('.view-stats-btn')) {
                const memberId = e.target.dataset.memberId;
                this.showMemberStats(memberId);
            }
            
            if (e.target.matches('.refresh-team-btn')) {
                this.loadTeamData();
            }
        });

        // Save member data
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#member-edit-form')) {
                e.preventDefault();
                this.saveMemberData(e.target);
            }
        });
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadTeamMembers(),
                this.loadTeamStatistics(),
                this.loadActivityLog()
            ]);
            this.renderTeamData();
        } catch (error) {
            console.error('Failed to load team data:', error);
        }
    }

    async loadTeamMembers() {
        try {
            const response = await fetch(`${this.apiBase}/members`);
            if (response.ok) {
                const result = await response.json();
                this.members = result.data;
                console.log('✅ Team members loaded:', Object.keys(this.members).length);
            }
        } catch (error) {
            console.error('Error loading team members:', error);
        }
    }

    async loadTeamStatistics() {
        try {
            const response = await fetch(`${this.apiBase}/statistics`);
            if (response.ok) {
                const result = await response.json();
                this.statistics = result.data;
                console.log('✅ Team statistics loaded');
            }
        } catch (error) {
            console.error('Error loading team statistics:', error);
        }
    }

    async loadActivityLog() {
        try {
            const response = await fetch(`${this.apiBase}/activity-log`);
            if (response.ok) {
                const result = await response.json();
                this.activityLog = result.data;
                console.log('✅ Activity log loaded:', this.activityLog.length, 'entries');
            }
        } catch (error) {
            console.error('Error loading activity log:', error);
        }
    }

    renderTeamData() {
        this.renderTeamMembers();
        this.renderTeamStatistics();
        this.renderActivityLog();
        this.renderProgressCharts();
    }

    renderTeamMembers() {
        const container = document.getElementById('team-members-container');
        if (!container) return;

        // Check if members data is available
        if (!this.members || Object.keys(this.members).length === 0) {
            container.innerHTML = '<p>Loading team members...</p>';
            return;
        }

        container.innerHTML = Object.values(this.members).map(member => `
            <div class="team-member-card" data-member-id="${member.id}">
                <div class="member-header">
                    <div class="member-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="member-info">
                        <h4 class="member-name editable" data-field="name">${member.name || 'Unknown'}</h4>
                        <p class="member-role">${member.role || 'No role assigned'}</p>
                        <div class="member-contact">
                            <span class="contact-item editable" data-field="email">
                                <i class="fas fa-envelope"></i> ${member.email || 'No email'}
                            </span>
                            <span class="contact-item editable" data-field="phone">
                                <i class="fas fa-phone"></i> ${member.phone || 'No phone'}
                            </span>
                        </div>
                    </div>
                    <div class="member-actions">
                        <button class="btn btn-small edit-member-btn" data-member-id="${member.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-small view-stats-btn" data-member-id="${member.id}">
                            <i class="fas fa-chart-bar"></i> Stats
                        </button>
                    </div>
                </div>
                
                <div class="member-stats">
                    <div class="stat-grid">
                        <div class="stat-item">
                            <div class="stat-value">${member.completionRate || 0}%</div>
                            <div class="stat-label">Task Completion</div>
                            <div class="stat-bar">
                                <div class="stat-fill" style="width: ${member.completionRate || 0}%"></div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${member.roleEffectiveness || 0}%</div>
                            <div class="stat-label">Role Effectiveness</div>
                            <div class="stat-bar">
                                <div class="stat-fill" style="width: ${member.roleEffectiveness || 0}%"></div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${member.tasksCompleted || 0}/${member.totalTasks || 0}</div>
                            <div class="stat-label">Tasks Completed</div>
                        </div>
                    </div>
                </div>
                
                <div class="member-assignments">
                    <h5><i class="fas fa-tasks"></i> Current Assignments</h5>
                    <div class="assignment-list">
                        ${(member.currentAssignments || []).map(assignment => `
                            <span class="assignment-tag">${assignment}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="member-skills">
                    <h5><i class="fas fa-star"></i> Skills</h5>
                    <div class="skill-tags">
                        ${(member.skills || []).map(skill => `
                            <span class="skill-tag">${skill}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTeamStatistics() {
        const container = document.getElementById('team-statistics-container');
        if (!container) return;

        // Check if statistics data is available and has the required structure
        const stats = this.statistics || {};
        const trends = stats.trends || { lastWeek: {}, lastMonth: {} };

        container.innerHTML = `
            <div class="stats-overview">
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="overview-data">
                        <div class="overview-value">${stats.totalMembers || 0}</div>
                        <div class="overview-label">Team Members</div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div class="overview-data">
                        <div class="overview-value">${stats.averageCompletionRate || 0}%</div>
                        <div class="overview-label">Avg Completion Rate</div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="overview-data">
                        <div class="overview-value">${stats.averageRoleEffectiveness || 0}%</div>
                        <div class="overview-label">Role Effectiveness</div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="overview-data">
                        <div class="overview-value">${stats.totalTasksCompleted || 0}</div>
                        <div class="overview-label">Tasks Completed</div>
                    </div>
                </div>
            </div>
            
            <div class="trends-section">
                <h4><i class="fas fa-trending-up"></i> Performance Trends</h4>
                <div class="trend-cards">
                    <div class="trend-card">
                        <h5>Last Week</h5>
                        <div class="trend-metric">
                            <span class="trend-value">${trends.lastWeek.completionRate || 0}%</span>
                            <span class="trend-label">Completion Rate</span>
                        </div>
                        <div class="trend-metric">
                            <span class="trend-value">${trends.lastWeek.tasksCompleted || 0}</span>
                            <span class="trend-label">Tasks Completed</span>
                        </div>
                    </div>
                    
                    <div class="trend-card">
                        <h5>Last Month</h5>
                        <div class="trend-metric">
                            <span class="trend-value">${trends.lastMonth.completionRate || 0}%</span>
                            <span class="trend-label">Completion Rate</span>
                        </div>
                        <div class="trend-metric">
                            <span class="trend-value">${trends.lastMonth.tasksCompleted || 0}</span>
                            <span class="trend-label">Tasks Completed</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderActivityLog() {
        const container = document.getElementById('activity-log-container');
        if (!container) return;

        container.innerHTML = `
            <div class="activity-header">
                <h4><i class="fas fa-history"></i> Recent Activity</h4>
                <button class="btn btn-small refresh-team-btn">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
            <div class="activity-list">
                ${this.activityLog.map(activity => `
                    <div class="activity-item ${activity.category}">
                        <div class="activity-icon">
                            ${this.getActivityIcon(activity.action)}
                        </div>
                        <div class="activity-content">
                            <div class="activity-description">
                                <strong>${activity.memberName}</strong> ${activity.description}
                            </div>
                            <div class="activity-time">
                                ${this.formatTimeAgo(activity.timestamp)}
                            </div>
                        </div>
                        <div class="activity-category">
                            <span class="category-badge ${activity.category}">${activity.category.replace('_', ' ')}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderProgressCharts() {
        // Simple CSS-based progress visualization
        const chartsContainer = document.getElementById('progress-charts-container');
        if (!chartsContainer) return;

        const memberData = Object.values(this.members);
        
        chartsContainer.innerHTML = `
            <div class="charts-section">
                <h4><i class="fas fa-chart-bar"></i> Team Progress Visualization</h4>
                
                <div class="chart-container">
                    <h5>Task Completion by Member</h5>
                    <div class="horizontal-chart">
                        ${memberData.map(member => `
                            <div class="chart-row">
                                <div class="chart-label">${member.name}</div>
                                <div class="chart-bar">
                                    <div class="chart-fill" style="width: ${member.completionRate}%"></div>
                                </div>
                                <div class="chart-value">${member.completionRate}%</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="chart-container">
                    <h5>Role Effectiveness</h5>
                    <div class="horizontal-chart">
                        ${memberData.map(member => `
                            <div class="chart-row">
                                <div class="chart-label">${member.name}</div>
                                <div class="chart-bar effectiveness">
                                    <div class="chart-fill" style="width: ${member.roleEffectiveness}%"></div>
                                </div>
                                <div class="chart-value">${member.roleEffectiveness}%</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getActivityIcon(action) {
        const icons = {
            'completed_task': '<i class="fas fa-check-circle text-success"></i>',
            'updated_status': '<i class="fas fa-info-circle text-info"></i>',
            'completed_analysis': '<i class="fas fa-chart-line text-primary"></i>',
            'started_task': '<i class="fas fa-play-circle text-warning"></i>',
            'meeting_logged': '<i class="fas fa-users text-secondary"></i>'
        };
        return icons[action] || '<i class="fas fa-circle"></i>';
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Less than an hour ago';
        if (diffInHours === 1) return '1 hour ago';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return '1 day ago';
        return `${diffInDays} days ago`;
    }

    showMemberEditModal(memberId) {
        const member = this.members[memberId];
        if (!member) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Team Member: ${member.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="member-edit-form" data-member-id="${memberId}">
                        <div class="form-group">
                            <label for="member-name">Name:</label>
                            <input type="text" id="member-name" name="name" value="${member.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="member-email">Email:</label>
                            <input type="email" id="member-email" name="email" value="${member.email}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="member-phone">Phone:</label>
                            <input type="tel" id="member-phone" name="phone" value="${member.phone}">
                        </div>
                        
                        <div class="form-group">
                            <label for="member-skills">Skills (comma-separated):</label>
                            <input type="text" id="member-skills" name="skills" value="${member.skills.join(', ')}">
                        </div>
                        
                        <div class="form-group">
                            <label for="member-assignments">Current Assignments (comma-separated):</label>
                            <input type="text" id="member-assignments" name="currentAssignments" value="${member.currentAssignments.join(', ')}">
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    async saveMemberData(form) {
        const formData = new FormData(form);
        const memberId = form.dataset.memberId;
        
        const updateData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            skills: formData.get('skills').split(',').map(s => s.trim()).filter(s => s),
            currentAssignments: formData.get('currentAssignments').split(',').map(s => s.trim()).filter(s => s)
        };

        try {
            const response = await fetch(`${this.apiBase}/member/${memberId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const result = await response.json();
                this.members[memberId] = result.data;
                this.renderTeamData();
                form.closest('.modal').remove();
                
                // Show success message
                this.showNotification('Team member updated successfully!', 'success');
            } else {
                throw new Error('Failed to update team member');
            }
        } catch (error) {
            console.error('Error updating team member:', error);
            this.showNotification('Failed to update team member', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    async loadTeamData() {
        await this.loadInitialData();
    }
}

// Export functions referenced in app.js
window.TeamManager = TeamManager;