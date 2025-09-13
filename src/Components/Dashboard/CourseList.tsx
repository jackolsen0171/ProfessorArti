import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Course {
    id: string;
    code: string;
    name: string;
    professor: string;
    nextDeadline?: {
        title: string;
        date: Date;
    };
    color: string;
}

const CourseList: React.FC = () => {
    const navigate = useNavigate();
    const [courses] = useState<Course[]>([
        {
            id: '1',
            code: 'COMP 551',
            name: 'Applied Machine Learning',
            professor: 'ai-tutor',
            nextDeadline: {
                title: 'Assignment 2',
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            },
            color: 'bg-blue-500'
        },
        {
            id: '2',
            code: 'CHEM 212',
            name: 'Organic Chemistry',
            professor: 'dr-science',
            nextDeadline: {
                title: 'Lab Report',
                date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            },
            color: 'bg-green-500'
        },
        {
            id: '3',
            code: 'PHIL 240',
            name: 'Introduction to Ethics',
            professor: 'prof-philosophy',
            nextDeadline: {
                title: 'Essay Draft',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            color: 'bg-purple-500'
        },
        {
            id: '4',
            code: 'HIST 203',
            name: 'World History',
            professor: 'prof-history',
            color: 'bg-yellow-500'
        },
        {
            id: '5',
            code: 'MGCR 352',
            name: 'Marketing Management',
            professor: 'prof-marketing',
            nextDeadline: {
                title: 'Case Study',
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            },
            color: 'bg-pink-500'
        }
    ]);
    
    const formatDeadline = (date: Date) => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days < 7) return `${days} days`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    const handleCourseClick = (professorId: string) => {
        navigate(`/chatbot/${professorId}`);
    };
    
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Courses</h2>
            
            <div className="space-y-3">
                {courses.map(course => (
                    <div
                        key={course.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition cursor-pointer"
                        onClick={() => handleCourseClick(course.professor)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-1 h-10 rounded ${course.color}`} />
                            
                            <div>
                                <p className="font-semibold text-gray-900">{course.code}</p>
                                <p className="text-sm text-gray-600">{course.name}</p>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            {course.nextDeadline ? (
                                <>
                                    <p className="text-sm font-medium text-gray-900">
                                        {course.nextDeadline.title}
                                    </p>
                                    <p className="text-xs text-red-600">
                                        Due: {formatDeadline(course.nextDeadline.date)}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500">No upcoming deadlines</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseList;