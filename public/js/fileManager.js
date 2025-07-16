// Enhanced File Management System
class FileManager {
    constructor(app) {
        this.app = app;
        this.currentFile = null;
        this.fileCache = new Map();
        this.searchResults = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFileNavigation();
    }

    setupEventListeners() {
        // File navigation links
        document.querySelectorAll('.nav-sublink').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const fileName = link.getAttribute('data-file');
                this.loadFile(fileName);
            });
        });

        // Global search
        const globalSearchBtn = document.getElementById('global-search-btn');
        if (globalSearchBtn) {
            globalSearchBtn.addEventListener('click', () => {
                this.openSearchModal();
            });
        }

        // Search modal controls
        const searchModalClose = document.getElementById('search-modal-close');
        if (searchModalClose) {
            searchModalClose.addEventListener('click', () => {
                this.closeSearchModal();
            });
        }

        const performSearch = document.getElementById('perform-search');
        if (performSearch) {
            performSearch.addEventListener('click', () => {
                this.performGlobalSearch();
            });
        }

        // File viewer modal controls
        const fileModalClose = document.getElementById('file-modal-close');
        if (fileModalClose) {
            fileModalClose.addEventListener('click', () => {
                this.closeFileModal();
            });
        }

        const copyFileContent = document.getElementById('copy-file-content');
        if (copyFileContent) {
            copyFileContent.addEventListener('click', () => {
                this.copyCurrentFileContent();
            });
        }

        const editFileContent = document.getElementById('edit-file-content');
        if (editFileContent) {
            editFileContent.addEventListener('click', () => {
                this.editCurrentFile();
            });
        }

        const exportFileContent = document.getElementById('export-file-content');
        if (exportFileContent) {
            exportFileContent.addEventListener('click', () => {
                this.exportCurrentFile();
            });
        }

        // Enter key for search
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performGlobalSearch();
                }
            });
        }
    }

    async loadFile(fileName) {
        try {
            this.app.showLoading();
            
            let fileData;
            if (this.fileCache.has(fileName)) {
                fileData = this.fileCache.get(fileName);
            } else {
                const response = await fetch(`${this.app.apiBase}/files/${fileName}`);
                const result = await response.json();
                
                if (result.success) {
                    fileData = result.data;
                    this.fileCache.set(fileName, fileData);
                } else {
                    throw new Error(result.error || 'Failed to load file');
                }
            }

            this.currentFile = fileData;
            this.displayFile(fileData);
            
        } catch (error) {
            console.error('Load file error:', error);
            this.app.showToast('Failed to load file: ' + error.message, 'error');
        } finally {
            this.app.hideLoading();
        }
    }

    displayFile(fileData) {
        // Open file in modal
        this.openFileModal(fileData);
    }

    openFileModal(fileData) {
        const modal = document.getElementById('file-viewer-modal');
        const title = document.getElementById('file-viewer-title');
        const sections = document.getElementById('file-sections');

        // Enhanced title with file type indicator
        title.innerHTML = `
            <span class="file-type-badge">${this.getFileTypeIcon(fileData.fileName)}</span>
            ${fileData.fileName.replace('.md', '').replace(/-/g, ' ')}
        `;
        
        // Add breadcrumb navigation
        this.createBreadcrumbs(fileData);
        
        // Clear previous content
        sections.innerHTML = '';

        // Adaptive content display based on file type and length
        const adaptiveContainer = this.createAdaptiveContainer(fileData);
        sections.appendChild(adaptiveContainer);

        // Add back navigation and enhanced controls
        this.addEnhancedControls(fileData);

        modal.classList.remove('hidden');
        
        // Focus management for accessibility
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    createExpandableSection(section, index) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'file-section';
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <h${Math.min(section.level + 1, 6)} class="section-title">
                <i class="fas fa-chevron-right section-toggle" data-section="${index}"></i>
                ${section.title}
            </h${Math.min(section.level + 1, 6)}>
            <div class="section-controls">
                <button class="btn btn-small copy-section" data-section="${index}">
                    <i class="fas fa-copy"></i> Copy
                </button>
                <button class="btn btn-small edit-section" data-section="${index}">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
        `;

        const content = document.createElement('div');
        content.className = 'section-content collapsed';
        content.id = `section-content-${index}`;
        content.innerHTML = section.html || `<pre>${section.content}</pre>`;

        // Add expand/collapse functionality
        header.addEventListener('click', (e) => {
            if (e.target.classList.contains('section-toggle')) {
                this.toggleSection(index);
            }
        });

        // Add copy functionality
        const copyBtn = header.querySelector('.copy-section');
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.copySection(section);
        });

        // Add edit functionality
        const editBtn = header.querySelector('.edit-section');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editSection(section, index);
        });

        sectionDiv.appendChild(header);
        sectionDiv.appendChild(content);
        
        return sectionDiv;
    }

    toggleSection(index) {
        const content = document.getElementById(`section-content-${index}`);
        const toggle = document.querySelector(`[data-section="${index}"]`);
        
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            toggle.classList.add('fa-chevron-down');
            toggle.classList.remove('fa-chevron-right');
        } else {
            content.classList.add('collapsed');
            toggle.classList.add('fa-chevron-right');
            toggle.classList.remove('fa-chevron-down');
        }
    }

    async copySection(section) {
        try {
            await navigator.clipboard.writeText(section.content);
            this.app.showToast('Section copied to clipboard', 'success');
            
            // Log the copy action
            await fetch(`${this.app.apiBase}/files/content/copy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileName: this.currentFile.fileName,
                    sectionTitle: section.title,
                    content: section.content
                })
            });
        } catch (error) {
            console.error('Copy error:', error);
            this.app.showToast('Failed to copy content', 'error');
        }
    }

    editSection(section, index) {
        const content = document.getElementById(`section-content-${index}`);
        const originalHTML = content.innerHTML;
        
        // Create editable textarea
        const textarea = document.createElement('textarea');
        textarea.className = 'section-editor';
        textarea.value = section.content;
        textarea.rows = 10;
        
        // Create save/cancel buttons
        const controls = document.createElement('div');
        controls.className = 'editor-controls';
        controls.innerHTML = `
            <button class="btn btn-primary save-edit">
                <i class="fas fa-save"></i> Save
            </button>
            <button class="btn btn-secondary cancel-edit">
                <i class="fas fa-times"></i> Cancel
            </button>
        `;

        // Replace content with editor
        content.innerHTML = '';
        content.appendChild(textarea);
        content.appendChild(controls);
        content.classList.remove('collapsed');

        // Add event listeners
        controls.querySelector('.save-edit').addEventListener('click', () => {
            this.saveEditedSection(section, index, textarea.value);
        });

        controls.querySelector('.cancel-edit').addEventListener('click', () => {
            content.innerHTML = originalHTML;
        });
    }

    saveEditedSection(section, index, newContent) {
        // In a real application, this would save to the server
        section.content = newContent;
        section.html = marked(newContent);
        
        // Update the display
        const content = document.getElementById(`section-content-${index}`);
        content.innerHTML = section.html;
        
        this.app.showToast('Section updated', 'success');
        
        // Mark file as modified
        if (this.currentFile) {
            this.currentFile.modified = true;
        }
    }

    async copyCurrentFileContent() {
        if (!this.currentFile) return;
        
        try {
            await navigator.clipboard.writeText(this.currentFile.content);
            this.app.showToast('File content copied to clipboard', 'success');
        } catch (error) {
            console.error('Copy error:', error);
            this.app.showToast('Failed to copy file content', 'error');
        }
    }

    editCurrentFile() {
        if (!this.currentFile) return;
        
        // This would open a full file editor
        this.app.showToast('File editing feature coming soon', 'info');
    }

    exportCurrentFile() {
        if (!this.currentFile) return;
        
        // Create download link
        const blob = new Blob([this.currentFile.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentFile.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.app.showToast('File exported successfully', 'success');
    }

    closeFileModal() {
        const modal = document.getElementById('file-viewer-modal');
        modal.classList.add('hidden');
        
        // Restore body scrolling
        document.body.style.overflow = '';
        modal.setAttribute('aria-hidden', 'true');
        
        // Clean up breadcrumbs
        const breadcrumbs = document.querySelector('.file-breadcrumbs');
        if (breadcrumbs) {
            breadcrumbs.remove();
        }
    }

    getFileTypeIcon(fileName) {
        const fileType = this.categorizeFileType(fileName);
        const icons = {
            'dashboard': '📊',
            'tasks': '✅',
            'team': '👥',
            'templates': '📄',
            'strategy': '🎯',
            'optimization': '🔧',
            'implementation': '⚙️',
            'content': '📝',
            'other': '📋'
        };
        return icons[fileType] || icons.other;
    }

    categorizeFileType(fileName) {
        const categories = {
            'dashboard': ['PROJECT-DASHBOARD.md', 'PERFORMANCE-DASHBOARD.md'],
            'tasks': ['DAILY-TASK-SYSTEM.md'],
            'team': ['TEAM-COORDINATION.md', 'O-team-roles-guide.md'],
            'templates': ['J-templates-examples.md', 'K-newsletter-templates.md', 'L-press-release-template.md'],
            'strategy': ['M-content-strategy.md', 'CAMPAIGN-EXECUTION-GUIDE.md', 'O-master-launch-timeline.md'],
            'optimization': ['H-listing-optimization.md', 'I-performance-tracking-templates.md'],
            'implementation': ['IMPLEMENTATION-COMPLETE.md', 'MARKETING-IMPLEMENTATION-README.md', 'PROJECT-GETTING-STARTED.md'],
            'content': ['N-homepage-content.md', 'MARKETING-APP-README.md']
        };

        for (const [category, files] of Object.entries(categories)) {
            if (files.includes(fileName)) {
                return category;
            }
        }
        return 'other';
    }

    createBreadcrumbs(fileData) {
        const existingBreadcrumbs = document.querySelector('.file-breadcrumbs');
        if (existingBreadcrumbs) {
            existingBreadcrumbs.remove();
        }

        const breadcrumbs = document.createElement('div');
        breadcrumbs.className = 'file-breadcrumbs';
        breadcrumbs.innerHTML = `
            <nav aria-label="File navigation breadcrumbs">
                <button class="breadcrumb-item" onclick="fileManager.goBack()">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">
                    ${this.getFileTypeIcon(fileData.fileName)} ${this.categorizeFileType(fileData.fileName)}
                </span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">${fileData.fileName.replace('.md', '').replace(/-/g, ' ')}</span>
            </nav>
        `;

        const modalHeader = document.querySelector('.modal-header');
        modalHeader.insertBefore(breadcrumbs, modalHeader.querySelector('.file-controls'));
    }

    createAdaptiveContainer(fileData) {
        const container = document.createElement('div');
        container.className = 'adaptive-file-container';

        // Determine content length and complexity
        const contentLength = fileData.content.length;
        const hasLists = fileData.content.includes('- [');
        const hasTables = fileData.content.includes('|');
        const sectionCount = fileData.sections ? fileData.sections.length : 0;

        // Adaptive display based on content characteristics
        if (contentLength > 10000 || sectionCount > 10) {
            // Long documents - use table of contents + collapsible sections
            container.appendChild(this.createTableOfContents(fileData));
            container.appendChild(this.createCollapsibleSections(fileData));
        } else if (hasLists || hasTables) {
            // Documents with actionable content - use interactive format
            container.appendChild(this.createInteractiveContent(fileData));
        } else {
            // Short documents - use continuous format
            container.appendChild(this.createContinuousContent(fileData));
        }

        return container;
    }

    createTableOfContents(fileData) {
        const toc = document.createElement('div');
        toc.className = 'table-of-contents';
        toc.innerHTML = `
            <div class="toc-header">
                <h4><i class="fas fa-list"></i> Table of Contents</h4>
                <button class="toc-toggle" onclick="this.parentElement.parentElement.classList.toggle('collapsed')">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            <div class="toc-content">
                ${this.generateTOCList(fileData)}
            </div>
        `;
        return toc;
    }

    generateTOCList(fileData) {
        if (!fileData.sections || fileData.sections.length === 0) {
            return '<p>No sections found</p>';
        }

        return `
            <ul class="toc-list">
                ${fileData.sections.map((section, index) => `
                    <li class="toc-item level-${section.level}">
                        <a href="#section-${index}" onclick="fileManager.scrollToSection(${index})">
                            ${section.title}
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    createCollapsibleSections(fileData) {
        const sectionsContainer = document.createElement('div');
        sectionsContainer.className = 'collapsible-sections';

        if (fileData.sections && fileData.sections.length > 0) {
            fileData.sections.forEach((section, index) => {
                const sectionDiv = this.createEnhancedExpandableSection(section, index);
                sectionsContainer.appendChild(sectionDiv);
            });
        } else {
            // If no sections, display full content
            const contentDiv = document.createElement('div');
            contentDiv.className = 'file-content';
            contentDiv.innerHTML = fileData.html || `<pre>${fileData.content}</pre>`;
            sectionsContainer.appendChild(contentDiv);
        }

        return sectionsContainer;
    }

    createEnhancedExpandableSection(section, index) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'expandable-section';
        sectionDiv.id = `section-${index}`;
        
        const isTaskSection = this.hasActionableItems(section.content);
        const sectionClass = isTaskSection ? 'task-section' : 'content-section';
        
        sectionDiv.innerHTML = `
            <div class="section-header ${sectionClass}">
                <h${section.level} class="section-title">
                    ${isTaskSection ? '<i class="fas fa-tasks"></i>' : '<i class="fas fa-file-text"></i>'}
                    ${section.title}
                </h${section.level}>
                <div class="section-controls">
                    ${isTaskSection ? this.createTaskControls() : ''}
                    <button class="btn btn-small" onclick="fileManager.copySection(${index})">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="btn btn-small" onclick="fileManager.editSection(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="section-toggle" onclick="fileManager.toggleSectionNew(${index})">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
            <div class="section-content expanded">
                ${isTaskSection ? this.renderTaskContent(section) : section.html}
            </div>
        `;
        
        return sectionDiv;
    }

    hasActionableItems(content) {
        return content.includes('- [ ]') || content.includes('- [x]') || content.includes('|') || content.includes('**Action:**');
    }

    createTaskControls() {
        return `
            <button class="btn btn-small btn-task" onclick="fileManager.markAllComplete(this)">
                <i class="fas fa-check-double"></i> Mark All Complete
            </button>
            <button class="btn btn-small btn-task" onclick="fileManager.expandAll(this)">
                <i class="fas fa-expand-alt"></i> Expand All
            </button>
        `;
    }

    renderTaskContent(section) {
        let content = section.html;
        
        // Make checkboxes interactive
        content = content.replace(
            /<input type="checkbox" disabled>/g,
            '<input type="checkbox" onchange="fileManager.toggleTask(this)">'
        );
        
        // Add progress indicators
        const totalTasks = (content.match(/type="checkbox"/g) || []).length;
        const completedTasks = (content.match(/checked/g) || []).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const progressBar = `
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${completedTasks}/${totalTasks} tasks completed (${progress}%)</span>
            </div>
        `;
        
        return progressBar + content;
    }

    createInteractiveContent(fileData) {
        const container = document.createElement('div');
        container.className = 'interactive-content';
        
        // Enhanced content with interactive elements
        let content = fileData.html || fileData.content;
        
        // Make all checkboxes interactive
        content = content.replace(
            /<input type="checkbox" disabled>/g,
            '<input type="checkbox" onchange="fileManager.toggleTask(this)">'
        );
        
        // Enhance tables with sorting and filtering
        content = this.enhanceTables(content);
        
        container.innerHTML = content;
        return container;
    }

    enhanceTables(content) {
        // Add sorting capabilities to tables
        return content.replace(
            /<table>/g,
            '<div class="enhanced-table"><table class="sortable">'
        ).replace(
            /<\/table>/g,
            '</table></div>'
        );
    }

    createContinuousContent(fileData) {
        const container = document.createElement('div');
        container.className = 'continuous-content';
        container.innerHTML = fileData.html || `<pre>${fileData.content}</pre>`;
        return container;
    }

    addEnhancedControls(fileData) {
        const controls = document.querySelector('.file-controls');
        
        // Add additional control buttons
        const enhancedControls = document.createElement('div');
        enhancedControls.className = 'enhanced-controls';
        enhancedControls.innerHTML = `
            <button class="btn btn-small" onclick="fileManager.printFile()">
                <i class="fas fa-print"></i> Print
            </button>
            <button class="btn btn-small" onclick="fileManager.fullScreen()">
                <i class="fas fa-expand"></i> Full Screen
            </button>
            <button class="btn btn-small" onclick="fileManager.shareFile()">
                <i class="fas fa-share"></i> Share
            </button>
        `;
        
        controls.insertBefore(enhancedControls, controls.lastElementChild);
    }

    // Enhanced interaction methods
    scrollToSection(index) {
        const section = document.getElementById(`section-${index}`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            section.classList.add('highlighted');
            setTimeout(() => section.classList.remove('highlighted'), 2000);
        }
    }

    toggleSectionNew(index) {
        const section = document.getElementById(`section-${index}`);
        const content = section.querySelector('.section-content');
        const toggle = section.querySelector('.section-toggle i');
        
        content.classList.toggle('expanded');
        toggle.classList.toggle('fa-chevron-down');
        toggle.classList.toggle('fa-chevron-up');
    }

    toggleTask(checkbox) {
        const listItem = checkbox.closest('li');
        if (listItem) {
            listItem.classList.toggle('completed', checkbox.checked);
        }
        
        // Update progress bar if it exists
        this.updateTaskProgress(checkbox);
    }

    updateTaskProgress(checkbox) {
        const section = checkbox.closest('.section-content');
        const progressBar = section.querySelector('.task-progress');
        
        if (progressBar) {
            const checkboxes = section.querySelectorAll('input[type="checkbox"]');
            const total = checkboxes.length;
            const completed = section.querySelectorAll('input[type="checkbox"]:checked').length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            const progressFill = progressBar.querySelector('.progress-fill');
            const progressText = progressBar.querySelector('.progress-text');
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${completed}/${total} tasks completed (${progress}%)`;
        }
    }

    markAllComplete(button) {
        const section = button.closest('.expandable-section');
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.toggleTask(checkbox);
        });
    }

    expandAll(button) {
        const sections = document.querySelectorAll('.expandable-section');
        sections.forEach((section, index) => {
            const content = section.querySelector('.section-content');
            const toggle = section.querySelector('.section-toggle i');
            
            if (!content.classList.contains('expanded')) {
                content.classList.add('expanded');
                toggle.classList.remove('fa-chevron-down');
                toggle.classList.add('fa-chevron-up');
            }
        });
    }

    printFile() {
        window.print();
    }

    fullScreen() {
        const modal = document.getElementById('file-viewer-modal');
        if (modal.requestFullscreen) {
            modal.requestFullscreen();
        }
    }

    shareFile() {
        const url = window.location.href;
        navigator.share ? 
            navigator.share({ url }) : 
            navigator.clipboard.writeText(url);
        this.app.showToast('File link copied to clipboard', 'success');
    }

    goBack() {
        this.closeFileModal();
    }

    openSearchModal() {
        const modal = document.getElementById('search-modal');
        const searchInput = document.getElementById('global-search');
        
        modal.classList.remove('hidden');
        searchInput.focus();
    }

    closeSearchModal() {
        const modal = document.getElementById('search-modal');
        modal.classList.add('hidden');
    }

    async performGlobalSearch() {
        const searchInput = document.getElementById('global-search');
        const query = searchInput.value.trim();
        
        if (!query) {
            this.app.showToast('Please enter a search term', 'warning');
            return;
        }

        try {
            this.app.showLoading();
            
            const response = await fetch(`${this.app.apiBase}/files/search/${encodeURIComponent(query)}`);
            const result = await response.json();
            
            if (result.success) {
                this.searchResults = result.data;
                this.displaySearchResults(result.data, query);
            } else {
                throw new Error(result.error || 'Search failed');
            }
            
        } catch (error) {
            console.error('Search error:', error);
            this.app.showToast('Search failed: ' + error.message, 'error');
        } finally {
            this.app.hideLoading();
        }
    }

    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('search-results');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}"</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="search-summary">
                <p>Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"</p>
            </div>
        `;

        const resultsList = document.createElement('div');
        resultsList.className = 'search-results-list';

        results.forEach(result => {
            const resultItem = this.createSearchResultItem(result, query);
            resultsList.appendChild(resultItem);
        });

        resultsContainer.appendChild(resultsList);
    }

    createSearchResultItem(result, query) {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        
        const header = document.createElement('div');
        header.className = 'result-header';
        header.innerHTML = `
            <h4 class="result-title">${result.title}</h4>
            <span class="result-category">${result.category}</span>
            <span class="result-score">Relevance: ${result.relevanceScore}</span>
        `;

        const content = document.createElement('div');
        content.className = 'result-content';

        if (result.matchingSections.length > 0) {
            const sectionsDiv = document.createElement('div');
            sectionsDiv.className = 'matching-sections';
            
            result.matchingSections.forEach(section => {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'matching-section';
                
                // Highlight search terms
                const highlightedTitle = this.highlightSearchTerms(section.title, query);
                const highlightedContent = this.highlightSearchTerms(
                    section.content.substring(0, 200) + '...', 
                    query
                );
                
                sectionDiv.innerHTML = `
                    <h5>${highlightedTitle}</h5>
                    <p>${highlightedContent}</p>
                `;
                
                sectionsDiv.appendChild(sectionDiv);
            });
            
            content.appendChild(sectionsDiv);
        }

        const actions = document.createElement('div');
        actions.className = 'result-actions';
        actions.innerHTML = `
            <button class="btn btn-small open-file" data-filename="${result.fileName}">
                <i class="fas fa-eye"></i> View File
            </button>
            <button class="btn btn-small copy-result" data-filename="${result.fileName}">
                <i class="fas fa-copy"></i> Copy Content
            </button>
        `;

        // Add event listeners
        actions.querySelector('.open-file').addEventListener('click', () => {
            this.loadFile(result.fileName);
            this.closeSearchModal();
        });

        actions.querySelector('.copy-result').addEventListener('click', () => {
            this.copySearchResult(result);
        });

        item.appendChild(header);
        item.appendChild(content);
        item.appendChild(actions);
        
        return item;
    }

    highlightSearchTerms(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    async copySearchResult(result) {
        try {
            // Copy the file content related to this search result
            const fileData = await this.getFileData(result.fileName);
            if (fileData) {
                await navigator.clipboard.writeText(fileData.content);
                this.app.showToast('Search result copied to clipboard', 'success');
            }
        } catch (error) {
            console.error('Copy search result error:', error);
            this.app.showToast('Failed to copy search result', 'error');
        }
    }

    async getFileData(fileName) {
        if (this.fileCache.has(fileName)) {
            return this.fileCache.get(fileName);
        }
        
        try {
            const response = await fetch(`${this.app.apiBase}/files/${fileName}`);
            const result = await response.json();
            
            if (result.success) {
                this.fileCache.set(fileName, result.data);
                return result.data;
            }
        } catch (error) {
            console.error('Get file data error:', error);
        }
        
        return null;
    }

    async loadFileNavigation() {
        // This method would load file categories and navigation structure
        // For now, we'll use the static navigation in HTML
        console.log('File navigation loaded');
    }

    // Method to load all files for offline access
    async preloadAllFiles() {
        try {
            const response = await fetch(`${this.app.apiBase}/files/all`);
            const result = await response.json();
            
            if (result.success) {
                Object.values(result.data).forEach(fileData => {
                    this.fileCache.set(fileData.fileName, fileData);
                });
                console.log(`Preloaded ${Object.keys(result.data).length} files`);
            }
        } catch (error) {
            console.error('Preload files error:', error);
        }
    }
}

// Export for use in main app
window.FileManager = FileManager;