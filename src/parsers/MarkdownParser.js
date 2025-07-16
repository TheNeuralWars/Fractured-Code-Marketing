const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

class MarkdownParser {
  constructor(baseDir) {
    this.baseDir = baseDir;
  }

  /**
   * Parse a markdown file and extract frontmatter + content
   */
  async parseFile(filePath) {
    try {
      const fullPath = path.join(this.baseDir, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const parsed = matter(content);
      
      return {
        frontmatter: parsed.data,
        content: parsed.content,
        html: marked(parsed.content),
        filePath: filePath
      };
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Parse daily tasks from DAILY-TASK-SYSTEM.md
   */
  async parseDailyTasks() {
    const parsed = await this.parseFile('DAILY-TASK-SYSTEM.md');
    if (!parsed) return null;

    const tasks = {
      person1: [],
      person2: [],
      person3: [],
      metadata: {}
    };

    // Extract task sections for each person
    const content = parsed.content;
    const person1Section = this.extractSection(content, '## 👤 PERSON 1:', '## 👤 PERSON 2:');
    const person2Section = this.extractSection(content, '## 👤 PERSON 2:', '## 👤 PERSON 3:');
    const person3Section = this.extractSection(content, '## 👤 PERSON 3:', '## 📊 Daily Task Summary');

    tasks.person1 = this.extractTasksFromSection(person1Section);
    tasks.person2 = this.extractTasksFromSection(person2Section);
    tasks.person3 = this.extractTasksFromSection(person3Section);

    return tasks;
  }

  /**
   * Parse dashboard data from PROJECT-DASHBOARD.md
   */
  async parseDashboard() {
    const parsed = await this.parseFile('PROJECT-DASHBOARD.md');
    if (!parsed) return null;

    return {
      overview: this.extractSection(parsed.content, '### 🎯 Project Overview', '## 📊 Live Project Status'),
      status: this.extractSection(parsed.content, '## 📊 Live Project Status', '## 👥 Team Assignments'),
      team: this.extractSection(parsed.content, '## 👥 Team Assignments', '## 📈 Key Performance Metrics'),
      metrics: this.extractSection(parsed.content, '## 📈 Key Performance Metrics', '## 📅 This Week\'s Execution Plan'),
      weekPlan: this.extractSection(parsed.content, '## 📅 This Week\'s Execution Plan', '## 🚀 Launch Week Command Center')
    };
  }

  /**
   * Parse performance metrics from PERFORMANCE-DASHBOARD.md
   */
  async parsePerformanceMetrics() {
    const parsed = await this.parseFile('PERFORMANCE-DASHBOARD.md');
    if (!parsed) return null;

    return {
      summary: this.extractSection(parsed.content, '### 📊 Executive Summary', '## 🎯 Key Performance Indicators'),
      kpis: this.extractSection(parsed.content, '## 🎯 Key Performance Indicators', '## 📈 Performance Analysis'),
      analysis: this.extractSection(parsed.content, '## 📈 Performance Analysis', '## 📊 Weekly Performance Report')
    };
  }

  /**
   * Parse templates from various template files
   */
  async parseTemplates() {
    const templateFiles = [
      'J-templates-examples.md',
      'K-newsletter-templates.md', 
      'L-press-release-template.md',
      'M-content-strategy.md'
    ];

    const templates = {};

    for (const file of templateFiles) {
      const parsed = await this.parseFile(file);
      if (parsed) {
        const templateType = file.split('-')[0];
        templates[templateType] = {
          title: this.extractTitle(parsed.content),
          content: parsed.content,
          html: parsed.html,
          sections: this.extractTemplateSections(parsed.content)
        };
      }
    }

    return templates;
  }

  /**
   * Parse team coordination data
   */
  async parseTeamCoordination() {
    const parsed = await this.parseFile('TEAM-COORDINATION.md');
    if (!parsed) return null;

    return {
      framework: this.extractSection(parsed.content, '### 🎯 Communication Framework', '## 📞 Daily Communication Schedule'),
      schedule: this.extractSection(parsed.content, '## 📞 Daily Communication Schedule', '## 💬 Team Communication Log'),
      meetings: this.extractMeetingTemplates(parsed.content)
    };
  }

  /**
   * Extract a section between two headings
   */
  extractSection(content, startHeading, endHeading) {
    const startIndex = content.indexOf(startHeading);
    if (startIndex === -1) return '';

    const endIndex = endHeading ? content.indexOf(endHeading, startIndex) : content.length;
    const actualEndIndex = endIndex === -1 ? content.length : endIndex;

    return content.substring(startIndex, actualEndIndex).trim();
  }

  /**
   * Extract tasks from a person's section
   */
  extractTasksFromSection(section) {
    const tasks = [];
    const taskRegex = /^- \[ \] (.+?)(?:\n|$)/gm;
    let match;

    while ((match = taskRegex.exec(section)) !== null) {
      const taskText = match[1];
      const timeMatch = taskText.match(/- (\d+) mins/);
      
      // Extract detailed description that follows the task
      const detailedDescription = this.extractTaskDescription(section, match.index);
      
      tasks.push({
        id: this.generateTaskId(taskText),
        text: taskText,
        description: detailedDescription,
        completed: false,
        estimatedTime: timeMatch ? parseInt(timeMatch[1]) : null,
        day: this.extractDayFromContext(section, match.index),
        context: this.extractTaskContext(taskText)
      });
    }

    return tasks;
  }

  /**
   * Extract template sections
   */
  extractTemplateSections(content) {
    const sections = [];
    const headingRegex = /^#{2,4}\s+(.+)$/gm;
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      sections.push({
        title: match[1],
        level: match[0].split('#').length - 1,
        content: this.extractSectionContent(content, match.index)
      });
    }

    return sections;
  }

  /**
   * Extract title from content
   */
  extractTitle(content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1] : 'Untitled';
  }

  /**
   * Extract meeting templates
   */
  extractMeetingTemplates(content) {
    const templates = {};
    
    // Extract daily check-in template
    const dailyTemplate = this.extractSection(content, '#### Daily Check-In Agenda Template', '#### Round 1:');
    if (dailyTemplate) {
      templates.daily = dailyTemplate;
    }

    return templates;
  }

  /**
   * Generate a unique task ID
   */
  generateTaskId(taskText) {
    return taskText.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  /**
   * Extract day context for task
   */
  extractDayFromContext(section, taskIndex) {
    const beforeTask = section.substring(0, taskIndex);
    const dayMatch = beforeTask.match(/####\s+(\w+)\s+-/g);
    
    if (dayMatch && dayMatch.length > 0) {
      const lastDay = dayMatch[dayMatch.length - 1];
      return lastDay.match(/####\s+(\w+)/)[1].toLowerCase();
    }
    
    return 'unknown';
  }

  /**
   * Extract section content for templates
   */
  extractSectionContent(content, startIndex) {
    const nextHeadingIndex = content.indexOf('\n#', startIndex + 1);
    const endIndex = nextHeadingIndex === -1 ? content.length : nextHeadingIndex;
    
    return content.substring(startIndex, endIndex).trim();
  }

  /**
   * Extract detailed description for a task
   */
  extractTaskDescription(section, taskIndex) {
    const lines = section.split('\n');
    const taskLineIndex = section.substring(0, taskIndex).split('\n').length - 1;
    
    let description = '';
    // Look for description lines that follow the task (indented with spaces)
    for (let i = taskLineIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('- ') && !line.startsWith('- [ ]')) {
        // This is a description bullet point
        description += line.substring(2) + '\n';
      } else if (line.startsWith('  - ')) {
        // This is an indented sub-point
        description += line.substring(4) + '\n';
      } else if (line === '' || line.startsWith('- [ ]') || line.startsWith('#')) {
        // End of description
        break;
      }
    }
    
    return description.trim();
  }

  /**
   * Extract context information for tasks based on keywords
   */
  extractTaskContext(taskText) {
    const context = {
      category: 'general',
      relatedDocs: [],
      priority: 'normal'
    };

    const taskLower = taskText.toLowerCase();
    
    // Categorize based on keywords
    if (taskLower.includes('analytics') || taskLower.includes('metrics') || taskLower.includes('performance')) {
      context.category = 'analytics';
      context.relatedDocs.push('PERFORMANCE-DASHBOARD.md', 'I-performance-tracking-templates.md');
    } else if (taskLower.includes('social') || taskLower.includes('instagram') || taskLower.includes('twitter') || taskLower.includes('tiktok')) {
      context.category = 'social';
      context.relatedDocs.push('J-templates-examples.md', 'M-content-strategy.md');
    } else if (taskLower.includes('email') || taskLower.includes('newsletter')) {
      context.category = 'email';
      context.relatedDocs.push('K-newsletter-templates.md');
    } else if (taskLower.includes('website') || taskLower.includes('content')) {
      context.category = 'content';
      context.relatedDocs.push('N-homepage-content.md', 'M-content-strategy.md');
    } else if (taskLower.includes('team') || taskLower.includes('coordination') || taskLower.includes('meeting')) {
      context.category = 'coordination';
      context.relatedDocs.push('TEAM-COORDINATION.md', 'O-team-roles-guide.md');
    } else if (taskLower.includes('advertising') || taskLower.includes('amazon') || taskLower.includes('budget')) {
      context.category = 'advertising';
      context.relatedDocs.push('CAMPAIGN-EXECUTION-GUIDE.md');
    }

    // Determine priority based on time and keywords
    if (taskLower.includes('urgent') || taskLower.includes('critical') || taskLower.includes('launch')) {
      context.priority = 'high';
    } else if (taskText.includes('120 mins') || taskText.includes('150 mins')) {
      context.priority = 'high';
    }

    return context;
  }

  /**
   * Get enhanced template information with categories
   */
  async parseTemplatesEnhanced() {
    const templates = await this.parseTemplates();
    
    // Enhanced categorization
    const categorized = {
      social: { title: 'Social Media Templates', templates: [] },
      email: { title: 'Email & Newsletter Templates', templates: [] },
      press: { title: 'Press & Media Templates', templates: [] },
      content: { title: 'Content Strategy Templates', templates: [] }
    };

    Object.keys(templates).forEach(key => {
      const template = templates[key];
      template.key = key;
      
      if (key.includes('J') || template.title.toLowerCase().includes('social')) {
        categorized.social.templates.push(template);
      } else if (key.includes('K') || template.title.toLowerCase().includes('newsletter') || template.title.toLowerCase().includes('email')) {
        categorized.email.templates.push(template);
      } else if (key.includes('L') || template.title.toLowerCase().includes('press') || template.title.toLowerCase().includes('release')) {
        categorized.press.templates.push(template);
      } else {
        categorized.content.templates.push(template);
      }
    });

    return categorized;
  }

  /**
   * Parse all required marketing files for comprehensive integration
   */
  async parseAllMarketingFiles() {
    const requiredFiles = [
      'DAILY-TASK-SYSTEM.md',
      'PROJECT-DASHBOARD.md', 
      'TEAM-COORDINATION.md',
      'J-templates-examples.md',
      'CAMPAIGN-EXECUTION-GUIDE.md',
      'H-listing-optimization.md',
      'I-performance-tracking-templates.md',
      'IMPLEMENTATION-COMPLETE.md',
      'K-newsletter-templates.md',
      'L-press-release-template.md',
      'M-content-strategy.md',
      'MARKETING-APP-README.md',
      'MARKETING-IMPLEMENTATION-README.md',
      'N-homepage-content.md',
      'O-master-launch-timeline.md',
      'O-team-roles-guide.md',
      'PERFORMANCE-DASHBOARD.md',
      'PROJECT-GETTING-STARTED.md'
    ];

    const parsedFiles = {};

    for (const fileName of requiredFiles) {
      try {
        const parsed = await this.parseFile(fileName);
        if (parsed) {
          parsedFiles[fileName] = {
            ...parsed,
            fileName: fileName,
            category: this.categorizeFile(fileName),
            sections: this.extractSections(parsed.content),
            searchableContent: this.extractSearchableContent(parsed.content),
            lastModified: new Date().toISOString() // In real app, would get from file stats
          };
        }
      } catch (error) {
        console.error(`Failed to parse ${fileName}:`, error);
        parsedFiles[fileName] = {
          fileName: fileName,
          error: error.message,
          content: '',
          html: '',
          category: this.categorizeFile(fileName)
        };
      }
    }

    return parsedFiles;
  }

  /**
   * Categorize files for navigation organization
   */
  categorizeFile(fileName) {
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

  /**
   * Extract searchable content for filtering
   */
  extractSearchableContent(content) {
    // Remove markdown formatting for better searching
    return content
      .replace(/[#*_`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
      .replace(/\n+/g, ' ')
      .toLowerCase();
  }

  /**
   * Extract all sections from content for navigation
   */
  extractSections(content) {
    const sections = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headingMatch) {
        const level = headingMatch[1].length;
        const title = headingMatch[2];
        const anchor = this.generateAnchor(title);
        
        // Extract content until next heading of same or higher level
        let content = '';
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          const nextHeading = nextLine.match(/^(#{1,6})\s+(.+)$/);
          
          if (nextHeading && nextHeading[1].length <= level) {
            break;
          }
          content += nextLine + '\n';
        }
        
        sections.push({
          level,
          title,
          anchor,
          content: content.trim(),
          html: marked(content.trim())
        });
      }
    }
    
    return sections;
  }

  /**
   * Generate URL-friendly anchor from title
   */
  generateAnchor(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }

  /**
   * Parse team roles from O-team-roles-guide.md
   */
  async parseTeamRoles() {
    const parsed = await this.parseFile('O-team-roles-guide.md');
    if (!parsed) return null;

    const roles = [];
    const content = parsed.content;
    
    // Extract role sections
    const roleRegex = /##\s+(Person \d+|Team Member \d+):\s*(.+?)(?=##|\n#|$)/gs;
    let match;

    while ((match = roleRegex.exec(content)) !== null) {
      const roleTitle = match[1];
      const roleDescription = match[2];
      
      roles.push({
        id: roleTitle.toLowerCase().replace(/\s+/g, '-'),
        title: roleTitle,
        description: roleDescription.trim(),
        responsibilities: this.extractResponsibilities(roleDescription),
        status: 'active'
      });
    }

    return roles;
  }

  /**
   * Extract responsibilities from role description
   */
  extractResponsibilities(description) {
    const responsibilities = [];
    const lines = description.split('\n');
    
    for (const line of lines) {
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        responsibilities.push(line.trim().substring(2));
      }
    }
    
    return responsibilities;
  }

  /**
   * Parse launch timeline from O-master-launch-timeline.md
   */
  async parseLaunchTimeline() {
    const parsed = await this.parseFile('O-master-launch-timeline.md');
    if (!parsed) return null;

    const timeline = {
      overview: {},
      phases: [],
      milestones: []
    };

    const content = parsed.content;
    
    // Extract overview information
    timeline.overview = {
      duration: this.extractValue(content, 'Total Campaign Duration'),
      prelaunch: this.extractValue(content, 'Pre-Launch Phase'),
      launch: this.extractValue(content, 'Launch Week'),
      postlaunch: this.extractValue(content, 'Post-Launch Momentum'),
      team: this.extractValue(content, 'Team Commitment'),
      budget: this.extractValue(content, 'Budget Range')
    };

    // Extract phases
    const phaseRegex = /##\s+(Phase \d+|Month \d+):\s*(.+?)(?=##|\n#|$)/gs;
    let match;

    while ((match = phaseRegex.exec(content)) !== null) {
      const phaseTitle = match[1];
      const phaseContent = match[2];
      
      timeline.phases.push({
        id: phaseTitle.toLowerCase().replace(/\s+/g, '-'),
        title: phaseTitle,
        description: this.extractFirstParagraph(phaseContent),
        content: phaseContent.trim(),
        tasks: this.extractTasksFromSection(phaseContent)
      });
    }

    return timeline;
  }

  /**
   * Extract a value from content using pattern matching
   */
  extractValue(content, label) {
    const regex = new RegExp(`\\*\\*${label}\\*\\*:?\\s*(.+?)(?=\\n|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract first paragraph from content
   */
  extractFirstParagraph(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('**') && !trimmed.startsWith('-')) {
        return trimmed;
      }
    }
    return '';
  }
}

module.exports = MarkdownParser;