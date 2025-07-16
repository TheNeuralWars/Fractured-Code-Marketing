// Data persistence and management for Neural Wars Marketing App
class DataManager {
    constructor() {
        this.storagePrefix = 'neuralwars_';
        this.defaultData = {
            tasks: {},
            metrics: {
                salesRank: '--',
                totalSales: '--',
                reviewCount: '--',
                emailSubscribers: '--'
            },
            campaignGoals: {
                salesTarget: '',
                launchDate: '',
                budget: ''
            },
            weeklyProgress: {
                notes: '',
                nextMilestone: ''
            },
            teamStatus: {
                contentCreator: {
                    currentFocus: '',
                    status: 'on track'
                },
                communityManager: {
                    currentFocus: '',
                    status: 'on track'
                },
                analyticsCoordinator: {
                    currentFocus: '',
                    status: 'on track'
                }
            }
        };
        this.init();
    }

    init() {
        this.loadData();
        this.setupAutoSave();
    }

    // Load data from localStorage with fallback to defaults
    loadData() {
        try {
            const storedData = localStorage.getItem(this.storagePrefix + 'appData');
            if (storedData) {
                this.data = { ...this.defaultData, ...JSON.parse(storedData) };
            } else {
                this.data = { ...this.defaultData };
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            this.data = { ...this.defaultData };
        }
    }

    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem(this.storagePrefix + 'appData', JSON.stringify(this.data));
            console.log('Data saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            return false;
        }
    }

    // Setup auto-save every 30 seconds
    setupAutoSave() {
        setInterval(() => {
            this.saveData();
        }, 30000);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }

    // Get specific data section
    get(section, key = null) {
        if (key) {
            return this.data[section] ? this.data[section][key] : null;
        }
        return this.data[section] || null;
    }

    // Set specific data section
    set(section, data, key = null) {
        if (key) {
            if (!this.data[section]) this.data[section] = {};
            this.data[section][key] = data;
        } else {
            this.data[section] = data;
        }
        this.saveData();
        this.notifyDataChange(section, key, data);
    }

    // Update specific fields in a section
    update(section, updates) {
        if (!this.data[section]) this.data[section] = {};
        this.data[section] = { ...this.data[section], ...updates };
        this.saveData();
        this.notifyDataChange(section, null, this.data[section]);
    }

    // Task-specific methods
    toggleTask(taskId, person, completed) {
        if (!this.data.tasks[person]) this.data.tasks[person] = {};
        
        this.data.tasks[person][taskId] = {
            completed: completed,
            completedAt: completed ? new Date().toISOString() : null
        };
        
        this.saveData();
        this.notifyDataChange('tasks', `${person}.${taskId}`, this.data.tasks[person][taskId]);
        return this.data.tasks[person][taskId];
    }

    getTaskState(taskId, person) {
        if (!this.data.tasks[person] || !this.data.tasks[person][taskId]) {
            return { completed: false, completedAt: null };
        }
        return this.data.tasks[person][taskId];
    }

    // Calculate task completion statistics
    getTaskStats() {
        let totalTasks = 0;
        let completedTasks = 0;

        Object.keys(this.data.tasks).forEach(person => {
            Object.keys(this.data.tasks[person]).forEach(taskId => {
                totalTasks++;
                if (this.data.tasks[person][taskId].completed) {
                    completedTasks++;
                }
            });
        });

        return {
            total: totalTasks,
            completed: completedTasks,
            percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    }

    // Data change notification system
    notifyDataChange(section, key, data) {
        const event = new CustomEvent('dataChanged', {
            detail: { section, key, data }
        });
        document.dispatchEvent(event);
    }

    // Export data for backup/sharing
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    // Import data from backup
    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            this.data = { ...this.defaultData, ...importedData };
            this.saveData();
            this.notifyDataChange('all', null, this.data);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Reset all data to defaults
    resetData() {
        this.data = { ...this.defaultData };
        this.saveData();
        this.notifyDataChange('all', null, this.data);
    }

    // Clear specific section
    clearSection(section) {
        if (this.defaultData[section] !== undefined) {
            this.data[section] = { ...this.defaultData[section] };
            this.saveData();
            this.notifyDataChange(section, null, this.data[section]);
        }
    }
}

// Initialize global data manager
if (typeof window !== 'undefined') {
    window.dataManager = new DataManager();
    console.log('✅ Data Manager initialized');
}