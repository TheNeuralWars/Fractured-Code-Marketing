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

module.exports = router;