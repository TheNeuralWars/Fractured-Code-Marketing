const express = require('express');
const path = require('path');
const MarkdownParser = require('../../src/parsers/MarkdownParser');

const router = express.Router();
const parser = new MarkdownParser(path.join(__dirname, '../../'));

/**
 * GET /api/files/all
 * Get all marketing files for comprehensive integration
 */
router.get('/all', async (req, res) => {
  try {
    const allFiles = await parser.parseAllMarketingFiles();
    res.json({
      success: true,
      data: allFiles
    });
  } catch (error) {
    console.error('Parse all files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load marketing files'
    });
  }
});

/**
 * GET /api/files/:fileName
 * Get specific file with enhanced parsing
 */
router.get('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const parsed = await parser.parseFile(fileName);
    
    if (!parsed) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Enhance with additional metadata
    const enhanced = {
      ...parsed,
      fileName: fileName,
      category: parser.categorizeFile(fileName),
      sections: parser.extractSections(parsed.content),
      searchableContent: parser.extractSearchableContent(parsed.content)
    };

    res.json({
      success: true,
      data: enhanced
    });
  } catch (error) {
    console.error('Parse file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load file'
    });
  }
});

/**
 * GET /api/files/category/:category
 * Get files by category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const allFiles = await parser.parseAllMarketingFiles();
    
    const categoryFiles = Object.values(allFiles).filter(file => 
      file.category === category
    );

    res.json({
      success: true,
      data: categoryFiles
    });
  } catch (error) {
    console.error('Parse category files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load category files'
    });
  }
});

/**
 * GET /api/files/search/:query
 * Search through all files
 */
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const allFiles = await parser.parseAllMarketingFiles();
    
    const searchResults = [];
    const searchTerm = query.toLowerCase();

    Object.values(allFiles).forEach(file => {
      if (file.searchableContent && file.searchableContent.includes(searchTerm)) {
        // Find matching sections
        const matchingSections = file.sections.filter(section => 
          section.title.toLowerCase().includes(searchTerm) ||
          section.content.toLowerCase().includes(searchTerm)
        );

        searchResults.push({
          fileName: file.fileName,
          title: file.fileName.replace('.md', '').replace(/-/g, ' '),
          category: file.category,
          matchingSections: matchingSections,
          relevanceScore: (file.searchableContent.match(new RegExp(searchTerm, 'g')) || []).length
        });
      }
    });

    // Sort by relevance
    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({
      success: true,
      data: searchResults,
      query: query,
      totalMatches: searchResults.length
    });
  } catch (error) {
    console.error('Search files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search files'
    });
  }
});

/**
 * GET /api/files/timeline/launch
 * Get launch timeline data
 */
router.get('/timeline/launch', async (req, res) => {
  try {
    const timeline = await parser.parseLaunchTimeline();
    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Parse timeline error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load launch timeline'
    });
  }
});

/**
 * GET /api/files/roles/team
 * Get team roles data
 */
router.get('/roles/team', async (req, res) => {
  try {
    const roles = await parser.parseTeamRoles();
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Parse team roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load team roles'
    });
  }
});

/**
 * POST /api/files/content/copy
 * Copy content to clipboard (server-side logging)
 */
router.post('/content/copy', async (req, res) => {
  try {
    const { fileName, sectionTitle, content } = req.body;
    
    // Log the copy action for analytics
    console.log(`Content copied from ${fileName}${sectionTitle ? ` - ${sectionTitle}` : ''}`);
    
    res.json({
      success: true,
      message: 'Content copy logged',
      data: {
        fileName,
        sectionTitle,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Copy content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log content copy'
    });
  }
});

module.exports = router;