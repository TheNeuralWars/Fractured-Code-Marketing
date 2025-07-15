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
      
      tasks.push({
        id: this.generateTaskId(taskText),
        text: taskText,
        completed: false,
        estimatedTime: timeMatch ? parseInt(timeMatch[1]) : null,
        day: this.extractDayFromContext(section, match.index)
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
}

module.exports = MarkdownParser;