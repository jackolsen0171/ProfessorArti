import { useState } from "react";
import { useParams } from "react-router-dom";
import Chatbot from "./ChatBot";
import CalendarSidebar from "./Calendar/CalendarSidebar";
import McGillHeader from "./McGillHeader";
import McGillFooter from "./McGillFooter";

const Chat = () => {
    const { professorId } = useParams<{ professorId?: string }>();
    const [calendarVisible, setCalendarVisible] = useState(false);

    const toggleCalendar = () => {
        setCalendarVisible(!calendarVisible);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <McGillHeader />
            
            <div className="flex-1 flex overflow-hidden">
                {/* Main chat area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-hidden">
                        <div className="h-full">
                            <Chatbot professor={professorId} />
                        </div>
                    </div>
                </div>
                
                {/* Calendar sidebar */}
                <CalendarSidebar 
                    isVisible={calendarVisible}
                    onToggle={toggleCalendar}
                />
            </div>
            
            <McGillFooter />
        </div>
    );
};

export default Chat;
