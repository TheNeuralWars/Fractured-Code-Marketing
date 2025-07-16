const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const MarkdownParser = require('../../src/parsers/MarkdownParser');

const router = express.Router();
const parser = new MarkdownParser(path.join(__dirname, '../../'));

/**
 * GET /api/export/templates/:format
 * Export templates in specified format (markdown, csv, json)
 */
router.get('/templates/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const templates = await parser.parseTemplates();
    
    if (!templates) {
      return res.status(500).json({
        success: false,
        error: 'Failed to load templates'
      });
    }

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="neural-wars-templates.json"');
        res.json(templates);
        break;
        
      case 'csv':
        const csvData = convertTemplatesToCSV(templates);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="neural-wars-templates.csv"');
        res.send(csvData);
        break;
        
      case 'markdown':
      case 'md':
        const markdownData = convertTemplatesToMarkdown(templates);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', 'attachment; filename="neural-wars-templates.md"');
        res.send(markdownData);
        break;
        
      default:
        res.status(400).json({
          success: false,
          error: 'Unsupported format. Use: json, csv, or markdown'
        });
    }
  } catch (error) {
    console.error('Export templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export templates'
    });
  }
});

/**
 * GET /api/export/tasks/:format
 * Export tasks in specified format
 */
router.get('/tasks/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const tasks = await parser.parseDailyTasks();
    
    if (!tasks) {
      return res.status(500).json({
        success: false,
        error: 'Failed to load tasks'
      });
    }

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="neural-wars-tasks.json"');
        res.json(tasks);
        break;
        
      case 'csv':
        const csvData = convertTasksToCSV(tasks);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="neural-wars-tasks.csv"');
        res.send(csvData);
        break;
        
      case 'markdown':
      case 'md':
        const markdownData = convertTasksToMarkdown(tasks);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', 'attachment; filename="neural-wars-tasks.md"');
        res.send(markdownData);
        break;
        
      default:
        res.status(400).json({
          success: false,
          error: 'Unsupported format. Use: json, csv, or markdown'
        });
    }
  } catch (error) {
    console.error('Export tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export tasks'
    });
  }
});

/**
 * GET /api/export/dashboard/:format
 * Export dashboard data in specified format
 */
router.get('/dashboard/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const dashboardData = await parser.parseDashboard();
    const metricsData = await parser.parsePerformanceMetrics();
    
    const exportData = {
      dashboard: dashboardData,
      metrics: metricsData,
      exportDate: new Date().toISOString()
    };

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="neural-wars-dashboard.json"');
        res.json(exportData);
        break;
        
      case 'csv':
        const csvData = convertDashboardToCSV(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="neural-wars-dashboard.csv"');
        res.send(csvData);
        break;
        
      default:
        res.status(400).json({
          success: false,
          error: 'Dashboard export supports: json, csv'
        });
    }
  } catch (error) {
    console.error('Export dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export dashboard'
    });
  }
});

/**
 * GET /api/export/team/:format
 * Export team data in specified format
 */
router.get('/team/:format', async (req, res) => {
  try {
    const { format } = req.params;
    
    // Get team data from team routes
    const teamResponse = await fetch('http://localhost:3000/api/team/members').catch(() => null);
    const statsResponse = await fetch('http://localhost:3000/api/team/statistics').catch(() => null);
    
    let teamData = {};
    let statsData = {};
    
    if (teamResponse && teamResponse.ok) {
      const teamResult = await teamResponse.json();
      teamData = teamResult.data || {};
    }
    
    if (statsResponse && statsResponse.ok) {
      const statsResult = await statsResponse.json();
      statsData = statsResult.data || {};
    }

    const exportData = {
      teamMembers: teamData,
      statistics: statsData,
      exportDate: new Date().toISOString()
    };

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="neural-wars-team-data.json"');
        res.json(exportData);
        break;
        
      case 'csv':
        const csvData = convertTeamDataToCSV(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="neural-wars-team-data.csv"');
        res.send(csvData);
        break;
        
      case 'markdown':
      case 'md':
        const markdownData = convertTeamDataToMarkdown(exportData);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', 'attachment; filename="neural-wars-team-data.md"');
        res.send(markdownData);
        break;
        
      default:
        res.status(400).json({
          success: false,
          error: 'Unsupported format. Use: json, csv, or markdown'
        });
    }
  } catch (error) {
    console.error('Export team data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export team data'
    });
  }
});

/**
 * POST /api/export/external/:service
 * Export to external productivity tools
 */
router.post('/external/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const { data, format } = req.body;
    
    // This would integrate with external APIs
    switch (service.toLowerCase()) {
      case 'google-workspace':
        // TODO: Implement Google Workspace export
        res.json({
          success: true,
          message: 'Google Workspace export prepared',
          instructions: 'Download the JSON file and import to Google Sheets/Docs'
        });
        break;
        
      case 'asana':
        // TODO: Implement Asana API integration
        res.json({
          success: true,
          message: 'Asana export prepared',
          instructions: 'Use CSV format to import tasks to Asana'
        });
        break;
        
      case 'slack':
        // TODO: Implement Slack integration
        res.json({
          success: true,
          message: 'Slack integration prepared',
          instructions: 'Set up Slack webhook for notifications'
        });
        break;
        
      default:
        res.status(400).json({
          success: false,
          error: 'Unsupported service. Available: google-workspace, asana, slack'
        });
    }
  } catch (error) {
    console.error('External export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export to external service'
    });
  }
});

