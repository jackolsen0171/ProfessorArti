import SemesterCalendar from './SemesterCalendar';

interface CalendarSidebarProps {
    isVisible: boolean;
    onToggle: () => void;
    className?: string;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ 
    isVisible, 
    onToggle, 
    className = '' 
}) => {
    return (
        <>
            {/* Mobile toggle button - only visible on mobile */}
            <button
                onClick={onToggle}
                className={`fixed top-4 right-4 z-50 lg:hidden bg-mcgill-red text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors ${
                    isVisible ? 'bg-red-700' : ''
                }`}
                aria-label={isVisible ? 'Hide Calendar' : 'Show Calendar'}
            >
                {isVisible ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )}
            </button>

            {/* Desktop sidebar - always visible on desktop */}
            <div className={`
                ${className}
                hidden lg:block lg:w-96 xl:w-[28rem] 2xl:w-[32rem]
                border-l border-gray-200 bg-gray-50 overflow-y-auto
            `}>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-mcgill-darkblue">
                            📅 Academic Calendar
                        </h2>
                    </div>
                    
                    <SemesterCalendar 
                        height={600}
                        defaultView="month"
                        showToolbar={true}
                        className="shadow-sm"
                    />
                </div>
            </div>

            {/* Mobile overlay - slides in from right */}
            <div className={`
                fixed inset-0 z-40 lg:hidden
                ${isVisible ? 'block' : 'hidden'}
            `}>
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-black bg-opacity-50"
                    onClick={onToggle}
                />
                
                {/* Sidebar panel */}
                <div className={`
                    absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl
                    transform transition-transform duration-300 ease-in-out
                    ${isVisible ? 'translate-x-0' : 'translate-x-full'}
                    overflow-y-auto
                `}>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-mcgill-darkblue">
                                📅 Academic Calendar
                            </h2>
                            <button
                                onClick={onToggle}
                                className="p-1 text-gray-500 hover:text-gray-700"
                                aria-label="Close Calendar"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <SemesterCalendar 
                            height={500}
                            defaultView="month"
                            showToolbar={true}
                            className="shadow-sm"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default CalendarSidebar;
