import React, { useState } from 'react';

interface Priority {
    id: string;
    title: string;
    progress: number;
    totalSteps: number;
}

const WeekPriorities: React.FC = () => {
    const [priorities, setPriorities] = useState<Priority[]>([
        {
            id: '1',
            title: 'Complete Machine Learning Project',
            progress: 3,
            totalSteps: 5
        },
        {
            id: '2',
            title: 'Study for Chemistry Midterm',
            progress: 1,
            totalSteps: 4
        },
        {
            id: '3',
            title: 'Finish Philosophy Essay',
            progress: 2,
            totalSteps: 3
        }
    ]);
    
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItem(id);
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };
    
    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedItem || draggedItem === targetId) return;
        
        const draggedIndex = priorities.findIndex(p => p.id === draggedItem);
        const targetIndex = priorities.findIndex(p => p.id === targetId);
        
        const newPriorities = [...priorities];
        const [removed] = newPriorities.splice(draggedIndex, 1);
        newPriorities.splice(targetIndex, 0, removed);
        
        setPriorities(newPriorities);
        setDraggedItem(null);
    };
    
    const updateProgress = (id: string, increment: boolean) => {
        setPriorities(priorities.map(priority => {
            if (priority.id === id) {
                const newProgress = increment 
                    ? Math.min(priority.progress + 1, priority.totalSteps)
                    : Math.max(priority.progress - 1, 0);
                return { ...priority, progress: newProgress };
            }
            return priority;
        }));
    };
    
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Week Priorities</h2>
            
            <div className="space-y-3">
                {priorities.map((priority, index) => (
                    <div
                        key={priority.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, priority.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, priority.id)}
                        className={`border rounded-lg p-4 cursor-move hover:shadow-md transition ${
                            draggedItem === priority.id ? 'opacity-50' : ''
                        }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-gray-400">
                                    #{index + 1}
                                </span>
                                <p className="font-medium text-gray-900">{priority.title}</p>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => updateProgress(priority.id, false)}
                                    className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                                >
                                    -
                                </button>
                                <button
                                    onClick={() => updateProgress(priority.id, true)}
                                    className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(priority.progress / priority.totalSteps) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-600">
                                {priority.progress}/{priority.totalSteps} steps
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
                Drag to reorder priorities
            </p>
        </div>
    );
};

export default WeekPriorities;