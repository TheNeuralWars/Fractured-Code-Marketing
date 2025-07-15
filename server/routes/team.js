const express = require('express');
const path = require('path');
const MarkdownParser = require('../../src/parsers/MarkdownParser');

const router = express.Router();
const parser = new MarkdownParser(path.join(__dirname, '../../'));

/**
 * GET /api/team/coordination
 * Get team coordination data
 */
router.get('/coordination', async (req, res) => {
  try {
    const teamData = await parser.parseTeamCoordination();
    res.json({
      success: true,
      data: teamData
    });
  } catch (error) {
    console.error('Team coordination error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load team coordination data'
    });
  }
});

/**
 * GET /api/team/roles
 * Get team roles and responsibilities
 */
router.get('/roles', async (req, res) => {
  try {
    const rolesData = await parser.parseFile('O-team-roles-guide.md');
    
    if (!rolesData) {
      return res.status(500).json({
        success: false,
        error: 'Failed to load team roles'
      });
    }

    // Extract role information
    const roles = {
      person1: {
        title: 'Content Creator & Visual Designer',
        responsibilities: parser.extractSection(rolesData.content, '## Person 1: Content Creator & Visual Designer', '## Person 2:'),
        dailyTasks: parser.extractSection(rolesData.content, '### Daily Tasks', '**Tuesday')
      },
      person2: {
        title: 'Social Engagement & Community Manager',
        responsibilities: parser.extractSection(rolesData.content, '## Person 2: Social Engagement & Community Manager', '## Person 3:'),
        dailyTasks: parser.extractSection(rolesData.content, '### Daily Tasks', '**Tuesday')
      },
      person3: {
        title: 'Analytics, Advertising & Strategic Coordination',
        responsibilities: parser.extractSection(rolesData.content, '## Person 3: Analytics, Advertising & Strategic Coordination', '## Team Communication'),
        dailyTasks: parser.extractSection(rolesData.content, '### Daily Tasks', '**Tuesday')
      }
    };

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Team roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load team roles'
    });
  }
});

/**
 * POST /api/team/meeting
 * Log a team meeting
 */
router.post('/meeting', async (req, res) => {
  try {
    const { type, attendees, duration, notes, actionItems } = req.body;
    
    if (!type || !attendees) {
      return res.status(400).json({
        success: false,
        error: 'Meeting type and attendees required'
      });
    }

    // In a real application, this would save to a database
    const meeting = {
      id: Date.now().toString(),
      type,
      attendees,
      duration: duration || 0,
      notes: notes || '',
      actionItems: actionItems || [],
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Meeting logged successfully',
      data: meeting
    });
  } catch (error) {
    console.error('Log meeting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log meeting'
    });
  }
});

/**
 * GET /api/team/meetings
 * Get team meeting history
 */
router.get('/meetings', async (req, res) => {
  try {
    // In a real application, this would come from a database
    // For now, return empty array with structure for future use
    const meetings = [];

    res.json({
      success: true,
      data: meetings
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load meetings'
    });
  }
});

/**
 * GET /api/team/status
 * Get current team status
 */
router.get('/status', async (req, res) => {
  try {
    // This would normally come from real-time data
    const status = {
      person1: {
        name: 'Content Creator & Visual Designer',
        status: 'on-track',
        currentTask: 'Creating social media graphics',
        lastUpdate: new Date().toISOString(),
        progress: 85
      },
      person2: {
        name: 'Social Engagement & Community Manager',
        status: 'on-track',
        currentTask: 'Influencer outreach',
        lastUpdate: new Date().toISOString(),
        progress: 92
      },
      person3: {
        name: 'Analytics, Advertising & Strategic Coordination',
        status: 'on-track',
        currentTask: 'Performance analysis',
        lastUpdate: new Date().toISOString(),
        progress: 78
      }
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Team status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load team status'
    });
  }
});

/**
 * POST /api/team/update-status
 * Update team member status
 */
router.post('/update-status', async (req, res) => {
  try {
    const { personId, status, currentTask, progress } = req.body;
    
    if (!personId) {
      return res.status(400).json({
        success: false,
        error: 'Person ID required'
      });
    }

    // In a real application, this would update a database
    const updatedStatus = {
      personId,
      status: status || 'on-track',
      currentTask: currentTask || '',
      progress: progress || 0,
      lastUpdate: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: updatedStatus
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status'
    });
  }
});

module.exports = router;