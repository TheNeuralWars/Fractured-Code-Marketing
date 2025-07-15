// Enhanced Team Coordination Management
class TeamManager {
    constructor() {
        this.teamMembers = new Map();
        this.meetings = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTeamData();
    }

    setupEventListeners() {
        // Team member editing
        document.addEventListener('click', (e) => {
            if (e.target.matches('.edit-member-btn')) {
                const memberId = e.target.dataset.memberId;
                this.openMemberEditModal(memberId);
            }
            
            if (e.target.matches('.add-member-btn')) {
                this.openMemberEditModal();
            }
            
            if (e.target.matches('#save-member-btn')) {
                e.preventDefault();
                this.saveMemberData();
            }
        });

        // Log meeting functionality
        const logMeetingBtn = document.querySelector('button[onclick="logMeeting()"]');
        if (logMeetingBtn) {
            logMeetingBtn.setAttribute('onclick', '');
            logMeetingBtn.addEventListener('click', () => this.openMeetingModal());
        }

        // Update status functionality
        const updateStatusBtn = document.querySelector('button[onclick="updateStatus()"]');
        if (updateStatusBtn) {
            updateStatusBtn.setAttribute('onclick', '');
            updateStatusBtn.addEventListener('click', () => this.openStatusUpdateModal());
        }
    }

    async loadTeamData() {
        try {
            const [coordination, roles, status] = await Promise.all([
                this.apiCall('/team/coordination'),
                this.apiCall('/team/roles'),
                this.apiCall('/team/status')
            ]);

            this.processTeamData(coordination.data, roles.data, status.data);
            this.renderTeamInterface();
        } catch (error) {
            console.error('Failed to load team data:', error);
        }
    }

    processTeamData(coordination, roles, status) {
        // Initialize team members from roles data and current status
        const defaultMembers = [
            {
                id: 'person1',
                name: 'Content Creator',
                fullName: 'Team Member 1',
                role: 'Content Creator & Visual Designer',
                email: 'content@neuralwars.com',
                phone: '',
                status: status?.person1?.status || 'on-track',
                currentTask: status?.person1?.currentTask || 'Creating social media graphics',
                progress: status?.person1?.progress || 85,
                tasksCompleted: 0,
                totalTasks: 0,
                completionRate: 0,
                lastUpdate: new Date().toISOString(),
                skills: ['Graphic Design', 'Video Editing', 'Content Writing', 'Social Media'],
                responsibilities: roles?.person1?.responsibilities || ''
            },
            {
                id: 'person2',
                name: 'Community Manager',
                fullName: 'Team Member 2',
                role: 'Social Engagement & Community Manager',
                email: 'community@neuralwars.com',
                phone: '',
                status: status?.person2?.status || 'on-track',
                currentTask: status?.person2?.currentTask || 'Influencer outreach',
                progress: status?.person2?.progress || 92,
                tasksCompleted: 0,
                totalTasks: 0,
                completionRate: 0,
                lastUpdate: new Date().toISOString(),
                skills: ['Social Media Management', 'Community Building', 'Customer Service'],
                responsibilities: roles?.person2?.responsibilities || ''
            },
            {
                id: 'person3',
                name: 'Analytics Coordinator',
                fullName: 'Team Member 3',
                role: 'Analytics, Advertising & Strategic Coordination',
                email: 'analytics@neuralwars.com',
                phone: '',
                status: status?.person3?.status || 'on-track',
                currentTask: status?.person3?.currentTask || 'Performance analysis',
                progress: status?.person3?.progress || 78,
                tasksCompleted: 0,
                totalTasks: 0,
                completionRate: 0,
                lastUpdate: new Date().toISOString(),
                skills: ['Data Analysis', 'Advertising', 'Strategic Planning', 'Performance Tracking'],
                responsibilities: roles?.person3?.responsibilities || ''
            }
        ];

        // Load saved team data from localStorage or use defaults
        const savedTeamData = localStorage.getItem('neural-wars-team-data');
        if (savedTeamData) {
            try {
                const parsed = JSON.parse(savedTeamData);
                // Merge saved data with defaults
                defaultMembers.forEach(defaultMember => {
                    const savedMember = parsed.find(m => m.id === defaultMember.id);
                    if (savedMember) {
                        Object.assign(defaultMember, savedMember);
                    }
                    this.teamMembers.set(defaultMember.id, defaultMember);
                });
            } catch (error) {
                console.error('Error parsing saved team data:', error);
                defaultMembers.forEach(member => this.teamMembers.set(member.id, member));
            }
        } else {
            defaultMembers.forEach(member => this.teamMembers.set(member.id, member));
        }
    }

