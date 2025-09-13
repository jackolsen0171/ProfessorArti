import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import './calendar.css'; // Custom McGill styling
import { CalendarEvent, CalendarProps, SemesterInfo } from './types';
import { transformAppleCalendarEvent, getEventColor, formatEventDuration } from './calendarUtils';

// Setup the localizer with moment
const localizer = momentLocalizer(moment);

// API configuration
const API_BASE_URL = 'http://localhost:8001/api';

// McGill Winter 2025 semester dates
const WINTER_2025: SemesterInfo = {
    name: 'Winter 2025',
    startDate: new Date('2025-01-06'),
    endDate: new Date('2025-04-29'),
    readingWeek: {
        start: new Date('2025-02-24'),
        end: new Date('2025-02-28')
    },
    examPeriod: {
        start: new Date('2025-04-30'),
        end: new Date('2025-05-16')
    }
};

const SemesterCalendar: React.FC<CalendarProps> = ({
    height = 600,
    defaultView = 'month',
    showToolbar = true,
    className = ''
}) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [currentView, setCurrentView] = useState<View>(defaultView);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Fetch events from Apple Calendar API
    const fetchCalendarEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Calculate semester duration in days
            const semesterDays = Math.ceil(
                (WINTER_2025.endDate.getTime() - WINTER_2025.startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 30; // Add buffer for exam period
            
            console.log('📅 Fetching calendar events for', semesterDays, 'days');
            
            const response = await axios.get(`${API_BASE_URL}/calendar/events`, {
                params: {
                    calendar: 'Home', // Default calendar
                    days: Math.min(semesterDays, 90) // Limit to 90 days to prevent timeouts
                },
                timeout: 30000 // 30 second timeout to match backend
            });

            if (response.data.success) {
                const appleEvents = response.data.events || [];
                console.log('📅 Received', appleEvents.length, 'events from Apple Calendar');
                
                // Transform Apple Calendar events to React Big Calendar format
                const transformedEvents = appleEvents.map((event: any, index: number) => 
                    transformAppleCalendarEvent(event, index)
                );
                
                // Filter events to semester date range
                const semesterEvents = transformedEvents.filter((event: CalendarEvent) => {
                    const eventDate = new Date(event.start);
                    return eventDate >= WINTER_2025.startDate && eventDate <= new Date(WINTER_2025.examPeriod?.end || WINTER_2025.endDate);
                });
                
                console.log('📅 Filtered to', semesterEvents.length, 'semester events');
                setEvents(semesterEvents);
                setLastUpdated(new Date());
                
                if (semesterEvents.length === 0) {
                    console.log('📅 No events found for Winter 2025 semester');
                }
            } else {
                throw new Error(response.data.error || 'Failed to fetch calendar events');
            }
        } catch (err: any) {
            console.error('📅 Calendar API error:', err);
            setError(`Failed to load calendar: ${err.response?.data?.message || err.message}`);
            
            // Fallback to mock data on error
            const mockEvents: CalendarEvent[] = [
                {
                    id: 'mock-1',
                    title: 'COMP 551 Assignment 2 Due',
                    start: new Date('2025-01-15T23:59:00'),
                    end: new Date('2025-01-15T23:59:00'),
                    allDay: false,
                    type: 'assignment',
                    course: 'COMP 551'
                },
                {
                    id: 'mock-2',
                    title: 'CHEM 212 Midterm Exam',
                    start: new Date('2025-02-10T09:00:00'),
                    end: new Date('2025-02-10T11:00:00'),
                    type: 'exam',
                    course: 'CHEM 212',
                    location: 'ENGTR 0100'
                }
            ];
            setEvents(mockEvents);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchCalendarEvents();
    }, []);

    // Event styling based on type and course
    const eventStyleGetter = (event: CalendarEvent) => {
        const backgroundColor = getEventColor(event);

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block',
                fontSize: '12px',
                fontWeight: '500'
            }
        };
    };

    // Custom toolbar
    const CustomToolbar = (toolbar: any) => {
        const goToBack = () => {
            toolbar.onNavigate('PREV');
        };

        const goToNext = () => {
            toolbar.onNavigate('NEXT');
        };

        const goToCurrent = () => {
            toolbar.onNavigate('TODAY');
        };

        const label = () => {
            const date = moment(toolbar.date);
            return date.format('MMMM YYYY');
        };

        return (
            <div className="flex justify-between items-center mb-4 p-2 bg-white rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={goToBack}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition"
                    >
                        ‹
                    </button>
                    <button
                        onClick={goToCurrent}
                        className="px-3 py-1 bg-mcgill-red text-white hover:bg-red-700 rounded text-sm transition"
                    >
                        Today
                    </button>
                    <button
                        onClick={goToNext}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition"
                    >
                        ›
                    </button>
                </div>
                
                <h2 className="text-lg font-semibold text-mcgill-darkblue">
                    {label()}
                </h2>
                
                <div className="flex items-center space-x-2">
                    <button
                        onClick={fetchCalendarEvents}
                        disabled={loading}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition"
                        title="Refresh calendar"
                    >
                        {loading ? '⏳' : '🔄'}
                    </button>
                    
                    <div className="flex space-x-1">
                        {['month', 'week'].map((view) => (
                            <button
                                key={view}
                                onClick={() => toolbar.onView(view)}
                                className={`px-3 py-1 rounded text-sm transition ${
                                    toolbar.view === view
                                        ? 'bg-mcgill-red text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                {view.charAt(0).toUpperCase() + view.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-mcgill-darkblue">
                        📅 {WINTER_2025.name}
                    </h3>
                    {lastUpdated && (
                        <span className="text-xs text-gray-500">
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                </div>
                
                <p className="text-sm text-gray-600">
                    {moment(WINTER_2025.startDate).format('MMM D')} - {moment(WINTER_2025.endDate).format('MMM D, YYYY')}
                </p>
                
                {error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        ⚠️ {error} (showing fallback data)
                    </div>
                )}
                
                {!error && events.length === 0 && !loading && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                        📅 No events found for Winter 2025 semester
                    </div>
                )}
            </div>
            
            {loading && (
                <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mcgill-red"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading calendar...</span>
                </div>
            )}
            
            <div style={{ height }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    view={currentView}
                    onView={(view) => setCurrentView(view)}
                    date={currentDate}
                    onNavigate={(date) => setCurrentDate(date)}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        toolbar: showToolbar ? CustomToolbar : undefined
                    }}
                    defaultDate={WINTER_2025.startDate}
                    min={new Date(2025, 0, 1, 8, 0)} // 8 AM
                    max={new Date(2025, 0, 1, 22, 0)} // 10 PM
                    formats={{
                        timeGutterFormat: 'HH:mm',
                        eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                            localizer?.format(start, 'HH:mm', culture) + ' - ' + localizer?.format(end, 'HH:mm', culture)
                    }}
                />
            </div>
            
            {/* Event legend - show both course colors and types */}
            <div className="mt-4 space-y-2">
                <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Exams</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span>Assignments</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Office Hours</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span>Lectures</span>
                    </div>
                </div>
                
                {/* Course colors legend - only show if we have events with courses */}
                {events.some(e => e.course) && (
                    <div className="flex flex-wrap gap-3 text-xs border-t pt-2">
                        <span className="text-gray-500 font-medium">Courses:</span>
                        {Array.from(new Set(events.filter(e => e.course).map(e => e.course))).slice(0, 6).map(course => {
                            const mockEvent = { course, type: 'event' as const };
                            const color = getEventColor(mockEvent);
                            return (
                                <div key={course} className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                                    <span>{course}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SemesterCalendar;