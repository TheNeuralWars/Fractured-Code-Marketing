// Templates-specific functionality  
class TemplateManager {
    constructor() {
        this.templates = {};
        this.categorizedTemplates = {};
        this.init();
    }

    init() {
        this.loadTemplates();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('use-template-btn')) {
                this.useTemplate(e.target);
            } else if (e.target.classList.contains('template-expand-btn')) {
                this.toggleTemplateExpansion(e.target);
            } else if (e.target.classList.contains('copy-template-btn')) {
                this.copyToClipboard(e.target);
            }
        });

        // Setup form submission for template generator
        const form = document.getElementById('template-generator-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateTemplateContent();
            });
        }
    }

    async loadTemplates() {
        try {
            app.showLoading();
            const response = await fetch('/api/templates/categorized');
            const result = await response.json();
            
            if (result.success) {
                this.categorizedTemplates = result.data;
                this.renderTemplates();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
            app.showNotification('Failed to load templates', 'error');
        } finally {
            app.hideLoading();
        }
    }

    renderTemplates() {
        const categories = ['social', 'email', 'press', 'content'];
        
        categories.forEach(category => {
            const container = document.getElementById(`${category}-template-list`);
            if (!container) return;

            const categoryData = this.categorizedTemplates[category];
            if (!categoryData || !categoryData.templates) {
                container.innerHTML = '<div class="no-templates">No templates available in this category.</div>';
                return;
            }

            container.innerHTML = this.generateTemplatesHTML(categoryData.templates, category);
        });
    }

    generateTemplatesHTML(templates, category) {
        return templates.map(template => this.generateTemplateHTML(template, category)).join('');
    }

    generateTemplateHTML(template, category) {
        const sectionsCount = template.sections ? template.sections.length : 0;
        
        return `
            <div class="template-item" data-template-key="${template.key}" data-category="${category}">
                <div class="template-header">
                    <div class="template-info">
                        <h4 class="template-title">${template.title}</h4>
                        <div class="template-meta">
                            <span class="template-sections">
                                <i class="fas fa-list"></i> ${sectionsCount} sections
                            </span>
                            <span class="template-category badge-${category}">
                                ${category}
                            </span>
                        </div>
                    </div>
                    <div class="template-actions">
                        <button class="btn btn-small btn-secondary copy-template-btn" 
                                data-template-key="${template.key}"
                                title="Copy to clipboard">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-small btn-primary use-template-btn" 
                                data-template-key="${template.key}">
                            <i class="fas fa-magic"></i> Use Template
                        </button>
                        <button class="template-expand-btn" data-template-key="${template.key}">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                </div>
                <div class="template-content" style="display: none;">
                    <div class="template-preview">
                        <div class="template-sections">
                            ${template.sections ? this.generateSectionsHTML(template.sections, template.key) : ''}
                        </div>
                        <div class="template-full-content">
                            <h5><i class="fas fa-file-alt"></i> Full Template Content</h5>
                            <div class="template-text">
                                <pre>${this.escapeHtml(template.content)}</pre>
                            </div>
                            <div class="template-full-actions">
                                <button class="btn btn-primary copy-full-template" 
                                        data-template-key="${template.key}">
                                    <i class="fas fa-copy"></i> Copy Full Template
                                </button>
                                <button class="btn btn-secondary edit-template" 
                                        data-template-key="${template.key}">
                                    <i class="fas fa-edit"></i> Customize
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateSectionsHTML(sections, templateKey) {
        if (!sections || sections.length === 0) {
            return '<div class="no-sections">No sections available</div>';
        }

        return `
            <h5><i class="fas fa-layer-group"></i> Template Sections</h5>
            <div class="sections-list">
                ${sections.map((section, index) => `
                    <div class="section-item">
                        <div class="section-header">
                            <h6>${section.title}</h6>
                            <button class="btn btn-small btn-outline copy-section-btn" 
                                    data-template-key="${templateKey}"
                                    data-section-index="${index}">
                                <i class="fas fa-copy"></i> Copy Section
                            </button>
                        </div>
                        <div class="section-content">
                            <pre>${this.escapeHtml(section.content)}</pre>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggleTemplateExpansion(button) {
        const templateItem = button.closest('.template-item');
        const content = templateItem.querySelector('.template-content');
        const icon = button.querySelector('i');

        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            button.classList.add('expanded');
        } else {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            button.classList.remove('expanded');
        }
    }

    async copyToClipboard(button) {
        const templateKey = button.dataset.templateKey;
        const sectionIndex = button.dataset.sectionIndex;
        
        try {
            let textToCopy = '';
            
            if (sectionIndex !== undefined) {
                // Copy specific section
                const template = this.findTemplate(templateKey);
                if (template && template.sections && template.sections[sectionIndex]) {
                    textToCopy = template.sections[sectionIndex].content;
                }
            } else {
                // Copy full template
                const template = this.findTemplate(templateKey);
                if (template) {
                    textToCopy = template.content;
                }
            }

            if (textToCopy) {
                await navigator.clipboard.writeText(textToCopy);
                app.showNotification('Template copied to clipboard!', 'success');
                
                // Visual feedback
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('copied');
                }, 2000);
            } else {
                throw new Error('Template content not found');
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            app.showNotification('Failed to copy template', 'error');
        }
    }

    findTemplate(templateKey) {
        const categories = Object.values(this.categorizedTemplates);
        for (const category of categories) {
            if (category.templates) {
                const template = category.templates.find(t => t.key === templateKey);
                if (template) return template;
            }
        }
        return null;
    }

    useTemplate(button) {
        const templateKey = button.dataset.templateKey;
        const template = this.findTemplate(templateKey);
        
        if (!template) {
            app.showNotification('Template not found', 'error');
            return;
        }

        // Open template generator modal with pre-selected template
        this.openTemplateGenerator(template);
    }

    openTemplateGenerator(template = null) {
        const modal = document.getElementById('template-modal');
        const templateTypeSelect = document.getElementById('template-type');
        
        // Populate template options
        this.populateTemplateOptions();
        
        if (template) {
            // Pre-select the template
            templateTypeSelect.value = template.key;
            this.loadTemplateSections(template.key);
        }
        
        modal.classList.remove('hidden');
    }

    populateTemplateOptions() {
        const templateTypeSelect = document.getElementById('template-type');
        if (!templateTypeSelect) return;
        
        const options = ['<option value="">Select a template type...</option>'];
        
        // Add all available templates as options
        Object.values(this.categorizedTemplates).forEach(category => {
            if (category.templates) {
                category.templates.forEach(template => {
                    options.push(`<option value="${template.key}">${template.title}</option>`);
                });
            }
        });
        
        templateTypeSelect.innerHTML = options.join('');
        
        // Add event listener for template type changes
        templateTypeSelect.onchange = () => {
            const selectedKey = templateTypeSelect.value;
            if (selectedKey) {
                this.loadTemplateSections(selectedKey);
            }
        };
    }

    async loadTemplateSections(templateKey) {
        const template = this.findTemplate(templateKey);
        const sectionSelect = document.getElementById('template-section');
        
        if (!template || !template.sections) {
            sectionSelect.innerHTML = '<option value="">Use entire template</option>';
            return;
        }

        const options = ['<option value="">Use entire template</option>'];
        template.sections.forEach((section, index) => {
            options.push(`<option value="${index}">${section.title}</option>`);
        });
        
        sectionSelect.innerHTML = options.join('');
    }

    async generateTemplateContent() {
        const form = document.getElementById('template-generator-form');
        const formData = new FormData(form);
        
        try {
            app.showLoading();
            
            const templateType = formData.get('template-type');
            const templateSection = formData.get('template-section');
            
            if (!templateType) {
                throw new Error('Please select a template type');
            }

            const response = await fetch('/api/templates/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateType,
                    templateSection: templateSection || null,
                    variables: {} // Could be expanded to collect variables from form
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Copy generated content to clipboard
                await navigator.clipboard.writeText(result.data.content);
                app.showNotification('Generated content copied to clipboard!', 'success');
                
                // Close modal
                app.closeModal('template-modal');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to generate template:', error);
            app.showNotification('Failed to generate template content', 'error');
        } finally {
            app.hideLoading();
        }
    }
}

// Global functions called from HTML
function showTemplateGenerator() {
    if (window.templateManager) {
        templateManager.openTemplateGenerator();
    }
}

// Initialize template manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (typeof app !== 'undefined') {
        window.templateManager = new TemplateManager();
    }
});