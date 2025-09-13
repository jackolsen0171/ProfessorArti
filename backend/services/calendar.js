const { runAppleScript } = require('run-applescript');

class CalendarService {
    constructor() {
        this.defaultCalendar = 'Home'; // You can make this configurable
    }

    // Get all available calendars
    async getCalendars() {
        try {
            const script = `
                tell application "Calendar"
                    get name of every calendar
                end tell
            `;
            const result = await runAppleScript(script);
            return result.split(', ').map(name => name.trim());
        } catch (error) {
            console.error('Error getting calendars:', error);
            throw new Error('Failed to retrieve calendars');
        }
    }

    // Get upcoming events from a calendar
    async getUpcomingEvents(calendarName = this.defaultCalendar, daysAhead = 30) {
        try {
            // Limit days to prevent timeout issues - max 90 days
            const limitedDays = Math.min(daysAhead, 90);
            console.log(`📅 Fetching ${limitedDays} days of events from calendar "${calendarName}"`);
            
            const script = `
                tell application "Calendar"
                    set targetCalendar to calendar "${calendarName}"
                    set startDate to current date
                    set endDate to startDate + (${limitedDays} * days)
                    
                    set eventList to {}
                    set eventCount to 0
                    repeat with anEvent in (every event of targetCalendar whose start date ≥ startDate and start date ≤ endDate)
                        set eventCount to eventCount + 1
                        -- Limit to 100 events to prevent timeout
                        if eventCount > 100 then exit repeat
                        
                        set eventInfo to (summary of anEvent) & "|" & (start date of anEvent as string) & "|" & (end date of anEvent as string) & "|" & (description of anEvent)
                        set end of eventList to eventInfo
                    end repeat
                    
                    return eventList as string
                end tell
            `;
            
            // Set a timeout for the AppleScript execution (30 seconds)
            const timeout = 30000;
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('AppleScript execution timeout')), timeout);
            });
            
            const scriptPromise = runAppleScript(script);
            const result = await Promise.race([scriptPromise, timeoutPromise]);
            
            if (!result || result.trim() === '') {
                console.log('📅 No events found in calendar');
                return [];
            }

            const events = result.split(', ').map(eventStr => {
                const [summary, startDate, endDate, description] = eventStr.split('|');
                return {
                    summary: summary?.trim() || '',
                    startDate: startDate?.trim() || '',
                    endDate: endDate?.trim() || '',
                    description: description?.trim() || ''
                };
            });
            
            console.log(`📅 Successfully retrieved ${events.length} events`);
            return events;
            
        } catch (error) {
            console.error('Error getting events:', error);
            // If it's a timeout, provide a more specific error message
            if (error.message.includes('timeout')) {
                throw new Error('Apple Calendar is taking too long to respond. Please try again or check fewer days.');
            }
            throw new Error('Failed to retrieve events from Apple Calendar');
        }
    }

    // Create a new calendar event
    async createEvent({ 
        summary, 
        description = '', 
        startDate, 
        endDate, 
        calendarName = this.defaultCalendar 
    }) {
        try {
            // Parse dates if they're strings
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // Validate dates
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new Error('Invalid date format');
            }

            // Create AppleScript date construction commands
            const createDateScript = (date, varName) => {
                const months = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
                const month = months[date.getMonth()];
                const day = date.getDate();
                const year = date.getFullYear();
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();
                
                return `set ${varName} to (current date)
        set month of ${varName} to ${month}
        set day of ${varName} to ${day}
        set year of ${varName} to ${year}
        set hours of ${varName} to ${hours}
        set minutes of ${varName} to ${minutes}
        set seconds of ${varName} to ${seconds}`;
            };

            const script = `tell application "Calendar"
    tell calendar "${calendarName}"
        ${createDateScript(start, 'startDate')}
        ${createDateScript(end, 'endDate')}
        set newEvent to make new event with properties {summary: "${summary.replace(/"/g, '\\"')}", description: "${description.replace(/"/g, '\\"')}", start date: startDate, end date: endDate}
        return id of newEvent
    end tell
end tell`;

            const eventId = await runAppleScript(script);
            return {
                success: true,
                eventId: eventId.trim(),
                message: 'Event created successfully'
            };
        } catch (error) {
            console.error('Error creating event:', error);
            throw new Error(`Failed to create event: ${error.message}`);
        }
    }

    // Delete an event by ID
    async deleteEvent(eventId, calendarName = this.defaultCalendar) {
        try {
            const script = `
                tell application "Calendar"
                    tell calendar "${calendarName}"
                        delete (first event whose id is "${eventId}")
                    end tell
                end tell
            `;

            await runAppleScript(script);
            return {
                success: true,
                message: 'Event deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting event:', error);
            throw new Error('Failed to delete event');
        }
    }

    // Update an existing event
    async updateEvent(eventId, updates, calendarName = this.defaultCalendar) {
        try {
            let setStatements = [];
            
            if (updates.summary) {
                setStatements.push(`set summary of targetEvent to "${updates.summary.replace(/"/g, '\\"')}"`);
            }
            
            if (updates.description) {
                setStatements.push(`set description of targetEvent to "${updates.description.replace(/"/g, '\\"')}"`);
            }
            
            if (updates.startDate) {
                const start = new Date(updates.startDate);
                const formatDate = (date) => {
                    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                                  'July', 'August', 'September', 'October', 'November', 'December'];
                    const month = months[date.getMonth()];
                    const day = date.getDate();
                    const year = date.getFullYear();
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    const seconds = date.getSeconds();
                    
                    return `date "${month} ${day}, ${year} at ${hours}:${minutes}:${seconds}"`;
                };
                setStatements.push(`set start date of targetEvent to ${formatDate(start)}`);
            }
            
            if (updates.endDate) {
                const end = new Date(updates.endDate);
                const formatDate = (date) => {
                    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                                  'July', 'August', 'September', 'October', 'November', 'December'];
                    const month = months[date.getMonth()];
                    const day = date.getDate();
                    const year = date.getFullYear();
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    const seconds = date.getSeconds();
                    
                    return `date "${month} ${day}, ${year} at ${hours}:${minutes}:${seconds}"`;
                };
                setStatements.push(`set end date of targetEvent to ${formatDate(end)}`);
            }

            if (setStatements.length === 0) {
                throw new Error('No valid updates provided');
            }

            const script = `
                tell application "Calendar"
                    tell calendar "${calendarName}"
                        set targetEvent to (first event whose id is "${eventId}")
                        ${setStatements.join('\n                        ')}
                    end tell
                end tell
            `;

            await runAppleScript(script);
            return {
                success: true,
                message: 'Event updated successfully'
            };
        } catch (error) {
            console.error('Error updating event:', error);
            throw new Error('Failed to update event');
        }
    }

    // Create an event from AI-extracted data
    async createEventFromAI(aiData, calendarName = this.defaultCalendar) {
        try {
            // Parse AI-provided data and create standardized event
            const {
                title,
                description = '',
                date,
                time,
                duration = 60, // default 1 hour
                location = ''
            } = aiData;

            // Parse date and time
            let startDate;
            if (date && time) {
                startDate = new Date(`${date}T${time}:00`); // Use ISO format to avoid timezone issues
            } else if (date) {
                // For dates without time, set to noon local time to avoid timezone shifts
                startDate = new Date(`${date}T12:00:00`);
            } else {
                throw new Error('Date is required');
            }

            // Calculate end date
            const endDate = new Date(startDate.getTime() + (duration * 60 * 1000));

            // Enhance description with location if provided
            let fullDescription = description;
            if (location) {
                fullDescription += location ? `\n\nLocation: ${location}` : '';
            }

            return await this.createEvent({
                summary: title,
                description: fullDescription,
                startDate: startDate,
                endDate: endDate,
                calendarName
            });
        } catch (error) {
            console.error('Error creating AI event:', error);
            throw new Error(`Failed to create event from AI data: ${error.message}`);
        }
    }
}

module.exports = CalendarService;