    renderTeamInterface() {
        this.renderTeamRoles();
        this.renderMeetingLog();
        this.renderTeamStats();
    }

    renderTeamRoles() {
        const container = document.getElementById('team-roles-content');
        if (!container) return;

        const membersArray = Array.from(this.teamMembers.values());
        
        container.innerHTML = `
            <div class="team-members-grid">
                ${membersArray.map(member => this.renderMemberCard(member)).join('')}
            </div>
            <div class="team-actions-bar">
                <button class="btn btn-primary add-member-btn">
                    <i class="fas fa-user-plus"></i> Add Team Member
                </button>
                <button class="btn btn-secondary" onclick="teamManager.exportTeamData()">
                    <i class="fas fa-download"></i> Export Team Data
                </button>
            </div>
            ${this.renderTeamStatsWidget()}
        `;
    }

    renderMemberCard(member) {
        const statusClass = member.status === 'on-track' ? 'success' : 
                           member.status === 'at-risk' ? 'warning' : 'danger';
        
        return `
            <div class="member-card" data-member-id="${member.id}">
                <div class="member-header">
                    <div class="member-avatar">
                        <span class="avatar-initials">${this.getInitials(member.fullName)}</span>
                    </div>
                    <div class="member-info">
                        <h4 class="member-name">${member.fullName}</h4>
                        <p class="member-role">${member.role}</p>
                        <span class="status-badge ${statusClass}">${member.status}</span>
                    </div>
                    <button class="btn btn-small edit-member-btn" data-member-id="${member.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                <div class="member-details">
                    <div class="current-task">
                        <strong>Current Task:</strong> ${member.currentTask}
                    </div>
                    <div class="progress-section">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${member.progress}%"></div>
                        </div>
                        <span class="progress-text">${member.progress}% complete</span>
                    </div>
                    <div class="member-stats">
                        <div class="stat-item">
                            <span class="stat-value">${member.completionRate}%</span>
                            <span class="stat-label">Task Completion</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${member.tasksCompleted}/${member.totalTasks}</span>
                            <span class="stat-label">Tasks Done</span>
                        </div>
                    </div>
                    <div class="contact-info">
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <span>${member.email}</span>
                        </div>
                        ${member.phone ? `
                            <div class="contact-item">
                                <i class="fas fa-phone"></i>
                                <span>${member.phone}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="skills-section">
                        <strong>Skills:</strong>
                        <div class="skills-tags">
                            ${member.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                    <div class="last-update">
                        <small>Last updated: ${new Date(member.lastUpdate).toLocaleDateString()}</small>
                    </div>
                </div>
            </div>
        `;
    }

    renderTeamStatsWidget() {
        const members = Array.from(this.teamMembers.values());
        const avgProgress = members.reduce((sum, m) => sum + m.progress, 0) / members.length;
        const avgCompletion = members.reduce((sum, m) => sum + m.completionRate, 0) / members.length;
        const totalTasks = members.reduce((sum, m) => sum + m.totalTasks, 0);
        const completedTasks = members.reduce((sum, m) => sum + m.tasksCompleted, 0);

        return `
            <div class="team-stats-widget">
                <h4><i class="fas fa-chart-bar"></i> Team Performance Overview</h4>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${Math.round(avgProgress)}%</div>
                        <div class="stat-label">Avg. Progress</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${Math.round(avgCompletion)}%</div>
                        <div class="stat-label">Completion Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${completedTasks}/${totalTasks}</div>
                        <div class="stat-label">Total Tasks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${members.length}</div>
                        <div class="stat-label">Team Members</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMeetingLog() {
        const container = document.getElementById('meetings-list');
        if (!container) return;

        // Load meetings from localStorage
        const savedMeetings = localStorage.getItem('neural-wars-meetings');
        this.meetings = savedMeetings ? JSON.parse(savedMeetings) : [];

        if (this.meetings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <p>No meetings logged yet. Click "Log Meeting" to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.meetings
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10) // Show last 10 meetings
            .map(meeting => `
                <div class="meeting-item">
                    <div class="meeting-header">
                        <h5>${meeting.type}</h5>
                        <span class="meeting-date">${new Date(meeting.date).toLocaleDateString()}</span>
                    </div>
                    <div class="meeting-details">
                        <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
                        <p><strong>Attendees:</strong> ${meeting.attendees.join(', ')}</p>
                        ${meeting.notes ? `<p><strong>Notes:</strong> ${meeting.notes}</p>` : ''}
                        ${meeting.actionItems && meeting.actionItems.length > 0 ? `
                            <div class="action-items">
                                <strong>Action Items:</strong>
                                <ul>
                                    ${meeting.actionItems.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
    }

    getInitials(fullName) {
        return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    openMemberEditModal(memberId = null) {
        const member = memberId ? this.teamMembers.get(memberId) : null;
        const isEdit = !!member;

        const modal = this.createModal('member-edit-modal', 'Edit Team Member', `
            <form id="member-edit-form">
                <input type="hidden" id="member-id" value="${member?.id || ''}">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="member-full-name">Full Name *</label>
                        <input type="text" id="member-full-name" value="${member?.fullName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="member-role">Role *</label>
                        <select id="member-role" required>
                            <option value="">Select Role...</option>
                            <option value="Content Creator & Visual Designer" ${member?.role === 'Content Creator & Visual Designer' ? 'selected' : ''}>Content Creator & Visual Designer</option>
                            <option value="Social Engagement & Community Manager" ${member?.role === 'Social Engagement & Community Manager' ? 'selected' : ''}>Social Engagement & Community Manager</option>
                            <option value="Analytics, Advertising & Strategic Coordination" ${member?.role === 'Analytics, Advertising & Strategic Coordination' ? 'selected' : ''}>Analytics, Advertising & Strategic Coordination</option>
                            <option value="Project Manager" ${member?.role === 'Project Manager' ? 'selected' : ''}>Project Manager</option>
                            <option value="Other" ${member?.role && !['Content Creator & Visual Designer', 'Social Engagement & Community Manager', 'Analytics, Advertising & Strategic Coordination', 'Project Manager'].includes(member.role) ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="member-email">Email</label>
                        <input type="email" id="member-email" value="${member?.email || ''}">
                    </div>
                    <div class="form-group">
                        <label for="member-phone">Phone</label>
                        <input type="tel" id="member-phone" value="${member?.phone || ''}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="member-status">Status</label>
                        <select id="member-status">
                            <option value="on-track" ${member?.status === 'on-track' ? 'selected' : ''}>On Track</option>
                            <option value="at-risk" ${member?.status === 'at-risk' ? 'selected' : ''}>At Risk</option>
                            <option value="blocked" ${member?.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="member-progress">Progress (%)</label>
                        <input type="number" id="member-progress" min="0" max="100" value="${member?.progress || 0}">
                    </div>
                </div>

                <div class="form-group">
                    <label for="member-current-task">Current Task</label>
                    <input type="text" id="member-current-task" value="${member?.currentTask || ''}">
                </div>

                <div class="form-group">
                    <label for="member-skills">Skills (comma-separated)</label>
                    <input type="text" id="member-skills" value="${member?.skills?.join(', ') || ''}" 
                           placeholder="Graphic Design, Video Editing, Content Writing">
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-primary" id="save-member-btn">
                        ${isEdit ? 'Update' : 'Add'} Member
                    </button>
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                </div>
            </form>
        `);

        document.body.appendChild(modal);
        this.showModal('member-edit-modal');
    }

    saveMemberData() {
        const form = document.getElementById('member-edit-form');
        const formData = new FormData(form);
        
        const memberId = document.getElementById('member-id').value || this.generateMemberId();
        const memberData = {
            id: memberId,
            fullName: document.getElementById('member-full-name').value,
            name: document.getElementById('member-full-name').value.split(' ')[0], // First name as short name
            role: document.getElementById('member-role').value,
            email: document.getElementById('member-email').value,
            phone: document.getElementById('member-phone').value,
            status: document.getElementById('member-status').value,
            progress: parseInt(document.getElementById('member-progress').value) || 0,
            currentTask: document.getElementById('member-current-task').value,
            skills: document.getElementById('member-skills').value.split(',').map(s => s.trim()).filter(s => s),
            lastUpdate: new Date().toISOString(),
            tasksCompleted: this.teamMembers.get(memberId)?.tasksCompleted || 0,
            totalTasks: this.teamMembers.get(memberId)?.totalTasks || 0,
            completionRate: this.teamMembers.get(memberId)?.completionRate || 0,
            responsibilities: this.teamMembers.get(memberId)?.responsibilities || ''
        };

        this.teamMembers.set(memberId, memberData);
        this.saveTeamData();
        this.renderTeamInterface();
        this.hideModal('member-edit-modal');
        this.showNotification('Team member updated successfully', 'success');
    }

    generateMemberId() {
        return 'member_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    saveTeamData() {
        const teamData = Array.from(this.teamMembers.values());
        localStorage.setItem('neural-wars-team-data', JSON.stringify(teamData));
    }

    async exportTeamData() {
        try {
            const teamData = Array.from(this.teamMembers.values());
            const exportData = {
                teamMembers: teamData,
                meetings: this.meetings,
                exportDate: new Date().toISOString()
            };

            // Create and download the file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'neural-wars-team-data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Team data exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Failed to export team data', 'error');
        }
    }

    openMeetingModal() {
        const modal = this.createModal('meeting-modal', 'Log Team Meeting', `
            <form id="meeting-form">
                <div class="form-group">
                    <label for="meeting-type">Meeting Type *</label>
                    <select id="meeting-type" required>
                        <option value="">Select meeting type...</option>
                        <option value="Daily Stand-up">Daily Stand-up</option>
                        <option value="Weekly Planning">Weekly Planning</option>
                        <option value="Strategy Review">Strategy Review</option>
                        <option value="Campaign Review">Campaign Review</option>
                        <option value="One-on-One">One-on-One</option>
                        <option value="Team Building">Team Building</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="meeting-duration">Duration (minutes)</label>
                        <input type="number" id="meeting-duration" min="1" value="30">
                    </div>
                    <div class="form-group">
                        <label for="meeting-date">Meeting Date</label>
                        <input type="date" id="meeting-date" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>

                <div class="form-group">
                    <label for="meeting-attendees">Attendees *</label>
                    <div class="attendees-checkboxes">
                        ${Array.from(this.teamMembers.values()).map(member => `
                            <label class="checkbox-label">
                                <input type="checkbox" value="${member.fullName}" checked>
                                ${member.fullName} (${member.role})
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="form-group">
                    <label for="meeting-notes">Meeting Notes</label>
                    <textarea id="meeting-notes" rows="4" placeholder="Key discussion points, decisions made..."></textarea>
                </div>

                <div class="form-group">
                    <label for="action-items">Action Items (one per line)</label>
                    <textarea id="action-items" rows="3" placeholder="• Follow up on social media metrics
• Schedule content creation review
• Update campaign timeline"></textarea>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-primary" onclick="teamManager.saveMeeting()">
                        Log Meeting
                    </button>
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                </div>
            </form>
        `);

        document.body.appendChild(modal);
        this.showModal('meeting-modal');
    }

    saveMeeting() {
        const meetingType = document.getElementById('meeting-type').value;
        const duration = parseInt(document.getElementById('meeting-duration').value) || 30;
        const date = document.getElementById('meeting-date').value;
        const notes = document.getElementById('meeting-notes').value;
        const actionItemsText = document.getElementById('action-items').value;

        // Get selected attendees
        const attendeeCheckboxes = document.querySelectorAll('#meeting-modal .attendees-checkboxes input[type="checkbox"]:checked');
        const attendees = Array.from(attendeeCheckboxes).map(cb => cb.value);

        // Parse action items
        const actionItems = actionItemsText
            .split('\n')
            .map(item => item.trim().replace(/^[•-]\s*/, ''))
            .filter(item => item.length > 0);

        if (!meetingType || attendees.length === 0) {
            this.showNotification('Please fill in required fields', 'error');
            return;
        }

        const meeting = {
            id: Date.now().toString(),
            type: meetingType,
            duration,
            date: date || new Date().toISOString().split('T')[0],
            attendees,
            notes,
            actionItems,
            createdAt: new Date().toISOString()
        };

        this.meetings.unshift(meeting);
        this.saveMeetingData();
        this.renderMeetingLog();
        this.hideModal('meeting-modal');
        this.showNotification('Meeting logged successfully', 'success');
    }

    openStatusUpdateModal() {
        const membersOptions = Array.from(this.teamMembers.values()).map(member => 
            `<option value="${member.id}">${member.fullName} (${member.role})</option>`
        ).join('');

        const modal = this.createModal('status-update-modal', 'Update Team Member Status', `
            <form id="status-update-form">
                <div class="form-group">
                    <label for="status-member-select">Team Member *</label>
                    <select id="status-member-select" required>
                        <option value="">Select team member...</option>
                        ${membersOptions}
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="status-current-task">Current Task</label>
                        <input type="text" id="status-current-task" placeholder="What are they working on?">
                    </div>
                    <div class="form-group">
                        <label for="status-progress">Progress (%)</label>
                        <input type="number" id="status-progress" min="0" max="100" value="0">
                    </div>
                </div>

                <div class="form-group">
                    <label for="status-status">Status</label>
                    <select id="status-status">
                        <option value="on-track">On Track</option>
                        <option value="at-risk">At Risk</option>
                        <option value="blocked">Blocked</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="status-notes">Status Notes</label>
                    <textarea id="status-notes" rows="3" placeholder="Any blockers, achievements, or updates..."></textarea>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-primary" onclick="teamManager.saveStatusUpdate()">
                        Update Status
                    </button>
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                </div>
            </form>
        `);

        document.body.appendChild(modal);
        this.showModal('status-update-modal');

        // Add event listener for member selection to populate current data
        document.getElementById('status-member-select').addEventListener('change', (e) => {
            const memberId = e.target.value;
            if (memberId) {
                const member = this.teamMembers.get(memberId);
                if (member) {
                    document.getElementById('status-current-task').value = member.currentTask || '';
                    document.getElementById('status-progress').value = member.progress || 0;
                    document.getElementById('status-status').value = member.status || 'on-track';
                }
            }
        });
    }

    saveStatusUpdate() {
        const memberId = document.getElementById('status-member-select').value;
        const currentTask = document.getElementById('status-current-task').value;
        const progress = parseInt(document.getElementById('status-progress').value) || 0;
        const status = document.getElementById('status-status').value;
        const notes = document.getElementById('status-notes').value;

        if (!memberId) {
            this.showNotification('Please select a team member', 'error');
            return;
        }

        const member = this.teamMembers.get(memberId);
        if (member) {
            member.currentTask = currentTask;
            member.progress = progress;
            member.status = status;
            member.lastUpdate = new Date().toISOString();

            // Log status update as an activity if notes provided
            if (notes) {
                const statusUpdate = {
                    id: Date.now().toString(),
                    type: 'Status Update',
                    member: member.fullName,
                    notes,
                    timestamp: new Date().toISOString()
                };
                
                // Save to activity log (you might want to create a separate activities array)
                const activities = JSON.parse(localStorage.getItem('neural-wars-activities') || '[]');
                activities.unshift(statusUpdate);
                localStorage.setItem('neural-wars-activities', JSON.stringify(activities.slice(0, 50))); // Keep last 50 activities
            }

            this.saveTeamData();
            this.renderTeamInterface();
            this.hideModal('status-update-modal');
            this.showNotification(`${member.fullName}'s status updated successfully`, 'success');
        }
    }

    saveMeetingData() {
        localStorage.setItem('neural-wars-meetings', JSON.stringify(this.meetings));
    }
    createModal(id, title, content) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        // Add event listeners
        modal.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close') || e.target === modal) {
                this.hideModal(id);
            }
        });

        return modal;
    }

    showModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('hidden');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                                type === 'error' ? 'fa-exclamation-circle' : 
                                'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    async apiCall(endpoint) {
        const response = await fetch(`/api${endpoint}`);
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }
        return response.json();
    }
}

// Initialize team manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.teamManager = new TeamManager();
});

// Legacy functions for backwards compatibility
function logMeeting() {
    if (window.teamManager) {
        window.teamManager.openMeetingModal();
    }
}

function updateStatus() {
    if (window.teamManager) {
        window.teamManager.openStatusUpdateModal();
    }
}