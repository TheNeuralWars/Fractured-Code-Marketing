// Dashboard-specific functionality
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.setupDataChangeListeners();
    }

    setupEventListeners() {
        // Refresh metrics button
        const refreshBtn = document.getElementById('refresh-metrics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshMetrics());
        }

        // Edit mode buttons
        document.querySelectorAll('[onclick*="toggleEditMode"]').forEach(btn => {
            const section = btn.getAttribute('onclick').match(/toggleEditMode\('(.+?)'\)/)?.[1];
            if (section) {
                btn.onclick = () => this.toggleEditMode(section);
            }
        });
    }

    setupDataChangeListeners() {
        document.addEventListener('dataChanged', (e) => {
            const { section } = e.detail;
            if (section === 'metrics' || section === 'campaignGoals' || section === 'weeklyProgress' || section === 'teamStatus') {
                this.updateDashboardDisplay();
            }
            if (section === 'tasks') {
                this.updateTaskProgress();
            }
        });
    }

    loadDashboardData() {
        this.updateMetricsDisplay();
        this.updateCampaignGoalsDisplay();
        this.updateWeeklyProgressDisplay();
        this.updateTeamStatusDisplay();
        this.updateTaskProgress();
    }

    updateDashboardDisplay() {
        this.updateMetricsDisplay();
        this.updateCampaignGoalsDisplay();
        this.updateWeeklyProgressDisplay();
        this.updateTeamStatusDisplay();
    }

    updateMetricsDisplay() {
        const metrics = dataManager.get('metrics');
        
        document.getElementById('sales-rank').textContent = `#${metrics.salesRank}`;
        document.getElementById('total-sales').textContent = metrics.totalSales;
        document.getElementById('review-count').textContent = metrics.reviewCount;
        document.getElementById('email-subscribers').textContent = metrics.emailSubscribers;
    }

    updateCampaignGoalsDisplay() {
        const goals = dataManager.get('campaignGoals');
        
        const salesTargetEl = document.querySelector('[data-field="sales-target"] .editable-content');
        const launchDateEl = document.querySelector('[data-field="launch-date"] .editable-content');
        const budgetEl = document.querySelector('[data-field="budget"] .editable-content');
        
        if (salesTargetEl) salesTargetEl.textContent = goals.salesTarget || 'Click Edit to set target';
        if (launchDateEl) launchDateEl.textContent = goals.launchDate || 'Click Edit to set date';
        if (budgetEl) budgetEl.textContent = goals.budget ? `$${goals.budget}` : '$Click Edit to set budget';
    }

    updateWeeklyProgressDisplay() {
        const progress = dataManager.get('weeklyProgress');
        
        const notesEl = document.querySelector('[data-field="weekly-notes"] .editable-content');
        const milestoneEl = document.querySelector('[data-field="next-milestone"] .editable-content');
        
        if (notesEl) notesEl.textContent = progress.notes || 'Click Edit to add notes';
        if (milestoneEl) milestoneEl.textContent = progress.nextMilestone || 'Click Edit to set milestone';
    }

    updateTeamStatusDisplay() {
        const teamStatus = dataManager.get('teamStatus');
        
        // This would update team member status displays
        // Implementation depends on the specific UI structure
    }

    updateTaskProgress() {
        const stats = dataManager.getTaskStats();
        
        const progressText = document.querySelector('.progress-text');
        const progressFill = document.querySelector('.progress-fill');
        
        if (progressText && progressFill) {
            progressText.textContent = `${stats.completed} of ${stats.total} tasks completed (${stats.percentage}%)`;
            progressFill.style.width = `${stats.percentage}%`;
        }
    }

    toggleEditMode(section) {
        const card = document.querySelector(`.${section}`);
        if (!card) return;

        const isEditing = card.classList.contains('editing');
        
        if (isEditing) {
            this.saveEdits(section);
            card.classList.remove('editing');
        } else {
            this.enterEditMode(section);
            card.classList.add('editing');
        }
    }

    enterEditMode(section) {
        const card = document.querySelector(`.${section}`);
        if (!card) return;

        const editableFields = card.querySelectorAll('.editable-field');
        
        editableFields.forEach(field => {
            const content = field.querySelector('.editable-content');
            const currentValue = this.getCurrentFieldValue(field.dataset.field);
            
            // Create input based on field type
            const input = this.createInputElement(field.dataset.field, currentValue);
            content.style.display = 'none';
            field.appendChild(input);
            input.focus();
        });

        // Update button text
        const editBtn = card.querySelector('[onclick*="toggleEditMode"]');
        if (editBtn) {
            editBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        }
    }

    saveEdits(section) {
        const card = document.querySelector(`.${section}`);
        if (!card) return;

        const updates = {};
        const editableFields = card.querySelectorAll('.editable-field');
        
        editableFields.forEach(field => {
            const input = field.querySelector('input, textarea');
            if (input) {
                const fieldName = field.dataset.field;
                const value = input.value.trim();
                
                updates[this.getDataFieldName(fieldName)] = value;
                
                // Update display
                const content = field.querySelector('.editable-content');
                content.textContent = value || this.getPlaceholderText(fieldName);
                content.style.display = '';
                
                // Remove input
                input.remove();
            }
        });

        // Save to data manager
        const dataSection = this.getDataSection(section);
        if (dataSection && Object.keys(updates).length > 0) {
            dataManager.update(dataSection, updates);
            this.showNotification('Changes saved successfully', 'success');
        }

        // Update button text
        const editBtn = card.querySelector('[onclick*="toggleEditMode"]');
        if (editBtn) {
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        }
    }

    createInputElement(fieldName, currentValue) {
        const input = document.createElement('input');
        input.type = this.getInputType(fieldName);
        input.value = currentValue || '';
        input.className = 'edit-input';
        input.placeholder = this.getPlaceholderText(fieldName);
        
        // Handle Enter key to save
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const section = input.closest('[class*="card"]').className.split(' ').find(c => c.endsWith('-goals') || c.endsWith('-progress'));
                if (section) {
                    this.toggleEditMode(section.replace('card ', ''));
                }
            }
        });
        
        return input;
    }

    getInputType(fieldName) {
        const types = {
            'launch-date': 'date',
            'budget': 'number',
            'sales-target': 'number'
        };
        return types[fieldName] || 'text';
    }

    getCurrentFieldValue(fieldName) {
        const mapping = {
            'sales-target': () => dataManager.get('campaignGoals', 'salesTarget'),
            'launch-date': () => dataManager.get('campaignGoals', 'launchDate'),
            'budget': () => dataManager.get('campaignGoals', 'budget'),
            'weekly-notes': () => dataManager.get('weeklyProgress', 'notes'),
            'next-milestone': () => dataManager.get('weeklyProgress', 'nextMilestone')
        };
        
        return mapping[fieldName] ? mapping[fieldName]() : '';
    }

    getDataFieldName(fieldName) {
        const mapping = {
            'sales-target': 'salesTarget',
            'launch-date': 'launchDate',
            'budget': 'budget',
            'weekly-notes': 'notes',
            'next-milestone': 'nextMilestone'
        };
        return mapping[fieldName] || fieldName;
    }

    getDataSection(section) {
        const mapping = {
            'campaign-goals': 'campaignGoals',
            'weekly-progress': 'weeklyProgress'
        };
        return mapping[section];
    }

    getPlaceholderText(fieldName) {
        const placeholders = {
            'sales-target': 'Enter sales target',
            'launch-date': 'Select launch date',
            'budget': 'Enter budget amount',
            'weekly-notes': 'Add weekly focus notes',
            'next-milestone': 'Set next milestone'
        };
        return placeholders[fieldName] || 'Enter value';
    }

    refreshMetrics() {
        // Show loading state
        const btn = document.getElementById('refresh-metrics');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        btn.disabled = true;

        // Simulate API call or manual refresh
        setTimeout(() => {
            // In a real app, this would fetch from an API
            this.updateMetricsDisplay();
            
            btn.innerHTML = originalText;
            btn.disabled = false;
            this.showNotification('Metrics refreshed', 'success');
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }
}

// Initialize dashboard manager
if (typeof window !== 'undefined') {
    window.dashboardManager = new DashboardManager();
    console.log('✅ Dashboard Manager initialized');
}