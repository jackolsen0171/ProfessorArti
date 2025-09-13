import React from 'react';
import McGillHeader from './McGillHeader';
import McGillFooter from './McGillFooter';
import WelcomeSection from './Dashboard/WelcomeSection';
import TaskList from './Dashboard/TaskList';
import CalendarEvents from './Dashboard/CalendarEvents';
import ProfessorList from './Dashboard/ProfessorList';

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <McGillHeader />
            
            <main className="flex-grow container mx-auto px-6 py-8 max-w-7xl">
                {/* Welcome Section */}
                <WelcomeSection />
                
                {/* Main Content Grid - 3 columns on desktop, stack on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    
                    {/* Upcoming Tasks - Left Column */}
                    <div className="lg:col-span-1">
                        <TaskList />
                    </div>
                    
                    {/* Calendar - Middle Column */}
                    <div className="lg:col-span-1">
                        <CalendarEvents />
                    </div>
                    
                    {/* Professors - Right Column */}
                    <div className="lg:col-span-1">
                        <ProfessorList />
                    </div>
                </div>
            </main>
            
            <McGillFooter />
        </div>
    );
};

export default Dashboard;