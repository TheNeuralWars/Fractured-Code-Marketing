// Export-specific functionality
// This file extends the main app with export and integration methods

class ExportManager {
    constructor(app) {
        this.app = app;
        this.apiBase = '/api/export';
        this.init();
    }

    init() {
        console.log('✅ Export Manager initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Export button handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-export]')) {
                e.preventDefault();
                const exportType = e.target.dataset.export;
                const format = e.target.dataset.format;
                this.exportData(exportType, format);
            }
            
            if (e.target.matches('[data-integration]')) {
                e.preventDefault();
                const service = e.target.dataset.integration;
                this.prepareIntegration(service);
            }
        });

        // Custom export form handler
        const customExportForm = document.getElementById('custom-export-form');
        if (customExportForm) {
            customExportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCustomExport(e.target);
            });
        }
    }

    async exportData(type, format) {
        try {
            this.showLoadingState(`Exporting ${type} as ${format.toUpperCase()}...`);
            
            let endpoint = '';
            let filename = '';
            
            switch (type) {
                case 'templates':
                    endpoint = `${this.apiBase}/templates/${format}`;
                    filename = `neural-wars-templates.${format}`;
                    break;
                case 'tasks':
                    endpoint = `${this.apiBase}/tasks/${format}`;
                    filename = `neural-wars-tasks.${format}`;
                    break;
                case 'dashboard':
                    endpoint = `${this.apiBase}/dashboard/${format}`;
                    filename = `neural-wars-dashboard.${format}`;
                    break;
                case 'team-data':
                    endpoint = `/api/team/members`;
                    filename = `neural-wars-team-data.${format}`;
                    break;
                case 'team-stats':
                    endpoint = `/api/team/statistics`;
                    filename = `neural-wars-team-statistics.${format}`;
                    break;
                case 'campaign-report':
                    await this.generateCampaignReport(format);
                    return;
                case 'team-guide':
                    await this.generateTeamGuide(format);
                    return;
                case 'timeline':
                    await this.generateTimeline(format);
                    return;
                case 'all-docs':
                    await this.generateCompletePackage(format);
                    return;
                default:
                    throw new Error(`Unknown export type: ${type}`);
            }

            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Export failed: ${response.statusText}`);
            }

            // Handle different response types
            if (format === 'json') {
                const data = await response.json();
                this.downloadJSON(data, filename);
            } else {
                const blob = await response.blob();
                this.downloadBlob(blob, filename);
            }

            this.hideLoadingState();
            this.showNotification(`${type} exported successfully as ${format.toUpperCase()}!`, 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            this.hideLoadingState();
            this.showNotification(`Export failed: ${error.message}`, 'error');
        }
    }

    async generateCampaignReport(format) {
        try {
            // Gather comprehensive campaign data
            const [dashboardData, teamData, taskData, templateData] = await Promise.all([
                fetch('/api/dashboard/overview').then(r => r.json()),
                fetch('/api/team/members').then(r => r.json()),
                fetch('/api/tasks/progress').then(r => r.json()),
                fetch('/api/templates').then(r => r.json())
            ]);

            const reportData = {
                title: 'Neural Wars: Fractured Code - Campaign Report',
                generatedAt: new Date().toISOString(),
                campaign: {
                    phase: 'Foundation Phase',
                    daysUntilLaunch: 90,
                    budget: '$1,500-3,000',
                    duration: '9 months'
                },
                team: teamData.data,
                tasks: taskData.data,
                templates: Object.keys(templateData.data || {}).length,
                dashboard: dashboardData.data
            };

            if (format === 'pdf') {
                this.generatePDFReport(reportData, 'neural-wars-campaign-report.pdf');
            } else {
                this.downloadJSON(reportData, 'neural-wars-campaign-report.json');
            }

            this.showNotification('Campaign report generated successfully!', 'success');
        } catch (error) {
            console.error('Report generation error:', error);
            this.showNotification('Failed to generate campaign report', 'error');
        }
    }

    async generateTeamGuide(format) {
        try {
            const teamData = await fetch('/api/team/members').then(r => r.json());
            const rolesData = await fetch('/api/team/roles').then(r => r.json());

            const guideData = {
                title: 'Neural Wars Team Guide',
                generatedAt: new Date().toISOString(),
                teamStructure: teamData.data,
                roles: rolesData.data,
                coordination: {
                    meetingSchedule: 'Daily 9:00 AM EST',
                    communicationTools: ['Zoom', 'Slack', 'Email'],
                    reportingStructure: 'Weekly progress reports'
                }
            };

            this.downloadJSON(guideData, 'neural-wars-team-guide.json');
            this.showNotification('Team guide generated successfully!', 'success');
        } catch (error) {
            console.error('Team guide generation error:', error);
            this.showNotification('Failed to generate team guide', 'error');
        }
    }

    async generateTimeline(format) {
        try {
            // Generate timeline based on campaign phases
            const timelineData = {
                title: 'Neural Wars Launch Timeline',
                generatedAt: new Date().toISOString(),
                phases: [
                    {
                        name: 'Foundation & Pre-Launch',
                        duration: 'Months 1-3',
                        status: 'current',
                        milestones: [
                            'Platform Creation (Month 1)',
                            'Content Development (Month 2)',
                            'Launch Preparation (Month 3)'
                        ]
                    },
                    {
                        name: 'Launch Week',
                        duration: '7 days intensive',
                        status: 'upcoming',
                        milestones: [
                            'Final review and preparation',
                            'Book goes live',
                            'Social media blitz',
                            'Review outreach'
                        ]
                    },
                    {
                        name: 'Post-Launch Momentum',
                        duration: '6 months',
                        status: 'future',
                        milestones: [
                            'Ongoing social media engagement',
                            'Series development',
                            'Community building',
                            'Performance optimization'
                        ]
                    }
                ]
            };

            this.downloadJSON(timelineData, 'neural-wars-timeline.json');
            this.showNotification('Timeline generated successfully!', 'success');
        } catch (error) {
            console.error('Timeline generation error:', error);
            this.showNotification('Failed to generate timeline', 'error');
        }
    }

    async generateCompletePackage(format) {
        try {
            this.showLoadingState('Generating complete documentation package...');
            
            // Gather all data
            const [campaignReport, teamGuide, timeline] = await Promise.all([
                this.generateDataForReport(),
                this.generateDataForTeamGuide(),
                this.generateDataForTimeline()
            ]);

            const completePackage = {
                title: 'Neural Wars: Complete Marketing Documentation Package',
                generatedAt: new Date().toISOString(),
                campaignReport,
                teamGuide,
                timeline,
                metadata: {
                    version: '1.0',
                    campaign: 'The Neural Wars: Fractured Code',
                    team: '3-person marketing team',
                    duration: '9 months total campaign'
                }
            };

            this.downloadJSON(completePackage, 'neural-wars-complete-package.json');
            this.hideLoadingState();
            this.showNotification('Complete documentation package generated!', 'success');
        } catch (error) {
            console.error('Complete package generation error:', error);
            this.hideLoadingState();
            this.showNotification('Failed to generate complete package', 'error');
        }
    }

    async prepareIntegration(service) {
        try {
            this.showLoadingState(`Preparing ${service} integration...`);
            
            const response = await fetch(`${this.apiBase}/external/${service}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    format: 'json',
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`Integration preparation failed: ${response.statusText}`);
            }

            const result = await response.json();
            this.hideLoadingState();
            
            this.showIntegrationModal(service, result);
            
        } catch (error) {
            console.error('Integration preparation error:', error);
            this.hideLoadingState();
            this.showNotification(`Failed to prepare ${service} integration`, 'error');
        }
    }

    showIntegrationModal(service, result) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${service.charAt(0).toUpperCase() + service.slice(1)} Integration</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="integration-info">
                        <p><strong>Status:</strong> ${result.message}</p>
                        <p><strong>Instructions:</strong> ${result.instructions}</p>
                        
                        <div class="integration-actions">
                            <button class="btn btn-primary" onclick="window.exportManager.exportData('all-docs', 'json')">
                                <i class="fas fa-download"></i> Download Integration Data
                            </button>
                            <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                                <i class="fas fa-times"></i> Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    downloadJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generatePDFReport(data, filename) {
        // For now, just download as JSON with instructions
        // In a real implementation, you'd use a PDF library
        const instructions = {
            note: 'PDF generation requires additional libraries. Using JSON export instead.',
            instructions: 'Import this JSON data into your preferred PDF generator or word processor.',
            data: data
        };
        this.downloadJSON(instructions, filename.replace('.pdf', '.json'));
    }

    async generateDataForReport() {
        const [dashboardData, teamData, taskData] = await Promise.all([
            fetch('/api/dashboard/overview').then(r => r.json()).catch(() => ({})),
            fetch('/api/team/members').then(r => r.json()).catch(() => ({})),
            fetch('/api/tasks/progress').then(r => r.json()).catch(() => ({}))
        ]);

        return { dashboard: dashboardData, team: teamData, tasks: taskData };
    }

    async generateDataForTeamGuide() {
        const [teamData, rolesData] = await Promise.all([
            fetch('/api/team/members').then(r => r.json()).catch(() => ({})),
            fetch('/api/team/roles').then(r => r.json()).catch(() => ({}))
        ]);

        return { team: teamData, roles: rolesData };
    }

    async generateDataForTimeline() {
        return {
            phases: [
                { name: 'Foundation', duration: 'Months 1-3', status: 'current' },
                { name: 'Launch', duration: '7 days', status: 'upcoming' },
                { name: 'Post-Launch', duration: '6 months', status: 'future' }
            ]
        };
    }

    showLoadingState(message) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.querySelector('p').textContent = message;
            overlay.classList.remove('hidden');
        }
    }

    hideLoadingState() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
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
        setTimeout(() => notification.remove(), 4000);
    }
}

// Export functions referenced in app.js
window.ExportManager = ExportManager;