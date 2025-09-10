const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: TXT, PDF, DOC, DOCX, MD'), false);
    }
  }
});

// POST /api/documents/upload - Upload and process documents
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;
    
    // TODO: Implement document processing and ChromaDB storage
    // For now, return file info
    const documentInfo = {
      id: Date.now().toString(),
      originalName: originalname,
      filename,
      mimetype,
      size,
      uploadedAt: new Date().toISOString(),
      processed: false,
      vectorized: false
    };

    console.log(`📄 Document uploaded: ${originalname} (${size} bytes)`);

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: documentInfo
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      error: 'Failed to upload document',
      message: error.message
    });
  }
});

// GET /api/documents - List uploaded documents
router.get('/', async (req, res) => {
  try {
    // TODO: Implement database query for documents
    const mockDocuments = [
      {
        id: '1',
        originalName: 'research-paper.pdf',
        size: 2048000,
        uploadedAt: new Date().toISOString(),
        processed: true,
        vectorized: true
      }
    ];

    res.json({
      success: true,
      data: mockDocuments
    });

  } catch (error) {
    console.error('Documents list error:', error);
    res.status(500).json({
      error: 'Failed to retrieve documents',
      message: error.message
    });
  }
});

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement document deletion from database and filesystem
    console.log(`🗑️ Document deletion requested: ${id}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Document deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete document',
      message: error.message
    });
  }
});

// POST /api/documents/search - Semantic search in documents
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    // TODO: Implement ChromaDB semantic search
    const mockResults = [
      {
        id: '1',
        content: `This is a sample search result for "${query}". In a real implementation, this would come from ChromaDB vector search.`,
        similarity: 0.85,
        source: 'research-paper.pdf',
        page: 1
      }
    ];

    res.json({
      success: true,
      data: {
        query,
        results: mockResults,
        total: mockResults.length
      }
    });

  } catch (error) {
    console.error('Document search error:', error);
    res.status(500).json({
      error: 'Failed to search documents',
      message: error.message
    });
  }
});

module.exports = router;