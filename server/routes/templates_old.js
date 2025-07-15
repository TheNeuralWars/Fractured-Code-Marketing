const express = require('express');
const path = require('path');
const MarkdownParser = require('../../src/parsers/MarkdownParser');

const router = express.Router();
const parser = new MarkdownParser(path.join(__dirname, '../../'));

/**
 * GET /api/templates
 * Get all available templates
 */
router.get('/', async (req, res) => {
  try {
    const templates = await parser.parseTemplates();
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load templates'
    });
  }
});

/**
 * GET /api/templates/categorized
 * Get templates organized by category
 */
router.get('/categorized', async (req, res) => {
  try {
    const categorizedTemplates = await parser.parseTemplatesEnhanced();
    res.json({
      success: true,
      data: categorizedTemplates
    });
  } catch (error) {
    console.error('Categorized templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load categorized templates'
    });
  }
});

/**
 * GET /api/templates/types
 * Get available template types
 */
router.get('/meta/types', async (req, res) => {
  try {
    const templates = await parser.parseTemplates();
    
    if (!templates) {
      return res.json({
        success: true,
        data: []
      });
    }

    const types = Object.keys(templates).map(key => ({
      type: key,
      title: templates[key].title,
      sectionsCount: templates[key].sections ? templates[key].sections.length : 0
    }));

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Template types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load template types'
    });
  }
});

/**
 * GET /api/templates/:type
 * Get templates of a specific type
 */
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const templates = await parser.parseTemplates();
    
    if (!templates || !templates[type]) {
      return res.status(404).json({
        success: false,
        error: 'Template type not found'
      });
    }

    res.json({
      success: true,
      data: templates[type]
    });
  } catch (error) {
    console.error('Template type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load template type'
    });
  }
});

/**
 * GET /api/templates/:type/sections
 * Get sections for a specific template type
 */
router.get('/:type/sections', async (req, res) => {
  try {
    const { type } = req.params;
    const templates = await parser.parseTemplates();
    
    if (!templates || !templates[type] || !templates[type].sections) {
      return res.status(404).json({
        success: false,
        error: 'Template sections not found'
      });
    }

    res.json({
      success: true,
      data: templates[type].sections
    });
  } catch (error) {
    console.error('Template sections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load template sections'
    });
  }
});

/**
 * POST /api/templates/generate
 * Generate content from a template
 */
router.post('/generate', async (req, res) => {
  try {
    const { templateType, templateSection, variables } = req.body;
    
    if (!templateType) {
      return res.status(400).json({
        success: false,
        error: 'Template type required'
      });
    }

    const templates = await parser.parseTemplates();
    
    if (!templates || !templates[templateType]) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Get the template content
    let content = templates[templateType].content;
    
    // If a specific section is requested, extract it
    if (templateSection && templates[templateType].sections) {
      const section = templates[templateType].sections.find(s => 
        s.title.toLowerCase().includes(templateSection.toLowerCase())
      );
      if (section) {
        content = section.content;
      }
    }

    // Replace variables if provided
    if (variables && typeof variables === 'object') {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        content = content.replace(regex, variables[key]);
      });
    }

    res.json({
      success: true,
      data: {
        content,
        templateType,
        templateSection,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate template content'
    });
  }
});

/**
 * GET /api/templates/categorized
 * Get templates organized by category
 */
router.get('/categorized', async (req, res) => {
  try {
    const categorizedTemplates = await parser.parseTemplatesEnhanced();
    res.json({
      success: true,
      data: categorizedTemplates
    });
  } catch (error) {
    console.error('Categorized templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load categorized templates'
    });
  }
});

/**
 * GET /api/templates/types
 * Get available template types
 */
router.get('/meta/types', async (req, res) => {
  try {
    const templates = await parser.parseTemplates();
    
    if (!templates) {
      return res.json({
        success: true,
        data: []
      });
    }

    const types = Object.keys(templates).map(key => ({
      type: key,
      title: templates[key].title,
      sectionsCount: templates[key].sections ? templates[key].sections.length : 0
    }));

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Template types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load template types'
    });
  }
});

/**
 * GET /api/templates/categorized
 * Get templates organized by category
 */
router.get('/categorized', async (req, res) => {
  try {
    const categorizedTemplates = await parser.parseTemplatesEnhanced();
    res.json({
      success: true,
      data: categorizedTemplates
    });
  } catch (error) {
    console.error('Categorized templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load categorized templates'
    });
  }
});

module.exports = router;