const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const router = express.Router();
const chromaService = require('../services/chromadb');
const openRouterService = require('../services/openai');

// Document processing function
async function processDocument(filePath, originalName, mimetype) {
  try {
    let content = '';
    
    // Extract text based on file type
    if (mimetype === 'text/plain' || mimetype === 'text/markdown') {
      content = await fs.readFile(filePath, 'utf-8');
    } else if (mimetype === 'application/pdf') {
      // Extract text from PDF using pdf-parse
      console.log(`📄 Extracting text from PDF: ${originalName}`);
      const pdfBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      content = pdfData.text;
      console.log(`📄 Extracted ${content.length} characters from ${originalName}`);
      
      if (!content || content.trim().length === 0) {
        content = `PDF document: ${originalName}. No readable text content found.`;
      }
    } else if (mimetype.includes('document') || mimetype.includes('word')) {
      // TODO: Add DOC/DOCX processing with mammoth or similar
      content = `Word document: ${originalName}. Word document text extraction not yet implemented.`;
    } else {
      content = `Document: ${originalName}. Content type: ${mimetype}`;
    }

    // Chunk large documents (split by paragraphs, max ~500 words per chunk)
    const chunks = chunkDocument(content, originalName);
    
    return chunks;
  } catch (error) {
    console.error('Document processing error:', error);
    throw new Error(`Failed to process document: ${error.message}`);
  }
}

// Chunk document into smaller pieces for better embedding
function chunkDocument(content, filename, maxChunkSize = 1000) {
  const chunks = [];
  
  // Split by double newlines (paragraphs) first
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      // Save current chunk and start new one
      chunks.push({
        id: `${filename}_chunk_${chunkIndex}`,
        content: currentChunk.trim(),
        metadata: {
          filename,
          chunkIndex,
          totalChunks: 0 // Will be updated later
        }
      });
      chunkIndex++;
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `${filename}_chunk_${chunkIndex}`,
      content: currentChunk.trim(),
      metadata: {
        filename,
        chunkIndex,
        totalChunks: chunks.length + 1
      }
    });
  }
  
  // Update totalChunks for all chunks
  chunks.forEach(chunk => {
    chunk.metadata.totalChunks = chunks.length;
  });
  
  return chunks;
}

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

// POST /api/documents/upload - Upload single document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;
    
    console.log(`📄 Processing document: ${originalname} (${size} bytes)`);
    
    // Process document and extract text content
    const chunks = await processDocument(filePath, originalname, mimetype);
    
    // Store each chunk in ChromaDB
    let storedChunks = 0;
    for (const chunk of chunks) {
      try {
        await chromaService.addDocument(
          chunk.id,
          chunk.content,
          {
            ...chunk.metadata,
            originalFilename: originalname,
            fileSize: size,
            uploadedAt: new Date().toISOString(),
            mimetype
          }
        );
        storedChunks++;
      } catch (chunkError) {
        console.warn(`⚠️ Failed to store chunk ${chunk.id}:`, chunkError.message);
      }
    }
    
    const documentInfo = {
      id: Date.now().toString(),
      originalName: originalname,
      filename,
      mimetype,
      size,
      uploadedAt: new Date().toISOString(),
      processed: true,
      vectorized: true,
      chunks: chunks.length,
      storedChunks: storedChunks
    };

    console.log(`✅ Document processed: ${originalname} - ${storedChunks}/${chunks.length} chunks stored`);

    res.json({
      success: true,
      message: `Document uploaded and processed successfully (${storedChunks}/${chunks.length} chunks stored)`,
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

// POST /api/documents/batch-upload - Upload multiple documents
router.post('/batch-upload', upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded'
      });
    }

    const uploadResults = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const { originalname, filename, mimetype, size, path: filePath } = file;
        
        console.log(`📄 Batch processing document: ${originalname} (${size} bytes)`);
        
        // Process document and extract text content
        const chunks = await processDocument(filePath, originalname, mimetype);
        
        // Store each chunk in ChromaDB
        let storedChunks = 0;
        for (const chunk of chunks) {
          try {
            await chromaService.addDocument(
              chunk.id,
              chunk.content,
              {
                ...chunk.metadata,
                originalFilename: originalname,
                fileSize: size,
                uploadedAt: new Date().toISOString(),
                mimetype,
                batchUpload: true
              }
            );
            storedChunks++;
          } catch (chunkError) {
            console.warn(`⚠️ Failed to store chunk ${chunk.id}:`, chunkError.message);
          }
        }

        const documentInfo = {
          id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
          originalName: originalname,
          filename,
          mimetype,
          size,
          uploadedAt: new Date().toISOString(),
          processed: true,
          vectorized: true,
          chunks: chunks.length,
          storedChunks: storedChunks
        };

        uploadResults.push(documentInfo);
        console.log(`✅ Batch document processed: ${originalname} - ${storedChunks}/${chunks.length} chunks stored`);
        
      } catch (fileError) {
        errors.push({
          filename: file.originalname,
          error: fileError.message
        });
        console.error(`❌ Batch upload error for ${file.originalname}:`, fileError);
      }
    }

    const totalFiles = req.files.length;
    const successCount = uploadResults.length;
    const errorCount = errors.length;

    console.log(`📊 Batch upload completed: ${successCount}/${totalFiles} files successful`);

    res.json({
      success: true,
      message: `Batch upload completed: ${successCount}/${totalFiles} files processed successfully`,
      data: {
        totalFiles,
        successCount,
        errorCount,
        uploadedFiles: uploadResults,
        errors: errors
      }
    });

  } catch (error) {
    console.error('Batch upload error:', error);
    res.status(500).json({
      error: 'Failed to process batch upload',
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