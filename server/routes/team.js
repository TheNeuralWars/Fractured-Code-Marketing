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

// Simple in-memory storage for team member data
// In a production app, this would be a database
let teamMemberStore = {
  person1: {
    id: 'person1',
    name: 'Content Creator',
    role: 'Content Creator & Visual Designer',
    email: 'content@neuralwars.com',
    phone: '+1-555-0101',
    skills: ['Content Creation', 'Visual Design', 'Social Media'],
    tasksCompleted: 0,
    totalTasks: 0,
    completionRate: 0,
    roleEffectiveness: 85,
    currentAssignments: ['Social media graphics', 'Website updates'],
    joinDate: new Date('2024-01-01').toISOString(),
    lastActive: new Date().toISOString()
  },
  person2: {
    id: 'person2',
    name: 'Community Manager',
    role: 'Social Engagement & Community Manager',
    email: 'community@neuralwars.com',
    phone: '+1-555-0102',
    skills: ['Community Management', 'Social Media', 'Influencer Relations'],
    tasksCompleted: 0,
    totalTasks: 0,
    completionRate: 0,
    roleEffectiveness: 92,
    currentAssignments: ['Influencer outreach', 'Community engagement'],
    joinDate: new Date('2024-01-01').toISOString(),
    lastActive: new Date().toISOString()
  },
  person3: {
    id: 'person3',
    name: 'Analytics Coordinator',
    role: 'Analytics, Advertising & Strategic Coordination',
    email: 'analytics@neuralwars.com',
    phone: '+1-555-0103',
    skills: ['Data Analysis', 'Advertising', 'Strategic Planning'],
    tasksCompleted: 0,
    totalTasks: 0,
    completionRate: 0,
    roleEffectiveness: 78,
    currentAssignments: ['Performance analysis', 'Ad optimization'],
    joinDate: new Date('2024-01-01').toISOString(),
    lastActive: new Date().toISOString()
  }
};

/**
 * GET /api/team/members
 * Get all team member data with statistics
 */
router.get('/members', async (req, res) => {
  try {
    // Get task completion statistics
    const tasksData = await parser.parseDailyTasks();
    
    // Update completion statistics for each member
    if (tasksData) {
      Object.keys(teamMemberStore).forEach(memberId => {
        if (tasksData[memberId]) {
          const tasks = tasksData[memberId];
          const completed = tasks.filter(task => task.completed).length;
          teamMemberStore[memberId].totalTasks = tasks.length;
          teamMemberStore[memberId].tasksCompleted = completed;
          teamMemberStore[memberId].completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
        }
      });
    }

    res.json({
      success: true,
      data: teamMemberStore
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load team members'
    });
  }
});

/**
 * GET /api/team/member/:memberId
 * Get specific team member data
 */
router.get('/member/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    
    if (!teamMemberStore[memberId]) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }

    res.json({
      success: true,
      data: teamMemberStore[memberId]
    });
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load team member'
    });
  }
});

/**
 * PUT /api/team/member/:memberId
 * Update team member data
 */
router.put('/member/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    const updateData = req.body;
    
    if (!teamMemberStore[memberId]) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }

    // Update member data
    teamMemberStore[memberId] = {
      ...teamMemberStore[memberId],
      ...updateData,
      lastActive: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: teamMemberStore[memberId]
    });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update team member'
    });
  }
});

/**
 * GET /api/team/statistics
 * Get team performance statistics and trends
 */
router.get('/statistics', async (req, res) => {
  try {
    const members = Object.values(teamMemberStore);
    
    // Calculate team statistics
    const statistics = {
      totalMembers: members.length,
      averageCompletionRate: Math.round(members.reduce((sum, m) => sum + m.completionRate, 0) / members.length),
      averageRoleEffectiveness: Math.round(members.reduce((sum, m) => sum + m.roleEffectiveness, 0) / members.length),
      totalTasksCompleted: members.reduce((sum, m) => sum + m.tasksCompleted, 0),
      totalTasksAssigned: members.reduce((sum, m) => sum + m.totalTasks, 0),
      activeMembers: members.filter(m => new Date(m.lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
      memberBreakdown: members.map(m => ({
        id: m.id,
        name: m.name,
        role: m.role,
        completionRate: m.completionRate,
        roleEffectiveness: m.roleEffectiveness,
        currentAssignments: m.currentAssignments.length
      })),
      trends: {
        lastWeek: {
          completionRate: Math.round(Math.random() * 20 + 70), // Mock data
          tasksCompleted: Math.round(Math.random() * 10 + 20)
        },
        lastMonth: {
          completionRate: Math.round(Math.random() * 15 + 75),
          tasksCompleted: Math.round(Math.random() * 50 + 80)
        }
      }
    };

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get team statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load team statistics'
    });
  }
});

/**
 * GET /api/team/activity-log
 * Get team activity log
 */
router.get('/activity-log', async (req, res) => {
  try {
    // In a real application, this would come from a database
    const activityLog = [
      {
        id: '1',
        memberId: 'person1',
        memberName: 'Content Creator',
        action: 'completed_task',
        description: 'Completed social media graphics for Instagram',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: 'task_completion'
      },
      {
        id: '2',
        memberId: 'person2',
        memberName: 'Community Manager',
        action: 'updated_status',
        description: 'Updated status to working on influencer outreach',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        category: 'status_update'
      },
      {
        id: '3',
        memberId: 'person3',
        memberName: 'Analytics Coordinator',
        action: 'completed_analysis',
        description: 'Completed weekly performance analysis report',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        category: 'deliverable'
      },
      {
        id: '4',
        memberId: 'person1',
        memberName: 'Content Creator',
        action: 'started_task',
        description: 'Started working on website content updates',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        category: 'task_start'
      },
      {
        id: '5',
        memberId: 'person2',
        memberName: 'Community Manager',
        action: 'meeting_logged',
        description: 'Attended team coordination meeting',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        category: 'meeting'
      }
    ];

    res.json({
      success: true,
      data: activityLog
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load activity log'
    });
  }
});

module.exports = router;