// Helper functions for format conversion

function convertTemplatesToCSV(templates) {
  let csv = 'Type,Title,Section,Content\n';
  
  Object.keys(templates).forEach(type => {
    const template = templates[type];
    if (template.sections) {
      template.sections.forEach(section => {
        const content = section.content.replace(/"/g, '""').replace(/\n/g, ' ');
        csv += `"${type}","${template.title}","${section.title}","${content}"\n`;
      });
    } else {
      const content = template.content.replace(/"/g, '""').replace(/\n/g, ' ');
      csv += `"${type}","${template.title}","","${content}"\n`;
    }
  });
  
  return csv;
}

function convertTemplatesToMarkdown(templates) {
  let markdown = '# Neural Wars Marketing Templates Export\n\n';
  markdown += `Exported on: ${new Date().toISOString()}\n\n`;
  
  Object.keys(templates).forEach(type => {
    const template = templates[type];
    markdown += `## ${template.title}\n\n`;
    markdown += template.content + '\n\n';
    markdown += '---\n\n';
  });
  
  return markdown;
}

function convertTasksToCSV(tasks) {
  let csv = 'Person,Day,Task,Estimated Time,Completed\n';
  
  ['person1', 'person2', 'person3'].forEach(person => {
    if (tasks[person]) {
      tasks[person].forEach(task => {
        const text = task.text.replace(/"/g, '""');
        csv += `"${person}","${task.day}","${text}","${task.estimatedTime || ''}","${task.completed}"\n`;
      });
    }
  });
  
  return csv;
}

function convertTasksToMarkdown(tasks) {
  let markdown = '# Neural Wars Daily Tasks Export\n\n';
  markdown += `Exported on: ${new Date().toISOString()}\n\n`;
  
  ['person1', 'person2', 'person3'].forEach(person => {
    markdown += `## ${person.replace('person', 'Person ')}\n\n`;
    if (tasks[person]) {
      tasks[person].forEach(task => {
        const status = task.completed ? '[x]' : '[ ]';
        markdown += `- ${status} ${task.text}\n`;
      });
    }
    markdown += '\n';
  });
  
  return markdown;
}

function convertDashboardToCSV(data) {
  let csv = 'Section,Key,Value\n';
  csv += `"Export","Date","${data.exportDate}"\n`;
  
  // Add more dashboard data conversion as needed
  
  return csv;
}

function convertTeamDataToCSV(data) {
  let csv = 'Member ID,Name,Role,Email,Phone,Skills,Completion Rate,Role Effectiveness,Tasks Completed,Total Tasks\n';
  
  Object.keys(data.teamMembers).forEach(memberId => {
    const member = data.teamMembers[memberId];
    const skills = member.skills.join('; ');
    csv += `"${member.id}","${member.name}","${member.role}","${member.email}","${member.phone}","${skills}","${member.completionRate}%","${member.roleEffectiveness}%","${member.tasksCompleted}","${member.totalTasks}"\n`;
  });
  
  return csv;
}

function convertTeamDataToMarkdown(data) {
  let markdown = '# Neural Wars Team Data Export\n\n';
  markdown += `Exported on: ${data.exportDate}\n\n`;
  
  markdown += '## Team Members\n\n';
  
  Object.keys(data.teamMembers).forEach(memberId => {
    const member = data.teamMembers[memberId];
    markdown += `### ${member.name}\n\n`;
    markdown += `- **Role:** ${member.role}\n`;
    markdown += `- **Email:** ${member.email}\n`;
    markdown += `- **Phone:** ${member.phone}\n`;
    markdown += `- **Skills:** ${member.skills.join(', ')}\n`;
    markdown += `- **Task Completion Rate:** ${member.completionRate}%\n`;
    markdown += `- **Role Effectiveness:** ${member.roleEffectiveness}%\n`;
    markdown += `- **Tasks Completed:** ${member.tasksCompleted}/${member.totalTasks}\n`;
    markdown += `- **Current Assignments:** ${member.currentAssignments.join(', ')}\n\n`;
  });
  
  if (data.statistics && Object.keys(data.statistics).length > 0) {
    markdown += '## Team Statistics\n\n';
    const stats = data.statistics;
    markdown += `- **Total Members:** ${stats.totalMembers}\n`;
    markdown += `- **Average Completion Rate:** ${stats.averageCompletionRate}%\n`;
    markdown += `- **Average Role Effectiveness:** ${stats.averageRoleEffectiveness}%\n`;
    markdown += `- **Total Tasks Completed:** ${stats.totalTasksCompleted}\n`;
    markdown += `- **Active Members:** ${stats.activeMembers}\n\n`;
  }
  
  return markdown;
}

module.exports = router;