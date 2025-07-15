const express = require('express');
const path = require('path');
const MarkdownParser = require('../../src/parsers/MarkdownParser');

const router = express.Router();
const parser = new MarkdownParser(path.join(__dirname, '../../'));

/**
 * GET /api/tasks/daily
 * Get daily tasks for all team members
 */
router.get('/daily', async (req, res) => {
  try {
    const tasksData = await parser.parseDailyTasks();
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

    // In a real application, this would update a database
    // For now, we'll just validate and return success
    
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

    // Calculate progress for each person
    const progress = {
      person1: {
        total: tasksData.person1.length,
        completed: tasksData.person1.filter(task => task.completed).length,
        percentage: Math.round((tasksData.person1.filter(task => task.completed).length / tasksData.person1.length) * 100)
      },
      person2: {
        total: tasksData.person2.length,
        completed: tasksData.person2.filter(task => task.completed).length,
        percentage: Math.round((tasksData.person2.filter(task => task.completed).length / tasksData.person2.length) * 100)
      },
      person3: {
        total: tasksData.person3.length,
        completed: tasksData.person3.filter(task => task.completed).length,
        percentage: Math.round((tasksData.person3.filter(task => task.completed).length / tasksData.person3.length) * 100)
      }
    };

    // Calculate overall progress
    const totalTasks = progress.person1.total + progress.person2.total + progress.person3.total;
    const totalCompleted = progress.person1.completed + progress.person2.completed + progress.person3.completed;
    
    progress.overall = {
      total: totalTasks,
      completed: totalCompleted,
      percentage: Math.round((totalCompleted / totalTasks) * 100)
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