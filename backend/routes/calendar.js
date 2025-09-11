const express = require('express');
const router = express.Router();
const CalendarService = require('../services/calendar');

const calendarService = new CalendarService();

// GET /api/calendar/calendars - Get all available calendars
router.get('/calendars', async (req, res) => {
  try {
    const calendars = await calendarService.getCalendars();
    res.json({
      success: true,
      calendars
    });
  } catch (error) {
    console.error('Error getting calendars:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve calendars',
      message: error.message
    });
  }
});

// GET /api/calendar/events - Get upcoming events
router.get('/events', async (req, res) => {
  try {
    const { calendar = 'Home', days = 30 } = req.query;
    const events = await calendarService.getUpcomingEvents(calendar, parseInt(days));
    
    res.json({
      success: true,
      calendar,
      events,
      count: events.length
    });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve events',
      message: error.message
    });
  }
});

// POST /api/calendar/events - Create a new calendar event
router.post('/events', async (req, res) => {
  try {
    const {
      summary,
      description = '',
      startDate,
      endDate,
      calendar = 'Home'
    } = req.body;

    // Validate required fields
    if (!summary || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'summary, startDate, and endDate are required'
      });
    }

    const result = await calendarService.createEvent({
      summary,
      description,
      startDate,
      endDate,
      calendarName: calendar
    });

    res.json(result);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event',
      message: error.message
    });
  }
});

// POST /api/calendar/events/ai - Create event from AI-extracted data
router.post('/events/ai', async (req, res) => {
  try {
    const {
      title,
      description = '',
      date,
      time,
      duration = 60,
      location = '',
      calendar = 'Home'
    } = req.body;

    // Validate required fields
    if (!title || !date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'title and date are required'
      });
    }

    const result = await calendarService.createEventFromAI({
      title,
      description,
      date,
      time,
      duration,
      location
    }, calendar);

    res.json(result);
  } catch (error) {
    console.error('Error creating AI event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event from AI data',
      message: error.message
    });
  }
});

// PUT /api/calendar/events/:eventId - Update an existing event
router.put('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { calendar = 'Home', ...updates } = req.body;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No updates provided',
        message: 'At least one field must be provided for update'
      });
    }

    const result = await calendarService.updateEvent(eventId, updates, calendar);
    res.json(result);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event',
      message: error.message
    });
  }
});

// DELETE /api/calendar/events/:eventId - Delete an event
router.delete('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { calendar = 'Home' } = req.query;

    const result = await calendarService.deleteEvent(eventId, calendar);
    res.json(result);
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event',
      message: error.message
    });
  }
});

// POST /api/calendar/extract-events - Extract calendar events from text using AI
router.post('/extract-events', async (req, res) => {
  try {
    const { text, fileNames, professorId } = req.body;

    console.log('📝 Calendar extraction request - text length:', text?.length);
    console.log('📝 File names provided:', fileNames);

    // If fileNames are provided, retrieve actual document content from ChromaDB
    let documentText = text;
    
    if (fileNames && fileNames.length > 0) {
      try {
        const chromaService = require('../services/chromadb');
        
        // Get all documents from ChromaDB that match the file names
        const allDocuments = [];
        
        for (const fileName of fileNames) {
          // Search for documents containing the filename
          const searchResults = await chromaService.searchDocuments(fileName, 20);
          if (searchResults && searchResults.length > 0) {
            allDocuments.push(...searchResults);
          }
        }
        
        if (allDocuments.length > 0) {
          // Combine all document content
          documentText = allDocuments
            .map(doc => doc.content || doc.document || '')
            .filter(content => content.length > 0)
            .join('\n\n');
          
          console.log('📚 Retrieved document content from ChromaDB, total length:', documentText.length);
          console.log('📚 First 300 chars:', documentText.substring(0, 300));
        } else {
          console.log('⚠️ No documents found in ChromaDB for files:', fileNames);
        }
      } catch (chromaError) {
        console.error('❌ Error retrieving documents from ChromaDB:', chromaError);
        // Continue with original text if ChromaDB fails
      }
    }

    if (!documentText || documentText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No content to analyze',
        message: 'No document content found for calendar extraction'
      });
    }

    // Use the existing OpenRouter service to extract calendar events
    const openRouterService = require('../services/openai');

    const extractionPrompt = `
Extract calendar events from this academic syllabus/document. Look for:
- Assignment due dates
- Exam dates  
- Project deadlines
- Office hours
- Class meetings
- Important academic dates

Return ONLY a valid JSON array with this exact structure:
{
  "title": "Assignment 1 Due" or "Midterm Exam",
  "description": "Brief description of the event",
  "date": "2025-MM-DD",
  "time": "HH:MM" or null,
  "duration": 60,
  "location": "" or specific location
}

Look for dates in formats like:
- "October 15, 2025"
- "Nov 3, 2025"
- "12/10/2025"
- "Assignment due: [date]"
- "Exam: [date] at [time]"

Rules:
- Convert all dates to YYYY-MM-DD format
- Use null for time if not specified
- Use 60 minutes duration if not specified
- Return [] if no events found
- Return ONLY the JSON array

Text to analyze:
${documentText}

JSON Response:`;

    const response = await openRouterService.generateResponse(extractionPrompt, []);
    
    console.log('🤖 AI Response for calendar extraction:', response);
    
    try {
      // Extract the message from the response object
      const aiMessage = response.message || response;
      
      // Clean up response - remove any markdown formatting or extra text
      let cleanResponse = aiMessage.trim();
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      
      // Find JSON array in response if wrapped in text
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      console.log('🧹 Cleaned response for parsing:', cleanResponse);
      
      const extractedEvents = JSON.parse(cleanResponse);
      
      // Create calendar events for each extracted event (TESTING: only first event)
      const createdEvents = [];
      const eventsToCreate = extractedEvents.slice(0, 1); // Only take first event for testing
      console.log('🧪 Testing with first event only:', eventsToCreate[0]);
      
      for (const event of eventsToCreate) {
        try {
          const result = await calendarService.createEventFromAI(event);
          createdEvents.push({
            ...event,
            calendarResult: result
          });
        } catch (eventError) {
          console.error('Error creating individual event:', eventError);
          createdEvents.push({
            ...event,
            calendarResult: {
              success: false,
              error: eventError.message
            }
          });
        }
      }

      res.json({
        success: true,
        extractedEvents: extractedEvents.length,
        createdEvents: createdEvents.filter(e => e.calendarResult.success).length,
        events: createdEvents
      });

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      res.status(500).json({
        success: false,
        error: 'Failed to parse AI response',
        message: 'AI response was not valid JSON'
      });
    }

  } catch (error) {
    console.error('Error extracting events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract events',
      message: error.message
    });
  }
});

module.exports = router;