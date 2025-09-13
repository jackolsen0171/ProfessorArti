import React from 'react';
import SemesterCalendar from './SemesterCalendar';

// Test component to verify calendar functionality
const CalendarTest: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-mcgill-darkblue mb-8">
                    McGill Calendar Component Test
                </h1>
                
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <SemesterCalendar 
                        height={700}
                        defaultView="month"
                        showToolbar={true}
                    />
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Test Features:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>✅ Calendar displays Winter 2025 semester (Jan 6 - Apr 29)</li>
                        <li>✅ Mock events with different types (exam, assignment, office hours)</li>
                        <li>✅ McGill branding (red toolbar buttons, dark blue headers)</li>
                        <li>✅ Month and Week view toggle</li>
                        <li>✅ Custom toolbar with Today button</li>
                        <li>✅ Event color coding by type</li>
                        <li>✅ Event type legend</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CalendarTest;