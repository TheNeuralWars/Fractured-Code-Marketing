const express = require('express');
const path = require('path');
const MarkdownParser = require('../../src/parsers/MarkdownParser');

const router = express.Router();
const parser = new MarkdownParser(path.join(__dirname, '../../'));

/**
 * GET /api/dashboard/overview
 * Get dashboard overview data
 */
router.get('/overview', async (req, res) => {
  try {
    const dashboardData = await parser.parseDashboard();
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard overview'
    });
  }
});

/**
 * GET /api/dashboard/metrics
 * Get performance metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const metricsData = await parser.parsePerformanceMetrics();
    res.json({
      success: true,
      data: metricsData
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load performance metrics'
    });
  }
});

/**
 * GET /api/dashboard/status
 * Get current campaign status
 */
router.get('/status', async (req, res) => {
  try {
    // This would normally pull from a database, but for now we'll parse from markdown
    const dashboardData = await parser.parseDashboard();
    
    // Extract current status information
    const status = {
      currentPhase: 'Foundation Setup', // This would be dynamic
      daysUntilLaunch: 90, // This would be calculated
      campaignDay: 1,
      teamStatus: {
        person1: 'on-track',
        person2: 'on-track', 
        person3: 'on-track'
      },
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Dashboard status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load campaign status'
    });
  }
});

/**
 * POST /api/dashboard/update-metrics
 * Update performance metrics
 */
router.post('/update-metrics', async (req, res) => {
  try {
    const { metrics } = req.body;
    
    // In a real application, this would update a database
    // For now, we'll just validate and return success
    
    if (!metrics) {
      return res.status(400).json({
        success: false,
        error: 'Metrics data required'
      });
    }

    // TODO: Implement actual metrics updating logic
    // This would write back to the markdown files or a database

    res.json({
      success: true,
      message: 'Metrics updated successfully',
      data: metrics
    });
  } catch (error) {
    console.error('Update metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update metrics'
    });
  }
});

module.exports = router;