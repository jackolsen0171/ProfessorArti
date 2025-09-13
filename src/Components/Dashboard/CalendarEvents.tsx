import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CalendarEvent {
    id: string;
    title: string;
    type: 'exam' | 'assignment' | 'group' | 'lecture' | 'office_hours';
    course: string;
    date: Date;
    location?: string;
    description?: string;
}

const CalendarEvents: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([
        // Mock data - will be replaced with API call
        {
            id: '1',
            title: 'Midterm Exam',
            type: 'exam',
            course: 'COMP 551',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            location: 'ENGTR 0100'
        },
        {
            id: '2',
            title: 'Assignment 3 Due',
            type: 'assignment',
            course: 'PHIL 240',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        },
        {
            id: '3',
            title: 'Group Project Meeting',
            type: 'group',
            course: 'MGCR 352',
            date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            location: 'Bronfman 045'
        },
        {
            id: '4',
            title: 'Prof. Smith Office Hours',
            type: 'office_hours',
            course: 'CHEM 212',
            date: new Date(Date.now() + 4 * 60 * 60 * 1000),
            location: 'Otto Maass 415'
        }
    ]);
    
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        // Fetch events from backend
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8001/api/calendar/events');
                if (response.data.success && response.data.events) {
                    // Convert date strings to Date objects
                    const formattedEvents = response.data.events.map((event: any) => ({
                        ...event,
                        date: new Date(event.date)
                    }));
                    setEvents(formattedEvents);
                }
            } catch (error) {
                console.error('Error fetching calendar events:', error);
                // Keep mock data on error
            } finally {
                setLoading(false);
            }
        };
        
        fetchEvents();
    }, []);
    
    const getEventIcon = (type: string) => {
        switch (type) {
            case 'exam': return '📚';
            case 'assignment': return '📝';
            case 'group': return '👥';
            case 'lecture': return '🎓';
            case 'office_hours': return '👨‍🏫';
            default: return '📅';
        }
    };
    
    const getEventColor = (type: string) => {
        switch (type) {
            case 'exam': return 'border-red-500 bg-red-50';
            case 'assignment': return 'border-blue-500 bg-blue-50';
            case 'group': return 'border-green-500 bg-green-50';
            case 'lecture': return 'border-purple-500 bg-purple-50';
            case 'office_hours': return 'border-yellow-500 bg-yellow-50';
            default: return 'border-gray-500 bg-gray-50';
        }
    };
    
    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (hours < 24 && days === 0) {
            return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        }
        if (days === 1) {
            return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        }
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };
    
    const getCountdown = (date: Date) => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 24 && hours > 0) {
            return <span className="text-red-600 font-semibold">⏰ {hours}h left</span>;
        }
        return null;
    };
    
    const addToTasks = (event: CalendarEvent) => {
        console.log('Adding to tasks:', event);
        // This would integrate with task management
    };
    
    // Group events by day
    const groupedEvents = events.reduce((groups: { [key: string]: CalendarEvent[] }, event) => {
        const dateKey = event.date.toDateString();
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(event);
        return groups;
    }, {});
    
    // Sort days
    const sortedDays = Object.keys(groupedEvents).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
    );
    
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-xl font-bold text-mcgill-darkblue mb-4">📅 This Week</h2>
            
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading events...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedDays.slice(0, 7).map(dateKey => {
                        const dayEvents = groupedEvents[dateKey];
                        const date = new Date(dateKey);
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        return (
                            <div key={dateKey}>
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                                    {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </h3>
                                
                                <div className="space-y-2">
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className={`border-l-4 rounded-lg p-4 ${getEventColor(event.type)} hover:shadow-md transition cursor-pointer`}
                                            onClick={() => addToTasks(event)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xl">{getEventIcon(event.type)}</span>
                                                        <span className="font-semibold text-gray-900">{event.title}</span>
                                                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                                                            {event.course}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="text-sm text-gray-600">
                                                        <p>{formatDate(event.date)}</p>
                                                        {event.location && (
                                                            <p className="mt-1">📍 {event.location}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right">
                                                    {getCountdown(event.date)}
                                                    <button className="block mt-2 text-xs text-blue-600 hover:text-blue-800">
                                                        + Add to tasks
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CalendarEvents;