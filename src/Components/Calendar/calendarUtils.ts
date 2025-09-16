// Utility functions for calendar data transformation and processing

import { CalendarEvent } from './types';

/**
 * Transform Apple Calendar event data to React Big Calendar format
 */
export const transformAppleCalendarEvent = (appleEvent: any, index: number): CalendarEvent => {
    const startDate = new Date(appleEvent.startDate || appleEvent.start);
    const endDate = new Date(appleEvent.endDate || appleEvent.end);
    
    // Extract event type and course from title/description
    const eventType = detectEventType(appleEvent.summary || appleEvent.title || '');
    const course = extractCourseCode(appleEvent.summary || appleEvent.title || '');
    
    return {
        id: appleEvent.id || `event-${index}`,
        title: appleEvent.summary || appleEvent.title || 'Untitled Event',
        start: startDate,
        end: endDate,
        allDay: isAllDayEvent(startDate, endDate),
        description: appleEvent.description || '',
        type: eventType,
        course: course,
        location: appleEvent.location || ''
    };
};

/**
 * Detect event type based on title keywords
 */
export const detectEventType = (title: string): CalendarEvent['type'] => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('exam') || titleLower.includes('midterm') || titleLower.includes('final')) {
        return 'exam';
    }
    if (titleLower.includes('assignment') || titleLower.includes('homework') || titleLower.includes('due')) {
        return 'assignment';
    }
    if (titleLower.includes('office hours') || titleLower.includes('office hour')) {
        return 'office_hours';
    }
    if (titleLower.includes('lecture') || titleLower.includes('class') || titleLower.includes('seminar')) {
        return 'lecture';
    }
    
    return 'event';
};

/**
 * Extract course code from event title (e.g., "COMP 551", "CHEM 212")
 */
export const extractCourseCode = (title: string): string => {
    // Match patterns like "COMP 551", "MATH-240", "BIOL101"
    const coursePattern = /\b([A-Z]{3,4}[-\s]?\d{3})\b/i;
    const match = title.match(coursePattern);
    return match ? match[1].toUpperCase().replace('-', ' ') : '';
};

/**
 * Check if event is all-day based on start/end times
 */
export const isAllDayEvent = (start: Date, end: Date): boolean => {
    const startTime = start.getHours() * 60 + start.getMinutes();
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
    
    // Consider all-day if starts at midnight or duration is 24 hours or more
    return startTime === 0 || duration >= 24;
};

/**
 * Get event color based on type and course
 */
export const getEventColor = (event: CalendarEvent): string => {
    // Course-specific colors
    const courseColors: { [key: string]: string } = {
        'COMP': '#3B82F6', // Blue
        'CHEM': '#10B981', // Green
        'MATH': '#8B5CF6', // Purple
        'PHIL': '#F59E0B', // Orange
        'HIST': '#EF4444', // Red
        'PHYS': '#06B6D4', // Cyan
        'BIOL': '#84CC16', // Lime
        'PSYC': '#EC4899', // Pink
        'MGCR': '#6366F1', // Indigo
    };
    
    // Get course prefix (e.g., "COMP" from "COMP 551")
    const coursePrefix = event.course?.split(' ')[0] || '';
    
    if (coursePrefix && courseColors[coursePrefix]) {
        return courseColors[coursePrefix];
    }
    
    // Fallback to type-based colors
    switch (event.type) {
        case 'exam':
            return '#EF4444'; // Red
        case 'assignment':
            return '#F59E0B'; // Orange
        case 'office_hours':
            return '#10B981'; // Green
        case 'lecture':
            return '#8B5CF6'; // Purple
        default:
            return '#6B7280'; // Gray
    }
};

/**
 * Format duration for display
 */
export const formatEventDuration = (start: Date, end: Date): string => {
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        return `${diffMinutes} min`;
    } else if (diffHours < 24) {
        return `${Math.round(diffHours * 10) / 10}h`;
    } else {
        const diffDays = Math.round(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
};

/**
 * Check if event is upcoming (within next 7 days)
 */
export const isUpcomingEvent = (event: CalendarEvent, days: number = 7): boolean => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return event.start >= now && event.start <= futureDate;
};

/**
 * Group events by date for display
 */
export const groupEventsByDate = (events: CalendarEvent[]): { [key: string]: CalendarEvent[] } => {
    return events.reduce((groups, event) => {
        const dateKey = event.start.toDateString();
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(event);
        return groups;
    }, {} as { [key: string]: CalendarEvent[] });
};

/**
 * Sort events by start time
 */
export const sortEventsByTime = (events: CalendarEvent[]): CalendarEvent[] => {
    return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
};

/**
 * Filter events by type
 */
export const filterEventsByType = (events: CalendarEvent[], types: CalendarEvent['type'][]): CalendarEvent[] => {
    return events.filter(event => types.includes(event.type));
};

/**
 * Filter events by course
 */
export const filterEventsByCourse = (events: CalendarEvent[], courses: string[]): CalendarEvent[] => {
    return events.filter(event => event.course && courses.includes(event.course));
};
