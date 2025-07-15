// Export-specific functionality
// This file extends the main app with export and integration methods

// Enhanced Export Functionality for Neural Wars Marketing App
class ExportManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupExportListeners();
        this.setupIntegrationListeners();
    }

    setupExportListeners() {
        // Export buttons for templates, tasks, dashboard, and team data
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-export]')) {
                e.preventDefault();
                const exportType = e.target.dataset.export;
                const format = e.target.dataset.format;
                this.handleExport(exportType, format);
            }
        });
    }

    setupIntegrationListeners() {
        // Integration buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-integration]')) {
                e.preventDefault();
                const service = e.target.dataset.integration;
                this.handleIntegration(service);
            }
        });
    }

    async handleExport(type, format) {
        this.showExportProgress();
        
        try {
            switch (type) {
                case 'templates':
                    await this.exportTemplates(format);
                    break;
                case 'tasks':
                    await this.exportTasks(format);
                    break;
                case 'dashboard':
                    await this.exportDashboard(format);
                    break;
                case 'team':
                    await this.exportTeamData(format);
                    break;
                case 'all':
                    await this.exportAllData(format);
                    break;
                default:
                    throw new Error('Unknown export type');
            }
            
            this.showNotification(`${type} exported successfully as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification(`Failed to export ${type}`, 'error');
        } finally {
            this.hideExportProgress();
        }
    }

    async exportTemplates(format) {
        if (format === 'json' || format === 'csv') {
            // Use existing API endpoint
            window.location.href = `/api/export/templates/${format}`;
        } else if (format === 'markdown' || format === 'md') {
            // Use existing API endpoint
            window.location.href = `/api/export/templates/markdown`;
        } else if (format === 'txt' || format === 'plain') {
            // Generate plain text format
            const templates = await this.fetchData('/api/templates');
            const plainText = this.convertTemplatesToPlainText(templates.data);
            this.downloadAsFile(plainText, 'neural-wars-templates.txt', 'text/plain');
        }
    }

    async exportTasks(format) {
        if (format === 'json' || format === 'csv') {
            // Use existing API endpoint
            window.location.href = `/api/export/tasks/${format}`;
        } else if (format === 'markdown' || format === 'md') {
            // Use existing API endpoint
            window.location.href = `/api/export/tasks/markdown`;
        } else if (format === 'txt' || format === 'plain') {
            // Generate plain text format
            const tasks = await this.fetchData('/api/tasks/daily');
            const plainText = this.convertTasksToPlainText(tasks.data);
            this.downloadAsFile(plainText, 'neural-wars-tasks.txt', 'text/plain');
        }
    }

    async exportDashboard(format) {
        if (format === 'json' || format === 'csv') {
            // Use existing API endpoint
            window.location.href = `/api/export/dashboard/${format}`;
        } else if (format === 'markdown' || format === 'md') {
            // Generate markdown format
            const dashboardData = await this.fetchDashboardData();
            const markdown = this.convertDashboardToMarkdown(dashboardData);
            this.downloadAsFile(markdown, 'neural-wars-dashboard.md', 'text/markdown');
        } else if (format === 'txt' || format === 'plain') {
            // Generate plain text format
            const dashboardData = await this.fetchDashboardData();
            const plainText = this.convertDashboardToPlainText(dashboardData);
            this.downloadAsFile(plainText, 'neural-wars-dashboard.txt', 'text/plain');
        }
    }

    async exportTeamData(format) {
        // Get team data from TeamManager if available
        const teamData = window.teamManager ? {
            members: Array.from(window.teamManager.teamMembers.values()),
            meetings: window.teamManager.meetings || []
        } : await this.fetchTeamData();

        if (format === 'json') {
            const json = JSON.stringify(teamData, null, 2);
            this.downloadAsFile(json, 'neural-wars-team.json', 'application/json');
        } else if (format === 'csv') {
            const csv = this.convertTeamToCSV(teamData);
            this.downloadAsFile(csv, 'neural-wars-team.csv', 'text/csv');
        } else if (format === 'markdown' || format === 'md') {
            const markdown = this.convertTeamToMarkdown(teamData);
            this.downloadAsFile(markdown, 'neural-wars-team.md', 'text/markdown');
        } else if (format === 'txt' || format === 'plain') {
            const plainText = this.convertTeamToPlainText(teamData);
            this.downloadAsFile(plainText, 'neural-wars-team.txt', 'text/plain');
        }
    }

    async exportAllData(format) {
        const [templates, tasks, dashboard, team] = await Promise.all([
            this.fetchData('/api/templates'),
            this.fetchData('/api/tasks/daily'),
            this.fetchDashboardData(),
            this.fetchTeamData()
        ]);

        const allData = {
            exportDate: new Date().toISOString(),
            campaignName: "The Neural Wars: Fractured Code",
            templates: templates.data,
            tasks: tasks.data,
            dashboard: dashboard,
            team: team,
            metadata: {
                version: "1.0.0",
                exportedBy: "Neural Wars Marketing Automation",
                totalTemplates: Object.keys(templates.data || {}).length,
                totalTasks: this.countTotalTasks(tasks.data),
                totalTeamMembers: team.members ? team.members.length : 0
            }
        };

        if (format === 'json') {
            const json = JSON.stringify(allData, null, 2);
            this.downloadAsFile(json, 'neural-wars-complete-export.json', 'application/json');
        } else if (format === 'markdown' || format === 'md') {
            const markdown = this.convertAllDataToMarkdown(allData);
            this.downloadAsFile(markdown, 'neural-wars-complete-export.md', 'text/markdown');
        } else if (format === 'txt' || format === 'plain') {
            const plainText = this.convertAllDataToPlainText(allData);
            this.downloadAsFile(plainText, 'neural-wars-complete-export.txt', 'text/plain');
        }
    }

    // Format conversion methods
    convertTemplatesToPlainText(templates) {
        let text = 'NEURAL WARS MARKETING TEMPLATES\n';
        text += '================================\n\n';
        text += `Exported: ${new Date().toLocaleDateString()}\n\n`;

        Object.entries(templates || {}).forEach(([type, template]) => {
            text += `${template.title.toUpperCase()}\n`;
            text += '-'.repeat(template.title.length) + '\n\n';
            text += template.content.replace(/[#*_`]/g, '') + '\n\n';
            text += '=' + '='.repeat(50) + '\n\n';
        });

        return text;
    }

    convertTasksToPlainText(tasks) {
        let text = 'NEURAL WARS DAILY TASKS\n';
        text += '=======================\n\n';
        text += `Exported: ${new Date().toLocaleDateString()}\n\n`;

        ['person1', 'person2', 'person3'].forEach(person => {
            if (tasks[person]) {
                text += `${person.toUpperCase().replace('PERSON', 'TEAM MEMBER ')}\n`;
                text += '-'.repeat(20) + '\n';
                tasks[person].forEach(task => {
                    const status = task.completed ? '[DONE]' : '[TODO]';
                    text += `${status} ${task.text}\n`;
                    if (task.estimatedTime) {
                        text += `      Estimated Time: ${task.estimatedTime} minutes\n`;
                    }
                });
                text += '\n';
            }
        });

        return text;
    }

    convertDashboardToMarkdown(data) {
        let md = '# Neural Wars Marketing Dashboard Export\n\n';
        md += `**Export Date:** ${new Date().toISOString()}\n\n`;
        md += `**Campaign:** The Neural Wars: Fractured Code\n\n`;
        
        md += '## Campaign Overview\n\n';
        md += `- **Phase:** Foundation Phase\n`;
        md += `- **Status:** Active\n`;
        md += `- **Days Until Launch:** 90\n\n`;

        md += '## Key Metrics\n\n';
        md += '| Metric | Value |\n';
        md += '|--------|-------|\n';
        md += '| Amazon BSR | #-- |\n';
        md += '| Total Sales | -- |\n';
        md += '| Reviews | -- |\n';
        md += '| Email Subscribers | -- |\n\n';

        md += '## Team Status\n\n';
        if (data.team && data.team.members) {
            data.team.members.forEach(member => {
                md += `### ${member.fullName}\n`;
                md += `- **Role:** ${member.role}\n`;
                md += `- **Status:** ${member.status}\n`;
                md += `- **Current Task:** ${member.currentTask}\n`;
                md += `- **Progress:** ${member.progress}%\n\n`;
            });
        }

        return md;
    }

    convertDashboardToPlainText(data) {
        let text = 'NEURAL WARS MARKETING DASHBOARD\n';
        text += '==============================\n\n';
        text += `Export Date: ${new Date().toLocaleDateString()}\n`;
        text += `Campaign: The Neural Wars: Fractured Code\n\n`;
        
        text += 'CAMPAIGN OVERVIEW\n';
        text += '================\n';
        text += 'Phase: Foundation Phase\n';
        text += 'Status: Active\n';
        text += 'Days Until Launch: 90\n\n';

        text += 'KEY METRICS\n';
        text += '===========\n';
        text += 'Amazon BSR: #--\n';
        text += 'Total Sales: --\n';
        text += 'Reviews: --\n';
        text += 'Email Subscribers: --\n\n';

        text += 'TEAM STATUS\n';
        text += '===========\n';
        if (data.team && data.team.members) {
            data.team.members.forEach(member => {
                text += `${member.fullName}\n`;
                text += `  Role: ${member.role}\n`;
                text += `  Status: ${member.status}\n`;
                text += `  Current Task: ${member.currentTask}\n`;
                text += `  Progress: ${member.progress}%\n\n`;
            });
        }

        return text;
    }

    convertTeamToCSV(teamData) {
        let csv = 'Name,Role,Email,Phone,Status,Current Task,Progress,Completion Rate,Last Update\n';
        
        if (teamData.members) {
            teamData.members.forEach(member => {
                const row = [
                    member.fullName || '',
                    member.role || '',
                    member.email || '',
                    member.phone || '',
                    member.status || '',
                    member.currentTask || '',
                    member.progress || 0,
                    member.completionRate || 0,
                    member.lastUpdate || ''
                ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
                csv += row + '\n';
            });
        }

        return csv;
    }

    convertTeamToMarkdown(teamData) {
        let md = '# Neural Wars Team Directory\n\n';
        md += `**Export Date:** ${new Date().toISOString()}\n\n`;

        if (teamData.members && teamData.members.length > 0) {
            md += '## Team Members\n\n';
            teamData.members.forEach(member => {
                md += `### ${member.fullName}\n\n`;
                md += `- **Role:** ${member.role}\n`;
                md += `- **Email:** ${member.email}\n`;
                md += `- **Phone:** ${member.phone || 'N/A'}\n`;
                md += `- **Status:** ${member.status}\n`;
                md += `- **Current Task:** ${member.currentTask}\n`;
                md += `- **Progress:** ${member.progress}%\n`;
                md += `- **Task Completion Rate:** ${member.completionRate}%\n`;
                if (member.skills && member.skills.length > 0) {
                    md += `- **Skills:** ${member.skills.join(', ')}\n`;
                }
                md += `- **Last Updated:** ${new Date(member.lastUpdate).toLocaleDateString()}\n\n`;
            });
        }

        if (teamData.meetings && teamData.meetings.length > 0) {
            md += '## Recent Meetings\n\n';
            teamData.meetings.slice(0, 10).forEach(meeting => {
                md += `### ${meeting.type} - ${new Date(meeting.date).toLocaleDateString()}\n\n`;
                md += `- **Duration:** ${meeting.duration} minutes\n`;
                md += `- **Attendees:** ${meeting.attendees.join(', ')}\n`;
                if (meeting.notes) {
                    md += `- **Notes:** ${meeting.notes}\n`;
                }
                if (meeting.actionItems && meeting.actionItems.length > 0) {
                    md += `- **Action Items:**\n`;
                    meeting.actionItems.forEach(item => {
                        md += `  - ${item}\n`;
                    });
                }
                md += '\n';
            });
        }

        return md;
    }

    convertTeamToPlainText(teamData) {
        let text = 'NEURAL WARS TEAM DIRECTORY\n';
        text += '=========================\n\n';
        text += `Export Date: ${new Date().toLocaleDateString()}\n\n`;

        if (teamData.members && teamData.members.length > 0) {
            text += 'TEAM MEMBERS\n';
            text += '============\n\n';
            teamData.members.forEach(member => {
                text += `${member.fullName.toUpperCase()}\n`;
                text += '-'.repeat(member.fullName.length) + '\n';
                text += `Role: ${member.role}\n`;
                text += `Email: ${member.email}\n`;
                text += `Phone: ${member.phone || 'N/A'}\n`;
                text += `Status: ${member.status}\n`;
                text += `Current Task: ${member.currentTask}\n`;
                text += `Progress: ${member.progress}%\n`;
                text += `Task Completion Rate: ${member.completionRate}%\n`;
                if (member.skills && member.skills.length > 0) {
                    text += `Skills: ${member.skills.join(', ')}\n`;
                }
                text += `Last Updated: ${new Date(member.lastUpdate).toLocaleDateString()}\n\n`;
            });
        }

        if (teamData.meetings && teamData.meetings.length > 0) {
            text += 'RECENT MEETINGS\n';
            text += '===============\n\n';
            teamData.meetings.slice(0, 10).forEach(meeting => {
                text += `${meeting.type} - ${new Date(meeting.date).toLocaleDateString()}\n`;
                text += `Duration: ${meeting.duration} minutes\n`;
                text += `Attendees: ${meeting.attendees.join(', ')}\n`;
                if (meeting.notes) {
                    text += `Notes: ${meeting.notes}\n`;
                }
                if (meeting.actionItems && meeting.actionItems.length > 0) {
                    text += 'Action Items:\n';
                    meeting.actionItems.forEach(item => {
                        text += `  - ${item}\n`;
                    });
                }
                text += '\n';
            });
        }

        return text;
    }

    convertAllDataToMarkdown(allData) {
        let md = '# Neural Wars Marketing Campaign - Complete Export\n\n';
        md += `**Export Date:** ${allData.exportDate}\n`;
        md += `**Campaign:** ${allData.campaignName}\n`;
        md += `**Version:** ${allData.metadata.version}\n\n`;

        md += '## Export Summary\n\n';
        md += `- **Templates:** ${allData.metadata.totalTemplates}\n`;
        md += `- **Tasks:** ${allData.metadata.totalTasks}\n`;
        md += `- **Team Members:** ${allData.metadata.totalTeamMembers}\n\n`;

        md += '---\n\n';
        md += this.convertDashboardToMarkdown(allData);
        md += '\n---\n\n';
        md += this.convertTeamToMarkdown(allData.team);
        
        return md;
    }

    convertAllDataToPlainText(allData) {
        let text = 'NEURAL WARS MARKETING CAMPAIGN - COMPLETE EXPORT\n';
        text += '================================================\n\n';
        text += `Export Date: ${new Date(allData.exportDate).toLocaleDateString()}\n`;
        text += `Campaign: ${allData.campaignName}\n`;
        text += `Version: ${allData.metadata.version}\n\n`;

        text += 'EXPORT SUMMARY\n';
        text += '==============\n';
        text += `Templates: ${allData.metadata.totalTemplates}\n`;
        text += `Tasks: ${allData.metadata.totalTasks}\n`;
        text += `Team Members: ${allData.metadata.totalTeamMembers}\n\n`;

        text += '=' + '='.repeat(50) + '\n\n';
        text += this.convertDashboardToPlainText(allData);
        text += '\n' + '=' + '='.repeat(50) + '\n\n';
        text += this.convertTeamToPlainText(allData.team);
        
        return text;
    }

    // Integration handlers
    handleIntegration(service) {
        switch (service) {
            case 'google-workspace':
                this.showIntegrationModal('Google Workspace', `
                    <p>To integrate with Google Workspace:</p>
                    <ol>
                        <li>Export your data as JSON or CSV format</li>
                        <li>Import to Google Sheets for analysis</li>
                        <li>Use Google Docs for template management</li>
                        <li>Set up Google Calendar for meeting management</li>
                    </ol>
                    <div class="integration-buttons">
                        <button class="btn btn-primary" onclick="exportManager.exportAllData('csv')">Export for Google Sheets</button>
                        <button class="btn btn-secondary" onclick="exportManager.exportTemplates('markdown')">Export Templates for Docs</button>
                    </div>
                `);
                break;
            case 'asana':
                this.showIntegrationModal('Asana Integration', `
                    <p>To integrate with Asana:</p>
                    <ol>
                        <li>Export tasks as CSV</li>
                        <li>Create a new Asana project</li>
                        <li>Import the CSV file to create tasks</li>
                        <li>Assign team members to tasks</li>
                    </ol>
                    <div class="integration-buttons">
                        <button class="btn btn-primary" onclick="exportManager.exportTasks('csv')">Export Tasks for Asana</button>
                        <button class="btn btn-secondary" onclick="exportManager.exportTeamData('csv')">Export Team Data</button>
                    </div>
                `);
                break;
            case 'slack':
                this.showIntegrationModal('Slack Integration', `
                    <p>To integrate with Slack:</p>
                    <ol>
                        <li>Set up a Slack workspace for your team</li>
                        <li>Create channels for different campaign areas</li>
                        <li>Use exported team data to invite members</li>
                        <li>Set up automated status updates</li>
                    </ol>
                    <div class="integration-buttons">
                        <button class="btn btn-primary" onclick="exportManager.exportTeamData('json')">Export Team Contacts</button>
                        <button class="btn btn-secondary" onclick="exportManager.exportAllData('markdown')">Export for Documentation</button>
                    </div>
                `);
                break;
            default:
                this.showNotification(`${service} integration coming soon!`, 'info');
        }
    }

    // Utility methods
    async fetchData(endpoint) {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${endpoint}`);
        }
        return response.json();
    }

    async fetchDashboardData() {
        try {
            const [overview, metrics] = await Promise.all([
                this.fetchData('/api/dashboard/overview'),
                this.fetchData('/api/dashboard/metrics')
            ]);
            return { overview: overview.data, metrics: metrics.data };
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            return {};
        }
    }

    async fetchTeamData() {
        if (window.teamManager) {
            return {
                members: Array.from(window.teamManager.teamMembers.values()),
                meetings: window.teamManager.meetings || []
            };
        }
        
        try {
            const [coordination, roles, status] = await Promise.all([
                this.fetchData('/api/team/coordination'),
                this.fetchData('/api/team/roles'),
                this.fetchData('/api/team/status')
            ]);
            return { coordination: coordination.data, roles: roles.data, status: status.data };
        } catch (error) {
            console.error('Failed to fetch team data:', error);
            return {};
        }
    }

    countTotalTasks(tasks) {
        let total = 0;
        ['person1', 'person2', 'person3'].forEach(person => {
            if (tasks[person]) {
                total += tasks[person].length;
            }
        });
        return total;
    }

    downloadAsFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showIntegrationModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
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

        modal.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close') || e.target === modal) {
                modal.classList.add('hidden');
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
            }
        });

        document.body.appendChild(modal);
    }

    showExportProgress() {
        const progressEl = document.createElement('div');
        progressEl.id = 'export-progress';
        progressEl.className = 'notification info';
        progressEl.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Preparing export...</span>
            </div>
        `;
        document.body.appendChild(progressEl);
    }

    hideExportProgress() {
        const progressEl = document.getElementById('export-progress');
        if (progressEl) {
            progressEl.remove();
        }
    }

    showNotification(message, type = 'info') {
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

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize export manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.exportManager = new ExportManager();
});

// Legacy export functions for backwards compatibility
window.exportData = (type, format) => {
    if (window.exportManager) {
        window.exportManager.handleExport(type, format);
    }
};