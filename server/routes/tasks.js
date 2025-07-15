const express = require('express');
const path = require('path');
const MarkdownParser = require('../../src/parsers/MarkdownParser');

const router = express.Router();
const parser = new MarkdownParser(path.join(__dirname, '../../'));

// Simple in-memory storage for task completion status
// In a production app, this would be a database
let taskCompletionStore = {};

/**
 * GET /api/tasks/daily
 * Get daily tasks for all team members
 */
router.get('/daily', async (req, res) => {
  try {
    const tasksData = await parser.parseDailyTasks();
    
    // Apply completion status from store
    if (tasksData) {
      ['person1', 'person2', 'person3'].forEach(person => {
        if (tasksData[person]) {
          tasksData[person] = tasksData[person].map(task => ({
            ...task,
            completed: taskCompletionStore[task.id] || false,
            completedAt: taskCompletionStore[`${task.id}_completedAt`] || null
          }));
        }
      });
    }
    
    res.json({
      success: true,
      data: tasksData
    });
  } catch (error) {
    console.error('Daily tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load daily tasks'
    });
  }
});

/**
 * GET /api/tasks/person/:personId
 * Get tasks for a specific person
 */
router.get('/person/:personId', async (req, res) => {
  try {
    const { personId } = req.params;
    const tasksData = await parser.parseDailyTasks();
    
    if (!tasksData || !tasksData[personId]) {
      return res.status(404).json({
        success: false,
        error: 'Person not found'
      });
    }

    res.json({
      success: true,
      data: tasksData[personId]
    });
  } catch (error) {
    console.error('Person tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load person tasks'
    });
  }
});

/**
 * GET /api/tasks/day/:day
 * Get tasks for a specific day
 */
router.get('/day/:day', async (req, res) => {
  try {
    const { day } = req.params;
    const tasksData = await parser.parseDailyTasks();
    
    if (!tasksData) {
      return res.status(500).json({
        success: false,
        error: 'Failed to load tasks'
      });
    }

    // Filter tasks by day
    const dayTasks = {
      person1: tasksData.person1.filter(task => task.day === day.toLowerCase()),
      person2: tasksData.person2.filter(task => task.day === day.toLowerCase()),
      person3: tasksData.person3.filter(task => task.day === day.toLowerCase())
    };

    res.json({
      success: true,
      data: dayTasks
    });
  } catch (error) {
    console.error('Day tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load day tasks'
    });
  }
});

/**
 * POST /api/tasks/complete
 * Mark a task as completed
 */
router.post('/complete', async (req, res) => {
  try {
    const { taskId, personId, completed } = req.body;
    
    if (!taskId || !personId) {
      return res.status(400).json({
        success: false,
        error: 'Task ID and Person ID required'
      });
    }

    // Store completion status
    taskCompletionStore[taskId] = completed || true;
    if (completed) {
      taskCompletionStore[`${taskId}_completedAt`] = new Date().toISOString();
    } else {
      delete taskCompletionStore[`${taskId}_completedAt`];
    }
    
    res.json({
      success: true,
      message: 'Task status updated',
      data: {
        taskId,
        personId,
        completed: completed || true,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task status'
    });
  }
});

/**
 * GET /api/tasks/progress
 * Get task completion progress for all team members
 */
router.get('/progress', async (req, res) => {
  try {
    const tasksData = await parser.parseDailyTasks();
    
    if (!tasksData) {
      return res.status(500).json({
        success: false,
        error: 'Failed to load tasks'
      });
    }

    // Apply completion status from store and calculate progress
    const progress = {};
    ['person1', 'person2', 'person3'].forEach(person => {
      if (tasksData[person]) {
        const tasks = tasksData[person].map(task => ({
          ...task,
          completed: taskCompletionStore[task.id] || false
        }));
        
        const completed = tasks.filter(task => task.completed).length;
        const total = tasks.length;
        
        progress[person] = {
          total,
          completed,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      }
    });

    // Calculate overall progress
    const totalTasks = Object.values(progress).reduce((sum, p) => sum + p.total, 0);
    const totalCompleted = Object.values(progress).reduce((sum, p) => sum + p.completed, 0);
    
    progress.overall = {
      total: totalTasks,
      completed: totalCompleted,
      percentage: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0
    };

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Task progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate task progress'
    });
  }
});

module.exports = router;