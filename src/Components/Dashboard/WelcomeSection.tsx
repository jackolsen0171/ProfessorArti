import { useEffect, useState } from 'react';

const WelcomeSection: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [studyStreak] = useState(5); // Mock data
    const userName = "Student"; // This would come from auth/context
    
    // Calculate week of semester (mock calculation)
    const semesterStartDate = new Date('2025-01-06'); // Winter 2025 start
    const weekOfSemester = Math.ceil((currentDate.getTime() - semesterStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentDate(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);
    
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };
    
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-mcgill-darkblue mb-1">
                        Welcome back, {userName}! 👋
                    </h1>
                    <p className="text-gray-600 text-sm">
                        {formatDate(currentDate)} • Week {weekOfSemester} of Winter Semester
                    </p>
                </div>
                
                <div className="text-center">
                    <div className="bg-gradient-to-r from-mcgill-red to-red-600 text-white px-4 py-2 rounded-lg">
                        <p className="text-xs font-medium">Study Streak</p>
                        <p className="text-lg font-bold">🔥 {studyStreak} days</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeSection;
