import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Professor {
    id: string;
    name: string;
    course: string;
    expertise: string[];
    avatar?: string;
    officeHours: boolean;
    unreadMessages?: number;
}

const ProfessorList: React.FC = () => {
    const navigate = useNavigate();
    const professors: Professor[] = [
        {
            id: 'ai-tutor',
            name: 'AI Tutor',
            course: 'COMP 551',
            expertise: ['Machine Learning', 'AI', 'Python'],
            officeHours: true,
            unreadMessages: 2
        },
        {
            id: 'dr-science',
            name: 'Dr. Science',
            course: 'CHEM 212',
            expertise: ['Chemistry', 'Lab Work', 'Research'],
            officeHours: false
        },
        {
            id: 'prof-history',
            name: 'Prof. History',
            course: 'HIST 203',
            expertise: ['World History', 'Essays', 'Research'],
            officeHours: true,
            unreadMessages: 0
        },
        {
            id: 'prof-philosophy',
            name: 'Prof. Philosophy',
            course: 'PHIL 240',
            expertise: ['Ethics', 'Logic', 'Critical Thinking'],
            officeHours: false,
            unreadMessages: 1
        }
    ];
    
    const handleChatClick = (professorId: string) => {
        navigate(`/chatbot/${professorId}`);
    };
    
    const getAvatarPlaceholder = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };
    
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-xl font-bold text-mcgill-darkblue mb-4">👨‍🏫 Your Professors</h2>
            
            <div className="space-y-3">
                {professors.map(professor => (
                    <div
                        key={professor.id}
                        className="flex items-center gap-4 p-3 border rounded-lg hover:shadow-md hover:border-mcgill-red transition cursor-pointer"
                        onClick={() => handleChatClick(professor.id)}
                    >
                        <div className="relative flex-shrink-0">
                            {professor.avatar ? (
                                <img
                                    src={professor.avatar}
                                    alt={professor.name}
                                    className="w-12 h-12 rounded-full"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mcgill-red to-red-600 flex items-center justify-center text-white font-bold text-sm">
                                    {getAvatarPlaceholder(professor.name)}
                                </div>
                            )}
                            
                            {/* Office hours indicator */}
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                professor.officeHours ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900">{professor.name}</h3>
                                {professor.unreadMessages && professor.unreadMessages > 0 && (
                                    <span className="bg-mcgill-red text-white text-xs px-2 py-1 rounded-full">
                                        {professor.unreadMessages}
                                    </span>
                                )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-1">{professor.course}</p>
                            
                            <div className="flex gap-1">
                                {professor.expertise.slice(0, 2).map((skill, index) => (
                                    <span
                                        key={index}
                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <div className="text-mcgill-red text-sm font-medium">
                                💬 Chat
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfessorList;
