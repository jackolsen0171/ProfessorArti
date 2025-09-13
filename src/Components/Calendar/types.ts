// TypeScript interfaces for calendar components

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    description?: string;
    type?: 'assignment' | 'exam' | 'lecture' | 'office_hours' | 'event';
    course?: string;
    location?: string;
}

export interface AppleCalendarEvent {
    summary: string;
    startDate: string;
    endDate: string;
    description?: string;
    location?: string;
}

export interface CalendarProps {
    height?: number;
    defaultView?: 'month' | 'week' | 'day' | 'agenda';
    showToolbar?: boolean;
    className?: string;
}

export interface SemesterInfo {
    name: string;
    startDate: Date;
    endDate: Date;
    readingWeek?: {
        start: Date;
        end: Date;
    };
    examPeriod?: {
        start: Date;
        end: Date;
    };
}